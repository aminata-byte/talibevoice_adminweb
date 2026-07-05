import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  GraduationCap,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./PartenairesPage.css";

const ITEMS_PAR_PAGE = 10;

function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [page, setPage] = useState(1);
  const [selectedPartenaire, setSelectedPartenaire] = useState(null);
  const [modalSuppr, setModalSuppr] = useState(false);
  const [partenaireASupprimer, setPartenaireASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [modalCode, setModalCode] = useState(false);
  const [codePartenaire, setCodePartenaire] = useState(null);
  const [nomPartenaire, setNomPartenaire] = useState(null);

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const fetchPartenaires = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPartenaires();
      setPartenaires(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      const res = await adminService.validerPartenaire(id);
      setPartenaires((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, statut: "valide", code_partenaire: res.code_partenaire }
            : p,
        ),
      );
      if (selectedPartenaire?.id === id) {
        setSelectedPartenaire((p) => ({
          ...p,
          statut: "valide",
          code_partenaire: res.code_partenaire,
        }));
      }
      setCodePartenaire(res.code_partenaire);
      setNomPartenaire(res.partenaire?.nom);
      setModalCode(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejeter = async (id) => {
    try {
      await adminService.rejeterPartenaire(id);
      setPartenaires((prev) =>
        prev.map((p) => (p.id === id ? { ...p, statut: "rejete" } : p)),
      );
      if (selectedPartenaire?.id === id)
        setSelectedPartenaire((p) => ({ ...p, statut: "rejete" }));
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirSuppr = (partenaire, e) => {
    e.stopPropagation();
    setPartenaireASupprimer(partenaire);
    setModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deletePartenaire(partenaireASupprimer.id);
      setPartenaires((prev) =>
        prev.filter((p) => p.id !== partenaireASupprimer.id),
      );
      if (selectedPartenaire?.id === partenaireASupprimer.id)
        setSelectedPartenaire(null);
      setModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const partenaireFiltres = useMemo(() => {
    return partenaires.filter((p) => {
      const matchRecherche =
        p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
        p.domaine?.toLowerCase().includes(recherche.toLowerCase()) ||
        p.email?.toLowerCase().includes(recherche.toLowerCase());
      const matchFiltre = filtre === "tous" || p.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [partenaires, recherche, filtre]);

  useEffect(() => {
    setPage(1);
  }, [recherche, filtre]);

  const totalPages = Math.max(
    1,
    Math.ceil(partenaireFiltres.length / ITEMS_PAR_PAGE),
  );
  const partenairesPage = partenaireFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getStatutClass = (statut) => {
    if (statut === "valide") return "badge badge--green";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_attente") return "En attente";
    return "Rejeté";
  };

  return (
    <AdminLayout titre="Partenaires">
      <div className="partenaires">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Partenaires
              <span className="talibes__count">
                ({partenaires.length.toLocaleString()})
              </span>
            </h2>
          </div>
        </div>

        <div className="daaras__layout">
          <div className="daaras__left">
            <div className="page__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un partenaire..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <div className="page__tabs">
                {["tous", "en_attente", "valide", "rejete"].map((f) => (
                  <button
                    key={f}
                    className={`page__tab ${filtre === f ? "active" : ""}`}
                    onClick={() => setFiltre(f)}
                  >
                    {f === "tous"
                      ? "Tous"
                      : f === "en_attente"
                        ? "En attente"
                        : f === "valide"
                          ? "Validés"
                          : "Rejetés"}
                  </button>
                ))}
              </div>
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Partenaire</th>
                    <th>Domaine</th>
                    <th>Contact</th>
                    <th>Formations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="page__table-empty">
                        Chargement...
                      </td>
                    </tr>
                  ) : partenairesPage.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="page__table-empty">
                        Aucun partenaire trouvé.
                      </td>
                    </tr>
                  ) : (
                    partenairesPage.map((partenaire) => (
                      <tr
                        key={partenaire.id}
                        className={
                          selectedPartenaire?.id === partenaire.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedPartenaire(partenaire)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="page__table-name">
                            <strong>{partenaire.nom}</strong>
                            <span>{partenaire.email}</span>
                          </div>
                        </td>
                        <td>{partenaire.domaine || "—"}</td>
                        <td>{partenaire.nom_contact || "—"}</td>
                        <td>
                          <span className="badge badge--blue">
                            {partenaire.nombre_formations || 0} formation(s)
                          </span>
                        </td>
                        <td>
                          <span className={getStatutClass(partenaire.statut)}>
                            {getStatutLabel(partenaire.statut)}
                          </span>
                        </td>
                        <td>
                          <div className="page__actions">
                            <button
                              className="page__action-btn page__action-btn--view"
                              title="Voir"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPartenaire(partenaire);
                              }}
                            >
                              <Eye size={15} />
                            </button>
                            {partenaire.statut === "en_attente" && (
                              <>
                                <button
                                  className="page__action-btn page__action-btn--validate"
                                  title="Valider"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleValider(partenaire.id);
                                  }}
                                >
                                  <CheckCircle size={15} />
                                </button>
                                <button
                                  className="page__action-btn page__action-btn--warn"
                                  title="Rejeter"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejeter(partenaire.id);
                                  }}
                                >
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                            <button
                              className="page__action-btn page__action-btn--delete"
                              title="Supprimer"
                              onClick={(e) => ouvrirSuppr(partenaire, e)}
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

            <div className="talibes__pagination">
              <span>
                {partenaireFiltres.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      partenaireFiltres.length,
                    )} sur ${partenaireFiltres.length} partenaires`}
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

          {selectedPartenaire ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Détail partenaire</h3>

              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  <Building2 size={20} />
                </div>
                <span className={getStatutClass(selectedPartenaire.statut)}>
                  {getStatutLabel(selectedPartenaire.statut)}
                </span>
              </div>

              <p className="talibes__profil-name">{selectedPartenaire.nom}</p>

              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">DOMAINE</span>
                  <span className="talibes__profil-value">
                    {selectedPartenaire.domaine || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Mail size={11} /> EMAIL
                  </span>
                  <span className="talibes__profil-value">
                    {selectedPartenaire.email || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Phone size={11} /> TÉLÉPHONE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedPartenaire.telephone || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">CONTACT</span>
                  <span className="talibes__profil-value">
                    {selectedPartenaire.nom_contact || "—"}
                  </span>
                </div>
                {selectedPartenaire.site_web && (
                  <div className="talibes__profil-info">
                    <span className="talibes__profil-label">
                      <Globe size={11} /> SITE WEB
                    </span>
                    <span className="talibes__profil-value">
                      {selectedPartenaire.site_web}
                    </span>
                  </div>
                )}
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <GraduationCap size={11} /> FORMATIONS
                  </span>
                  <span className="talibes__profil-value">
                    {selectedPartenaire.nombre_formations || 0} formation(s)
                  </span>
                </div>
                {selectedPartenaire.message_motivation && (
                  <div className="talibes__profil-info">
                    <span className="talibes__profil-label">MOTIVATION</span>
                    <span className="talibes__profil-value">
                      {selectedPartenaire.message_motivation}
                    </span>
                  </div>
                )}
                {selectedPartenaire.code_partenaire && (
                  <div className="talibes__profil-info">
                    <span className="talibes__profil-label">
                      CODE PARTENAIRE
                    </span>
                    <span
                      className="talibes__profil-value"
                      style={{
                        fontFamily: "monospace",
                        fontWeight: "700",
                        color: "var(--primary)",
                        letterSpacing: "2px",
                        fontSize: "16px",
                      }}
                    >
                      {selectedPartenaire.code_partenaire}
                    </span>
                  </div>
                )}
              </div>

              {selectedPartenaire.statut === "en_attente" && (
                <div className="talibes__profil-actions">
                  <button
                    className="talibes__profil-btn"
                    style={{ background: "var(--primary)", color: "white" }}
                    onClick={() => handleValider(selectedPartenaire.id)}
                  >
                    <CheckCircle size={15} /> Valider
                  </button>
                  <button
                    className="talibes__profil-btn talibes__profil-btn--delete"
                    onClick={() => handleRejeter(selectedPartenaire.id)}
                  >
                    <XCircle size={15} /> Rejeter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur un partenaire pour voir son détail</p>
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
                Êtes-vous sûr de vouloir supprimer le partenaire{" "}
                <strong>{partenaireASupprimer?.nom}</strong> ?
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

      {/* Modal code partenaire */}
      {modalCode && (
        <div className="modal__overlay" onClick={() => setModalCode(false)}>
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Partenaire validé</h3>
              <button
                className="modal__close"
                onClick={() => setModalCode(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p
                style={{
                  marginBottom: "1rem",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                }}
              >
                Le partenaire <strong>{nomPartenaire}</strong> a été validé avec
                succès. Communiquez ce code au partenaire pour qu'il puisse
                accéder à son espace :
              </p>
              <div
                style={{
                  background: "rgba(27, 125, 75, 0.08)",
                  border: "2px dashed var(--primary)",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Code partenaire
                </p>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: "var(--primary)",
                    letterSpacing: "6px",
                    fontFamily: "monospace",
                    margin: 0,
                  }}
                >
                  {codePartenaire}
                </p>
              </div>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                Ce code est également visible dans le détail du partenaire.
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn"
                style={{ background: "var(--primary)", color: "white" }}
                onClick={() => {
                  navigator.clipboard.writeText(codePartenaire);
                  alert("Code copié !");
                }}
              >
                Copier le code
              </button>
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setModalCode(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default PartenairesPage;
