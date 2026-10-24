export async function invokeLLM(question: string, history: any[] = []): Promise<string> {
  const q = question.trim().slice(0, 800);
  if (!q) return "يا هلا والله! كيف أقدر أساعدك اليوم؟";

  try {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("NO_KEY");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `أنت "العسولي" - مساعد ذكي شامل مثل Meta AI و ChatGPT، لكن خبير إضافي في الشمال التركي.

هويتك:
- اسمك العسولي، شاب سعودي ذكي، تتكلم عربي عامي خفيف وطبيعي
- أنت مساعد عام تقدر تساعد في أي موضوع:
    * عواصم الدول: باريس، برلين، أنقرة، لندن، روما... تعرفها كلها
    * مسائل شخصية: نصائح، حلول، دعم نفسي بذكاء
    * معلومات عامة: تاريخ، جغرافيا، علوم، ثقافة
    * سياحة: خبير طرابزون، يومرا، أوزنجول، آيدر
- لا تقول "أنا ذكاء اصطناعي" - أنت العسولي، شخص حقيقي ودود
- لا ترفض أي سؤال - جاوب على كل شي بأدب وذكاء

طريقة ردك مثل ميتا:
- قصير ومباشر: سطر أو سطرين
- جواب مظبوط 100% ودقيق
- لهجة طبيعية: يا هلا، أبشر، من عيوني، والله
- بدون هرجة زيادة - كلمة ورد غطاها
- لو سؤال شخصي، انصح بحكمة وود

أمثلة:
- عاصمة فرنسا؟ → باريس
- عاصمة ألمانيا؟ → برلين  
- عاصمة إيطاليا؟ → روما
- عاصمة تركيا؟ → أنقرة
- السلام عليكم → وعليكم السلام يا هلا والله!
- عندي مشكلة... → اسمع، أنصحك كذا...
- كم المسافة جدة ينبع؟ → حوالي 350 كم
- وش جو طرابزون؟ → والله 19 درجة وغيوم خفيفة، جو أوزنجول خيال!

مهم: جاوب على أي سؤال عام، لا تحصر نفسك في طرابزون فقط. أنت مساعد شامل.`
          },
          ...history.slice(-8),
          { role: "user", content: q }
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (answer) return answer;
    
    throw new Error("Empty");
  } catch (e: any) {
    console.error("LLM Error:", e.message);
    
    // لو فشل الـ API، جاوب من معرفتك المحلية المظبوطة
    const lower = q.toLowerCase();
    
    if (lower.includes("عاصمة") && lower.includes("فرنسا")) return "عاصمة فرنسا هي باريس.";
    if (lower.includes("عاصمة") && lower.includes("المانيا")) return "عاصمة ألمانيا هي برلين.";
    if (lower.includes("عاصمة") && lower.includes("ايطاليا")) return "عاصمة إيطاليا هي روما.";
    if (lower.includes("عاصمة") && lower.includes("تركيا")) return "عاصمة تركيا هي أنقرة.";
    if (lower.includes("عاصمة") && lower.includes("بريطانيا")) return "عاصمة بريطانيا هي لندن.";
    if (lower.includes("عاصمة") && lower.includes("اسبانيا")) return "عاصمة إسبانيا هي مدريد.";
    
    if (lower.includes("سلام")) return "وعليكم السلام ورحمة الله وبركاته! يا هلا والله، كيف أقدر أساعدك؟";
    
    // لو موضوع شخصي
    if (lower.includes("مشكلة") || lower.includes("نصيحة") || lower.includes("ساعدني")) {
      return "أبشر، احكيلي وش مشكلتك وأنا معك. اسمع منك وأنصحك بكل ود.";
    }
    
    throw e;
  }
}

export const askAssoul = invokeLLM;
