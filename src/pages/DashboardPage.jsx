import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Heart,
  AlertTriangle,
  GraduationCap,
  ClipboardList,
  UserCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import adminService from "../services/adminService";
import "./DashboardPage.css";

const OBJECTIF_MENSUEL_FCFA = 5000000;

const formatMontant = (montant) => {
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M FCFA`;
  if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K FCFA`;
  return `${montant.toLocaleString()} FCFA`;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_talibes: 0,
    total_daaras: 0,
  });
  const [dons, setDons] = useState([]);
  const [formations, setFormations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [insertions, setInsertions] = useState([]);
  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        donsData,
        formationsData,
        agentsData,
        insertionsData,
        besoinsData,
      ] = await Promise.all([
        adminService.getStats(),
        adminService.getDons(),
        adminService.getFormations(),
        adminService.getAgents(),
        adminService.getInsertions(),
        adminService.getBesoins(),
      ]);
      setStats(statsData);
      setDons(Array.isArray(donsData) ? donsData : []);
      setFormations(Array.isArray(formationsData) ? formationsData : []);
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setInsertions(Array.isArray(insertionsData) ? insertionsData : []);
      setBesoins(Array.isArray(besoinsData) ? besoinsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const donsFinanciers = dons.filter((d) => d.type === "financier");
  const donsValides = donsFinanciers.filter((d) => d.statut === "valide");
  const totalDonsValides = donsValides.reduce(
    (acc, d) => acc + (Number(d.montant) || 0),
    0,
  );

  const formationsActives = formations.filter((f) => f.statut === "actif");
  const agentsActifs = agents.filter(
    (a) => a.role === "agent" && a.statut === "actif",
  );
  const insertionsEnCours = insertions.filter(
    (i) => i.statut === "en_cours" || i.statut === "valide",
  );
  const besoinsUrgents = besoins.filter((b) => b.priorite === "urgent");

  const maintenant = new Date();
  const donsDuMois = donsValides.filter((d) => {
    const date = new Date(d.created_at);
    return (
      date.getMonth() === maintenant.getMonth() &&
      date.getFullYear() === maintenant.getFullYear()
    );
  });
  const collecteMois = donsDuMois.reduce(
    (acc, d) => acc + (Number(d.montant) || 0),
    0,
  );
  const pctObjectif = Math.min(
    Math.round((collecteMois / OBJECTIF_MENSUEL_FCFA) * 100),
    100,
  );

  const statCards = [
    {
      icon: <Users size={20} />,
      label: "Talibés recensés",
      value: stats.total_talibes?.toLocaleString() || "0",
      color: "green",
    },
    {
      icon: <Building2 size={20} />,
      label: "Daaras actifs",
      value: stats.total_daaras?.toLocaleString() || "0",
      color: "blue",
    },
    {
      icon: <Heart size={20} />,
      label: "Dons validés",
      value: formatMontant(totalDonsValides),
      color: "green",
    },
    {
      icon: <AlertTriangle size={20} />,
      label: "Besoins urgents",
      value: besoinsUrgents.length.toString(),
      sub: "À traiter",
      color: "red",
      negative: true,
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Formations actives",
      value: formationsActives.length.toString(),
      sub: "En cours",
      color: "blue",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Insertions en cours",
      value: insertionsEnCours.length.toString(),
      color: "green",
    },
    {
      icon: <UserCheck size={20} />,
      label: "Agents actifs",
      value: agentsActifs.length.toString(),
      sub: "Actifs",
      color: "blue",
    },
  ];

  const moisLabels = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];

  const moisData = moisLabels.map((_, index) =>
    donsValides
      .filter((d) => new Date(d.created_at).getMonth() === index)
      .reduce((acc, d) => acc + (Number(d.montant) || 0), 0),
  );
  const maxVal = Math.max(...moisData, 1);

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

  const derniersDons = [...dons]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <AdminLayout titre="Tableau de bord">
      <div className="dashboard">
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
                {card.negative ? (
                  <ArrowDownRight size={16} className="dashboard__stat-trend" />
                ) : (
                  <ArrowUpRight size={16} className="dashboard__stat-trend" />
                )}
              </div>
              <div className="dashboard__stat-value">
                {loading ? "..." : card.value}
              </div>
              <div className="dashboard__stat-label">{card.label}</div>
              {card.sub && (
                <div className="dashboard__stat-sub">{card.sub}</div>
              )}
            </div>
          ))}
        </div>

        <div className="dashboard__grid">
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Dons par mois (FCFA)</h3>
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

          <div className="dashboard__card dashboard__card--objectif">
            <div className="dashboard__objectif-icon">
              <TrendingUp size={24} />
            </div>
            <h3 className="dashboard__objectif-title">Objectif Mensuel</h3>
            <p className="dashboard__objectif-text">
              Vous êtes à {pctObjectif}% de votre objectif de collecte pour ce
              mois.
            </p>
            <div className="dashboard__progress">
              <div className="dashboard__progress-bar">
                <div
                  className="dashboard__progress-fill"
                  style={{ width: `${pctObjectif}%` }}
                />
              </div>
              <div className="dashboard__progress-labels">
                <span>Collecté {formatMontant(collecteMois)}</span>
                <span>Cible {formatMontant(OBJECTIF_MENSUEL_FCFA)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Derniers dons</h3>
            <button
              className="dashboard__voir-tout"
              onClick={() => navigate("/dons")}
            >
              Voir tout →
            </button>
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
              ) : derniersDons.length === 0 ? (
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
                derniersDons.map((don) => (
                  <tr key={don.id}>
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
