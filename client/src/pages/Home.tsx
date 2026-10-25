const startVoice = useCallback(async () => {
  try {
    setVoiceError(null);
    setVoiceStatus("requesting");

    if (typeof window !== "undefined" && !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setVoiceError(getMicrophoneErrorMessage("not-supported"));
      setVoiceStatus("idle");
      notify("المتصفح لا يدعم التعرف الصوتي", "استخدم Chrome على الجوال أو الكمبيوتر.", "error");
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setVoiceError(getMicrophoneErrorMessage("not-supported"));
      setVoiceStatus("idle");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "AR" ? "ar-SA" : language === "TR" ? "tr-TR" : "en-US";

    recognition.onstart = () => {
      setVoiceStatus("listening");
      setChatInput("");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i][0]?.transcript) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      transcript = transcript.trim();
      transcript = transcript.replace(/\b(\S+)(?:\s+\1\b)+/gi, "$1");
      if (transcript) {
        setChatInput(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("[speech] error", event);
      setVoiceError(getMicrophoneErrorMessage(event.error));
      setVoiceStatus("idle");
    };

    recognition.onend = () => {
      setVoiceStatus("idle");
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
      if (chatInput.trim().length > 2) {
        clearTimeout(speechIdleTimerRef.current ?? undefined);
        speechIdleTimerRef.current = window.setTimeout(() => {
          askAssistant(chatInput, chatImageDataUrl ?? undefined);
        }, 1000);
      }
    };

    recognition.start();
  } catch (error) {
    console.error("[speech] start failed", error);
    setVoiceError(getMicrophoneErrorMessage());
    setVoiceStatus("idle");
  }
}, [language, chatInput, chatImageDataUrl, askAssistant]);
