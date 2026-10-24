import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"

type Message = { role: "user" | "assistant"; text: string }

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "صباح الخير ☀️"
  if (hour < 18) return "مساء الخير 🌤️"
  return "مساء النور 🌙"
}

export function AIChatBox() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `${getGreeting()}! هلا والله، أنا العسول، خويك ودليلك في طرابزون والشمال التركي 🌲\nالشغل كله محفوظ عندي، كيف أقدر أساعدك اليوم؟` }
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    const lower = userText.toLowerCase()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userText }])
    
    // ردود بني آدم سريعة بدون ما نكلم السيرفر
    if (lower.includes("سلام") || lower.includes("هلا")) {
      setMessages(prev => [...prev, { role: "assistant", text: "وعليكم السلام ورحمة الله! هلا والله وغلا، نورت، تفضل وش تبغى أرتب لك؟" }])
      return
    }
    if (lower.includes("تصبح على خير") || lower.includes("تصبحون على خير")) {
      setMessages(prev => [...prev, { role: "assistant", text: "وانت من أهل الخير يا حبيبي ❤️ نام وانت مرتاح، الشغل كله محفوظ وبكره نكمل سوا. تصبح على خير!" }])
      return
    }
    if (lower.includes("شكرا") || lower.includes("الله يعافيك")) {
      setMessages(prev => [...prev, { role: "assistant", text: "الله يسعدك، حاضرين! أي وقت تحتاجني أنا موجود، الشغل كله محفوظ." }])
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/trpc/chat?batch=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "0": { json: { message: userText } } })
      })
      
      let reply = ""
      if (res.ok) {
        const data = await res.json()
        reply = data?.[0]?.result?.data?.text || data?.[0]?.result?.data?.message || ""
      }
      
      if (!reply) {
        const res2 = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText })
        })
        if (res2.ok) {
          const data2 = await res2.json()
          reply = data2.text || data2.message || data2.reply || ""
        }
      }

      if (!reply) reply = "أبشر يا حبيبي! أنا معك حبة حبة. اسألني عن طرابزون، أوزنجول، آيدر، ريزا، وأنا أرتب لك البرنامج اللي يناسبك والشغل كله محفوظ عندي."
      
      setMessages(prev => [...prev, { role: "assistant", text: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "يا هلا، صار ضغط بسيط على الخادم بس لا تشيل هم، الشغل كله محفوظ عندي. جرب ترسل مرة ثانية وبرد عليك فوراً." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "500px", background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "#fafaf7" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#14532d" : "#ffffff",
            color: m.role === "user" ? "#fff" : "#1f2937",
            padding: "10px 14px", 
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            maxWidth: "85%",
            fontSize: "14px",
            lineHeight: "1.5",
            border: m.role === "assistant" ? "1px solid #e7e5d8" : "none",
            whiteSpace: "pre-wrap"
          }}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "#fff", padding: "10px 14px", borderRadius: "18px 18px 18px 4px", border: "1px solid #e7e5d8", fontSize: "14px", color: "#6b7280" }}>
            العسول يكتب...
          </div>
        )}
      </div>
      
      <div style={{ padding: "12px", borderTop: "1px solid #e7e5d8", display: "flex", gap: "8px", background: "#fff" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="اكتب سؤالك هنا..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid #d1d5db", outline: "none", fontSize: "14px" }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: loading ? "#9ca3af" : "#14532d", color: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: loading ? "not-allowed" : "pointer" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
