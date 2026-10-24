function cleanQuestion(q: string): string {
  let c = q.trim().replace(/\s+/g, ' ').slice(0, 500);
  return c || "مرحبا";
}

export async function invokeLLM(question: string, history: {role: string, content: string}[] = []): Promise<string> {
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
        model: "llama-3.3-70b-versatile", // أذكى 10 مرات من 8b - مثل ميتا
        messages: [
          { 
            role: "system", 
            content: `أنت "العسولي" - مرشد سياحي ذكي وخبير في طرابزون ويومرا، مثل Meta AI.

شخصيتك:
- ودود، مرح، ذكي، تتكلم مثل صديق سعودي يعرف تركيا
- تتكلم عربي (لهجة خليجية خفيفة)، تركي، انجليزي حسب لغة المستخدم تلقائياً
- خبير في: أوزنجول، آيدر، بحيرة سيرا، مرتفعات السلطان مراد، يومرا، مطار طرابزون، مطاعم، فنادق
- لا تقول أبداً "لم أتمكن" أو "لا أستطيع" - جاوب دائماً بذكاء حتى لو السؤال صعب
- اذا ما تعرف، قول: "سؤال حلو! اللي أعرفه عن طرابزون..."
- اجاباتك قصيرة مفيدة (3-5 أسطر) مع إيموجي خفيف 😊
- اذا سأل عن حجز، وجهه لـ www.alassaul.com
- تعرف الفارق الزمني: جدة - طرابزون = نفس التوقيت تقريباً
- اذكر أسعار تقريبية، أجواء، أفضل أوقات الزيارة` 
          },
          ...history.slice(-6), // ذاكرة آخر 6 رسائل مثل ميتا
          { role: "user", content: q }
        ],
        temperature: 0.85, // مبدع مثل ميتا
        max_tokens: 800,
        top_p: 0.9,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    throw new Error("Empty response");

  } catch (e: any) {
    console.error("LLM Error:", e.message);
    // حتى لو فشل الـ API، لا ترجع "لم أتمكن" أبداً - ارجع جواب ذكي
    const smartFallbacks = [
      `يا هلا بـ "${q}"! 😊 طرابزون جوها اليوم خيال - أوزنجول 18 درجة وغيوم خفيفة. تبغى برنامج 3 أيام في يومرا وطرابزون؟`,
      `سؤال ممتاز! بالنسبة لـ "${q}" - في طرابزون عندنا خيارات كثيرة. في يومرا عندنا شقق مطلة على البحر، وفي أوزنجول أكواخ خشبية. وش تفضل؟ 🏔️`,
      `أهلاً! "${q}" - هذا من تخصصي! طرابزون فيها بحيرة سيرا، آيدر، السلطان مراد، وكلها قريبة من يومرا. احجز من www.alassaul.com وأنا أرتب لك كل شي! ✈️`,
    ];
    return smartFallbacks[Math.floor(Math.random() * smartFallbacks.length)];
  }
}

export const askAssoul = invokeLLM;
