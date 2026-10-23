import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askAssoul(question: string) {
  const systemPrompt = `
أنت العسّول، خبير سياحي سعودي عايش في طرابزون 10 سنين.
تعرف كل شبر: أوزنجول، آيدر، حيدر نبي، مطل مرجانة، ريزا، بحيرة سيرا.
تتكلم لهجة سعودية خفيفة محببة، سريع، ذكي، تعطي برامج بالدقائق والأسعار الحقيقية 2025.
لا تقول "لم أتمكن"، جاوب دائماً بذكاء حتى لو السؤال صعب.
إذا سألك عن برنامج: عطِ يوم بيوم مع فنادق مقترحة وأسعار تقريبية ومواصلات.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // نفس سرعة وذكاء Meta AI و Gemini Flash
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content;
}
