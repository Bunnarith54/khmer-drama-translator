import React, { RefObject, useRef } from 'react';
import {
  Upload,
  Film,
  Smartphone,
  CheckCircle,
  FileVideo,
  X,
  Sparkles,
} from 'lucide-react';
import { AppUiLang } from '../types';
import { UI_TEXT } from '../data/translations';

interface VideoSelectorProps {
  onSelectFile: (file: File) => void;
  onClearFile?: () => void;
  currentVideoFile: File | null;
  uiLang: AppUiLang;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  onSelectFile,
  onClearFile,
  currentVideoFile,
  uiLang,
  inputRef,
}) => {
  const t = UI_TEXT[uiLang];
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef ?? internalFileInputRef;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        alert(uiLang === 'km' ? 'សូមជ្រើសរើសឯកសារវីដេអូ។' : 'Please select a video file.');
        e.target.value = '';
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert(t.errorVideoTooLarge);
        return;
      }
      onSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onSelectFile(file);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5 shadow-xl transition-all">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentVideoFile ? (
        /* Selected Video Info State */
        <div className="bg-[#0f1422]/90 p-3 sm:p-4 rounded-xl border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {uiLang === 'km' ? 'វីដេអូរួចរាល់' : 'Video Ready'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatFileSize(currentVideoFile.size)}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-md mt-0.5 tracking-wide">
                {currentVideoFile.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold transition-all border border-white/10 hover:border-rose-500/40"
            >
              {uiLang === 'km' ? 'ប្តូរវីដេអូ' : 'Change Video'}
            </button>
            {onClearFile && (
              <button
                type="button"
                onClick={onClearFile}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-white/10"
                title={uiLang === 'km' ? 'ដកវីដេអូចេញ' : 'Remove Video'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Main Select Video Prompt */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative group border border-dashed border-white/20 hover:border-rose-500/70 rounded-xl p-5 sm:p-7 text-center bg-gradient-to-b from-[#141a29]/60 to-[#0c101c]/80 transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-950/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center text-white mb-2.5 shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform duration-300">
            <Upload className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-950/50 transition-all mb-2">
            <Smartphone className="w-4 h-4" />
            <span>{t.selectVideo}</span>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            {t.selectVideoDesc}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t.dropVideoHere}
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10">MP4</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10">MOV</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10">MKV</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-white/10">WebM</span>
          </div>
        </div>
      )}
    </div>
  );
};
