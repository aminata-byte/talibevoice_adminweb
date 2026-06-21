import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Bell,
  ArrowDown,
  Utensils,
  Pill,
  BookOpen,
  Building,
  Shirt,
  Package,
  Trash2,
  X,
  CheckCircle,
  Search,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./BesoinsPage.css";

function BesoinsPage() {
  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("en_cours");
  const [rechercheResolu, setRechercheResolu] = useState("");
  const [modalSuppr, setModalSuppr] = useState(false);
  const [besoinASupprimer, setBesoinASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBesoins();
  }, []);

  const fetchBesoins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBesoins();
      setBesoins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const besoinsEnCours = useMemo(
    () => besoins.filter((b) => b.statut !== "resolu"),
    [besoins],
  );

  const besoinsResolus = useMemo(
    () =>
      besoins.filter((b) => {
        const matchStatut = b.statut === "resolu";
        const matchRecherche =
          rechercheResolu === "" ||
          b.daara?.nom?.toLowerCase().includes(rechercheResolu.toLowerCase());
        return matchStatut && matchRecherche;
      }),
    [besoins, rechercheResolu],
  );

  const urgent = useMemo(
    () => besoinsEnCours.filter((b) => b.priorite === "urgent"),
    [besoinsEnCours],
  );
  const normal = useMemo(
    () => besoinsEnCours.filter((b) => b.priorite === "normal"),
    [besoinsEnCours],
  );
  const faible = useMemo(
    () => besoinsEnCours.filter((b) => b.priorite === "faible"),
    [besoinsEnCours],
  );

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === "alimentaire") return <Utensils size={14} />;
    if (t === "médical" || t === "medical") return <Pill size={14} />;
    if (t === "éducatif" || t === "educatif") return <BookOpen size={14} />;
    if (t === "infrastructure") return <Building size={14} />;
    if (t === "vêtements" || t === "vetements") return <Shirt size={14} />;
    return <Package size={14} />;
  };

  const resoudreBesoin = async (besoin, e) => {
    e.stopPropagation();
    try {
      await adminService.resoudreBesoin(besoin.id);
      setBesoins((prev) =>
        prev.map((b) => (b.id === besoin.id ? { ...b, statut: "resolu" } : b)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirSuppr = (besoin, e) => {
    e.stopPropagation();
    setBesoinASupprimer(besoin);
    setModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deleteBesoin(besoinASupprimer.id);
      setBesoins((prev) => prev.filter((b) => b.id !== besoinASupprimer.id));
      setModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const BesoinCard = ({ besoin }) => (
    <div className="besoin__card">
      <div className="besoin__card-header">
        <span className="besoin__card-daara">{besoin.daara?.nom || "—"}</span>
        <span className="besoin__card-date">
          {besoin.created_at
            ? new Date(besoin.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
              })
            : "—"}
        </span>
      </div>

      <div className="besoin__card-type">
        {getTypeIcon(besoin.type)}
        <span>{besoin.type || "—"}</span>
      </div>

      <p className="besoin__card-desc">{besoin.description || "—"}</p>

      <div className="besoin__card-footer">
        <span className="besoin__card-region">
          {besoin.daara?.region || "—"}
        </span>
        <div className="besoin__card-actions">
          <button
            className="besoin__card-resoudre"
            title="Marquer comme résolu"
            onClick={(e) => resoudreBesoin(besoin, e)}
          >
            <CheckCircle size={14} />
          </button>
          <button
            className="besoin__card-delete"
            title="Supprimer"
            onClick={(e) => ouvrirSuppr(besoin, e)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      key: "urgent",
      label: "URGENT",
      icon: <AlertTriangle size={14} />,
      data: urgent,
      className: "besoin__column--urgent",
    },
    {
      key: "normal",
      label: "NORMAL",
      icon: <Bell size={14} />,
      data: normal,
      className: "besoin__column--normal",
    },
    {
      key: "faible",
      label: "FAIBLE",
      icon: <ArrowDown size={14} />,
      data: faible,
      className: "besoin__column--faible",
    },
  ];

  return (
    <AdminLayout titre="Besoins">
      <div className="besoins">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Besoins
              <span className="talibes__count">({besoins.length})</span>
            </h2>
          </div>
        </div>

        {/* Onglets */}
        <div className="page__tabs">
          <button
            className={`page__tab ${onglet === "en_cours" ? "active" : ""}`}
            onClick={() => setOnglet("en_cours")}
          >
            En cours ({besoinsEnCours.length})
          </button>
          <button
            className={`page__tab ${onglet === "resolus" ? "active" : ""}`}
            onClick={() => setOnglet("resolus")}
          >
            Résolus ({besoins.filter((b) => b.statut === "resolu").length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
        ) : onglet === "en_cours" ? (
          <div className="besoins__kanban">
            {columns.map((col) => (
              <div key={col.key} className="besoins__column">
                <div className={`besoins__column-header ${col.className}`}>
                  {col.icon}
                  <span>{col.label}</span>
                  <span className="besoins__column-count">
                    {col.data.length}
                  </span>
                </div>
                <div className="besoins__column-body">
                  {col.data.length === 0 ? (
                    <p className="besoins__empty">Aucun besoin.</p>
                  ) : (
                    col.data.map((b) => <BesoinCard key={b.id} besoin={b} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className="page__search"
              style={{ marginBottom: "1rem", maxWidth: "300px" }}
            >
              <Search size={16} />
              <input
                type="text"
                placeholder="Filtrer par daara..."
                value={rechercheResolu}
                onChange={(e) => setRechercheResolu(e.target.value)}
                className="page__search-input"
              />
            </div>

            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Daara</th>
                    <th>Région</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Priorité</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {besoinsResolus.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="page__table-empty">
                        Aucun besoin résolu.
                      </td>
                    </tr>
                  ) : (
                    besoinsResolus.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.daara?.nom || "—"}</strong>
                        </td>
                        <td>{b.daara?.region || "—"}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {getTypeIcon(b.type)}
                            {b.type || "—"}
                          </div>
                        </td>
                        <td>{b.description || "—"}</td>
                        <td>
                          <span
                            className={
                              b.priorite === "urgent"
                                ? "badge badge--red"
                                : b.priorite === "normal"
                                  ? "badge badge--yellow"
                                  : "badge badge--green"
                            }
                          >
                            {b.priorite}
                          </span>
                        </td>
                        <td>
                          {b.created_at
                            ? new Date(b.created_at).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td>
                          <button
                            className="page__action-btn page__action-btn--delete"
                            title="Supprimer"
                            onClick={(e) => ouvrirSuppr(b, e)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
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
                Êtes-vous sûr de vouloir supprimer ce besoin{" "}
                <strong>{besoinASupprimer?.type}</strong> du daara{" "}
                <strong>{besoinASupprimer?.daara?.nom}</strong> ? Cette action
                est irréversible.
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

export default BesoinsPage;
