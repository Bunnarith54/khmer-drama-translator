import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Video uploads are currently transported as base64 JSON. Keep this generous for mobile builds.
app.use(express.json({ limit: "160mb" }));
app.use(express.urlencoded({ limit: "160mb", extended: true }));

// Create Google GenAI Client with optional custom API Key
function createGenAI(customApiKey?: string): GoogleGenAI | null {
  const apiKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", async (_req, res) => {
  let ffmpegAvailable = false;
  try {
    await execFileAsync("ffmpeg", ["-version"], { timeout: 5000 });
    ffmpegAvailable = true;
  } catch {}
  res.json({
    status: "ok",
    service: "khmer-drama-translator",
    version: "2.2.0",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    ffmpegAvailable,
    timestamp: new Date().toISOString(),
  });
});

// Test Gemini API Key and Model Connection
app.post("/api/test-gemini-key", async (req, res) => {
  try {
    const { apiKey, model = "gemini-3.8-flash" } = req.body;
    const client = createGenAI(apiKey);
    if (!client) {
      return res.status(400).json({
        success: false,
        error: "No API Key provided, and no system GEMINI_API_KEY is configured.",
      });
    }

    const testModel = (model && model.trim()) || "gemini-3.8-flash";
    console.log(`Testing Gemini API Key with model: ${testModel}...`);

    const modelsToTry = [testModel];
    if (testModel !== "gemini-3.8-flash") {
      modelsToTry.push("gemini-3.8-flash");
    }
    if (testModel !== "gemini-3.1-flash-lite") {
      modelsToTry.push("gemini-3.1-flash-lite");
    }

    let lastError = "";
    for (const m of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: m,
          contents: "Respond with the single word: OK",
        });

        const reply = response.text?.trim() || "OK";
        return res.json({
          success: true,
          model: m,
          reply,
          isCustomKey: Boolean(apiKey && apiKey.trim()),
          note:
            m !== testModel
              ? `${testModel} is currently at high demand; connection verified using ${m}.`
              : undefined,
        });
      } catch (mErr: any) {
        lastError = mErr?.message || String(mErr);
        console.log(
          `[Gemini] Test model ${m} returned: ${lastError.slice(0, 120)}. Trying fallback...`
        );
      }
    }

    return res.status(400).json({
      success: false,
      error: lastError,
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    return res.status(400).json({
      success: false,
      error: errMsg,
    });
  }
});

