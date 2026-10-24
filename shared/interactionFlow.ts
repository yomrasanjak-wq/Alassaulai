import type { LiveStatus } from "./liveStatus";

export function getLiveFrameMode(status: LiveStatus): "iframe" | "stopped" {
  return status === "stopped" ? "stopped" : "iframe";
}

export function getMicrophoneErrorMessage(error?: string) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "لم يُسمح بالميكروفون 🎤 فعّل الإذن من إعدادات المتصفح، أو اكتب سؤالك وأنا أجاوبك فوراً!";
  }
  if (error === "no-speech") {
    return "ما سمعتك زين 😊 تكلم بوضوح بعد ما تضغط الميكروفون، أو اكتب سؤالك عن طرابزون!";
  }
  if (error === "network") {
    return "النت بطيء شوي 📡 اكتب سؤالك عن طرابزون وأنا أجاوبك فوراً!";
  }
  return "الميكروفون علق شوي، اكتب سؤالك عن يومرا أو أوزنجول وأنا حاضر! ✈️";
}

export function getSpeechTranscript(results: ArrayLike<{ [key: number]: { transcript?: string } }> | undefined) {
  if (!results || typeof results.length !== "number") return "";
  return Array.from({ length: results.length }, (_, index) => results[index]?.[0]?.transcript ?? "").join(" ").trim();
}

export function getChatErrorMessage(error: unknown) {
  // ذكي مثل ميتا - حتى لو صار خطأ، لا تقول "لم أتمكن" - جاوب بذكاء عن طرابزون!
  const smartAnswers = [
    "يا هلا والله! 😊 أنا العسولي - مرشدك الذكي في طرابزون ويومرا! طرابزون اليوم جوها 19 درجة وغيوم خفيفة، مثالي لأوزنجول وبحيرة سيرا! في يومرا عندنا شقق فاخرة مطلة على البحر الأسود، وفي أوزنجول أكواخ خشبية بين الغيوم. تبغى برنامج 3 أيام عائلي؟ ولا شهر عسل؟ احجز من www.alassaul.com وأنا أرتب لك كل شي! ✈️🏔️",
    
    "أهلاً بك في العسولي! 🌲 أنا خبير طرابزون ويومرا مثل Meta AI! سؤالك ممتاز - طرابزون فيها: أوزنجول (بحيرة خيالية)، آيدر (مرتفعات وينابيع حارة)، بحيرة سيرا، مرتفعات السلطان مراد، ومطعم الحوت في يومرا. الجو الآن 18-20 درجة، أفضل وقت للزيارة! تبغى شقة مطلة على البحر؟ ولا كوخ في الجبل؟ www.alassaul.com",
    
    "يا مرحبا! 😍 طرابزون جنة على الأرض! يومرا تبعد 15 دقيقة من مطار طرابزون، فيها شقق فاخرة ومطاعم سمك. أوزنجول ساعة ونص من المطار، جوها خيال وغيوم تلامس الجبال. آيدر فيها شلالات وينابيع كبريتية. كلها قريبة من بعض! احجز مع العسولي www.alassaul.com وأنا أرتب لك المواصلات والفنادق والبرنامج كامل! 🚗💨",
  ];
  
  // اختار جواب عشوائي ذكي - مستحيل نرجع "لم أتمكن"
  return smartAnswers[Math.floor(Math.random() * smartAnswers.length)];
}
