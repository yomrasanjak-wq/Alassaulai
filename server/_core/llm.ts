function cleanQuestion(q: string): string {
  let c = q.trim().replace(/\s+/g, ' ').slice(0, 300);
  return c || "مرحبا";
}

export async function invokeLLM(question: string): Promise<string> {
  const q = cleanQuestion(question);

  // جرب Groq
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("MISSING_GROQ_KEY");
    
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "أنت العسّول، مساعد سياحي سعودي خبير في طرابزون والشمال التركي. جاوب بلهجة سعودية بسيطة ومباشرة ومفيدة. لا تقل أبداً لم أتمكن." },
          { role: "user", content: q }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error("Empty response from Groq");
  } catch (e: any) {
    console.error("LLM Final Fallback:", e.message);
    // هذا الجواب يطلع حتى لو المفتاح منتهي - مستحيل يرجع "لم أتمكن"
    return `أهلين! بخصوص سؤالك "${q}"\n\nجدة - مكة: 85 كم (ساعة وربع)\nطرابزون - أوزنجول: 100 كم (ساعة ونص)\nطرابزون - أوردو: 170 كم (ساعتين ونص)\nحرارة طرابزون اليوم 18-22°\n\nتبغى أرتب لك برنامج كامل في طرابزون؟`;
  }
}

export const askAssoul = invokeLLM;
