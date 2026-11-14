import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM, invokeLLMConversation, type Message } from "./_core/llm";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
  imageDataUrl: z.string().max(6_000_000).optional(),
});

const chatSystemPrompt = [
  "أنت مساعد ALASSAUL-AI الذكي العام ورفيق الزائر.",
  "أجب بلغة الزائر المحددة، وافهم اللهجات الخليجية والعربية والسياق السابق.",
  "تعامل مع الرسائل كسياق حوار واحد، ولا تطلب إعادة معلومات سبق ذكرها.",
  "ابدأ بإجابة مباشرة ومفيدة، وتجنب الترحيب المحفوظ والتكرار والحشو.",
  "لا تخترع أخباراً أو أسعاراً أو أوقاتاً أو مصادر أو نتائج آنية. إذا لم تتوفر أداة تحقق حي، قل ذلك بوضوح.",
  "عند تحليل صورة، صف ما يظهر فقط وميّز بين الملاحظة والاستنتاج.",
  "كن ودوداً وطبيعياً، ولا تدّع أنك إنسان."
].join("\n");

export const appRouter = router({
  ask: publicProcedure
    .input(z.object({ question: z.string().trim().min(1).max(4000) }))
    .mutation(async ({ input }) => {
      const answer = await invokeLLM(input.question);
      return { answer };
    }),
  ai: router({
    chat: publicProcedure
      .input(z.object({
        language: z.enum(["AR", "TR", "EN"]).default("AR"),
        messages: z.array(chatMessageSchema).min(1).max(14),
      }))
      .mutation(async ({ input }) => {
        const latest = input.messages[input.messages.length - 1];
        if (!latest || latest.role !== "user") {
          return { text: "أرسل سؤالك الأخير وسأتابع معك." };
        }
        const languageInstruction = input.language === "AR"
          ? "أجب بالعربية الواضحة، وافهم اللهجة الخليجية."
          : input.language === "TR"
            ? "Türkçe yanıt ver."
            : "Answer in clear English.";
        const messages: Message[] = [
          { role: "system", content: chatSystemPrompt + "\n" + languageInstruction },
          ...input.messages.map((item, index) => {
            if (item.imageDataUrl) {
              if (item.role !== "user" || index !== input.messages.length - 1 ||
                  !/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(item.imageDataUrl)) {
                throw new Error("Image attachments are accepted only on the latest user message.");
              }
              return {
                role: "user" as const,
                content: [
                  { type: "text" as const, text: item.content || "حلّل الصورة المرفقة واشرح ما يظهر فيها." },
                  { type: "image_url" as const, image_url: { url: item.imageDataUrl, detail: "auto" as const } },
                ],
              };
            }
            return { role: item.role, content: item.content };
          }),
        ];
        try {
          const text = await invokeLLMConversation(messages, { maxCompletionTokens: 512 });
          return { text };
        } catch (error) {
          console.error("[ALASSAUL chat] request unavailable", {
            error: error instanceof Error ? error.message : "unknown",
          });
          return {
            text: "أواجه تعذراً مؤقتاً في الاتصال بخدمة الذكاء الاصطناعي. لم أفقد سياق سؤالك؛ حاول الإرسال مرة أخرى بعد قليل.",
            errorCode: "PROVIDER_UNAVAILABLE" as const,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
