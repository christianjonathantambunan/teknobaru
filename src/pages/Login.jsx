import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

export function Login({ setRole }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loginRole, setLoginRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? `${API_URL}/api/auth/register` : `${API_URL}/api/auth/login`;
    const payload = {
      email,
      password,
      role: loginRole === "user" ? "STUDENT" : "TENANT",
      ...(isRegister && { name: name || "User" }),
      ...(isRegister && loginRole === "tenant" && { storeName: storeName || "Toko Baru" }),
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan pada server");
      }

      // If success
      setRole(loginRole);
      if (loginRole === "tenant") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-up">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "8px" }}>
            <span className="text-gradient">MEAL</span>
            <span style={{ color: "var(--secondary)" }}>Q</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "16px" }}>Pesan makan tanpa antre</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: "#ffebee", 
            color: "#c62828", 
            padding: "12px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center",
            fontWeight: "500"
          }}>
            ⚠️ {error}
          </div>
        )}

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
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          {isRegister && loginRole === "tenant" && (
            <div className="form-group">
              <label className="form-label">Nama Toko / Kantin</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan nama toko Anda"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required={isRegister && loginRole === "tenant"}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "14px", fontSize: "16px", justifyContent: "center", marginBottom: "16px" }}
          >
            {loading ? "Memproses..." : (isRegister ? "Daftar Akun" : "Masuk ke Akun")}
          </button>

          <div style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
            <span 
              style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "Masuk di sini" : "Daftar terlebih dulu"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
