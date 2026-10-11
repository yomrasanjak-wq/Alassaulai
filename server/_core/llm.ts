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

// --- ALASSAUL BRAIN CORE - ط°ظƒظٹ ظˆط³ط±ظٹط¹ ---
const ALASSAUL_SYSTEM = `ط£ظ†طھ ط§ظ„ط¹ط³ظˆظ„طŒ ط®ط¨ظٹط± ط³ظٹط§ط­ظٹ ط°ظƒظٹ ظˆط³ط±ظٹط¹ ظˆط¨ط¯ظٹظ‡ظٹ ظ„ط´ط±ظƒط© ط§ظ„ط¹ط³ظˆظ„ ظ„ظ„ط³ظٹط§ط­ط© ظپظٹ ط·ط±ط§ط¨ط²ظˆظ† ظˆط§ظ„ط´ظ…ط§ظ„ ط§ظ„طھط±ظƒظٹ.

ط´ط®طµظٹطھظƒ:
- ط³ط¹ظˆط¯ظٹطŒ ظ„ظ‡ط¬طھظƒ ط¹ط§ظ…ظٹط© ط®ظپظٹظپط© ظˆط¯ظˆط¯ط© ظ„ظƒظ† طھظƒطھط¨ ط¨ط§ظ„ظپطµط­ظ‰ ط§ظ„ظ…ظپظ‡ظˆظ…ط© ظ„ظ„ط¬ظ…ظٹط¹
- ط³ط±ظٹط¹ ط§ظ„ط¨ط¯ظٹظ‡ط©طŒ طھط¬ط§ظˆط¨ ظ…ط¨ط§ط´ط±ط© ط¨ط¯ظˆظ† ظ„ظپ
- ط°ظƒظٹطŒ طھظپظ‡ظ… ظ‚طµط¯ ط§ظ„ط¹ظ…ظٹظ„ ط­طھظ‰ ظ„ظˆ ظƒظ„ط§ظ…ظ‡ ظ…ط®طھطµط±
- طھط¹ط±ظپ ظƒظ„ ط´ط¨ط± ظپظٹ ط·ط±ط§ط¨ط²ظˆظ†: ط£ظˆط²ظ†ط¬ظˆظ„طŒ ط¢ظٹط¯ط±طŒ ط±ظٹط²ط§طŒ ط­ظٹط¯ط± ظ†ط¨ظٹطŒ ط³ظˆظ…ظٹظ„ط§طŒ ط­ظ…طھطŒ ظ…ط±طھظپط¹ط§طھ ط§ظ„ط³ظ„ط·ط§ظ† ظ…ط±ط§ط¯طŒ ط¨ط­ظٹط±ط© ط³ظٹط±ط§ط¬ظˆظ„

ظ‚ظˆط§ط¹ط¯ظƒ:
- ط¬ط§ظˆط¨ ط¨ط§ط®طھطµط§ط± ظ…ظپظٹط¯ (3-5 ط£ط³ط·ط±) ط«ظ… ط§ط³ط£ظ„ ط³ط¤ط§ظ„ ظٹظ‚ط±ط¨ ط§ظ„ط­ط¬ط²
- ط¥ط°ط§ ط³ط£ظ„ ط¹ظ† ط£ظ…ط§ظƒظ†طŒ ط§ط°ظƒط± 2-3 ط£ظ…ط§ظƒظ† ظ…ط¹ ظ…ظٹط²ط© ظƒظ„ ظ…ظƒط§ظ†
- ط¥ط°ط§ ط³ط£ظ„ ط¹ظ† ط³ط¹ط±طŒ ظ‚ظ„ ط§ظ„ط£ط³ط¹ط§ط± طھط¨ط¯ط£ ظ…ظ† X ظˆط§ط·ظ„ط¨ طھظپط§طµظٹظ„ ط§ظ„ط±ط­ظ„ط© (ط¹ط¯ط¯ ط§ظ„ط£ط´ط®ط§طµطŒ ط§ظ„ط£ظٹط§ظ…طŒ ط§ظ„طھط§ط±ظٹط®)
- ظ„ط§ طھظƒط±ط± ظ†ظپط³ظƒطŒ ظ„ط§ طھط±ط¯ط¯ ط§ظ„طµظˆطھ
- ط¯ط§ط¦ظ…ط§ظ‹ ط§ظ†ظ‡ظٹ ط¨ط¬ظ…ظ„ط© طھط­ظپط² ط§ظ„طھظˆط§طµظ„ ظˆط§طھط³ط§ط¨`;

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