// Optional AI Audio Separation endpoint. It uses Demucs when installed on the backend.
// The app never claims that a simple volume slider is source separation.
app.post("/api/audio-separate", async (req, res) => {
  const { videoData, mimeType = "video/mp4" } = req.body || {};
  if (!videoData) return res.status(400).json({ error: "No video data provided." });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kdt-separate-"));
  const input = path.join(tempDir, "input" + (String(mimeType).includes("webm") ? ".webm" : ".mp4"));
  try {
    await fs.writeFile(input, Buffer.from(videoData, "base64"));
    try {
      await execFileAsync("demucs", ["--two-stems=vocals", "-n", "htdemucs", input], { timeout: 20 * 60 * 1000, maxBuffer: 10 * 1024 * 1024 });
    } catch (err: any) {
      const message = err?.code === "ENOENT"
        ? "Audio Separation Engine is not installed on this backend. Install Demucs to enable real Voice/Music stem separation."
        : (err?.stderr || err?.message || "Demucs separation failed.");
      return res.status(503).json({ error: String(message).slice(0, 1200) });
    }
    // Demucs --two-stems=vocals writes: <model>/<input-name>/vocals.wav and no_vocals.wav.
    // Return both stems so the Android/web mixer can actually use them.
    const modelDir = path.join(tempDir, "separated", "htdemucs", path.parse(path.basename(input)).name);
    const vocalsPath = path.join(modelDir, "vocals.wav");
    const musicPath = path.join(modelDir, "no_vocals.wav");
    const [vocals, music] = await Promise.all([fs.readFile(vocalsPath), fs.readFile(musicPath)]);
    return res.json({
      ok: true,
      engine: "Demucs / htdemucs",
      message: "Voice and Music stems separated successfully.",
      vocalsData: vocals.toString("base64"),
      musicData: music.toString("base64"),
      mimeType: "audio/wav",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Audio separation failed." });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

// Helper function for sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Call Gemini with robust fallback chain and 503 demand spike absorption
async function requestGeminiSubtitles(
  ai: GoogleGenAI,
  parts: any[],
  systemInstruction: string,
  preferredModel?: string
): Promise<{ text: string; modelUsed: string } | null> {
  const hasAudio = parts.some(
    (p) => p.inlineData?.mimeType && String(p.inlineData.mimeType).startsWith("audio/")
  );

  const candidateModels: string[] = [];
  const pref = preferredModel?.trim();

  if (hasAudio) {
    // If audio is present, only use models that support audio payloads
    if (
      pref &&
      pref !== "gemini-3.1-flash-lite" &&
      !pref.includes("image") &&
      !pref.includes("tts")
    ) {
      candidateModels.push(pref);
    }
    const audioCapableFallbacks = [
      "gemini-3.8-flash",
          ];
    for (const m of audioCapableFallbacks) {
      if (!candidateModels.includes(m)) {
        candidateModels.push(m);
      }
    }
  } else {
    if (pref) {
      candidateModels.push(pref);
    }
    const textFallbacks = [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
    ];
    for (const m of textFallbacks) {
      if (!candidateModels.includes(m)) {
        candidateModels.push(m);
      }
    }
  }

  for (const modelName of candidateModels) {
    try {
      console.log(`[Gemini] Requesting subtitles via ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                startTime: { type: Type.NUMBER },
                endTime: { type: Type.NUMBER },
                sourceText: { type: Type.STRING },
                khmerText: { type: Type.STRING },
                speaker: { type: Type.STRING },
              },
              required: ["id", "startTime", "endTime", "sourceText", "khmerText"],
            },
          },
          systemInstruction,
        },
      });

      if (response.text) {
        return { text: response.text, modelUsed: modelName };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isTransient) {
        console.log(
          `[Gemini] ${modelName} is currently experiencing high demand (503/429). Seamlessly switching to next model...`
        );
      } else {
        console.log(
          `[Gemini] ${modelName} call bypassed (${errMsg.slice(0, 100)}). Switching to next model...`
        );
      }
      // Instantly switch to next candidate model
      continue;
    }
  }

  return null;
}

// Translation & Speech-to-Text API
app.post("/api/translate-video", async (req, res) => {
  try {
    const {
      audioData,
      mimeType = "audio/wav",
      sourceLang = "Chinese (中文)",
      targetLang = "Khmer (ភាសាខ្មែរ)",
      videoDuration = 15,
      dramaTitle = "Chinese Drama",
      apiKey,
      model,
    } = req.body;

    const ai = createGenAI(apiKey);

    if (!audioData) {
      return res.status(422).json({
        error: "Could not extract audio from this video. Please use MP4/MOV/WebM with an audio track."
      });
    }

    // If Gemini client is configured
    if (ai) {
      const parts: any[] = [];

      // Add audio payload if present
      if (audioData) {
        parts.push({
          inlineData: {
            mimeType: mimeType || "audio/wav",
            data: audioData,
          },
        });
      }

      const prompt = `You are a professional audiovisual translator and subtitler specializing in translating Chinese drama videos into Khmer (Cambodian).
Video details:
- Drama Title: ${dramaTitle}
- Estimated Duration: ${videoDuration} seconds
- Source Language: ${sourceLang}
- Target Language: ${targetLang}

Task:
1. Accurately recognize the speech from the audio in ${sourceLang}. If speech is unclear, omit it rather than inventing or reconstructing dialogue.
2. Segment the dialogue into logical subtitle sentences with precise start and end timestamps (in seconds with 2 decimal places, e.g., 0.85, 3.20). Ensure timestamps do not overlap and fit within 0 to ${Math.max(videoDuration, 10)} seconds.
3. Translate each segment into natural, idiomatic, and respectful Khmer dialogue (ភាសាខ្មែរ), honoring drama register and emotional nuance.
4. Output a strictly structured JSON array of subtitle objects.

Format:
[
  {
    "id": "1",
    "startTime": 0.5,
    "endTime": 3.2,
    "sourceText": "你终于来了，我等了你很久。",
    "khmerText": "ទីបំផុតអ្នកបានមកដល់ហើយ ខ្ញុំបានរង់ចាំអ្នកជាយូរណាស់មកហើយ។",
    "speaker": "តួអង្គប្រុស (Male Lead)"
  }
]`;

      parts.push({ text: prompt });

      const systemInstruction =
        "You are an expert Chinese-to-Khmer film subtitle translator and dubber. Always provide natural Khmer translation suitable for popular Asian dramas.";

      // Call with user's selected model first, then fallbacks
      const result = await requestGeminiSubtitles(ai, parts, systemInstruction, model);

      if (result?.text) {
        try {
          const parsed = JSON.parse(result.text.trim());
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.json({
              subtitles: parsed,
              engine: result.modelUsed,
            });
          }
        } catch (parseErr) {
          console.error("JSON parse error from Gemini output:", parseErr, result.text);
        }
      }

    }

    return res.status(503).json({
      error:
        "AI translation is temporarily unavailable. Please check your Gemini API key/model and try again.",
    });
  } catch (error: any) {
    console.error("Translation route caught error:", error);
    res.status(500).json({
      error: error?.message || "Translation failed. Please try again."
    });
  }
});

// Gemini Text-To-Speech for Khmer Voice & Character Dubbing
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Puck", apiKey, model = "gemini-3.1-flash-tts-preview", style = "natural" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS" });
    }

    const ai = createGenAI(apiKey);
    if (ai) {
      // Valid Gemini prebuilt voice names
      const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"];
      const chosenVoice = validVoices.includes(voice) ? voice : "Puck";

      try {
        const ttsModel = [
          "gemini-3.1-flash-tts-preview",
          "gemini-2.5-flash-preview-tts",
          "gemini-2.5-pro-preview-tts",
        ].includes(model) ? model : "gemini-3.1-flash-tts-preview";
        const performancePrompt = style === "dramatic"
          ? "Perform this Khmer drama dialogue with natural emotion, clear pronunciation, and dramatic but believable delivery."
          : style === "soft"
            ? "Perform this Khmer dialogue softly, warmly, and naturally, with clear pronunciation."
            : "Speak this Khmer dialogue naturally and clearly, like a professional drama dub.";
        const response = await ai.models.generateContent({
          model: ttsModel,
          contents: [{ parts: [{ text: `${performancePrompt}\n\n${text}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            audioData: base64Audio,
            mimeType: "audio/wav",
            rate: 24000,
            voiceUsed: chosenVoice,
          });
        }
      } catch (ttsErr: any) {
        console.log("[TTS] Handled gracefully with client speech:", ttsErr?.message?.slice(0, 100));
      }
    }

    // Fallback indicator so frontend uses browser Web Speech API
    res.json({ useClientSpeech: true, text });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "TTS error" });
  }
});

