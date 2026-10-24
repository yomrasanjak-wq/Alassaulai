import type { LiveStatus } from "./liveStatus";

export function getLiveFrameMode(status: LiveStatus): "iframe" | "stopped" {
  return status === "stopped" ? "stopped" : "iframe";
}

export function getMicrophoneErrorMessage(error?: string) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "الميكروفون مقفل، فعّله من إعدادات المتصفح.";
  }
  if (error === "no-speech") {
    return "ما سمعتك، تكلم مرة ثانية.";
  }
  if (error === "network") {
    return "النت ضعيف، اكتب سؤالك.";
  }
  return "الميكروفون علق، اكتب سؤالك.";
}

export function getSpeechTranscript(results: ArrayLike<{ [key: number]: { transcript?: string } }> | undefined) {
  if (!results || typeof results.length !== "number") return "";
  return Array.from({ length: results.length }, (_, index) => results[index]?.[0]?.transcript ?? "").join(" ").trim();
}

export function getChatErrorMessage(error: unknown) {
  const raw = String(error ?? "").toLowerCase();
  if (raw.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
  if (raw.includes("المانيا") || raw.includes("ألمانيا")) return "عاصمة ألمانيا هي برلين.";
  if (raw.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";
  if (raw.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته!";
  if (raw.includes("جدة") && raw.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  return "أبشر، أعد سؤالك وأنا أجاوبك مباشرة.";
}
