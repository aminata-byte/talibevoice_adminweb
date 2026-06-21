import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Users,
  Calendar,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./DaaraDetailPage.css";

function DaaraDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [daara, setDaara] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("talibes");
  const [recherche, setRecherche] = useState("");

  const fetchDaara = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getDaara(id);
      setDaara(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDaara();
  }, [fetchDaara]);

  const handleValider = async () => {
    try {
      await adminService.validerDaara(id);
      fetchDaara();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout titre="Détail Daara">
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--text-secondary)",
          }}
        >
          Chargement...
        </div>
      </AdminLayout>
    );
  }

  if (!daara) {
    return (
      <AdminLayout titre="Détail Daara">
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--tertiary)",
          }}
        >
          Daara introuvable.
        </div>
      </AdminLayout>
    );
  }

  const talibes = daara.talibes || [];
  const besoins = daara.besoins || [];
  const rapports = daara.rapports || [];

  const talibesFiltres = talibes.filter((t) =>
    `${t.nom} ${t.prenom}`.toLowerCase().includes(recherche.toLowerCase()),
  );

  return (
    <AdminLayout titre={`Daaras / ${daara.nom}`}>
      <div className="daara-detail">
        <div className="daara-detail__actions">
          <nav className="daara-detail__breadcrumb">
            <span
              onClick={() => navigate("/daaras")}
              style={{ cursor: "pointer", color: "var(--primary)" }}
            >
              Accueil
            </span>
            <span> › </span>
            <span
              onClick={() => navigate("/daaras")}
              style={{ cursor: "pointer", color: "var(--primary)" }}
            >
              Gestion des Daaras
            </span>
            <span> › </span>
            <span>{daara.nom}</span>
          </nav>
          <div className="daara-detail__btns">
            {daara.statut === "en_attente" && (
              <button
                className="daara-detail__btn daara-detail__btn--valider"
                onClick={handleValider}
              >
                Valider
              </button>
            )}
            <button className="daara-detail__btn daara-detail__btn--activer">
              <CheckCircle size={16} /> Activer
            </button>
            <button className="daara-detail__btn daara-detail__btn--desactiver">
              <XCircle size={16} /> Désactiver
            </button>
          </div>
        </div>

        <div className="daara-detail__layout">
          <div className="daara-detail__left">
            <div className="daara-detail__card">
              <div className="daara-detail__card-header">
                <div className="daara-detail__card-icon">
                  <Users size={28} />
                </div>
                <div>
                  <h2 className="daara-detail__nom">{daara.nom}</h2>
                  <span
                    className={`badge ${daara.statut === "actif" ? "badge--green" : "badge--yellow"}`}
                  >
                    {daara.statut?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="daara-detail__infos">
                <div className="daara-detail__info">
                  <MapPin size={16} />
                  <div>
                    <span className="daara-detail__info-label">ADRESSE</span>
                    <span className="daara-detail__info-value">
                      {daara.adresse}
                    </span>
                  </div>
                </div>
                <div className="daara-detail__info">
                  <Users size={16} />
                  <div>
                    <span className="daara-detail__info-label">
                      CAPACITÉ / TALIBÉS
                    </span>
                    <span className="daara-detail__info-value">
                      {daara.capacite_accueil} places — {daara.nombre_talibes}{" "}
                      talibés
                    </span>
                  </div>
                </div>
                <div className="daara-detail__info">
                  <Users size={16} />
                  <div>
                    <span className="daara-detail__info-label">
                      RESPONSABLE
                    </span>
                    <span className="daara-detail__info-value">
                      {daara.nom_responsable}
                    </span>
                  </div>
                </div>
                <div className="daara-detail__info">
                  <Phone size={16} />
                  <div>
                    <span className="daara-detail__info-label">TÉLÉPHONE</span>
                    <span className="daara-detail__info-value">
                      {daara.telephone_responsable || "—"}
                    </span>
                  </div>
                </div>
                <div className="daara-detail__info">
                  <Calendar size={16} />
                  <div>
                    <span className="daara-detail__info-label">
                      DATE D'ENREGISTREMENT
                    </span>
                    <span className="daara-detail__info-value">
                      {new Date(daara.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="daara-detail__map-card">
              <h3 className="daara-detail__map-title">
                <MapPin size={16} /> Localisation
              </h3>
              <div className="daara-detail__map">
                <div className="daara-detail__map-placeholder">
                  <MapPin size={48} color="var(--accent)" />
                  <p>
                    {daara.latitude && daara.longitude
                      ? `${daara.latitude}° N, ${daara.longitude}° O — ${daara.region}`
                      : "Coordonnées non disponibles"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="daara-detail__right">
            <div className="daara-detail__tabs">
              {[
                { key: "talibes", label: `Talibés (${talibes.length})` },
                { key: "besoins", label: `Besoins (${besoins.length})` },
                { key: "rapports", label: `Rapports (${rapports.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`daara-detail__tab ${activeTab === tab.key ? "daara-detail__tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "talibes" && (
              <div className="daara-detail__tab-content">
                <input
                  type="text"
                  placeholder="Rechercher un talibé..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="modal__input"
                  style={{ marginBottom: "1rem" }}
                />
                <div className="daara-detail__talibes-list">
                  {talibesFiltres.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      Aucun talibé trouvé.
                    </p>
                  ) : (
                    talibesFiltres.slice(0, 4).map((talibe) => (
                      <div
                        key={talibe.id}
                        className="daara-detail__talibe-card"
                      >
                        <div className="daara-detail__talibe-avatar">
                          {talibe.prenom?.[0]}
                          {talibe.nom?.[0]}
                        </div>
                        <div className="daara-detail__talibe-info">
                          <p className="daara-detail__talibe-name">
                            {talibe.prenom} {talibe.nom}
                          </p>
                          <p className="daara-detail__talibe-meta">
                            {talibe.date_naissance
                              ? `${new Date().getFullYear() - new Date(talibe.date_naissance).getFullYear()} ans`
                              : "—"}{" "}
                            — État civil: {talibe.a_etat_civil ? "Oui" : "Non"}
                          </p>
                        </div>
                        <span
                          className={
                            talibe.est_majeur
                              ? "badge badge--yellow"
                              : "badge badge--green"
                          }
                        >
                          {talibe.est_majeur ? "MAJEUR" : "ACTIF"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {talibes.length > 4 && (
                  <button className="daara-detail__voir-tout">
                    Voir les {talibes.length} talibés →
                  </button>
                )}
              </div>
            )}

            {activeTab === "besoins" && (
              <div className="daara-detail__tab-content">
                {besoins.length === 0 ? (
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    Aucun besoin signalé.
                  </p>
                ) : (
                  besoins.map((besoin) => (
                    <div key={besoin.id} className="daara-detail__besoin-card">
                      <div className="daara-detail__besoin-header">
                        <span className="daara-detail__besoin-type">
                          {besoin.type}
                        </span>
                        <span
                          className={
                            besoin.priorite === "urgent"
                              ? "badge badge--red"
                              : besoin.priorite === "normal"
                                ? "badge badge--yellow"
                                : "badge badge--green"
                          }
                        >
                          {besoin.priorite}
                        </span>
                      </div>
                      <p className="daara-detail__besoin-desc">
                        {besoin.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "rapports" && (
              <div className="daara-detail__tab-content">
                {rapports.length === 0 ? (
                  <p
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    Aucun rapport disponible.
                  </p>
                ) : (
                  rapports.map((rapport) => (
                    <div
                      key={rapport.id}
                      className="daara-detail__rapport-card"
                    >
                      <div className="daara-detail__rapport-header">
                        <strong>{rapport.titre}</strong>
                        <span
                          className={
                            rapport.statut === "valide"
                              ? "badge badge--green"
                              : "badge badge--yellow"
                          }
                        >
                          {rapport.statut === "valide"
                            ? "Validé"
                            : "En attente"}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {rapport.agent?.name} —{" "}
                        {new Date(rapport.date_creation).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DaaraDetailPage;
