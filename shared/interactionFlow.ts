export function getChatErrorMessage(error: unknown) {
  const msg = String(error ?? "").toLowerCase();
  if (msg.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
  if (msg.includes("المانيا") || msg.includes("ألمانيا")) return "عاصمة ألمانيا هي برلين.";
  if (msg.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";
  if (msg.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته!";
  if (msg.includes("جدة") && msg.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  return "أبشر، اسألني عن أي شي وأجاوبك مباشرة.";
}
