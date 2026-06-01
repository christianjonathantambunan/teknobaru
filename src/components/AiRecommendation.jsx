import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const QUICK_PROMPTS = [
  { label: "🤩 Lagi lapar banget!", text: "Aku lagi lapar banget, rekomendasiin menu yang mengenyangkan dong!" },
  { label: "💸 Budget di bawah 15rb", text: "Rekomendasiin menu yang harganya di bawah 15.000 dong" },
  { label: "🌶️ Pengen yang pedas", text: "Pengen makan yang pedas-pedas, ada menu apa?" },
  { label: "🥗 Sesuatu yang ringan", text: "Pengen yang ringan aja, gak terlalu berat buat makan siang" },
];

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "14px 18px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function RecommendationCards({ recommendations, onNavigate }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Menu yang direkomendasikan:
      </p>
      {recommendations.map((rec, idx) => (
        <button
          key={idx}
          onClick={() => onNavigate(rec.tenantId)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--primary-light)",
            border: "1.5px solid rgba(255, 107, 107, 0.2)",
            cursor: "pointer",
            transition: "var(--transition)",
            textAlign: "left",
            width: "100%",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255, 107, 107, 0.2)"}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>{rec.itemName}</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rec.tenantName}</p>
          </div>
          <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "14px", whiteSpace: "nowrap" }}>
            Rp {Number(rec.price).toLocaleString("id-ID")}
          </span>
        </button>
      ))}
    </div>
  );
}

export function AiRecommendation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      display: "Halo! 👋 Aku asisten MEALQ. Mau makan apa hari ini? Ceritain selera, budget, atau mood kamu dan aku bantu cariin yang pas! 🍽️",
      recommendations: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", display: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, conversationHistory }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", display: data.reply, recommendations: data.recommendations },
      ]);
      setConversationHistory(data.updatedHistory);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", display: "Aduh, aku lagi ada gangguan teknis nih 😅 Coba lagi ya!", recommendations: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      role: "assistant",
      display: "Halo! 👋 Aku asisten MEALQ. Mau makan apa hari ini? Ceritain selera, budget, atau mood kamu dan aku bantu cariin yang pas! 🍽️",
      recommendations: null,
    }]);
    setConversationHistory([]);
    setInput("");
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(255, 107, 107, 0.4)",
            fontSize: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            transition: "var(--transition)",
            animation: "ai-pulse 2.5s ease-in-out infinite",
          }}
          title="Tanya AI MEALQ"
        >
          🤖
          <style>{`
            @keyframes ai-pulse {
              0%, 100% { box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4); }
              50% { box-shadow: 0 8px 36px rgba(255, 107, 107, 0.7), 0 0 0 8px rgba(255, 107, 107, 0.1); }
            }
          `}</style>
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 107, 107, 0.1)",
            backgroundColor: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
            maxHeight: "calc(100vh - 48px)",
            animation: "chat-open 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <style>{`
            @keyframes chat-open {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                🤖
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "15px", color: "white" }}>AI MEALQ</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Asisten pilih menu kamu</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Reset percakapan"
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              backgroundColor: "var(--background)",
            }}
          >
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => sendMessage(qp.text)}
                disabled={loading}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  border: "1.5px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--text-main)",
                  transition: "var(--transition)",
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "280px",
              maxHeight: "350px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px",
                  alignItems: "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      marginTop: "2px",
                    }}
                  >
                    🤖
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "80%",
                    backgroundColor: msg.role === "user" ? "var(--primary)" : "var(--background)",
                    color: msg.role === "user" ? "white" : "var(--text-main)",
                    borderRadius: msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    padding: "10px 14px",
                    fontSize: "14px",
                    lineHeight: 1.55,
                    fontWeight: 500,
                  }}
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.display}</p>
                  {msg.role === "assistant" && msg.recommendations && (
                    <RecommendationCards
                      recommendations={msg.recommendations}
                      onNavigate={(tenantId) => { navigate(`/tenant/${tenantId}`); setIsOpen(false); }}
                    />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                  }}
                >
                  🤖
                </div>
                <div style={{ backgroundColor: "var(--background)", borderRadius: "18px 18px 18px 4px" }}>
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
              backgroundColor: "var(--surface)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Tulis preferensi kamu..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "var(--radius-full)",
                border: "1.5px solid var(--border)",
                fontSize: "14px",
                outline: "none",
                fontFamily: "var(--font-sans)",
                backgroundColor: "var(--background)",
                color: "var(--text-main)",
                transition: "var(--transition)",
              }}
              onFocus={e => e.target.style.borderColor = "var(--primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: "var(--transition)",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