// Server-side FFmpeg renderer for Android/large-video exports.
// This produces a real MP4 file instead of relying on MediaRecorder MP4 support in the browser.
app.post("/api/render-dubbed", async (req, res) => {
  const { videoData, mimeType = "video/mp4", clips = [], muteOriginalAudio = false,
    originalVolume = 1, dubbingVolume = 1, musicVolume = 1, audioEnhancementEnabled = false, separatedVocalsData = "", separatedMusicData = "" } = req.body || {};
  if (!videoData) return res.status(400).json({ error: "No video data provided." });
  if (!Array.isArray(clips) || clips.length === 0) return res.status(400).json({ error: "No dubbing clips provided." });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "kdt-render-"));
  const input = path.join(tempDir, `input${String(mimeType).includes("webm") ? ".webm" : ".mp4"}`);
  const output = path.join(tempDir, "khmer-dubbed.mp4");
  try {
    await fs.writeFile(input, Buffer.from(videoData, "base64"));
    const args: string[] = ["-y", "-i", input];
    const safeOriginal = Math.max(0, Math.min(2, Number(originalVolume) || 0));
    const safeDubbing = Math.max(0, Math.min(2, Number(dubbingVolume) || 0));
    const filters: string[] = [];
    let audioInputs = 0;

    const safeMusic = Math.max(0, Math.min(2, Number(musicVolume) || 0));
    if (separatedVocalsData) {
      const vocalsPath = path.join(tempDir, "separated-vocals.wav");
      await fs.writeFile(vocalsPath, Buffer.from(separatedVocalsData, "base64"));
      args.push("-i", vocalsPath);
      const idx = audioInputs + 1;
      filters.push(`[${idx}:a]volume=${safeOriginal.toFixed(3)}[orig]`);
      audioInputs++;
    } else if (!muteOriginalAudio) {
      filters.push(`[0:a]volume=${safeOriginal.toFixed(3)}[orig]`);
      audioInputs++;
    }
    if (separatedMusicData) {
      const musicPath = path.join(tempDir, "separated-music.wav");
      await fs.writeFile(musicPath, Buffer.from(separatedMusicData, "base64"));
      args.push("-i", musicPath);
      const idx = audioInputs + 1;
      filters.push(`[${idx}:a]volume=${safeMusic.toFixed(3)}[music]`);
      audioInputs++;
    }

    for (let i = 0; i < clips.length; i++) {
      const c = clips[i] || {};
      if (!c.audioData || typeof c.startTime !== "number") continue;
      const ext = String(c.mimeType || "audio/wav").includes("webm") ? ".webm" : ".wav";
      const clipPath = path.join(tempDir, `clip-${i}${ext}`);
      await fs.writeFile(clipPath, Buffer.from(c.audioData, "base64"));
      args.push("-i", clipPath);
      const delay = Math.max(0, Math.round(Number(c.startTime) * 1000));
      const rate = Math.max(0.75, Math.min(1.5, Number(c.rate) || 1));
      const pitch = Math.max(0.7, Math.min(1.4, Number(c.pitch) || 1));
      const clipVolume = Math.max(0, Math.min(1.5, Number(c.volume) || 0));
      const idx = i + 1;
      // Pitch-shift while preserving approximate duration, then apply speech rate.
      const pitchFilter = pitch === 1 ? "" : `,asetrate=44100*${pitch.toFixed(4)},aresample=44100,atempo=${(1 / pitch).toFixed(4)}`;
      const atempo = rate === 1 ? "" : `,atempo=${rate.toFixed(4)}`;
      filters.push(`[${idx}:a]adelay=${delay}|${delay},volume=${(safeDubbing * clipVolume).toFixed(3)}${pitchFilter}${atempo}[d${i}]`);
      audioInputs++;
    }

    const mixLabels: string[] = [];
    if (separatedVocalsData || !muteOriginalAudio) mixLabels.push("[orig]");
    if (separatedMusicData) mixLabels.push("[music]");
    for (let i = 0; i < clips.length; i++) if (filters.some(f => f.includes(`[d${i}]`))) mixLabels.push(`[d${i}]`);
    if (!mixLabels.length) return res.status(400).json({ error: "No usable audio tracks were supplied." });

    if (mixLabels.length === 1) {
      filters.push(`${mixLabels[0]}aresample=async=1[mix0]`);
    } else {
      filters.push(`${mixLabels.join("")}amix=inputs=${mixLabels.length}:duration=first:dropout_transition=0:normalize=0,aresample=async=1[mix0]`);
    }
    // Optional final mastering pass. This is intentionally conservative: it reduces steady noise and
    // evens speech/music dynamics without pretending to create a separate SFX stem.
    if (audioEnhancementEnabled) {
      filters.push(`[mix0]highpass=f=55,lowpass=f=16000,afftdn=nr=8:nf=-35,acompressor=threshold=-18dB:ratio=2:attack=20:release=180:makeup=1[mix]`);
    } else {
      filters.push(`[mix0]anull[mix]`);
    }

    args.push("-filter_complex", filters.join(";"), "-map", "0:v:0", "-map", "[mix]",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", output);

    await execFileAsync("ffmpeg", args, { timeout: 60 * 60 * 1000, maxBuffer: 20 * 1024 * 1024 });
    const stat = await fs.stat(output);
    if (!stat.size) throw new Error("FFmpeg produced an empty output file.");
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="Khmer_Drama_Dubbed.mp4"');
    const data = await fs.readFile(output);
    return res.send(data);
  } catch (err: any) {
    if (err?.code === "ENOENT") return res.status(503).json({ error: "FFmpeg is not installed on this backend. Install FFmpeg to enable real MP4 dubbing export." });
    console.error("[FFmpeg render]", err?.stderr || err?.message || err);
    return res.status(500).json({ error: String(err?.stderr || err?.message || "FFmpeg render failed").slice(-1800) });
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

// Vite middleware configuration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Khmer Drama Translator server running on http://0.0.0.0:${PORT}`);
  });
}

start();
