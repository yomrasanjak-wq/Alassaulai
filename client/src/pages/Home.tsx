  async function askAssistant(value: string, attachedImage?: string) {
    const trimmed = value.trim();
    if ((!trimmed && !attachedImage) || chatMutation.isPending || chatImageBusy) return;
    const userText = trimmed || "حلّل الصورة المرفقة واشرح لي ما يظهر فيها.";
    const routeRequest = parseRouteRequest(trimmed) ?? undefined;
    const nextMessages: ChatMessage[] = [...chatMessages, { from: "user", text: userText, imageDataUrl: attachedImage }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatImageDataUrl(undefined);
    try {
      const response = await chatMutation.mutateAsync({
        language,
        messages: nextMessages.map((message, index) => ({
          role: message.from as "user" | "assistant",
          content: message.text,
          ...(index === nextMessages.length - 1 && message.imageDataUrl ? { imageDataUrl: message.imageDataUrl } : {}),
        })),
      });
      setChatMessages((messages) => [...messages, { from: "assistant", text: response.text, route: routeRequest }]);
      if ("errorCode" in response) {
        notify("تعذر الحصول على إجابة من النموذج", response.text, "error");
      } else {
        notify("وصل رد المساعد", "يمكنك متابعة الإجابة أو فتح الخريطة إذا كان السؤال عن طريق.", "success");
      }
    } catch (error) {
      console.error("[ALASSAUL chat] request failed", error);
      setChatMessages((messages) => [...messages, { from: "assistant", text: getChatErrorMessage(error, userText) }]);
      notify("تعذر إكمال الطلب", "جرّب مرة أخرى أو اكتب السؤال بصياغة أقصر.", "error");
    }
  }
