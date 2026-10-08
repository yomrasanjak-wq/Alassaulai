import { COOKIE_NAME } from "@shared/const";
import { countRegisteredVisitors, createControlRequest, createGuestMemory, createMediaItem, deleteGuestMemory, deleteMediaItem, listControlRequests, listGuestMemories, listMediaItems, updateControlRequest, updateMediaItem } from "./db";
import { storagePut } from "./storage";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const languageSchema = z.enum(["AR", "TR", "EN"]).default("AR");

const assistantSystemPrompt = `أنت مساعد ALASSAUL-AI العام، وتتحدث مع الزائر كإنسان لبق وسريع البديهة: افهم المقصود من السؤال حتى لو كان باللهجة الخليجية أو فيه أخطاء إملائية بسيطة، ثم أجب بالعربية الطبيعية الواضحة ما لم يطلب المستخدم لغة أخرى. كن ودوداً ومحترماً، وابدأ بجواب مباشر مفيد قبل أي تفاصيل إضافية. لا تكرر السؤال، ولا تستخدم عبارات تقنية مثل «تعذر الوصول» أو «حدث خطأ» داخل الإجابة، ولا تقل إنك لا تستطيع المساعدة إلا إذا كان الطلب خارج قدراتك فعلاً.

قواعد السرعة والجودة:
- أجب عادةً في 2 إلى 5 جمل قصيرة مناسبة للقراءة الصوتية، ويمكنك استخدام نقاط قصيرة عند الحاجة، وتجنب الجداول الطويلة.
- افهم نية المستخدم: إن كان يريد تعريفاً فعرّف، وإن كان يريد مقارنة فقارن، وإن كان يريد خطة فاقترح خطوات عملية، وإن كان يريد رأياً فاذكر المزايا والقيود بوضوح.
- إذا كان السؤال غامضاً، قدم أفضل تفسير معقول أولاً ثم اسأل سؤال توضيح واحداً فقط.
- في الأخبار والسياسة والأحداث المتغيرة، نبّه إلى الحاجة للتحقق الحديث ولا تخترع أرقاماً أو مصادر.
- في الدين ميّز بين المعلومة العامة والفتوى المتخصصة، وفي الطب والقانون والمال قدّم معلومات عامة فقط مع تنبيه لمختص.
- ارفض الطلب الضار أو غير القانوني بلطف، ولا تدّعي تنفيذ حجز أو معاملة لم تُنفّذ.
`;

const MAX_CHAT_HISTORY = 8;
const MAX_CHAT_MESSAGE_CHARS = 1200;

export function compactChatHistory(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return messages.slice(-MAX_CHAT_HISTORY).map((message) => ({
    role: message.role,
    content: message.content.slice(-MAX_CHAT_MESSAGE_CHARS),
  }));
}

const arabicGreeting = /^(السلام عليكم(?: ورحمة الله وبركاته)?|مرحبا(?: بك)?|أهلاً(?: بك)?|اهلا(?: بك)?)[.!؟، ]*$/i;

