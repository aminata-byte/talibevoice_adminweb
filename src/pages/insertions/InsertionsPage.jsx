import { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle, Flag, Eye, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./InsertionsPage.css";

const ITEMS_PAR_PAGE = 10;

function InsertionsPage() {
  const [insertions, setInsertions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [page, setPage] = useState(1);
  const [selectedInsertion, setSelectedInsertion] = useState(null);
  const [modalCloturer, setModalCloturer] = useState(false);
  const [insertionACloturer, setInsertionACloturer] = useState(null);
  const [cloturing, setCloturing] = useState(false);

  useEffect(() => {
    fetchInsertions();
  }, []);

  const fetchInsertions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getInsertions();
      setInsertions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerInsertion(id);
      setInsertions((prev) =>
        prev.map((i) => (i.id === id ? { ...i, statut: "valide" } : i)),
      );
      if (selectedInsertion?.id === id)
        setSelectedInsertion((i) => ({ ...i, statut: "valide" }));
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirCloturer = (insertion, e) => {
    e.stopPropagation();
    setInsertionACloturer(insertion);
    setModalCloturer(true);
  };

  const confirmerCloturer = async () => {
    setCloturing(true);
    try {
      await adminService.cloturerInsertion(insertionACloturer.id);
      setInsertions((prev) =>
        prev.map((i) =>
          i.id === insertionACloturer.id ? { ...i, statut: "cloture" } : i,
        ),
      );
      if (selectedInsertion?.id === insertionACloturer.id)
        setSelectedInsertion((i) => ({ ...i, statut: "cloture" }));
      setModalCloturer(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCloturing(false);
    }
  };

  const insertionsFiltrees = useMemo(() => {
    return insertions.filter((i) => {
      const terme = recherche.toLowerCase();
      const matchRecherche =
        terme === "" ||
        `${i.talibe?.prenom || ""} ${i.talibe?.nom || ""}`
          .toLowerCase()
          .includes(terme) ||
        i.partenaire?.nom?.toLowerCase().includes(terme);
      const matchType = filtreType === "tous" || i.type === filtreType;
      const matchStatut = filtreStatut === "tous" || i.statut === filtreStatut;
      return matchRecherche && matchType && matchStatut;
    });
  }, [insertions, recherche, filtreType, filtreStatut]);

  useEffect(() => {
    setPage(1);
  }, [recherche, filtreType, filtreStatut]);

  const totalPages = Math.max(
    1,
    Math.ceil(insertionsFiltrees.length / ITEMS_PAR_PAGE),
  );
  const insertionsPage = insertionsFiltrees.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getTypeClass = (type) => {
    if (type === "emploi") return "badge badge--green";
    if (type === "stage") return "badge badge--yellow";
    return "badge badge--blue";
  };

  const getTypeLabel = (type) => {
    if (type === "emploi") return "Emploi";
    if (type === "stage") return "Stage";
    return "Formation";
  };

  const getStatutClass = (statut) => {
    if (statut === "valide") return "badge badge--green";
    if (statut === "en_cours") return "badge badge--blue";
    if (statut === "en_attente") return "badge badge--yellow";
    if (statut === "cloture") return "badge badge--gray";
    return "badge badge--gray";
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_cours") return "En cours";
    if (statut === "en_attente") return "En attente";
    if (statut === "cloture") return "Clôturé";
    return "—";
  };

  const getTalibeNom = (i) =>
    `${i.talibe?.prenom || ""} ${i.talibe?.nom || ""}`.trim() || "—";

  const getTalibeInitiales = (i) =>
    `${i.talibe?.prenom?.[0] || ""}${i.talibe?.nom?.[0] || ""}`.toUpperCase() ||
    "?";

  const stats = useMemo(
    () => ({
      total: insertions.length,
      enAttente: insertions.filter((i) => i.statut === "en_attente").length,
      enCours: insertions.filter(
        (i) => i.statut === "en_cours" || i.statut === "valide",
      ).length,
      clotures: insertions.filter((i) => i.statut === "cloture").length,
    }),
    [insertions],
  );

  return (
    <AdminLayout titre="Insertions">
      <div className="insertions">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Insertions
              <span className="talibes__count">({insertions.length})</span>
            </h2>
            <p className="page__subtitle">
              Suivez les parcours d'insertion professionnelle des talibés.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="insertions__stats">
          <div className="insertions__stat">
            <p className="insertions__stat-value">{stats.total}</p>
            <p className="insertions__stat-label">Total</p>
          </div>
          <div className="insertions__stat insertions__stat--yellow">
            <p className="insertions__stat-value">{stats.enAttente}</p>
            <p className="insertions__stat-label">En attente</p>
          </div>
          <div className="insertions__stat insertions__stat--blue">
            <p className="insertions__stat-value">{stats.enCours}</p>
            <p className="insertions__stat-label">En cours</p>
          </div>
          <div className="insertions__stat insertions__stat--green">
            <p className="insertions__stat-value">{stats.clotures}</p>
            <p className="insertions__stat-label">Clôturés</p>
          </div>
        </div>

        <div className="offres__layout">
          <div className="offres__left">
            <div className="page__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un talibé ou partenaire..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <div className="page__tabs">
                {["tous", "formation", "stage", "emploi"].map((t) => (
                  <button
                    key={t}
                    className={`page__tab ${filtreType === t ? "active" : ""}`}
                    onClick={() => setFiltreType(t)}
                  >
                    {t === "tous" ? "Tous types" : getTypeLabel(t)}
                  </button>
                ))}
              </div>
              <div className="page__tabs">
                {["tous", "en_attente", "en_cours", "valide", "cloture"].map(
                  (s) => (
                    <button
                      key={s}
                      className={`page__tab ${filtreStatut === s ? "active" : ""}`}
                      onClick={() => setFiltreStatut(s)}
                    >
                      {s === "tous" ? "Tous statuts" : getStatutLabel(s)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Talibé</th>
                    <th>Partenaire</th>
                    <th>Type</th>
                    <th>Programme</th>
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
                  ) : insertionsPage.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="page__table-empty">
                        Aucune insertion trouvée.
                      </td>
                    </tr>
                  ) : (
                    insertionsPage.map((insertion) => (
                      <tr
                        key={insertion.id}
                        className={
                          selectedInsertion?.id === insertion.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedInsertion(insertion)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="page__table-user">
                            <div className="page__table-avatar">
                              {getTalibeInitiales(insertion)}
                            </div>
                            <span>{getTalibeNom(insertion)}</span>
                          </div>
                        </td>
                        <td>{insertion.partenaire?.nom || "—"}</td>
                        <td>
                          <span className={getTypeClass(insertion.type)}>
                            {getTypeLabel(insertion.type)}
                          </span>
                        </td>
                        <td>{insertion.formation?.titre || "—"}</td>
                        <td>
                          {insertion.date_insertion
                            ? new Date(
                                insertion.date_insertion,
                              ).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td>
                          <span className={getStatutClass(insertion.statut)}>
                            {getStatutLabel(insertion.statut)}
                          </span>
                        </td>
                        <td>
                          <div className="page__actions">
                            <button
                              className="page__action-btn page__action-btn--view"
                              title="Voir"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInsertion(insertion);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            {insertion.statut === "en_attente" && (
                              <button
                                className="page__action-btn page__action-btn--validate"
                                title="Valider"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleValider(insertion.id);
                                }}
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                            {(insertion.statut === "en_cours" ||
                              insertion.statut === "valide") && (
                              <button
                                className="page__action-btn page__action-btn--warn"
                                title="Clôturer"
                                onClick={(e) => ouvrirCloturer(insertion, e)}
                              >
                                <Flag size={15} />
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

            <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
              <span>
                {insertionsFiltrees.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(page * ITEMS_PAR_PAGE, insertionsFiltrees.length)} sur ${insertionsFiltrees.length} insertions`}
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

          {selectedInsertion ? (
            <div className="offres__detail">
              <div className="offres__detail-header">
                <h3 className="offres__detail-title">Détail insertion</h3>
                <button
                  className="modal__close"
                  onClick={() => setSelectedInsertion(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="offres__detail-avatar">
                <div className="talibes__profil-initiales">
                  {getTalibeInitiales(selectedInsertion)}
                </div>
              </div>
              <p className="talibes__profil-name">
                {getTalibeNom(selectedInsertion)}
              </p>
              <div className="offres__detail-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">TYPE</span>
                  <span className={getTypeClass(selectedInsertion.type)}>
                    {getTypeLabel(selectedInsertion.type)}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">PARTENAIRE</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.partenaire?.nom || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">PROGRAMME</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.formation?.titre || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">STATUT</span>
                  <span className={getStatutClass(selectedInsertion.statut)}>
                    {getStatutLabel(selectedInsertion.statut)}
                  </span>
                </div>
              </div>
              <div className="talibes__profil-actions">
                {selectedInsertion.statut === "en_attente" && (
                  <button
                    className="talibes__profil-btn"
                    style={{ background: "var(--primary)", color: "white" }}
                    onClick={() => handleValider(selectedInsertion.id)}
                  >
                    <CheckCircle size={15} /> Valider
                  </button>
                )}
                {(selectedInsertion.statut === "en_cours" ||
                  selectedInsertion.statut === "valide") && (
                  <button
                    className="talibes__profil-btn talibes__profil-btn--delete"
                    onClick={(e) => ouvrirCloturer(selectedInsertion, e)}
                  >
                    <Flag size={15} /> Clôturer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="offres__detail offres__detail--empty">
              <p>Cliquez sur une insertion pour voir les détails</p>
            </div>
          )}
        </div>
      </div>

      {modalCloturer && (
        <div className="modal__overlay" onClick={() => setModalCloturer(false)}>
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Confirmer la clôture</h3>
              <button
                className="modal__close"
                onClick={() => setModalCloturer(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__confirm-text">
                Êtes-vous sûr de vouloir clôturer l'insertion de{" "}
                <strong>{getTalibeNom(insertionACloturer)}</strong> ?
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setModalCloturer(false)}
              >
                Annuler
              </button>
              <button
                className="modal__btn modal__btn--danger"
                onClick={confirmerCloturer}
                disabled={cloturing}
              >
                <Flag size={15} /> {cloturing ? "Clôture..." : "Clôturer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default InsertionsPage;
