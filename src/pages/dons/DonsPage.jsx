import { useState, useEffect, useMemo } from "react";
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

const ITEMS_PAR_PAGE = 10;

const formatMontant = (montant) => {
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M FCFA`;
  if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K FCFA`;
  return `${montant.toLocaleString()} FCFA`;
};

function DonsPage() {
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [page, setPage] = useState(1);
  const [selectedDon, setSelectedDon] = useState(null);
  const [modalRejeter, setModalRejeter] = useState(false);
  const [donARejeter, setDonARejeter] = useState(null);
  const [rejeting, setRejeting] = useState(false);

  useEffect(() => {
    fetchDons();
  }, []);

  const fetchDons = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDons();
      setDons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerDon(id);
      setDons((prev) =>
        prev.map((d) => (d.id === id ? { ...d, statut: "valide" } : d)),
      );
      if (selectedDon?.id === id)
        setSelectedDon((d) => ({ ...d, statut: "valide" }));
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirRejeter = (don, e) => {
    e.stopPropagation();
    setDonARejeter(don);
    setModalRejeter(true);
  };

  const confirmerRejeter = async () => {
    setRejeting(true);
    try {
      await adminService.rejeterDon(donARejeter.id);
      setDons((prev) =>
        prev.map((d) =>
          d.id === donARejeter.id ? { ...d, statut: "rejete" } : d,
        ),
      );
      if (selectedDon?.id === donARejeter.id)
        setSelectedDon((d) => ({ ...d, statut: "rejete" }));
      setModalRejeter(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRejeting(false);
    }
  };

  const donsFinanciers = useMemo(
    () => dons.filter((d) => d.type === "financier"),
    [dons],
  );

  const stats = useMemo(() => {
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
    const totalRejete = donsFinanciers
      .filter((d) => d.statut === "rejete")
      .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
    const nbRejetes = dons.filter((d) => d.statut === "rejete").length;
    return {
      total: totalRecu,
      nbEnAttente: dons.filter((d) => d.statut === "en_attente").length,
      enAttente: totalEnAttente,
      valides: totalValide,
      pctValides:
        totalRecu > 0 ? Math.round((totalValide / totalRecu) * 100) : 0,
      redistribues: totalRedistribue,
      pctRedistribues:
        totalValide > 0
          ? Math.round((totalRedistribue / totalValide) * 100)
          : 0,
      rejetes: totalRejete,
      nbRejetes,
    };
  }, [dons, donsFinanciers]);

  const donsFiltres = useMemo(() => {
    return dons.filter((d) => {
      const terme = recherche.toLowerCase();
      const matchRecherche =
        terme === "" ||
        d.donateur?.nom?.toLowerCase().includes(terme) ||
        d.donateur?.prenom?.toLowerCase().includes(terme);
      const matchFiltre = filtre === "tous" || d.statut === filtre;
      return matchRecherche && matchFiltre;
    });
  }, [dons, recherche, filtre]);

  useEffect(() => {
    setPage(1);
  }, [recherche, filtre]);

  const totalPages = Math.max(
    1,
    Math.ceil(donsFiltres.length / ITEMS_PAR_PAGE),
  );
  const donsPage = donsFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const moisData = moisLabels.map((_, index) =>
    donsFinanciers
      .filter((d) => new Date(d.created_at).getMonth() === index)
      .reduce((acc, d) => acc + (Number(d.montant) || 0), 0),
  );
  const maxVal = Math.max(...moisData, 1);

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
    if (!don) return "Inconnu";
    if (don.donateur?.est_anonyme) return "Anonyme";
    return (
      `${don.donateur?.prenom || ""} ${don.donateur?.nom || ""}`.trim() ||
      "Inconnu"
    );
  };

  const getInitiales = (don) => {
    if (!don) return "?";
    if (don.donateur?.est_anonyme) return "A";
    return (
      `${don.donateur?.prenom?.[0] || ""}${don.donateur?.nom?.[0] || ""}`.toUpperCase() ||
      "?"
    );
  };

  const parseItemsMateriel = (items) => {
    if (!items) return [];
    try {
      const parsed = typeof items === "string" ? JSON.parse(items) : items;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getItemLabel = (item) => {
    if (typeof item === "string") return item;
    const nom =
      item.materiel || item.nom || item.type || item.label || "Article";
    const qte = item.quantite ? ` (x${item.quantite})` : "";
    return `${nom}${qte}`;
  };

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
          <button className="page__btn-export">
            <Download size={16} />
            Exporter Rapport
          </button>
        </div>

        {/* Stats */}
        <div className="dons__stats">
          <div className="dons__stat-card">
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--green">
                {donsFinanciers.length} dons financiers
              </span>
            </div>
            <p className="dons__stat-label">Total reçu</p>
            <p className="dons__stat-value">{formatMontant(stats.total)}</p>
          </div>

          <div
            className="dons__stat-card dons__stat-card--clickable"
            onClick={() => setFiltre("en_attente")}
          >
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--yellow">
                {stats.nbEnAttente} dossiers
              </span>
            </div>
            <p className="dons__stat-label">En attente</p>
            <p className="dons__stat-value">{formatMontant(stats.enAttente)}</p>
          </div>

          <div
            className="dons__stat-card dons__stat-card--clickable"
            onClick={() => setFiltre("valide")}
          >
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--green">
                {stats.pctValides}% validés
              </span>
            </div>
            <p className="dons__stat-label">Validés</p>
            <p className="dons__stat-value">{formatMontant(stats.valides)}</p>
          </div>

          <div
            className="dons__stat-card dons__stat-card--clickable"
            onClick={() => setFiltre("rejete")}
          >
            <div className="dons__stat-top">
              <span className="dons__stat-badge dons__stat-badge--red">
                {stats.nbRejetes} dons rejetés
              </span>
            </div>
            <p className="dons__stat-label">Rejetés</p>
            <p className="dons__stat-value">{formatMontant(stats.rejetes)}</p>
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
                placeholder="Rechercher un donateur..."
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
              ) : donsPage.length === 0 ? (
                <tr>
                  <td colSpan="7" className="page__table-empty">
                    Aucun don trouvé.
                  </td>
                </tr>
              ) : (
                donsPage.map((don) => (
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
                          title="Voir détail"
                          onClick={() => setSelectedDon(don)}
                        >
                          <Eye size={16} />
                        </button>
                        {don.statut === "en_attente" && (
                          <>
                            <button
                              className="page__action-btn page__action-btn--validate"
                              title="Valider"
                              onClick={() => handleValider(don.id)}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              className="page__action-btn page__action-btn--delete"
                              title="Rejeter"
                              onClick={(e) => ouvrirRejeter(don, e)}
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

          {/* Pagination */}
          <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
            <span>
              {donsFiltres.length === 0
                ? "Aucun résultat"
                : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(
                    page * ITEMS_PAR_PAGE,
                    donsFiltres.length,
                  )} sur ${donsFiltres.length} dons`}
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
        <div className="modal__overlay" onClick={() => setSelectedDon(null)}>
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
              <div className="modal__grid">
                <div className="modal__field">
                  <span className="modal__label">Donateur</span>
                  <span>{getDonateur(selectedDon)}</span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Type</span>
                  <span>
                    {selectedDon.type === "financier"
                      ? "Financier"
                      : "Matériel"}
                  </span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Montant</span>
                  <span>
                    {selectedDon.montant
                      ? `${Number(selectedDon.montant).toLocaleString()} FCFA`
                      : "Don matériel"}
                  </span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Mode de paiement</span>
                  <span>{selectedDon.mode_paiement || "—"}</span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Date</span>
                  <span>
                    {new Date(selectedDon.created_at).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Statut</span>
                  <span className={getStatutClass(selectedDon.statut)}>
                    {getStatutLabel(selectedDon.statut)}
                  </span>
                </div>

                {/* Articles matériel */}
                {selectedDon.type === "materiel" && (
                  <div className="modal__field modal__field--full">
                    <span className="modal__label">Articles donnés</span>
                    {parseItemsMateriel(selectedDon.items_materiel).length ===
                    0 ? (
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Aucun article renseigné
                      </span>
                    ) : (
                      <div className="dons__items-materiel">
                        {parseItemsMateriel(selectedDon.items_materiel).map(
                          (item, idx) => (
                            <div key={idx} className="dons__item-materiel">
                              <Package size={13} />
                              <span>{getItemLabel(item)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setSelectedDon(null)}
              >
                Fermer
              </button>
              {selectedDon.statut === "en_attente" && (
                <button
                  className="modal__btn modal__btn--save"
                  onClick={() => {
                    handleValider(selectedDon.id);
                    setSelectedDon(null);
                  }}
                >
                  <CheckCircle size={15} /> Valider ce don
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal rejeter */}
      {modalRejeter && (
        <div className="modal__overlay" onClick={() => setModalRejeter(false)}>
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Confirmer le rejet</h3>
              <button
                className="modal__close"
                onClick={() => setModalRejeter(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__confirm-text">
                Êtes-vous sûr de vouloir rejeter le don{" "}
                <strong>#TV-{String(donARejeter?.id).padStart(4, "0")}</strong>{" "}
                de <strong>{getDonateur(donARejeter)}</strong> ?
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setModalRejeter(false)}
              >
                Annuler
              </button>
              <button
                className="modal__btn modal__btn--danger"
                onClick={confirmerRejeter}
                disabled={rejeting}
              >
                <XCircle size={15} />
                {rejeting ? "Rejet..." : "Rejeter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DonsPage;
