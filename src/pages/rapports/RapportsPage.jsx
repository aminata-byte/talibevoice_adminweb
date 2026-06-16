import { useState, useEffect } from "react";
import { Eye, CheckCircle, Download, FileText } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./RapportsPage.css";

function RapportsPage() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("soumis");
  const [selectedRapport, setSelectedRapport] = useState(null);

  useEffect(() => {
    fetchRapports();
  }, []);

  const fetchRapports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRapports();
      setRapports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerRapport(id);
      fetchRapports();
    } catch (err) {
      console.error(err);
    }
  };

  const rapportsFiltres = rapports.filter((r) => {
    if (filtre === "tous") return true;
    if (filtre === "soumis") return r.statut === "soumis";
    if (filtre === "valide") return r.statut === "valide";
    return true;
  });

  const getTypeClass = (type) => {
    if (type === "recensement") return "badge badge--blue";
    if (type === "suivi") return "badge badge--green";
    if (type === "audit") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getTypeLabel = (type) => {
    const labels = {
      recensement: "Recensement",
      suivi: "Visite",
      distribution: "Distribution",
      autre: "Audit",
    };
    return labels[type] || type;
  };

  const stats = {
    enAttente: rapports.filter((r) => r.statut === "soumis").length,
    valides: rapports.filter((r) => r.statut === "valide").length,
    conformite:
      rapports.length > 0
        ? Math.round(
            (rapports.filter((r) => r.statut === "valide").length /
              rapports.length) *
              100,
          )
        : 0,
  };

  return (
    <AdminLayout titre="Rapports">
      <div className="rapports">
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Rapports</h2>
            <p className="page__subtitle">
              Supervisez et validez les activités remontées par le terrain.
            </p>
          </div>
          <button className="page__btn-add">
            <Download size={16} />
            Générer rapport global
          </button>
        </div>

        {/* Stats */}
        <div className="rapports__stats">
          <div className="rapports__stat-card rapports__stat-card--red">
            <p className="rapports__stat-label">EN ATTENTE</p>
            <p className="rapports__stat-value">{stats.enAttente}</p>
            <div className="rapports__stat-icon">
              <FileText size={24} />
            </div>
          </div>
          <div className="rapports__stat-card rapports__stat-card--green">
            <p className="rapports__stat-label">VALIDÉS CE MOIS</p>
            <p className="rapports__stat-value">{stats.valides}</p>
            <div className="rapports__stat-icon">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="rapports__stat-card rapports__stat-card--blue">
            <p className="rapports__stat-label">TAUX DE CONFORMITÉ</p>
            <p className="rapports__stat-value">{stats.conformite}%</p>
            <div className="rapports__stat-icon">📊</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rapports__tabs">
          {[
            { key: "soumis", label: "À valider" },
            { key: "valide", label: "Validés" },
            { key: "tous", label: "Tous" },
          ].map((t) => (
            <button
              key={t.key}
              className={`rapports__tab ${filtre === t.key ? "rapports__tab--active" : ""}`}
              onClick={() => setFiltre(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="page__table-container">
          <table className="page__table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Agent</th>
                <th>Daara</th>
                <th>Type</th>
                <th>Date création</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="page__table-empty">
                    Chargement...
                  </td>
                </tr>
              ) : rapportsFiltres.length === 0 ? (
                <tr>
                  <td colSpan="7" className="page__table-empty">
                    Aucun rapport trouvé.
                  </td>
                </tr>
              ) : (
                rapportsFiltres.map((rapport) => (
                  <tr key={rapport.id}>
                    <td>
                      <strong>{rapport.titre}</strong>
                    </td>
                    <td>{rapport.agent?.name || "—"}</td>
                    <td>
                      {rapport.daara?.nom || "—"}
                      {rapport.daara?.commune && (
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "12px",
                          }}
                        >
                          {" "}
                          ({rapport.daara.commune})
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={getTypeClass(rapport.type)}>
                        {getTypeLabel(rapport.type)}
                      </span>
                    </td>
                    <td>
                      {new Date(rapport.date_creation).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>
                    <td>
                      <div className="rapports__statut">
                        <span
                          className={
                            rapport.statut === "valide"
                              ? "rapports__dot rapports__dot--green"
                              : "rapports__dot rapports__dot--red"
                          }
                        />
                        <span>
                          {rapport.statut === "valide"
                            ? "Validated"
                            : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="page__actions">
                        <button
                          className="page__action-btn page__action-btn--view"
                          onClick={() => setSelectedRapport(rapport)}
                        >
                          <Eye size={16} />
                        </button>
                        {rapport.statut === "soumis" && (
                          <button
                            className="rapports__valider-btn"
                            onClick={() => handleValider(rapport.id)}
                          >
                            Valider
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="talibes__pagination">
          <span>Affichage de 1 à 10 sur {rapportsFiltres.length} rapports</span>
          <div className="talibes__pages">
            <button className="talibes__page-btn">‹</button>
            <button className="talibes__page-btn talibes__page-btn--active">
              1
            </button>
            <button className="talibes__page-btn">2</button>
            <button className="talibes__page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Modal détail */}
      {selectedRapport && (
        <div className="modal-overlay" onClick={() => setSelectedRapport(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{selectedRapport.titre}</h3>
              <button
                className="modal__close"
                onClick={() => setSelectedRapport(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__detail-grid">
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Agent</span>
                  <span className="modal__detail-value">
                    {selectedRapport.agent?.name || "—"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Daara</span>
                  <span className="modal__detail-value">
                    {selectedRapport.daara?.nom || "—"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Type</span>
                  <span className={getTypeClass(selectedRapport.type)}>
                    {getTypeLabel(selectedRapport.type)}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Statut</span>
                  <span
                    className={
                      selectedRapport.statut === "valide"
                        ? "badge badge--green"
                        : "badge badge--yellow"
                    }
                  >
                    {selectedRapport.statut === "valide"
                      ? "Validé"
                      : "En attente"}
                  </span>
                </div>
              </div>
              <div className="modal__detail-item" style={{ marginTop: "1rem" }}>
                <span className="modal__detail-label">Contenu</span>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    lineHeight: "1.7",
                    marginTop: "6px",
                  }}
                >
                  {selectedRapport.contenu}
                </p>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn-cancel"
                onClick={() => setSelectedRapport(null)}
              >
                Fermer
              </button>
              {selectedRapport.statut === "soumis" && (
                <button
                  className="modal__btn-submit"
                  onClick={() => {
                    handleValider(selectedRapport.id);
                    setSelectedRapport(null);
                  }}
                >
                  Valider ce rapport
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default RapportsPage;
