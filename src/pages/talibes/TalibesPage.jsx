import { useState, useEffect } from "react";
import { Search, Eye, Edit, Download } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./TalibesPage.css";

function TalibesPage() {
  const [talibes, setTalibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreMajeur, setFiltreMajeur] = useState(false);
  const [selectedTalibe, setSelectedTalibe] = useState(null);

  useEffect(() => {
    fetchTalibes();
  }, []);

  const fetchTalibes = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTalibes();
      setTalibes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const talibesFiltres = talibes.filter((t) => {
    const matchRecherche = `${t.nom} ${t.prenom}`
      .toLowerCase()
      .includes(recherche.toLowerCase());
    const matchMajeur = !filtreMajeur || t.est_majeur;
    return matchRecherche && matchMajeur;
  });

  const getInsertionClass = (statut) => {
    if (statut === "insere") return "badge badge--green";
    if (statut === "en_cours") return "badge badge--yellow";
    if (statut === "en_attente") return "badge badge--yellow";
    return "badge badge--gray";
  };

  const getInsertionLabel = (statut) => {
    if (statut === "insere") return "VALIDÉE";
    if (statut === "en_cours") return "EN COURS";
    if (statut === "en_attente") return "EN ATTENTE";
    return "AUCUNE";
  };

  const getAge = (dateNaissance) => {
    if (!dateNaissance) return "—";
    const age =
      new Date().getFullYear() - new Date(dateNaissance).getFullYear();
    return `${age} ans`;
  };

  return (
    <AdminLayout titre="Talibés">
      <div className="talibes">
        {/* Header */}
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Talibés
              <span className="talibes__count">
                ({talibes.length.toLocaleString()})
              </span>
            </h2>
          </div>
          <button className="page__btn-export">
            <Download size={16} />
            Exporter PDF
          </button>
        </div>

        <div className="talibes__layout">
          {/* Gauche — Table */}
          <div className="talibes__left">
            {/* Filtres */}
            <div className="talibes__filters">
              <div className="page__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="page__search-input"
                />
              </div>
              <select className="talibes__select">
                <option>Toutes les zones</option>
                <option>Dakar</option>
                <option>Thiès</option>
                <option>Louga</option>
                <option>Saint-Louis</option>
              </select>
              <select className="talibes__select">
                <option>Tous les id</option>
              </select>
              <select className="talibes__select">
                <option>Tous statuts</option>
                <option>En cours</option>
                <option>Validée</option>
                <option>Aucune</option>
              </select>
              <div className="talibes__toggle">
                <span>Majeurs</span>
                <label className="talibes__switch">
                  <input
                    type="checkbox"
                    checked={filtreMajeur}
                    onChange={(e) => setFiltreMajeur(e.target.checked)}
                  />
                  <span className="talibes__slider"></span>
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="page__table-container">
              <table className="page__table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Âge</th>
                    <th>Daara</th>
                    <th>Zone</th>
                    <th>État civil</th>
                    <th>Statut insertion</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="page__table-empty">
                        Chargement...
                      </td>
                    </tr>
                  ) : talibesFiltres.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="page__table-empty">
                        Aucun talibé trouvé.
                      </td>
                    </tr>
                  ) : (
                    talibesFiltres.map((talibe) => (
                      <tr
                        key={talibe.id}
                        className={
                          selectedTalibe?.id === talibe.id
                            ? "talibes__row--active"
                            : ""
                        }
                        onClick={() => setSelectedTalibe(talibe)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong>{talibe.nom}</strong>
                        </td>
                        <td>{talibe.prenom}</td>
                        <td>{getAge(talibe.date_naissance)}</td>
                        <td>{talibe.daara?.nom || "—"}</td>
                        <td>{talibe.daara?.region || "—"}</td>
                        <td>
                          <span
                            className={
                              talibe.a_etat_civil
                                ? "badge badge--green"
                                : "badge badge--red"
                            }
                          >
                            {talibe.a_etat_civil ? "OUI" : "NON"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getInsertionClass(
                              talibe.statut_insertion,
                            )}
                          >
                            {getInsertionLabel(talibe.statut_insertion)}
                          </span>
                        </td>
                        <td>
                          <div className="page__actions">
                            <button
                              className="page__action-btn page__action-btn--view"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTalibe(talibe);
                              }}
                            >
                              <Eye size={16} />
                            </button>
                            <button className="page__action-btn page__action-btn--validate">
                              <Edit size={16} />
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
                Affichage 1-{Math.min(talibesFiltres.length, 10)} sur{" "}
                {talibesFiltres.length} talibés
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

          {/* Droite — Profil */}
          {selectedTalibe ? (
            <div className="talibes__profil">
              <h3 className="talibes__profil-title">Profil talibé</h3>

              {/* Avatar */}
              <div className="talibes__profil-avatar">
                <div className="talibes__profil-initiales">
                  {selectedTalibe.prenom?.[0]}
                  {selectedTalibe.nom?.[0]}
                </div>
                <span
                  className={
                    selectedTalibe.est_majeur
                      ? "badge badge--green"
                      : "badge badge--yellow"
                  }
                >
                  {selectedTalibe.est_majeur ? "Majeur" : "Mineur"} —{" "}
                  {getAge(selectedTalibe.date_naissance)}
                </span>
              </div>

              <p className="talibes__profil-name">
                {selectedTalibe.prenom} {selectedTalibe.nom}
              </p>

              {/* Infos */}
              <div className="talibes__profil-infos">
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">DAARA</span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.daara?.nom || "—"} —{" "}
                    {selectedTalibe.daara?.region || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    LIEU DE NAISSANCE
                  </span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.lieu_naissance || "—"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">ÉTAT CIVIL</span>
                  <span
                    className={
                      selectedTalibe.a_etat_civil
                        ? "badge badge--green"
                        : "badge badge--red"
                    }
                  >
                    {selectedTalibe.a_etat_civil ? "OUI" : "NON"}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">
                    STATUT INSERTION
                  </span>
                  <span
                    className={getInsertionClass(
                      selectedTalibe.statut_insertion,
                    )}
                  >
                    {getInsertionLabel(selectedTalibe.statut_insertion)}
                  </span>
                </div>
                <div className="talibes__profil-info">
                  <span className="talibes__profil-label">NIVEAU D'ÉTUDE</span>
                  <span className="talibes__profil-value">
                    {selectedTalibe.niveau_etude || "—"}
                  </span>
                </div>
              </div>

              <button className="talibes__profil-btn">
                Voir profil complet
              </button>
            </div>
          ) : (
            <div className="talibes__profil talibes__profil--empty">
              <p>Cliquez sur un talibé pour voir son profil</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default TalibesPage;
