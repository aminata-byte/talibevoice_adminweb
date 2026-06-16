import { useState, useEffect } from "react";
import {
  Search,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard,
  Package,
  Info,
  X,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./DonsPage.css";

function DonsPage() {
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [selectedDon, setSelectedDon] = useState(null);

  const donsFinanciers = dons.filter((d) => d.type === "financier");
  const totalRecu = donsFinanciers.reduce(
    (acc, d) => acc + (Number(d.montant) || 0),
    0,
  );
  const totalValide = donsFinanciers
    .filter((d) => d.statut === "valide")
    .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
  const totalEnAttente = donsFinanciers
    .filter((d) => d.statut === "en_attente")
    .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
  const totalRedistribue = donsFinanciers
    .filter((d) => d.statut === "redistribue")
    .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);

  const stats = {
    total: totalRecu,
    nbEnAttente: dons.filter((d) => d.statut === "en_attente").length,
    enAttente: totalEnAttente,
    valides: totalValide,
    pctValides: totalRecu > 0 ? Math.round((totalValide / totalRecu) * 100) : 0,
    redistribues: totalRedistribue,
    pctRedistribues:
      totalValide > 0 ? Math.round((totalRedistribue / totalValide) * 100) : 0,
  };

  useEffect(() => {
    fetchDons();
  }, []);

  const fetchDons = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDons();
      setDons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerDon(id);
      fetchDons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejeter = async (id) => {
    if (!window.confirm("Rejeter ce don ?")) return;
    try {
      await adminService.rejeterDon(id);
      fetchDons();
    } catch (err) {
      console.error(err);
    }
  };

  const donsFiltres = dons.filter((d) => {
    const terme = recherche.toLowerCase();
    const matchRecherche =
      terme === "" ||
      d.donateur?.nom?.toLowerCase().includes(terme) ||
      d.donateur?.prenom?.toLowerCase().includes(terme);
    const matchFiltre = filtre === "tous" || d.statut === filtre;
    return matchRecherche && matchFiltre;
  });

  const getStatutClass = (statut) => {
    if (statut === "valide") return "badge badge--green";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--red";
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_attente") return "En attente";
    return "Rejeté";
  };

  const getDonateur = (don) => {
    if (don.donateur?.est_anonyme) return "Anonyme";
    return (
      `${don.donateur?.prenom || ""} ${don.donateur?.nom || ""}`.trim() ||
      "Inconnu"
    );
  };

  const getInitiales = (don) => {
    if (don.donateur?.est_anonyme) return "A";
    return (
      `${don.donateur?.prenom?.[0] || ""}${don.donateur?.nom?.[0] || ""}`.toUpperCase() ||
      "?"
    );
  };

  // Évolution mensuelle des dons financiers calculée depuis les vraies données
  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const moisData = moisLabels.map((_, index) =>
    donsFinanciers
      .filter((d) => new Date(d.created_at).getMonth() === index)
      .reduce((acc, d) => acc + (Number(d.montant) || 0), 0),
  );
  const maxVal = Math.max(...moisData, 1);

  return (
    <AdminLayout titre="Dons">
      <div className="dons">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des dons</h2>
            <p className="page__subtitle">
              Suivi et validation des contributions pour les Talibés.
            </p>
          </div>
          <div className="dons__header-actions">
            <button className="page__btn-export">
              <Download size={16} />
              Exporter Rapport
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="dons__stats">
          <div className="dons__stat-card">
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--green">
                {donsFinanciers.length} dons reçus
              </span>
            </div>
            <p className="dons__stat-label">Total reçu</p>
            <p className="dons__stat-value">
              {(stats.total / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
          <div className="dons__stat-card">
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--yellow">
                {stats.nbEnAttente} dossiers
              </span>
            </div>
            <p className="dons__stat-label">En attente</p>
            <p className="dons__stat-value">
              {(stats.enAttente / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
          <div className="dons__stat-card">
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--green">
                {stats.pctValides}% validés
              </span>
            </div>
            <p className="dons__stat-label">Validés</p>
            <p className="dons__stat-value">
              {(stats.valides / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
          <div className="dons__stat-card">
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--blue">
                {stats.pctRedistribues}% redistribués
              </span>
            </div>
            <p className="dons__stat-label">Redistribués</p>
            <p className="dons__stat-value">
              {(stats.redistribues / 1000000).toFixed(1)}M FCFA
            </p>
          </div>
        </div>

        {/* Graphique */}
        <div className="dons__chart-card">
          <div className="dons__chart-header">
            <h3 className="dons__chart-title">
              Évolution des dons (Jan - Juin)
            </h3>
            <div className="dons__chart-legend">
              <span className="dons__chart-dot"></span>
              <span>Dons Financiers</span>
            </div>
          </div>
          <div className="dons__chart">
            {moisData.map((val, index) => (
              <div key={index} className="dons__chart-col">
                <div className="dons__chart-bar-wrapper">
                  <div
                    className="dons__chart-bar"
                    style={{ height: `${(val / maxVal) * 100}%` }}
                  />
                </div>
                <span className="dons__chart-label">{moisLabels[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="dons__table-card">
          <div className="dons__table-header">
            <h3 className="dons__chart-title">
              Liste des transactions récentes
            </h3>
          </div>

          <div className="page__filters" style={{ marginBottom: "1rem" }}>
            <div className="page__search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Rechercher un don..."
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

          <table className="page__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donateur</th>
                <th>Montant</th>
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
              ) : donsFiltres.length === 0 ? (
                <tr>
                  <td colSpan="7" className="page__table-empty">
                    Aucun don trouvé.
                  </td>
                </tr>
              ) : (
                donsFiltres.map((don) => (
                  <tr key={don.id}>
                    <td className="dons__table-id">
                      #TV-{String(don.id).padStart(4, "0")}
                    </td>
                    <td>
                      <div className="page__table-user">
                        <div className="page__table-avatar">
                          {getInitiales(don)}
                        </div>
                        <span>{getDonateur(don)}</span>
                      </div>
                    </td>
                    <td className="dons__table-montant">
                      {don.montant
                        ? `${Number(don.montant).toLocaleString()} FCFA`
                        : "Don matériel"}
                    </td>
                    <td>
                      <span className="dons__type">
                        {don.type === "financier" ? (
                          <>
                            <CreditCard size={14} /> Financier
                          </>
                        ) : (
                          <>
                            <Package size={14} /> Matériel
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      {new Date(don.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <span className={getStatutClass(don.statut)}>
                        {getStatutLabel(don.statut)}
                      </span>
                    </td>
                    <td>
                      <div className="page__actions">
                        <button
                          className="page__action-btn page__action-btn--view"
                          onClick={() => setSelectedDon(don)}
                        >
                          <Eye size={16} />
                        </button>
                        {don.statut === "en_attente" && (
                          <>
                            <button
                              className="page__action-btn page__action-btn--validate"
                              onClick={() => handleValider(don.id)}
                              title="Valider"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              className="page__action-btn page__action-btn--delete"
                              onClick={() => handleRejeter(don.id)}
                              title="Rejeter"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
            <span>
              Affichage 1-{Math.min(donsFiltres.length, 10)} sur{" "}
              {donsFiltres.length} dons
            </span>
            <div className="talibes__pages">
              <button className="talibes__page-btn">‹</button>
              <button className="talibes__page-btn talibes__page-btn--active">
                1
              </button>
              <button className="talibes__page-btn">2</button>
              <button className="talibes__page-btn">3</button>
              <button className="talibes__page-btn">›</button>
            </div>
          </div>
        </div>

        {/* Info redistribution */}
        <div className="dons__info">
          <Info size={20} className="dons__info-icon" />
          <div>
            <p className="dons__info-title">Information de redistribution</p>
            <p className="dons__info-text">
              Tout don financier marqué comme "Validé" devient éligible pour la
              redistribution vers les Daaras.
            </p>
          </div>
        </div>
      </div>

      {/* Modal détail don */}
      {selectedDon && (
        <div className="modal-overlay" onClick={() => setSelectedDon(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                Détail du don #TV-{String(selectedDon.id).padStart(4, "0")}
              </h3>
              <button
                className="modal__close"
                onClick={() => setSelectedDon(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__detail-grid">
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Donateur</span>
                  <span className="modal__detail-value">
                    {getDonateur(selectedDon)}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Type</span>
                  <span className="modal__detail-value">
                    {selectedDon.type === "financier"
                      ? "Financier"
                      : "Matériel"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Montant</span>
                  <span className="modal__detail-value">
                    {selectedDon.montant
                      ? `${Number(selectedDon.montant).toLocaleString()} FCFA`
                      : "Don matériel"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Mode de paiement</span>
                  <span className="modal__detail-value">
                    {selectedDon.mode_paiement || "—"}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Date</span>
                  <span className="modal__detail-value">
                    {new Date(selectedDon.created_at).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
                <div className="modal__detail-item">
                  <span className="modal__detail-label">Statut</span>
                  <span className={getStatutClass(selectedDon.statut)}>
                    {getStatutLabel(selectedDon.statut)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn-cancel"
                onClick={() => setSelectedDon(null)}
              >
                Fermer
              </button>
              {selectedDon.statut === "en_attente" && (
                <button
                  className="modal__btn-submit"
                  onClick={() => {
                    handleValider(selectedDon.id);
                    setSelectedDon(null);
                  }}
                >
                  Valider ce don
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DonsPage;