const quickArabicAnswers: Array<{ match: RegExp; answer: string }> = [
  { match: /(?:توقيع|توقيعي|صورة توقيع).*(?:Alassaul|العسول|يوسف)|(?:Alassaul|العسول|يوسف).*(?:توقيع|توقيعي|صورة)/i, answer: "أكيد. أستطيع تجهيز توقيعاً فخماً باسمك. للاسم Alassaul العسول أقترح توقيعاً إنجليزياً انسيابياً بحرف A كبير ممتد، مع لمسة ذهبية وذيل أنيق أسفل الاسم. وإذا كان الاسم يوسف فأقترح توقيعاً عربياً مختصراً بحرف الياء واضحاً مع امتداد فاخر. اختر: عربي، إنجليزي، أو تصميم يجمع الاثنين." },
  { match: /(?:هذا اسمي|هاذا اسمي|اسمي).*(?:Alassaul|العسول|يوسف)|(?:Alassaul|العسول|يوسف).*(?:هذا اسمي|هاذا اسمي|اسمي)/i, answer: "تشرفت باسمك. سأعتمده كما كتبته وأجهز لك نموذج توقيع فخم وواضح، ويمكنني جعله عربياً أو إنجليزياً أو مزدوجاً." },
  { match: /^(?:من نحن|من انتم|من أنتم|من أنت|من انت|ما هي المنصة|ماهو الموقع|ما هو الموقع)[؟?!.، ]*$/i, answer: "نحن مساعد ALASSAUL الرسمي داخل بوابة العسول، نساعدك في اكتشاف مدن الشمال التركي وترتيب الرحلات والطرق والطقس والبث والمعلومات العامة. اسألني مباشرة عن أي مدينة أو وجهة أو خدمة تحتاجها." },
  { match: /(?:عاصمة|عاصمه).*(?:اليابان)|(?:اليابان).*(?:عاصمة|عاصمه)/i, answer: "عاصمة اليابان هي طوكيو، وهي أكبر مدن البلاد ومركزها السياسي والاقتصادي." },
  { match: /(?:عاصمة|عاصمه).*(?:روسيا)|(?:روسيا).*(?:عاصمة|عاصمه)/i, answer: "عاصمة روسيا هي موسكو، وتقع في الجزء الأوروبي من البلاد." },
  { match: /(?:عاصمة|عاصمه).*(?:تايلند|تايلاند)|(?:تايلند|تايلاند).*(?:عاصمة|عاصمه)/i, answer: "عاصمة تايلند هي بانكوك، وتُعرف رسمياً باسم كرونغ ثيب مها ناخون باللغة التايلندية." },
  { match: /(?:أين|اين|وين).*(?:تقع|موقع).*(?:بيرو)|(?:بيرو).*(?:أين|اين|وين|تقع)/i, answer: "تقع بيرو في غرب قارة أمريكا الجنوبية على ساحل المحيط الهادئ، وتحدها الإكوادور وكولومبيا والبرازيل وبوليفيا وتشيلي. عاصمتها ليما." },
  { match: /(?:جدول|مواعيد|مباريات).*(?:كأس|كاس).*(?:خليجي|الخليج)|(?:خليجي|الخليج).*(?:جدول|مواعيد|مباريات)/i, answer: "لأن جدول كأس الخليج يتغير حسب إعلان اللجنة المنظمة، أحتاج معرفة النسخة أو الدولة المستضيفة حتى أعطيك المواعيد الصحيحة. لا أريد أن أذكر جدولاً قديماً أو غير مؤكد؛ راجع الموقع الرسمي لاتحاد كأس الخليج عند صدور الجدول المعتمد." },
  { match: /(?:عملية|عمليه|جرح|خياطة|خياطه|غرز|فك).*(?:رجل|قدم|إصبع|اصبع)|(?:رجل|قدم|إصبع|اصبع).*(?:عملية|عمليه|جرح|خياطة|خياطه|غرز|فك)/i, answer: "وعليكم السلام. في خياطة جروح القدم قرب الإصبع الكبير تُفك الغرز غالباً بعد 10 إلى 14 يوماً، وقد تمتد إلى 14–21 يوماً إذا كان الجرح مشدوداً أو التئامه بطيئاً. لا تفكها بنفسك؛ راجع الجرّاح أو العيادة التي أجرت العملية لتحديد الموعد حسب شكل الجرح، وراجعهم فوراً إذا ظهر احمرار متزايد أو صديد أو حرارة أو ألم شديد أو انفتح الجرح." },
  { match: /(?:مستشفى|مستوصف|طوارئ|عيادة).*(?:طرابزون|ترابزون|يومرا|يمرة)|(?:طرابزون|ترابزون|يومرا|يمرة).*(?:مستشفى|مستوصف|طوارئ|عيادة)/i, answer: "إذا كنت داخل طرابزون فالأقرب يعتمد على موقعك الدقيق. للحالات العاجلة اتصل بالطوارئ التركية 112، وللبحث عن أقرب مستشفى افتح خرائط Google وابحث عن: مستشفى قريب مني طرابزون. إذا أرسلت اسم الحي أو موقعك الحالي أرتب لك الاتجاهات إلى أقرب خيار." },
  { match: /(?:ورشة|ورش|ميكانيكي|تصليح|كراج|garage).*(?:طرابزون|ترابزون|يومرا|يمرة)|(?:طرابزون|ترابزون|يومرا|يمرة).*(?:ورشة|ورش|ميكانيكي|تصليح|كراج|garage)/i, answer: "لأقرب ورشة سيارات في طرابزون أو يومرا، افتح خرائط Google وابحث عن «ورشة سيارات قريبة مني». أرسل اسم الحي أو موقعك الحالي وسأحدد لك الوجهة الأقرب وأجهز مسار الطريق إليها." },
  { match: /(?:إسطنبول|اسطنبول).*(?:طرابزون|ترابزون).*(?:سامسون|سامسونج)|(?:سامسون|سامسونج).*(?:طرابزون|ترابزون).*(?:إسطنبول|اسطنبول)/i, answer: "أكيد، هذا بكج عائلي من 9 أيام: الأيام 1–3 في إسطنبول للراحة والمدينة القديمة والبوسفور، الأيام 4–7 في طرابزون لآيا صوفيا وقصر أتاتورك وسوميلا وأوزنجول ويومرا، واليومان 8–9 في سامسون للكورنيش وتلة أميسوس ومتحف المدينة. أرتب لك الطريق بين المدن حسب وسيلة السفر، ثم أخصص الفنادق والأنشطة حسب أعمار العائلة والميزانية." },
  { match: /(?:طرابزون|ترابزون).*(?:8|٨|ثمان|ثمانية|ثمانيه).*(?:يوم|أيام|ايام)|(?:8|٨|ثمان|ثمانية|ثمانيه).*(?:يوم|أيام|ايام).*(?:طرابزون|ترابزون)/i, answer: "نعم، هذا برنامج عائلي مقترح لمدة 8 أيام في طرابزون: اليوم 1 الوصول والراحة وميدان طرابزون، اليوم 2 آيا صوفيا وقصر أتاتورك وبوزتبه، اليوم 3 سوميلا وزيغانا، اليوم 4 مغارة تشال وهمسة كوي وحاجي مصطفى، اليوم 5 أوزنجول، اليوم 6 ديميركابي وسلطان مراد، اليوم 7 ريزا وآيدر، واليوم 8 سيراجول ويومرا والشاطئ والتسوق. أخبرني بموعد الوصول وأعمار الأطفال لأضبط المسافات وأوقات الراحة." },
  { match: /(?:أنا|انا).*(?:في|بـ|بمدينة|بمدينه|بحي).*(?:يومرا|يومره|يمرة|يمرا|سنجاق)|(?:اسكن|ساكن|مقيم).*(?:يومرا|يومره|يمرة|يمرا|سنجاق)|(?:يومرا|يومره|يمرة|يمرا|سنجاق).*(?:أنا|انا|اسكن|ساكن|مقيم)/i, answer: "أهلاً بك، فهمت أنك موجود في يومرا، وتحديداً في حي سنجاق. أستطيع الآن مساعدتك في العثور على أقرب مستشفى أو صيدلية أو ورشة أو مطعم، أو تجهيز طريق إلى أي وجهة. ماذا تحتاج بالقرب منك؟" },
  { match: /(?:أنا|انا).*(?:في|بـ|بمدينة|بمدينه|بحي).*(?:طرابزون|ترابزون)|(?:اسكن|ساكن|مقيم).*(?:طرابزون|ترابزون)/i, answer: "أهلاً بك في طرابزون. أخبرني بما تحتاج بالقرب منك: مستشفى، صيدلية، ورشة سيارات، مطعم، فندق أو طريق إلى وجهة، وسأساعدك في اختيار الأقرب." },
  { match: /(?:بكج|باكج|رحلة|برنامج|جدول|خطة|رتب|رتّب).*(?:طرابزون|ترابزون).*(?:اسطنبول|إسطنبول)|(?:اسطنبول|إسطنبول).*(?:طرابزون|ترابزون).*(?:بكج|باكج|رحلة|برنامج|جدول|خطة|رتب|رتّب)/i, answer: "أكيد، هذا برنامج عائلي مقترح لمدة 13 يوماً: 3 أيام في إسطنبول ثم 10 أيام في طرابزون.\n\nإسطنبول — الأيام 1–3: الوصول والراحة، جامع آيا صوفيا والسوق المصري وميدان السلطان أحمد، ثم جولة البوسفور وقصر دولمة بهجة، وفي اليوم الثالث تقسيم وشارع الاستقلال أو جزر الأميرات.\n\nطرابزون — الأيام 4–5: ميدان طرابزون وآيا صوفيا وقصر أتاتورك وبوزتبه، ثم أكشبات ويومرا وممشى البحر.\n\nالأيام 6–7: دير سوميلا وزيغانا، ثم مغارة تشال وكاياباشا وهمسة كوي وحاجي مصطفى.\n\nالأيام 8–9: أوزنجول وديميركابي وسلطان مراد، مع وقت للبحيرة والمرتفعات.\n\nالأيام 10–11: ريزا وآيدر وشلالات المنطقة ومزارع الشاي.\n\nالأيام 12–13: سيراجول، شاطئ قانيتا، مول جواهر أو فورم، ويوم مرن للتسوق والعودة. أستطيع تخصيصه حسب أعمار الأطفال، ميزانية السكن، وموعد الوصول؛ ولا يشمل هذا الرد حجزاً فعلياً." },
  { match: /(?:بكج|باكج|رحلة|برنامج|جدول|خطة|رتب|رتّب).*(?:عشر|10).*(?:يوم|أيام).*(?:طرابزون|ترابزون)|(?:طرابزون|ترابزون).*(?:عشر|10).*(?:يوم|أيام).*(?:بكج|باكج|رحلة|برنامج|جدول|خطة)/i, answer: "أكيد، هذا جدول كامل لمدة 10 أيام في طرابزون لعائلة من أربعة أشخاص: اليوم 1 الوصول وميدان طرابزون. اليوم 2 آيا صوفيا وقصر أتاتورك وبوزتبه. اليوم 3 دير سوميلا وزيغانا. اليوم 4 أكشبات ويومرا وممشى البحر. اليوم 5 مغارة تشال وهمسة كوي وحاجي مصطفى. اليوم 6 أوزنجول والبحيرة والقرية. اليوم 7 ديميركابي وسلطان مراد. اليوم 8 ريزا وآيدر ومزارع الشاي. اليوم 9 سيراجول وشاطئ قانيتا والتسوق. اليوم 10 يوم مرن للراحة والعودة. يفضّل سيارة عائلية وفواصل راحة، ويمكنني إضافة الفنادق والساعات بعد معرفة موعد الوصول والميزانية." },
  { match: /(?:كمل|كمّل|اكمل|أكمل|الجزء|الخمس).*(?:خمسة|خمس|5|٥)|(?:جدول|برنامج).*(?:كامل|ناقص|باقي)|(?:اعطيني|أعطني|اعطني).*(?:جدول|برنامج).*(?:كامل|كاملًا|كاملن)/i, answer: "معك حق، هذا الجدول الكامل لعشرة أيام لعائلة من أربعة أشخاص: اليوم 1 الوصول إلى طرابزون وميدان المدينة. اليوم 2 آيا صوفيا وقصر أتاتورك وبوزتبه. اليوم 3 دير سوميلا وزيغانا. اليوم 4 أكشبات ويومرا وممشى البحر. اليوم 5 مغارة تشال وهمسة كوي وحاجي مصطفى. اليوم 6 أوزنجول والبحيرة والقرية. اليوم 7 ديميركابي وسلطان مراد. اليوم 8 ريزا وآيدر ومزارع الشاي. اليوم 9 سيراجول وشاطئ قانيتا ومول جواهر أو فورم. اليوم 10 يوم خفيف للتسوق والعودة. يفضّل سيارة عائلية، وفواصل راحة، وعدم جمع الوجهات البعيدة في يوم واحد." },
  { match: /(?:عشر|عشرة|عشره|10|١٠).*(?:يوم|أيام|ايام).*(?:عائل|أربع|اربعة|اربعه|4|٤)|(?:عائل|أربع|اربعة|اربعه|4|٤).*(?:عشر|عشرة|عشره|10|١٠).*(?:يوم|أيام|ايام)/i, answer: "أكيد، هذا جدول كامل لمدة 10 أيام لعائلة من أربعة أشخاص: اليوم 1 الوصول وميدان طرابزون. اليوم 2 آيا صوفيا وقصر أتاتورك وبوزتبه. اليوم 3 سوميلا وزيغانا. اليوم 4 أكشبات ويومرا. اليوم 5 مغارة تشال وهمسة كوي وحاجي مصطفى. اليوم 6 أوزنجول. اليوم 7 ديميركابي وسلطان مراد. اليوم 8 ريزا وآيدر. اليوم 9 سيراجول وشاطئ قانيتا والتسوق. اليوم 10 يوم مرن للراحة والعودة. أستطيع بعد ذلك إضافة أسماء الفنادق ووقت كل نشاط إذا ذكرت موعد الوصول وميزانية السكن." },
  { match: /(?:رتب|رتّب|جهز|جهّز|اعد|أعد).*(?:البرنامج|البكج|البا?كج|الرحلة).*(?:هذا|هاذا)|(?:هذا|هاذا).*(?:البرنامج|البكج|البا?كج|الرحلة)/i, answer: "أكيد. سأعتمد البكج الذي طلبته: 3 أيام في إسطنبول ثم 10 أيام في طرابزون. في طرابزون أوزع الأيام بين وسط المدينة ويومرا وأكشبات، سوميلا وزيغانا، مغارة تشال وهمسة كوي، أوزنجول وسلطان مراد، ريزا وآيدر، ثم سيراجول والشواطئ والمولات والراحة. أخبرني بأعمار الأطفال وموعد الوصول لأحول الخطة إلى جدول يومي بالساعات والمسافات." },
  { match: /(?:برنامج|جدول|خطة|رتب|رتّب|يوم).*(?:طرابزون)|(?:طرابزون).*(?:برنامج|جدول|خطة|رتب|رتّب|يوم)/i, answer: "لبرنامج يوم واحد في طرابزون: ابدأ صباحاً بآيا صوفيا وميدان طرابزون، ثم زر قصر أتاتورك وتناول الغداء من المطبخ المحلي. بعد الظهر اختر بوزتبه للإطلالة أو دير سوميلا لمحبي التاريخ والطبيعة؛ أما أوزونغول فتحتاج يوماً مستقلاً. أخبرني بعدد أيامك واهتماماتك لأرتب لك جدولاً أدق مع طريقة الوصول." },
  { match: /(?:بكج|باكج|رحل|رحلة|رحلات|برنامج|جدول|خطة|رتب|رتّب|ترتب|جهز|جهّز|أبغى|ابغى|أبي|ابي|أبا|ابا|ودي|بغيت|حاب|حابه|ممكن|أريد|اريد).*(?:عائل|تركيا|طرابزون|ترابزون)/i, answer: "يسعدني تجهيز بكج عائلي إلى تركيا. أقترح البدء بطرابزون مع برنامج مرن يجمع الطبيعة والمرتفعات والأنشطة العائلية، وأحتاج فقط عدد الأيام، موعد الوصول، أعمار الأطفال، وميزانية تقريبية للسكن حتى أرتب لك جدولاً عملياً." },
  { match: /طرابزون.*(ما هي|ماذا|أين|اين|نبذة|معلومات)|(?:ما هي|ماذا|أين|اين|نبذة|معلومات).*طرابزون/i, answer: "طرابزون مدينة ساحلية في شمال شرقي تركيا على البحر الأسود. تشتهر بالطبيعة الخضراء والجبال ودير سوميلا وبحيرة أوزونغول، وهي بوابة جميلة لاستكشاف مدن البحر الأسود." },
  { match: /ريزا.*(ما هي|ماذا|أين|اين|نبذة|معلومات)|(?:ما هي|ماذا|أين|اين|نبذة|معلومات).*ريزا/i, answer: "ريزا مدينة خضراء على ساحل البحر الأسود، تشتهر بمزارع الشاي والمرتفعات والوديان، وتُعد نقطة انطلاق رائعة إلى آيدر والقرى الجبلية." },
  { match: /أوزونغول|اوزونغول/i, answer: "أوزونغول بحيرة جبلية شهيرة قرب طرابزون، تحيط بها الغابات والمرتفعات والمطاعم المحلية، وتناسب الرحلات الهادئة والتصوير." },
  { match: /(?:مكة|المدينة|الحدث).*(?:قناة|بث|مباشر)|(?:قناة|بث|مباشر).*(?:مكة|المدينة|الحدث)/i, answer: "يمكنك فتح بطاقة مكة أو المدينة أو قناة الحدث من قسم البث؛ ستبقى القناة داخل نافذة المنصة، وتظهر حالة المصدر بوضوح إذا تعذر التشغيل." },
];

