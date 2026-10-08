import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter, compactChatHistory } from "./routers";
import { invokeLLM } from "./_core/llm";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ai.chat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a model answer for an Arabic question", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: "إجابة تجريبية مفيدة" } }],
    } as never);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "ما هي عاصمة تركيا؟" }],
    });

    expect(result).toEqual({ text: "إجابة تجريبية مفيدة" });
    expect(invokeLLM).toHaveBeenCalledOnce();
    const request = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    expect(request).toMatchObject({
      model: "gpt-5-mini",
      max_completion_tokens: 384,
      reasoning: { effort: "minimal" },
    });
    expect(request?.messages?.[0]?.content).toContain("ابدأ بجواب مباشر مفيد");
    expect(request?.messages?.[0]?.content).toContain("اللهجة الخليجية");
  });

  it("normalizes an object-shaped live text response", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{ message: { content: { type: "text", text: "إجابة حية من المساعد" } } }],
    } as never);

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "ما معنى السكينة في الأدب؟" }],
    });

    expect(result.text).toBe("إجابة حية من المساعد");
  });

  it("answers a Trabzon itinerary request instantly from the local knowledge layer", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "رتب لي برنامج يوم في طرابزون" }],
    });

    expect(result.text).toContain("برنامج يوم واحد في طرابزون");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("builds the requested Istanbul plus Trabzon family package", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "أبغى بكج إلى طرابزون 10 أيام وبعدها قبله إسطنبول 3 أيام" }],
    });

    expect(result.text).toContain("13 يوماً");
    expect(result.text).toContain("إسطنبول");
    expect(result.text).toContain("أوزنجول");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("understands the follow-up request to arrange the package", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "طيب رتب لي البرنامج هذا" }],
    });

    expect(result.text).toContain("3 أيام في إسطنبول ثم 10 أيام في طرابزون");
    expect(result.text).toContain("جدول يومي");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("builds an eight-day family package in Trabzon", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "انا ابغاك ترتب لي جدول رحلات الى تركيا طرابزون لمدة ثمانية ايام انا والعائلة" }],
    });

    expect(result.text).toContain("8 أيام");
    expect(result.text).toContain("أوزنجول");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("builds the requested Istanbul, Trabzon and Samsun route", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "أبغى ثلاثة أيام في إسطنبول وأربعة أيام في طرابزون ويومين في سامسونج" }],
    });

    expect(result.text).toContain("9 أيام");
    expect(result.text).toContain("سامسون");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("returns the complete ten-day family schedule instead of a one-day answer", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "هل باستطاعتك ان ترتب لي جدول رحلة الى طرابزون لمدة عشر ايام انا والعائلة عددنا اربع اشخاص" }],
    });

    expect(result.text).toContain("جدول كامل لمدة 10 أيام");
    expect(result.text).toContain("اليوم 10");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("answers incomplete schedule follow-ups with the complete plan", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "يا اخي اعطيني جدول كامل انت تعطيني جدول ناقص" }],
    });

    expect(result.text).toContain("الجدول الكامل لعشرة أيام");
    expect(result.text).toContain("اليوم 10");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("answers Arabic greetings without waiting for the model", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "السلام عليكم" }],
    });

    expect(result.text).toContain("وعليكم السلام");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("answers common general-knowledge questions locally", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "ماهي عاصمة اليابان" }],
    });

    expect(result.text).toContain("طوكيو");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it.each([
    ["ما هي عاصمه روسيا", "موسكو"],
    ["ما هي عاصمه تايلند", "بانكوك"],
    ["اين تقع بيرو", "أمريكا الجنوبية"],
  ])("answers the general question %s locally", async (question, expected) => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({ language: "AR", messages: [{ role: "user", content: question }] });

    expect(result.text).toContain(expected);
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it.each([
    ["أبغى توقيع فخم لاسم Alassaul العسول", "توقيعاً فخماً"],
    ["اسمي يوسف", "تشرفت باسمك"],
    ["من انتم", "مساعد ALASSAUL الرسمي"],
  ])("answers the assistant request %s locally", async (question, expected) => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({ language: "AR", messages: [{ role: "user", content: question }] });

    expect(result.text).toContain(expected);
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("uses the backup model when the primary model connection fails", async () => {
    vi.mocked(invokeLLM)
      .mockRejectedValueOnce(new Error("llm invoke failed: temporary upstream error"))
      .mockResolvedValueOnce({ choices: [{ message: { content: "إجابة احتياطية من المساعد" } }] } as never);
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({ language: "AR", messages: [{ role: "user", content: "ما معنى الأدب؟" }] });

    expect(result.text).toBe("إجابة احتياطية من المساعد");
    expect(invokeLLM).toHaveBeenCalledTimes(2);
    expect(vi.mocked(invokeLLM).mock.calls[1]?.[0]).toMatchObject({ model: "claude-haiku-4-5" });
  });

  it("returns live Ayder weather instead of a blank answer", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      current: { temperature_2m: 16.4, apparent_temperature: 15.1, weather_code: 2, wind_speed_10m: 8 },
    }), { status: 200 })));
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "كيف الأجواء في ايدر اليوم؟" }],
    });

    expect(result.text).toContain("آيدر");
    expect(result.text).toContain("16°");
    expect(invokeLLM).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("answers common city questions locally without waiting for the model", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const started = performance.now();
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "ما هي طرابزون؟" }],
    });

    expect(result.text).toContain("طرابزون مدينة ساحلية");
    expect(invokeLLM).not.toHaveBeenCalled();
    expect(performance.now() - started).toBeLessThan(300);
  });

  it("answers a foot-stitch healing question with safe practical guidance", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "سويت عملية في رجلي وخياطة جنب الإصبع الكبير، متى يفكون الخياطة؟" }],
    });

    expect(result.text).toContain("10 إلى 14 يوماً");
    expect(result.text).toContain("لا تفكها بنفسك");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("answers nearby hospital questions locally without waiting for the model", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "أنا في طرابزون وأريد أقرب مستشفى" }],
    });

    expect(result.text).toContain("112");
    expect(result.text).toContain("موقعك الحالي");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("answers nearby car workshop questions locally without waiting for the model", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "أقرب ورشة سيارات في يومرا" }],
    });

    expect(result.text).toContain("ورشة سيارات قريبة مني");
    expect(result.text).toContain("موقعك الحالي");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("understands a visitor location in Yomra Sanjak and asks a useful follow-up", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.ai.chat({
      language: "AR",
      messages: [{ role: "user", content: "أنا في يومره في سنجاك حي سنجاك" }],
    });

    expect(result.text).toContain("يومرا");
    expect(result.text).toContain("حي سنجاق");
    expect(result.text).toContain("ماذا تحتاج");
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("keeps only the recent bounded context for faster requests", () => {
    const messages = Array.from({ length: 12 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `${index}-` + "x".repeat(1400),
    }));
    const compacted = compactChatHistory(messages);

    expect(compacted).toHaveLength(8);
    expect(compacted[0]?.content.length).toBe(1200);
    expect(compacted[7]?.content).toBe("x".repeat(1200));
  });
});
