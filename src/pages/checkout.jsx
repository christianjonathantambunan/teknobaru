import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft, IconCart } from "../components/icons";

const API_URL = import.meta.env.VITE_API_URL || "";

export function Checkout({ cart, cartTotal, handleRemoveFromCart, handleUpdateQuantity, setCart }) {
  const navigate = useNavigate();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    setIsCreatingOrder(true);
    try {
      // 1. Dapatkan studentId dummy
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
      });
      const loginData = await loginRes.json();
      
      if (!loginData.user) throw new Error("Gagal login sebagai dummy student");
      
      // 2. Format items untuk API
      const apiItems = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        priceAtTime: item.price
      }));

      // 3. Ambil tenantId dari item pertama
      const tenantId = cart[0].tenantId;

      // 4. Kirim pesanan ke backend untuk buat order & dapatkan snap_token
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: loginData.user.id,
          tenantId: tenantId,
          items: apiItems
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Gagal membuat pesanan");

      // 5. Trigger Midtrans Snap Popup
      if (orderData.snapToken) {
        if (orderData.snapToken === "dummy_token_replace_keys_in_env") {
          alert("Server Key Midtrans Anda belum diatur di .env! Pembayaran gagal.");
          return;
        }

        window.snap.pay(orderData.snapToken, {
          onSuccess: function(result) {
            // Payment success
            setCart([]);
            navigate(`/success?orderId=${orderData.id}`);
          },
          onPending: function(result) {
            // Pending payment (e.g., waiting for VA transfer)
            alert("Menunggu pembayaran Anda!");
            setCart([]);
            navigate(`/success?orderId=${orderData.id}`);
          },
          onError: function(result) {
            alert("Pembayaran gagal!");
          },
          onClose: function() {
            console.log("Popup ditutup tanpa menyelesaikan pembayaran");
          }
        });
      } else {
        throw new Error("Gagal mendapatkan token pembayaran dari server");
      }
      
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat membuat pesanan: " + error.message);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div
      className="animate-slide-up"
      style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 0" }}
    >
      <button
        className="btn btn-ghost"
        onClick={() => navigate("/")}
        style={{ marginBottom: "32px", paddingLeft: 0 }}
      >
        <IconArrowLeft /> Kembali Belanja
      </button>
      <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "32px" }}>
        Keranjang Pesanan 🛒
      </h2>

      {cart.length === 0 ? (
        <div
          className="glass"
          style={{
            textAlign: "center",
            padding: "64px 24px",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border)",
          }}
        >
          <div style={{ color: "var(--text-muted)", marginBottom: "16px", transform: "scale(2)" }}>
            <IconCart />
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Keranjang masih kosong</h3>
          <p className="text-muted" style={{ marginBottom: "24px" }}>
            Yuk, jelajahi tenant kantin dan pesan makanan favoritmu!
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Cari Makanan
          </button>
        </div>
      ) : (
        <div
          className="glass"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {cart.map((item) => (
            <div
              key={item.cartId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover" }} 
                />
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{item.name}</h4>
                  <p className="text-muted" style={{ fontSize: "14px" }}>
                    Tanpa catatan
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--background)", padding: "6px", borderRadius: "var(--radius-full)" }}>
                  <button 
                    onClick={() => handleUpdateQuantity(item.cartId, -1)}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", transition: "var(--transition)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, width: "20px", textAlign: "center" }}>{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.cartId, 1)}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", transition: "var(--transition)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                  >
                    +
                  </button>
                </div>

                <div style={{ textAlign: "right", minWidth: "120px" }}>
                  <p style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)" }}>
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                  <p className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                    Rp {item.price.toLocaleString("id-ID")} / item
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveFromCart(item.cartId)}
                  style={{
                    background: "var(--primary-light)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    color: "var(--danger)",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "var(--transition)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
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
              padding: "32px 0 24px",
              fontSize: "24px",
              fontWeight: 800,
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
              padding: "18px",
              fontSize: "18px",
            }}
            onClick={handleCreateOrder}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? "Memproses..." : "Lanjut Pembayaran Asli"}
          </button>
        </div>
      )}
    </div>
  );
}