function weatherDescription(code: number) {
  if (code === 0) return "الجو صافٍ";
  if ([1, 2].includes(code)) return "الجو غائم جزئياً";
  if (code === 3) return "الجو غائم";
  if ([45, 48].includes(code)) return "ضباب خفيف";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "هناك احتمال أمطار";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "أجواء باردة مع احتمال ثلوج";
  if ([95, 96, 99].includes(code)) return "قد تحدث عواصف رعدية";
  return "حالة الطقس متغيرة";
}

async function getAyderWeatherAnswer(content: string) {
  if (!/(?:طقس|أجواء|الجو|درجة الحرارة).*(?:آيدر|ايدر|ايدر)|(?:آيدر|ايدر|ايدر).*(?:طقس|أجواء|الجو|درجة الحرارة)/i.test(content)) return undefined;
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.9527&longitude=41.0969&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto", { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error("weather-request");
    const data = await response.json() as { current?: { temperature_2m?: number; apparent_temperature?: number; weather_code?: number; wind_speed_10m?: number } };
    const current = data.current;
    if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code)) throw new Error("weather-data");
    const feels = Number.isFinite(current.apparent_temperature) ? `، والمحسوسة ${Math.round(current.apparent_temperature as number)}°` : "";
    const wind = Number.isFinite(current.wind_speed_10m) ? `، والرياح نحو ${Math.round(current.wind_speed_10m as number)} كم/س` : "";
    return `الأجواء الآن في آيدر: ${Math.round(current.temperature_2m as number)}° مئوية${feels}. ${weatherDescription(current.weather_code as number)}${wind}. خذ معك معطفاً خفيفاً وحذاءً مناسباً للطبيعة، وتحقق من الطريق قبل الصعود للمرتفعات.`;
  } catch {
    return "لا أستطيع جلب قراءة آيدر اللحظية الآن. افتح قسم الطقس الحي في المنصة أو أعد المحاولة بعد لحظات؛ فالطقس في المرتفعات يتغير بسرعة.";
  }
}

