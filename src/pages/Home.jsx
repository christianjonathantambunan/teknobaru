import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => {
        setTenants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tenants:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Memuat daftar tenant...</div>;

  return (
    <div className="animate-slide-up" style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "12px", fontSize: "36px", fontWeight: 800 }}>
          Mau makan apa hari ini? 🍔
        </h2>
        <p className="text-muted" style={{ fontSize: "18px" }}>
          Pilih tenant kantin favoritmu dan pesan tanpa antre.
        </p>
      </div>

      <div className="grid-cards">
        {tenants.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/tenant/${t.id}`)}
            className="modern-card"
            style={{ cursor: "pointer" }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={t.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400"}
                alt={t.storeName}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                ⭐ {t.rating}
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h3 style={{ fontSize: "20px", fontWeight: 700 }}>
                  {t.storeName}
                </h3>
              </div>
              <span className="badge" style={{ display: "inline-block", marginBottom: "12px" }}>
                {t.category || "Makanan & Minuman"}
              </span>
              <p className="text-muted" style={{ fontSize: "15px", lineHeight: 1.5 }}>
                {t.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
