import React, { useRef, useState, useEffect } from "react";
import { Pause, Volume2 } from "lucide-react";
type VoiceGender = "male" | "female";
type AssistantReplyProps = { text: string; language: "AR" | "TR" | "EN"; autoSpeak?: boolean; voiceGender?: VoiceGender; };
const speechLanguage = { AR: "ar-SA", TR: "tr-TR", EN: "en-US" };
function cleanSpeechText(text: string) {
  if (!text) return "مرحبا";
  return text.replace(/```[\s\S]*?```/g, "").replace(/[*_#`]/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/\s+/g, " ").trim().substring(0, 250);
}
export function AssistantReply({ text, language, autoSpeak = false, voiceGender = "male" }: AssistantReplyProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis?.getVoices() || [];
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    const timer = setTimeout(loadVoices, 1000);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    if (autoSpeak && text) {
      const t = setTimeout(() => speak(), 600);
      return () => clearTimeout(t);
    }
  }, [text, autoSpeak]);
  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };
  const speak = () => {
    if (typeof window === "undefined") return;
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    synthesis.cancel();
    setTimeout(() => {
      let spokenText = cleanSpeechText(text);
      if (!spokenText || spokenText.includes("أعد سؤالك")) spokenText = "مرحبا";
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = speechLanguage[language] || "ar-SA";
      utterance.rate = 1; utterance.pitch = 1; utterance.volume = 1;
      const allVoices = synthesis.getVoices();
      const arVoice = allVoices.find(v => v.lang.toLowerCase().includes("ar")) || allVoices[0];
      if (arVoice) utterance.voice = arVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      synthesis.speak(utterance);
    }, 150);
  };
  return (
    <button onClick={isSpeaking ? stopSpeaking : speak} type="button" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "12px", border: "1px solid #10b981", background: "#ecfdf5", fontSize: "12px", cursor: "pointer", color: "#065f46" }}>
      {isSpeaking ? <Pause size={14} /> : <Volume2 size={14} />}
      <small>{isSpeaking ? "إيقاف" : "استماع 🔊"}</small>
    </button>
  );
}
