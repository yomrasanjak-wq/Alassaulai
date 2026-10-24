import React, { useEffect, useRef, useState } from "react";

export type VoiceGender = "male" | "female";

type AssistantReplyProps = {
  text: string;
  language?: "AR" | "TR" | "EN";
  voiceGender?: VoiceGender;
  autoSpeak?: boolean;
};

function cleanSpeechText(text: string): string {
  if (!text) return "";
  // احذف الروابط والإيموجي الزايد والنجوم
  let t = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*#_`\[\]()]/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}]/gu, "")
    .trim();
  
  // خذ أول جملتين فقط عشان الصوت ما يطول
  const sentences = t.split(/[.!?؟\n]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 2) {
    t = sentences.slice(0, 2).join(". ") + ".";
  }
  
  // لو النص فيه "أعد سؤالك" أو "لم أتمكن" - لا تقراه، قول مرحبا بداله
  if (t.includes("أعد سؤالك") || t.includes("لم أتمكن") || t.includes("تعذر") || t.length < 2) {
    return "مرحبا";
  }
  
  return t.slice(0, 250); // قصير للصوت
}

export function AssistantReply({ text, language = "AR", voiceGender = "male", autoSpeak = true }: AssistantReplyProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = React.useCallback((rawText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    const synth = window.speechSynthesis;
    synth.cancel(); // وقف أي صوت قديم
    
    const cleaned = cleanSpeechText(rawText);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;
    
    utterance.lang = language === "AR" ? "ar-SA" : language === "TR" ? "tr-TR" : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = voiceGender === "female" ? 1.15 : 0.95;
    utterance.volume = 1;

    // اختر أفضل صوت عربي متاح - يصلح مشكلة سامسونج
    const setVoice = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      
      // دور على صوت عربي
      let arabicVoice = voices.find(v => v.lang.startsWith("ar") && v.name.toLowerCase().includes(voiceGender === "female" ? "female" : "male"));
      if (!arabicVoice) arabicVoice = voices.find(v => v.lang.startsWith("ar"));
      if (!arabicVoice) arabicVoice = voices.find(v => v.lang.includes("ar-SA"));
      if (arabicVoice) utterance.voice = arabicVoice;
    };

    // حاول تحميل الأصوات
    setVoice();
    if (synth.getVoices().length === 0) {
      // سامسونج يحتاج انتظار
      setTimeout(() => {
        setVoice();
        synth.speak(utterance);
      }, 800);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setHasSpoken(true);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    // تأخير صغير عشان المتصفح يجهز
    setTimeout(() => {
      synth.speak(utterance);
    }, 100);
  }, [language, voiceGender]);

  // تشغيل تلقائي عند وصول رسالة جديدة - هذا اللي يخليه يتكلم لحاله!
  useEffect(() => {
    if (!autoSpeak || !text || hasSpoken) return;
    
    // تأخير 600ms بعد ظهور النص
    const timer = setTimeout(() => {
      speakText(text);
    }, 600);

    return () => clearTimeout(timer);
  }, [text, autoSpeak, hasSpoken, speakText]);

  // إعادة ضبط عند رسالة جديدة
  useEffect(() => {
    setHasSpoken(false);
  }, [text]);

  // نظف الصوت عند الخروج
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleManualSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }
    setHasSpoken(false);
    speakText(text);
  };

  return (
    <div className="assistant-voice-controls">
      <button
        type="button"
        onClick={handleManualSpeak}
        className={`voice-play-button ${isSpeaking ? "is-speaking" : ""}`}
        aria-label={isSpeaking ? "إيقاف الصوت" : "استماع للرد"}
      >
        <span className="voice-icon">{isSpeaking ? "⏸️" : "🔊"}</span>
        <span>{isSpeaking ? "إيقاف" : "استماع 🔊"}</span>
      </button>
    </div>
  );
}
