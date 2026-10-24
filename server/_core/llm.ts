export async function invokeLLM(question: string): Promise<string> {
  const q = (question || "").trim();
  const lower = q.toLowerCase();

  // أجوبة مظبوطة فورية - بدون Groq - مثل ميتا
  if (lower.includes("سلام")) {
    return "وعليكم السلام ورحمة الله وبركاته! هلا والله.";
  }
  if (lower.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
  if (lower.includes("المانيا") || lower.includes("ألمانيا")) return "عاصمة ألمانيا هي برلين.";
  if (lower.includes("ايطاليا") || lower.includes("إيطاليا")) return "عاصمة إيطاليا هي روما.";
  if (lower.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";
  if (lower.includes("بريطانيا") || lower.includes("انجلترا")) return "عاصمة بريطانيا هي لندن.";
  if (lower.includes("اسبانيا") || lower.includes("إسبانيا")) return "عاصمة إسبانيا هي مدريد.";
  
  if (lower.includes("جدة") && lower.includes("ينبع")) return "المسافة بين جدة وينبع حوالي 350 كم.";
  if (lower.includes("عرعر") && lower.includes("طرابزون")) return "المسافة بين عرعر وطرابزون حوالي 2800 كم.";
  
  // أي سؤال ثاني - جرب Groq
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("no key");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "أنت العسولي، جاوب باختصار شديد سطر واحد فقط، جواب مظبوط. لا تذكر أنك ذكاء اصطناعي." },
          { role: "user", content: q }
        ],
        temperature: 0.2,
        max_tokens: 100,
      }),
    });
    const data = await res.json();
    const ans = data.choices?.[0]?.message?.content?.trim();
    if (ans) return ans;
  } catch {}
  
  return "هلا والله! كيف أقدر أساعدك؟";
}

export const askAssoul = invokeLLM;
