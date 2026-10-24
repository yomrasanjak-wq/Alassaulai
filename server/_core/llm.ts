export async function invokeLLM(question: string): Promise<string> {
  const q = question.trim();
  const lower = q.toLowerCase();

  if (lower.includes("عاصمة") && lower.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
  if (lower.includes("عاصمة") && (lower.includes("المانيا") || lower.includes("ألمانيا"))) return "عاصمة ألمانيا هي برلين.";
  if (lower.includes("عاصمة") && (lower.includes("ايطاليا") || lower.includes("إيطاليا"))) return "عاصمة إيطاليا هي روما.";
  if (lower.includes("عاصمة") && lower.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";
  if (lower.includes("عاصمة") && lower.includes("بريطانيا")) return "عاصمة بريطانيا هي لندن.";
  if (lower.includes("عاصمة") && (lower.includes("اسبانيا") || lower.includes("إسبانيا"))) return "عاصمة إسبانيا هي مدريد.";

  if (lower.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته! هلا والله، كيف أقدر أساعدك؟";
  
  if (lower.includes("جدة") && lower.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  if (lower.includes("عرعر") && lower.includes("طرابزون")) return "المسافة بين عرعر وطرابزون حوالي 2800 كم.";
  if (lower.includes("جديدة") && lower.includes("عرعر")) return "المسافة بين جديدة وعرعر حوالي 30 كم.";

  try {
    const key = process.env.GROQ_API_KEY;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "أنت العسولي، مرشد سياحي في طرابزون ويومرا، لكن تجاوب على أي سؤال عام باختصار شديد سطر واحد. لا تقل أنك ذكاء صناعي ولا تذكر اسم شركة. تكلم سعودي بسيط." },
          { role: "user", content: q }
        ],
        temperature: 0.2,
        max_tokens: 120,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "أبشر، كيف أساعدك؟";
  } catch {
    return "أبشر، أعد سؤالك.";
  }
}
export const askAssoul = invokeLLM;
