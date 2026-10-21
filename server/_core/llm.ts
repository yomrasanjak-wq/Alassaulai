const getProviders = () => {
  const providers: Array<{ url: string; key: string; model: string; name: string }> = [];
  if (ENV.forgeApiKey && ENV.forgeApiUrl) {
    providers.push({
      url: `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      key: ENV.forgeApiKey,
      model: "llama-3.1-8b-instant",
      name: "forge"
    });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      name: "groq"
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: "meta-llama/llama-3.1-8b-instruct:free",
      name: "openrouter"
    });
  }
  return providers;
};
