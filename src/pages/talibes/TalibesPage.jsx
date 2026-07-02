import { useState, useEffect, useMemo } from "react";
import { Search, Eye, Trash2, Download, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./TalibesPage.css";

const ITEMS_PAR_PAGE = 10;

function TalibesPage() {
  const [talibes, setTalibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreRegion, setFiltreRegion] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreMajeur, setFiltreMajeur] = useState(false);
  const [selectedTalibe, setSelectedTalibe] = useState(null);
  const [page, setPage] = useState(1);
  const [modalSuppr, setModalSuppr] = useState(false);
  const [talibeASupprimer, setTalibeASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTalibes();
  }, []);

  const fetchTalibes = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTalibes();
      setTalibes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Régions dynamiques depuis les données
  const regions = useMemo(() => {
    const set = new Set(talibes.map((t) => t.daara?.region).filter(Boolean));
    return [...set].sort();
  }, [talibes]);

  // Filtrage
  const talibesFiltres = useMemo(() => {
    return talibes.filter((t) => {
      const matchRecherche =
        recherche === "" ||
        `${t.nom} ${t.prenom}`.toLowerCase().includes(recherche.toLowerCase());
      const matchRegion =
        filtreRegion === "" || t.daara?.region === filtreRegion;
      const matchStatut =
        filtreStatut === "" || t.statut_insertion === filtreStatut;
      const matchMajeur = !filtreMajeur || t.est_majeur;
      return matchRecherche && matchRegion && matchStatut && matchMajeur;
    });
  }, [talibes, recherche, filtreRegion, filtreStatut, filtreMajeur]);

  // Reset page si filtre change
  useEffect(() => {
    setPage(1);
  }, [recherche, filtreRegion, filtreStatut, filtreMajeur]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(talibesFiltres.length / ITEMS_PAR_PAGE),
  );
  const talibesPage = talibesFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getInsertionClass = (statut) => {
    if (statut === "insere") return "badge badge--green";
    if (statut === "en_cours") return "badge badge--yellow";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getInsertionLabel = (statut) => {
    if (statut === "insere") return "VALIDÉE";
    if (statut === "en_cours") return "EN COURS";
    if (statut === "en_attente") return "EN ATTENTE";
    return "AUCUNE";
  };

  const getAge = (dateNaissance) => {
    if (!dateNaissance) return "—";
    const naissance = new Date(dateNaissance);
    if (isNaN(naissance.getTime())) return "—";
    const aujourdHui = new Date();
    let age = aujourdHui.getFullYear() - naissance.getFullYear();
    const moisDiff = aujourdHui.getMonth() - naissance.getMonth();
    if (
      moisDiff < 0 ||
      (moisDiff === 0 && aujourdHui.getDate() < naissance.getDate())
    ) {
      age--;
    }
    if (age < 0 || age > 120) return "—";
    return `${age} ans`;
  };

  // Suppression
  const ouvrirSuppr = (talibe, e) => {
    e.stopPropagation();
    setTalibeASupprimer(talibe);
    setModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deleteTalibe(talibeASupprimer.id);
      setTalibes((prev) => prev.filter((t) => t.id !== talibeASupprimer.id));
      if (selectedTalibe?.id === talibeASupprimer.id) setSelectedTalibe(null);
      setModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout titre="Talibés">
      <div className="talibes">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Talibés
              <span className="talibes__count">
                ({talibes.length.toLocaleString()})
              </span>
            </h2>
          </div>
          <button className="page__btn-export">
            <Download size={16} />
            Exporter PDF
          </button>
        </div>

        <div className="talibes__layout">
          {/* Gauche — Table */}
          <div className="talibes__left">
            {/* Filtres */}
            <div className="talibes__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou prénom..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>

              <select
                className="talibes__select"
                value={filtreRegion}
                onChange={(e) => setFiltreRegion(e.target.value)}
              >
                <option value="">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                className="talibes__select"
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="">Tous statuts</option>
                <option value="insere">Validée</option>
                <option value="en_cours">En cours</option>
                <option value="en_attente">En attente</option>
              </select>

              <div className="talibes__toggle">
                <span>Majeurs seulement</span>
                <label className="talibes__switch">
                  <input
                    type="checkbox"
                    checked={filtreMajeur}
                    onChange={(e) => setFiltreMajeur(e.target.checked)}
                  />
                  <span className="talibes__slider"></span>
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Âge</th>
                    <th>Daara</th>
                    <th>Région</th>
                    <th>État civil</th>
                    <th>Statut insertion</th>
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
                  ) : talibesPage.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="page__table-empty">
                        Aucun talibé trouvé.
                      </td>
                    </tr>
                  ) : (
                    talibesPage.map((talibe) => (
                      <tr
                        key={talibe.id}
                        className={
                          selectedTalibe?.id === talibe.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedTalibe(talibe)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong>{talibe.nom}</strong>
                        </td>
                        <td>{talibe.prenom}</td>
                        <td>{getAge(talibe.date_naissance)}</td>
                        <td>{talibe.daara?.nom || "—"}</td>
                        <td>{talibe.daara?.region || "—"}</td>
                        <td>
                          <span
                            className={
                              talibe.a_etat_civil
                                ? "badge badge--green"
                                : "badge badge--red"
                            }
                          >
                            {talibe.a_etat_civil ? "OUI" : "NON"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getInsertionClass(
                              talibe.statut_insertion,
                            )}
                          >
                            {getInsertionLabel(talibe.statut_insertion)}
                          </span>
                        </td>
                        <td>
                          <div className="page__actions">
                            <button
                              className="page__action-btn page__action-btn--view"
                              title="Voir le profil"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTalibe(talibe);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="page__action-btn page__action-btn--delete"
                              title="Supprimer"
                              onClick={(e) => ouvrirSuppr(talibe, e)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="talibes__pagination">
              <span>
                {talibesFiltres.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      talibesFiltres.length,
                    )} sur ${talibesFiltres.length} talibés`}
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

          {/* Droite — Profil */}
          {selectedTalibe ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Profil talibé</h3>

              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  {selectedTalibe.prenom?.[0]}
                  {selectedTalibe.nom?.[0]}
                </div>
                <span
                  className={
                    selectedTalibe.est_majeur
                      ? "badge badge--green"
                      : "badge badge--yellow"
                  }
                >
                  {selectedTalibe.est_majeur ? "Majeur" : "Mineur"} —{" "}
                  {getAge(selectedTalibe.date_naissance)}
                </span>
              </div>

              <p className="talibes__profil-name">
                {selectedTalibe.prenom} {selectedTalibe.nom}
              </p>

              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">DAARA</span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.daara?.nom || "—"} —{" "}
                    {selectedTalibe.daara?.region || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    LIEU DE NAISSANCE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.lieu_naissance || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">ÉTAT CIVIL</span>
                  <span
                    className={
                      selectedTalibe.a_etat_civil
                        ? "badge badge--green"
                        : "badge badge--red"
                    }
                  >
                    {selectedTalibe.a_etat_civil ? "OUI" : "NON"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    STATUT INSERTION
                  </span>
                  <span
                    className={getInsertionClass(
                      selectedTalibe.statut_insertion,
                    )}
                  >
                    {getInsertionLabel(selectedTalibe.statut_insertion)}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">NIVEAU D'ÉTUDE</span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.niveau_etude || "—"}
                  </span>
                </div>
              </div>

              <button
                className="talibes__profil-btn talibes__profil-btn--delete"
                onClick={(e) => ouvrirSuppr(selectedTalibe, e)}
              >
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur un talibé pour voir son profil</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal suppression */}
      {modalSuppr && (
        <div className="modal__overlay" onClick={() => setModalSuppr(false)}>
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Confirmer la suppression</h3>
              <button
                className="modal__close"
                onClick={() => setModalSuppr(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__confirm-text">
                Êtes-vous sûr de vouloir supprimer le talibé{" "}
                <strong>
                  {talibeASupprimer?.prenom} {talibeASupprimer?.nom}
                </strong>{" "}
                ? Cette action est irréversible.
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setModalSuppr(false)}
              >
                Annuler
              </button>
              <button
                className="modal__btn modal__btn--danger"
                onClick={confirmerSuppr}
                disabled={deleting}
              >
                <Trash2 size={15} />
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default TalibesPage;
