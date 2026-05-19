import { useNavigate, useLocation } from "react-router-dom";

export function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get("orderId") || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div
      className="animate-slide-up"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh"
      }}
    >
      <div
        className="glass"
        style={{
          textAlign: "center",
          padding: "56px 40px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          maxWidth: "500px",
          width: "100%",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Dekorasi Confetti/Glow */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "200px",
          height: "200px",
          background: "var(--primary)",
          filter: "blur(80px)",
          opacity: 0.2,
          zIndex: 0,
          borderRadius: "50%"
        }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "var(--success)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: "48px",
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
            Pesanan Berhasil! 🎉
          </h2>
          <p className="text-muted" style={{ fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
            Terima kasih telah memesan. Silakan tunjukkan nomor pesanan ini ke kasir kantin untuk mengambil makanan Anda.
          </p>

          <div
            style={{
              background: "var(--background)",
              padding: "24px",
              borderRadius: "var(--radius-md)",
              marginBottom: "40px",
              border: "1px dashed var(--border)"
            }}
          >
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>
              Nomor Pesanan Anda
            </p>
            <p style={{ fontSize: "36px", fontWeight: 800, color: "var(--primary)", letterSpacing: "2px" }}>
              #{orderId}
            </p>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <button
              className="btn btn-outline"
              style={{ flex: 1, padding: "16px" }}
              onClick={() => navigate("/dashboard")} // Seolah-olah user bisa cek dashboard riwayatnya
            >
              Lihat Pesanan
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "16px" }}
              onClick={() => navigate("/")}
            >
              Menu Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
