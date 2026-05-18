import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login({ setRole }) {
  const navigate = useNavigate();
  const [loginRole, setLoginRole] = useState("user");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setRole(loginRole);
    if (loginRole === "tenant") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-up">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "8px" }}>
            <span className="text-gradient">MEAL</span>
            <span style={{ color: "var(--secondary)" }}>Q</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "16px" }}>Pesan makan tanpa antre</p>
        </div>

        <div className="role-selector">
          <div
            className={`role-option ${loginRole === "user" ? "active" : ""}`}
            onClick={() => setLoginRole("user")}
          >
            👨‍🎓 Pembeli
          </div>
          <div
            className={`role-option ${loginRole === "tenant" ? "active" : ""}`}
            onClick={() => setLoginRole("tenant")}
          >
            🏪 Penjual
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan email Anda"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: "32px" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan password Anda"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "18px", justifyContent: "center" }}
          >
            Masuk ke Akun
          </button>
        </form>
      </div>
    </div>
  );
}
