import { useState, useEffect } from "react";
import { IconStore } from "../components/icons";

export function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING": return "Menunggu";
      case "PREPARING": return "Diproses";
      case "COMPLETED": return "Selesai";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" };
      case "PREPARING": return { bg: "rgba(252, 163, 17, 0.1)", color: "var(--secondary)" };
      case "COMPLETED": return { bg: "rgba(16, 185, 129, 0.1)", color: "var(--success)" };
      default: return { bg: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)" };
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Memuat dashboard...</div>;

  return (
    <div className="animate-slide-up" style={{ padding: "24px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <div style={{
          background: "var(--primary-light)",
          padding: "16px",
          borderRadius: "16px",
          color: "var(--primary)"
        }}>
          <IconStore />
        </div>
        <div>
          <h2 style={{ fontSize: "32px", fontWeight: 800 }}>Dashboard Penjual</h2>
          <p className="text-muted">Ringkasan performa kantin Anda hari ini.</p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        <div
          className="glass"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 600 }}>Pesanan Masuk Hari Ini</h3>
            <p
              style={{
                fontSize: "56px",
                fontWeight: 800,
                marginTop: "8px",
                color: "var(--primary)"
              }}
            >
              {totalOrders}
            </p>
          </div>
          <div style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            fontSize: "120px",
            opacity: 0.05,
            zIndex: 0
          }}>
            📦
          </div>
        </div>

        <div
          className="glass"
          style={{
            padding: "32px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--surface) 0%, var(--primary-light) 100%)"
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: 600 }}>Total Pendapatan</h3>
            <p
              style={{
                fontSize: "48px",
                fontWeight: 800,
                marginTop: "8px",
                color: "var(--text-main)"
              }}
            >
              <span style={{ fontSize: "24px", verticalAlign: "middle" }}>Rp</span> {totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
          <div style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            fontSize: "120px",
            opacity: 0.1,
            zIndex: 0
          }}>
            💰
          </div>
        </div>
      </div>

      <div style={{ marginTop: "48px" }}>
        <h3 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: 700 }}>Daftar Pesanan</h3>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "var(--surface)", borderRadius: "var(--radius-lg)" }}>
            <p className="text-muted">Belum ada pesanan masuk.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <div
                  key={order.id}
                  className="modern-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px" }}>
                        #{order.id.split('-')[0]}
                      </p>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 700,
                          fontSize: "12px"
                        }}
                      >
                        {translateStatus(order.status)}
                      </span>
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-muted" style={{ marginBottom: "4px" }}>
                          {item.quantity}x {item.menuItem?.name}
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontWeight: 700, marginTop: "8px" }}>Total: Rp {order.totalAmount.toLocaleString("id-ID")}</p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {order.status === "PENDING" && (
                      <button
                        className="btn btn-outline"
                        style={{ borderColor: "var(--secondary)", color: "var(--secondary)", padding: "10px 20px" }}
                        onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                      >
                        Terima & Proses
                      </button>
                    )}
                    {order.status === "PREPARING" && (
                      <button
                        className="btn btn-primary"
                        style={{ background: "var(--success)", padding: "10px 20px" }}
                        onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
