import { useState, useEffect, useMemo } from "react";
import { Search, Eye, CheckCircle, X, Flag } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./OffresPage.css";

const ITEMS_PAR_PAGE = 10;

function OffresPage() {
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
      if (selectedInsertion?.id === insertionACloturer.id) {
        setSelectedInsertion((i) => ({ ...i, statut: "cloture" }));
      }
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

  const getTalibeNom = (insertion) => {
    return (
      `${insertion.talibe?.prenom || ""} ${insertion.talibe?.nom || ""}`.trim() ||
      "—"
    );
  };

  const getTalibeInitiales = (insertion) => {
    return (
      `${insertion.talibe?.prenom?.[0] || ""}${insertion.talibe?.nom?.[0] || ""}`.toUpperCase() ||
      "?"
    );
  };

  return (
    <AdminLayout titre="Offres d'emploi">
      <div className="offres">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Insertions Professionnelles
              <span className="talibes__count">({insertions.length})</span>
            </h2>
            <p className="page__subtitle">
              Suivi du parcours d'insertion des talibés vers le marché du
              travail.
            </p>
          </div>
        </div>

        <div className="offres__layout">
          {/* Gauche — Table */}
          <div className="offres__left">
            {/* Filtres */}
            <div className="offres__filters">
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
                    {t === "tous" ? "Tous" : getTypeLabel(t)}
                  </button>
                ))}
              </div>

              <select
                className="talibes__select"
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="valide">Validé</option>
                <option value="cloture">Clôturé</option>
              </select>
            </div>

            {/* Table */}
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
                              title="Voir détail"
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

            {/* Pagination */}
            <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
              <span>
                {insertionsFiltrees.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      insertionsFiltrees.length,
                    )} sur ${insertionsFiltrees.length} insertions`}
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

          {/* Droite — Détail */}
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
                  <span className="talibes__profil-label">POSTE</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.poste || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">LIEU</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.lieu || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">DATE INSERTION</span>
                  <span className="talibes__profil-value">
                    {selectedInsertion.date_insertion
                      ? new Date(
                          selectedInsertion.date_insertion,
                        ).toLocaleDateString("fr-FR")
                      : "—"}
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

      {/* Modal clôturer */}
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
                <strong>{getTalibeNom(insertionACloturer)}</strong> ? Cette
                action est irréversible.
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
                <Flag size={15} />
                {cloturing ? "Clôture..." : "Clôturer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OffresPage;
