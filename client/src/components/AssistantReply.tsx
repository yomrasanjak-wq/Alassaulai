import React, { useRef, useState, useEffect } from "react";
import { Pause, Volume2 } from "lucide-react";

type VoiceGender = "male" | "female";
type AssistantReplyProps = {
  text: string;
  language: "AR" | "TR" | "EN";
  autoSpeak?: boolean;
  voiceGender?: VoiceGender;
};

const speechLanguage = { AR: "ar-SA", TR: "tr-TR", EN: "en-US" };

function cleanSpeechText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_#`]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!؟?]/)[0] // ناخذ أول جملة بس عشان ما يقطع
    .substring(0, 180);
}

export function AssistantReply({ text, language, autoSpeak = false, voiceGender = "male" }: AssistantReplyProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // حمّل الأصوات مرة وحدة بس في الخلفية، مو كل مرة
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const speak = () => {
    if (typeof window === "undefined") return;
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    
    synthesis.cancel();
    setTimeout(() => {
      const spokenText = cleanSpeechText(text);
      if (!spokenText) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = speechLanguage[language];
      utterance.rate = 1; // 1 مو 0.9 عشان سامسونج ما يقطع
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // اختيار صوت خفيف وسريع بدون حسابات ثقيلة
      const arVoice = voices.find(v => v.lang.toLowerCase().includes("ar")) || voices[0];
      if (arVoice) utterance.voice = arVoice;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      utteranceRef.current = utterance;
      synthesis.speak(utterance);
    }, 100); // مهلة 100 ملي ثانية عشان الشاشة ما تعلق
  };

  return (
    <button
      onClick={isSpeaking ? stopSpeaking : speak}
      type="button"
      style={{ 
        display: "flex", alignItems: "center", gap: "4px",
        padding: "4px 8px", borderRadius: "12px",
        border: "1px solid #e5e7eb", background: "#fff",
        fontSize: "12px", cursor: "pointer"
      }}
    >
      {isSpeaking ? <Pause size={13} /> : <Volume2 size={13} />}
      <small>{isSpeaking ? "إيقاف" : "استماع"}</small>
    </button>
  );
}
