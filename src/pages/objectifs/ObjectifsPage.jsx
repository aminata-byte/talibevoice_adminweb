import { useState, useEffect, useMemo } from "react";
import { Plus, X, CheckCircle, XCircle, Target } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./ObjectifsPage.css";

const TYPES = [
  { value: "talibes", label: "Talibés recensés" },
  { value: "daaras", label: "Daaras recensés" },
  { value: "rapports", label: "Rapports soumis" },
];

const TODAY = new Date().toISOString().split("T")[0];

function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCreation, setModalCreation] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [form, setForm] = useState({
    agent_id: "",
    type: "talibes",
    valeur_cible: "",
    date_debut: "",
    date_fin: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [objectifsData, agentsData] = await Promise.all([
        adminService.getObjectifs(),
        adminService.getAgents(),
      ]);
      setObjectifs(Array.isArray(objectifsData) ? objectifsData : []);
      const tousUsers = Array.isArray(agentsData) ? agentsData : [];
      setAgents(tousUsers.filter((u) => u.role === "agent"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirCreation = () => {
    setForm({
      agent_id: "",
      type: "talibes",
      valeur_cible: "",
      date_debut: "",
      date_fin: "",
    });
    setFormError("");
    setModalCreation(true);
  };

  const handleFormChange = (champ, valeur) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  };

  const handleCreer = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.agent_id ||
      !form.valeur_cible ||
      !form.date_debut ||
      !form.date_fin
    ) {
      setFormError("Tous les champs sont obligatoires.");
      return;
    }

    setCreating(true);
    try {
      const nouvelObjectif = await adminService.createObjectif({
        ...form,
        valeur_cible: parseInt(form.valeur_cible),
      });
      setObjectifs((prev) => [nouvelObjectif, ...prev]);
      setModalCreation(false);
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message || "Erreur lors de la création.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!confirm("Supprimer cet objectif ?")) return;
    try {
      await adminService.deleteObjectif(id);
      setObjectifs((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const objectifsFiltres = useMemo(() => {
    if (filtre === "tous") return objectifs;
    return objectifs.filter((o) => o.type === filtre);
  }, [objectifs, filtre]);

  const getTypeLabel = (type) =>
    TYPES.find((t) => t.value === type)?.label || type;

  const isActif = (objectif) => {
    const today = new Date().toISOString().split("T")[0];
    const debut = objectif.date_debut
      ? new Date(objectif.date_debut).toISOString().split("T")[0]
      : null;
    const fin = objectif.date_fin
      ? new Date(objectif.date_fin).toISOString().split("T")[0]
      : null;
    if (!debut || !fin) return false;
    return debut <= today && fin >= today;
  };

  const getStatutBadge = (objectif) => {
    const today = new Date().toISOString().split("T")[0];
    const debut = objectif.date_debut
      ? new Date(objectif.date_debut).toISOString().split("T")[0]
      : null;
    const fin = objectif.date_fin
      ? new Date(objectif.date_fin).toISOString().split("T")[0]
      : null;

    if (debut && debut > today) {
      return <span className="badge badge--blue">À venir</span>;
    }
    if (debut && fin && debut <= today && fin >= today) {
      return <span className="badge badge--yellow">En cours</span>;
    }
    const reelle = objectif.valeur_reelle ?? 0;
    if (reelle >= objectif.valeur_cible) {
      return <span className="badge badge--green">Atteint</span>;
    }
    return <span className="badge badge--gray">Expiré</span>;
  };

  return (
    <AdminLayout titre="Objectifs">
      <div className="objectifs">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Objectifs
              <span className="talibes__count">
                ({objectifs.length.toLocaleString()})
              </span>
            </h2>
            <p className="page__subtitle">
              Définissez et suivez les objectifs de recensement pour chaque
              agent.
            </p>
          </div>
          <button className="page__btn-export" onClick={ouvrirCreation}>
            <Plus size={16} />
            Nouvel objectif
          </button>
        </div>

        <div className="page__tabs" style={{ marginBottom: "1rem" }}>
          <button
            className={`page__tab ${filtre === "tous" ? "active" : ""}`}
            onClick={() => setFiltre("tous")}
          >
            Tous
          </button>
          {TYPES.map((t) => (
            <button
              key={t.value}
              className={`page__tab ${filtre === t.value ? "active" : ""}`}
              onClick={() => setFiltre(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="page__table-container">
          <table className="page__table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Type</th>
                <th>Objectif</th>
                <th>Réalisé</th>
                <th>Atteint</th>
                <th>Période</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="page__table-empty">
                    Chargement...
                  </td>
                </tr>
              ) : objectifsFiltres.length === 0 ? (
                <tr>
                  <td colSpan="8" className="page__table-empty">
                    Aucun objectif trouvé.
                  </td>
                </tr>
              ) : (
                objectifsFiltres.map((objectif) => {
                  const reelle = objectif.valeur_reelle ?? 0;
                  const cible = objectif.valeur_cible ?? 1;
                  const atteint = reelle >= cible;

                  return (
                    <tr key={objectif.id}>
                      <td>
                        <strong>{objectif.agent?.name || "—"}</strong>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Target size={14} />
                          {getTypeLabel(objectif.type)}
                        </div>
                      </td>
                      <td>
                        <strong>{cible}</strong>
                      </td>
                      <td>
                        <strong>{reelle}</strong>
                      </td>
                      <td>
                        {atteint ? (
                          <span className="badge badge--green">Oui</span>
                        ) : (
                          <span className="badge badge--gray">Non</span>
                        )}
                      </td>
                      <td>
                        {new Date(objectif.date_debut).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                          },
                        )}
                        {" → "}
                        {new Date(objectif.date_fin).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td>{getStatutBadge(objectif)}</td>
                      <td>
                        <div className="page__actions">
                          <button
                            className="page__action-btn page__action-btn--delete"
                            title="Supprimer"
                            onClick={() => handleSupprimer(objectif.id)}
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalCreation && (
        <div className="modal__overlay" onClick={() => setModalCreation(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Nouvel objectif</h3>
              <button
                className="modal__close"
                onClick={() => setModalCreation(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreer}>
              <div className="modal__body">
                {formError && (
                  <p className="missions__form-error">{formError}</p>
                )}

                <div className="missions__form-group">
                  <label>Agent *</label>
                  <select
                    value={form.agent_id}
                    onChange={(e) =>
                      handleFormChange("agent_id", e.target.value)
                    }
                  >
                    <option value="">— Sélectionner —</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="missions__form-group">
                  <label>Type d'objectif *</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="missions__form-group">
                  <label>Valeur cible *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.valeur_cible}
                    onChange={(e) =>
                      handleFormChange("valeur_cible", e.target.value)
                    }
                    placeholder="Ex: 20"
                  />
                </div>

                <div className="missions__form-row">
                  <div className="missions__form-group">
                    <label>Date début *</label>
                    <input
                      type="date"
                      value={form.date_debut}
                      min={TODAY}
                      onChange={(e) =>
                        handleFormChange("date_debut", e.target.value)
                      }
                    />
                  </div>
                  <div className="missions__form-group">
                    <label>Date fin *</label>
                    <input
                      type="date"
                      value={form.date_fin}
                      min={form.date_debut || TODAY}
                      onChange={(e) =>
                        handleFormChange("date_fin", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal__footer">
                <button
                  type="button"
                  className="modal__btn modal__btn--cancel"
                  onClick={() => setModalCreation(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="modal__btn"
                  style={{ background: "var(--primary)", color: "white" }}
                  disabled={creating}
                >
                  <CheckCircle size={15} />
                  {creating ? "Création..." : "Créer l'objectif"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ObjectifsPage;
