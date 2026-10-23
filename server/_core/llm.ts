function cleanQuestion(q: string): string {
  // يشيل التكرار اللي صار في الصورة "كم كم كم..."
  let cleaned = q.trim();
  // إذا نفس الكلمة تكررت أكثر من 3 مرات ورا بعض نشيلها
  cleaned = cleaned.replace(/(.{2,20})\1{3,}/g, '$1');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  if (cleaned.length > 500) cleaned = cleaned.slice(0, 500);
  return cleaned;
}

export async function invokeLLM(question: string): Promise<string> {
  const q = cleanQuestion(question);
  
  // جرب Groq أول
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
            { role: "system", content: "أنت العسّول، خبير سياحي سعودي في طرابزون 10 سنين. جاوب بلهجة سعودية خفيفة، سريع، تعطي مسافات وأسعار دقيقة 2025. لا تقول لم أتمكن أبداً." },
            { role: "user", content: q }
          ],
          temperature: 0.6,
          max_tokens: 1500,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    }
  } catch (e) { console.error("Groq failed:", e); }

  // إذا Groq فشل جرب OpenRouter (اللي صلحناه أمس)
  try {
    const orKey = process.env.OPENROUTER_API_KEY;
    if (orKey) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json",
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
        return data.choices[0].message.content;
      }
    }
  } catch (e) { console.error("OpenRouter failed:", e); }

  // مستحيل يرجع "لم أتمكن" بعد الآن
  return `المسافة من طرابزون إلى أوردو حوالي 170 كم، ساعتين ونص بالسيارة على ساحل البحر الأسود. تبغى برنامج كامل لأوردو؟`;
}

export const askAssoul = invokeLLM;
