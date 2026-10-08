import React, { useMemo, useState } from "react";
import { ExternalLink, Filter, MapPin, Navigation, Search, Sparkles, X } from "lucide-react";
import { MapView } from "@/components/Map";

type MapCategory = "all" | "cities" | "nature" | "culture" | "family";

type MapDestination = {
  name: string;
  latin: string;
  category: Exclude<MapCategory, "all">;
  label: string;
  note: string;
  query: string;
  city: string;
  branch: string;
  position: google.maps.LatLngLiteral;
};

const destinations: MapDestination[] = [
  { name: "طرابزون", city: "طرابزون", branch: "المدينة والساحل", latin: "Trabzon", category: "cities", label: "مدينة ساحلية", note: "بوابة البحر الأسود والأسواق والمطاعم والميناء.", query: "Trabzon Turkey", position: { lat: 41.0053, lng: 39.7225 } },
  { name: "أوزنجول", city: "طرابزون", branch: "سلطان مراد · أوزنجول · ديمركابي", latin: "Uzungöl", category: "nature", label: "بحيرة وقرية", note: "بحيرة جبلية ومسارات هادئة وإطلالات لا تنسى.", query: "Uzungol Trabzon Turkey", position: { lat: 40.6197, lng: 40.2958 } },
  { name: "ريزا", city: "ريزا", branch: "المدينة والساحل", latin: "Rize", category: "cities", label: "مدينة الشاي", note: "مزارع الشاي والمرتفعات والهواء البحري.", query: "Rize Turkey", position: { lat: 41.0201, lng: 40.5234 } },
  { name: "أيدر", city: "ريزا", branch: "الطبيعة والمرتفعات", latin: "Ayder", category: "nature", label: "مرتفعات وشلالات", note: "غابات وشلالات وينابيع في قلب الطبيعة.", query: "Ayder Plateau Turkey", position: { lat: 40.9527, lng: 41.0931 } },
  { name: "دير سوميلا", city: "طرابزون", branch: "سوميلا · همسي كوي · حاجي مصطفى · زيغانا", latin: "Sümela", category: "culture", label: "تاريخ وثقافة", note: "دير تاريخي معلق بين الجبال ومسار مذهل.", query: "Sumela Monastery Turkey", position: { lat: 40.6898, lng: 39.6585 } },
  { name: "أوردو", city: "أوردو", branch: "المدينة والساحل", latin: "Ordu", category: "cities", label: "ساحل وتلفريك", note: "واجهة بحرية وتلفريك وإطلالة بانورامية.", query: "Ordu Turkey", position: { lat: 40.9839, lng: 37.8764 } },
  { name: "همسي كوي", city: "طرابزون", branch: "سوميلا · همسي كوي · حاجي مصطفى · زيغانا", latin: "Hamsiköy", category: "family", label: "قرية ومذاق", note: "طريق جبلي وقرية هادئة وتجربة محلية للعائلة.", query: "Hamsikoy Trabzon Turkey", position: { lat: 40.8218, lng: 39.4576 } },
  { name: "سامسون", city: "سامسون", branch: "المدينة والساحل", latin: "Samsun", category: "cities", label: "مدينة ساحلية", note: "كورنيش واسع ومتاحف وحدائق على البحر الأسود.", query: "Samsun Turkey", position: { lat: 41.2867, lng: 36.33 } },
  { name: "أتاكوم", city: "سامسون", branch: "المدينة والساحل", latin: "Atakum", category: "family", label: "شاطئ وممشى", note: "ممشى أتاكوم ومقاهٍ وإطلالة بحرية للعائلة.", query: "Atakum Samsun Turkey", position: { lat: 41.33, lng: 36.28 } },
  { name: "جيرسون", city: "جيرسون", branch: "المدينة والمرتفعات", latin: "Giresun", category: "cities", label: "جزيرة وقلعة", note: "مدينة ساحلية وقلعة وجزيرة تاريخية.", query: "Giresun Turkey", position: { lat: 40.9128, lng: 38.3895 } },
  { name: "كومبيت", city: "جيرسون", branch: "المدينة والمرتفعات", latin: "Kümbet", category: "nature", label: "مرتفعات", note: "مرتفعات خضراء وهواء بارد ومسارات طبيعية.", query: "Kumbet Plateau Giresun Turkey", position: { lat: 40.65, lng: 38.35 } },
  { name: "أنقرة", city: "أنقرة", branch: "المدينة والمعالم", latin: "Ankara", category: "cities", label: "عاصمة وتاريخ", note: "العاصمة والمتاحف والقلعة والأسواق الحديثة.", query: "Ankara Turkey", position: { lat: 39.9334, lng: 32.8597 } },
  { name: "إسطنبول", city: "إسطنبول", branch: "المدينة والمعالم", latin: "Istanbul", category: "cities", label: "البوسفور", note: "البوسفور والمعالم التاريخية والأسواق العريقة.", query: "Istanbul Turkey", position: { lat: 41.0082, lng: 28.9784 } },
  { name: "باتومي", city: "جورجيا", branch: "المدينة والواجهة البحرية", latin: "Batumi", category: "cities", label: "ساحل جورجيا", note: "بوليفارد باتومي والحدائق والواجهة البحرية.", query: "Batumi Georgia", position: { lat: 41.6168, lng: 41.6367 } },
  { name: "مرتفعات يومرا", city: "طرابزون", branch: "مرتفعات يومرا", latin: "Yomra", category: "nature", label: "مرتفعات وإطلالات", note: "إطلالات بحرية ومرافق ترفيهية قريبة من طرابزون.", query: "Yomra Trabzon Turkey", position: { lat: 40.955, lng: 39.86 } },
  { name: "مرتفعات سلطان مراد", city: "طرابزون", branch: "سلطان مراد · أوزنجول · ديمركابي", latin: "Sultan Murat", category: "nature", label: "مرتفعات", note: "مروج جبلية وإطلالات موسمية لعشاق الطبيعة.", query: "Sultan Murat Plateau Trabzon Turkey", position: { lat: 40.74, lng: 40.18 } },
  { name: "أكشبات", city: "طرابزون", branch: "أكشبات · حيدر نبي · مغارة تشال · كاياباشا · حاجي", latin: "Akçaabat", category: "family", label: "ساحل ومرتفعات", note: "شاطئ وممشى أكشبات ومرتفعات حيدر نبي ومغارة تشال.", query: "Akcaabat Trabzon Turkey", position: { lat: 41.02, lng: 39.57 } },
  { name: "مرتفعات حيدر نبي", city: "طرابزون", branch: "أكشبات · حيدر نبي · مغارة تشال · كاياباشا · حاجي", latin: "Hıdırnebi", category: "nature", label: "مرتفعات", note: "مرتفعات خضراء وإطلالات واسعة قرب أكشبات.", query: "Hidirnebi Plateau Trabzon Turkey", position: { lat: 40.99, lng: 39.49 } },
  { name: "مغارة تشال", city: "طرابزون", branch: "أكشبات · حيدر نبي · مغارة تشال · كاياباشا · حاجي", latin: "Çal Cave", category: "nature", label: "مغارة طبيعية", note: "من أطول المغارات السياحية ومشهد طبيعي مختلف.", query: "Cal Cave Trabzon Turkey", position: { lat: 40.86, lng: 39.38 } },
  { name: "بحيرة سيرا جول", city: "طرابزون", branch: "بحيرة سيرا جول", latin: "Sera Gölü", category: "nature", label: "بحيرة وأنشطة", note: "بحيرة هادئة مع ممشى وأنشطة وإطلالة جبلية.", query: "Sera Lake Trabzon Turkey", position: { lat: 40.99, lng: 39.58 } },
  { name: "كاياباشا", city: "طرابزون", branch: "أكشبات · حيدر نبي · مغارة تشال · كاياباشا · حاجي", latin: "Kayabaşı", category: "nature", label: "مرتفعات", note: "طبيعة جبلية ومراعي خضراء في ريف طرابزون.", query: "Kayabasi Trabzon Turkey", position: { lat: 40.9, lng: 39.5 } },
  { name: "ثلاث شلالات أركلي", city: "طرابزون", branch: "ثلاث شلالات أركلي", latin: "Araklı Waterfalls", category: "nature", label: "شلالات", note: "مسار طبيعي يضم ثلاثة شلالات في ريف أركلي.", query: "Arakli Waterfalls Trabzon Turkey", position: { lat: 40.73, lng: 40.05 } },
  { name: "ميدان طرابزون", city: "طرابزون", branch: "المدينة والأسواق", latin: "Meydan", category: "cities", label: "أسواق ومطاعم", note: "قلب طرابزون النابض بالمقاهي والأسواق والمطاعم.", query: "Trabzon Meydan Turkey", position: { lat: 41.002, lng: 39.716 } },
  { name: "مول جواهر طرابزون", city: "طرابزون", branch: "المدينة والأسواق", latin: "Cevahir Mall", category: "family", label: "تسوق وترفيه", note: "مول عائلي ومطاعم ومتاجر على طريق يومرا.", query: "Cevahir Outlet Trabzon Turkey", position: { lat: 40.976, lng: 39.833 } },
  { name: "حديقة زاغنوس", city: "طرابزون", branch: "المدينة والأسواق", latin: "Zağnos Valley", category: "family", label: "حديقة وممشى", note: "حديقة خضراء وممشى قريب من المعالم التاريخية.", query: "Zagnos Valley Park Trabzon Turkey", position: { lat: 41.003, lng: 39.715 } },
  { name: "قرية شكرسو", city: "ريزا", branch: "القرى والمرتفعات", latin: "Şenyuva", category: "nature", label: "قرية وجسور", note: "قرية جبلية وجسور حجرية وإطلالات على الوادي.", query: "Sen yuva Camlihemsin Rize Turkey", position: { lat: 41.007, lng: 41.038 } },
  { name: "وادي فرتينا", city: "ريزا", branch: "القرى والمرتفعات", latin: "Fırtına Valley", category: "nature", label: "نهر ومغامرات", note: "وادي أخضر وأنشطة نهرية ومسارات طبيعية.", query: "Firtina Valley Rize Turkey", position: { lat: 41.015, lng: 41.087 } },
  { name: "شلال بالوفيت", city: "ريزا", branch: "الشلالات والطبيعة", latin: "Palovit Waterfall", category: "nature", label: "شلال", note: "شلال قوي وسط غابات ريزا الكثيفة.", query: "Palovit Waterfall Rize Turkey", position: { lat: 41.034, lng: 41.083 } },
  { name: "تلفريك بوزتبه", city: "أوردو", branch: "الساحل والتلفريك", latin: "Boztepe Cable Car", category: "family", label: "تلفريك وإطلالة", note: "إطلالة بانورامية على مدينة أوردو والبحر.", query: "Ordu Boztepe Cable Car Turkey", position: { lat: 40.99, lng: 37.87 } },
  { name: "شاطئ أوردو", city: "أوردو", branch: "الساحل والتلفريك", latin: "Ordu Coast", category: "family", label: "شاطئ وممشى", note: "واجهة بحرية وممشى مناسب للعائلة.", query: "Ordu coast Turkey", position: { lat: 40.985, lng: 37.89 } },
  { name: "شلالات أوردو", city: "أوردو", branch: "الطبيعة والمرتفعات", latin: "Ordu Waterfalls", category: "nature", label: "شلالات", note: "ممرات طبيعية وشلالات في ريف أوردو.", query: "Ordu waterfalls Turkey", position: { lat: 40.78, lng: 37.78 } },
  { name: "متحف سامسون", city: "سامسون", branch: "المدينة والتاريخ", latin: "Samsun Museum", category: "culture", label: "تاريخ وثقافة", note: "متحف ومعالم تحكي تاريخ البحر الأسود.", query: "Samsun Museum Turkey", position: { lat: 41.286, lng: 36.333 } },
  { name: "بانديرما فابور", city: "سامسون", branch: "المدينة والتاريخ", latin: "Bandırma Vapuru", category: "culture", label: "معلم تاريخي", note: "سفينة ومتحف على الواجهة البحرية.", query: "Bandirma Vapuru Museum Samsun Turkey", position: { lat: 41.300, lng: 36.330 } },
  { name: "بحيرة أكالان", city: "سامسون", branch: "الطبيعة والبحيرات", latin: "Akoluk", category: "nature", label: "بحيرة وطبيعة", note: "مساحات هادئة للتنزه والتصوير خارج المدينة.", query: "Samsun lake nature Turkey", position: { lat: 41.25, lng: 36.48 } },
  { name: "جزيرة جيرسون", city: "جيرسون", branch: "الساحل والجزر", latin: "Giresun Island", category: "culture", label: "جزيرة تاريخية", note: "جزيرة ساحلية نادرة وقصص تاريخية في البحر الأسود.", query: "Giresun Island Turkey", position: { lat: 40.900, lng: 38.400 } },
  { name: "قلعة جيرسون", city: "جيرسون", branch: "الساحل والجزر", latin: "Giresun Castle", category: "culture", label: "قلعة وإطلالة", note: "قلعة وإطلالة واسعة على البحر والمدينة.", query: "Giresun Castle Turkey", position: { lat: 40.917, lng: 38.388 } },
  { name: "مرتفعات تامدير", city: "جيرسون", branch: "الطبيعة والمرتفعات", latin: "Tamdere", category: "nature", label: "مرتفعات", note: "مروج وغابات ومسارات في ريف جيرسون.", query: "Tamdere Giresun Turkey", position: { lat: 40.600, lng: 38.200 } },
  { name: "قلعة أنقرة", city: "أنقرة", branch: "التاريخ والمتاحف", latin: "Ankara Castle", category: "culture", label: "قلعة وتاريخ", note: "إطلالة تاريخية وأزقة وأسواق قديمة.", query: "Ankara Castle Turkey", position: { lat: 39.949, lng: 32.862 } },
  { name: "ضريح أتاتورك", city: "أنقرة", branch: "التاريخ والمتاحف", latin: "Anıtkabir", category: "culture", label: "معلم وطني", note: "أحد أشهر المعالم الوطنية في العاصمة.", query: "Anitkabir Ankara Turkey", position: { lat: 39.925, lng: 32.837 } },
  { name: "بحيرة إيمير", city: "أنقرة", branch: "الحدائق والبحيرات", latin: "Eymir Lake", category: "nature", label: "بحيرة وممشى", note: "بحيرة هادئة ومسارات للدراجات والتنزه.", query: "Eymir Lake Ankara Turkey", position: { lat: 39.822, lng: 32.800 } },
  { name: "آيا صوفيا", city: "إسطنبول", branch: "التاريخ والبوسفور", latin: "Hagia Sophia", category: "culture", label: "معلم تاريخي", note: "معلم عالمي في قلب المنطقة التاريخية.", query: "Hagia Sophia Istanbul Turkey", position: { lat: 41.0086, lng: 28.9802 } },
  { name: "جامع السلطان أحمد", city: "إسطنبول", branch: "التاريخ والبوسفور", latin: "Blue Mosque", category: "culture", label: "جامع تاريخي", note: "جامع تاريخي مميز في قلب السلطان أحمد.", query: "Blue Mosque Sultanahmet Istanbul Turkey", position: { lat: 41.0054, lng: 28.9768 } },
  { name: "برج غلطة", city: "إسطنبول", branch: "التاريخ والبوسفور", latin: "Galata Tower", category: "culture", label: "إطلالة بانورامية", note: "إطلالة بانورامية على القرن الذهبي والبوسفور.", query: "Galata Tower Istanbul Turkey", position: { lat: 41.0256, lng: 28.9741 } },
  { name: "قصر دولما بهجة", city: "إسطنبول", branch: "التاريخ والبوسفور", latin: "Dolmabahce Palace", category: "culture", label: "قصر على البوسفور", note: "قصر عثماني فخم على ضفة البوسفور.", query: "Dolmabahce Palace Istanbul Turkey", position: { lat: 41.0391, lng: 29.0007 } },
  { name: "البوسفور", city: "إسطنبول", branch: "التاريخ والبوسفور", latin: "Bosphorus", category: "cities", label: "رحلات وإطلالة", note: "مضيق إسطنبول ورحلات بحرية بين القارتين.", query: "Bosphorus Istanbul Turkey", position: { lat: 41.115, lng: 29.05 } },
  { name: "السوق المصري", city: "إسطنبول", branch: "الأسواق والتسوق", latin: "Spice Bazaar", category: "cities", label: "سوق التوابل", note: "سوق التوابل والهدايا قرب أمينونو.", query: "Spice Bazaar Istanbul Turkey", position: { lat: 41.0165, lng: 28.9709 } },
  { name: "جزر الأميرات", city: "إسطنبول", branch: "الجزر والحدائق", latin: "Princes Islands", category: "nature", label: "جزر وهدوء", note: "رحلة بحرية وأجواء هادئة بعيدًا عن ازدحام المدينة.", query: "Princes Islands Istanbul Turkey", position: { lat: 40.87, lng: 29.12 } },
  { name: "حديقة أميرغان", city: "إسطنبول", branch: "الجزر والحدائق", latin: "Emirgan Park", category: "nature", label: "حديقة وبوسفور", note: "حديقة واسعة وإطلالات جميلة على البوسفور.", query: "Emirgan Park Istanbul Turkey", position: { lat: 41.106, lng: 29.056 } },
  { name: "بولونيزكوي", city: "إسطنبول", branch: "القرى والطبيعة", latin: "Polonezkoy", category: "family", label: "قرية خضراء", note: "قرية خضراء ومطاعم ريفية مناسبة للعائلة.", query: "Polonezkoy Istanbul Turkey", position: { lat: 41.117, lng: 29.208 } },
  { name: "أكواريوم إسطنبول", city: "إسطنبول", branch: "العائلة والترفيه", latin: "Istanbul Aquarium", category: "family", label: "تجربة عائلية", note: "أكواريوم عائلي ومسار ترفيهي قرب فلوريا.", query: "Istanbul Aquarium Florya Turkey", position: { lat: 40.971, lng: 28.797 } },
  { name: "شلالات مارتفيلي", city: "جورجيا", branch: "الطبيعة والشلالات", latin: "Martvili Canyon", category: "nature", label: "وادي وشلالات", note: "مياه فيروزية وممرات طبيعية في جورجيا.", query: "Martvili Canyon Georgia", position: { lat: 42.457, lng: 42.377 } },
  { name: "بوليفارد باتومي", city: "جورجيا", branch: "المدينة والبحر", latin: "Batumi Boulevard", category: "family", label: "واجهة بحرية", note: "ممشى طويل وحدائق ومطاعم على البحر.", query: "Batumi Boulevard Georgia", position: { lat: 41.651, lng: 41.635 } },
  { name: "حديقة باتومي النباتية", city: "جورجيا", branch: "الطبيعة والشلالات", latin: "Batumi Botanical Garden", category: "nature", label: "حديقة وطبيعة", note: "حديقة ساحلية واسعة بإطلالات نباتية وبحرية.", query: "Batumi Botanical Garden Georgia", position: { lat: 41.69, lng: 41.705 } },
];

