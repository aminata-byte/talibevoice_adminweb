import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./OffresPage.css";

function OffresPage() {
  const [insertions, setInsertions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsertion, setSelectedInsertion] = useState(null);
  const [filtreType, setFiltreType] = useState("Tous");

  useEffect(() => {
    fetchInsertions();
  }, []);

  const fetchInsertions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFormations();
      setInsertions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeClass = (type) => {
    if (type === "emploi") return "badge badge--green";
    if (type === "stage") return "badge badge--yellow";
    return "badge badge--blue";
  };

  const getTypeLabel = (type) => {
    if (type === "emploi") return "EMPLOI";
    if (type === "stage") return "STAGE";
    return "FORMATION";
  };

  const steps = [
    { num: 1, label: "Inscrits" },
    { num: 2, label: "En cours" },
    { num: 3, label: "Validés" },
    { num: 4, label: "Clôture" },
  ];

  return (
    <AdminLayout titre="Offres d'emploi">
      <div className="offres">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Insertions Professionnelles
            </h2>
            <p className="page__subtitle">
              Suivi du parcours d'insertion des talibés vers le marché du
              travail.
            </p>
          </div>
          <button className="page__btn-add">
            <Plus size={18} />
            Nouvelle Insertion
          </button>
        </div>

        {/* Stepper */}
        <div className="offres__stepper">
          {steps.map((step, index) => (
            <div key={step.num} className="offres__step">
              <div
                className={`offres__step-num ${index === 0 ? "offres__step-num--active" : ""}`}
              >
                {step.num}
              </div>
              <span className="offres__step-label">{step.label}</span>
              {index < steps.length - 1 && (
                <div className="offres__step-line" />
              )}
            </div>
          ))}
        </div>

        <div className="offres__layout">
          {/* Gauche */}
          <div className="offres__left">
            <div className="offres__filters">
              <span className="offres__filter-label">Type :</span>
              {["Tous", "Stage", "Emploi", "Formation"].map((t) => (
                <button
                  key={t}
                  className={`page__tab ${filtreType === t ? "active" : ""}`}
                  onClick={() => setFiltreType(t)}
                >
                  {t}
                </button>
              ))}
              <select
                className="talibes__select"
                style={{ marginLeft: "auto" }}
              >
                <option>Tous les partenaires</option>
              </select>
              <button
                className="page__btn-add"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                <Plus size={14} />
                Nouvelle Insertion
              </button>
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Talibé</th>
                    <th>Partenaire</th>
                    <th>Type</th>
                    <th>Poste</th>
                    <th>Date insertion</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="page__table-empty">
                        Chargement...
                      </td>
                    </tr>
                  ) : insertions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="page__table-empty">
                        Aucune insertion trouvée.
                      </td>
                    </tr>
                  ) : (
                    insertions.map((item) => (
                      <tr
                        key={item.id}
                        className={
                          selectedInsertion?.id === item.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedInsertion(item)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="page__table-user">
                            <div className="page__table-avatar">
                              {item.titre?.[0] || "F"}
                            </div>
                            <span>{item.titre}</span>
                          </div>
                        </td>
                        <td>{item.partenaire?.nom || "—"}</td>
                        <td>
                          <span className="badge badge--blue">FORMATION</span>
                        </td>
                        <td>{item.domaine || "—"}</td>
                        <td>
                          {item.date_debut
                            ? new Date(item.date_debut).toLocaleDateString(
                                "fr-FR",
                              )
                            : "—"}
                        </td>
                        <td>
                          <span
                            className={
                              item.statut === "actif"
                                ? "badge badge--green"
                                : "badge badge--yellow"
                            }
                          >
                            {item.statut === "actif" ? "Validé" : "En attente"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
              <span>
                Affichage 1-{insertions.length} sur {insertions.length}{" "}
                insertions
              </span>
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

          {/* Droite — Détail */}
          {selectedInsertion ? (
            <div className="offres__detail">
              <div className="offres__detail-header">
                <h3 className="offres__detail-title">Détail de l'Insertion</h3>
                <button
                  className="modal__close"
                  onClick={() => setSelectedInsertion(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="offres__detail-avatar">
                <div className="talibes__profil-initiales">
                  {selectedInsertion.titre?.[0] || "F"}
                </div>
              </div>

              <div className="offres__detail-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">PARTENAIRE</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.partenaire?.nom || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">CONTRAT</span>
                  <span className="talibes__profil-value">
                    Formation ({selectedInsertion.domaine || "—"})
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">LIEU</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.lieu || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">STATUT</span>
                  <span
                    className={
                      selectedInsertion.statut === "actif"
                        ? "badge badge--green"
                        : "badge badge--yellow"
                    }
                  >
                    {selectedInsertion.statut === "actif"
                      ? "Validé"
                      : "En attente"}
                  </span>
                </div>
              </div>

              <button
                className="talibes__profil-btn"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--secondary-dark)",
                }}
              >
                Notifier le talibé
              </button>
            </div>
          ) : (
            <div className="offres__detail offres__detail--empty">
              <p>Cliquez sur une insertion pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default OffresPage;
