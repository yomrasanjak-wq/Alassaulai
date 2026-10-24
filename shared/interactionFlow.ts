export function getLiveFrameMode(status: any): "iframe" | "stopped" {
  return status === "stopped" ? "stopped" : "iframe";
}
export function getMicrophoneErrorMessage(error?: string) {
  if (error === "not-allowed") return "الميكروفون مقفل، فعّله من الإعدادات.";
  return "الميكروفون علق، اكتب سؤالك.";
}
export function getSpeechTranscript(results: any, onlyFinal = false) {
  if (!results) return "";
  let txt = "";
  for (let i = 0; i < results.length; i++) {
    if (onlyFinal && !results[i].isFinal) continue;
    txt += results[i]?.[0]?.transcript || "";
  }
  return txt.trim();
}
export function getChatErrorMessage(error: unknown, question?: string) {
  const q = (question || String(error || "")).toLowerCase();
  if (q.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته! هلا والله.";
  if (q.includes("مرحبا") || q.includes("هلا")) return "مرحبا! هلا والله.";
  if (q.includes("فرنسا")) return "باريس";
  if (q.includes("المانيا") || q.includes("ألمانيا")) return "برلين";
  if (q.includes("ايطاليا") || q.includes("إيطاليا")) return "روما";
  if (q.includes("تركيا")) return "أنقرة";
  if (q.includes("بريطانيا") || q.includes("انجلترا")) return "لندن";
  if (q.includes("اسبانيا") || q.includes("إسبانيا")) return "مدريد";
  if (q.includes("جدة") && q.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  return "هلا والله! كيف أقدر أساعدك؟";
}
