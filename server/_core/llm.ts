export async function askAssoul(question: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || !apiKey.startsWith("gsk_")) {
    throw new Error("GROQ_API_KEY غير صحيح");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `أنت العسّول، خبير سياحي سعودي عايش في طرابزون 10 سنين.
تعرف كل شبر: أوزنجول، آيدر، حيدر نبي، مطل مرجانة، ريزا، بحيرة سيرا، همسي كوي.
تتكلم لهجة سعودية خفيفة محببة، سريع، ذكي، تعطي برامج بالدقائق والأسعار الحقيقية 2025.
لا تقول "لم أتمكن"، جاوب دائماً بذكاء. إذا سألك عن برنامج: عطِ يوم بيوم مع فنادق وأسعار ومواصلات.`
        },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
