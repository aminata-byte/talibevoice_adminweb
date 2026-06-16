import { useState, useEffect } from "react";

import { Search, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./FormationsPage.css";

function FormationsPage() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [domaineFiltre, setDomaineFiltre] = useState("tous");
  const [filtre, setFiltre] = useState("tous");

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);

    try {
      const data = await adminService.getFormations();
      setFormations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerFormation(id);
      fetchFormations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActiver = async (id) => {
    try {
      await adminService.activerFormation(id);
      fetchFormations();
    } catch (err) {
      console.error(err);
    }
  };

  const formationsFiltrees = formations.filter((f) => {
    const matchRecherche = f.titre
      .toLowerCase()
      .includes(recherche.toLowerCase());
    const matchDomaine =
      domaineFiltre === "tous" || f.domaine === domaineFiltre;
    const matchFiltre = filtre === "tous" || f.statut === filtre;
    return matchRecherche && matchDomaine && matchFiltre;
  });

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
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Formations</h2>
            <p className="page__subtitle">
              Pilotez les programmes d'apprentissage et le suivi des talibés.
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="formations__filters">
          <span className="formations__filter-label">Filtrer par :</span>

          <select
            className="talibes__select"
            value={domaineFiltre}
            onChange={(e) => setDomaineFiltre(e.target.value)}
          >
            <option value="tous">Tous les domaines</option>
            <option value="Informatique">Informatique</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Artisanat">Artisanat</option>
            <option value="Commerce">Commerce</option>
          </select>

          <div className="page__tabs">
            {["tous", "en_attente", "valide", "actif", "inactif"].map((f) => (
              <button
                key={f}
                className={`page__tab ${filtre === f ? "active" : ""}`}
                onClick={() => setFiltre(f)}
              >
                {f === "tous" ? "Tous les statuts" : getStatutLabel(f)}
              </button>
            ))}
          </div>

          <select className="talibes__select">
            <option>Tous les partenaires</option>
          </select>

          <button
            className="formations__reset"
            onClick={() => {
              setRecherche("");
              setDomaineFiltre("tous");
              setFiltre("tous");
            }}
          >
            Réinitialiser
          </button>
        </div>

        <div className="formations__layout">
          {/* Cards */}
          <div className="formations__grid">
            {loading ? (
              <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
            ) : formationsFiltrees.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>
                Aucune formation trouvée.
              </p>
            ) : (
              formationsFiltrees.map((formation) => (
                <div key={formation.id} className="formation__card">
                  {/* Image placeholder */}
                  <div
                    className="formation__card-img"
                    style={{
                      backgroundColor: getDomaineBg(formation.domaine),
                    }}
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
                          )}{" "}
                          —{" "}
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

                    <div className="formation__card-footer">
                      <div className="formation__card-places">
                        <span>Inscriptions</span>
                        <div className="formation__progress">
                          <div
                            className="formation__progress-fill"
                            style={{
                              width: `${Math.min(
                                ((formation.nb_inscrits || 0) /
                                  (formation.capacite || 1)) *
                                  100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span>
                          {formation.nb_inscrits || 0}/{formation.capacite || 0}
                        </span>
                      </div>

                      <div className="formation__card-actions">
                        {formation.statut === "en_attente" && (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            onClick={() => handleValider(formation.id)}
                            title="Valider"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {formation.statut === "valide" && (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            onClick={() => handleActiver(formation.id)}
                            title="Activer"
                          >
                            Activer
                          </button>
                        )}
                        {formation.statut !== "en_attente" && (
                          <button
                            className="page__action-btn page__action-btn--delete"
                            title="Désactiver"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Card promo */}
          <div className="formations__promo">
            <h3 className="formations__promo-title">
              Promotion Exceptionnelle
            </h3>
            <p className="formations__promo-text">
              Formez plus de talibés aux métiers du futur avec nos nouveaux
              partenaires certifiés.
            </p>
            <button className="formations__promo-btn">
              Voir les certifications
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="talibes__pagination">
          <span>
            Affichage de {formationsFiltrees.length} formations sur{" "}
            {formations.length}
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
    </AdminLayout>
  );
}

export default FormationsPage;
