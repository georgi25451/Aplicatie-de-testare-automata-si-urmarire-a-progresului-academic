import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser } from "../../utils/storage.js";
import { getProvocareAzi, raspundeProvocare } from "../../services/provocareService.js";
import MathText from "../../components/MathText/MathText.jsx";
import "../TestSession/TestSession.css"; // Refolosim stilurile de la sesiunea de test

function ProvocareSession() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const [provocareAzi, setProvocareAzi] = useState(null);
  const [selectedRaspuns, setSelectedRaspuns] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || user?.rol !== "ELEV") {
      navigate("/auth");
      return;
    }
    loadProvocare();
  }, []);

  const loadProvocare = async () => {
    try {
      setLoading(true);
      const res = await getProvocareAzi(token);
      setProvocareAzi(res.data);
    } catch (err) {
      setError("Acces refuzat sau nu se poate încărca provocarea zilei.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedRaspuns || !provocareAzi) return;
    setSubmitting(true);
    try {
        const res = await raspundeProvocare(provocareAzi.idProvocare, selectedRaspuns, token);
        setProvocareAzi(res.data);
    } catch (err) {
        alert("Eroare la trimiterea răspunsului.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="ts-layout"><div className="ts-loading">Se încarcă provocarea zilei...</div></div>;
  if (error) return <div className="ts-layout"><div className="ts-container">{error}<br/><br/><button className="ts-btn-back" onClick={()=>navigate('/elev')}>Înapoi</button></div></div>;

  if (!provocareAzi) {
     return <div className="ts-layout"><div className="ts-container">Nu există provocare disponibilă azi. <button className="ts-btn-back" onClick={()=>navigate('/elev')}>Înapoi</button></div></div>;
  }

  // Parsare variante
  let parsedVariante = {};
  if (provocareAzi.varianteRaspuns) {
      try {
          let v = provocareAzi.varianteRaspuns;
          if (typeof v === 'string') v = JSON.parse(v);
          if (typeof v === 'string') v = JSON.parse(v); // just in case
          parsedVariante = v;
      } catch (e) {
          console.error("Failed to parse variante", e);
      }
  }

  return (
    <div className="ts-layout">
      <div className="ts-container">
        <div style={{ marginBottom: '16px' }}>
          <button className="ts-btn-back" onClick={() => navigate("/elev")}>
            ← Înapoi la Dashboard
          </button>
        </div>

        <header className="ts-header">
          <div className="ts-title">
            <h1>Provocarea zilei</h1>
            <p>Rezolvă cu atenție și bifează răspunsul corect pentru a aduna experiență.</p>
          </div>
        </header>

        <div className="ts-questions">
          <div className="ts-question-card">
            <div className="ts-q-header">
              <div className="ts-q-number">1</div>
              <h3 className="ts-q-text">
                <MathText text={provocareAzi.intrebareGenerata} />
              </h3>
            </div>

            <div className="ts-options-grid">
              {['A', 'B', 'C', 'D'].map(litera => {
                const textVarianta = parsedVariante[litera];
                if (!textVarianta) return null;

                let optionClass = '';
                if (provocareAzi.rezolvat) {
                  if (litera === provocareAzi.raspunsCorect) {
                    optionClass = 'correct';
                  } else if (litera === provocareAzi.raspunsAles) {
                    optionClass = 'wrong';
                  }
                } else if (selectedRaspuns === litera) {
                  optionClass = 'selected';
                }

                return (
                  <label key={litera} className={`ts-option ${optionClass}`}>
                    <input
                      type="radio"
                      name="provocare_optiune"
                      value={litera}
                      className="ts-radio"
                      checked={selectedRaspuns === litera}
                      onChange={() => !provocareAzi.rezolvat && setSelectedRaspuns(litera)}
                      disabled={provocareAzi.rezolvat}
                    />
                    <span className="ts-opt-letter">{litera})</span>
                    <span className="ts-opt-text">
                      <MathText text={textVarianta} inline={true} />
                    </span>
                  </label>
                );
              })}
            </div>

            {provocareAzi.rezolvat && (
              <div className={`ts-explanation ${provocareAzi.esteCorect ? 'is-correct' : 'is-wrong'}`}>
                <h4>{provocareAzi.esteCorect ? "Răspuns corect!" : "Răspuns greșit!"}</h4>
                <MathText text={provocareAzi.explicatieAI || "Nu a fost oferită o explicație pentru această întrebare."} />
              </div>
            )}
          </div>
        </div>

        {!provocareAzi.rezolvat && (
          <div className="ts-actions">
            <button
              className="ts-btn-submit"
              onClick={handleSubmit}
              disabled={!selectedRaspuns || submitting}
            >
              {submitting ? "Se corectează..." : "Trimite răspunsul"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProvocareSession;
