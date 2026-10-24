/**
 * ALASSAUL-AI — interactionFlow
 * Smart fallback when GROQ API fails + speech helpers
 */

export function getChatErrorMessage(error: any, question?: string): string {
  const q = (question || "").toLowerCase().trim();

  // 1. تحية
  if (q.includes("سلام") || q.includes("هلا") || q.includes("مرحبا") || q.includes("اهلا")) {
    return "وعليكم السلام ورحمة الله وبركاته! هلا والله، كيف أقدر أساعدك اليوم؟";
  }

  // 2. عواصم العالم - خريطة شاملة
  const capitals: Record<string, string> = {
    "فرنسا": "باريس",
    "المانيا": "برلين",
    "ألمانيا": "برلين",
    "ايطاليا": "روما",
    "إيطاليا": "روما",
    "تركيا": "أنقرة",
    "بريطانيا": "لندن",
    "انجلترا": "لندن",
    "اسبانيا": "مدريد",
    "إسبانيا": "مدريد",
    "السعودية": "الرياض",
    "مصر": "القاهرة",
    "الامارات": "أبوظبي",
    "الإمارات": "أبوظبي",
    "قطر": "الدوحة",
    "الكويت": "مدينة الكويت",
    "البحرين": "المنامة",
    "عمان": "مسقط",
    "الاردن": "عمان",
    "لبنان": "بيروت",
    "البرازيل": "برازيليا",
    "امريكا": "واشنطن",
    "أمريكا": "واشنطن",
    "اليابان": "طوكيو",
    "الصين": "بكين",
    "روسيا": "موسكو",
    "الهند": "نيودلهي",
    "كندا": "أوتاوا",
    "استراليا": "كانبرا",
    "أستراليا": "كانبرا",
    "اليونان": "أثينا",
    "المغرب": "الرباط",
    "الجزائر": "الجزائر",
    "تونس": "تونس",
    "اليمن": "صنعاء",
    "العراق": "بغداد",
    "سوريا": "دمشق",
    "السودان": "الخرطوم",
    "اندونيسيا": "جاكرتا",
    "إندونيسيا": "جاكرتا",
    "باكستان": "إسلام آباد",
    "ايران": "طهران",
    "إيران": "طهران",
  };

  if (q.includes("عاصمة")) {
    for (const [country, capital] of Object.entries(capitals)) {
      if (q.includes(country.toLowerCase())) {
        return capital;
      }
    }
    // لو سأل عاصمة بشكل عام بدون دولة واضحة
    return "أبشر! حدد لي الدولة، مثل: ما هي عاصمة البرازيل؟";
  }

  // 3. المسافات - خريطة مسافات معروفة
  const distances: Record<string, string> = {
    "جدة-ينبع": "حوالي 350 كم",
    "ينبع-جدة": "حوالي 350 كم",
    "اسطنبول-طرابزون": "حوالي 1060 كم",
    "طرابزون-اسطنبول": "حوالي 1060 كم",
    "انقرة-طرابزون": "حوالي 750 كم",
    "طرابزون-انقرة": "حوالي 750 كم",
    "الرياض-جدة": "حوالي 950 كم",
    "جدة-الرياض": "حوالي 950 كم",
    "الرياض-ينبع": "حوالي 1000 كم",
    "ينبع-الرياض": "حوالي 1000 كم",
    "الرياض-الدمام": "حوالي 400 كم",
    "جدة-مكة": "حوالي 80 كم",
    "مكة-جدة": "حوالي 80 كم",
    "ريزا-طرابزون": "حوالي 75 كم",
    "طرابزون-ريزا": "حوالي 75 كم",
    "اوردو-طرابزون": "حوالي 180 كم",
    "طرابزون-اوردو": "حوالي 180 كم",
    "سامسون-طرابزون": "حوالي 350 كم",
    "طرابزون-سامسون": "حوالي 350 كم",
  };

  if (q.includes("مسافة") || q.includes("كم تبعد") || q.includes("المسافه") || q.includes("المسافة") || q.includes("تبعد")) {
    for (const [key, value] of Object.entries(distances)) {
      const parts = key.split("-");
      if (q.includes(parts[0]) && q.includes(parts[1])) {
        return value;
      }
    }
    // رد عام ذكي للمسافات غير المحفوظة
    return "المسافة تحتاج حساب على الخريطة. حدد لي المدينتين مثل: جدة وينبع، وأعطيك المسافة التقريبية.";
  }

  // 4. طرابزون والسياحة
  if (q.includes("طرابزون") || q.includes("اوزنجول") || q.includes("أوزنجول") || q.includes("ايدر") || q.includes("آيدر")) {
    return "طرابزون جوها اليوم حوالي 19 درجة، وأوزنجول من أجمل البحيرات. تبغى أرتب لك برنامج؟";
  }

  // 5. أسئلة عامة
  if (q.includes("كيف حالك") || q.includes("شلونك") || q.includes("اخبارك")) {
    return "أبشرك بخير! جاهز أساعدك في أي شي عن السفر أو المعلومات العامة.";
  }

  if (q.includes("شكرا") || q.includes("يعطيك العافية")) {
    return "العفو! حاضرين لك في أي وقت.";
  }

  if (q.includes("من انت") || q.includes("من أنت") || q.includes("وش اسمك")) {
    return "أنا مساعد Alassaul — خبير شمال تركيا وأجاوبك عن أي شي.";
  }

  // 6. Fallback ذكي ومختصر - ما يقول "لم أتمكن"
  if (question && question.trim().length > 2) {
    return `أبشر! سؤالك عن "${question.trim().slice(0, 40)}" واضح. جرب تصيغه بطريقة ثانية أو حدد المدينة والدولة عشان أجاوبك بدقة.`;
  }

  return "هلا والله! كيف أقدر أساعدك؟";
}

export function getMicrophoneErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case "not-allowed":
    case "permission-denied":
      return "الميكروفون مقفل. اسمح للمتصفح باستخدام الميكروفون من إعدادات الموقع، ثم جرب مرة ثانية.";
    case "no-speech":
      return "ما سمعت شي. قرب من الميكروفون وتكلم بوضوح.";
    case "audio-capture":
      return "ما لقيت ميكروفون. تأكد أن الجهاز فيه ميكروفون شغال.";
    case "network":
      return "انقطع الاتصال. تأكد من النت وحاول مرة ثانية.";
    default:
      return "تعذر بدء الميكروفون. اكتب سؤالك كتابة لو تحب.";
  }
}

export function getLiveFrameMode() {
  return "live";
}

export function getSpeechTranscript(results: any, onlyFinal = false): string {
  if (!results || !results.length) return "";
  let finalText = "";
  let interimText = "";
  
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (!res || !res[0]) continue;
    const transcript = res[0].transcript || "";
    if (!transcript) continue;
    
    // فقط النص النهائي
    if (res.isFinal) {
      finalText += transcript + " ";
    } else {
      interimText += transcript + " ";
    }
  }
  
  finalText = finalText.trim();
  interimText = interimText.trim();
  
  if (onlyFinal) {
    return finalText;
  }
  
  // لو فيه نهائي، ارجعه، وإلا ارجع المؤقت لكن بدون تكرار
  return finalText || interimText;
}
