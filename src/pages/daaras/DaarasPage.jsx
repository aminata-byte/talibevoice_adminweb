import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, Download } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./DaarasPage.css";

function DaarasPage() {
  const [daaras, setDaaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [selectedDaara, setSelectedDaara] = useState(null);

  useEffect(() => {
    fetchDaaras();
  }, []);

  const fetchDaaras = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDaaras();
      setDaaras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerDaara(id);
      fetchDaaras();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce daara ?")) return;
    try {
      await adminService.deleteDaara(id);
      fetchDaaras();
    } catch (err) {
      console.error(err);
    }
  };

  const daarasFiltres = daaras.filter((d) => {
    const matchRecherche = d.nom
      .toLowerCase()
      .includes(recherche.toLowerCase());
    const matchFiltre = filtre === "tous" || d.statut === filtre;
    return matchRecherche && matchFiltre;
  });

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
      <div className="page">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Daaras</h2>
            <p className="page__subtitle">
              {daarasFiltres.length} daara(s) trouvé(s)
            </p>
          </div>
          <button className="page__btn-export">
            <Download size={16} />
            Exporter
          </button>
        </div>

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
              ) : daarasFiltres.length === 0 ? (
                <tr>
                  <td colSpan="6" className="page__table-empty">
                    Aucun daara trouvé.
                  </td>
                </tr>
              ) : (
                daarasFiltres.map((daara) => (
                  <tr key={daara.id}>
                    <td>
                      <div className="page__table-name">
                        <strong>{daara.nom}</strong>
                        <span>{daara.adresse}</span>
                      </div>
                    </td>
                    <td>{daara.region || "—"}</td>
                    <td>{daara.nom_responsable}</td>
                    <td>{daara.nombre_talibes}</td>
                    <td>
                      <span className={getStatutClass(daara.statut)}>
                        {getStatutLabel(daara.statut)}
                      </span>
                    </td>
                    <td>
                      <div className="page__actions">
                        <button
                          className="page__action-btn page__action-btn--view"
                          onClick={() => setSelectedDaara(daara)}
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        {daara.statut === "en_attente" && (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            onClick={() => handleValider(daara.id)}
                            title="Valider"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          className="page__action-btn page__action-btn--delete"
                          onClick={() => handleDelete(daara.id)}
                          title="Supprimer"
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
      </div>

      {/* Modal Détail */}
      {selectedDaara && (
        <div className="modal-overlay" onClick={() => setSelectedDaara(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">{selectedDaara.nom}</h3>
              <button
                className="modal__close"
                onClick={() => setSelectedDaara(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__detail-grid">
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Adresse</span>
                  <span className="modal__detail-value">
                    {selectedDaara.adresse}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Région</span>
                  <span className="modal__detail-value">
                    {selectedDaara.region || "—"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Responsable</span>
                  <span className="modal__detail-value">
                    {selectedDaara.nom_responsable}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Téléphone</span>
                  <span className="modal__detail-value">
                    {selectedDaara.telephone_responsable || "—"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Talibés</span>
                  <span className="modal__detail-value">
                    {selectedDaara.nombre_talibes}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Capacité</span>
                  <span className="modal__detail-value">
                    {selectedDaara.capacite_accueil}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Statut</span>
                  <span className={getStatutClass(selectedDaara.statut)}>
                    {getStatutLabel(selectedDaara.statut)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn-cancel"
                onClick={() => setSelectedDaara(null)}
              >
                Fermer
              </button>
              {selectedDaara.statut === "en_attente" && (
                <button
                  className="modal__btn-submit"
                  onClick={() => {
                    handleValider(selectedDaara.id);
                    setSelectedDaara(null);
                  }}
                >
                  Valider ce daara
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DaarasPage;
