import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  X,
  Plus,
  MapPin,
  Calendar,
  User,
  ClipboardList,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./MissionsPage.css";

const ITEMS_PAR_PAGE = 10;
const TODAY = new Date().toISOString().split("T")[0];

const TYPES = [
  { value: "recensement", label: "Recensement" },
  { value: "suivi", label: "Suivi" },
  { value: "distribution", label: "Distribution" },
  { value: "autre", label: "Autre" },
];

function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [daaras, setDaaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("toutes");
  const [page, setPage] = useState(1);
  const [selectedMission, setSelectedMission] = useState(null);

  const [modalCreation, setModalCreation] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    agent_id: "",
    daara_id: "",
    titre: "",
    description: "",
    type: "recensement",
    date_debut: "",
    date_fin: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [missionsData, agentsData, daarasData] = await Promise.all([
        adminService.getMissions(),
        adminService.getAgents(),
        adminService.getDaaras(),
      ]);
      setMissions(Array.isArray(missionsData) ? missionsData : []);
      const tousUsers = Array.isArray(agentsData) ? agentsData : [];
      setAgents(tousUsers.filter((u) => u.role === "agent"));
      setDaaras(Array.isArray(daarasData) ? daarasData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirCreation = () => {
    setForm({
      agent_id: "",
      daara_id: "",
      titre: "",
      description: "",
      type: "recensement",
      date_debut: "",
      date_fin: "",
    });
    setFormError("");
    setModalCreation(true);
  };

  const handleFormChange = (champ, valeur) => {
    setForm((prev) => ({ ...prev, [champ]: valeur }));
  };

  const handleCreerMission = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.agent_id || !form.daara_id || !form.titre) {
      setFormError("Agent, daara et titre sont obligatoires.");
      return;
    }

    if (form.date_debut && form.date_debut < TODAY) {
      setFormError("La date de début ne peut pas être dans le passé.");
      return;
    }

    if (form.date_fin && form.date_debut && form.date_fin < form.date_debut) {
      setFormError("La date de fin doit être après la date de début.");
      return;
    }

    setCreating(true);
    try {
      const nouvelleMission = await adminService.createMission(form);
      setMissions((prev) => [nouvelleMission, ...prev]);
      setModalCreation(false);
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message ||
          "Erreur lors de la création de la mission.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleReassigner = async (missionId, agentId) => {
    try {
      const res = await adminService.assignerAgentMission(missionId, agentId);
      const missionMaj = res.mission;
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? missionMaj : m)),
      );
      if (selectedMission?.id === missionId) setSelectedMission(missionMaj);
    } catch (err) {
      console.error(err);
    }
  };

  const missionsFiltrees = useMemo(() => {
    return missions.filter((m) => {
      const matchRecherche = m.titre
        ?.toLowerCase()
        .includes(recherche.toLowerCase());
      const matchFiltre = filtre === "toutes" || m.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [missions, recherche, filtre]);

  useEffect(() => {
    setPage(1);
  }, [recherche, filtre]);

  const totalPages = Math.max(
    1,
    Math.ceil(missionsFiltrees.length / ITEMS_PAR_PAGE),
  );
  const missionsPage = missionsFiltrees.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getStatutClass = (statut) => {
    if (statut === "cloturee") return "badge badge--green";
    if (statut === "en_cours") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getStatutLabel = (statut) => {
    if (statut === "cloturee") return "Clôturée";
    if (statut === "en_cours") return "En cours";
    return "En attente";
  };

  const getTypeLabel = (type) =>
    TYPES.find((t) => t.value === type)?.label || type;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout titre="Missions">
      <div className="missions">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Missions
              <span className="talibes__count">
                ({missions.length.toLocaleString()})
              </span>
            </h2>
          </div>
          <button className="page__btn-export" onClick={ouvrirCreation}>
            <Plus size={16} />
            Nouvelle mission
          </button>
        </div>

        <div className="daaras__layout">
          <div className="daaras__left">
            <div className="page__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher une mission..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <div className="page__tabs">
                {["toutes", "en_attente", "en_cours", "cloturee"].map((f) => (
                  <button
                    key={f}
                    className={`page__tab ${filtre === f ? "active" : ""}`}
                    onClick={() => setFiltre(f)}
                  >
                    {f === "toutes"
                      ? "Toutes"
                      : f === "en_attente"
                        ? "En attente"
                        : f === "en_cours"
                          ? "En cours"
                          : "Clôturées"}
                  </button>
                ))}
              </div>
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Daara</th>
                    <th>Agent</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="page__table-empty">
                        Chargement...
                      </td>
                    </tr>
                  ) : missionsPage.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="page__table-empty">
                        Aucune mission trouvée.
                      </td>
                    </tr>
                  ) : (
                    missionsPage.map((mission) => (
                      <tr
                        key={mission.id}
                        className={
                          selectedMission?.id === mission.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedMission(mission)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="page__table-name">
                            <strong>{mission.titre}</strong>
                            <span>{mission.description || "—"}</span>
                          </div>
                        </td>
                        <td>{getTypeLabel(mission.type)}</td>
                        <td>{mission.daara?.nom || "—"}</td>
                        <td>{mission.agent?.name || "—"}</td>
                        <td>
                          <span className={getStatutClass(mission.statut)}>
                            {getStatutLabel(mission.statut)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="talibes__pagination">
              <span>
                {missionsFiltrees.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      missionsFiltrees.length,
                    )} sur ${missionsFiltrees.length} missions`}
              </span>
              <div className="talibes__pages">
                <button
                  className="talibes__page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`talibes__page-btn${page === p ? " talibes__page-btn--active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  className="talibes__page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {selectedMission ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Détail mission</h3>

              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  <ClipboardList size={20} />
                </div>
                <span className={getStatutClass(selectedMission.statut)}>
                  {getStatutLabel(selectedMission.statut)}
                </span>
              </div>

              <p className="talibes__profil-name">{selectedMission.titre}</p>

              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <ClipboardList size={11} /> TYPE
                  </span>
                  <span className="talibes__profil-value">
                    {getTypeLabel(selectedMission.type)}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <MapPin size={11} /> DAARA
                  </span>
                  <span className="talibes__profil-value">
                    {selectedMission.daara?.nom || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <User size={11} /> AGENT ASSIGNÉ
                  </span>
                  <select
                    className="missions__select-inline"
                    value={selectedMission.agent_id}
                    onChange={(e) =>
                      handleReassigner(selectedMission.id, e.target.value)
                    }
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Calendar size={11} /> DATE DÉBUT
                  </span>
                  <span className="talibes__profil-value">
                    {formatDate(selectedMission.date_debut)}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Calendar size={11} /> DATE FIN
                  </span>
                  <span className="talibes__profil-value">
                    {formatDate(selectedMission.date_fin)}
                  </span>
                </div>
                {selectedMission.description && (
                  <div className="talibes__profil-info">
                    <span className="talibes__profil-label">DESCRIPTION</span>
                    <span className="talibes__profil-value">
                      {selectedMission.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur une mission pour voir son détail</p>
            </div>
          )}
        </div>
      </div>

      {modalCreation && (
        <div className="modal__overlay" onClick={() => setModalCreation(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Nouvelle mission</h3>
              <button
                className="modal__close"
                onClick={() => setModalCreation(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreerMission}>
              <div className="modal__body">
                {formError && (
                  <p className="missions__form-error">{formError}</p>
                )}

                <div className="missions__form-group">
                  <label>Titre *</label>
                  <input
                    type="text"
                    value={form.titre}
                    onChange={(e) => handleFormChange("titre", e.target.value)}
                    placeholder="Ex: Recensement daara Médina"
                  />
                </div>

                <div className="missions__form-row">
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
                    <label>Daara *</label>
                    <select
                      value={form.daara_id}
                      onChange={(e) =>
                        handleFormChange("daara_id", e.target.value)
                      }
                    >
                      <option value="">— Sélectionner —</option>
                      {daaras.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="missions__form-group">
                  <label>Type *</label>
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

                <div className="missions__form-row">
                  <div className="missions__form-group">
                    <label>Date début</label>
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
                    <label>Date fin</label>
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

                <div className="missions__form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    placeholder="Détails de la mission..."
                  />
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
                  {creating ? "Création..." : "Créer la mission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default MissionsPage;
