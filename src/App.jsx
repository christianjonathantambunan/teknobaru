import { useState } from "react";
import { tenants, menuItems } from "./data/mockData";
import "./index.css";

// --- ICONS (SVG) ---
const IconCart = () => (
  <svg
    xmlns="http://www.w3.org/200.svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);
const IconArrowLeft = () => (
  <svg
    xmlns="http://www.w3.org/200.svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const IconStore = () => (
  <svg
    xmlns="http://www.w3.org/200.svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

function App() {
  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const [view, setView] = useState("home"); // home, tenant, checkout, dashboard
  const [role, setRole] = useState("user"); // user, tenant
  const [activeTenant, setActiveTenant] = useState(null);
  const [cart, setCart] = useState([]);

  // --- Handlers ---
  const handleTenantClick = (tenant) => {
    setActiveTenant(tenant);
    setView("tenant");
  };

  const handleAddToCart = (item) => {
    setCart([...cart, { ...item, cartId: Date.now() }]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="app-wrapper">
      {/* Navbar */}
      <nav
        style={{
          backgroundColor: "var(--surface)",
          padding: "16px 0",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: 700,
            }}
            onClick={() => setView("home")}
          >
            MEAL<span style={{ color: "var(--secondary)" }}>Q</span>
          </h1>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {role === "user" && (
              <button
                className="btn btn-outline"
                onClick={() => setView("checkout")}
              >
                <IconCart /> {cart.length} | Rp{" "}
                {cartTotal.toLocaleString("id-ID")}
              </button>
            )}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setView(e.target.value === "tenant" ? "dashboard" : "home");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <option value="user">Mode Pembeli</option>
              <option value="tenant">Mode Penjual</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="container"
        style={{ padding: "32px 24px", minHeight: "80vh" }}
      >
        {/* --- VIEW: HOME --- */}
        {view === "home" && role === "user" && (
          <div className="animate-slide-up">
            <h2 style={{ marginBottom: "8px", fontSize: "28px" }}>
              Mau makan apa hari ini?
            </h2>
            <p className="text-muted" style={{ marginBottom: "32px" }}>
              Pilih tenant kantin favoritmu dan pesan tanpa antre.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {tenants.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleTenantClick(t)}
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-4px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <img
                    src={t.image}
                    alt={t.name}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                        {t.name}
                      </h3>
                      <span className="badge">⭐ {t.rating}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: "14px" }}>
                      {t.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: TENANT MENU --- */}
        {view === "tenant" && activeTenant && role === "user" && (
          <div className="animate-slide-up">
            <button
              className="btn btn-ghost"
              onClick={() => setView("home")}
              style={{ marginBottom: "24px", paddingLeft: 0 }}
            >
              <IconArrowLeft /> Kembali
            </button>

            <div
              style={{
                display: "flex",
                gap: "24px",
                alignItems: "flex-start",
                marginBottom: "40px",
              }}
            >
              <img
                src={activeTenant.image}
                alt={activeTenant.name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "var(--radius-lg)",
                  objectFit: "cover",
                }}
              />
              <div>
                <h2 style={{ fontSize: "32px", marginBottom: "8px" }}>
                  {activeTenant.name}
                </h2>
                <p className="text-muted">{activeTenant.description}</p>
                <span
                  className="badge"
                  style={{ marginTop: "12px", display: "inline-block" }}
                >
                  {activeTenant.category}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: "24px", marginBottom: "24px" }}>
              Menu Tersedia
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              {menuItems[activeTenant.id]?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "16px",
                    backgroundColor: "var(--surface)",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "var(--radius-sm)",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{item.name}</h4>
                      <p
                        className="text-primary"
                        style={{ fontWeight: 700, marginTop: "4px" }}
                      >
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        alignSelf: "flex-end",
                      }}
                      onClick={() => handleAddToCart(item)}
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: CHECKOUT --- */}
        {view === "checkout" && role === "user" && (
          <div
            className="animate-slide-up"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <button
              className="btn btn-ghost"
              onClick={() => setView("home")}
              style={{ marginBottom: "24px", paddingLeft: 0 }}
            >
              <IconArrowLeft /> Kembali Belanja
            </button>
            <h2 style={{ fontSize: "28px", marginBottom: "24px" }}>
              Keranjang Pesanan
            </h2>

            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <IconCart />
                <p style={{ marginTop: "16px" }}>
                  Keranjang Anda masih kosong.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "24px",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600 }}>{item.name}</h4>
                      <p className="text-muted" style={{ fontSize: "14px" }}>
                        Catatan: -
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <p style={{ fontWeight: 600 }}>
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>

                      <button
                        onClick={() => handleRemoveFromCart(item.cartId)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "red",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "24px 0 0",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  <p>Total Bayar</p>
                  <p className="text-primary">
                    Rp {cartTotal.toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    padding: "16px",
                    fontSize: "18px",
                  }}
                  onClick={() => {
                    alert(
                      "Pesanan Berhasil Dibuat! Silakan ambil di Kantin dalam 15 Menit.",
                    );
                    setCart([]);
                    setView("home");
                  }}
                >
                  Buat Pesanan Sekarang
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: TENANT DASHBOARD --- */}
        {role === "tenant" && (
          <div className="animate-slide-up">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <IconStore />
              <h2 style={{ fontSize: "28px" }}>Dashboard Penjual</h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <h3>Pesanan Masuk Hari Ini</h3>
                <p
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    marginTop: "8px",
                  }}
                >
                  12
                </p>
              </div>
              <div
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "white",
                  padding: "24px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <h3>Total Pendapatan</h3>
                <p
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    marginTop: "8px",
                  }}
                >
                  Rp 185k
                </p>
              </div>
            </div>

            <div style={{ marginTop: "40px" }}>
              <h3 style={{ marginBottom: "16px" }}>Pesanan Terbaru (Mock)</h3>
              <div
                style={{
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  border: "1px solid var(--border)",
                }}
              >
                <p>
                  <strong>#ORD-001</strong> - 2x Ayam Geprek Bu Rum -{" "}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: "var(--success)",
                      color: "white",
                    }}
                  >
                    Selesai
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