// Free providers chain - ظٹط¬ط±ط¨ ظˆط§ط­ط¯ ظˆط§ط­ط¯ ظ„ظٹظ† ظٹط´طھط؛ظ„
const getProviders = () => {
  const providers: Array<{ url: string; key: string; model: string; name: string }> = [];
  
  // 1. Manus Forge (ظ„ظˆ ظ…ظˆط¬ظˆط¯)
  if (ENV.forgeApiKey && ENV.forgeApiUrl) {
    providers.push({
      url: `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      key: ENV.forgeApiKey,
      model: "llama-3.3-70b-versatile",
      name: "forge"
    });
  }
  
  // 2. Groq Free - ط§ظ„ط£ط³ط±ط¹ ظˆط§ظ„ط£ظپط¶ظ„
  if (process.env.GROQ_API_KEY) {
    providers.push({
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      name: "groq"
    });
  }
  
  // 3. OpenRouter Free
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: "meta-llama/llama-3.3-70b-instruct:free",
      name: "openrouter"
    });
  }
  
  // 4. Fallback - ط­طھظ‰ ظ„ظˆ ظ…ط§ ظپظٹظ‡ ظ…ظپطھط§ط­طŒ ط­ط§ظˆظ„ Groq ط¨ط¯ظˆظ† ظ…ظپطھط§ط­ ط¹ط¨ط± proxy ظ…ط¬ط§ظ†ظٹ (ظ„ظ„طھط¬ط±ط¨ط©)
  // ط§ظ„ظ…ط³طھط®ط¯ظ… ظٹظ‚ط¯ط± ظٹط­ط· GROQ_API_KEY ظپظٹ Vercel ظ…ط¬ط§ظ†ط§ظ‹ ظ…ظ† groq.com
  return providers;
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, tools, model, max_tokens, maxTokens, max_completion_tokens, maxCompletionTokens } = params;
  
  // ط£ط¶ظپ ط´ط®طµظٹط© ط§ظ„ط¹ط³ظˆظ„ ط§ظ„ط°ظƒظٹط©
  const hasSystem = messages.some(m => m.role === "system");
  const finalMessages = hasSystem 
    ? messages.map(normalizeMessage)
    : [{ role: "system", content: ALASSAUL_SYSTEM }, ...messages.map(normalizeMessage)];

  const payload: any = {
    messages: finalMessages,
    model: "llama-3.3-70b-versatile",
    max_tokens: max_completion_tokens ?? maxCompletionTokens ?? max_tokens ?? maxTokens ?? 600,
    temperature: 0.75,
    top_p: 0.9,
  };
  
  if (tools?.length) payload.tools = tools;

  const providers = getProviders();
  
  if (providers.length === 0) {
    throw new Error("ظ…ط§ ظپظٹظ‡ ظ…ظپطھط§ط­ API - ط­ط· GROQ_API_KEY ظپظٹ Vercel ظ…ظ† groq.com ظ…ط¬ط§ظ†ط§ظ‹ - ظٹط§ط®ط° 30 ط«ط§ظ†ظٹط© ظپظ‚ط·");
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
        signal: AbortSignal.timeout(15000) // 15 ط«ط§ظ†ظٹط© ظپظ‚ط· ط¹ط´ط§ظ† ظ…ط§ ظٹط¹ظ„ظ‚
      });
      
      if (!res.ok) {
        lastError = await res.text();
        continue; // ط¬ط±ط¨ ط§ظ„ظ„ظٹ ط¨ط¹ط¯ظ‡
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
  
  throw new Error(`ظƒظ„ ط§ظ„ظ…ط²ظˆط¯ظٹظ† ظپط´ظ„ظˆط§ - ط¢ط®ط± ط®ط·ط£: ${lastError}`);
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
