import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest, getPublicProfiluri } from "../../services/authService.js";
import "../LoginRegisterPage.css"

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [eroare, setEroare] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState("ELEV");
  const [profiluri, setProfiluri] = useState([]);
  const [idProfilMate, setIdProfilMate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiluri = async () => {
      try {
        const res = await getPublicProfiluri();
        setProfiluri(res.data || []);
        if (res.data && res.data.length > 0) {
          setIdProfilMate(res.data[0].idProfilMate);
        }
      } catch (err) {
        console.error("Nu s-au putut prelua profilurile:", err);
      }
    };
    fetchProfiluri();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEroare("");
    if (parola.length < 4) {
      setEroare("Parola trebuie să aibă minim 4 caractere.");
      return;
    }
    try {
      const payload = { email, parola, nume, prenume, rol };
      if (rol === "ELEV" && idProfilMate) {
        payload.idProfilMate = idProfilMate;
      }
      await registerRequest(payload);
      navigate("/auth");
    } catch (error) {
      setEroare(
        error.response?.data?.message || "A apărut o eroare la înregistrare!"
      );
    }
  };

  return (
    <div className="mf-bg">
      <div className="mf-header">
               <div className="mf-title">MathMentor</div>
        <div className="mf-subtitle">Platforma ta de învățare</div>
      </div>
      <div className="mf-card mf-card--wide">
        <div className="mf-tabs">
          <button onClick={() => navigate("/auth")}>Autentificare</button>
          <button className="active">Înregistrare</button>
        </div>
        <form className="mf-form" onSubmit={handleSubmit}>
          <div className="mf-welcome">
            <div className="mf-welcome-title">Creează un cont nou</div>
            <div className="mf-welcome-desc">Completează datele pentru a te înregistra.</div>
          </div>
          <div className="mf-row">
            <div className="mf-group">
              <label>Nume</label>
              <input
                type="text"
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                placeholder="Numele tău"
                autoComplete="name"
              />
            </div>
            <div className="mf-group">
              <label>Prenume</label>
              <input
                type="text"
                value={prenume}
                onChange={(e) => setPrenume(e.target.value)}
                placeholder="Prenumele tău"
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
              />
              <span className="mf-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Ascunde" : "Arată"}
              </span>
            </div>
          </div>

          {profiluri.length > 0 ? (
            <div className="mf-row">
              <div className="mf-group">
                <label>Rol</label>
                <select value={rol} onChange={e => {
                  const newRol = e.target.value;
                  setRol(newRol);
                  if (newRol === "ADMIN") setIdProfilMate("");
                  else if (profiluri.length > 0) setIdProfilMate(profiluri[0].idProfilMate);
                }}>
                  <option value="ELEV">Elev</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="mf-group">
                <label>Profil Matematică</label>
                <select value={idProfilMate} onChange={e => setIdProfilMate(e.target.value)}>
                  <option value="">Nu e necesar</option>
                  {profiluri.map(p => (
                    <option key={p.idProfilMate} value={p.idProfilMate}>
                      {p.denumireProfilMate || p.denumire}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mf-group">
              <label>Rol</label>
              <select value={rol} onChange={e => setRol(e.target.value)}>
                <option value="ELEV">Elev</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          )}

          {eroare && <div className="mf-error">{eroare}</div>}
          <button type="submit" className="mf-btn">
            Înregistrare <span className="mf-arrow">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;