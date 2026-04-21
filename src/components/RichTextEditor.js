"use client";
import { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, List, AlignLeft, Minus } from "lucide-react";

function ToolBtn({ onClick, title, children, active }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm font-medium border-none cursor-pointer transition-colors ${
        active ? "bg-primary-100 text-primary-700" : "text-surface-600 hover:bg-surface-100 bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = "Write here…", minHeight = 120 }) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  // Sync value → editor only when it changes externally
  useEffect(() => {
    if (!ref.current) return;
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    if (ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    isInternalChange.current = true;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const exec = (cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const insertHr = () => {
    exec("insertHTML", "<hr style='border:none;border-top:1px solid #e2e8f0;margin:8px 0'/>");
  };

  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden focus-within:border-primary-400 transition-colors bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-surface-100 bg-surface-50">
        <ToolBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)">
          <Bold size={13} strokeWidth={2.5}/>
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)">
          <Italic size={13}/>
        </ToolBtn>
        <div className="w-px h-4 bg-surface-200 mx-1"/>
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <List size={13}/>
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered list">
          <span className="text-[11px] font-bold">1.</span>
        </ToolBtn>
        <div className="w-px h-4 bg-surface-200 mx-1"/>
        <ToolBtn onClick={insertHr} title="Divider line">
          <Minus size={13}/>
        </ToolBtn>
        <ToolBtn onClick={() => exec("removeFormat")} title="Clear formatting">
          <AlignLeft size={13}/>
        </ToolBtn>
        <div className="flex-1"/>
        <span className="text-[10px] text-surface-400">Ctrl+B bold · Ctrl+I italic</span>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={e => {
          // Ctrl+B / Ctrl+I are native — just sync after
          if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "i")) {
            setTimeout(handleInput, 0);
          }
        }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-4 py-3 text-sm text-surface-800 outline-none leading-relaxed
          [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
          [&_li]:mb-0.5 [&_hr]:border-t [&_hr]:border-surface-200 [&_hr]:my-2
          empty:before:content-[attr(data-placeholder)] empty:before:text-surface-400 empty:before:pointer-events-none"
      />
    </div>
  );
}
