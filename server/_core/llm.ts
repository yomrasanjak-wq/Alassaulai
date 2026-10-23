import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  ask: publicProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const answer = await invokeLLM(input.question);
        return { answer };
      } catch (e: any) {
        console.error("ASK ERROR:", e);
        return { answer: `DEBUG: ${e.message} | GROQ_KEY_EXISTS: ${!!process.env.GROQ_API_KEY} | OR_KEY_EXISTS: ${!!process.env.OPENROUTER_API_KEY}` };
      }
    }),
});

export type AppRouter = typeof appRouter;
