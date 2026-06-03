import { Link, useNavigate } from "react-router-dom";
import { IconCart } from "./icons";

export function Navbar({ role, cartCount, cartTotal, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav
      className="glass"
      style={{
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 50,
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
        <Link
          to={role === "user" ? "/" : "/dashboard"}
          style={{
            fontSize: "26px",
            fontWeight: 800,
            textDecoration: "none"
          }}
        >
          <span className="text-gradient">MEAL</span>
          <span style={{ color: "var(--secondary)" }}>Q</span>
        </Link>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {role === "user" && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Link to="/my-orders" style={{ textDecoration: "none", color: "var(--text-main)", fontWeight: 600 }}>
                Pesanan Saya
              </Link>
              <Link to="/checkout" className="btn btn-outline" style={{ textDecoration: "none", backgroundColor: "var(--surface)" }}>
                <IconCart /> {cartCount} | Rp {cartTotal.toLocaleString("id-ID")}
              </Link>
            </div>
          )}
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ color: "var(--danger)" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}