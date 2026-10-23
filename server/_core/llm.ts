function cleanQuestion(q: string): string {
  let c = q.trim().replace(/\s+/g, ' ');
  if (c.length > 300) c = c.slice(0, 300);
  return c;
}

export async function invokeLLM(question: string): Promise<string> {
  const q = cleanQuestion(question);
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_KEY missing");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "أنت العسّول خبير طرابزون، جاوب بلهجة سعودية مباشرة" },
          { role: "user", content: q }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (e: any) {
    console.error(e);
    return `المسافة من جدة لمكة 85 كم، ومن طرابزون لأوردو 170 كم ساعتين ونص. حرارة طرابزون 18-22. تبغى برنامج؟ (خطأ فني: ${e.message})`;
  }
}
export const askAssoul = invokeLLM;
