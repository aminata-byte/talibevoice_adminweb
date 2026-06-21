import { useState, useEffect, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Download,
  X,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./DaarasPage.css";

const ITEMS_PAR_PAGE = 10;

function DaarasPage() {
  const [daaras, setDaaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [page, setPage] = useState(1);
  const [selectedDaara, setSelectedDaara] = useState(null);
  const [modalSuppr, setModalSuppr] = useState(false);
  const [daaraASupprimer, setDaaraASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDaaras();
  }, []);

  const fetchDaaras = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDaaras();
      setDaaras(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerDaara(id);
      setDaaras((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut: "actif" } : d)),
      );
      if (selectedDaara?.id === id)
        setSelectedDaara((d) => ({ ...d, statut: "actif" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleActiver = async (id) => {
    try {
      await adminService.activerDaara(id);
      setDaaras((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut: "actif" } : d)),
      );
      if (selectedDaara?.id === id)
        setSelectedDaara((d) => ({ ...d, statut: "actif" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesactiver = async (id) => {
    try {
      await adminService.desactiverDaara(id);
      setDaaras((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut: "inactif" } : d)),
      );
      if (selectedDaara?.id === id)
        setSelectedDaara((d) => ({ ...d, statut: "inactif" }));
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirSuppr = (daara, e) => {
    e.stopPropagation();
    setDaaraASupprimer(daara);
    setModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deleteDaara(daaraASupprimer.id);
      setDaaras((prev) => prev.filter((d) => d.id !== daaraASupprimer.id));
      if (selectedDaara?.id === daaraASupprimer.id) setSelectedDaara(null);
      setModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const daarasFiltres = useMemo(() => {
    return daaras.filter((d) => {
      const matchRecherche = d.nom
        .toLowerCase()
        .includes(recherche.toLowerCase());
      const matchFiltre = filtre === "tous" || d.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [daaras, recherche, filtre]);

  useEffect(() => {
    setPage(1);
  }, [recherche, filtre]);

  const totalPages = Math.max(
    1,
    Math.ceil(daarasFiltres.length / ITEMS_PAR_PAGE),
  );
  const daarasPage = daarasFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getStatutClass = (statut) => {
    if (statut === "actif") return "badge badge--green";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getStatutLabel = (statut) => {
    if (statut === "actif") return "Actif";
    if (statut === "en_attente") return "En attente";
    return "Inactif";
  };

  return (
    <AdminLayout titre="Daaras">
      <div className="daaras">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Daaras
              <span className="talibes__count">
                ({daaras.length.toLocaleString()})
              </span>
            </h2>
          </div>
          <button className="page__btn-export">
            <Download size={16} />
            Exporter
          </button>
        </div>

        <div className="daaras__layout">
          <div className="daaras__left">
            {/* Filtres */}
            <div className="page__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un daara..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <div className="page__tabs">
                {["tous", "actif", "en_attente", "inactif"].map((f) => (
                  <button
                    key={f}
                    className={`page__tab ${filtre === f ? "active" : ""}`}
                    onClick={() => setFiltre(f)}
                  >
                    {f === "tous"
                      ? "Tous"
                      : f === "actif"
                        ? "Actifs"
                        : f === "en_attente"
                          ? "En attente"
                          : "Inactifs"}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Région</th>
                    <th>Responsable</th>
                    <th>Talibés</th>
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
                  ) : daarasPage.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="page__table-empty">
                        Aucun daara trouvé.
                      </td>
                    </tr>
                  ) : (
                    daarasPage.map((daara) => (
                      <tr
                        key={daara.id}
                        className={
                          selectedDaara?.id === daara.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedDaara(daara)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <div className="page__table-name">
                            <strong>{daara.nom}</strong>
                            <span>{daara.adresse}</span>
                          </div>
                        </td>
                        <td>{daara.region || "—"}</td>
                        <td>{daara.nom_responsable}</td>
                        <td>{daara.nombre_talibes ?? 0}</td>
                        <td>
                          <span className={getStatutClass(daara.statut)}>
                            {getStatutLabel(daara.statut)}
                          </span>
                        </td>
                        <td>
                          <div className="page__actions">
                            {daara.statut === "en_attente" && (
                              <button
                                className="page__action-btn page__action-btn--validate"
                                title="Valider"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleValider(daara.id);
                                }}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {daara.statut === "actif" && (
                              <button
                                className="page__action-btn page__action-btn--warn"
                                title="Désactiver"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDesactiver(daara.id);
                                }}
                              >
                                <ToggleRight size={16} />
                              </button>
                            )}
                            {daara.statut === "inactif" && (
                              <button
                                className="page__action-btn page__action-btn--validate"
                                title="Activer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActiver(daara.id);
                                }}
                              >
                                <ToggleLeft size={16} />
                              </button>
                            )}
                            <button
                              className="page__action-btn page__action-btn--delete"
                              title="Supprimer"
                              onClick={(e) => ouvrirSuppr(daara, e)}
                            >
                              <XCircle size={16} />
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
                {daarasFiltres.length === 0
                  ? "Aucun résultat"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                      page * ITEMS_PAR_PAGE,
                      daarasFiltres.length,
                    )} sur ${daarasFiltres.length} daaras`}
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

          {/* Droite — Profil Daara */}
          {selectedDaara ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Détail daara</h3>

              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  {selectedDaara.nom?.[0]}
                </div>
                <span className={getStatutClass(selectedDaara.statut)}>
                  {getStatutLabel(selectedDaara.statut)}
                </span>
              </div>

              <p className="talibes__profil-name">{selectedDaara.nom}</p>

              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <MapPin size={11} /> ADRESSE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedDaara.adresse || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">RÉGION</span>
                  <span className="talibes__profil-value">
                    {selectedDaara.region || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Users size={11} /> RESPONSABLE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedDaara.nom_responsable || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    <Phone size={11} /> TÉLÉPHONE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedDaara.telephone_responsable || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">TALIBÉS</span>
                  <span className="talibes__profil-value">
                    {selectedDaara.nombre_talibes ?? 0}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">CAPACITÉ</span>
                  <span className="talibes__profil-value">
                    {selectedDaara.capacite_accueil || "—"}
                  </span>
                </div>
              </div>

              <div className="talibes__profil-actions">
                {selectedDaara.statut === "en_attente" && (
                  <button
                    className="talibes__profil-btn"
                    style={{ background: "var(--primary)", color: "white" }}
                    onClick={() => handleValider(selectedDaara.id)}
                  >
                    <CheckCircle size={15} /> Valider
                  </button>
                )}
                {selectedDaara.statut === "actif" && (
                  <button
                    className="talibes__profil-btn"
                    style={{
                      background: "rgba(234,179,8,0.12)",
                      color: "#b45309",
                    }}
                    onClick={() => handleDesactiver(selectedDaara.id)}
                  >
                    <ToggleRight size={15} /> Désactiver
                  </button>
                )}
                {selectedDaara.statut === "inactif" && (
                  <button
                    className="talibes__profil-btn"
                    style={{ background: "var(--primary)", color: "white" }}
                    onClick={() => handleActiver(selectedDaara.id)}
                  >
                    <ToggleLeft size={15} /> Activer
                  </button>
                )}
                <button
                  className="talibes__profil-btn talibes__profil-btn--delete"
                  onClick={(e) => ouvrirSuppr(selectedDaara, e)}
                >
                  <XCircle size={15} /> Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur un daara pour voir son détail</p>
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
                Êtes-vous sûr de vouloir supprimer le daara{" "}
                <strong>{daaraASupprimer?.nom}</strong> ? Cette action est
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
                <XCircle size={15} />
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DaarasPage;
