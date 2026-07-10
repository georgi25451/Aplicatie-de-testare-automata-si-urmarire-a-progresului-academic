import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOneTest, submitTest } from "../../services/testService.js";
import { getToken, getUser } from "../../utils/storage.js";
import MathText from "../../components/MathText/MathText.jsx";
import "./TestSession.css";

function TestSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const [testData, setTestData] = useState(null);
  const [raspunsuri, setRaspunsuri] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!token || user?.rol !== "ELEV") {
      navigate("/auth");
      return;
    }
    loadTest();
  }, [id]);

  useEffect(() => {
    let interval = null;
    if (!loading && !error && !finalResult) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (finalResult) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading, error, finalResult]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const data = await getOneTest(id, token);
      
      // scor !== null înseamnă că testul a fost deja trimis (inclusiv scor 0 = toate greșite)
      if (data.scor !== null && data.scor !== undefined) {
           setError("Ai susținut deja acest test! Mergi la statistici pentru a vedea rezultatele.");
      } else {
           setTestData(data);
      }
    } catch (err) {
      setError("Acces refuzat sau testul nu există.");
    } finally {
      setLoading(false);
    }
  };

  const handeOptionChange = (idIntrebare, varianta) => {
    setRaspunsuri(prev => ({
      ...prev,
      [idIntrebare]: varianta
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm("Ești sigur că vrei să trimiți testul?")) return;
    
    setSubmitting(true);
    try {
      const response = await submitTest(id, raspunsuri, token);
      setFinalResult(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
       alert(err.response?.data?.message || "Eroare la trimiterea testului.");
    } finally {
       setSubmitting(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="ts-layout"><div className="ts-loading">Se asamblează testul...</div></div>;
  if (error) return <div className="ts-layout"><div className="ts-container" style={{color: 'red', textAlign:'center'}}>{error}<br/><br/><button className="ts-btn-back" onClick={()=>navigate('/elev')}>Înapoi</button></div></div>;

  const intrebari = testData?.Intrebaris || [];
  const answeredCount = Object.keys(raspunsuri).length;
  const progressPercent = intrebari.length > 0 ? (answeredCount / intrebari.length) * 100 : 0;

  return (
    <div className="ts-layout">
      <div className="ts-container">
        
        {/* Progress Bar & Timer Header */}
        {!finalResult && (
          <div className="ts-sticky-header">
            <div className="ts-progress-info">
               <span className="ts-progress-text">Progres: {answeredCount} / {intrebari.length} întrebări</span>
               <span className="ts-timer">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="ts-progress-bar-bg">
               <div className="ts-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}

        {finalResult ? (
          <div className="ts-result-banner">
            <div className="ts-trophy"></div>
            <h2>Test Finalizat! Scor: {finalResult.scor} XP</h2>
            <p>Timp scurs: {formatTime(elapsedSeconds)}</p>
            <p>Verifică mai jos răspunsurile corecte și explicațiile.</p>
            <button className="ts-btn-back" onClick={() => navigate("/elev")}>
              Înapoi la Dashboard
            </button>
          </div>
        ) : (
          <header className="ts-header">
             <div className="ts-title">
               <h1>{testData?.TestTemplate?.numeTemplate || `Test de matematică`}</h1>
               <p>Rezolvă cu atenție și bifează răspunsul corect.</p>
             </div>
             <div>
               <span className="ts-badge">{testData?.TestTemplate?.nivel || testData?.dificultate || 'Test'}</span>
             </div>
          </header>
        )}

        <div className="ts-questions">
          {intrebari.map((intrebare, index) => {
            const selectat = raspunsuri[intrebare.idIntrebare];
            return (
              <div key={intrebare.idIntrebare} className="ts-question-card">
                <div className="ts-q-header">
                  <div className="ts-q-number">{index + 1}</div>
                  <h3 className="ts-q-text">
                    <MathText text={intrebare.textIntrebare} />
                  </h3>
                </div>
                
                <div className="ts-options">
                   {['A', 'B', 'C', 'D'].map(litera => {
                       const cheieText = `varianta${litera}`;
                       if (!intrebare[cheieText]) return null;
                       let optionClass = '';
                       if (finalResult) {
                           if (litera === intrebare.raspunsCorect) {
                               optionClass = 'correct';
                           } else if (selectat === litera) {
                               optionClass = 'wrong';
                           }
                       } else if (selectat === litera) {
                           optionClass = 'selected';
                       }

                       return (
                         <label 
                            key={litera} 
                            className={`ts-option ${optionClass}`}
                         >
                            <input 
                              type="radio" 
                              name={`q_${intrebare.idIntrebare}`}
                              value={litera}
                              className="ts-radio"
                              checked={selectat === litera}
                              onChange={() => !finalResult && handeOptionChange(intrebare.idIntrebare, litera)}
                              disabled={!!finalResult}
                            />
                            <span className="ts-opt-letter">{litera})</span>
                            <span className="ts-opt-text">
                              <MathText text={intrebare[cheieText]} />
                            </span>
                         </label>
                       );
                   })}
                </div>
                {finalResult && (
                  <div className={`ts-explanation ${selectat === intrebare.raspunsCorect ? 'is-correct' : 'is-wrong'}`}>
                    <h4>Explicație:</h4>
                    {selectat === intrebare.raspunsCorect ? (
                       <div>Răspunsul tău este corect!</div>
                    ) : (
                       <div>
                          <MathText text={intrebare.explicatieGreseli || "Nu a fost oferită o explicație pentru această întrebare."} />
                       </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!finalResult && (
          <div className="ts-actions">
             <button 
               className="ts-btn-submit" 
               onClick={handleSubmit} 
               disabled={submitting}
             >
               {submitting ? "Se corectează..." : "Trimite răspunsurile"}
             </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default TestSession;
