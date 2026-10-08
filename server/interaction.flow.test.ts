import { describe, expect, it } from "vitest";
import { getChatErrorMessage, getLiveFrameMode, getMicrophoneErrorMessage, getSpeechTranscript } from "../shared/interactionFlow";

describe("broadcast and voice interaction flow", () => {
  it("replaces the iframe with the stopped state and restores it on resume", () => {
    expect(getLiveFrameMode("loading")).toBe("iframe");
    expect(getLiveFrameMode("ready")).toBe("iframe");
    expect(getLiveFrameMode("stopped")).toBe("stopped");
    expect(getLiveFrameMode("unavailable")).toBe("iframe");
  });

  it("returns actionable Arabic microphone messages", () => {
    expect(getMicrophoneErrorMessage("not-allowed")).toContain("إذن الميكروفون");
    expect(getMicrophoneErrorMessage("service-not-allowed")).toContain("إذن الميكروفون");
    expect(getMicrophoneErrorMessage("no-speech")).toContain("لم أسمع");
    expect(getMicrophoneErrorMessage("network")).toContain("اكتب سؤالك");
  });

  it("extracts the complete transcript before sending it to chat", () => {
    const results = [
      [{ transcript: "ما هي أفضل" }],
      [{ transcript: "مدينة في الشمال التركي؟" }],
    ] as unknown as ArrayLike<{ [key: number]: { transcript?: string } }>;
    expect(getSpeechTranscript(results)).toBe("ما هي أفضل مدينة في الشمال التركي؟");
    expect(getSpeechTranscript(undefined)).toBe("");
  });

  it("distinguishes assistant connectivity and configuration failures", () => {
    expect(getChatErrorMessage(new Error("LLM invoke failed: 503 Service Unavailable"))).toContain("تعذر الاتصال");
    expect(getChatErrorMessage(new Error("OPENAI_API_KEY is not configured"))).toContain("غير مهيأة");
    expect(getChatErrorMessage(new Error("429 rate limit"))).toContain("مشغول");
    expect(getChatErrorMessage(new Error("unexpected failure"))).toContain("أعد إرسال السؤال");
  });
});
