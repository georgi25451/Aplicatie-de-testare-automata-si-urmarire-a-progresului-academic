import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, clearAuthData } from "../../utils/storage.js";
import { getAllProfiluri, getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from "../../services/templateService.js";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [profiluri, setProfiluri] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [profilSelectat, setProfilSelectat] = useState(null); // null = toate
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState("");


  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [modalData, setModalData] = useState({ numeTemplate: "", nrIntrebari: "", nivel: "usor", idProfilMate: "" });
  const [modalEroare, setModalEroare] = useState("");




  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();
  const user = getUser();
  const token = getToken();


  useEffect(() => {
    incarcaDate();
  }, []);

  const incarcaDate = async () => {
    setLoading(true);
    setEroare("");
    try {
      const profData = await getAllProfiluri(token);
      setProfiluri(profData.data);


      let allTemplates = [];
      for (const profil of profData.data) {
        const tmplData = await getAllTemplates(profil.idProfilMate, token);

        const tmplCuProfil = tmplData.data.map(t => ({
          ...t,
          denumireProfil: profil.denumireProfilMate
        }));
        allTemplates = [...allTemplates, ...tmplCuProfil];
      }
      setTemplates(allTemplates);


      if (profData.data.length > 0 && !modalData.idProfilMate) {
        setModalData(prev => ({ ...prev, idProfilMate: profData.data[0].idProfilMate }));
      }

    } catch (error) {
      setEroare(error.response?.data?.message || "Eroare la încărcarea datelor!");
    }
    setLoading(false);
  };


  const handleLogout = () => {
    clearAuthData();
    navigate("/auth");
  };


  const templatesFiltrate = profilSelectat
    ? templates.filter(t => t.idProfilMate === profilSelectat)
    : templates;


  const totalSabloane = templates.length;
  const totalProfiluri = profiluri.length;
  const nivelCount = templates.reduce((acc, t) => {
    acc[t.nivel] = (acc[t.nivel] || 0) + 1;
    return acc;
  }, {});
  const nivelPredominant = Object.keys(nivelCount).length > 0
    ? Object.entries(nivelCount).sort((a, b) => b[1] - a[1])[0][0]
    : "-";


  const deschideCreare = () => {
    setModalMode("create");
    setModalData({
      numeTemplate: "",
      nrIntrebari: "",
      nivel: "usor",
      idProfilMate: profiluri.length > 0 ? profiluri[0].idProfilMate : ""
    });
    setModalEroare("");
    setShowModal(true);
  };


  const deschideEditare = (template) => {
    setModalMode("edit");
    setModalData({
      idTemplate: template.idTemplate,
      numeTemplate: template.numeTemplate,
      nrIntrebari: template.nrIntrebari,
      nivel: template.nivel,
      idProfilMate: template.idProfilMate
    });
    setModalEroare("");
    setShowModal(true);
  };


  const deschideVizualizare = (template) => {
    navigate(`/admin/template/${template.idProfilMate}/${template.idTemplate}`);
  };


  const deschideStergere = (template) => {
    setDeleteTarget(template);
    setShowDelete(true);
  };


  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalEroare("");
    try {
      if (modalMode === "create") {
        await createTemplate(modalData.idProfilMate, {
          numeTemplate: modalData.numeTemplate,
          nrIntrebari: parseInt(modalData.nrIntrebari),
          nivel: modalData.nivel
        }, token);
      } else {
        await updateTemplate(modalData.idProfilMate, modalData.idTemplate, {
          numeTemplate: modalData.numeTemplate,
          nrIntrebari: parseInt(modalData.nrIntrebari),
          nivel: modalData.nivel
        }, token);
      }
      setShowModal(false);
      await incarcaDate();
    } catch (error) {
      setModalEroare(error.response?.data?.message || "A apărut o eroare!");
    }
  };


  const handleDelete = async () => {
    try {
      await deleteTemplate(deleteTarget.idProfilMate, deleteTarget.idTemplate, token);
      setShowDelete(false);
      setDeleteTarget(null);
      await incarcaDate();
    } catch (error) {
      setEroare(error.response?.data?.message || "Eroare la ștergere!");
      setShowDelete(false);
    }
  };


  const numeNivel = (nivel) => {
    if (nivel === "usor") return "Ușor";
    if (nivel === "mediu") return "Mediu";
    if (nivel === "greu") return "Greu";
    return nivel;
  };

  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">MathMentor</div>
        <div className="admin-sidebar-subtitle">Panou Administrare</div>
        <nav className="admin-sidebar-nav">
          <button className="admin-sidebar-item active">
            Șabloane Teste
          </button>
        </nav>
        <div className="admin-sidebar-bottom">
          <button className="admin-sidebar-item" onClick={handleLogout}>
            Deconectare
          </button>
        </div>
      </aside>


      <main className="admin-main">

        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Șabloane pentru teste</h1>

          </div>
          <div className="admin-header-right">
            <button className="admin-btn-create" onClick={deschideCreare}>
              + Creează șablon
            </button>
          </div>
        </div>


        {eroare && <div className="mf-error" style={{ marginBottom: 16 }}>{eroare}</div>}


        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            Se încarcă datele...
          </div>
        ) : (
          <>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-label">Total șabloane</div>
                  <div className="admin-stat-value">{totalSabloane}</div>
                </div>
              </div>
              <div className="admin-stat-card">
                <div>
                  <div className="admin-stat-label">Profiluri</div>
                  <div className="admin-stat-value">{totalProfiluri}</div>
                </div>
              </div>
            </div>


            <div className="admin-filter-bar">
              <span className="admin-filter-label">Filtrează:</span>
              <button
                className={`admin-filter-btn ${profilSelectat === null ? "active" : ""}`}
                onClick={() => setProfilSelectat(null)}
              >
                Toate
              </button>
              {profiluri.map(p => (
                <button
                  key={p.idProfilMate}
                  className={`admin-filter-btn ${profilSelectat === p.idProfilMate ? "active" : ""}`}
                  onClick={() => setProfilSelectat(p.idProfilMate)}
                >
                  {p.denumireProfilMate}
                </button>
              ))}
            </div>


            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Informații Șablon</th>
                    <th>Profil</th>
                    <th>Dificultate</th>
                    <th>Nr. întrebări</th>
                    <th>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {templatesFiltrate.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="admin-empty">
                          Nu există șabloane {profilSelectat ? "pentru acest profil" : "încă"}.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    templatesFiltrate.map(t => (
                      <tr key={t.idTemplate}>
                        <td>
                          <div className="admin-table-name">{t.numeTemplate}</div>
                          <div className="admin-table-sub">{t.nrIntrebari} Întrebări</div>
                        </td>
                        <td>
                          <span className="admin-badge-profil">{t.denumireProfil}</span>
                        </td>
                        <td>
                          <span className={`admin-badge-nivel ${t.nivel}`}>{numeNivel(t.nivel)}</span>
                        </td>
                        <td>{t.nrIntrebari}</td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn" onClick={() => deschideVizualizare(t)}>Vizualizează</button>
                            <button className="admin-action-btn" onClick={() => deschideEditare(t)}>Editează</button>
                            <button className="admin-action-btn delete" onClick={() => deschideStergere(t)}>Șterge</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {templatesFiltrate.length > 0 && (
                <div className="admin-table-footer">
                  Se afișează {templatesFiltrate.length} din {totalSabloane} șabloane active.
                </div>
              )}
            </div>
          </>
        )}
      </main>


      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-title">
              {modalMode === "create" ? "Creează șablon nou" : "Editează șablon"}
            </div>
            <form className="admin-modal-form" onSubmit={handleModalSubmit}>
              <div className="admin-modal-group">
                <label>Nume șablon</label>
                <input
                  type="text"
                  value={modalData.numeTemplate}
                  onChange={e => setModalData({ ...modalData, numeTemplate: e.target.value })}
                  placeholder="Ex: Simulare Bacalaureat 2024"
                  required
                />
              </div>
              <div className="admin-modal-group">
                <label>Număr întrebări</label>
                <input
                  type="number"
                  min="1"
                  value={modalData.nrIntrebari}
                  onChange={e => setModalData({ ...modalData, nrIntrebari: e.target.value })}
                  placeholder="Ex: 12"
                  required
                />
              </div>
              <div className="admin-modal-group">
                <label>Nivel dificultate</label>
                <select
                  value={modalData.nivel}
                  onChange={e => setModalData({ ...modalData, nivel: e.target.value })}
                >
                  <option value="usor">Ușor</option>
                  <option value="mediu">Mediu</option>
                  <option value="greu">Greu</option>
                </select>
              </div>
              <div className="admin-modal-group">
                <label>Profil</label>
                <select
                  value={modalData.idProfilMate}
                  onChange={e => setModalData({ ...modalData, idProfilMate: parseInt(e.target.value) })}
                >
                  {profiluri.map(p => (
                    <option key={p.idProfilMate} value={p.idProfilMate}>{p.denumireProfilMate}</option>
                  ))}
                </select>
              </div>
              {modalEroare && <div className="admin-modal-error">{modalEroare}</div>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-modal-btn secondary" onClick={() => setShowModal(false)}>
                  Anulează
                </button>
                <button type="submit" className="admin-modal-btn primary">
                  {modalMode === "create" ? "Creează" : "Salvează"} →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}





      {showDelete && deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-title">Confirmare dezactivare</div>
            <div className="admin-confirm-text">
              Ești sigur că vrei să dezactivezi șablonul <strong>"{deleteTarget.numeTemplate}"</strong>?
              <br />Această acțiune va marca șablonul ca inactiv.
            </div>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn secondary" onClick={() => setShowDelete(false)}>
                Anulează
              </button>
              <button className="admin-modal-btn primary" onClick={handleDelete} style={{ background: "#e53e3e" }}>
                Dezactivează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;