import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Eye,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./FormationsPage.css";

const ITEMS_PAR_PAGE = 9;

function FormationsPage() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [domaineFiltre, setDomaineFiltre] = useState("tous");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFormations();
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerFormation(id);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...f, statut: "valide" } : f)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleActiver = async (id) => {
    try {
      await adminService.activerFormation(id);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...f, statut: "actif" } : f)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesactiver = async (id) => {
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
      setTimeout(() => {
        setModalInscription(false);
        setInscriptionSuccess(false);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setInscrivant(false);
    }
  };

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
      const matchStatut = filtreStatut === "tous" || f.statut === filtreStatut;
      return matchRecherche && matchDomaine && matchStatut;
    });
  }, [formations, recherche, domaineFiltre, filtreStatut]);

  useEffect(() => {
    setPage(1);
  }, [recherche, domaineFiltre, filtreStatut]);

  const totalPages = Math.max(
    1,
    Math.ceil(formationsFiltrees.length / ITEMS_PAR_PAGE),
  );
  const formationsPage = formationsFiltrees.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
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

  const getStatutClass = (statut) => {
    if (statut === "actif") return "badge badge--green";
    if (statut === "valide") return "badge badge--blue";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getStatutLabel = (statut) => {
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

  return (
    <AdminLayout titre="Formations">
      <div className="formations">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Formations
              <span className="talibes__count">({formations.length})</span>
            </h2>
            <p className="page__subtitle">
              Validez et gérez les programmes de formation proposés par les
              partenaires.
            </p>
          </div>
        </div>

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
            {["tous", "en_attente", "valide", "actif", "inactif"].map((f) => (
              <button
                key={f}
                className={`page__tab ${filtreStatut === f ? "active" : ""}`}
                onClick={() => setFiltreStatut(f)}
              >
                {f === "tous" ? "Tous" : getStatutLabel(f)}
              </button>
            ))}
          </div>
          <button
            className="formations__reset"
            onClick={() => {
              setRecherche("");
              setDomaineFiltre("tous");
              setFiltreStatut("tous");
            }}
          >
            Réinitialiser
          </button>
        </div>

        <div className="formations__grid">
          {loading ? (
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
                  style={{ backgroundColor: getDomaineBg(formation.domaine) }}
                >
                  <span className="formation__card-domaine-badge">
                    {formation.domaine || "Autre"}
                  </span>
                  <span className={getStatutClass(formation.statut)}>
                    {getStatutLabel(formation.statut)}
                  </span>
                </div>
                <div className="formation__card-body">
                  <h3 className="formation__card-title">{formation.titre}</h3>
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
                      <p className="formation__card-info">{formation.lieu}</p>
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
                          onClick={() => handleValider(formation.id)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {formation.statut === "valide" && (
                        <button
                          className="page__action-btn page__action-btn--validate"
                          title="Activer"
                          onClick={() => handleActiver(formation.id)}
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
                            title="Désactiver"
                            onClick={() => handleDesactiver(formation.id)}
                          >
                            <ToggleRight size={16} />
                          </button>
                        </>
                      )}
                      {formation.statut === "inactif" && (
                        <button
                          className="page__action-btn page__action-btn--validate"
                          title="Réactiver"
                          onClick={() => handleActiver(formation.id)}
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
              : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(page * ITEMS_PAR_PAGE, formationsFiltrees.length)} sur ${formationsFiltrees.length} programmes`}
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
                Êtes-vous sûr de vouloir supprimer{" "}
                <strong>{formationASupprimer?.titre}</strong> ?
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

      {/* Modal inscription */}
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
    </AdminLayout>
  );
}

export default FormationsPage;
