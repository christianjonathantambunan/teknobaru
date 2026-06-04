import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

const MOODS = [
  { value: "lapar_berat", label: "😤 Lapar banget" },
  { value: "santai", label: "😌 Santai aja" },
  { value: "pengen_coba", label: "🤩 Pengen coba yang baru" },
  { value: "buru_buru", label: "⚡ Lagi buru-buru" },
];

const SELERA = [
  { value: "pedas", label: "🌶️ Pedas" },
  { value: "manis", label: "🍯 Manis" },
  { value: "gurih", label: "🧂 Gurih" },
  { value: "segar", label: "🍃 Segar / ringan" },
  { value: "berkuah", label: "🍜 Berkuah" },
];

const KATEGORI = [
  { value: "semua", label: "🍽️ Semua" },
  { value: "makanan", label: "🍛 Makanan berat" },
  { value: "minuman", label: "🥤 Minuman" },
  { value: "snack", label: "🍟 Snack / gorengan" },
];

const BUDGET = [
  { value: "5000-10000", label: "< Rp 10.000" },
  { value: "10000-15000", label: "Rp 10.000 – 15.000" },
  { value: "15000-20000", label: "Rp 15.000 – 20.000" },
  { value: "20000-99999", label: "> Rp 20.000" },
];

function SelectGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                backgroundColor: active ? "var(--primary-light)" : "var(--surface)",
                color: active ? "var(--primary)" : "var(--text-main)",
                fontWeight: active ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
                transition: "var(--transition)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationCard({ rec, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--border)",
        backgroundColor: "var(--surface)",
        cursor: "pointer",
        transition: "var(--transition)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-sm)",
          background: "linear-gradient(135deg, var(--primary-light), #FFF8E7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          flexShrink: 0,
        }}
      >
        🍽️
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>{rec.itemName}</p>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{rec.tenantName}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontWeight: 800, color: "var(--primary)", fontSize: "15px" }}>
          Rp {Number(rec.price).toLocaleString("id-ID")}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Lihat menu →</p>
      </div>
    </div>
  );
}

export function AiRecommendation() {
  const navigate = useNavigate();
  const [mood, setMood] = useState("santai");
  const [selera, setSelera] = useState("gurih");
  const [kategori, setKategori] = useState("semua");
  const [budget, setBudget] = useState("10000-15000");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { explanation, recommendations }
  const [error, setError] = useState(null);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const moodLabel = MOODS.find(m => m.value === mood)?.label || mood;
    const seleraLabel = SELERA.find(s => s.value === selera)?.label || selera;
    const kategoriLabel = KATEGORI.find(k => k.value === kategori)?.label || kategori;
    const budgetLabel = BUDGET.find(b => b.value === budget)?.label || budget;

    const message = `Mood saya: ${moodLabel}. Selera: ${seleraLabel}. Kategori yang diinginkan: ${kategoriLabel}. Budget saya: ${budgetLabel}. Tolong rekomendasikan menu yang paling cocok!`;

    try {
      const res = await fetch(`${API_URL}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationHistory: [] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghubungi AI");

      setResult({
        explanation: data.reply,
        recommendations: data.recommendations || [],
      });
    } catch (err) {
      setError("Gagal mendapatkan rekomendasi. Pastikan backend berjalan dan API key sudah diisi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: "64px",
        borderRadius: "var(--radius-lg)",
        border: "1.5px solid var(--border)",
        backgroundColor: "var(--surface)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Header banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "40px" }}>🤖</div>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            AI Assistant
          </p>
          <h3 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "4px" }}>
            Bingung mau makan apa?
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
            Ceritain mood & seleramu, AI MEALQ langsung kasih rekomendasi yang pas!
          </p>
        </div>
      </div>

      {/* Form + Result */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: result ? "1fr 1fr" : "1fr",
          gap: "0",
          transition: "all 0.4s ease",
        }}
      >
        {/* Form */}
        <div style={{ padding: "32px", borderRight: result ? "1.5px solid var(--border)" : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <SelectGroup label="Mood kamu sekarang" options={MOODS} value={mood} onChange={setMood} />
            <SelectGroup label="Selera" options={SELERA} value={selera} onChange={setSelera} />
            <SelectGroup label="Kategori" options={KATEGORI} value={kategori} onChange={setKategori} />
            <SelectGroup label="Budget" options={BUDGET} value={budget} onChange={setBudget} />

            <button
              className="btn btn-primary"
              onClick={handleGetRecommendation}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                marginTop: "4px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  AI lagi mikirin kamu...
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </span>
              ) : "✨ Dapatkan Rekomendasi"}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        {result && (
          <div style={{ padding: "32px", backgroundColor: "var(--background)", animation: "fadeIn 0.4s ease" }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }`}</style>

            <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Hasil Rekomendasi AI
            </p>

            {/* AI explanation text */}
            <div
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                marginBottom: "20px",
                border: "1px solid var(--border)",
                fontSize: "14px",
                lineHeight: 1.65,
                color: "var(--text-main)",
                whiteSpace: "pre-wrap",
              }}
            >
              {result.explanation}
            </div>

            {/* Recommendation cards */}
            {result.recommendations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)" }}>
                  Menu yang direkomendasikan:
                </p>
                {result.recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={idx}
                    rec={rec}
                    onClick={() => navigate(`/tenant/${rec.tenantId}`)}
                  />
                ))}
              </div>
            )}

            {error && (
              <p style={{ color: "var(--danger)", fontSize: "14px" }}>{error}</p>
            )}

            <button
              onClick={() => setResult(null)}
              style={{
                marginTop: "20px",
                fontSize: "13px",
                color: "var(--text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "var(--font-sans)",
              }}
            >
              ← Ubah preferensi
            </button>
          </div>
        )}

        {error && !result && (
          <div style={{ padding: "32px", display: "flex", alignItems: "center" }}>
            <p style={{ color: "var(--danger)", fontSize: "14px" }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
