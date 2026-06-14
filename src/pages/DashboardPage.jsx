import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Heart,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import adminService from "../services/adminService";
import "./DashboardPage.css";

function DashboardPage() {
  const [stats, setStats] = useState({
    total_talibes: 0,
    total_daaras: 0,
    total_dons: 0,
  });
  const [dons, setDons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, donsData] = await Promise.all([
        adminService.getStats(),
        adminService.getDons({ limit: 5 }),
      ]);
      setStats(statsData);
      setDons(Array.isArray(donsData) ? donsData.slice(0, 5) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: <Users size={20} />,
      label: "Talibés recensés",
      value: stats.total_talibes?.toLocaleString() || "0",
      sub: "+124 ce mois",
      color: "green",
    },
    {
      icon: <Building2 size={20} />,
      label: "Daaras actifs",
      value: stats.total_daaras?.toLocaleString() || "0",
      sub: "+8 ce mois",
      color: "blue",
    },
    {
      icon: <Heart size={20} />,
      label: "Dons validés",
      value: `${(stats.total_dons / 1000000).toFixed(1)}M FCFA`,
      sub: "FCFA ce mois",
      color: "green",
    },
    {
      icon: <AlertTriangle size={20} />,
      label: "Sessions urgentes",
      value: "17",
      sub: "À traiter",
      color: "red",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Formations actives",
      value: "23",
      sub: "En cours",
      color: "blue",
    },
    {
      icon: <Briefcase size={20} />,
      label: "Offres d'emploi",
      value: "12",
      sub: "Disponibles",
      color: "green",
    },
    {
      icon: <UserCheck size={20} />,
      label: "Agents actifs",
      value: "48",
      sub: "Actifs",
      color: "blue",
    },
  ];

  const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"];
  const moisData = [850000, 1200000, 980000, 1500000, 2100000, 4200000];
  const maxVal = Math.max(...moisData);

  const getStatutClass = (statut) => {
    if (statut === "valide") return "dash__badge dash__badge--green";
    if (statut === "en_attente") return "dash__badge dash__badge--yellow";
    return "dash__badge dash__badge--gray";
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_attente") return "En attente";
    return "Rejeté";
  };

  return (
    <AdminLayout titre="Tableau de bord">
      <div className="dashboard">
        {/* Stats cards */}
        <div className="dashboard__stats">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`dashboard__stat-card dashboard__stat-card--${card.color}`}
            >
              <div className="dashboard__stat-header">
                <div
                  className={`dashboard__stat-icon dashboard__stat-icon--${card.color}`}
                >
                  {card.icon}
                </div>
                <ArrowUpRight size={16} className="dashboard__stat-trend" />
              </div>
              <div className="dashboard__stat-value">
                {loading ? "..." : card.value}
              </div>
              <div className="dashboard__stat-label">{card.label}</div>
              <div className="dashboard__stat-sub">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="dashboard__grid">
          {/* Graphique dons */}
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Dons par mois (FCFA)</h3>
              <select className="dashboard__select">
                <option>Année 2024</option>
                <option>Année 2025</option>
              </select>
            </div>
            <div className="dashboard__chart">
              {moisData.map((val, index) => (
                <div key={index} className="dashboard__chart-col">
                  <div className="dashboard__chart-bar-wrapper">
                    <div
                      className="dashboard__chart-bar"
                      style={{ height: `${(val / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="dashboard__chart-label">
                    {moisLabels[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Objectif mensuel */}
          <div className="dashboard__card dashboard__card--objectif">
            <div className="dashboard__objectif-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="dashboard__objectif-title">Objectif Mensuel</h3>
            <p className="dashboard__objectif-text">
              Vous êtes à 85% de votre objectif de collecte pour ce mois.
              Continuez vos efforts!
            </p>
            <div className="dashboard__progress">
              <div className="dashboard__progress-bar">
                <div
                  className="dashboard__progress-fill"
                  style={{ width: "85%" }}
                />
              </div>
              <div className="dashboard__progress-labels">
                <span>Collecté 4.2M</span>
                <span>Cible 5.0M</span>
              </div>
            </div>
            <button className="dashboard__objectif-btn">
              Générer Rapport Mensuel
            </button>
          </div>
        </div>

        {/* Derniers dons */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Derniers dons</h3>
            <a href="/dons" className="dashboard__voir-tout">
              Voir tout →
            </a>
          </div>
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Donateur</th>
                <th>Montant</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Chargement...
                  </td>
                </tr>
              ) : dons.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Aucun don trouvé.
                  </td>
                </tr>
              ) : (
                dons.map((don, index) => (
                  <tr key={index}>
                    <td>
                      <div className="dashboard__table-user">
                        <div className="dashboard__table-avatar">
                          {don.donateur?.est_anonyme
                            ? "A"
                            : don.donateur?.nom?.[0] || "?"}
                        </div>
                        <span>
                          {don.donateur?.est_anonyme
                            ? "Anonyme"
                            : `${don.donateur?.prenom || ""} ${don.donateur?.nom || ""}`.trim() ||
                              "Inconnu"}
                        </span>
                      </div>
                    </td>
                    <td className="dashboard__table-montant">
                      {don.montant
                        ? `${Number(don.montant).toLocaleString()} FCFA`
                        : "Don matériel"}
                    </td>
                    <td>
                      {don.type === "financier" ? "Financier" : "Matériel"}
                    </td>
                    <td>
                      <span className={getStatutClass(don.statut)}>
                        {getStatutLabel(don.statut)}
                      </span>
                    </td>
                    <td>
                      {new Date(don.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
