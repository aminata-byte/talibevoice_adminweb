import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  CheckCircle,
  Download,
  FileText,
  BarChart2,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./RapportsPage.css";

const ITEMS_PAR_PAGE = 10;

function RapportsPage() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("soumis");
  const [page, setPage] = useState(1);
  const [selectedRapport, setSelectedRapport] = useState(null);

  useEffect(() => {
    fetchRapports();
  }, []);

  const fetchRapports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRapports();
      setRapports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerRapport(id);
      setRapports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: "valide" } : r)),
      );
      if (selectedRapport?.id === id) {
        setSelectedRapport((r) => ({ ...r, statut: "valide" }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const rapportsFiltres = useMemo(() => {
    return rapports.filter((r) => {
      if (filtre === "tous") return true;
      return r.statut === filtre;
    });
  }, [rapports, filtre]);

  useEffect(() => {
    setPage(1);
  }, [filtre]);

  const totalPages = Math.max(
    1,
    Math.ceil(rapportsFiltres.length / ITEMS_PAR_PAGE),
  );
  const rapportsPage = rapportsFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const stats = useMemo(
    () => ({
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
    }),
    [rapports],
  );

  const getTypeClass = (type) => {
    if (type === "recensement") return "badge badge--blue";
    if (type === "suivi") return "badge badge--green";
    if (type === "distribution") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getTypeLabel = (type) => {
    const labels = {
      recensement: "Recensement",
      suivi: "Visite",
      distribution: "Distribution",
      autre: "Autre",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout titre="Rapports">
      <div className="rapports">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Rapports
              <span className="talibes__count">({rapports.length})</span>
            </h2>
            <p className="page__subtitle">
              Supervisez et validez les activités remontées par le terrain.
            </p>
          </div>
          <button className="page__btn-export">
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
            <p className="rapports__stat-label">VALIDÉS</p>
            <p className="rapports__stat-value">{stats.valides}</p>
            <div className="rapports__stat-icon">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="rapports__stat-card rapports__stat-card--blue">
            <p className="rapports__stat-label">TAUX DE CONFORMITÉ</p>
            <p className="rapports__stat-value">{stats.conformite}%</p>
            <div className="rapports__stat-icon">
              <BarChart2 size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rapports__tabs">
          {[
            { key: "soumis", label: `À valider (${stats.enAttente})` },
            { key: "valide", label: `Validés (${stats.valides})` },
            { key: "tous", label: `Tous (${rapports.length})` },
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
                <th>Date</th>
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
              ) : rapportsPage.length === 0 ? (
                <tr>
                  <td colSpan="7" className="page__table-empty">
                    Aucun rapport trouvé.
                  </td>
                </tr>
              ) : (
                rapportsPage.map((rapport) => (
                  <tr
                    key={rapport.id}
                    onClick={() => setSelectedRapport(rapport)}
                    style={{ cursor: "pointer" }}
                  >
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
                      {rapport.date_creation
                        ? new Date(rapport.date_creation).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={
                          rapport.statut === "valide"
                            ? "badge badge--green"
                            : "badge badge--yellow"
                        }
                      >
                        {rapport.statut === "valide" ? "Validé" : "En attente"}
                      </span>
                    </td>
                    <td>
                      <div className="page__actions">
                        <button
                          className="page__action-btn page__action-btn--view"
                          title="Voir"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRapport(rapport);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {rapport.statut === "soumis" && (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            title="Valider"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValider(rapport.id);
                            }}
                          >
                            <CheckCircle size={16} />
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

        {/* Pagination */}
        <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
          <span>
            {rapportsFiltres.length === 0
              ? "Aucun résultat"
              : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(page * ITEMS_PAR_PAGE, rapportsFiltres.length)} sur ${rapportsFiltres.length} rapports`}
          </span>
          <div className="talibes__pages">
            <button
              className="talibes__page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`talibes__page-btn${page === p ? " talibes__page-btn--active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
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

      {/* Modal détail */}
      {selectedRapport && (
        <div
          className="modal__overlay"
          onClick={() => setSelectedRapport(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{selectedRapport.titre}</h3>
              <button
                className="modal__close"
                onClick={() => setSelectedRapport(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__grid">
                <div className="modal__field">
                  <span className="modal__label">Agent</span>
                  <span>{selectedRapport.agent?.name || "—"}</span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Daara</span>
                  <span>{selectedRapport.daara?.nom || "—"}</span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Type</span>
                  <span className={getTypeClass(selectedRapport.type)}>
                    {getTypeLabel(selectedRapport.type)}
                  </span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Statut</span>
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
                <div className="modal__field modal__field--full">
                  <span className="modal__label">Contenu</span>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.7",
                      marginTop: "6px",
                    }}
                  >
                    {selectedRapport.contenu || "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setSelectedRapport(null)}
              >
                Fermer
              </button>
              {selectedRapport.statut === "soumis" && (
                <button
                  className="modal__btn modal__btn--save"
                  onClick={() => {
                    handleValider(selectedRapport.id);
                    setSelectedRapport(null);
                  }}
                >
                  <CheckCircle size={15} /> Valider ce rapport
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