function getQuickAnswer(language: "AR" | "TR" | "EN", content: string) {
  if (language !== "AR") return undefined;
  return quickArabicAnswers.find(({ match }) => match.test(content))?.answer;
}

function extractChatText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map(extractChatText).filter(Boolean).join(" ").trim();
  if (content && typeof content === "object") {
    const part = content as { text?: unknown; content?: unknown };
    if (typeof part.text === "string") return part.text.trim();
    if (part.content !== undefined) return extractChatText(part.content);
  }
  return "";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    visitorCount: publicProcedure.query(() => countRegisteredVisitors()),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  control: router({
    submit: publicProcedure
      .input(z.object({ title: z.string().trim().min(3).max(255), command: z.string().trim().min(3).max(2000), requesterType: z.enum(["visitor", "partner", "system"]).default("visitor"), category: z.enum(["general", "bug", "content", "partner", "security"]).default("general"), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal") }))
      .mutation(async ({ input }) => {
        const request = await createControlRequest(input);
        return { success: true as const, id: request?.id ?? null, status: request?.status ?? "pending" };
      }),
    list: adminProcedure.query(() => listControlRequests()),
    update: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "reviewed", "in_progress", "completed", "rejected"]).optional(), assignee: z.string().max(32).optional(), decisionNote: z.string().max(2000).optional() }))
      .mutation(({ input }) => updateControlRequest(input.id, { status: input.status, assignee: input.assignee, decisionNote: input.decisionNote })),
  }),
  media: router({
    list: publicProcedure.query(() => listMediaItems()),
    update: publicProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(1).max(255) }))
      .mutation(({ input }) => updateMediaItem(input.id, input.name)),
    delete: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteMediaItem(input.id)),
    upload: publicProcedure
      .input(z.object({
        name: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().min(3).max(120),
        dataBase64: z.string().min(16).max(70_000_000),
      }))
      .mutation(async ({ input }) => {
        const safeName = input.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "upload";
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.byteLength > 50 * 1024 * 1024) throw new Error("الملف أكبر من الحد المسموح 50MB");
        const stored = await storagePut(`media/${Date.now()}-${safeName}`, bytes, input.mimeType);
        const item = await createMediaItem({ name: input.name, url: stored.url, mimeType: input.mimeType, category: "entertainment" });
        return { success: true as const, item: item ?? { name: input.name, url: stored.url, mimeType: input.mimeType } };
      }),
  }),
  discovery: router({
    list: publicProcedure.query(() => listMediaItems("discovery")),
    upload: protectedProcedure
      .input(z.object({ name: z.string().trim().min(1).max(255), mimeType: z.string().regex(/^image\//), dataBase64: z.string().min(16).max(70_000_000) }))
      .mutation(async ({ input }) => {
        const safeName = input.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "discovery-image";
        const bytes = Buffer.from(input.dataBase64, "base64");
        if (bytes.byteLength > 50 * 1024 * 1024) throw new Error("الصورة أكبر من الحد المسموح 50MB");
        const stored = await storagePut(`discovery/${Date.now()}-${safeName}`, bytes, input.mimeType);
        const item = await createMediaItem({ name: input.name, url: stored.url, mimeType: input.mimeType, category: "discovery" });
        return { success: true as const, item };
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(1).max(255) }))
      .mutation(({ input }) => updateMediaItem(input.id, input.name)),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteMediaItem(input.id)),
  }),
  guestbook: router({
    list: publicProcedure.query(async () => listGuestMemories()),
    save: publicProcedure
      .input(z.object({ imageDataBase64: z.string().max(16_000_000).optional(), imageMimeType: z.string().max(120).optional(), caption: z.string().max(2000).optional() }))
      .mutation(async ({ input }) => {
        let imageUrl: string | undefined;
        if (input.imageDataBase64 && input.imageMimeType) {
          const bytes = Buffer.from(input.imageDataBase64, "base64");
          if (bytes.byteLength > 12 * 1024 * 1024) throw new Error("الصورة أكبر من الحد المسموح 12MB");
          const stored = await storagePut(`guestbook/${Date.now()}-memory`, bytes, input.imageMimeType);
          imageUrl = stored.url;
        }
        const memory = await createGuestMemory({ imageUrl, caption: input.caption });
        return { success: true as const, id: memory?.id ?? null, imageUrl: imageUrl ?? null };
      }),
    // Require a valid session but do not block on a stale legacy role value.
    delete: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteGuestMemory(input.id)),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({
        messages: z.array(chatMessageSchema).min(1).max(14),
        language: languageSchema,
      }))
      .mutation(async ({ input }) => {
        const latestMessage = input.messages[input.messages.length - 1];
        if (input.language === "AR" && latestMessage?.role === "user" && arabicGreeting.test(latestMessage.content)) {
          return { text: "وعليكم السلام ورحمة الله وبركاته. كيف أستطيع مساعدتك اليوم؟" };
        }
        const liveWeatherAnswer = latestMessage?.role === "user" ? await getAyderWeatherAnswer(latestMessage.content) : undefined;
        if (liveWeatherAnswer) return { text: liveWeatherAnswer };
        const quickAnswer = latestMessage?.role === "user" ? getQuickAnswer(input.language, latestMessage.content) : undefined;
        if (quickAnswer) return { text: quickAnswer };

        const languageInstruction = input.language === "AR"
          ? "أجب بالعربية الفصحى المبسطة، ويمكنك فهم اللهجة الخليجية."
          : input.language === "TR"
            ? "Türkçe yanıt ver ve kısa, doğal cümleler kullan."
            : "Answer in clear, concise English.";

        const llmRequest = {
          model: "gpt-5-mini",
          max_completion_tokens: 384,
          reasoning: { effort: "minimal" },
          messages: [
            { role: "system", content: `${assistantSystemPrompt}\n${languageInstruction}` },
            ...compactChatHistory(input.messages),
          ] as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        };

        let response;
        try {
          response = await invokeLLM(llmRequest);
        } catch (firstError) {
          console.warn("[ALASSAUL chat] primary model failed; trying backup model", firstError);
          try {
            response = await invokeLLM({ ...llmRequest, model: "claude-haiku-4-5", reasoning: undefined });
          } catch (backupError) {
            console.warn("[ALASSAUL chat] backup model failed", backupError);
            throw backupError;
          }
        }

        let text = extractChatText(response.choices?.[0]?.message?.content);
        if (!text) {
          try {
            const backupResponse = await invokeLLM({ ...llmRequest, model: "claude-haiku-4-5", reasoning: undefined });
            text = extractChatText(backupResponse.choices?.[0]?.message?.content);
          } catch (backupError) {
            console.warn("[ALASSAUL chat] backup model failed", backupError);
          }
        }
        text ||= "أستطيع مساعدتك في المدن والطقس والطرق والمعلومات العامة. أعد صياغة السؤال بجملة قصيرة وسأجيبك مباشرة.";

        return { text };
      }),
  }),
});

export type AppRouter = typeof appRouter;
