import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";
export type TextContent = { type: "text"; text: string };
export type ImageContent = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
export type FileContent = { type: "file_url"; file_url: { url: string; mime_type?: string } };
export type MessageContent = string | TextContent | ImageContent | FileContent;
export type Message = { role: Role; content: MessageContent | MessageContent[]; name?: string; tool_call_id?: string };
export type Tool = { type: "function"; function: { name: string; description?: string; parameters?: Record<string, unknown> } };
export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = { type: "function"; function: { name: string } };
export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;
export type InvokeParams = {
  messages: Message[];
  tools?: Tool[]; toolChoice?: ToolChoice; tool_choice?: ToolChoice;
  maxTokens?: number; max_tokens?: number; maxCompletionTokens?: number; max_completion_tokens?: number;
  outputSchema?: any; output_schema?: any; responseFormat?: any; response_format?: any;
  model?: string; thinking?: any; reasoning?: any;
};
export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
export type InvokeResult = {
  id: string; created: number; model: string;
  choices: Array<{ index: number; message: { role: Role; content: string | any; tool_calls?: ToolCall[] }; finish_reason: string | null }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

// --- ALASSAUL BRAIN CORE - ذكي وسريع وود مثل Meta AI ---
const ALASSAUL_SYSTEM = `أنت العسول، خبير سياحي ذكي وسريع وودود لشركة العسول للسياحة في طرابزون والشمال التركي.

شخصيتك مثل Meta AI:
- سعودي، لهجتك عامية خفيفة ودودة، تكتب بطريقة مفهومة للجميع
- ترد التحية دائماً: وعليكم السلام، هلا والله وغلا، صباح الخير، مساء الخير، مساء النور
- إذا قال لك تصبح على خير، رد: وانت من أهل الخير يا حبيبي، نام وانت مرتاح، الشغل كله محفوظ وبكره نكمل سوا
- تحب تقول: الشغل كله محفوظ، أنا معك حبة حبة، ارتاح ونكمل الصباح، أبشر، تم
- سريع البديهة، تجاوب مباشرة بدون لف ودوران
- ذكي، تفهم قصد العميل حتى لو كلامه مختصر
- تعرف كل شبر في طرابزون: أوزنجول، آيدر، ريزا، حيدر نبي، سوميلا، همشكوي، مرتفعات السلطان مراد، بحيرة سيراجول

قواعدك:
- جاوب باختصار مفيد (3-5 أسطر) ثم اسأل سؤال يقرب الحجز
- إذا سأل عن أماكن، اذكر 2-3 أماكن مع ميزة كل مكان
- إذا سأل عن سعر، قل الأسعار تبدأ من X واطلب تفاصيل الرحلة (عدد الأشخاص، الأيام، التاريخ)
- لا تكرر نفسك، ولا تقل أبداً "لم أتمكن من تجهيز إجابة" أو "تعذر إكمال الطلب"
- دائماً انهي بجملة تحفز التواصل واتساب
- خلك بني آدم مو روبوت`;

const ensureArray = (value: any): any[] => (Array.isArray(value) ? value : [value]);
const normalizeContentPart = (part: any) => {
  if (typeof part === "string") return { type: "text", text: part };
  return part;
};
const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map(p => typeof p === "string" ? p : JSON.stringify(p)).join("\n");
    return { role, name, tool_call_id, content };
  }
  const parts = ensureArray(message.content).map(normalizeContentPart);
  if (parts.length === 1 && parts[0].type === "text") {
    return { role, name, content: parts[0].text };
  }
  return { role, name, content: parts };
};

const getProviders = () => {
  const providers: Array<{ url: string; key: string; model: string; name: string }> = [];
  if (ENV.forgeApiKey && ENV.forgeApiUrl) {
    providers.push({
      url: `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      key: ENV.forgeApiKey,
      model: "llama-3.3-70b-versatile",
      name: "forge"
    });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      name: "groq"
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: "meta-llama/llama-3.3-70b-instruct:free",
      name: "openrouter"
    });
  }
  return providers;
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, tools, model, max_tokens, maxTokens, max_completion_tokens, maxCompletionTokens } = params;
  const hasSystem = messages.some(m => m.role === "system");
  const finalMessages = hasSystem 
    ? messages.map(normalizeMessage)
    : [{ role: "system", content: ALASSAUL_SYSTEM }, ...messages.map(normalizeMessage)];

  const payload: any = {
    messages: finalMessages,
    model: "llama-3.3-70b-versatile",
    max_tokens: max_completion_tokens ?? maxCompletionTokens ?? max_tokens ?? maxTokens ?? 600,
    temperature: 0.8,
    top_p: 0.9,
  };
  if (tools?.length) payload.tools = tools;
  const providers = getProviders();
  if (providers.length === 0) {
    throw new Error("ما فيه مفتاح API - حط GROQ_API_KEY في Vercel من groq.com مجاناً - ياخذ 30 ثانية فقط");
  }
  let lastError = "";
  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${p.key}`,
          ...(p.name === "openrouter" ? { "HTTP-Referer": "https://alassaul.com", "X-Title": "Alassaul" } : {})
        },
        body: JSON.stringify({ ...payload, model: p.model }),
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) {
        lastError = await res.text();
        continue;
      }
      const data = await res.json() as InvokeResult;
      if (data?.choices?.[0]?.message?.content) {
        return data;
      }
    } catch (e: any) {
      lastError = e.message;
      continue;
    }
  }
  throw new Error(`كل المزودين فشلوا - آخر خطأ: ${lastError}`);
}

export type ModelInfo = { id: string; object: string; created: number; owned_by: string };
export type ModelsResponse = { object: string; data: ModelInfo[] };
export async function listLLMModels(): Promise<ModelsResponse> {
  const providers = getProviders();
  if (!providers.length) return { object: "list", data: [] };
  const p = providers[0];
  try {
    const res = await fetch(p.url.replace("chat/completions", "models"), {
      headers: { Authorization: `Bearer ${p.key}` }
    });
    if (res.ok) return await res.json() as ModelsResponse;
  } catch {}
  return { object: "list", data: [{ id: "llama-3.3-70b-versatile", object: "model", created: Date.now(), owned_by: "groq" }] };
}
