import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        // Dummy login untuk mendapatkan studentId (sesuai alur saat ini)
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        
        if (!loginData.user) throw new Error("Gagal login sebagai dummy student");

        const studentId = loginData.user.id;
        
        // Fetch orders based on studentId
        const ordersRes = await fetch(`/api/orders?studentId=${studentId}`);
        const ordersData = await ordersRes.json();
        
        if (ordersRes.ok) {
          setOrders(ordersData);
        } else {
          throw new Error(ordersData.error || "Gagal mengambil pesanan");
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING": return "Menunggu";
      case "PREPARING": return "Diproses";
      case "READY": return "Siap Diambil";
      case "COMPLETED": return "Selesai";
      case "CANCELLED": return "Dibatalkan";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" }; 
      case "PREPARING": return { bg: "rgba(252, 163, 17, 0.1)", color: "var(--secondary)" }; 
      case "READY": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }; 
      case "COMPLETED": return { bg: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }; 
      case "CANCELLED": return { bg: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)" }; 
      default: return { bg: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)" };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case "PAID": return { bg: "rgba(16, 185, 129, 0.1)", color: "var(--success)" };
      case "UNPAID": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" };
      default: return { bg: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)" };
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Memuat riwayat pesanan...</div>;

  return (
    <div className="animate-slide-up" style={{ padding: "24px 0", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "32px" }}>Pesanan Saya 🛍️</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
          <p className="text-muted" style={{ marginBottom: "24px" }}>Anda belum memiliki pesanan.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Mulai Pesan Makanan
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map(order => {
            const statusStyle = getStatusColor(order.status);
            const paymentStyle = getPaymentStatusColor(order.paymentStatus);
            
            return (
              <div
                key={order.id}
                className="glass"
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                {/* Header Pesanan */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)" }}>
                      {order.tenant?.storeName || "Kantin"}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      ID Pesanan: <span style={{ fontWeight: 600 }}>#{order.id.split('-')[0]}</span>
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Tanggal: {new Date(order.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                      backgroundColor: statusStyle.bg, color: statusStyle.color
                    }}>
                      Status: {translateStatus(order.status)}
                    </span>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                      backgroundColor: paymentStyle.bg, color: paymentStyle.color
                    }}>
                      Pembayaran: {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: "8px 0" }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>
                        <span style={{ color: "var(--primary)", fontWeight: 700, marginRight: "8px" }}>{item.quantity}x</span>
                        {item.menuItem?.name || "Item Makanan"}
                      </span>
                      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        Rp {(item.priceAtTime * item.quantity).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Pesanan */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Belanja</p>
                    <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                  
                  {order.status === "READY" && (
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "12px", color: "var(--success)", fontWeight: 700 }}>
                        Pesanan siap diambil!
                      </p>
                    </div>
                  )}
                  {order.status === "PENDING" && order.paymentStatus === "UNPAID" && (
                     <div style={{ textAlign: "right" }}>
                       <p style={{ fontSize: "12px", color: "var(--danger)", fontWeight: 700 }}>
                         Selesaikan pembayaran Anda.
                       </p>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
