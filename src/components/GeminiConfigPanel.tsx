import { apiUrl } from '../utils/api';
import React, { useState, useEffect } from 'react';
import {
  Key,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Clipboard,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';
import {
  GEMINI_MODEL_GROUPS,
  ALL_GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  GeminiModelInfo,
} from '../data/geminiModels';

interface GeminiConfigPanelProps {
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  selectedModel: string;
  onChangeSelectedModel: (model: string) => void;
  uiLang: AppUiLang;
}

export const GeminiConfigPanel: React.FC<GeminiConfigPanelProps> = ({
  apiKey,
  onChangeApiKey,
  selectedModel,
  onChangeSelectedModel,
  uiLang,
}) => {
  const t = UI_TEXT[uiLang];
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [isCustomModelMode, setIsCustomModelMode] = useState<boolean>(false);

  // Test connection state
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testFeedback, setTestFeedback] = useState<string>('');

  // Sync inputKey with apiKey prop
  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  // Determine if currently using a custom model name
  useEffect(() => {
    const isPredefined = ALL_GEMINI_MODELS.some((m) => m.id === selectedModel);
    if (!isPredefined && selectedModel) {
      setIsCustomModelMode(true);
      setCustomModelInput(selectedModel);
    } else {
      setIsCustomModelMode(false);
    }
  }, [selectedModel]);

  // Handle Save API Key
  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    onChangeApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('user_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
    } catch {
      // Ignore storage errors
    }
    setTestStatus('success');
    setTestFeedback(trimmed ? t.keySaved : t.keyCleared);
    setTimeout(() => {
      setTestStatus('idle');
      setTestFeedback('');
    }, 3000);
  };

  // Handle Clear API Key
  const handleClearKey = () => {
    setInputKey('');
    onChangeApiKey('');
    try {
      localStorage.removeItem('user_gemini_api_key');
    } catch {
      // Ignore storage errors
    }
    setTestStatus('idle');
    setTestFeedback('');
  };

  // Handle Paste from Clipboard
  const handlePasteKey = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputKey(text.trim());
        }
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable:', err);
    }
  };

  // Handle Model Selection
  const handleSelectModelChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomModelMode(true);
      if (customModelInput.trim()) {
        onChangeSelectedModel(customModelInput.trim());
      }
    } else {
      setIsCustomModelMode(false);
      onChangeSelectedModel(value);
      try {
        localStorage.setItem('user_gemini_model', value);
      } catch {
        // Ignore storage errors
      }
    }
  };

  const handleCustomModelInputChange = (value: string) => {
    setCustomModelInput(value);
    const trimmed = value.trim();
    if (trimmed) {
      onChangeSelectedModel(trimmed);
      try {
        localStorage.setItem('user_gemini_model', trimmed);
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setTestFeedback('');

    const modelToTest = selectedModel.trim() || DEFAULT_GEMINI_MODEL;

    try {
      const response = await fetch(apiUrl('/api/test-gemini-key'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputKey.trim() || apiKey,
          model: modelToTest,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTestStatus('success');
        setTestFeedback(
          `${t.keyValid} (${data.model} - "${data.reply}")`
        );
      } else {
        setTestStatus('error');
        setTestFeedback(`${t.keyInvalid}${data.error || 'Connection error'}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestFeedback(`${t.keyInvalid}${err?.message || 'Network error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Current active model details
  const currentModelInfo: GeminiModelInfo | undefined = ALL_GEMINI_MODELS.find(
    (m) => m.id === selectedModel
  );

  return (
    <div
      id="gemini-config-panel"
      className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl transition-all"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                {t.apiKeySettings}
              </h3>
              {/* Active Model Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>{selectedModel || DEFAULT_GEMINI_MODEL}</span>
              </span>
              {/* Key source pill */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  apiKey
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-white/10'
                }`}
              >
                {apiKey ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{t.usingCustomKey}</span>
                  </>
                ) : (
                  <span>{t.usingSystemKey}</span>
                )}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
              {t.apiKeyHelp}
            </p>
          </div>
        </div>

        {/* Expand/Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-white/10 transition-colors flex-shrink-0"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4">
          {/* BOX 1: API KEY INPUT BOX (ប្រអប់ដាក់ API Key ដោយដៃផ្ទាល់) */}
          <div className="bg-[#0e1424] rounded-2xl p-3.5 sm:p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label
                htmlFor="gemini-api-key-input"
                className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>{t.apiKeyTitle}</span>
              </label>

              {/* Get Free API Key link */}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors underline underline-offset-2"
              >
                <span>{t.getFreeKey}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Input with Peek & Paste Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="gemini-api-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={t.apiKeyPlaceholder}
                  className="w-full bg-[#080c16] border border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono tracking-wider transition-all pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Peek password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {/* Paste button */}
                  <button
                    type="button"
                    onClick={handlePasteKey}
                    className="p-1.5 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.saveKey}</span>
                </button>

                {inputKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.clearKey}</span>
                  </button>
                )}
              </div>

              {/* Test Connection Button */}
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>{t.testingKey}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.testConnection}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Feedback Banner */}
            {testStatus === 'success' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span className="truncate">{testFeedback}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <span className="break-words leading-relaxed">{testFeedback}</span>
              </div>
            )}
          </div>

          {/* BOX 2: GEMINI MODEL SELECTOR (ប្រអប់រើស GEMINI ដោយដៃផ្ទាល់គ្រប់ជំនាន់) */}
          <div className="bg-[#0e1424] rounded-2xl p-3.5 sm:p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label
                htmlFor="gemini-model-select"
                className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{t.geminiModel}</span>
              </label>

              <span className="text-[11px] text-slate-400 font-mono">
                Active: <span className="text-cyan-300 font-bold">{selectedModel}</span>
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'gemini-3.8-flash', label: '3.8 Flash' },
                { id: 'gemini-3.7-flash', label: '3.7 Flash' },
                { id: 'gemini-3.5-flash-lite', label: '3.5 Lite (សន្សំ)' },
                { id: 'gemini-3.1-pro-preview', label: '3.1 Pro (ឆ្លាតវៃ)' },
                { id: 'gemini-2.5-pro', label: '2.5 Pro' },
                { id: 'gemini-2.5-flash', label: '2.5 Flash' },
                { id: 'gemini-3.1-flash-lite', label: '3.1 Lite (ល្បឿន)' },
              ].map((chip) => {
                const isActive = selectedModel === chip.id && !isCustomModelMode;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleSelectModelChange(chip.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                        : 'bg-[#080c16] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/15'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleSelectModelChange('custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  isCustomModelMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-[#080c16] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                + ម៉ូដែលផ្សេងទៀត (Custom)
              </button>
            </div>

            {/* Grouped Select Dropdown (All Generations) */}
            <div>
              <select
                id="gemini-model-select"
                value={isCustomModelMode ? 'custom' : selectedModel}
                onChange={(e) => handleSelectModelChange(e.target.value)}
                className="w-full bg-[#080c16] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-medium transition-all cursor-pointer"
              >
                {GEMINI_MODEL_GROUPS.map((group) => (
                  <optgroup
                    key={group.generation}
                    label={uiLang === 'km' ? group.titleKm : group.titleEn}
                    className="bg-slate-950 font-bold text-slate-300"
                  >
                    {group.models.map((model) => (
                      <option
                        key={model.id}
                        value={model.id}
                        className="bg-slate-900 text-slate-100 font-sans py-1"
                      >
                        {model.name} — [{model.badge}]
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Custom / Experimental" className="bg-slate-950 font-bold text-slate-300">
                  <option value="custom" className="bg-slate-900 text-cyan-300 font-sans">
                    ✍️ {t.customModel}
                  </option>
                </optgroup>
              </select>
            </div>

            {/* If Custom Model Mode is active: text input */}
            {isCustomModelMode && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-medium text-cyan-300 mb-1">
                  {t.customModel}
                </label>
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => handleCustomModelInputChange(e.target.value)}
                  placeholder={t.customModelPlaceholder}
                  className="w-full bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 font-mono placeholder:text-slate-500"
                />
              </div>
            )}

            {/* Model Description Card */}
            {currentModelInfo && !isCustomModelMode && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2.5 text-slate-300">
                <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{currentModelInfo.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300">
                      {currentModelInfo.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {uiLang === 'km'
                      ? currentModelInfo.descriptionKm
                      : currentModelInfo.descriptionEn}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
