import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../services/authService.js";
import { saveAuthData } from "../../utils/storage.js";
import "../LoginRegisterPage.css"

function LoginPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [eroare, setEroare] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEroare("");
    try {
      const data = await loginRequest({ email, parola });
      saveAuthData(data.token, data.user);
      if (data.user.rol === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/elev");
      }
    } catch (error) {
      setEroare(
        error.response?.data?.message || "A apărut o eroare la autentificare!"
      );
    }
  };

  return (
    <div className="mf-bg">
      <div className="mf-header">
        <div className="mf-title">MathMentor</div>
        <div className="mf-subtitle">Platforma ta de învățare</div>
      </div>
      <div className="mf-card">
        <div className="mf-tabs">
          <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Autentificare</button>
          <button className={tab === "register" ? "active" : ""} onClick={() => navigate("/register")}>Înregistrare</button>
        </div>
        <form className="mf-form" onSubmit={handleSubmit}>
          <div className="mf-welcome">
            <div className="mf-welcome-title">Bine ai revenit!</div>
            <div className="mf-welcome-desc">Introdu datele pentru a accesa tabloul de bord.</div>
          </div>
          <div className="mf-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume@universitate.ro"
              autoComplete="username"
            />
          </div>
          <div className="mf-group">
            <label>Parolă</label>
            <div className="mf-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <span className="mf-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Ascunde" : "Arată"}
              </span>
            </div>
          </div>
        
          {eroare && <div className="mf-error">{eroare}</div>}
          <button type="submit" className="mf-btn">
            Autentificare <span className="mf-arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;