import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, getUser, clearAuthData } from "../../utils/storage.js";
import { getOneIntrebare, getAllIntrebari, createIntrebare, updateIntrebare, deleteIntrebare, getAllTemplates, getAllProfiluri } from "../../services/templateService.js";
import "../AdminDashboard/AdminDashboard.css";
import "./TemplateDetail.css";
import MathText from "../../components/MathText/MathText.jsx";

function TemplateDetail() {
  const { pid, ttid } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  const [template, setTemplate] = useState(null);
  const [profil, setProfil] = useState(null);
  const [intrebari, setIntrebari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalData, setModalData] = useState({
    textIntrebare: "",
    variantaA: "",
    variantaB: "",
    variantaC: "",
    variantaD: "",
    raspunsCorect: "A",
    explicatieCorecta: "",
    explicatieGreseli: "",
    nivel: "usor"
  });
  const [modalEroare, setModalEroare] = useState("");
  const [showMathGuide, setShowMathGuide] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    incarcaDate();
  }, [pid, ttid]);

  const incarcaDate = async () => {
    setLoading(true);
    setEroare("");
    try {
      const profData = await getAllProfiluri(token);
      const profilGasit = profData.data.find(p => p.idProfilMate === parseInt(pid));
      setProfil(profilGasit);

      const tmplData = await getAllTemplates(pid, token);
      const tmplGasit = tmplData.data.find(t => t.idTemplate === parseInt(ttid));
      setTemplate(tmplGasit);

      const intData = await getAllIntrebari(pid, token);
      // Filtram intrebarile sa corespunda cu nivelul sablonului curent
      const intrebariFiltrate = (intData.data || []).filter(q => q.nivel === tmplGasit.nivel);
      setIntrebari(intrebariFiltrate);
    } catch (error) {
      setEroare(error.response?.data?.message || "Eroare la încărcarea datelor!");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/auth");
  };

  const numeNivel = (nivel) => {
    if (nivel === "usor") return "Ușor";
    if (nivel === "mediu") return "Mediu";
    if (nivel === "greu") return "Greu";
    return nivel;
  };

  const formGol = () => ({
    textIntrebare: "", variantaA: "", variantaB: "", variantaC: "", variantaD: "",
    raspunsCorect: "A", explicatieCorecta: "", explicatieGreseli: "",
    nivel: template ? template.nivel : "usor"
  });

  const deschideCreare = () => {
    setModalMode("create");
    setModalData(formGol());
    setModalEroare("");
    setShowModal(true);
  };

  const deschideEditare = (intrebare) => {
    setModalMode("edit");
    setModalData({
      idIntrebare: intrebare.idIntrebare,
      textIntrebare: intrebare.textIntrebare || "",
      variantaA: intrebare.variantaA || "",
      variantaB: intrebare.variantaB || "",
      variantaC: intrebare.variantaC || "",
      variantaD: intrebare.variantaD || "",
      raspunsCorect: intrebare.raspunsCorect || "A",
      explicatieCorecta: intrebare.explicatieCorecta || "",
      explicatieGreseli: intrebare.explicatieGreseli || "",
      nivel: intrebare.nivel || "usor"
    });
    setModalEroare("");
    setShowModal(true);
  };

  const deschideStergere = (intrebare) => {
    setDeleteTarget(intrebare);
    setShowDelete(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalEroare("");
    try {
      const data = {
        textIntrebare: modalData.textIntrebare,
        variantaA: modalData.variantaA,
        variantaB: modalData.variantaB,
        variantaC: modalData.variantaC,
        variantaD: modalData.variantaD,
        raspunsCorect: modalData.raspunsCorect,
        explicatieCorecta: modalData.explicatieCorecta,
        explicatieGreseli: modalData.explicatieGreseli,
        nivel: modalData.nivel
      };

      if (modalMode === "create") {
        await createIntrebare(pid, data, token);
      } else {
        await updateIntrebare(pid, modalData.idIntrebare, data, token);
      }
      setShowModal(false);
      await incarcaDate();
    } catch (error) {
      setModalEroare(error.response?.data?.message || "A apărut o eroare!");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIntrebare(pid, deleteTarget.idIntrebare, token);
      setShowDelete(false);
      setDeleteTarget(null);
      await incarcaDate();
    } catch (error) {
      setEroare(error.response?.data?.message || "Eroare la ștergere!");
      setShowDelete(false);
    }
  };

  return (
    <div className="td-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">MathMentor</div>
        <div className="admin-sidebar-subtitle">Panou Administrare</div>
        <nav className="admin-sidebar-nav">
          <button className="admin-sidebar-item" onClick={() => navigate("/admin")}>
            Șabloane Teste
          </button>
          <button className="admin-sidebar-item active">
            Detalii Șablon
          </button>
        </nav>
        <div className="admin-sidebar-bottom">
          <button className="admin-sidebar-item" onClick={handleLogout}>
            Deconectare
          </button>
        </div>
      </aside>

      <main className="td-main">
        <button className="td-back-btn" onClick={() => navigate("/admin")}>
          ← Înapoi la Șabloane
        </button>

        {eroare && <div className="td-error">{eroare}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            Se încarcă datele...
          </div>
        ) : (
          <>
            {template && profil && (
              <div className="td-info-card">
                <span className="td-info-name">{template.numeTemplate}</span>
                <span className="td-tag td-tag-profil">{profil.denumireProfilMate}</span>
                <span className={`td-tag td-tag-${template.nivel}`}>{numeNivel(template.nivel)}</span>
                <span className="td-tag td-tag-count">{intrebari.length} întrebări</span>
              </div>
            )}

            <div className="td-page-header">
              <h1>Întrebări ({intrebari.length})</h1>
              <button className="td-btn-add" onClick={deschideCreare}>
                + Adaugă întrebare
              </button>
            </div>

            {intrebari.length === 0 ? (
              <div className="td-empty">
                Nu există întrebări pentru acest profil. Adaugă prima întrebare!
              </div>
            ) : (
              <div className="td-questions-list">
                {intrebari.map((intr, idx) => (
                  <div className="td-question-card" key={intr.idIntrebare}>
                    <div className="td-q-header">
                      <div className="td-q-number">{idx + 1}</div>
                      <p className="td-q-text">
                        <MathText text={intr.textIntrebare} />
                      </p>
                      <div className="td-q-actions">
                        <button className="td-action-btn" onClick={() => deschideEditare(intr)}>Editează</button>
                        <button className="td-action-btn delete" onClick={() => deschideStergere(intr)}>Șterge</button>
                      </div>
                    </div>
                    <div className="td-variants">
                      {["A", "B", "C", "D"].map(v => (
                        <div key={v} className={`td-variant${intr.raspunsCorect === v ? " correct" : ""}`}>
                          <span className="td-variant-letter">{v}.</span>
                          <span className="td-variant-text">
                            <MathText text={intr[`varianta${v}`] || ""} />
                          </span>
                          {intr.raspunsCorect === v && <span className="td-correct-label">Corect</span>}
                        </div>
                      ))}
                    </div>
                    {(intr.explicatieCorecta || intr.explicatieGreseli) && (
                      <div className="td-explanation">
                        {intr.explicatieCorecta && (
                          <div><strong>Corect:</strong> <MathText text={intr.explicatieCorecta} /></div>
                        )}
                        {intr.explicatieGreseli && (
                          <div><strong>Greșeli:</strong> <MathText text={intr.explicatieGreseli} /></div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showModal && (
        <div className="td-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="td-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <p className="td-modal-title" style={{ margin: 0 }}>
                {modalMode === "create" ? "Adaugă întrebare nouă" : "Editează întrebare"}
              </p>
              <button type="button" className="td-math-guide-btn" onClick={() => setShowMathGuide(!showMathGuide)}>
                {showMathGuide ? "Închide Ghid" : "Ghid Matematic"}
              </button>
            </div>

            {showMathGuide && (
              <div className="td-math-guide">
                <strong>Fracție:</strong> <code>{'$\\frac{a}{b}$'}</code>&nbsp;&nbsp;
                <strong>Putere:</strong> <code>{'$x^2$'}</code>&nbsp;&nbsp;
                <strong>Radical:</strong> <code>{'$\\sqrt{x}$'}</code>&nbsp;&nbsp;
                <strong>Integrală:</strong> <code>{'$\\int_a^b f(x)dx$'}</code>
              </div>
            )}

            <form className="td-modal-form" onSubmit={handleModalSubmit}>
              <div className="td-modal-group">
                <label>Textul întrebării</label>
                <textarea
                  value={modalData.textIntrebare}
                  onChange={e => setModalData({ ...modalData, textIntrebare: e.target.value })}
                  placeholder="Scrie enunțul întrebării..."
                  required
                />
              </div>

              <div className="td-modal-grid">
                <div className="td-modal-group">
                  <label>Varianta A</label>
                  <input type="text" value={modalData.variantaA} onChange={e => setModalData({ ...modalData, variantaA: e.target.value })} />
                </div>
                <div className="td-modal-group">
                  <label>Varianta B</label>
                  <input type="text" value={modalData.variantaB} onChange={e => setModalData({ ...modalData, variantaB: e.target.value })} />
                </div>
                <div className="td-modal-group">
                  <label>Varianta C</label>
                  <input type="text" value={modalData.variantaC} onChange={e => setModalData({ ...modalData, variantaC: e.target.value })} />
                </div>
                <div className="td-modal-group">
                  <label>Varianta D</label>
                  <input type="text" value={modalData.variantaD} onChange={e => setModalData({ ...modalData, variantaD: e.target.value })} />
                </div>
              </div>

              <div className="td-modal-grid">
                <div className="td-modal-group">
                  <label>Răspuns corect</label>
                  <select value={modalData.raspunsCorect} onChange={e => setModalData({ ...modalData, raspunsCorect: e.target.value })}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="td-modal-group">
                  <label>Dificultate</label>
                  <select value={modalData.nivel} onChange={e => setModalData({ ...modalData, nivel: e.target.value })}>
                    <option value="usor">Ușor</option>
                    <option value="mediu">Mediu</option>
                    <option value="greu">Greu</option>
                  </select>
                </div>
              </div>

              <div className="td-modal-group">
                <label>Explicație răspuns corect</label>
                <textarea
                  value={modalData.explicatieCorecta}
                  onChange={e => setModalData({ ...modalData, explicatieCorecta: e.target.value })}
                  placeholder="De ce este corect..."
                />
              </div>

              <div className="td-modal-group">
                <label>Explicație greșeli</label>
                <textarea
                  value={modalData.explicatieGreseli}
                  onChange={e => setModalData({ ...modalData, explicatieGreseli: e.target.value })}
                  placeholder="Ce greșeli frecvente apar..."
                />
              </div>

              {modalEroare && <div className="td-modal-error">{modalEroare}</div>}

              <div className="td-modal-actions">
                <button type="button" className="td-modal-btn secondary" onClick={() => setShowModal(false)}>
                  Anulează
                </button>
                <button type="submit" className="td-modal-btn primary">
                  {modalMode === "create" ? "Adaugă" : "Salvează"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && deleteTarget && (
        <div className="td-delete-overlay" onClick={() => setShowDelete(false)}>
          <div className="td-delete-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmare ștergere</h3>
            <p>
              Ești sigur că vrei să ștergi întrebarea "{deleteTarget.textIntrebare}"?
              Această acțiune este permanentă.
            </p>
            <div className="td-modal-actions">
              <button className="td-modal-btn secondary" onClick={() => setShowDelete(false)}>
                Anulează
              </button>
              <button className="td-modal-btn primary" onClick={handleDelete} style={{ background: "#dc2626" }}>
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateDetail;
