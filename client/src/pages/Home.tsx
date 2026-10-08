/**
 * ALASSAUL-AI — ساحل الشمال التحريري
 * This page uses an editorial travel layout: pine green, warm paper, sea blue,
 * asymmetric content columns, concise operational statuses, and calm motion.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ChatComposer } from "@/components/ChatComposer";
import { AssistantReply, type VoiceGender } from "@/components/AssistantReply";
import { RouteMapCard } from "@/components/RouteMapCard";
import { parseRouteRequest, type RouteRequest } from "@shared/routeRequest";
import { getSeason } from "@shared/season";
import { VoiceSelector } from "@/components/VoiceSelector";
import { NotificationCenter, type AppNotification, type NotificationTone } from "@/components/NotificationCenter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { LiveStatusView } from "@/components/LiveStatusView";
import LiveBroadcastSection from "@/components/LiveBroadcastSection";
import { LivePulse } from "@/components/LivePulse";
import { InteractiveNorthMap } from "@/components/InteractiveNorthMap";
import { getLiveStatusLabel, type LiveStatus } from "@shared/liveStatus";
import { getChatErrorMessage, getLiveFrameMode, getMicrophoneErrorMessage, getSpeechTranscript } from "@shared/interactionFlow";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  Camera,
  Check,
  ChevronDown,
  CircleUserRound,
  Clock3,
  CloudSun,
  Compass,
  ExternalLink,
  Facebook,
  Headphones,
  Heart,
  Image as ImageIcon,
  Instagram,
  Languages,
  Landmark,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Mic,
  Music2,
  Navigation,
  Pause,
  Play,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Ticket,
  TrainFront,
  Tv,
  UserRound,
  UsersRound,
  Upload,
  Video,
  X,
  Youtube,
} from "lucide-react";

const ASSETS = {
  hero: "/manus-storage/alassault-hero_3d308e15.jpg",
  trabzon: "/manus-storage/trabzon-destination_fe7e6b5e.jpg",
  ayder: "/manus-storage/ayder-destination_044ab126.jpg",
  mark: "/manus-storage/alassaul-gold-logo-transparent_29a6ac5c.png",
  officialRobot: "/manus-storage/alassault-official-robot_14d24e05.jpg",
};

const HERO_GALLERY_SETS = [
  {
    main: "/manus-storage/modern-trabzon_5b018134.jpg",
    mainAlt: "جبال وساحل شمال تركيا",
    caption: "بين الغيم والبحر، يبدأ الطريق.",
    side: [
      ["/manus-storage/modern-uzungol_6c33985e.jpg", "بحيرة أوزنجول", "بحيرات ومرتفعات"],
      ["/manus-storage/modern-waterfall_67e18621.jpg", "شلالات الشمال التركي", "شلالات بين الغيم"],
      ["/manus-storage/modern-rize_692c1535.jpg", "مرتفعات ريزا", "أنهار ووديان"],
    ],
  },
  {
    main: "/manus-storage/modern-ayder_26a0dc22.jpg",
    mainAlt: "مرتفعات آيدر الخضراء",
    caption: "هنا تصير الطبيعة وجهتك الأولى.",
    side: [
      ["/manus-storage/modern-rize_692c1535.jpg", "نهر فِرتينا", "ماء يجري بين الجبال"],
      ["/manus-storage/modern-uzungol_6c33985e.jpg", "أوزنجول", "قرية على ضفاف البحيرة"],
      ["/manus-storage/modern-waterfall_67e18621.jpg", "شلالات خضراء", "صوت الماء والطبيعة"],
    ],
  },
] as const;

type Language = "AR" | "TR" | "EN";

type DestinationCategory = "قرى ومرتفعات" | "تاريخ وثقافة" | "تسوق وأسواق" | "مقاهٍ ومطاعم" | "حدائق وشواطئ" | "تلفريك وثلج" | "أنشطة ومغامرات";

type CityDestination = {
  name: string;
  category: DestinationCategory;
  mapQuery: string;
  note: string;
};

type City = {
  name: string;
  latin: string;
  region: string;
  image?: string;
  icon: string;
  intro: string;
  places: string[];
  landmarks: string[];
  villages: string[];
  access: string;
  mapQuery: string;
  featured?: CityDestination[];
  destinations: CityDestination[];
};

const destination = (name: string, category: DestinationCategory, mapQuery: string, note: string): CityDestination => ({ name, category, mapQuery, note });
const destinationCategories: DestinationCategory[] = ["قرى ومرتفعات", "تاريخ وثقافة", "تسوق وأسواق", "مقاهٍ ومطاعم", "حدائق وشواطئ", "تلفريك وثلج", "أنشطة ومغامرات"];
const cities: City[] = [
  {
    name: "طرابزون",
    latin: "Trabzon",
    region: "البحر الأسود",
    image: ASSETS.trabzon,
    icon: "01",
    intro: "البحر، الجبال، وأيام تبدأ من ضباب أوزنجول.",
    places: ["أوزنجول", "دير سوميلا", "مرتفعات حيدر نبي", "مطل بوزتبه", "ميدان طرابزون", "همسي كوي"],
    landmarks: ["دير سوميلا التاريخي", "قصر أتاتورك", "مطل بوزتبه", "متحف آيا صوفيا", "بحيرة أوزنجول"],
    villages: ["أوزنجول وتشايكارا", "همسي كوي", "ماچكا", "سورمَنه", "أكشابات"],
    access: "الوصول الأسهل عبر مطار طرابزون؛ يبعد مركز المدينة نحو 10–15 دقيقة بالسيارة، ثم تتفرع الطرق إلى أوزنجول وماچكا والمرتفعات.",
    mapQuery: "Trabzon Turkey",
    featured: [
      destination("همشِكوي", "قرى ومرتفعات", "Hamsikoy Trabzon Turkey", "وجهة جبلية محببة للسائح مع القرية والطبيعة ومذاقات المنطقة."),
      destination("حاجي مصطفى فوق همشِكوي", "مقاهٍ ومطاعم", "Haci Mustafa Hamsikoy Trabzon Turkey", "جلسة ومطعم معروف في طريق همشِكوي؛ يتحقق الزائر من ساعات العمل قبل الانطلاق."),
      destination("أكبر وأحدث زحليقة في يومرا", "أنشطة ومغامرات", "Yomra longest slide Trabzon Turkey", "نشاط حديث في يومرا؛ يتحقق الزائر من التشغيل والموقع الدقيق قبل الزيارة."),
    ],
    destinations: [
      destination("مغارة تشال", "أنشطة ومغامرات", "Cal Cave Trabzon Turkey", "مغارة طبيعية ومسار زيارة؛ يتحقق الزائر من ساعات الدخول وطبيعة الطريق."),
      destination("كاياباشا", "قرى ومرتفعات", "Kayabasi Plateau Trabzon Turkey", "مرتفعات ريفية ومسارات طبيعية؛ يتحقق الزائر من حالة الطريق والطقس."),
      destination("بحيرة سيراجول", "حدائق وشواطئ", "Sera Lake Nature Park Trabzon Turkey", "بحيرة وحديقة طبيعية قرب أكشابات للمشي والجلوس."),
      destination("أطول زحليقة سيراجول", "أنشطة ومغامرات", "Sera Lake longest slide Trabzon Turkey", "نشاط موسمي قرب البحيرة؛ يتحقق الزائر من التشغيل والسلامة قبل الزيارة."),
      destination("الطيران الشراعي في سيراجول", "أنشطة ومغامرات", "Sera Lake paragliding Trabzon Turkey", "نشاط يعتمد على الطقس ومشغلين محليين؛ يجب التأكد من الترخيص والظروف الجوية."),
      destination("شاطئ قانيتا", "حدائق وشواطئ", "Ganita Faroz coastline Trabzon Turkey", "ساحل قانيتا وفاروز للمشي والجلوس والمقاهي."),
      destination("شاطئ يلنجك", "حدائق وشواطئ", "Yalincak Beach Trabzon Turkey", "شاطئ قريب من شرق طرابزون؛ يتحقق الزائر من حالة البحر والخدمات."),
      destination("شارع العرب في بليتلي", "مقاهٍ ومطاعم", "Pelitli Arab Street Trabzon Turkey", "منطقة مطاعم ومقاهٍ في بليتلي؛ يفتح الرابط نتائج الموقع الأقرب."),
      destination("همشِكوي وممشى القرية", "قرى ومرتفعات", "Hamsikoy Trabzon Turkey", "قرية جبلية مع مطاعم ومنتجات محلية وإطلالات ريفية."),
      destination("سانتا خراباط", "تاريخ وثقافة", "Santa Ruins Gumushane Turkey", "آثار وقرى تاريخية في منطقة سانتا؛ الرحلة طويلة وتحتاج تخطيطاً للطرق."),
      destination("سلطان مراد", "قرى ومرتفعات", "Sultan Murat Plateau Trabzon Turkey", "مرتفعات واسعة ومسارات صيفية وثلوج شتوية حسب الموسم."),
      destination("مول جواهر طرابزون", "تسوق وأسواق", "Cevahir Outlet Trabzon Turkey", "مركز تسوق/أوتلت شرق طرابزون؛ يتحقق الزائر من ساعات العمل."),
      destination("ممشى كاشستوس", "حدائق وشواطئ", "Kasustu coastal promenade Yomra Trabzon Turkey", "ممشى ساحلي في كاشستوس قرب يومرا."),
      destination("مرسى القوارب في يومرا", "أنشطة ومغامرات", "Yomra marina Trabzon Turkey", "مرسى وقوارب؛ تتحقق الرحلات البحرية من التشغيل والحجز مسبقاً."),
      destination("حديقة يومرا", "حدائق وشواطئ", "Yomra park Trabzon Turkey", "حديقة ومساحة عائلية قرب الساحل."),
      destination("أكبر وأحدث زحليقة في يومرا", "أنشطة ومغامرات", "Yomra longest slide Trabzon Turkey", "نشاط ترفيهي حديث؛ يتحقق الزائر من الموقع الدقيق والتشغيل قبل الزيارة."),
      destination("أوزنجول", "قرى ومرتفعات", "Uzungol Trabzon Turkey", "بحيرة وقرية ومرتفعات؛ مناسبة للمشي والتصوير والمبيت."),
      destination("مرتفعات حيدر نبي", "قرى ومرتفعات", "Hidirnebi Plateau Trabzon Turkey", "مرتفعات قريبة من طرابزون بإطلالة واسعة ومسارات طبيعية."),
      destination("يومرا", "قرى ومرتفعات", "Yomra Trabzon Turkey", "منطقة ساحلية شرق المركز، مناسبة للمطاعم والمقاهي والوصول السريع."),
      destination("أرسين", "حدائق وشواطئ", "Arsin Sahil Parki Trabzon Turkey", "ساحل وحديقة بحرية شرق طرابزون."),
      destination("سورمنه", "قرى ومرتفعات", "Surmene Trabzon Turkey", "بلدة ساحلية مع أسواق محلية وطرق باتجاه المرتفعات."),
      destination("أراكلي", "حدائق وشواطئ", "Arakli Trabzon Turkey", "ساحل وبلدة هادئة على الطريق الشرقي."),
      destination("دير سوميلا", "تاريخ وثقافة", "Sumela Monastery Trabzon Turkey", "دير تاريخي في وادي ألتندره قرب ماچكا."),
      destination("قصر أتاتورك", "تاريخ وثقافة", "Ataturk Mansion Trabzon Turkey", "مبنى تاريخي وحدائق داخل طرابزون."),
      destination("متحف آيا صوفيا طرابزون", "تاريخ وثقافة", "Hagia Sophia Trabzon Turkey", "متحف وكنيسة بيزنطية تاريخية قرب الساحل."),
      destination("ميدان طرابزون والأسواق", "تسوق وأسواق", "Meydan Trabzon Turkey", "المركز التجاري للمقاهي والأسواق والتنقل داخل المدينة."),
      destination("مول فوروم طرابزون", "تسوق وأسواق", "Forum Trabzon Shopping Mall Turkey", "مركز تسوق كبير قريب من وسط المدينة."),
      destination("ساحل يومرا للمطاعم والمقاهي", "مقاهٍ ومطاعم", "Yomra waterfront restaurants Trabzon Turkey", "واجهة بحرية تضم خيارات طعام ومقاهٍ."),
      destination("حديقة زاغنوس", "حدائق وشواطئ", "Zagnos Valley Park Trabzon Turkey", "حديقة حضرية ومسار هادئ قرب الأسوار التاريخية."),
      destination("شاطئ أكشابات", "حدائق وشواطئ", "Akcaabat beach Trabzon Turkey", "واجهة بحرية ومطاعم كفتة على غرب طرابزون."),
      destination("ممشى أكشابات", "حدائق وشواطئ", "Akcaabat coastal promenade Trabzon Turkey", "ممشى بحري للعائلات والمقاهي والإطلالات."),
      destination("تاريخ أكشابات ومعالمها", "تاريخ وثقافة", "Akcaabat historic center Trabzon Turkey", "مركز البلدة ومعالمها القديمة؛ يتحقق الزائر من أوقات فتح المواقع."),
      destination("حاجي مصطفى فوق همشِكوي", "مقاهٍ ومطاعم", "Haci Mustafa Hamsikoy Trabzon Turkey", "مقهى/مطعم في منطقة همشِكوي؛ يفضّل التحقق من الاسم وساعات العمل قبل الصعود."),
      destination("سوق موللوز", "تسوق وأسواق", "Mollaoglu Market Hamsikoy Trabzon Turkey", "سوق/مطعم موللوز في طريق همشِكوي؛ يتحقق الزائر من الموقع وساعات العمل."),
      destination("مسجد غلبهار خاتون (خانتون)", "تاريخ وثقافة", "Gulbahar Hatun Mosque Trabzon Turkey", "مسجد عثماني تاريخي قرب جسر زاغنوس، ويُعرف محلياً باسم خانتون في بعض التسميات العربية."),
      destination("أكواريوم طرابزون", "أنشطة ومغامرات", "Trabzon Aquarium Turkey", "أكواريوم داخل المدينة؛ يتحقق الزائر من التذاكر وساعات التشغيل."),
      destination("سوق القلعة القديم / بدستان", "تسوق وأسواق", "Bedesten Bazaar Trabzon Turkey", "سوق تاريخي مسقوف قريب من مركز طرابزون القديم."),
      destination("الحديقة النباتية", "حدائق وشواطئ", "Trabzon Botanical Park Turkey", "حديقة نباتية ومسارات خضراء؛ يتحقق الزائر من أوقات الدخول."),
      destination("حديقة الفورم", "حدائق وشواطئ", "Forum Trabzon park Turkey", "مساحات الحديقة والمشي قرب فوروم طرابزون؛ يتحقق الزائر من الموقع والخدمات المتاحة."),
      destination("حديقة الفورميرجي", "حدائق وشواطئ", "Formirci Park Trabzon Turkey", "مرادف الاسم الذي ذكره المستخدم؛ يفتح الرابط نتائج الخريطة للتحقق من الموقع الأقرب."),
      destination("تلفريك/مواقع الثلج في طرابزون", "تلفريك وثلج", "Trabzon cable car snow activities Turkey", "نتائج المواقع الموسمية للتلفريك والثلج؛ يتحقق الزائر من التشغيل والطقس قبل الانطلاق."),
      destination("مركز زيغانا للتزلج", "تلفريك وثلج", "Zigana Ski Center Turkey", "منطقة شتوية للتزلج والثلج جنوب طرابزون."),
      destination("ركوب الخيل في طرابزون", "أنشطة ومغامرات", "Horse riding Trabzon Turkey", "مواقع ركوب الخيل والرحلات الريفية؛ يتأكد الزائر من الحجز والتشغيل قبل الوصول."),
      destination("كارتينغ طرابزون", "أنشطة ومغامرات", "Karting Trabzon Turkey", "نتائج حلبات الكارتينغ المتاحة في المدينة؛ يتحقق الزائر من الموقع وساعات العمل."),
      destination("مركز أوزنجول للأنشطة", "أنشطة ومغامرات", "Uzungol outdoor activities Turkey", "مسارات ومغامرات طبيعية؛ يتحقق الزائر من التشغيل الموسمي قبل الانطلاق."),
    ],
  },
  {
    name: "ريزا",
    latin: "Rize",
    region: "مرتفعات البحر الأسود",
    image: ASSETS.ayder,
    icon: "02",
    intro: "مدرجات الشاي وهدوء أيدر بين الغيم والماء.",
    places: ["مرتفعات أيدر", "شلال بالوفيت", "وادي فرتينا", "قرية تشامليهمشين", "مزارع الشاي"],
    landmarks: ["مرتفعات أيدر", "وادي فرتينا", "قلعة زيل", "شلال بالوفيت", "مزارع الشاي"],
    villages: ["تشامليهمشين", "إيدر", "إكيزدرة", "تشايلي", "وادي فرتينا"],
    access: "من مطار طرابزون تسلك الطريق الساحلي شرقاً إلى ريزا، ثم تصعد عبر تشامليهمشين إلى أيدر والقرى الجبلية.",
    mapQuery: "Rize Turkey",
    destinations: [
      destination("مرتفعات أيدر", "قرى ومرتفعات", "Ayder Plateau Rize Turkey", "أشهر مرتفعات ريزا والينابيع والمسارات الطبيعية."),
      destination("تشامليهمشين", "قرى ومرتفعات", "Camlihemsin Rize Turkey", "بوابة وادي فرتينا وأيدر."),
      destination("وادي فرتينا", "أنشطة ومغامرات", "Firtina Valley Rize Turkey", "وادي للرحلات والرافتنغ مع فرق مرخصة موسمياً."),
      destination("قلعة زيل", "تاريخ وثقافة", "Zilkale Rize Turkey", "قلعة تاريخية فوق وادي فرتينا."),
      destination("شلال بالوفيت", "حدائق وشواطئ", "Palovit Waterfall Rize Turkey", "شلال طبيعي في محيط تشامليهمشين."),
      destination("مزارع شاي ريزا", "أنشطة ومغامرات", "Rize tea gardens Turkey", "مزارع وشرفات شاي بإطلالات ريفية."),
      destination("سوق ريزا وميدان المدينة", "تسوق وأسواق", "Rize city center market Turkey", "أسواق مركزية لمنتجات الشاي والهدايا المحلية."),
      destination("كورنيش ريزا", "حدائق وشواطئ", "Rize coastal promenade Turkey", "واجهة بحرية للمشي والجلوس."),
    ],
  },
  {
    name: "أوردو",
    latin: "Ordu",
    region: "الساحل الأخضر",
    image: "/manus-storage/ordu-city-card_89201cf5.jpg",
    icon: "03",
    intro: "تلفريك يفتح على البحر ومدينة تسير على مهل.",
    places: ["تلفريك أوردو", "مرتفعات بوزتبه", "بحيرة أولوجول", "كورنيش أوردو"],
    landmarks: ["تلفريك بوزتبه", "كورنيش ألتِن أوردو", "جزيرة ياسون", "بحيرة أولوجول", "مرتفعات تشامباشي"],
    villages: ["برشمبه", "كُمرو", "غولكوي", "تشامباشي", "أكوش"],
    access: "الوصول عبر مطار أوردو–جيرسون أو الطريق الساحلي؛ مركز أوردو قريب من المطار، ومنه تتجه الطرق إلى بوزتبه والمرتفعات.",
    mapQuery: "Ordu Turkey",
    destinations: [
      destination("تلفريك بوزتبه", "تلفريك وثلج", "Ordu Boztepe Cable Car Turkey", "تلفريك بإطلالة على أوردو والبحر الأسود."),
      destination("مرتفعات تشامباشي", "قرى ومرتفعات", "Cambasi Plateau Ordu Turkey", "مرتفعات ومنتجع شتوي ومسارات صيفية."),
      destination("بحيرة أولوجول", "حدائق وشواطئ", "Ulugol Nature Park Ordu Turkey", "بحيرة وغابة مناسبة للنزهات."),
      destination("جزيرة ياسون", "تاريخ وثقافة", "Cape Jason Ordu Turkey", "موقع ساحلي تاريخي على الطريق بين أوردو وجيرسون."),
      destination("كورنيش ألتن أوردو", "حدائق وشواطئ", "Altinordu coastline Ordu Turkey", "واجهة للمشي والمقاهي والإطلالة البحرية."),
      destination("سوق أوردو المركزي", "تسوق وأسواق", "Ordu city center market Turkey", "سوق حضري لمنتجات البندق والهدايا."),
      destination("مقاهي بوزتبه", "مقاهٍ ومطاعم", "Boztepe Ordu cafes Turkey", "جلسات بإطلالة بانورامية؛ يتحقق الزائر من ساعات العمل."),
    ],
  },
  {
    name: "سامسون",
    latin: "Samsun",
    region: "بوابة الشمال",
    image: "/manus-storage/samsun-city-card_5e1f092c.jpg",
    icon: "04",
    intro: "كورنيش واسع، تاريخ حديث، ونبض مدينة ساحلية.",
    places: ["كورنيش أتاكوم", "متحف أتاتورك", "حديقة الشرق", "ساحة الجمهورية"],
    landmarks: ["سفينة بانديرما", "تلة أميسوس", "متحف غازي", "كورنيش أتاكوم", "قرية الأمازون"],
    villages: ["ألاچام", "بافرا", "فَتشا", "ترمه", "أيواجيك"],
    access: "تصل إلى المدينة عبر مطار سامسون–تشارشمبا أو القطار والطريق الساحلي، ثم تُرتب الرحلات غرباً وشرقاً من مركز سامسون.",
    mapQuery: "Samsun Turkey",
    destinations: [
      destination("شاطئ أتاكوم", "حدائق وشواطئ", "Atakum Beach Samsun Turkey", "شاطئ طويل وكورنيش ومقاهٍ على الساحل."),
      destination("سفينة بانديرما", "تاريخ وثقافة", "Bandirma Vapuru Museum Samsun Turkey", "متحف بحري ومعلم تاريخي في سامسون."),
      destination("تلة أميسوس", "تاريخ وثقافة", "Amisos Hill Samsun Turkey", "تلة وموقع أثري مع إطلالة على المدينة."),
      destination("قرية الأمازون", "أنشطة ومغامرات", "Amazon Village Samsun Turkey", "منطقة ترفيهية وثقافية قرب الساحل."),
      destination("حديقة الشرق", "حدائق وشواطئ", "East Park Samsun Turkey", "حديقة ساحلية ومساحات للمشي."),
      destination("مول بيازا سامسون", "تسوق وأسواق", "Piazza Samsun Shopping Mall Turkey", "مركز تسوق داخل المدينة."),
      destination("مقاهي كورنيش أتاكوم", "مقاهٍ ومطاعم", "Atakum promenade cafes Samsun Turkey", "منطقة مطاعم ومقاهٍ على الواجهة البحرية."),
    ],
  },
  {
    name: "جيرسون",
    latin: "Giresun",
    region: "الجزيرة الخضراء",
    image: "/manus-storage/giresun-city-card_1c3f9d8e.jpg",
    icon: "05",
    intro: "مدينة صغيرة بطبيعة كثيفة وذاكرة بحرية عميقة.",
    places: ["قلعة جيرسون", "جزيرة جيرسون", "مرتفعات كومبيت", "شاطئ جيرسون"],
    landmarks: ["قلعة جيرسون", "جزيرة جيرسون", "شلال كوزالان والبحيرة الزرقاء", "مرتفعات كومبيت", "متحف جيرسون"],
    villages: ["ديرلي", "كُمبيت", "إسبية", "غوره", "شِبنِكاراهيسار"],
    access: "يُستخدم مطار أوردو–جيرسون للوصول الجوي، ثم يكمل الزائر بالسيارة إلى مركز جيرسون والمرتفعات الداخلية.",
    mapQuery: "Giresun Turkey",
    destinations: [
      destination("جزيرة جيرسون", "تاريخ وثقافة", "Giresun Island Turkey", "جزيرة تاريخية قبالة الساحل؛ يتحقق الزائر من رحلات القوارب."),
      destination("مرتفعات كومبيت", "قرى ومرتفعات", "Kumbet Plateau Giresun Turkey", "مرتفعات وغابات في داخل جيرسون."),
      destination("قلعة جيرسون", "تاريخ وثقافة", "Giresun Castle Turkey", "قلعة وإطلالة على المدينة والبحر."),
      destination("شلال كوزالان والبحيرة الزرقاء", "حدائق وشواطئ", "Kuzalan Waterfall Blue Lake Giresun Turkey", "طبيعة وشلالات ومسارات في محيط ديرلي."),
      destination("شاطئ جيرسون", "حدائق وشواطئ", "Giresun beach Turkey", "واجهة بحرية للمشي والجلوس."),
      destination("سوق جيرسون المركزي", "تسوق وأسواق", "Giresun city center market Turkey", "سوق محلي للبندق والهدايا والطعام."),
      destination("مقاهي ميدان جيرسون", "مقاهٍ ومطاعم", "Giresun city center cafes Turkey", "مقاهٍ ومطاعم وسط المدينة."),
    ],
  },
  {
    name: "أنقرة",
    latin: "Ankara",
    region: "العاصمة",
    image: "/manus-storage/ankara-city-card_b0898c2d.jpg",
    icon: "06",
    intro: "محطة العاصمة: متاحف، تاريخ، وشوارع تعطي الرحلة توازناً.",
    places: ["ضريح أتاتورك", "قلعة أنقرة", "متحف الحضارات", "برج أتاكولي", "ميدان كيزيلاي"],
    landmarks: ["أنِت كابير", "قلعة أنقرة", "متحف حضارات الأناضول", "حمام أونو", "برج أتاكولي"],
    villages: ["بيبازاري", "ناليهان", "غودول", "كزلجاهامام", "إلماداغ"],
    access: "الوصول عبر مطار أسنبوغا أو القطار السريع؛ مركز العاصمة متصل بالمترو والحافلات، والقرى السياحية تحتاج سيارة أو جولة يومية.",
    mapQuery: "Ankara Turkey",
    destinations: [
      destination("أنِت كابير", "تاريخ وثقافة", "Anitkabir Ankara Turkey", "المعلم الوطني الأبرز في العاصمة."),
      destination("قلعة أنقرة", "تاريخ وثقافة", "Ankara Castle Turkey", "قلعة تاريخية وأحياء قديمة وأسواق حرفية."),
      destination("متحف حضارات الأناضول", "تاريخ وثقافة", "Museum of Anatolian Civilizations Ankara Turkey", "متحف تاريخي في منطقة القلعة."),
      destination("برج أتاكولي", "حدائق وشواطئ", "Atakule Ankara Turkey", "برج وإطلالة ومطاعم في تشانكايا."),
      destination("ميدان كيزيلاي", "تسوق وأسواق", "Kizilay Square Ankara Turkey", "مركز مواصلات وتسوق ومقاهٍ."),
      destination("حديقة غنجلِك", "حدائق وشواطئ", "Genclik Park Ankara Turkey", "حديقة حضرية ومساحات عائلية."),
      destination("مول أنكا مول", "تسوق وأسواق", "AnkaMall Ankara Turkey", "مركز تسوق كبير قريب من أنقرة القديمة."),
      destination("مقاهي تونالي حلمي", "مقاهٍ ومطاعم", "Tunali Hilmi cafes Ankara Turkey", "شارع معروف بالمقاهي والمطاعم."),
    ],
  },
  {
    name: "إسطنبول",
    latin: "Istanbul",
    region: "بوابة الوصول",
    image: "/manus-storage/istanbul-city-card_a8d8c53f.jpg",
    icon: "07",
    intro: "البداية التي لا تشبه النهاية؛ البوسفور دائماً لديه قصة.",
    places: ["آيا صوفيا", "مسجد السلطان أحمد", "البوسفور", "قصر توب كابي", "جزر الأميرات"],
    landmarks: ["آيا صوفيا", "جامع السلطان أحمد", "قصر توبكابي", "البازار الكبير", "رحلة البوسفور"],
    villages: ["شيلا", "أغوا", "بولونيزكوي", "ريفا", "أورتاكوي"],
    access: "تصل عبر مطار إسطنبول أو صبيحة؛ استخدم المترو والعبّارات داخل المدينة، وسيارة أو حافلة للقرى الساحلية والريفية.",
    mapQuery: "Istanbul Turkey",
    destinations: [
      destination("آيا صوفيا", "تاريخ وثقافة", "Hagia Sophia Istanbul Turkey", "معلم تاريخي في السلطان أحمد."),
      destination("جامع السلطان أحمد", "تاريخ وثقافة", "Blue Mosque Sultanahmet Istanbul Turkey", "جامع تاريخي مميز في قلب السلطان أحمد."),
      destination("قصر توبكابي", "تاريخ وثقافة", "Topkapi Palace Istanbul Turkey", "قصر ومتحف تاريخي مطل على البوسفور."),
      destination("برج غلطة", "تاريخ وثقافة", "Galata Tower Istanbul Turkey", "إطلالة بانورامية على القرن الذهبي والبوسفور."),
      destination("قصر دولما بهجة", "تاريخ وثقافة", "Dolmabahce Palace Istanbul Turkey", "قصر عثماني فخم على ضفة البوسفور."),
      destination("البازار الكبير", "تسوق وأسواق", "Grand Bazaar Istanbul Turkey", "سوق تاريخي للتسوق والحرف والهدايا."),
      destination("السوق المصري", "تسوق وأسواق", "Spice Bazaar Istanbul Turkey", "سوق التوابل والهدايا قرب أمينونو."),
      destination("رحلة البوسفور", "أنشطة ومغامرات", "Bosphorus cruise Istanbul Turkey", "رحلة بحرية؛ يتحقق الزائر من المرسى والجدول."),
      destination("جزر الأميرات", "حدائق وشواطئ", "Princes Islands Istanbul Turkey", "رحلة بحرية ووجهة هادئة خارج مركز المدينة."),
      destination("حديقة أميرغان", "حدائق وشواطئ", "Emirgan Park Istanbul Turkey", "حديقة واسعة وإطلالات جميلة على البوسفور."),
      destination("شيلا وأغوا", "قرى ومرتفعات", "Sile Agva Istanbul Turkey", "ساحل وقرى طبيعية مناسبة لرحلة يومية."),
      destination("بولونيزكوي", "قرى ومرتفعات", "Polonezkoy Istanbul Turkey", "قرية خضراء ومطاعم ريفية مناسبة للعائلة."),
      destination("شارع الاستقلال والمقاهي", "مقاهٍ ومطاعم", "Istiklal Street Istanbul Turkey", "شارع مركزي للمطاعم والمقاهي والتسوق."),
      destination("مول جواهر إسطنبول", "تسوق وأسواق", "Cevahir Mall Istanbul Turkey", "مركز تسوق كبير قريب من شبكة المترو."),
      destination("أكواريوم إسطنبول", "أنشطة ومغامرات", "Istanbul Aquarium Florya Turkey", "أكواريوم عائلي ومسار ترفيهي قرب فلوريا."),
    ],
  },
  {
    name: "جورجيا",
    latin: "Georgia",
    region: "الامتداد القريب",
    image: "/manus-storage/batumi-city-card_ddde7a34.jpg",
    icon: "08",
    intro: "باتومي على بُعد رحلة قصيرة من الساحل الشمالي.",
    places: ["باتومي بوليفارد", "تلفريك باتومي", "الساحة الأوروبية", "حديقة النباتات"],
    landmarks: ["باتومي بوليفارد", "تلفريك أَرغو", "الساحة الأوروبية", "حديقة باتومي النباتية", "قلعة غونيو"],
    villages: ["غونيو", "كفارياتي", "ساربي", "ماخونتسيتي", "متسفاني كونتسخي"],
    access: "الوصول البري المعتاد من جهة هوبا عبر منفذ سارب الحدودي، أو جواً إلى مطار باتومي؛ تحقق من متطلبات الحدود قبل التحرك.",
    mapQuery: "Batumi Georgia",
    destinations: [
      destination("باتومي بوليفارد", "حدائق وشواطئ", "Batumi Boulevard Georgia", "واجهة بحرية طويلة وحدائق ومقاهٍ."),
      destination("تلفريك أَرغو", "تلفريك وثلج", "Argo Cable Car Batumi Georgia", "تلفريك بإطلالة على باتومي والبحر."),
      destination("الساحة الأوروبية", "تاريخ وثقافة", "Europe Square Batumi Georgia", "ساحة مركزية للمعالم والمشي."),
      destination("حديقة باتومي النباتية", "حدائق وشواطئ", "Batumi Botanical Garden Georgia", "حديقة واسعة على الساحل شمال باتومي."),
      destination("قلعة غونيو", "تاريخ وثقافة", "Gonio Fortress Georgia", "قلعة تاريخية قرب الحدود الساحلية."),
      destination("غونيو وكفارياتي", "قرى ومرتفعات", "Gonio Kvariati Georgia", "شواطئ وقرى ساحلية جنوب باتومي."),
      destination("ميدان باتومي والمقاهي", "مقاهٍ ومطاعم", "Batumi Piazza Georgia", "ميدان مركزي للمطاعم والمقاهي."),
      destination("ساربي والمنفذ الحدودي", "أنشطة ومغامرات", "Sarpi Georgia border", "نقطة حدودية؛ يجب التحقق من متطلبات الدخول قبل التحرك."),
    ],
  },
];

const liveChannels = [
  {
    id: "makkah",
    title: "مكة المكرمة",
    subtitle: "المصدر الرسمي لقناة القرآن من مكة",
    color: "gold",
    image: "/manus-storage/makkah-live_95f47b7d.jpg",
    video: "",
    sourceUrl: "https://www.youtube.com/channel/UCos52azQNBgW63_9uDJoPDA",
    sourceType: "official-page" as const,
  },
  {
    id: "madina",
    title: "المدينة المنورة",
    subtitle: "المصدر الرسمي لقناة السنة النبوية من المدينة",
    color: "green",
    image: "/manus-storage/madina-live_40412085.jpg",
    video: "",
    sourceUrl: "https://www.youtube.com/@SaudiSunnahTv/streams",
    sourceType: "official-page" as const,
  },
  {
    id: "hadath",
    title: "قناة الحدث",
    subtitle: "المصدر الرسمي لقناة الحدث الإخبارية",
    color: "red",
    image: "/manus-storage/hadath-live_712deed8.jpg",
    video: "",
    sourceUrl: "https://www.youtube.com/channel/UCrj5BGAhtWxDfqbza9T9hqA",
    sourceType: "official-page" as const,
  },
];

const partnerServices = ["Northline Hotels", "Karadeniz Table", "Fog & Bean", "Yolcu Rent", "SkyRoute"];

type CameraFeed = {
  title: string;
  meta: string;
  cameraId: string;
  playerUrl: string;
  streamUrl?: string;
  sourceType?: "hls" | "official-page";
  image: string;
};

const cameraFeeds: CameraFeed[] = [
  { title: "مجموعة أوردو", meta: "أكشاتِبه وساحل طاشباشي · بلدية ألتِن أوردو", cameraId: "ordu-group", playerUrl: "https://www.altinordu.bel.tr/sehir-kameralari", sourceType: "official-page", image: ASSETS.ayder },
  { title: "مجموعة طرابزون", meta: "ميدان وبوزتبه وسوميلا وبقية مشاهد البلدية", cameraId: "trabzon-group", playerUrl: "https://www.trabzon.bel.tr/Web/SehirKameralari", sourceType: "official-page", image: ASSETS.hero },
  { title: "مجموعة يومرا", meta: "مركز يومرا والحدائق والأحياء والمرتفعات", cameraId: "yomra-group", playerUrl: "https://www.yomra.bel.tr/Sayfa/13/canli-yayin", sourceType: "official-page", image: ASSETS.ayder },
  { title: "كمرة مسجد أوزنجول", meta: "مشهد المسجد · اختيار Uzungöl من صفحة بلدية طرابزون الرسمية", cameraId: "uzungol-mosque-3049", playerUrl: "https://www.trabzon.bel.tr/Web/SehirKameralari#camera-3049", sourceType: "official-page", image: ASSETS.hero },
  { title: "كمرة بحيرة أوزنجول", meta: "مشهد البحيرة · اختيار Uzungöl من صفحة بلدية طرابزون الرسمية", cameraId: "uzungol-lake-3049", playerUrl: "https://www.trabzon.bel.tr/Web/SehirKameralari#camera-3049", sourceType: "official-page", image: ASSETS.trabzon },
  { title: "كمرة قرية أوزنجول", meta: "مشهد القرية · اختيار Uzungöl من صفحة بلدية طرابزون الرسمية", cameraId: "uzungol-village-3049", playerUrl: "https://www.trabzon.bel.tr/Web/SehirKameralari#camera-3049", sourceType: "official-page", image: ASSETS.ayder },
  { title: "مجموعة سامسون", meta: "نصب أونور وساعات هانه والأرصفة وأميسوس", cameraId: "samsun-group", playerUrl: "https://mobil.samsun.bel.tr/canliizle.html", sourceType: "official-page", image: ASSETS.hero },
  { title: "مجموعة إسطنبول", meta: "كاميرات بلدية إسطنبول السياحية والمرورية", cameraId: "istanbul-group", playerUrl: "https://ibb.istanbul/tum-hizmetler/e-belediye-hizmetleri/e-bilgi/kameralar/", sourceType: "official-page", image: ASSETS.trabzon },
  { title: "كاميرا ميدان تقسيم", meta: "إطلالة مباشرة على ميدان تقسيم وشارع الاستقلال · بلدية إسطنبول", cameraId: "istanbul-taksim", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/taksim-meydan", sourceType: "official-page", image: ASSETS.trabzon },
  { title: "كاميرا كاديكوي", meta: "رصيف كاديكوي وحركة العبارات في الجانب الآسيوي · بلدية إسطنبول", cameraId: "istanbul-kadikoy", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/kadikoy", sourceType: "official-page", image: ASSETS.hero },
  { title: "كاميرا إمينونو", meta: "إمينونو ومصر بازار والواجهة البحرية · بلدية إسطنبول", cameraId: "istanbul-eminonu", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/eminonu", sourceType: "official-page", image: ASSETS.trabzon },
  { title: "كاميرا أناضولو حصاري", meta: "إطلالة على مضيق البوسفور · بلدية إسطنبول", cameraId: "istanbul-anadolu-hisari", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/anadolu-hisari", sourceType: "official-page", image: ASSETS.hero },
  { title: "كاميرا تلة تشامليجا", meta: "مشهد إسطنبول والبوسفور من تلة تشامليجا · بلدية إسطنبول", cameraId: "istanbul-buyuk-camlica", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/buyuk-camlica", sourceType: "official-page", image: ASSETS.ayder },
  { title: "كاميرا أوسكودار", meta: "واجهة أوسكودار وبرج الفتاة · بلدية إسطنبول", cameraId: "istanbul-uskudar", playerUrl: "https://istanbuluseyret.ibb.istanbul/tr/turistik-kamera/uskudar", sourceType: "official-page", image: ASSETS.trabzon },
  { title: "مجموعة ريزا وآيدر", meta: "تشامليهمشين وآيدر · بوابة البلدية الرسمية", cameraId: "rize-ayder-group", playerUrl: "https://camlihemsin.bel.tr/", sourceType: "official-page", image: ASSETS.ayder },
];

const copy: Record<Language, Record<string, string>> = {
  AR: {
    navExplore: "استكشف الشمال",
    navLive: "مباشر الآن",
    navMap: "الخريطة",
    navEntertainment: "رفّه رحلتك",
    navAbout: "عن البوابة",
    language: "اللغة",
    login: "دخول الحساب",
    eyebrow: "بوابتك اليومية إلى شمال تركيا",
    heroTitle: "اكتشف شمال تركيا بطريقة أذكى.",
    heroDesc: "خريطة واحدة، وجهات موثوقة، كاميرات رسمية، ومساعد ذكي يرافق يومك قبل أن تسأل.",
    explore: "اكتشف وجهتك",
    viewLive: "شاهد الكاميرات",
    askAssistant: "اسأل المساعد",
    searchPlaceholder: "ابحث عن مدينة، معلم، أو طريق…",
    searchHint: "جرّب: أوزنجول، طرابزون، مطاعم قريبة",
    liveNow: "مباشر الآن",
    dailyPulse: "نبض يومك",
    prayer: "مواقيت الصلاة",
    weather: "طقس طرابزون",
    currency: "سعر الصرف",
    calendar: "التقويم الهجري",
    citiesLabel: "محرر الوجهات",
    citiesTitle: "ثماني محطات، ومئات الحكايات.",
    citiesDesc: "اختر مدينة، وسنرتب لك ما يستحق أن يُرى أولاً.",
    places: "أماكن تستحق التوقف",
    mapLabel: "الخريطة الحيّة",
    mapTitle: "ارسم يومك على الخريطة.",
    mapDesc: "مواقع المدن والمرتفعات والأنشطة قريبة منك دائماً.",
    openMap: "افتح Google Maps",
    camerasLabel: "عين الشمال",
    camerasTitle: "شاهد الطريق قبل أن تسلكه.",
    camerasDesc: "كاميرات مباشرة للميادين والبحيرات والمرتفعات — مع تنبيه واضح عند الحاجة إلى مصدر خارجي.",
    entertainmentLabel: "بعد يوم طويل",
    entertainmentTitle: "رفّه رحلتك بين مشهد وصوت ولعبة.",
    entertainmentDesc: "مساحة أخف للصور، المقاطع، الصوتيات، والألعاب القصيرة.",
    visitorsLabel: "دفتر الذاكرة",
    visitorsTitle: "اترك صورة من الطريق.",
    visitorsDesc: "صورة، كلمة، أو لحظة لا تريد أن تضيع بين ألبومات الهاتف.",
    guestbook: "افتح دفتر الزوار",
    partnersLabel: "شبكة محلية",
    partnersTitle: "شركاء يعرفون الشمال من الداخل.",
    partnersDesc: "فنادق ومطاعم ومقاهٍ وتأجير سيارات وحجوزات سفر — عبر تنسيق السكرتير.",
    controlLabel: "خلف الكواليس",
    controlTitle: "غرفة تحكم تجعل المنصة يقظة.",
    controlDesc: "مسارات منفصلة للسكرتير، المعاونين، فريق IT، والـ CEO لمراجعة الطلبات والاحتياجات.",
    enterControl: "دخول غرفة التحكم",
    chatTitle: "مساعد ALASSAUL",
    chatIntro: "اسألني عن مدينة، رحلة، مواقيت، أو طريق.",
    chatPlaceholder: "اكتب سؤالك هنا…",
    send: "إرسال",
    footer: "بوابة الشمال التركي — معرفة محلية، في إيقاع واحد.",
  },
  TR: {
    navExplore: "Kuzeyi keşfet",
    navLive: "Şimdi canlı",
    navMap: "Harita",
    navEntertainment: "Yolculuğunu renklendir",
    navAbout: "Portal hakkında",
    language: "Dil",
    login: "Hesaba giriş",
    eyebrow: "Kuzey Türkiye'ye günlük kapınız",
    heroTitle: "Kuzey Türkiye'yi daha akıllıca keşfet.",
    heroDesc: "Tek bir harita, güvenilir destinasyonlar, resmi kameralar ve gününüze eşlik eden akıllı asistan.",
    explore: "Keşfe başla",
    viewLive: "Canlı yayını izle",
    askAssistant: "Asistana sor",
    searchPlaceholder: "Şehir, yer veya yol ara…",
    searchHint: "Örnek: Uzungöl, Trabzon, yakın restoran",
    liveNow: "Şimdi canlı",
    dailyPulse: "Günün ritmi",
    prayer: "Namaz vakitleri",
    weather: "Trabzon hava durumu",
    currency: "Döviz kuru",
    calendar: "Hicri takvim",
    citiesLabel: "Destinasyon editörü",
    citiesTitle: "Sekiz durak, yüzlerce hikâye.",
    citiesDesc: "Bir şehir seç, önce görülmeye değer olanları düzenleyelim.",
    places: "Durmaya değer yerler",
    mapLabel: "Canlı harita",
    mapTitle: "Gününü haritada çiz.",
    mapDesc: "Şehirler, yaylalar ve aktiviteler her zaman yakınında.",
    openMap: "Google Maps'i aç",
    camerasLabel: "Kuzeyin gözü",
    camerasTitle: "Yola çıkmadan yolu gör.",
    camerasDesc: "Meydanlar, göller ve yaylalardan canlı kameralar.",
    entertainmentLabel: "Uzun bir günden sonra",
    entertainmentTitle: "Manzara, ses ve oyunla yolculuğunu renklendir.",
    entertainmentDesc: "Fotoğraf, video, ses ve kısa oyunlar için daha hafif bir alan.",
    visitorsLabel: "Hafıza defteri",
    visitorsTitle: "Yoldan bir fotoğraf bırak.",
    visitorsDesc: "Bir görüntü veya cümle, telefondaki albümler arasında kaybolmasın.",
    guestbook: "Ziyaretçi defterini aç",
    partnersLabel: "Yerel ağ",
    partnersTitle: "Kuzeyi içeriden bilen ortaklar.",
    partnersDesc: "Oteller, restoranlar, kafeler, araç kiralama ve seyahat rezervasyonları.",
    controlLabel: "Perde arkası",
    controlTitle: "Portalın uyanık kalmasını sağlayan kontrol odası.",
    controlDesc: "Sekreter, yardımcılar, IT ve CEO için ayrı iş akışları.",
    enterControl: "Kontrol odasına gir",
    chatTitle: "ALASSAUL Asistanı",
    chatIntro: "Şehir, rota, vakit veya gezi hakkında sor.",
    chatPlaceholder: "Sorunu buraya yaz…",
    send: "Gönder",
    footer: "Kuzey Türkiye portalı — yerel bilgi, tek ritimde.",
  },
  EN: {
    navExplore: "Explore the north",
    navLive: "Live now",
    navMap: "The map",
    navEntertainment: "Enrich your trip",
    navAbout: "About the portal",
    language: "Language",
    login: "Account login",
    eyebrow: "Your daily gateway to northern Turkey",
    heroTitle: "Discover northern Turkey, smarter.",
    heroDesc: "One map, trusted destinations, official cameras, and a smart assistant that travels with your day.",
    explore: "Discover a destination",
    viewLive: "Watch the cameras",
    askAssistant: "Ask the assistant",
    searchPlaceholder: "Search a city, landmark, or route…",
    searchHint: "Try: Uzungol, Trabzon, nearby restaurants",
    liveNow: "Live now",
    dailyPulse: "Your daily pulse",
    prayer: "Prayer times",
    weather: "Trabzon weather",
    currency: "Exchange rate",
    calendar: "Hijri calendar",
    citiesLabel: "Destination editor",
    citiesTitle: "Eight stops, hundreds of stories.",
    citiesDesc: "Pick a city and we will arrange what deserves to be seen first.",
    places: "Places worth a pause",
    mapLabel: "The live map",
    mapTitle: "Draw your day on the map.",
    mapDesc: "Cities, highlands and activities are always close at hand.",
    openMap: "Open Google Maps",
    camerasLabel: "The north's eye",
    camerasTitle: "See the road before you take it.",
    camerasDesc: "Live cameras from squares, lakes and highlands.",
    entertainmentLabel: "After a long day",
    entertainmentTitle: "Enrich the trip with scene, sound and play.",
    entertainmentDesc: "A lighter space for photos, clips, audio and short games.",
    visitorsLabel: "Memory book",
    visitorsTitle: "Leave a picture from the road.",
    visitorsDesc: "A frame or a sentence that should not disappear among phone albums.",
    guestbook: "Open guest book",
    partnersLabel: "Local network",
    partnersTitle: "Partners who know the north from within.",
    partnersDesc: "Hotels, restaurants, cafés, car rentals and travel bookings — coordinated by the secretary.",
    controlLabel: "Behind the scenes",
    controlTitle: "A control room that keeps the portal awake.",
    controlDesc: "Separate workflows for the secretary, assistants, IT team and CEO.",
    enterControl: "Enter control room",
    chatTitle: "ALASSAUL Assistant",
    chatIntro: "Ask about a city, route, prayer time or trip.",
    chatPlaceholder: "Write your question here…",
    send: "Send",
    footer: "Northern Turkey portal — local knowledge, one rhythm.",
  },
};

function SectionHeading({ eyebrow, title, desc, light = false }: { eyebrow: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div className={`section-heading ${light ? "section-heading-light" : ""}`}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}

function StatusDot({ label, tone = "green" }: { label: string; tone?: "green" | "gold" | "red" }) {
  return (
    <span className={`status-pill status-${tone}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

type ChatMessage = { from: "user" | "assistant"; text: string; route?: RouteRequest };

type MemoryCard = { id: number; pair: string; label: string; flipped: boolean; matched: boolean };

const MEMORY_PAIRS = [
  ["sea", "بحر"],
  ["mountain", "جبل"],
  ["mosque", "مسجد"],
  ["forest", "غابة"],
  ["coffee", "قهوة"],
  ["castle", "قلعة"],
] as const;

function createMemoryCards(): MemoryCard[] {
  return [...MEMORY_PAIRS, ...MEMORY_PAIRS]
    .map(([pair, label], index) => ({ id: index, pair, label, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [heroGalleryIndex] = useState(() => Math.floor(Math.random() * HERO_GALLERY_SETS.length));
  const heroGallery = HERO_GALLERY_SETS[heroGalleryIndex];
  const [language, setLanguage] = useState<Language>("AR");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [activeSection, setActiveSection] = useState<"cities" | "live" | "map" | "partners" | "entertainment">("cities");
  const [modal, setModal] = useState<"login" | "live" | "camera" | "city" | "place" | "visitors" | "entertainment" | "control" | "map" | null>(null);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [discoveryIndex, setDiscoveryIndex] = useState(0);
  const [discoveryImageLoaded, setDiscoveryImageLoaded] = useState(false);
  const [modalData, setModalData] = useState<Record<string, string>>({});
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [selectedPlace, setSelectedPlace] = useState<CityDestination | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("loading");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() => {
    if (typeof window === "undefined") return "male";
    return window.localStorage.getItem("alassault-voice-gender") === "female" ? "female" : "male";
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { from: "assistant", text: "أهلاً بك. أنا مساعد ALASSAUL — اسألني عن مدن الشمال أو رتّب ليومك القادم." },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const visitorImageInputRef = useRef<HTMLInputElement>(null);
  const entertainmentInputRef = useRef<HTMLInputElement>(null);
  const discoveryInputRef = useRef<HTMLInputElement>(null);
  const [visitorImage, setVisitorImage] = useState<string | null>(null);
  const [visitorFile, setVisitorFile] = useState<File | null>(null);
  const [visitorCaption, setVisitorCaption] = useState("");
  const [selectedGuestImage, setSelectedGuestImage] = useState<{ url: string; alt: string } | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<Array<{ id: number; name: string; url: string; kind: "video" | "audio" | "image" }>>([]);
  const [mediaUploadMessage, setMediaUploadMessage] = useState("");
  const [discoveryUploadMessage, setDiscoveryUploadMessage] = useState("");
  const [entertainmentMode, setEntertainmentMode] = useState<"video" | "audio" | "game">("video");
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>(() => createMemoryCards());
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [editingMediaId, setEditingMediaId] = useState<number | null>(null);
  const [editingMediaName, setEditingMediaName] = useState("");
  const [editingDiscoveryId, setEditingDiscoveryId] = useState<number | null>(null);
  const [editingDiscoveryName, setEditingDiscoveryName] = useState("");
  const [controlCommand, setControlCommand] = useState("");
  const [controlTitle, setControlTitle] = useState("طلب يحتاج متابعة");
  const [controlCategory, setControlCategory] = useState<"general" | "bug" | "content" | "partner" | "security">("general");
  const [controlPriority, setControlPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [controlAssignee, setControlAssignee] = useState<"CEO" | "السكرتير" | "IT">("CEO");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = copy[language];
  const auth = useAuth();
  const prayerTicker = language === "AR"
    ? ["اللهم صل وسلم على نبينا محمد", "سبحان الله وبحمده، سبحان الله العظيم", "اللهم افتح لنا أبواب رحمتك", "رب اشرح لي صدري ويسر لي أمري", "اللهم احفظ المسافرين وردهم سالمين"]
    : language === "TR"
      ? ["Allah'ım, Peygamberimiz Muhammed'e salât ve selâm eyle", "Sübhanallahi ve bihamdihi, Sübhanallahil azim", "Allah'ım, rahmet kapılarını bize aç", "Rabbim, göğsümü genişlet ve işimi kolaylaştır", "Allah'ım yolcuları koru ve onları selametle döndür"]
      : ["O Allah, send blessings and peace upon Prophet Muhammad", "Glory be to Allah and praise Him", "O Allah, open for us the doors of Your mercy", "My Lord, ease my heart and make my journey easy", "O Allah, protect travelers and return them safely"];
  const fallbackDiscoverySlides = [
    { src: "/manus-storage/modern-trabzon_5b018134.jpg", alt: "جبال وساحل الشمال التركي", title: "بين الغيم والبحر", note: "الشمال التركي يبدأ من المشهد الأول." },
    { src: "/manus-storage/modern-uzungol_6c33985e.jpg", alt: "بحيرة أوزنجول", title: "أوزنجول", note: "بحيرة وقرية ومرتفعات في يوم واحد." },
    { src: "/manus-storage/modern-waterfall_67e18621.jpg", alt: "شلالات الشمال التركي", title: "شلالات بين الغيم", note: "طبيعة خضراء وماء لا ينقطع." },
    { src: "/manus-storage/modern-rize_692c1535.jpg", alt: "مرتفعات ريزا", title: "ريزا", note: "وادي هادئ للرحلات والمغامرة." },
    { src: "/manus-storage/modern-ayder_26a0dc22.jpg", alt: "مرتفعات آيدر", title: "آيدر", note: "مرتفعات خضراء وهواء بارد." },
    { src: "/manus-storage/modern-giresun_708e9435.jpg", alt: "غيرسون", title: "غيرسون", note: "ساحل هادئ وطبيعة خضراء على البحر الأسود." },
    { src: "/manus-storage/modern-ordu_c3cfc3f6.jpg", alt: "أوردو", title: "أوردو", note: "تلفريك وساحل واسع وإطلالة من بوزتبه." },
    { src: "/manus-storage/modern-samsun_d76727ee.jpg", alt: "سامسون", title: "سامسون", note: "واجهة بحرية ومتنزهات ورحلات عائلية." },
    { src: "/manus-storage/modern-istanbul_76b1898b.jpg", alt: "إسطنبول", title: "إسطنبول", note: "البوسفور، الأسواق، والتاريخ في مدينة واحدة." },
    { src: "/manus-storage/modern-batumi_30577a97.jpg", alt: "باتومي جورجيا", title: "باتومي", note: "امتداد ساحلي قريب بحدائق وتلفريك وبحر." },
  ];
  const dir = language === "AR" ? "rtl" : "ltr";
  const season = getSeason();
  const chatMutation = trpc.ai.chat.useMutation();
  const controlMutation = trpc.control.submit.useMutation();
  const controlRequestsQuery = trpc.control.list.useQuery(undefined, { staleTime: 10_000, enabled: modal === "control" && Boolean(auth.user) });
  const controlUpdateMutation = trpc.control.update.useMutation({ onSuccess: () => void controlRequestsQuery.refetch() });
  const mediaUploadMutation = trpc.media.upload.useMutation();
  const mediaItemsQuery = trpc.media.list.useQuery(undefined, { staleTime: 30_000 });
  const mediaUpdateMutation = trpc.media.update.useMutation();
  const mediaDeleteMutation = trpc.media.delete.useMutation();
  const discoveryItemsQuery = trpc.discovery.list.useQuery(undefined, { staleTime: 30_000 });
  const discoveryUploadMutation = trpc.discovery.upload.useMutation();
  const discoveryUpdateMutation = trpc.discovery.update.useMutation();
  const discoveryDeleteMutation = trpc.discovery.delete.useMutation();
  const guestbookMutation = trpc.guestbook.save.useMutation();
  const guestbookQuery = trpc.guestbook.list.useQuery(undefined, { staleTime: 15_000 });
  const visitorCountQuery = trpc.auth.visitorCount.useQuery(undefined, { staleTime: 30_000 });
  const guestbookDeleteMutation = trpc.guestbook.delete.useMutation({
    onSuccess: () => void guestbookQuery.refetch(),
    onError: (error) => notify("تعذر حذف الذكرى", error.message || "سجّل الدخول ثم حاول مرة أخرى.", "error"),
  });
  const speechRecognitionAvailable = typeof window !== "undefined" && Boolean((window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
  const discoveryWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const freshDiscoverySlides = [
    { src: "/manus-storage/trabzon-lake_75d86830.webp", alt: "بحيرة وقرى طرابزون الحديثة", title: "طرابزون بين البحيرة والغيم", note: "صورة جديدة من مشاهد البحر الأسود والطبيعة الخضراء." },
    { src: "/manus-storage/black-sea-valley_a5f1c21c.jpg", alt: "وادي البحر الأسود", title: "وادي البحر الأسود", note: "طريق عائلي هادئ بين الجبال والمزارع." },
    { src: "/manus-storage/forest-waterfall_0bb5941c.jpg", alt: "شلال في غابات الشمال التركي", title: "شلالات الغابة", note: "ماء وغابة ومنظر مناسب لاستراحة قصيرة." },
    { src: "/manus-storage/uzungol-scenery_94203bd3.jpg", alt: "منظر حديث لأوزنجول", title: "أوزنجول من زاوية جديدة", note: "بحيرة ومرتفعات وقرية تستحق يوماً مستقلاً." },
    { src: "/manus-storage/black-sea-coast_c85892b3.jpg", alt: "ساحل البحر الأسود", title: "ساحل البحر الأسود", note: "مشهد مفتوح لمحبي البحر والطرق الساحلية." },
    { src: "/manus-storage/rize-nature_4eb4bb7c.jpg", alt: "طبيعة ريزا الخضراء", title: "ريزا الخضراء", note: "وديان وشلالات ومزارع شاي في رحلة واحدة." },
  ];
  const discoverySlides = useMemo(() => {
    const uploadedSlides = (discoveryItemsQuery.data ?? []).map((item) => ({
      src: item.url,
      alt: item.name,
      title: item.name.replace(/\.[^/.]+$/, ""),
      note: "صورة مضافة من غرفة التحكم إلى معرض اكتشاف الشمال.",
    }));
    const allSlides = [...uploadedSlides, ...freshDiscoverySlides, ...fallbackDiscoverySlides];
    const uniqueSlides = allSlides.filter((slide, index, list) => list.findIndex((candidate) => candidate.src === slide.src) === index);
    if (!uniqueSlides.length) return fallbackDiscoverySlides;
    const start = discoveryWeek % uniqueSlides.length;
    return uniqueSlides.map((_, index) => uniqueSlides[(start + index) % uniqueSlides.length]);
  }, [discoveryItemsQuery.data, discoveryWeek]);
  useEffect(() => {
    if (!discoveryOpen || !discoveryImageLoaded) return;
    const timer = window.setTimeout(() => {
      setDiscoveryImageLoaded(false);
      setDiscoveryIndex((current) => (current + 1) % discoverySlides.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [discoveryOpen, discoveryImageLoaded, discoverySlides.length, discoveryIndex]);

  useEffect(() => {
    setDiscoveryIndex((current) => discoverySlides.length ? current % discoverySlides.length : 0);
    setDiscoveryImageLoaded(false);
  }, [discoverySlides.length, discoveryWeek]);
  const featuredPartner = partnerServices[cities.findIndex((city) => city.name === selectedCity.name) % partnerServices.length];
  const dismissNotification = React.useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);
  const notify = React.useCallback((title: string, message: string, tone: NotificationTone = "info") => {
    const id = notificationIdRef.current + 1;
    notificationIdRef.current = id;
    setNotifications((current) => [...current.slice(-2), { id, title, message, tone }]);
  }, []);
  const quickPrompts = language === "AR"
    ? activeSection === "live"
      ? [`شغّل بث ${selectedCity.name} إن وجد`, "ما القنوات المباشرة المتاحة الآن؟", "ما الفرق بين مكة والمدينة والحدث؟"]
      : activeSection === "map"
        ? [`خطط ليوم كامل في ${selectedCity.name}`, `ما الطريق الأقرب إلى ${selectedCity.places[0]}؟`, "افتح الخريطة على أقرب وجهة"]
        : activeSection === "partners"
          ? [`نسّق فندقاً أو مطعماً قرب ${selectedCity.name}`, `هل يوجد تأجير سيارات قريب من ${selectedCity.name}؟`, `أخبرني عن شريك ${featuredPartner}`]
          : activeSection === "entertainment"
            ? ["اقترح موسيقى هادئة للطريق", "اختر لي لعبة خفيفة", "ما أفضل فيلم سفر قصير؟"]
            : [`رتب لي برنامجاً في ${selectedCity.name}`, `ما أقرب الأماكن المهمة في ${selectedCity.name}؟`, "افتح لي أفضل بث أو خريطة الآن"]
    : language === "TR"
      ? activeSection === "live"
        ? [`${selectedCity.latin} canlı yayınını aç`, "Şu an hangi kanallar canlı?", "Mekke, Medine ve Haber kanalları arasındaki fark nedir?"]
        : activeSection === "map"
          ? [`${selectedCity.latin} için tam günlük rota planla`, `${selectedCity.places[0]} için en yakın yol hangisi?`, "Haritada en yakın destinasyonu aç"]
          : activeSection === "partners"
            ? [`${selectedCity.latin} yakınında otel veya restoran öner`, `${selectedCity.latin} yakınında araç kiralama var mı?`, `${featuredPartner} hakkında bilgi ver`]
            : activeSection === "entertainment"
              ? ["Yol için sakin müzik öner", "Bana kısa bir oyun seç", "Kısa bir seyahat filmi öner"]
              : [`${selectedCity.latin} için bir gezi planı hazırla`, `${selectedCity.latin} yakınında önemli yerler neler?`, "Harita veya canlı yayın aç"]
      : activeSection === "live"
        ? [`Open a live channel for ${selectedCity.latin}`, "Which channels are live now?", "What is the difference between the three live channels?"]
        : activeSection === "map"
          ? [`Plan a full day in ${selectedCity.latin}`, `What is the closest route to ${selectedCity.places[0]}?`, "Open the nearest destination on the map"]
          : activeSection === "partners"
            ? [`Find a hotel or restaurant near ${selectedCity.latin}`, `Is there car rental near ${selectedCity.latin}?`, `Tell me about ${featuredPartner}`]
            : activeSection === "entertainment"
              ? ["Suggest calm music for the road", "Pick a light game for me", "Recommend a short travel film"]
              : [`Plan an itinerary for ${selectedCity.latin}`, `What are the key places near ${selectedCity.latin}?`, "Open the best map or live channel"];

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    const matches: { city: City; place: string }[] = [];
    cities.forEach((city) => city.places.forEach((place) => {
      if (place.toLowerCase().includes(query) || city.name.toLowerCase().includes(query) || city.latin.toLowerCase().includes(query)) {
        matches.push({ city, place });
      }
    }));
    return matches.slice(0, 6);
  }, [search]);

  useEffect(() => {
    document.documentElement.lang = language === "AR" ? "ar" : language === "TR" ? "tr" : "en";
    document.documentElement.dir = dir;
  }, [language, dir]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    if (!modal) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);

  useEffect(() => {
    if (!mediaItemsQuery.data?.length || mediaLibrary.length) return;
    setMediaLibrary(mediaItemsQuery.data.filter((item) => item.category !== "discovery").map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      kind: item.mimeType.startsWith("video/") ? "video" : item.mimeType.startsWith("audio/") ? "audio" : "image",
    })));
  }, [mediaItemsQuery.data, mediaLibrary.length]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!modal || (modal !== "live" && modal !== "camera") || liveStatus !== "loading" || modalData.sourceType === "official-page") return;
    const timeout = window.setTimeout(() => setLiveStatus("unavailable"), 8000);
    return () => window.clearTimeout(timeout);
  }, [modal, modalData.video, liveStatus]);

  function cycleLanguage() {
    setLanguage((current) => current === "AR" ? "TR" : current === "TR" ? "EN" : "AR");
  }

  function scrollTo(id: string) {
    const sectionMap: Record<string, typeof activeSection> = { cities: "cities", live: "live", map: "map", partners: "partners", entertainment: "entertainment" };
    if (sectionMap[id]) setActiveSection(sectionMap[id]);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileMenu(false);
  }

  function selectSearchResult(result: { city: City; place: string }) {
    setSelectedCity(result.city);
    setSearch("");
    scrollTo("cities");
    notify("تم العثور على الوجهة", `${result.place} — ${result.city.name}`, "success");
  }

  function openPlace(placeName: string) {
    const place = selectedCity.destinations.find((item) => item.name === placeName || item.mapQuery.toLowerCase().includes(placeName.toLowerCase()));
    const resolvedPlace = place ?? destination(placeName, "أنشطة ومغامرات", `${placeName} ${selectedCity.name} Turkey`, `موقع مقترح في ${selectedCity.name}. افتح الخريطة للتحقق من الطريق وساعات الزيارة قبل الانطلاق.`);
    setSelectedPlace(resolvedPlace);
    setModal("place");
    notify("تم فتح تفاصيل المكان", `${resolvedPlace.name} — ${selectedCity.name}`, "success");
  }

  function openLive(channel: typeof liveChannels[number]) {
    if (channel.sourceType === "official-page") {
      window.open(channel.sourceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    setLiveStatus("loading");
    setModalData({ title: channel.title, subtitle: channel.subtitle, video: channel.video, sourceUrl: channel.sourceUrl, streamUrl: "", sourceType: channel.sourceType, image: channel.image });
    setModal("live");
    notify("جاري التحقق من المصدر", `${channel.title} — لن تظهر الحالة كتشغيل إلا بعد التحقق الفعلي.`, "info");
  }

  function openCamera(camera: typeof cameraFeeds[number]) {
    setLiveStatus("loading");
    setModalData({ title: camera.title, subtitle: `${camera.meta} · ${camera.streamUrl ? "بث HLS مؤكد" : "المصدر الرسمي"}`, video: "", sourceUrl: camera.playerUrl, streamUrl: camera.streamUrl || "", sourceType: camera.sourceType || "official-page", cameraId: camera.cameraId });
    setModal("camera");
  }

  function stopLive() {
    setLiveStatus((status) => status === "stopped" ? "loading" : "stopped");
  }

  async function askAssistant(value: string) {
    const trimmed = value.trim();
    if (!trimmed || chatMutation.isPending) return;
    const routeRequest = parseRouteRequest(trimmed) ?? undefined;
    const nextMessages: ChatMessage[] = [...chatMessages, { from: "user", text: trimmed }];
    setChatMessages(nextMessages);
    setChatInput("");
    try {
      const response = await chatMutation.mutateAsync({
        language,
        messages: nextMessages.map((message) => ({ role: message.from as "user" | "assistant", content: message.text })),
      });
      setChatMessages((messages) => [...messages, { from: "assistant", text: response.text, route: routeRequest }]);
      notify("وصل رد المساعد", "يمكنك متابعة الإجابة أو فتح الخريطة إذا كان السؤال عن طريق.", "success");
    } catch (error) {
      console.error("[ALASSAUL chat] request failed", error);
      setChatMessages((messages) => [...messages, { from: "assistant", text: getChatErrorMessage(error) }]);
      notify("تعذر إكمال الطلب", "جرّب مرة أخرى أو اكتب السؤال بصياغة أقصر.", "error");
    }
  }

  function sendChat() {
    void askAssistant(chatInput);
  }

  function startVoice() {
    type RecognitionResult = { [key: number]: { transcript?: string } };
    type RecognitionEvent = { results?: { [key: number]: RecognitionResult; length: number } };
    type Recognition = new () => { lang: string; continuous: boolean; interimResults: boolean; start: () => void; onstart: () => void; onerror: (event: { error?: string }) => void; onresult: (event: RecognitionEvent) => void; onend: () => void };
    const speechWindow = window as Window & { SpeechRecognition?: Recognition; webkitSpeechRecognition?: Recognition };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatMessages((messages) => [...messages, { from: "assistant", text: "التعرف الصوتي العربي يحتاج متصفحاً يدعم Speech Recognition. يمكنك الكتابة الآن، أو فتح المنصة في Chrome أو Edge." }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "AR" ? "ar-SA" : language === "TR" ? "tr-TR" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => {
      setIsListening(false);
      const errorMessage = getMicrophoneErrorMessage(event.error);
      setChatMessages((messages) => [...messages, { from: "assistant", text: errorMessage }]);
    };
    recognition.onresult = (event) => {
      const transcript = getSpeechTranscript(event.results);
      if (!transcript) {
        setChatMessages((messages) => [...messages, { from: "assistant", text: "لم يصلني نص السؤال. تحدث بوضوح بعد ظهور حالة الاستماع ثم حاول مرة أخرى." }]);
        return;
      }
      setChatInput(transcript);
      void askAssistant(transcript);
    };
    recognition.onend = () => setIsListening(false);
    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      console.error("[ALASSAUL speech] could not start recognition", error);
      setChatMessages((messages) => [...messages, { from: "assistant", text: "تعذر بدء الميكروفون. أغلق أي تسجيل صوتي آخر ثم حاول مرة أخرى، أو اكتب سؤالك." }]);
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("الكاميرا غير متاحة في هذا المتصفح. استخدم زر رفع صورة.");
      return;
    }
    try {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      cameraStreamRef.current = stream;
      setCameraOn(true);
      setCameraMessage("الكاميرا تعمل الآن. اسمح بالوصول ثم التقط صورة من تطبيق الكاميرا.");
      requestAnimationFrame(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          void cameraVideoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      setCameraMessage("لم يتم السماح بالكاميرا. يمكنك إضافة صورة من جهازك بدلاً من ذلك.");
    }
  }

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(reader.error ?? new Error("تعذر قراءة الملف"));
      reader.readAsDataURL(file);
    });
  }

  function handleVisitorImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setVisitorFile(file);
    const url = URL.createObjectURL(file);
    setVisitorImage((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return url;
    });
    setCameraMessage(`تم اختيار الصورة: ${file.name}`);
    notify("تم اختيار الصورة", "يمكنك الآن حفظ الذكرى بعد كتابة تعليقك.", "success");
  }

  function resetMemoryGame() {
    setMemoryCards(createMemoryCards());
    setMemoryMoves(0);
    setMemoryLocked(false);
  }

  function handleMemoryCardClick(cardId: number) {
    if (memoryLocked) return;
    const selected = memoryCards.filter((card) => card.flipped && !card.matched);
    const target = memoryCards.find((card) => card.id === cardId);
    if (!target || target.flipped || target.matched || selected.length >= 2) return;
    const opened = memoryCards.map((card) => card.id === cardId ? { ...card, flipped: true } : card);
    setMemoryCards(opened);
    if (selected.length !== 1) return;
    const first = selected[0];
    const second = opened.find((card) => card.id === cardId);
    if (!second) return;
    setMemoryMoves((moves) => moves + 1);
    setMemoryLocked(true);
    window.setTimeout(() => {
      const matched = first.pair === second.pair;
      setMemoryCards((current) => current.map((card) => card.id === first.id || card.id === second.id
        ? { ...card, flipped: matched, matched }
        : card));
      setMemoryLocked(false);
      if (matched && opened.filter((card) => card.matched).length + 2 === opened.length) {
        notify("أحسنت!", "اكتملت لعبة الذاكرة بنجاح.", "success");
      }
    }, 650);
  }

  async function handleEntertainmentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length || entertainmentMode === "game") return;
    setMediaUploadMessage(`جارٍ رفع ${files.length} ملف…`);
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const result = await mediaUploadMutation.mutateAsync({ name: file.name, mimeType: file.type || "application/octet-stream", dataBase64: await readFileAsBase64(file) });
        const item = result.item;
        const savedId = item && "id" in item ? item.id : undefined;
        return { id: savedId ?? -(Date.now() + Math.round(Math.random() * 100000)), name: item?.name ?? file.name, url: item?.url ?? URL.createObjectURL(file), kind: (item?.mimeType ?? file.type).startsWith("video/") ? "video" as const : (item?.mimeType ?? file.type).startsWith("audio/") ? "audio" as const : "image" as const };
      }));
      setMediaLibrary((current) => [...uploaded, ...current]);
      setMediaUploadMessage(`تم حفظ ${files.length} ملف في مكتبة المنصة.`);
      notify("تم رفع الوسائط", `${files.length} ملف محفوظ في قسم ${entertainmentMode === "video" ? "الفيديو" : "الصوتيات"}.`, "success");
    } catch {
      setMediaUploadMessage("تعذر رفع ملف واحد أو أكثر. الحد الأقصى للملف 50MB.");
      notify("تعذر رفع الوسائط", "تحقق من الاتصال أو اختر ملفاً أصغر من 50MB.", "error");
    }
  }

  async function renameMedia(item: { id: number; name: string }) {
    const name = editingMediaName.trim();
    if (!name || editingMediaId !== item.id) return;
    if (item.id > 0) await mediaUpdateMutation.mutateAsync({ id: item.id, name });
    setMediaLibrary((current) => current.map((entry) => entry.id === item.id ? { ...entry, name } : entry));
    setEditingMediaId(null);
    setEditingMediaName("");
    notify("تم تعديل الاسم", "تم تحديث اسم الملف في المكتبة.", "success");
  }

  async function removeMedia(item: { id: number; name: string }) {
    if (item.id > 0) await mediaDeleteMutation.mutateAsync({ id: item.id });
    setMediaLibrary((current) => current.filter((entry) => entry.id !== item.id));
    notify("تمت إزالة الملف", `تم حذف ${item.name} من المعرض.`, "success");
  }

  async function handleDiscoveryUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setDiscoveryUploadMessage(`جارٍ رفع ${files.length} صورة…`);
    try {
      await Promise.all(files.map(async (file) => {
        if (!file.type.startsWith("image/")) throw new Error("image-only");
        await discoveryUploadMutation.mutateAsync({ name: file.name, mimeType: file.type, dataBase64: await readFileAsBase64(file) });
      }));
      await discoveryItemsQuery.refetch();
      setDiscoveryUploadMessage(`تم حفظ ${files.length} صورة. ستدخل الدورة الأسبوعية تلقائياً.`);
      notify("تم تحديث معرض الاكتشاف", `${files.length} صورة جديدة أصبحت متاحة للتدوير الأسبوعي.`, "success");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "تحقق من تسجيل الدخول ونوع الصورة وحجمها.";
      setDiscoveryUploadMessage(`تعذر رفع الصور: ${reason}`);
      notify("تعذر رفع صور المعرض", reason, "error");
    }
  }

  async function renameDiscovery(item: { id: number; name: string }) {
    const name = editingDiscoveryName.trim();
    if (!name || editingDiscoveryId !== item.id) return;
    await discoveryUpdateMutation.mutateAsync({ id: item.id, name });
    await discoveryItemsQuery.refetch();
    setEditingDiscoveryId(null);
    setEditingDiscoveryName("");
    notify("تم تعديل اسم الصورة", "سيظهر الاسم الجديد في بطاقة المعرض.", "success");
  }

  async function removeDiscovery(item: { id: number; name: string }) {
    try {
      await discoveryDeleteMutation.mutateAsync({ id: item.id });
      await discoveryItemsQuery.refetch();
      notify("تم حذف صورة المعرض", `تمت إزالة ${item.name} من الدورة الأسبوعية.`, "success");
    } catch (error) {
      notify("تعذر حذف الصورة", error instanceof Error ? error.message : "تأكد من تسجيل الدخول ثم حاول مرة أخرى.", "error");
    }
  }

  async function submitControlCommand() {
    const command = controlCommand.trim();
    if (!command) {
      notify("اكتب الأمر أولاً", "مثال: أضف معلماً جديداً إلى ريزا.", "warning");
      return;
    }
    try {
      const result = await controlMutation.mutateAsync({ title: controlTitle.trim() || "طلب يحتاج متابعة", command, category: controlCategory, priority: controlPriority, requesterType: "visitor" });
      notify("تم استلام الأمر", result.id ? `تم تسجيل الطلب رقم ${result.id} للمراجعة.` : "تم تسجيل الطلب للمراجعة.", "success");
      setControlCommand("");
      setControlTitle("طلب يحتاج متابعة");
      void controlRequestsQuery.refetch();
    } catch {
      notify("تعذر إرسال الأمر", "تأكد من الاتصال ثم حاول مرة أخرى.", "error");
    }
  }

  async function saveGuestMemory() {
    try {
      const imageDataBase64 = visitorFile ? await readFileAsBase64(visitorFile) : undefined;
      const result = await guestbookMutation.mutateAsync({ imageDataBase64, imageMimeType: visitorFile?.type, caption: visitorCaption });
      notify("تم حفظ الذكرى", result.id ? `تم حفظ الذكرى رقم ${result.id}.` : "تم حفظ الذكرى.", "success");
      await guestbookQuery.refetch();
      setVisitorCaption("");
      setVisitorFile(null);
      setModal(null);
    } catch {
      notify("تعذر حفظ الذكرى", "جرّب صورة أصغر أو تحقق من التخزين.", "error");
    }
  }
  async function removeGuestMemory(id: number) {
    try {
      await guestbookDeleteMutation.mutateAsync({ id });
      await guestbookQuery.refetch();
      notify("تم حذف الذكرى", "تمت إزالة الذكرى من دفتر الزوار.", "success");
    } catch {
      notify("تعذر حذف الذكرى", "الحذف متاح لمسؤول المنصة فقط.", "error");
    }
  }
  async function updateControlStatus(id: number, status: "reviewed" | "in_progress" | "completed" | "rejected") {
    try {
      await controlUpdateMutation.mutateAsync({ id, status, assignee: controlAssignee, decisionNote: status === "reviewed" ? "تمت الموافقة من CEO وإحالته للتنفيذ." : undefined });
      notify("تم تحديث المهمة", status === "completed" ? "تم إغلاق الطلب بعد التنفيذ." : "تم حفظ القرار وتعيين المسؤول.", "success");
    } catch {
      notify("تعذر تحديث المهمة", "تحقق من الاتصال ثم أعد المحاولة.", "error");
    }
  }

  const latestRouteMessage = [...chatMessages].reverse().find((message) => message.route);

  return (
    <main className={`site-shell season-${season}`} dir={dir} data-season={season}>
      <NotificationCenter notifications={notifications} onDismiss={dismissNotification} />
      <div className="topline">
        <div className="container topline-inner">
          <span><span className="live-dot" /> {t.liveNow}: مكة · المدينة · الحدث</span>
          <span className="topline-note">{language === "AR" ? "المعلومة المحلية، في مكان واحد." : language === "TR" ? "Yerel bilgi, tek yerde." : "Local knowledge, in one place."}</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button type="button" className="mobile-menu-button" aria-label={mobileMenu ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={mobileMenu} onClick={() => setMobileMenu((open) => !open)}>{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button>
          <button className="brand" onClick={() => { setMobileMenu(false); scrollTo("top"); }} aria-label="ALASSAUL-AI — بوابتك للشمال التركي">
            <span className="brand-mark-wrap"><img src={ASSETS.mark} alt="" /><i /></span>
            <span className="brand-wordmark"><strong>ALASSAUL-AI</strong><small>بوابتك للشمال التركي</small></span>
          </button>
          <nav className={`main-nav ${mobileMenu ? "main-nav-open" : ""}`} aria-hidden={!mobileMenu}>
            <button onClick={() => { setMobileMenu(false); scrollTo("cities"); }}>{t.navExplore}</button>
            <button onClick={() => { setMobileMenu(false); scrollTo("live"); }}>{t.navLive}</button>
            <button onClick={() => { setMobileMenu(false); scrollTo("map"); }}>{t.navMap}</button>
            <button onClick={() => { setMobileMenu(false); scrollTo("entertainment"); }}>{t.navEntertainment}</button>
            <button onClick={() => { setMobileMenu(false); scrollTo("tiktok"); }}>تيك توك</button>
            <button onClick={() => { setMobileMenu(false); scrollTo("about"); }}>{t.navAbout}</button>
          </nav>
          {mobileMenu && <button type="button" className="mobile-menu-scrim" aria-label="إغلاق القائمة" onClick={() => setMobileMenu(false)} />}
          <div className="header-actions">
            <button className="language-button" onClick={cycleLanguage} title={t.language}><Languages size={16} /><span>{language}</span><ChevronDown size={13} /></button>
            <button className="login-button" onClick={() => setModal("login")}><CircleUserRound size={17} /> <span>{t.login}</span></button>
          </div>
        </div>
      </header>

      <section className="prayer-ticker" aria-label={language === "AR" ? "شريط الأدعية الدينية" : language === "TR" ? "Dini dualar" : "Religious prayers"}>
        <div className="prayer-ticker-label"><Sparkles size={14} /><span>{language === "AR" ? "ذكر ودعاء" : language === "TR" ? "Dua ve zikir" : "Prayer & remembrance"}</span></div>
        <div className="prayer-ticker-window">
          <div className="prayer-ticker-track">
            {[...prayerTicker, ...prayerTicker].map((prayer, index) => <span className="prayer-ticker-item" key={`${prayer}-${index}`}><i />{prayer}</span>)}
          </div>
        </div>
      </section>

      <section id="top" className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="gold-line" /> {t.eyebrow}</div>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroDesc}</p>
            <div className="hero-cta-row">
              <button className="button button-primary" onClick={() => { setDiscoveryImageLoaded(false); setDiscoveryIndex(0); setDiscoveryOpen(true); }}>{t.explore} <ArrowLeft size={17} /></button>
              <button className="button button-quiet camera-hero-button" onClick={() => scrollTo("cameras")}><span className="camera-cta-thumb"><img src={cameraFeeds[0]?.image} alt="" /></span> {t.viewLive}</button>
              <button className="button button-assistant" onClick={() => setChatOpen(true)}><span className="assistant-button-avatar"><img src={ASSETS.officialRobot} alt="" /></span> {t.askAssistant}</button>
            </div>
            <div className="hero-proof"><span><ShieldCheck size={15} /> 8 مدن موثقة</span><span><Clock3 size={15} /> تحديثات يومية</span><span><Sparkles size={15} /> مساعد ذكي</span></div>
          </div>
          <div id="map" className="hero-visual hero-map-replacement" aria-label="الخريطة التفاعلية للشمال التركي">
            <InteractiveNorthMap />
          </div>
        </div>
        <div className="container hero-entry-only" aria-label="مسارات الاستكشاف السريعة">
          <button onClick={() => scrollTo("cities")}><MapPin size={14} /><span><strong>وجهات موثوقة</strong><small>ابدأ من المدينة المناسبة</small></span><ArrowLeft size={13} /></button>
          <button onClick={() => scrollTo("map")}><Navigation size={14} /><span><strong>خريطة يومك</strong><small>رتّب الطريق على الخريطة</small></span><ArrowLeft size={13} /></button>
          <button onClick={() => setChatOpen(true)}><span className="assistant-button-avatar assistant-button-avatar-small"><img src={ASSETS.officialRobot} alt="" /></span><span><strong>مساعد الرحلة</strong><small>اسأل عن الطريق والمكان</small></span><ArrowLeft size={13} /></button>
          <a className="gmail-shortcut" href="https://mail.google.com/mail/u/0/" target="_blank" rel="noreferrer" aria-label="فتح Gmail في تبويب جديد"><span className="gmail-shortcut-icon"><Mail size={18} /></span><span><strong>Gmail</strong><small>افتح بريدك بأمان</small></span><ExternalLink size={13} /></a>
        </div>

      </section>

      <LiveBroadcastSection />

      <LivePulse language={language} onPlanRoute={() => scrollTo("map")} />

      <section id="cities" className="cities-section section-pad">
        <div className="container">
          <SectionHeading eyebrow={t.citiesLabel} title={t.citiesTitle} desc={t.citiesDesc} />
          <div className="cities-layout">
            <aside className="city-rail">
              <div className="rail-title"><span>01—08</span><span>{language === "AR" ? "محطات" : language === "TR" ? "Durak" : "stops"}</span></div>
              {cities.map((city) => <button key={city.name} className={`city-tab ${selectedCity.name === city.name ? "city-tab-active" : ""}`} onClick={() => { setSelectedCity(city); setModal("city"); notify("تم فتح ملف المدينة", `${city.name} — المعالم والقرى والوجهات`, "success"); }}><span className="city-number">{city.icon}</span><span><strong>{city.name}</strong><small>{city.latin}</small></span><ArrowLeft size={15} /></button>)}
            </aside>
            <div className="city-feature">
              <div className="city-feature-image">
                {selectedCity.image ? <img src={selectedCity.image} alt={selectedCity.name} loading="lazy" /> : <div className="city-gradient-art"><Landmark size={60} /><span>{selectedCity.latin}</span></div>}
                <div className="city-feature-label"><span>{selectedCity.region}</span><strong>{selectedCity.latin}</strong></div>
              </div>
              <div className="city-feature-copy"><span className="section-eyebrow">{selectedCity.icon} / {selectedCity.name}</span><h3>{selectedCity.intro}</h3><p>{t.places}</p><div className="place-chips">{selectedCity.places.map((place) => <button key={place} onClick={() => openPlace(place)}><MapPin size={13} /> {place}</button>)}</div><div className="city-feature-actions"><button className="text-link" onClick={() => setModal("city")}>{language === "AR" ? "افتح صفحة المدينة" : language === "TR" ? "Şehir sayfasını aç" : "Open city page"} <ArrowLeft size={16} /></button><button className="text-link" onClick={() => setModal("map")}>{language === "AR" ? "افتح الخريطة" : language === "TR" ? "Haritayı aç" : "Open map"} <MapPin size={16} /></button></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="cameras" className="cameras-section section-pad">
        <div className="container"><SectionHeading eyebrow={t.camerasLabel} title={t.camerasTitle} desc="صور واضحة لكل كمرة؛ اختر المشهد باسمه لفتح المصدر الرسمي المناسب." /><div className="camera-grid camera-group-grid">{cameraFeeds.map((camera, index) => <a key={camera.cameraId} className="camera-card camera-group-card" href={camera.playerUrl} target="_blank" rel="noreferrer" onClick={(event) => { if (camera.streamUrl) { event.preventDefault(); openCamera(camera); } }} aria-label={`${camera.streamUrl ? "تشغيل" : "فتح المصدر الرسمي لـ"} ${camera.title}`}><div className={`camera-thumb camera-direct-art camera-art-${(index % 4) + 1}`}><img className="camera-preview-image" src={camera.image} alt={camera.title} loading="lazy" /><div className="camera-art camera-art-overlay"><Camera size={25} /><span>{camera.title}</span></div><StatusDot label={camera.streamUrl ? "بث مؤكد" : "مصدر رسمي"} /></div><div className="camera-info"><div><small className="camera-label">CAMERA GROUP / 0{index + 1}</small><strong>{camera.title}</strong><small>{camera.meta}</small></div><ExternalLink size={17} /></div></a>)}</div><p className="camera-source-note"><Camera size={14} /> كل بطاقة تحمل اسم الكمرة والمشهد. أوزنجول مقسمة إلى المسجد والبحيرة والقرية والمحيط، وتفتح البطاقات المصدر الرسمي؛ لا نستخدم شارة «بث مباشر» إلا عند تحقق التشغيل داخل المنصة.</p></div>
      </section>

      <section id="entertainment" className="entertainment-section section-pad soft-paper">
        <div className="container entertainment-layout">
          <div><SectionHeading eyebrow={t.entertainmentLabel} title={t.entertainmentTitle} desc={t.entertainmentDesc} /><div className="entertainment-actions"><button onClick={() => setModal("entertainment")}><Play size={18} /><span><strong>مقاطع قصيرة</strong><small>لقطات من الطريق</small></span></button><button onClick={() => setModal("entertainment")}><Headphones size={18} /><span><strong>صوتيات هادئة</strong><small>موسيقى ومقامات</small></span></button><button onClick={() => setModal("entertainment")}><Ticket size={18} /><span><strong>ألعاب خفيفة</strong><small>استراحة ذكية</small></span></button></div></div>
          <div className="memory-collage"><div className="collage-card collage-main"><img src={ASSETS.ayder} alt="مرتفعات أيدر" /><span>صباح أيدر</span></div><div className="collage-card collage-note"><Sparkles size={20} /><strong>كل طريق<br />له إيقاعه.</strong><small>ALASSAUL / 2026</small></div><div className="collage-card collage-photo"><img src={ASSETS.trabzon} alt="أوزنجول" /><span>أوزنجول</span></div></div>
        </div>
      </section>

      <section id="tiktok" className="tiktok-section section-pad">
        <div className="container tiktok-layout">
          <div className="tiktok-profile-card">
            <div className="tiktok-card-heading"><span className="tiktok-profile-icon"><Music2 size={39} strokeWidth={2.8} /></span><span className="tiktok-card-label">الحساب الرسمي · TikTok</span></div>
            <strong className="tiktok-handle">@trabzon_yomra</strong>
            <small className="tiktok-card-meta">طرابزون · يومرا · الشمال التركي</small>
            <div className="tiktok-actions"><a className="button button-primary" href="https://www.tiktok.com/@trabzon_yomra" target="_blank" rel="noreferrer">متابعة الحساب <Music2 size={16} /></a><a className="button button-quiet" href="https://www.tiktok.com/@trabzon_yomra" target="_blank" rel="noreferrer">مشاهدة الفيديوهات <ExternalLink size={15} /></a></div>
          </div>
        </div>
      </section>

      <section id="visitors" className="visitors-section section-pad">
        <div className="container visitors-layout">
          <div className="visitor-frame"><div className="frame-corner frame-corner-tl" /><div className="frame-corner frame-corner-br" /><Camera size={29} /><span>MEMORY LENS</span><strong>التقط اللحظة<br />قبل أن تعود.</strong><small>دفتر الزوار · صورة · رأي</small></div>
          <div className="visitor-copy"><SectionHeading eyebrow={t.visitorsLabel} title={t.visitorsTitle} desc={t.visitorsDesc} /><div className="visitor-visit-counter"><span className="visitor-visit-icon">👤</span><span><strong>{visitorCountQuery.isLoading ? "—" : visitorCountQuery.data ?? 0}</strong><small>زائر سجّل دخوله للمنصة</small></span></div><div className="visitor-login-note"><strong>للتصفح والاستفادة الكاملة</strong><span>سجّل دخولك بحسابك. التصفح العام متاح، أما حفظ الذكريات وإدارتها فيحتاجان إلى تسجيل دخول آمن.</span>{!auth.user ? <button type="button" onClick={() => setModal("login")}>تسجيل الدخول الآن</button> : <small>تم تسجيل دخولك بنجاح.</small>}</div><div className="visitor-quote"><div className="quote-mark">“</div><p>«في أوزنجول، شعرت أن الطريق كان يعرفنا قبل أن نصل.»</p><div className="quote-by"><span className="avatar-dot">أ</span><span><strong>أحمد الغامدي</strong><small>جدة · رحلة 5 أيام</small></span><span className="stars">★★★★★</span></div></div><button className="button button-primary" onClick={() => setModal("visitors")}>{t.guestbook} <Camera size={16} /></button></div>
        </div>
      </section>

      <section id="partners" className="partners-section section-pad dark-section">
        <div className="container"><div className="partners-heading"><SectionHeading light eyebrow={t.partnersLabel} title={t.partnersTitle} desc={t.partnersDesc} /><button className="button button-outline-light" onClick={() => setModal("login")}>تواصل مع السكرتير <ArrowLeft size={15} /></button></div><div className="partner-strip"><div><Landmark size={17} /><span>Northline Hotels</span></div><div><Heart size={17} /><span>Karadeniz Table</span></div><div><CoffeeIcon /><span>Fog & Bean</span></div><div><Navigation size={17} /><span>Yolcu Rent</span></div><div><Ticket size={17} /><span>SkyRoute</span></div></div></div>
      </section>

      <section id="about" className="control-section section-pad">
        <div className="container control-layout"><div className="control-copy"><SectionHeading eyebrow={t.controlLabel} title={t.controlTitle} desc={t.controlDesc} /><div className="control-roles"><span><ShieldCheck size={16} /> CEO</span><span><UsersRound size={16} /> سكرتير</span><span><Settings2 size={16} /> IT</span></div><button className="button button-dark" onClick={() => setModal("control")}>{t.enterControl} <LockKeyhole size={15} /></button></div><div className="control-dashboard"><div className="dashboard-top"><span><span className="green-ping" /> النظام مستقر</span><span>06:42 PM · TR</span></div><div className="dashboard-grid"><div className="dash-number"><small>طلبات اليوم</small><strong>24</strong><span>+18% عن أمس</span></div><div className="dash-number"><small>مدن محدثة</small><strong>08</strong><span>آخر مزامنة الآن</span></div><div className="dash-task"><small>آخر الاحتياجات</small><div><span className="task-dot task-gold" /> تحديث كاميرا أيدر <b>قيد المتابعة</b></div><div><span className="task-dot task-green" /> شريك فندق جديد <b>تمت المراجعة</b></div><div><span className="task-dot task-blue" /> طلب رحلة عائلية <b>جديد</b></div></div></div></div></div>
      </section>

      <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><img src={ASSETS.mark} alt="" /><strong>ALASSAUL-AI</strong><p>{t.footer}</p></div><div className="footer-links"><span>المنصة</span><button onClick={() => scrollTo("cities")}>المدن</button><button onClick={() => scrollTo("live")}>البث المباشر</button><button onClick={() => scrollTo("map")}>الخريطة</button><button onClick={() => scrollTo("tiktok")}>تيك توك</button></div><div className="footer-links"><span>تواصل</span><button onClick={() => setModal("login")}>السكرتير</button><button onClick={() => setModal("control")}>غرفة التحكم</button><button onClick={() => setChatOpen(true)}>المساعد الذكي</button></div><div className="footer-social"><span>تابع الطريق</span><div><a className="social-link" href="https://www.tiktok.com/@trabzon_yomra" target="_blank" rel="noreferrer" aria-label="تيك توك @trabzon_yomra"><Music2 size={17} /></a><button><Instagram size={17} /></button><button><Facebook size={17} /></button><button><Youtube size={17} /></button></div></div></div><div className="container footer-bottom"><span>© 2026 ALASSAUL-AI</span><span>صنع لرحلة أكثر هدوءاً ووضوحاً</span></div></footer>

      <button className="floating-chat" aria-label="chat" onClick={() => setChatOpen((open) => !open)}><span className="floating-chat-avatar"><img src={ASSETS.officialRobot} alt="" /></span><span>اسأل العسول</span></button>
      {chatOpen && <aside className="chat-panel" style={{ left: "12px", right: "12px", insetInlineStart: "auto", insetInlineEnd: "auto", marginInline: "auto", transform: "none" }} aria-label="محادثة مساعد ALASSAUL">
        <div className="chat-header">
          <div><span className="chat-avatar official-robot"><img src={ASSETS.officialRobot} alt="روبوت ALASSAUL الرسمي" /></span><span><strong>المتحدث الرسمي · {t.chatTitle}</strong><small><span className="green-ping" /> {chatMutation.isPending ? "يكتب الآن…" : "متصل الآن"}</small></span></div>
          <button onClick={() => { window.speechSynthesis?.cancel(); setChatOpen(false); }} aria-label="إغلاق المحادثة"><X size={18} /></button>
        </div>
        <div className="chat-statusbar"><span><Sparkles size={13} /> {t.chatIntro}</span><span className="chat-status-live"><span className="green-ping" /> جاهز للرد</span></div>
        <div className="chat-layout">
          <section className="chat-conversation">
            <div className="chat-body">
              <div className="chat-welcome"><Sparkles size={16} /> اسألني عن مدينة، رحلة، مواقيت، أو طريق.</div>
              <VoiceSelector value={voiceGender} onChange={setVoiceGender} />
              <div className="chat-quick-prompts">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => void askAssistant(prompt)} disabled={chatMutation.isPending}>{prompt}</button>)}</div>
              {chatMessages.map((message, index) => <div key={`${message.from}-${index}`} className={`chat-message chat-${message.from}`}><span>{message.text}</span>{message.from === "assistant" && <AssistantReply text={message.text} language={language} voiceGender={voiceGender} />}</div>)}
              {chatMutation.isPending && <div className="chat-message chat-assistant chat-thinking"><span className="thinking-dots">● ● ●</span><small>العسول يكتب بالفصحى…</small></div>}
              <div ref={chatEndRef} />
            </div>
          </section>
          {latestRouteMessage?.route && <section className="chat-route-panel" aria-label="خريطة المسار">
            <div className="chat-route-heading"><span><Navigation size={14} /> خريطة مسارك</span><small>{latestRouteMessage.route.origin || "موقعك الحالي"}</small></div>
            <div className="chat-route-destinations">{latestRouteMessage.route.destinations.map((destination) => <RouteMapCard key={destination} origin={latestRouteMessage.route?.origin} destination={destination} language={language} />)}</div>
          </section>}
        </div>
        <ChatComposer value={chatInput} onChange={setChatInput} onSend={sendChat} onVoice={startVoice} isListening={isListening} voiceSupported={speechRecognitionAvailable} isLoading={chatMutation.isPending} placeholder={t.chatPlaceholder} />
      </aside>}

      {discoveryOpen && <div className="discovery-viewer" role="dialog" aria-modal="true" aria-label="اكتشف الشمال التركي">
        <button className="discovery-close" aria-label="إغلاق معرض الشمال" onClick={() => setDiscoveryOpen(false)}><X size={21} /></button>
        <div className="discovery-progress"><span>اكتشف الشمال التركي</span><strong>{String(discoveryIndex + 1).padStart(2, "0")} / {String(discoverySlides.length).padStart(2, "0")}</strong></div>
        <div className="discovery-stage"><img key={discoverySlides[discoveryIndex].src} src={discoverySlides[discoveryIndex].src} alt={discoverySlides[discoveryIndex].alt} onLoad={() => setDiscoveryImageLoaded(true)} /><div className="discovery-caption"><span>ALASSAUL / BLACK SEA ROUTE</span><h2>{discoverySlides[discoveryIndex].title}</h2><p>{discoverySlides[discoveryIndex].note}</p></div></div>
        <div className="discovery-controls"><button aria-label="الصورة السابقة" onClick={() => { setDiscoveryImageLoaded(false); setDiscoveryIndex((current) => (current - 1 + discoverySlides.length) % discoverySlides.length); }}><ArrowRight size={18} /></button><div className="discovery-dots">{discoverySlides.map((slide, index) => <button key={slide.src} className={index === discoveryIndex ? "active" : ""} aria-label={`عرض ${slide.title}`} onClick={() => { setDiscoveryImageLoaded(false); setDiscoveryIndex(index); }} />)}</div><button aria-label="الصورة التالية" onClick={() => { setDiscoveryImageLoaded(false); setDiscoveryIndex((current) => (current + 1) % discoverySlides.length); }}><ArrowLeft size={18} /></button></div>
      </div>}

      {modal && <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && setModal(null)}><div className={`modal-card ${(modal === "live" || modal === "camera") ? "modal-card-live" : ""}`}>
        <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
        {modal === "login" && <div className="modal-content auth-modal"><div className="modal-icon"><UserRound size={23} /></div><span className="section-eyebrow">ALASSAUL / ACCOUNT</span><h2>ادخل إلى رحلتك.</h2><p>اختر وسيلة الحساب التي تفضّلها، ثم نكمل التحقق عبر بوابة الدخول الآمنة. لا نخزّن كلمة مرور داخل المنصة.</p><div className="auth-methods" role="tablist" aria-label="طريقة الدخول"><button className={loginMethod === "email" ? "auth-method-active" : ""} onClick={() => setLoginMethod("email")} role="tab" aria-selected={loginMethod === "email"}>البريد الإلكتروني<small>حسابك المعتاد</small></button><button className={loginMethod === "phone" ? "auth-method-active" : ""} onClick={() => setLoginMethod("phone")} role="tab" aria-selected={loginMethod === "phone"}>رقم الجوال<small>حساب مرتبط بالجوال</small></button></div><div className="auth-method-note"><Mail size={16} /> {loginMethod === "email" ? "سيتم فتح بوابة الدخول لحساب البريد الإلكتروني." : "سيتم فتح بوابة الدخول للحساب المرتبط برقم الجوال."}</div><button className="button button-primary full-button" onClick={() => { notify("الانتقال إلى الدخول الآمن", "أكمل التحقق في بوابة الحساب الرسمية.", "info"); startLogin(); }}>متابعة الدخول الآمن <ArrowLeft size={16} /></button><button className="modal-text-button" onClick={() => setModal(null)}>ليس الآن</button></div>}
        {modal === "place" && selectedPlace && <div className="modal-content place-detail-modal"><span className="section-eyebrow">PLACE FILE / {selectedCity.latin}</span>{selectedCity.image ? <img className="place-detail-image" src={selectedCity.image} alt={`${selectedCity.name} — ${selectedPlace.name}`} loading="eager" /> : null}<h2>{selectedPlace.name}</h2><p>{selectedPlace.note}</p><div className="place-detail-note"><MapPin size={18} /><div><strong>ما الذي ستجده هنا؟</strong><span>{selectedPlace.category}، مع وصف مختصر يساعدك على اختيار وقت الزيارة والاستعداد للطريق.</span></div></div><div className="place-detail-actions"><button className="button button-primary" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedPlace.mapQuery)}`, "_blank")}>خطط الطريق <Navigation size={15} /></button><button className="button button-quiet" onClick={() => setModal("city")}>دليل المدينة <ArrowLeft size={15} /></button></div></div>}
        {(modal === "live" || modal === "camera") && <div className="modal-content live-modal"><div className="live-modal-preview"><img src={modalData.image} alt={`معاينة ${modalData.title}`} /><span><span className="live-dot" /> بث مباشر · اضغط على المصدر الرسمي للمشاهدة</span></div><LiveStatusView title={modalData.title} subtitle={modalData.subtitle} video={modalData.video} sourceUrl={modalData.sourceUrl ?? ""} streamUrl={modalData.streamUrl || undefined} sourceType={modalData.sourceType as "youtube" | "youtube-channel" | "official-page" | "hls"} status={liveStatus} onReady={() => setLiveStatus("ready")} onUnavailable={() => setLiveStatus("unavailable")} onToggleStop={stopLive} /><div className="video-actions"><button className="button button-quiet" onClick={() => setModal(null)}>إغلاق</button></div></div>}
        {modal === "city" && <div className="modal-content city-detail-modal"><span className="section-eyebrow">CITY FILE / {selectedCity.icon}</span><div className="city-modal-hero">{selectedCity.image ? <img src={selectedCity.image} alt={selectedCity.name} loading="eager" /> : <div className="city-gradient-art"><Landmark size={50} /><span>{selectedCity.latin}</span></div>}<div><span className="section-eyebrow">{selectedCity.region}</span><h2>{selectedCity.name} — {selectedCity.latin}</h2></div></div><p className="city-detail-intro">{selectedCity.intro}</p>{selectedCity.featured?.length ? <div className="featured-destinations"><div className="directory-heading"><div><span className="detail-label"><Sparkles size={14} /> اختياراتنا للسائح</span><h3>ابدأ بهذه الوجهات</h3></div><span className="directory-count">الأبرز</span></div><div className="featured-destination-grid">{selectedCity.featured.map((item) => <a key={item.name} className="featured-destination-card" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`} target="_blank" rel="noreferrer" aria-label={`فتح موقع ${item.name} على الخريطة`}><span><strong>{item.name}</strong><small>{item.note}</small></span><ExternalLink size={16} /></a>)}</div></div> : null}<div className="city-detail-grid"><div><span className="detail-label"><Landmark size={14} /> المعالم</span><ul>{selectedCity.landmarks.map((item) => <li key={item}>{item}</li>)}</ul></div><div><span className="detail-label"><MapPin size={14} /> القرى والامتداد</span><ul>{selectedCity.villages.map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="city-access-box"><Navigation size={18} /><div><strong>الوصول إلى المدينة وما حولها</strong><p>{selectedCity.access}</p></div></div><div className="destination-directory"><div className="directory-heading"><div><span className="detail-label"><MapPin size={14} /> دليل الأماكن والوصول</span><h3>اضغط على أي اسم لفتح موقعه</h3></div><span className="directory-count">{selectedCity.destinations.length} وجهة</span></div>{destinationCategories.map((category) => { const items = selectedCity.destinations.filter((item) => item.category === category); return items.length ? <section className="destination-group" key={category}><h4>{category}</h4><div className="destination-grid">{items.map((item) => <a key={item.name} className="destination-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}`} target="_blank" rel="noreferrer" aria-label={`فتح موقع ${item.name} على الخريطة`}><span><strong>{item.name}</strong><small>{item.note}</small></span><ExternalLink size={15} /></a>)}</div></section> : null; })}</div><div className="city-detail-actions"><button className="button button-primary" onClick={() => setModal("map")}>افتح خريطة المدينة <MapPin size={15} /></button><button className="button button-quiet" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedCity.mapQuery)}`, "_blank")}>خطط الوصول <ExternalLink size={15} /></button></div></div>}
        {modal === "map" && <div className="modal-content"><span className="section-eyebrow">MAP / {selectedCity.latin}</span><h2>{selectedCity.name} على الخريطة.</h2><div className="mini-map"><iframe title="خريطة المدينة" src={`https://www.google.com/maps?q=${encodeURIComponent(selectedCity.mapQuery)}&output=embed`} loading="lazy" /></div><button className="button button-primary full-button" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(selectedCity.mapQuery)}`, "_blank")}>فتح Google Maps <ExternalLink size={15} /></button></div>}
        {modal === "entertainment" && <div className="modal-content entertainment-modal"><span className="section-eyebrow">PLAY / PAUSE / REPEAT</span><h2>استراحة على ذوقك.</h2><p className="entertainment-intro">اختر نوع الاستراحة؛ يظهر المحتوى المختار فقط حتى يبقى المعرض مرتباً وسهل الاستخدام.</p><div className="entertainment-tabs" role="tablist" aria-label="أقسام الاستراحة"><button type="button" className={entertainmentMode === "video" ? "active" : ""} onClick={() => setEntertainmentMode("video")} role="tab" aria-selected={entertainmentMode === "video"}><Play size={19} /><strong>الفيديو</strong><small>مقاطع الشمال</small></button><button type="button" className={entertainmentMode === "audio" ? "active" : ""} onClick={() => setEntertainmentMode("audio")} role="tab" aria-selected={entertainmentMode === "audio"}><Headphones size={19} /><strong>الموسيقى</strong><small>صوتيات الطريق</small></button><button type="button" className={entertainmentMode === "game" ? "active" : ""} onClick={() => setEntertainmentMode("game")} role="tab" aria-selected={entertainmentMode === "game"}><Ticket size={19} /><strong>الألعاب</strong><small>استراحة ذكية</small></button></div>{entertainmentMode !== "game" && <><input ref={entertainmentInputRef} className="visually-hidden" type="file" accept={entertainmentMode === "video" ? "video/*" : "audio/*"} multiple onChange={handleEntertainmentUpload} /><button type="button" className="media-add-button" onClick={() => entertainmentInputRef.current?.click()}><Upload size={17} /> إضافة {entertainmentMode === "video" ? "فيديو" : "موسيقى"}</button>{mediaUploadMessage && <p className="media-upload-status" role="status">{mediaUploadMessage}</p>}{mediaLibrary.filter((item) => item.kind === entertainmentMode).length ? <div className="media-library">{mediaLibrary.filter((item) => item.kind === entertainmentMode).map((item) => <article className="media-library-item" key={item.id}><div className="media-preview">{item.kind === "video" ? <video src={item.url} controls /> : <audio src={item.url} controls />}</div>{editingMediaId === item.id ? <div className="media-edit-row"><input value={editingMediaName} onChange={(event) => setEditingMediaName(event.target.value)} aria-label={`تعديل اسم ${item.name}`} /><div className="media-edit-actions"><button type="button" onClick={() => void renameMedia(item)}>حفظ</button><button type="button" onClick={() => { setEditingMediaId(null); setEditingMediaName(""); }}>إلغاء</button></div></div> : <div className="media-item-footer"><span title={item.name}>{item.name}</span><div className="media-item-actions"><button type="button" aria-label={`تعديل ${item.name}`} onClick={() => { setEditingMediaId(item.id); setEditingMediaName(item.name); }}>تعديل</button><button type="button" aria-label={`حذف ${item.name}`} onClick={() => void removeMedia(item)}>حذف</button></div></div>}</article>)}</div> : <p className="media-empty">لا توجد ملفات في قسم {entertainmentMode === "video" ? "الفيديو" : "الموسيقى"} بعد. اضغط إضافة ليظهر الملف هنا فقط.</p>}</>}{entertainmentMode === "game" && <div className="game-panel"><div className="game-panel-top"><div><div className="game-panel-icon"><Ticket size={28} /></div><h3>لعبة الذاكرة</h3><p>اقلب بطاقتين وابحث عن الصور المتشابهة. لعبة خفيفة تعمل مباشرة داخل المنصة.</p></div><div className="game-score"><strong data-testid="memory-moves">{memoryMoves}</strong><span>محاولة</span></div></div><div className="memory-grid" role="grid" aria-label="لعبة الذاكرة">{memoryCards.map((card) => <button key={card.id} type="button" className={`memory-card ${card.flipped || card.matched ? "is-open" : ""} ${card.matched ? "is-matched" : ""}`} onClick={() => handleMemoryCardClick(card.id)} aria-label={card.flipped || card.matched ? card.label : "بطاقة مخفية"} disabled={memoryLocked || card.flipped || card.matched}><span className="memory-card-back">?</span><span className="memory-card-front">{card.label}</span></button>)}</div><div className="game-panel-actions"><span>{memoryCards.every((card) => card.matched) ? "اكتملت اللعبة، أحسنت!" : "طابق البطاقات المتشابهة"}</span><button type="button" className="button button-primary" onClick={resetMemoryGame}>لعبة جديدة</button></div></div>}</div>}
        {modal === "visitors" && <div className="modal-content"><span className="section-eyebrow">MEMORY LENS / GUESTBOOK</span><h2>صورة، ثم كلمة.</h2><p>فعّل الكاميرا مباشرة، أو اختر صورة محفوظة من الاستوديو/المعرض. سجّل دخولك لحفظ ذكرياتك وإدارتها بأمان.</p><div className="guestbook-count"><strong>{guestbookQuery.data?.length ?? 0}</strong><span>ذكرى محفوظة في دفتر الزوار</span></div><div className="camera-preview">{cameraOn ? <video ref={cameraVideoRef} className="camera-video" autoPlay muted playsInline aria-label="معاينة الكاميرا" /> : visitorImage ? <img className="visitor-image-preview" src={visitorImage} alt="الصورة المختارة للذكرى" /> : <div className="camera-empty"><Camera size={31} /><span>لا توجد صورة بعد</span></div>}</div><div className="visitor-modal-actions"><button className="button button-primary" onClick={startCamera}><Camera size={16} /> {cameraOn ? "الكاميرا تعمل" : "تشغيل الكاميرا"}</button><button className="button button-quiet" onClick={() => visitorImageInputRef.current?.click()}><ImageIcon size={16} /> اختيار من الاستوديو</button></div><input ref={visitorImageInputRef} className="visually-hidden" type="file" accept="image/*" onChange={handleVisitorImage} />{cameraMessage && <p className="camera-message">{cameraMessage}</p>}<textarea value={visitorCaption} onChange={(event) => setVisitorCaption(event.target.value)} placeholder="اكتب رأيك عن الرحلة…" /><button className="button button-dark full-button" onClick={() => void saveGuestMemory()} disabled={guestbookMutation.isPending}><Send size={15} /> {guestbookMutation.isPending ? "جارٍ الحفظ…" : "حفظ الذكرى"}</button><div className="guestbook-memories">{guestbookQuery.isLoading ? <p className="media-empty">جارٍ تحميل الذكريات…</p> : guestbookQuery.data?.length ? guestbookQuery.data.map((memory) => <article className="guestbook-memory" key={memory.id}>{memory.imageUrl ? <button type="button" className="guestbook-memory-image" onClick={() => setSelectedGuestImage({ url: memory.imageUrl!, alt: memory.caption || "ذكرى زائر" })} aria-label={`تكبير صورة الذكرى ${memory.id}`}><img src={memory.imageUrl} alt="ذكرى زائر" loading="lazy" /></button> : <span className="guestbook-memory-placeholder"><ImageIcon size={18} /></span>}<div><p>{memory.caption || "ذكرى من طريق الشمال التركي."}</p><small>{new Date(memory.createdAt).toLocaleDateString("ar-SA")}</small></div>{auth.user ? <button type="button" className="guestbook-delete-button" aria-label={`حذف الذكرى ${memory.id}`} onClick={() => void removeGuestMemory(memory.id)} disabled={guestbookDeleteMutation.isPending}>حذف</button> : <button type="button" className="guestbook-login-delete" onClick={() => setModal("login")}>دخول المسؤول للحذف</button>}</article>) : <p className="media-empty">لا توجد ذكريات محفوظة بعد.</p>}</div>{selectedGuestImage ? <div className="guestbook-lightbox" role="dialog" aria-modal="true" aria-label="عرض صورة الذكرى" onClick={() => setSelectedGuestImage(null)}><button type="button" className="guestbook-lightbox-close" aria-label="إغلاق الصورة" onClick={() => setSelectedGuestImage(null)}><X size={24} /></button><img src={selectedGuestImage.url} alt={selectedGuestImage.alt} onClick={(event) => event.stopPropagation()} /></div> : null}</div>}
        {modal === "control" && <div className="modal-content control-modal">
<span className="section-eyebrow">SECURE AREA / CONTROL ROOM</span><h2>غرفة التحكم التشغيلية.</h2><p>صندوق وارد لطلبات الزوار والشركاء، مع موافقة CEO وتعيين فريق التنفيذ ومتابعة الحالة.</p><div className="control-kpis"><span><strong>{controlRequestsQuery.data?.filter((item) => item.status === "pending").length ?? 0}</strong><small>بانتظار CEO</small></span><span><strong>{controlRequestsQuery.data?.filter((item) => item.status === "in_progress").length ?? 0}</strong><small>قيد التنفيذ</small></span><span><strong>{controlRequestsQuery.data?.filter((item) => item.status === "completed").length ?? 0}</strong><small>مكتملة</small></span></div><div className="control-inbox">{controlRequestsQuery.isLoading ? <p className="media-empty">جارٍ تحميل الطلبات…</p> : controlRequestsQuery.data?.length ? controlRequestsQuery.data.map((request) => <article className={`control-task control-task-${request.priority}`} key={request.id}><div className="control-task-head"><strong>#{request.id} · {request.title}</strong><span className={`control-status control-status-${request.status}`}>{request.status === "pending" ? "بانتظار القرار" : request.status === "reviewed" ? "موافق عليه" : request.status === "in_progress" ? "قيد التنفيذ" : request.status === "completed" ? "مكتمل" : "مرفوض"}</span></div><p>{request.command}</p><small>{request.category} · أولوية {request.priority} · المسؤول: {request.assignee ?? "غير معين"}</small>{request.status !== "completed" && request.status !== "rejected" && <div className="control-task-actions"><button className="button button-quiet" onClick={() => void updateControlStatus(request.id, "reviewed")}>موافقة CEO</button><button className="button button-primary" onClick={() => void updateControlStatus(request.id, "in_progress")}>إحالة للتنفيذ</button><button className="button button-dark" onClick={() => void updateControlStatus(request.id, "completed")}>إغلاق بعد الإصلاح</button><button className="button button-quiet" onClick={() => void updateControlStatus(request.id, "rejected")}>رفض</button></div>}</article>) : <p className="media-empty">لا توجد طلبات بعد. أضف أول طلب من نموذج المهمة أدناه.</p>}</div><div className="discovery-admin-panel">
  <div className="discovery-admin-heading"><div><span className="detail-label"><ImageIcon size={14} /> معرض اكتشف الشمال</span><h3>إدارة الصور والتبديل الأسبوعي</h3><p>ارفع صوراً جديدة أو عدّل أسماءها واحذف المتكرر. يبدأ المعرض كل أسبوع من صورة مختلفة تلقائياً.</p></div><span className="discovery-admin-count">{discoveryItemsQuery.data?.length ?? 0} صورة مضافة</span></div>
  <input ref={discoveryInputRef} className="visually-hidden" type="file" accept="image/*" multiple onChange={handleDiscoveryUpload} />
  <button type="button" className="media-add-button discovery-upload-button" onClick={() => discoveryInputRef.current?.click()} disabled={discoveryUploadMutation.isPending}><Upload size={17} /> {discoveryUploadMutation.isPending ? "جارٍ الرفع…" : "إضافة صور للمعرض"}</button>
  {discoveryUploadMessage && <p className="media-upload-status" role="status">{discoveryUploadMessage}</p>}
  <div className="discovery-admin-list">{discoveryItemsQuery.isLoading ? <p className="media-empty">جارٍ تحميل صور المعرض…</p> : discoveryItemsQuery.data?.length ? discoveryItemsQuery.data.map((item) => <article className="discovery-admin-item" key={item.id}><img src={item.url} alt={item.name} loading="lazy" />{editingDiscoveryId === item.id ? <div className="media-edit-row"><input value={editingDiscoveryName} onChange={(event) => setEditingDiscoveryName(event.target.value)} aria-label={`تعديل اسم ${item.name}`} /><button type="button" onClick={() => void renameDiscovery(item)}>حفظ</button><button type="button" onClick={() => { setEditingDiscoveryId(null); setEditingDiscoveryName(""); }}>إلغاء</button></div> : <div className="media-item-footer"><span title={item.name}>{item.name}</span><div><button type="button" aria-label={`تعديل ${item.name}`} onClick={() => { setEditingDiscoveryId(item.id); setEditingDiscoveryName(item.name); }}>تعديل</button><button type="button" aria-label={`حذف ${item.name}`} onClick={() => void removeDiscovery(item)}>حذف</button></div></div>}</article>) : <p className="media-empty">لا توجد صور مضافة بعد. ستعمل الصور الاحتياطية مؤقتاً حتى ترفع صورك.</p>}</div>
</div><div className="control-divider"><span>إضافة طلب أو أمر جديد</span></div><div className="role-grid"><button onClick={() => { setControlTitle("قرار CEO: إضافة أو تحديث"); setControlCategory("content"); setControlAssignee("CEO"); }}><ShieldCheck size={21} /><strong>CEO</strong><small>الموافقة والقرار</small></button><button onClick={() => { setControlTitle("طلب تنسيق أو شريك"); setControlCategory("partner"); setControlAssignee("السكرتير"); }}><UsersRound size={21} /><strong>السكرتير</strong><small>التنسيق والشركاء</small></button><button onClick={() => { setControlTitle("بلاغ عطل تقني"); setControlCategory("bug"); setControlAssignee("IT"); }}><Settings2 size={21} /><strong>IT</strong><small>الإصلاح والحماية</small></button></div><input className="control-title-input" value={controlTitle} onChange={(event) => setControlTitle(event.target.value)} placeholder="عنوان المهمة" /><div className="control-select-row"><select value={controlCategory} onChange={(event) => setControlCategory(event.target.value as typeof controlCategory)} aria-label="تصنيف المهمة"><option value="general">عام</option><option value="bug">عطل</option><option value="content">تحديث محتوى</option><option value="partner">شريك</option><option value="security">حماية</option></select><select value={controlPriority} onChange={(event) => setControlPriority(event.target.value as typeof controlPriority)} aria-label="أولوية المهمة"><option value="low">منخفضة</option><option value="normal">عادية</option><option value="high">عالية</option><option value="urgent">عاجلة</option></select><select value={controlAssignee} onChange={(event) => setControlAssignee(event.target.value as typeof controlAssignee)} aria-label="مسؤول المهمة"><option value="CEO">CEO</option><option value="السكرتير">السكرتير</option><option value="IT">IT</option></select></div><textarea className="control-command-input" value={controlCommand} onChange={(event) => setControlCommand(event.target.value)} placeholder="وصف العطل أو التحديث أو طلب الشريك بالتفصيل…" /><button className="button button-primary full-button" onClick={submitControlCommand} disabled={controlMutation.isPending}><Send size={16} /> {controlMutation.isPending ? "جارٍ تسجيل المهمة…" : "تسجيل المهمة"}</button><button className="button button-quiet full-button" onClick={() => setModal("login")}><LockKeyhole size={16} /> تسجيل دخول آمن</button></div>}
      </div></div>}
    </main>
  );
}

function CoffeeIcon() {
  return <span className="coffee-icon">☕</span>;
}