const filters: Array<{ key: MapCategory; label: string }> = [
  { key: "all", label: "كل الوجهات" },
  { key: "cities", label: "مدن" },
  { key: "nature", label: "طبيعة" },
  { key: "culture", label: "تاريخ" },
  { key: "family", label: "عائلية" },
];

const categoryColor: Record<MapDestination["category"], string> = {
  cities: "#d2ae62",
  nature: "#66a889",
  culture: "#b98b62",
  family: "#79a7b3",
};

export function InteractiveNorthMap() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MapCategory>("all");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selected, setSelected] = useState<MapDestination | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [expanded, setExpanded] = useState(false);

  const cityNames = ["طرابزون", "ريزا", "أوردو", "سامسون", "جيرسون", "أنقرة", "إسطنبول", "جورجيا"];

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return selectedCity ? destinations.filter((item) => {
      const matchesCity = item.city === selectedCity;
      const matchesFilter = filter === "all" || item.category === filter;
      const matchesQuery = !normalized || `${item.name} ${item.latin} ${item.label}`.toLocaleLowerCase().includes(normalized);
      return matchesCity && matchesFilter && matchesQuery;
    }) : [];
  }, [filter, query, selectedCity]);

  const openDestination = (destination: MapDestination) => {
    setSelected(destination);
    map?.panTo(destination.position);
    map?.setZoom(10);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.query)}`, "_blank", "noopener,noreferrer");
    window.setTimeout(() => document.querySelector(".north-map-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
  };

  const directionsUrl = selected
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.query)}`
    : "https://www.google.com/maps/search/Northern+Turkey";

  return (
    <div className={`north-map-experience ${expanded ? "north-map-expanded" : ""}`} dir="rtl">
      <div className="north-map-view-actions">
        {!expanded ? <button type="button" className="north-map-expand" onClick={() => setExpanded(true)}><ExternalLink size={16} /> فتح الخريطة بحجم كامل</button> : <button type="button" className="north-map-close" onClick={() => setExpanded(false)}><X size={17} /> إغلاق الخريطة</button>}
      </div>
      <div className="north-map-toolbar">
        <div className="north-map-search">
          <Search size={18} aria-hidden="true" />
          <input aria-label="ابحث في الخريطة" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن أوزنجول، شلال، مطعم…" />
          {query && <button type="button" aria-label="مسح البحث" onClick={() => setQuery("")}><X size={16} /></button>}
        </div>
        <div className="north-map-filters" aria-label="فلاتر الخريطة" role="group">
          <Filter size={15} aria-hidden="true" />
          {filters.map((item) => <button type="button" key={item.key} aria-pressed={filter === item.key} className={filter === item.key ? "active" : ""} onClick={() => setFilter(item.key)}>{item.label}</button>)}
        </div>
      </div>

      <div className="north-map-city-picker" aria-label="اختر مدينة لعرض وجهاتها" role="tablist">
        <div className="north-map-city-picker-title"><strong>اختر المدينة</strong><span>تظهر أماكنها ومرتفعاتها هنا فوراً</span></div>
        <div className="north-map-city-buttons">
          {cityNames.map((city) => <button type="button" role="tab" aria-selected={selectedCity === city} className={selectedCity === city ? "active" : ""} key={city} onClick={() => { setSelectedCity(city); setFilter("all"); setSelected(null); }}>{city}</button>)}
        </div>
      </div>

      <div className="north-map-body">
        <aside className="north-map-destinations">
          <div className="north-map-aside-heading"><span>{selectedCity} · الوجهات</span><strong>{visible.length} وجهات أمامك</strong></div>
          <div className="north-map-destination-list">
            {selectedCity ? Array.from(new Set(visible.map((item) => item.branch))).map((branch) => <div className="north-map-branch" key={branch}><h4>{branch}</h4>{visible.filter((item) => item.branch === branch).map((destination, index) => <button type="button" key={destination.name} aria-label={`اختيار وجهة الخريطة رقم ${index + 1}`} className={`north-map-destination ${selected?.name === destination.name ? "selected" : ""}`} onClick={() => openDestination(destination)}>
              <span className="north-map-number" style={{ background: categoryColor[destination.category] }}>{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{destination.name}</strong><small>{destination.latin} · {destination.label}</small></span>
              <MapPin size={15} />
            </button>)}</div>) : <p className="north-map-empty">اختر مدينة من الأعلى لتظهر وجهاتها هنا.</p>}
            {!visible.length && selectedCity && <p className="north-map-empty">لم نجد هذه الوجهة. جرّب اسم مدينة أو طبيعة.</p>}
          </div>
        </aside>

        <div className="north-map-canvas-wrap">
          <MapView className="north-map-canvas" initialCenter={{ lat: 40.95, lng: 39.25 }} initialZoom={8} onMapReady={(readyMap) => {
            setMap(readyMap);
            const bounds = new google.maps.LatLngBounds();
            destinations.forEach((destination) => bounds.extend(destination.position));
            readyMap.fitBounds(bounds, 42);
            destinations.forEach((destination) => {
              const markerContent = Object.assign(document.createElement("button"), { className: "north-map-marker", type: "button", ariaLabel: `فتح ${destination.name}`, innerHTML: `<span style="background:${categoryColor[destination.category]}"></span><b>${destination.name}</b>` });
              try {
                const marker = google.maps.marker?.AdvancedMarkerElement
                  ? new google.maps.marker.AdvancedMarkerElement({ map: readyMap, position: destination.position, title: destination.name, content: markerContent })
                  : new google.maps.Marker({ map: readyMap, position: destination.position, title: destination.name });
                marker.addListener("click", () => openDestination(destination));
              } catch (error) {
                console.warn("Map marker unavailable; the destination list remains interactive.", error);
              }
            });
          }} />
        </div>
      </div>

      {selected && <div className="north-map-detail" role="region" aria-label={`تفاصيل ${selected.name}`}>
        <div className="north-map-detail-icon"><Sparkles size={20} /></div>
        <div className="north-map-detail-copy"><span>{selected.label} · {selected.latin}</span><strong>{selected.name}</strong><p>{selected.note}</p></div>
        <a className="north-map-directions" href={directionsUrl} target="_blank" rel="noreferrer"><Navigation size={17} /> احصل على الاتجاهات <ExternalLink size={14} /></a>
      </div>}
    </div>
  );
}

export default InteractiveNorthMap;
