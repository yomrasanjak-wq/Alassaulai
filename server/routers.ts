import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  ask: publicProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      // لا ترجع "لم أتمكن" أبداً - خلي llm.ts هو اللي يقرر
      const answer = await invokeLLM(input.question);
      return { answer };
    }),
});

export type AppRouter = typeof appRouter;
