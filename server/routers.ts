import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  ask: publicProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      const answer = await invokeLLM(input.question);
      return { answer };
    }),
  // باقي الـ router خله مثل ما هو إذا فيه أشياء ثانية
});

export type AppRouter = typeof appRouter;
