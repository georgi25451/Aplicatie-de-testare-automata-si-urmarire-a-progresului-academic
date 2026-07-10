import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, clearAuthData } from "../../utils/storage.js";
import { getAllTemplates, getAllProfiluri } from "../../services/templateService.js";
import { getAllTeste, generateTestByTemplate } from "../../services/testService.js";
import { getRecomandariByUser } from "../../services/recomandareService.js";
import { getProvocareAzi, raspundeProvocare, getIstoricProvocari } from "../../services/provocareService.js";
import MathText from "../../components/MathText/MathText.jsx";
import ScorBarChart from "../../components/ScorBarChart/ScorBarChart.jsx";
import useCountUp from "../../hooks/useCountUp.js";
import "./ElevDashboard.css";

const parseChapters = (text) => {
  if (!text) return [];
  const paragraphs = text.split(/\n\n+/);
  const chapters = [];
  let current = null;
  for (const para of paragraphs) {
    if (/^\*\*(.+)\*\*$/.test(para.trim())) {
      if (current) chapters.push(current);
      current = { title: para.trim().slice(2, -2), content: '' };
    } else if (current) {
      current.content = current.content ? current.content + '\n\n' + para : para;
    }
  }
  if (current) chapters.push(current);
  return chapters;
};

function ElevDashboard() {
  const [templates, setTemplates] = useState([]);
  const [testeIstoric, setTesteIstoric] = useState([]);
  const [recomandareAI, setRecomandareAI] = useState(null);
  const [openChapters, setOpenChapters] = useState(new Set());

  const [provocareAzi, setProvocareAzi] = useState(null);
  const [provocareEroare, setProvocareEroare] = useState("");
  const [istoricProvocari, setIstoricProvocari] = useState([]);
  const [selectedRaspunsProvocare, setSelectedRaspunsProvocare] = useState("");
  const [loadingProvocare, setLoadingProvocare] = useState(false);

  const [activeTab, setActiveTab] = useState("acasa"); // "acasa", "teste", "provocari", "progres", "statistici", "teorie", "profil"
  const [loading, setLoading] = useState(true);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [eroare, setEroare] = useState("");

  const [profiluri, setProfiluri] = useState([]);
  const [selectedProfil, setSelectedProfil] = useState("");
  const [selectedNivel, setSelectedNivel] = useState("usor");

  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (!user || user.rol !== "ELEV") {
      clearAuthData();
      navigate("/auth");
      return;
    }
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    setLoading(true);
    setEroare("");
    try {
      const profRes = await getAllProfiluri(token);
      setProfiluri(profRes.data || []);

      const tmplRes = await getAllTemplates('all', token);
      setTemplates(tmplRes.data || []);

      const testeRes = await getAllTeste(token);
      setTesteIstoric(testeRes.data || []);

      const recRes = await getRecomandariByUser(token);
      if (recRes.data && recRes.data.length > 0) {
        const validRecs = recRes.data
          .filter(r => r.textRecomandare && r.textRecomandare.trim().length > 0)
          .sort((a, b) => new Date(b.dataGenerare) - new Date(a.dataGenerare));
        setRecomandareAI(validRecs.length > 0 ? validRecs[0] : null);
      } else {
        setRecomandareAI(null);
      }

    } catch (error) {
      console.error("Eroare la încărcarea datelor", error);
      setEroare(error.response?.data?.message || "Eroare la încărcarea datelor de pe server!");
    }

    //provocarile se incarca separat pentru a nu bloca restul dashboard-ului
    try {
      const provAziRes = await getProvocareAzi(token);
      setProvocareAzi(provAziRes.data);
      setProvocareEroare("");
    } catch (err) {
      const msg = err.response?.data?.message || "Provocarea zilnică nu este disponibilă momentan.";
      console.warn("Provocare zilnică:", msg);
      setProvocareAzi(null);
      setProvocareEroare(msg);
    }

    try {
      const istoricProvRes = await getIstoricProvocari(token);
      setIstoricProvocari(istoricProvRes.data.data || []);
    } catch (err) {
      console.warn("Eroare istoric provocări:", err.message);
    }
    setLoading(false);
  };

  const handleStartTest = async () => {
    const profilId = user.idProfilMate || selectedProfil;
    if (!profilId) {
      setEroare("Nu ai un profil selectat!");
      return;
    }

    const sablon = templates.find(t => t.idProfilMate === parseInt(profilId) && t.nivel === selectedNivel);

    if (!sablon) {
      setEroare("Nu am găsit niciun șablon activ pentru nivelul selectat pe profilul tău.");
      return;
    }

    setGeneratingTest(true);
    setEroare("");
    try {
      const response = await generateTestByTemplate(sablon.idTemplate, token);
      if (response && response.testId) {
        navigate(`/elev/test/${response.testId}`);
      }
    } catch (err) {
      setEroare(err.response?.data?.message || "Eroare la generarea testului asistată de AI.");
    }
    setGeneratingTest(false);
  };

  const handleRaspunde = async () => {
    if (!selectedRaspunsProvocare || !provocareAzi) return;
    setLoadingProvocare(true);
    try {
        const res = await raspundeProvocare(provocareAzi.idProvocare, selectedRaspunsProvocare, token);
        setProvocareAzi(res.data);
        
        // Refresh istoric
        const istoricProvRes = await getIstoricProvocari(token);
        setIstoricProvocari(istoricProvRes.data.data || []);
    } catch (err) {
        setEroare("Eroare la trimiterea răspunsului.");
    }
    setLoadingProvocare(false);
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/auth");
  };

  const toggleChapter = (idx) => {
    setOpenChapters(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const xpCounter = testeIstoric.reduce((acc, test) => acc + (test.scor || 0), 0);
  const nextLevelXp = 1000;
  const xpLevel = Math.floor(xpCounter / nextLevelXp) + 1;
  const progressPercent = Math.min(((xpCounter % nextLevelXp) / nextLevelXp) * 100, 100);

  const calculeazaStreak = () => {
    if (testeIstoric.length === 0) return 0;

    const dates = testeIstoric
      .filter(t => t.dataTest)
      .map(t => new Date(t.dataTest).toDateString());
    const uniqueDates = [...new Set(dates)].map(d => new Date(d));

    uniqueDates.sort((a, b) => b - a);

    const azi = new Date();
    azi.setHours(0, 0, 0, 0);

    let streak = 0;
    let nextExpected = new Date(azi);

    const primaZi = uniqueDates[0];
    primaZi.setHours(0, 0, 0, 0);

    const diffPrimaZi = (azi - primaZi) / (1000 * 3600 * 24);
    if (diffPrimaZi > 1) return 0;

    if (diffPrimaZi === 1) {
      nextExpected.setDate(nextExpected.getDate() - 1);
    }

    for (let d of uniqueDates) {
      if (d.getTime() === nextExpected.getTime()) {
        streak++;
        nextExpected.setDate(nextExpected.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculeazaStreak();
  const teorieChapters = recomandareAI ? parseChapters(recomandareAI.textRecomandare) : [];

  const animatedStreak = useCountUp(currentStreak);
  const animatedXp = useCountUp(xpCounter % nextLevelXp);
  const animatedTeste = useCountUp(testeIstoric.length);
  
  // LOGICĂ BADGES
  const scorMaxim = Math.max(...testeIstoric.map(t => t.scor || 0), 0);
  const obtinutPrimulTest = testeIstoric.length > 0;
  const obtinutVeteran = testeIstoric.length >= 10;
  const obtinutPerfect = scorMaxim >= 100;
  const obtinutOnFire = currentStreak >= 3;

  const idCurent = user.idProfilMate || selectedProfil;
  const profilObj = profiluri.find(p => p.idProfilMate === parseInt(idCurent));
  const numeProfilAles = profilObj ? (profilObj.denumireProfilMate || profilObj.denumire) : "Nespecificat";

  let parsedVarianteAzi = {};
  if (provocareAzi && provocareAzi.varianteRaspuns) {
      try {
          let v = provocareAzi.varianteRaspuns;
          if (typeof v === 'string') v = JSON.parse(v);
          if (typeof v === 'string') v = JSON.parse(v); // just in case it was double stringified
          parsedVarianteAzi = v;
      } catch (e) {
          console.error("Failed to parse variante", e);
      }
  }

  return (
    <div className="elev-layout">
      <aside className="elev-sidebar">
        <div className="elev-sidebar-logo">MathMentor</div>
        <div className="elev-sidebar-user">
          <div className="user-avatar">{user.nume ? user.nume.charAt(0).toUpperCase() : 'E'}</div>
          <div className="user-info">
            <span className="user-name">{user.prenume} {user.nume}</span>
            <span className="user-role">Elev</span>
          </div>
        </div>
        <nav className="elev-sidebar-nav">
          {[
            { key: "acasa", label: "Acasă" },
            { key: "teste", label: "Susține test" },
            { key: "provocari", label: "Provocări zilnice" },
            { key: "progres", label: "Progresul meu" },
            { key: "statistici", label: "Statistici și realizări" },
            { key: "teorie", label: "Teorie personalizată" },
            { key: "profil", label: "Profil" },
          ].map(item => (
            <button
              key={item.key}
              className={`elev-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="elev-sidebar-bottom">
          <button className="elev-nav-item logout" onClick={handleLogout}>Deconectare</button>
        </div>
      </aside>

      <main className="elev-main">
        {loading ? (
          <div className="elev-loading">Se încarcă datele...</div>
        ) : (
          <>
            <header className="elev-header">
              <h1>Bună ziua, {user.prenume || user.email.split('@')[0]}!</h1>
              <p>Continuați pregătirea pentru examenul de matematică.</p>
            </header>

            {eroare && <div className="elev-error">{eroare}</div>}

            {activeTab === "acasa" && (
              <>
                <div className="elev-widgets">
                  <div className={`stat-card streak-card${currentStreak > 0 ? ' streak-active' : ''}`}>
                    <div className="stat-top">
                      <span className={`stat-icon streak-fire${currentStreak > 0 ? ' on' : ''}`}>🔥</span>
                      <span className="stat-label">Serie Activă</span>
                    </div>
                    <div className="stat-number">
                      <span className="stat-big">{animatedStreak}</span>
                      <span className="stat-unit">zile</span>
                    </div>
                    <p className="stat-desc">
                      {currentStreak > 0 ? 'Bravo! Revino mâine pentru a nu pierde seria.' : 'Rezolvă un test azi pentru a începe o serie.'}
                    </p>
                  </div>

                  <div className="stat-card level-card">
                    <div className="stat-top">
                      <span className="stat-icon level-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </span>
                      <span className="stat-label">Nivel {xpLevel}</span>
                    </div>
                    <div className="stat-number">
                      <span className="stat-big">{animatedXp}</span>
                      <span className="stat-unit">/ {nextLevelXp} XP</span>
                    </div>
                    <div className="stat-progress-bg">
                      <div className="stat-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="stat-desc">Rezolvați teste pentru a avansa în nivel.</p>
                  </div>

                  <div className="stat-card tests-card">
                    <div className="stat-top">
                      <span className="stat-icon tests-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </span>
                      <span className="stat-label">Teste Rezolvate</span>
                    </div>
                    <div className="stat-number">
                      <span className="stat-big">{animatedTeste}</span>
                    </div>
                    <p className="stat-desc">Total teste finalizate.</p>
                  </div>
                </div>

                <div className="provocare-section">
                  <div className="elev-card">
                    <span className="provocare-tag">Provocarea zilei</span>
                    <h3 className="provocare-title">Antrenament rapid</h3>
                    {provocareAzi ? (
                      !provocareAzi.rezolvat ? (
                        <>
                          <p className="provocare-desc">
                            Provocarea zilnică este disponibilă. Răspundeți corect pentru a acumula experiență.
                          </p>
                          <button onClick={() => navigate('/elev/provocare')} className="btn-start-test">
                            Începe provocarea zilei
                          </button>
                        </>
                      ) : (
                        <div className="provocare-done">
                          <h4>Provocarea de astăzi a fost finalizată.</h4>
                          <p>Revino mâine pentru o nouă întrebare.</p>
                        </div>
                      )
                    ) : (
                      <p className="provocare-desc">{provocareEroare || "Se încarcă provocarea..."}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === "teste" && (
              <div className="elev-column">
                <h2 className="section-title">Configurează un test nou</h2>
                <div className="elev-card test-config-card" style={{ maxWidth: 520 }}>
                  <h3>Test pentru profilul: {numeProfilAles}</h3>
                  <p>Alegeți nivelul de dificultate pentru a genera un test personalizat.</p>
                  <div className="config-form">
                    <div className="config-group">
                      <label>Nivel de dificultate</label>
                      <select value={selectedNivel} onChange={(e) => setSelectedNivel(e.target.value)} className="config-select">
                        <option value="usor">Ușor</option>
                        <option value="mediu">Mediu</option>
                        <option value="greu">Greu</option>
                      </select>
                    </div>
                    <button className="btn-start-test main-action-btn" onClick={handleStartTest} disabled={generatingTest}>
                      {generatingTest ? "Se generează testul..." : "Susține test"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "provocari" && (
              <div className="elev-column">
                <h2 className="section-title">Istoricul provocărilor zilnice</h2>
                {istoricProvocari.length === 0 ? (
                  <div className="empty-state">Nu ai rezolvat nicio provocare încă.</div>
                ) : (
                  <div className="prov-history-card">
                    {istoricProvocari.map(prov => (
                      <div key={prov.idProvocare} className="prov-history-item">
                        <div className="prov-item-header">
                          <span className="prov-item-date">{formatDate(prov.dataProvocare)}</span>
                          <span className={`prov-item-result ${prov.esteCorect ? 'corect' : 'gresit'}`}>
                            {prov.esteCorect ? "Corect" : "Greșit"}
                          </span>
                        </div>
                        <div className="prov-item-question">
                          <MathText text={prov.intrebareGenerata} />
                        </div>
                        <div className="prov-item-explanation">
                          <p><strong>Răspunsul tău:</strong> {prov.raspunsAles} &nbsp;|&nbsp; <strong>Răspuns corect:</strong> {prov.raspunsCorect}</p>
                          <p><strong>Explicație:</strong></p>
                          <MathText text={prov.explicatieAI} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "progres" && (
              <div className="elev-column">
                <h2 className="section-title">Progresul meu</h2>
                <ScorBarChart teste={testeIstoric} />
              </div>
            )}

            {activeTab === "statistici" && (
              <div className="elev-column">
                <div className="elev-card badges-card full-badges">
                  <h3>Realizările tale</h3>
                  <div className="badges-grid">
                    <div className={`badge-item ${obtinutPrimulTest ? 'unlocked' : 'locked'}`}>
                      <h4>Începător</h4>
                      <p>Rezolvă primul test pe platformă.</p>
                    </div>
                    <div className={`badge-item ${obtinutOnFire ? 'unlocked' : 'locked'}`}>
                      <h4>Activ</h4>
                      <p>Păstrează un streak de cel puțin 3 zile.</p>
                    </div>
                    <div className={`badge-item ${obtinutPerfect ? 'unlocked' : 'locked'}`}>
                      <h4>Scor perfect</h4>
                      <p>Obține 100 XP la un test.</p>
                    </div>
                    <div className={`badge-item ${obtinutVeteran ? 'unlocked' : 'locked'}`}>
                      <h4>Veteran</h4>
                      <p>Rezolvă minim 10 teste.</p>
                    </div>
                  </div>
                </div>

                <h2 className="section-title" style={{ marginTop: 24 }}>Istoricul rezultatelor</h2>
                <div className="history-list">
                  {testeIstoric.length === 0 ? (
                    <div className="empty-state">Nu ai susținut niciun test încă.</div>
                  ) : (
                    testeIstoric.map((test, index) => (
                      <div key={test.idTest} className="history-card">
                        <div className="hist-details">
                          <div className="hist-name">Test {testeIstoric.length - index}{test.TestTemplate && ` — ${test.TestTemplate.numeTemplate}`}</div>
                          <div className="hist-date">{formatDate(test.dataTest)}</div>
                        </div>
                        <div className="hist-score">{test.scor} XP</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "teorie" && (
              <div className="elev-teorie-tab">
                <h2 className="section-title">Teorie personalizată</h2>
                {recomandareAI ? (
                  <div className="theory-card">
                    <div className="theory-header">
                      <div className="theory-header-left">
                        <div className="theory-ai-badge">AI</div>
                        <div>
                          <div className="theory-title">Recomandare personalizată</div>
                          <div className="theory-date">Generata pe {formatDate(recomandareAI.dataGenerare)}</div>
                        </div>
                      </div>
                      <div className="theory-meta">Bazată pe profilul și istoricul tău de teste</div>
                    </div>
                    <div className="theory-content">
                      {teorieChapters.length > 0 ? (
                        <div className="theory-accordion">
                          {teorieChapters.map((ch, idx) => (
                            <div key={idx} className={`theory-chapter${openChapters.has(idx) ? ' open' : ''}`}>
                              <button
                                className="theory-chapter-header"
                                onClick={() => toggleChapter(idx)}
                              >
                                <span className="theory-chapter-num">{idx + 1}</span>
                                <span className="theory-chapter-title">{ch.title}</span>
                                <span className="theory-chapter-arrow">▶</span>
                              </button>
                              <div className="theory-chapter-body">
                                <div className="theory-chapter-inner">
                                  <MathText text={ch.content} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <MathText text={recomandareAI.textRecomandare} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="theory-empty-card">
                    <div className="theory-empty-icon">AI</div>
                    <h3>Nu există încă o recomandare</h3>
                    <p>Susține primul test pentru a genera teoria personalizată bazată pe greșelile tale.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profil" && (
              <div className="elev-column">
                <h2 className="section-title">Profilul meu</h2>
                <div className="elev-card profil-card" style={{ maxWidth: 520 }}>
                  <div className="profil-table">
                    <div className="profil-row">
                      <span className="profil-label">Nume</span>
                      <span className="profil-value">{user.nume}</span>
                    </div>
                    <div className="profil-row">
                      <span className="profil-label">Prenume</span>
                      <span className="profil-value">{user.prenume}</span>
                    </div>
                    <div className="profil-row">
                      <span className="profil-label">Email</span>
                      <span className="profil-value">{user.email}</span>
                    </div>
                    <div className="profil-row">
                      <span className="profil-label">Profil matematic</span>
                      <span className="profil-value accent">{numeProfilAles}</span>
                    </div>
                    <div className="profil-row">
                      <span className="profil-label">Teste Susținute</span>
                      <span className="profil-value">{testeIstoric.length}</span>
                    </div>
                    <div className="profil-row">
                      <span className="profil-label">Provocări Rezolvate</span>
                      <span className="profil-value">{istoricProvocari.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ElevDashboard;