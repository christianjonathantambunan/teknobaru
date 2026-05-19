import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft } from "../components/icons";

export function TenantMenu({ handleAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTenant, setActiveTenant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/tenants/${id}`).then(res => {
        if (!res.ok) throw new Error("Tenant not found");
        return res.json();
      }),
      fetch(`/api/tenants/${id}/menu`).then(res => res.json())
    ])
    .then(([tenantData, menuData]) => {
      setActiveTenant(tenantData);
      const items = menuData.flatMap(cat => cat.items);
      setMenuItems(items);
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch tenant details:", err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Memuat detail tenant...</div>;
  }

  if (!activeTenant) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "16px" }}>Tenant tidak ditemukan</h2>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          <IconArrowLeft /> Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ padding: "24px 0" }}>
      <button
        className="btn btn-ghost"
        onClick={() => navigate("/")}
        style={{ marginBottom: "32px", paddingLeft: 0, fontSize: "16px" }}
      >
        <IconArrowLeft /> Kembali ke Beranda
      </button>

      <div
        className="glass"
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
          marginBottom: "48px",
          padding: "32px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <img
          src={activeTenant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400"}
          alt={activeTenant.storeName}
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "var(--radius-md)",
            objectFit: "cover",
            boxShadow: "var(--shadow-md)"
          }}
        />
        <div>
          <span className="badge" style={{ marginBottom: "12px", display: "inline-block", backgroundColor: "var(--primary)", color: "white" }}>
            {activeTenant.category || "Makanan & Minuman"}
          </span>
          <h2 style={{ fontSize: "40px", fontWeight: 800, marginBottom: "12px" }}>
            {activeTenant.storeName}
          </h2>
          <p className="text-muted" style={{ fontSize: "16px", maxWidth: "600px", lineHeight: 1.6 }}>
            {activeTenant.description}
          </p>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
            ⭐ {activeTenant.rating || "4.5"}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "32px" }}>
        Menu Tersedia 🍽️
      </h3>
      <div className="grid-cards">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="modern-card"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <img
              src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400"}
              alt={item.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                padding: "24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{item.name}</h4>
                <p
                  className="text-primary"
                  style={{ fontSize: "20px", fontWeight: 800 }}
                >
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                }}
                onClick={() => handleAddToCart({ ...item, tenantId: activeTenant.id })}
              >
                + Tambah ke Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
