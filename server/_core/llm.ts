export async function invokeLLM(question: string): Promise<string> {
  const q = (question || "").toLowerCase().trim();
  
  if (!q) return "مرحبا! كيف أقدر أساعدك؟";
  if (q.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته! هلا والله.";
  if (q.includes("مرحبا") || q.includes("هلا")) return "مرحبا! هلا والله.";
  
  if (q.includes("فرنسا")) return "باريس";
  if (q.includes("المانيا") || q.includes("ألمانيا")) return "برلين";
  if (q.includes("ايطاليا") || q.includes("إيطاليا")) return "روما";
  if (q.includes("تركيا")) return "أنقرة";
  if (q.includes("بريطانيا") || q.includes("انجلترا")) return "لندن";
  if (q.includes("اسبانيا") || q.includes("إسبانيا")) return "مدريد";
  
  if (q.includes("جدة") && q.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  
  // لو سؤال عام - جرب Groq، ولو فشل رجع جواب قصير
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("no key");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "جاوب باختصار شديد سطر واحد فقط، بدون ذكر ميتا." },
          { role: "user", content: question }
        ],
        temperature: 0.2,
        max_tokens: 80,
      }),
    });
    const data = await res.json();
    const ans = data.choices?.[0]?.message?.content?.trim();
    if (ans) return ans;
  } catch {}
  
  return "هلا والله! كيف أقدر أساعدك؟";
}
export const askAssoul = invokeLLM;
