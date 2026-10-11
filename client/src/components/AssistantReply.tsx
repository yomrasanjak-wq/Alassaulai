import React, { useRef, useState } from "react";
import { Pause, Volume2 } from "lucide-react";

type VoiceGender = "male" | "female";

type AssistantReplyProps = {
  text: string;
  language: "AR" | "TR" | "EN";
  autoSpeak?: boolean;
  voiceGender?: VoiceGender;
};

const speechLanguage: Record<AssistantReplyProps["language"], string> = {
  AR: "ar-SA",
  TR: "tr-TR",
  EN: "en-US",
};

const femaleVoiceHints = ["female", "woman", "girl", "saba", "laila", "zira", "hoda", "heba", "layla", "فاطمة", "ليلى", "هدى", "أنثى", "امرأة"];
const maleVoiceHints = ["male", "man", "boy", "adam", "khalid", "khaled", "خالد", "آدم", "maged", "tarik", "naayf", "hamed", "hamad", "fahd", "omar", "yousef", "hisham", "abdul", "ذكر", "رجل"];

function isMaleVoiceName(name: string) {
  const normalized = name.toLowerCase();
  if (["female", "woman", "girl", "saba", "laila", "zira", "hoda", "فاطمة", "ليلى", "أنثى", "امرأة"].some((hint) => normalized.includes(hint))) return false;
  return maleVoiceHints.some((hint) => normalized.includes(hint));
}

function chooseVoice(language: string, gender: VoiceGender, voices: SpeechSynthesisVoice[]) {
  const normalizedLanguage = language.toLowerCase();
  const localized = voices.filter(voice => voice.lang.toLowerCase() === normalizedLanguage);
  const sameLanguage = voices.filter(voice => voice.lang.toLowerCase().startsWith(normalizedLanguage.slice(0, 2)));
  const candidates = localized.length > 0 ? localized : sameLanguage.length > 0 ? sameLanguage : language.toLowerCase().startsWith("ar") ? voices.filter((voice) => voice.lang.toLowerCase().startsWith("ar")) : voices;
  if (!candidates.length) return undefined;
  const hints = gender === "female" ? femaleVoiceHints : maleVoiceHints;
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    const isFemale = femaleVoiceHints.some((hint) => name.includes(hint));
    const isMale = isMaleVoiceName(name);
    if (gender === "male" && isFemale) return -100;
    if (gender === "female" && isMale) return -100;
    let value = 0;
    if (voice.lang.toLowerCase() === normalizedLanguage) value += 40;
    if (voice.lang.toLowerCase().startsWith(normalizedLanguage.slice(0, 2))) value += 20;
    if (gender === "male" && /naayf|adam|khalid|arabic|العربي|ar-sa/i.test(name)) value += 22;
    if (gender === "female" && /hoda|laila|saba|zira|arabic|العربي|ar-sa/i.test(name)) value += 22;
    if (gender === "male" ? isMale : isFemale) value += 60;
    if (gender === "male" && /\bmale\b|\bman\b/i.test(name)) value += 30;
    if (gender === "female" && /\bfemale\b|\bwoman\b/i.test(name)) value += 30;
    return value;
  };
  return candidates.map(voice => ({ voice, value: score(voice) })).sort((a, b) => b.value - a.value)[0]?.voice ?? candidates[0];
}

function cleanSpeechText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_#`]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 400); // FIXED: قص النص عشان ما يقطع
}

// FIXED: الصوت ما يشتغل لحاله أبداً - بزر فقط
export function AssistantReply({ text, language, autoSpeak = false, voiceGender = "male" }: AssistantReplyProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speak = () => {
    if (typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined") return;
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    
    synthesis.cancel();
    const spokenText = cleanSpeechText(text);
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = speechLanguage[language];
    utterance.rate = 0.9; // أبطأ عشان ما يقطع
    utterance.pitch = voiceGender === "male" ? 0.9 : 1.05;
    utterance.volume = 1;
    
    const voices = synthesis.getVoices();
    const selectedVoice = chooseVoice(utterance.lang, voiceGender, voices);
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    synthesis.speak(utterance);
  };

  // FIXED: حذفنا useEffect اللي كان يشغل الصوت تلقائياً ويعلق الصفحة

  return (
    <button
      className={`speak-button ${isSpeaking ? "is-speaking" : ""}`}
      onClick={isSpeaking ? stopSpeaking : speak}
      aria-label={isSpeaking ? "إيقاف الرد الصوتي" : "تشغيل الرد صوتياً"}
      data-speech-state={isSpeaking ? "speaking" : "idle"}
      type="button"
      style={{ pointerEvents: 'auto' }}
    >
      {isSpeaking ? <Pause size={13} /> : <Volume2 size={13} />}
      <small>{isSpeaking ? "إيقاف" : "استماع"}</small>
    </button>
  );
}

export type { VoiceGender };
