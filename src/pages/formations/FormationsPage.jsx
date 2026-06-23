import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Flag,
  Eye,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./FormationsPage.css";

const ITEMS_PAR_PAGE = 9;
const ITEMS_PAR_PAGE_INSERTIONS = 10;

function FormationsPage() {
  const [onglet, setOnglet] = useState("programmes");

  // --- Programmes ---
  const [formations, setFormations] = useState([]);
  const [loadingFormations, setLoadingFormations] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [domaineFiltre, setDomaineFiltre] = useState("tous");
  const [filtreStatutFormation, setFiltreStatutFormation] = useState("tous");
  const [pageFormations, setPageFormations] = useState(1);
  const [modalSuppr, setModalSuppr] = useState(false);
  const [formationASupprimer, setFormationASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [modalInscription, setModalInscription] = useState(false);
  const [formationSelectionnee, setFormationSelectionnee] = useState(null);
  const [talibes, setTalibes] = useState([]);
  const [loadingTalibes, setLoadingTalibes] = useState(false);
  const [rechercheTalibe, setRechercheTalibe] = useState("");
  const [talibeSelectionne, setTalibeSelectionne] = useState(null);
  const [inscrivant, setInscrivant] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);

  // --- Insertions ---
  const [insertions, setInsertions] = useState([]);
  const [loadingInsertions, setLoadingInsertions] = useState(true);
  const [rechercheInsertion, setRechercheInsertion] = useState("");
  const [filtreType, setFiltreType] = useState("tous");
  const [pageInsertions, setPageInsertions] = useState(1);
  const [selectedInsertion, setSelectedInsertion] = useState(null);
  const [modalCloturer, setModalCloturer] = useState(false);
  const [insertionACloturer, setInsertionACloturer] = useState(null);
  const [cloturing, setCloturing] = useState(false);

  useEffect(() => {
    fetchFormations();
    fetchInsertions();
  }, []);

  const fetchFormations = async () => {
    setLoadingFormations(true);
    try {
      const data = await adminService.getFormations();
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFormations(false);
    }
  };

  const fetchInsertions = async () => {
    setLoadingInsertions(true);
    try {
      const data = await adminService.getInsertions();
      setInsertions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsertions(false);
    }
  };

  // --- Actions formations ---
  const handleValiderFormation = async (id) => {
    try {
      await adminService.validerFormation(id);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...f, statut: "valide" } : f)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleActiverFormation = async (id) => {
    try {
      await adminService.activerFormation(id);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...f, statut: "actif" } : f)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesactiverFormation = async (id) => {
    try {
      await adminService.desactiverFormation(id);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...f, statut: "inactif" } : f)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirSuppr = (formation, e) => {
    e.stopPropagation();
    setFormationASupprimer(formation);
    setModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deleteFormation(formationASupprimer.id);
      setFormations((prev) =>
        prev.filter((f) => f.id !== formationASupprimer.id),
      );
      setModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const ouvrirInscription = async (formation) => {
    setFormationSelectionnee(formation);
    setTalibeSelectionne(null);
    setRechercheTalibe("");
    setInscriptionSuccess(false);
    setModalInscription(true);
    setLoadingTalibes(true);
    try {
      const data = await adminService.getTalibes();
      setTalibes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTalibes(false);
    }
  };

  const confirmerInscription = async () => {
    if (!talibeSelectionne) return;
    setInscrivant(true);
    try {
      await adminService.inscrireTalibe(
        formationSelectionnee.id,
        talibeSelectionne.id,
      );
      setInscriptionSuccess(true);
      setFormations((prev) =>
        prev.map((f) =>
          f.id === formationSelectionnee.id
            ? { ...f, nb_inscrits: (f.nb_inscrits || 0) + 1 }
            : f,
        ),
      );
      await fetchInsertions();
      setTimeout(() => {
        setModalInscription(false);
        setInscriptionSuccess(false);
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Erreur lors de l'inscription.";
      alert(msg);
    } finally {
      setInscrivant(false);
    }
  };

  // --- Actions insertions ---
  const handleValiderInsertion = async (id) => {
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

  // --- Filtrage formations ---
  const domaines = useMemo(() => {
    const set = new Set(formations.map((f) => f.domaine).filter(Boolean));
    return [...set].sort();
  }, [formations]);

  const formationsFiltrees = useMemo(() => {
    return formations.filter((f) => {
      const matchRecherche = f.titre
        ?.toLowerCase()
        .includes(recherche.toLowerCase());
      const matchDomaine =
        domaineFiltre === "tous" || f.domaine === domaineFiltre;
      const matchStatut =
        filtreStatutFormation === "tous" || f.statut === filtreStatutFormation;
      return matchRecherche && matchDomaine && matchStatut;
    });
  }, [formations, recherche, domaineFiltre, filtreStatutFormation]);

  useEffect(() => {
    setPageFormations(1);
  }, [recherche, domaineFiltre, filtreStatutFormation]);

  const totalPagesFormations = Math.max(
    1,
    Math.ceil(formationsFiltrees.length / ITEMS_PAR_PAGE),
  );
  const formationsPage = formationsFiltrees.slice(
    (pageFormations - 1) * ITEMS_PAR_PAGE,
    pageFormations * ITEMS_PAR_PAGE,
  );

  // --- Filtrage insertions ---
  const insertionsEnCours = useMemo(
    () => insertions.filter((i) => i.statut !== "cloture"),
    [insertions],
  );

  const insertionsHistorique = useMemo(
    () => insertions.filter((i) => i.statut === "cloture"),
    [insertions],
  );

  const talibesFiltres = useMemo(
    () =>
      talibes.filter((t) =>
        `${t.prenom} ${t.nom}`
          .toLowerCase()
          .includes(rechercheTalibe.toLowerCase()),
      ),
    [talibes, rechercheTalibe],
  );

  const insertionsFiltrees = useMemo(() => {
    const source =
      onglet === "en_cours" ? insertionsEnCours : insertionsHistorique;
    return source.filter((i) => {
      const terme = rechercheInsertion.toLowerCase();
      const matchRecherche =
        terme === "" ||
        `${i.talibe?.prenom || ""} ${i.talibe?.nom || ""}`
          .toLowerCase()
          .includes(terme) ||
        i.partenaire?.nom?.toLowerCase().includes(terme);
      const matchType = filtreType === "tous" || i.type === filtreType;
      return matchRecherche && matchType;
    });
  }, [
    insertions,
    onglet,
    rechercheInsertion,
    filtreType,
    insertionsEnCours,
    insertionsHistorique,
  ]);

  useEffect(() => {
    setPageInsertions(1);
  }, [rechercheInsertion, filtreType, onglet]);

  const totalPagesInsertions = Math.max(
    1,
    Math.ceil(insertionsFiltrees.length / ITEMS_PAR_PAGE_INSERTIONS),
  );
  const insertionsPage = insertionsFiltrees.slice(
    (pageInsertions - 1) * ITEMS_PAR_PAGE_INSERTIONS,
    pageInsertions * ITEMS_PAR_PAGE_INSERTIONS,
  );

  // --- Helpers ---
  const getStatutFormationClass = (statut) => {
    if (statut === "actif") return "badge badge--green";
    if (statut === "valide") return "badge badge--blue";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getStatutFormationLabel = (statut) => {
    if (statut === "actif") return "En cours";
    if (statut === "valide") return "Validée";
    if (statut === "en_attente") return "En attente";
    return "Inactive";
  };

  const getDomaineBg = (domaine) => {
    const colors = {
      Informatique: "#E3F2FD",
      Agriculture: "#E8F5E9",
      Artisanat: "#FFF3E0",
      Commerce: "#F3E5F5",
    };
    return colors[domaine] || "#F5F5F5";
  };

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

  const getStatutInsertionClass = (statut) => {
    if (statut === "valide") return "badge badge--green";
    if (statut === "en_cours") return "badge badge--blue";
    if (statut === "en_attente") return "badge badge--yellow";
    if (statut === "cloture") return "badge badge--gray";
    return "badge badge--gray";
  };

  const getStatutInsertionLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_cours") return "En cours";
    if (statut === "en_attente") return "En attente";
    if (statut === "cloture") return "Clôturé";
    return "—";
  };

  const getTalibeNom = (insertion) =>
    `${insertion.talibe?.prenom || ""} ${insertion.talibe?.nom || ""}`.trim() ||
    "—";

  const getTalibeInitiales = (insertion) =>
    `${insertion.talibe?.prenom?.[0] || ""}${insertion.talibe?.nom?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <AdminLayout titre="Formations & Insertions">
      <div className="formations">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">Formations & Insertions</h2>
            <p className="page__subtitle">
              Gérez les programmes, validez les inscriptions et suivez les
              parcours des talibés.
            </p>
          </div>
        </div>

        {/* Onglets principaux */}
        <div className="page__tabs">
          <button
            className={`page__tab ${onglet === "programmes" ? "active" : ""}`}
            onClick={() => setOnglet("programmes")}
          >
            Programmes ({formations.length})
          </button>
          <button
            className={`page__tab ${onglet === "en_cours" ? "active" : ""}`}
            onClick={() => setOnglet("en_cours")}
          >
            En cours ({insertionsEnCours.length})
          </button>
          <button
            className={`page__tab ${onglet === "historique" ? "active" : ""}`}
            onClick={() => setOnglet("historique")}
          >
            Historique ({insertionsHistorique.length})
          </button>
        </div>

        {/* ===================== ONGLET PROGRAMMES ===================== */}
        {onglet === "programmes" && (
          <>
            <div className="formations__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un programme..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <select
                className="talibes__select"
                value={domaineFiltre}
                onChange={(e) => setDomaineFiltre(e.target.value)}
              >
                <option value="tous">Tous les domaines</option>
                {domaines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <div className="page__tabs">
                {["tous", "en_attente", "valide", "actif", "inactif"].map(
                  (f) => (
                    <button
                      key={f}
                      className={`page__tab ${filtreStatutFormation === f ? "active" : ""}`}
                      onClick={() => setFiltreStatutFormation(f)}
                    >
                      {f === "tous" ? "Tous" : getStatutFormationLabel(f)}
                    </button>
                  ),
                )}
              </div>
              <button
                className="formations__reset"
                onClick={() => {
                  setRecherche("");
                  setDomaineFiltre("tous");
                  setFiltreStatutFormation("tous");
                }}
              >
                Réinitialiser
              </button>
            </div>

            <div className="formations__grid">
              {loadingFormations ? (
                <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
              ) : formationsPage.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                  Aucun programme trouvé.
                </p>
              ) : (
                formationsPage.map((formation) => (
                  <div key={formation.id} className="formation__card">
                    <div
                      className="formation__card-img"
                      style={{
                        backgroundColor: getDomaineBg(formation.domaine),
                      }}
                    >
                      <span className="formation__card-domaine-badge">
                        {formation.domaine || "Autre"}
                      </span>
                      <span
                        className={getStatutFormationClass(formation.statut)}
                      >
                        {getStatutFormationLabel(formation.statut)}
                      </span>
                    </div>
                    <div className="formation__card-body">
                      <h3 className="formation__card-title">
                        {formation.titre}
                      </h3>
                      <p className="formation__card-partenaire">
                        {formation.partenaire?.nom || "—"}
                      </p>
                      <div className="formation__card-infos">
                        {formation.date_debut && (
                          <p className="formation__card-info">
                            {new Date(formation.date_debut).toLocaleDateString(
                              "fr-FR",
                            )}
                            {" — "}
                            {formation.date_fin
                              ? new Date(formation.date_fin).toLocaleDateString(
                                  "fr-FR",
                                )
                              : "—"}
                          </p>
                        )}
                        {formation.lieu && (
                          <p className="formation__card-info">
                            {formation.lieu}
                          </p>
                        )}
                      </div>
                      <div className="formation__card-places">
                        <span>Inscrits</span>
                        <div className="formation__progress">
                          <div
                            className="formation__progress-fill"
                            style={{
                              width: `${Math.min(((formation.nb_inscrits || 0) / (formation.capacite || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span>
                          {formation.nb_inscrits || 0}/{formation.capacite || 0}
                        </span>
                      </div>
                      <div className="formation__card-footer">
                        <div className="formation__card-actions">
                          {formation.statut === "en_attente" && (
                            <button
                              className="page__action-btn page__action-btn--validate"
                              title="Valider"
                              onClick={() =>
                                handleValiderFormation(formation.id)
                              }
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {formation.statut === "valide" && (
                            <button
                              className="page__action-btn page__action-btn--validate"
                              title="Activer"
                              onClick={() =>
                                handleActiverFormation(formation.id)
                              }
                            >
                              <ToggleLeft size={16} />
                            </button>
                          )}
                          {formation.statut === "actif" && (
                            <>
                              <button
                                className="page__action-btn page__action-btn--validate"
                                title="Inscrire un talibé"
                                onClick={() => ouvrirInscription(formation)}
                              >
                                <UserPlus size={16} />
                              </button>
                              <button
                                className="page__action-btn page__action-btn--warn"
                                title="Voir inscrits"
                                onClick={() => {
                                  setOnglet("en_cours");
                                  setFiltreType("tous");
                                }}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="page__action-btn page__action-btn--warn"
                                title="Désactiver"
                                onClick={() =>
                                  handleDesactiverFormation(formation.id)
                                }
                              >
                                <ToggleRight size={16} />
                              </button>
                            </>
                          )}
                          {formation.statut === "inactif" && (
                            <button
                              className="page__action-btn page__action-btn--validate"
                              title="Réactiver"
                              onClick={() =>
                                handleActiverFormation(formation.id)
                              }
                            >
                              <ToggleLeft size={16} />
                            </button>
                          )}
                          <button
                            className="page__action-btn page__action-btn--delete"
                            title="Supprimer"
                            onClick={(e) => ouvrirSuppr(formation, e)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="talibes__pagination">
              <span>
                {formationsFiltrees.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(pageFormations - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(pageFormations * ITEMS_PAR_PAGE, formationsFiltrees.length)} sur ${formationsFiltrees.length} programmes`}
              </span>
              <div className="talibes__pages">
                <button
                  className="talibes__page-btn"
                  onClick={() => setPageFormations((p) => Math.max(1, p - 1))}
                  disabled={pageFormations === 1}
                >
                  ‹
                </button>
                {Array.from(
                  { length: totalPagesFormations },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    className={`talibes__page-btn${pageFormations === p ? " talibes__page-btn--active" : ""}`}
                    onClick={() => setPageFormations(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="talibes__page-btn"
                  onClick={() =>
                    setPageFormations((p) =>
                      Math.min(totalPagesFormations, p + 1),
                    )
                  }
                  disabled={pageFormations === totalPagesFormations}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===================== ONGLET EN COURS / HISTORIQUE ===================== */}
        {(onglet === "en_cours" || onglet === "historique") && (
          <div className="offres__layout">
            <div className="offres__left">
              <div className="offres__filters">
                <div className="page__search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher un talibé ou partenaire..."
                    value={rechercheInsertion}
                    onChange={(e) => setRechercheInsertion(e.target.value)}
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
                    {loadingInsertions ? (
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
                            <span
                              className={getStatutInsertionClass(
                                insertion.statut,
                              )}
                            >
                              {getStatutInsertionLabel(insertion.statut)}
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
                                    handleValiderInsertion(insertion.id);
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

              <div
                className="talibes__pagination"
                style={{ marginTop: "1rem" }}
              >
                <span>
                  {insertionsFiltrees.length === 0
                    ? "Aucun résultat"
                    : `Affichage ${(pageInsertions - 1) * ITEMS_PAR_PAGE_INSERTIONS + 1}–${Math.min(pageInsertions * ITEMS_PAR_PAGE_INSERTIONS, insertionsFiltrees.length)} sur ${insertionsFiltrees.length} insertions`}
                </span>
                <div className="talibes__pages">
                  <button
                    className="talibes__page-btn"
                    onClick={() => setPageInsertions((p) => Math.max(1, p - 1))}
                    disabled={pageInsertions === 1}
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: totalPagesInsertions },
                    (_, i) => i + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      className={`talibes__page-btn${pageInsertions === p ? " talibes__page-btn--active" : ""}`}
                      onClick={() => setPageInsertions(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="talibes__page-btn"
                    onClick={() =>
                      setPageInsertions((p) =>
                        Math.min(totalPagesInsertions, p + 1),
                      )
                    }
                    disabled={pageInsertions === totalPagesInsertions}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Panneau détail insertion */}
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
                    <span className="talibes__profil-label">DATE</span>
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
                    <span
                      className={getStatutInsertionClass(
                        selectedInsertion.statut,
                      )}
                    >
                      {getStatutInsertionLabel(selectedInsertion.statut)}
                    </span>
                  </div>
                </div>
                <div className="talibes__profil-actions">
                  {selectedInsertion.statut === "en_attente" && (
                    <button
                      className="talibes__profil-btn"
                      style={{ background: "var(--primary)", color: "white" }}
                      onClick={() =>
                        handleValiderInsertion(selectedInsertion.id)
                      }
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
        )}
      </div>

      {/* Modal suppression formation */}
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
                Êtes-vous sûr de vouloir supprimer le programme{" "}
                <strong>{formationASupprimer?.titre}</strong> ? Cette action est
                irréversible.
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
                <Trash2 size={15} /> {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal inscription talibé */}
      {modalInscription && (
        <div
          className="modal__overlay"
          onClick={() => setModalInscription(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                Inscrire un talibé — {formationSelectionnee?.titre}
              </h3>
              <button
                className="modal__close"
                onClick={() => setModalInscription(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              {inscriptionSuccess ? (
                <div className="formations__inscription-success">
                  <CheckCircle size={40} color="var(--primary)" />
                  <p>Talibé inscrit avec succès !</p>
                </div>
              ) : (
                <>
                  <p className="formations__inscription-info">
                    Programme :{" "}
                    <strong>{formationSelectionnee?.domaine}</strong> —{" "}
                    {formationSelectionnee?.nb_inscrits || 0}/
                    {formationSelectionnee?.capacite || 0} inscrits
                  </p>
                  <div
                    className="page__search"
                    style={{ marginBottom: "1rem" }}
                  >
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Rechercher un talibé..."
                      value={rechercheTalibe}
                      onChange={(e) => setRechercheTalibe(e.target.value)}
                      className="page__search-input"
                    />
                  </div>
                  {loadingTalibes ? (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
                      Chargement...
                    </p>
                  ) : (
                    <div className="formations__talibes-list">
                      {talibesFiltres.slice(0, 8).map((talibe) => (
                        <div
                          key={talibe.id}
                          className={`formations__talibe-item ${talibeSelectionne?.id === talibe.id ? "formations__talibe-item--active" : ""}`}
                          onClick={() => setTalibeSelectionne(talibe)}
                        >
                          <div className="formations__talibe-avatar">
                            {talibe.prenom?.[0]}
                            {talibe.nom?.[0]}
                          </div>
                          <div className="formations__talibe-info">
                            <span className="formations__talibe-nom">
                              {talibe.prenom} {talibe.nom}
                            </span>
                            <span className="formations__talibe-daara">
                              {talibe.daara?.nom || "—"}
                            </span>
                          </div>
                          {talibeSelectionne?.id === talibe.id && (
                            <CheckCircle size={16} color="var(--primary)" />
                          )}
                        </div>
                      ))}
                      {talibesFiltres.length === 0 && (
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "13px",
                          }}
                        >
                          Aucun talibé trouvé.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {!inscriptionSuccess && (
              <div className="modal__footer">
                <button
                  className="modal__btn modal__btn--cancel"
                  onClick={() => setModalInscription(false)}
                >
                  Annuler
                </button>
                <button
                  className="modal__btn modal__btn--save"
                  onClick={confirmerInscription}
                  disabled={!talibeSelectionne || inscrivant}
                >
                  <UserPlus size={15} />{" "}
                  {inscrivant ? "Inscription..." : "Inscrire"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal clôturer insertion */}
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
                <Flag size={15} /> {cloturing ? "Clôture..." : "Clôturer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default FormationsPage;
