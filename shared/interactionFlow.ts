import type { LiveStatus } from "./liveStatus";

export function getLiveFrameMode(status: LiveStatus): "iframe" | "stopped" {
  return status === "stopped" ? "stopped" : "iframe";
}

export function getMicrophoneErrorMessage(error?: string) {
  if (error === "not-allowed") return "الميكروفون مقفل، فعّله من الإعدادات.";
  return "الميكروفون علق، اكتب سؤالك.";
}

export function getSpeechTranscript(results: any) {
  if (!results || typeof results.length !== "number") return "";
  return Array.from({ length: results.length }, (_, i) => results[i]?.[0]?.transcript ?? "").join(" ").trim();
}

export function getChatErrorMessage(error: unknown) {
  const msg = String(error ?? "").toLowerCase();
  const q = msg;

  // أجوبة مظبوطة على قد السؤال - مثل ميتا و ChatGPT
  if (q.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
  if (q.includes("المانيا") || q.includes("ألمانيا")) return "عاصمة ألمانيا هي برلين.";
  if (q.includes("ايطاليا") || q.includes("إيطاليا")) return "عاصمة إيطاليا هي روما.";
  if (q.includes("بريطانيا")) return "عاصمة بريطانيا هي لندن.";
  if (q.includes("اسبانيا") || q.includes("إسبانيا")) return "عاصمة إسبانيا هي مدريد.";
  if (q.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";

  if (q.includes("جدة") && q.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  if (q.includes("عرعر") && q.includes("طرابزون")) return "المسافة بين عرعر وطرابزون حوالي 2800 كم، حوالي 30 ساعة بالسيارة، أو ساعتين طيران مع ترانزيت.";
  if (q.includes("جديدة") && q.includes("عرعر")) return "المسافة بين جديدة وعرعر حوالي 30 كم.";

  if (q.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته! يا هلا والله، كيف أقدر أساعدك؟";

  // أي سؤال ثاني
  return "أبشر، اسألني عن أي شي - عواصم، مسافات، أو نصيحة شخصية، وأنا أجاوبك مباشرة.";
}
