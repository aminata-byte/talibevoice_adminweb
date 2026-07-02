import { useState, useEffect, useMemo } from "react";
import { Search, Eye, ClipboardList, FileText, Target, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./AgentsPage.css";

const ITEMS_PAR_PAGE = 10;

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [agentsData, missionsData, rapportsData, objectifsData] =
        await Promise.all([
          adminService.getAgents(),
          adminService.getMissions(),
          adminService.getRapports(),
          adminService.getObjectifs(),
        ]);
      const tousUsers = Array.isArray(agentsData) ? agentsData : [];
      setAgents(tousUsers.filter((u) => u.role === "agent"));
      setMissions(Array.isArray(missionsData) ? missionsData : []);
      setRapports(Array.isArray(rapportsData) ? rapportsData : []);
      setObjectifs(Array.isArray(objectifsData) ? objectifsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatsAgent = (agentId) => {
    const missionsAgent = missions.filter((m) => m.agent_id === agentId);
    const rapportsAgent = rapports.filter((r) => r.agent_id === agentId);
    const objectifsAgent = objectifs.filter((o) => o.agent_id === agentId);

    return {
      totalMissions: missionsAgent.length,
      missionsEnCours: missionsAgent.filter((m) => m.statut === "en_cours")
        .length,
      missionsCloturees: missionsAgent.filter((m) => m.statut === "cloturee")
        .length,
      totalRapports: rapportsAgent.length,
      rapportsValides: rapportsAgent.filter((r) => r.statut === "valide")
        .length,
      objectifsAtteints: objectifsAgent.filter((o) => o.atteint).length,
      totalObjectifs: objectifsAgent.length,
    };
  };

  const agentsFiltres = useMemo(() => {
    return agents.filter(
      (a) =>
        a.name?.toLowerCase().includes(recherche.toLowerCase()) ||
        a.email?.toLowerCase().includes(recherche.toLowerCase()) ||
        a.zone_affectation?.toLowerCase().includes(recherche.toLowerCase()),
    );
  }, [agents, recherche]);

  useEffect(() => {
    setPage(1);
  }, [recherche]);

  const totalPages = Math.max(
    1,
    Math.ceil(agentsFiltres.length / ITEMS_PAR_PAGE),
  );
  const agentsPage = agentsFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const selectedStats = selectedAgent ? getStatsAgent(selectedAgent.id) : null;

  return (
    <AdminLayout titre="Agents">
      <div className="agents">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Performance des Agents
              <span className="talibes__count">
                ({agents.length.toLocaleString()})
              </span>
            </h2>
            <p className="page__subtitle">
              Suivez les performances terrain de chaque agent de recensement.
            </p>
          </div>
        </div>

        <div className="daaras__layout">
          <div className="daaras__left">
            <div className="page__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un agent..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Zone</th>
                    <th>Missions</th>
                    <th>Rapports</th>
                    <th>Objectifs</th>
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
                  ) : agentsPage.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="page__table-empty">
                        Aucun agent trouvé.
                      </td>
                    </tr>
                  ) : (
                    agentsPage.map((agent) => {
                      const stats = getStatsAgent(agent.id);
                      return (
                        <tr
                          key={agent.id}
                          className={
                            selectedAgent?.id === agent.id
                              ? "talibes__row--active"
                              : ""
                          }
                          onClick={() => setSelectedAgent(agent)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <div className="page__table-name">
                              <div className="agents__avatar">
                                {agent.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <strong>{agent.name}</strong>
                                <span>{agent.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{agent.zone_affectation || "—"}</td>
                          <td>
                            <div className="agents__mini-stats">
                              <span className="badge badge--yellow">
                                {stats.missionsEnCours} en cours
                              </span>
                              <span className="badge badge--green">
                                {stats.missionsCloturees} clôt.
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge--green">
                              {stats.rapportsValides}/{stats.totalRapports}
                            </span>
                          </td>
                          <td>
                            {stats.totalObjectifs > 0 ? (
                              <span
                                className={
                                  stats.objectifsAtteints ===
                                  stats.totalObjectifs
                                    ? "badge badge--green"
                                    : "badge badge--yellow"
                                }
                              >
                                {stats.objectifsAtteints}/{stats.totalObjectifs}
                              </span>
                            ) : (
                              <span className="badge badge--gray">—</span>
                            )}
                          </td>
                          <td>
                            <div className="agents__statut">
                              <span
                                className={`agents__dot ${agent.statut === "actif" ? "agents__dot--green" : "agents__dot--red"}`}
                              />
                              <span>
                                {agent.statut === "actif" ? "Actif" : "Bloqué"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="page__actions">
                              <button
                                className="page__action-btn page__action-btn--view"
                                title="Voir détail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAgent(agent);
                                }}
                              >
                                <Eye size={16} />
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

            <div className="talibes__pagination">
              <span>
                {agentsFiltres.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      agentsFiltres.length,
                    )} sur ${agentsFiltres.length} agents`}
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

          {selectedAgent && selectedStats ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Performance agent</h3>

              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  {selectedAgent.name?.[0]?.toUpperCase()}
                </div>
                <span
                  className={
                    selectedAgent.statut === "actif"
                      ? "badge badge--green"
                      : "badge badge--gray"
                  }
                >
                  {selectedAgent.statut === "actif" ? "Actif" : "Bloqué"}
                </span>
              </div>

              <p className="talibes__profil-name">{selectedAgent.name}</p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                {selectedAgent.email}
              </p>

              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">ZONE</span>
                  <span className="talibes__profil-value">
                    {selectedAgent.zone_affectation || "—"}
                  </span>
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <ClipboardList size={11} /> MISSIONS
                  </span>
                  <div
                    style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                  >
                    <span className="badge badge--gray">
                      {selectedStats.totalMissions} total
                    </span>
                    <span className="badge badge--yellow">
                      {selectedStats.missionsEnCours} en cours
                    </span>
                    <span className="badge badge--green">
                      {selectedStats.missionsCloturees} clôturées
                    </span>
                  </div>
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <FileText size={11} /> RAPPORTS
                  </span>
                  <div
                    style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                  >
                    <span className="badge badge--gray">
                      {selectedStats.totalRapports} total
                    </span>
                    <span className="badge badge--green">
                      {selectedStats.rapportsValides} validés
                    </span>
                  </div>
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Target size={11} /> OBJECTIFS
                  </span>
                  {selectedStats.totalObjectifs > 0 ? (
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <span className="badge badge--gray">
                        {selectedStats.totalObjectifs} total
                      </span>
                      <span className="badge badge--green">
                        {selectedStats.objectifsAtteints} atteints
                      </span>
                    </div>
                  ) : (
                    <span className="talibes__profil-value">
                      Aucun objectif défini
                    </span>
                  )}
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">MATRICULE</span>
                  <span className="talibes__profil-value">
                    {selectedAgent.matricule || "—"}
                  </span>
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">TÉLÉPHONE</span>
                  <span className="talibes__profil-value">
                    {selectedAgent.telephone || "—"}
                  </span>
                </div>

                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">INSCRIT LE</span>
                  <span className="talibes__profil-value">
                    {new Date(selectedAgent.created_at).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur un agent pour voir sa performance</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AgentsPage;
