import React from "react";
import { Mic, Send } from "lucide-react";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoice: () => void;
  isListening: boolean;
  voiceSupported: boolean;
  isLoading: boolean;
  placeholder: string;
};

export function ChatComposer({ value, onChange, onSend, onVoice, isListening, voiceSupported, isLoading, placeholder }: ChatComposerProps) {
  return (
    <div className="chat-compose">
      <button type="button" className={isListening ? "listening" : ""} onClick={onVoice} aria-label="voice" disabled={!voiceSupported || isLoading} title={!voiceSupported ? "التعرف الصوتي غير متاح في هذا المتصفح" : "تحدث بالعربية"}><Mic size={17} /></button>
      <input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSend()} placeholder={isListening ? "أستمع الآن… تحدث بالعربية" : placeholder} aria-label="سؤال المساعد" />
      <button type="button" className="send-button" onClick={onSend} aria-label="إرسال" disabled={isLoading || !value.trim()}><Send size={16} /></button>
    </div>
  );
}
