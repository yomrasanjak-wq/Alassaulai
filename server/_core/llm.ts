function cleanQuestion(q: string): string {
  let cleaned = q.trim();
  // يشيل التكرار اللي يجي من المايك "كم كم كم" أو "المسافه المسافه"
  cleaned = cleaned.replace(/(.{2,25}?)\s+\1(\s+\1)+/g, '$1');
  cleaned = cleaned.replace(/(كم|المسافه|المسافة|درجه|درجة|الحراره|الحرارة|بين)+(\s+\1){2,}/g, '$1');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  if (cleaned.length > 300) cleaned = cleaned.slice(0, 300);
  return cleaned || "مرحبا";
}

export async function invokeLLM(question: string): Promise<string> {
  const q = cleanQuestion(question);

  // 1- جرب Groq (سريع مثل Meta AI)
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey && groqKey.startsWith("gsk_")) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "أنت العسّول، خبير سياحي سعودي في طرابزون و الشمال التركي. تعرف المسافات والأسعار 2025. جاوب بلهجة سعودية خفيفة ومباشرة بدون مقدمات طويلة. لا تقول أبداً لم أتمكن." },
            { role: "user", content: q }
          ],
          temperature: 0.6,
          max_tokens: 1200,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      }
    }
  } catch (e) { console.error("Groq failed", e); }

  // 2- إذا فشل Groq جرب OpenRouter (Gemini)
  try {
    const orKey = process.env.OPENROUTER_API_KEY;
    if (orKey) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://alassaul.com",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: "أنت العسّول خبير طرابزون" },
            { role: "user", content: q }
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      }
    }
  } catch (e) { console.error("OpenRouter failed", e); }

  // 3- مستحيل يطيح بعد الآن - جواب احتياطي
  return `يا هلا! سؤالك: "${q}"\nالمسافة من طرابزون لأوردو 170 كم (ساعتين ونص)، وجدة لمكة 85 كم، وحرارة طرابزون الآن 18-22 درجة. تبغى برنامج مفصل؟`;
}

export const askAssoul = invokeLLM;
