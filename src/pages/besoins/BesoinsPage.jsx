import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./BesoinsPage.css";

function BesoinsPage() {
  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBesoins();
  }, []);

  const fetchBesoins = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDaaras();
      const allBesoins = [];
      for (const daara of data) {
        const b = await adminService.getDaara(daara.id);
        if (b.besoins) {
          b.besoins.forEach((besoin) => {
            allBesoins.push({ ...besoin, daara: daara });
          });
        }
      }
      setBesoins(allBesoins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const urgent = besoins.filter((b) => b.priorite === "urgent");
  const normal = besoins.filter((b) => b.priorite === "normal");
  const faible = besoins.filter((b) => b.priorite === "faible");

  const getTypeIcon = (type) => {
    const icons = {
      Alimentaire: "🍽️",
      Médical: "💊",
      Éducatif: "📚",
      Infrastructure: "🏗️",
      Vêtements: "👕",
    };
    return icons[type] || "📦";
  };

  const BesoinCard = ({ besoin }) => (
    <div className="besoin__kanban-card">
      <div className="besoin__kanban-header">
        <span className="besoin__kanban-daara">{besoin.daara?.nom || "—"}</span>
        <span className="besoin__kanban-date">
          {new Date(besoin.date_signalement).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="besoin__kanban-title">
        {getTypeIcon(besoin.type)} {besoin.description}
      </p>
      <p className="besoin__kanban-type">{besoin.type}</p>
      <p className="besoin__kanban-desc">{besoin.description}</p>
      <div className="besoin__kanban-footer">
        <div className="besoin__kanban-agent">
          <div className="besoin__kanban-avatar">
            {besoin.daara?.nom?.[0] || "D"}
          </div>
        </div>
        <button className="besoin__kanban-detail">Détails →</button>
      </div>
    </div>
  );

  return (
    <AdminLayout titre="Besoins">
      <div className="besoins">
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Besoins</h2>
          </div>
          <div className="besoins__header-right">
            <div className="besoins__location">
              <MapPin size={14} />
              <span>Dakar, Plateau</span>
            </div>
            <div className="besoins__view-toggle">
              <button className="besoins__view-btn">≡ Tableau</button>
              <button className="besoins__view-btn besoins__view-btn--active">
                ⊞ Kanban
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
        ) : (
          <div className="besoins__kanban">
            {/* Urgent */}
            <div className="besoins__column">
              <div className="besoins__column-header besoins__column-header--urgent">
                <span>❗ URGENT</span>
                <span className="besoins__column-count">{urgent.length}</span>
              </div>
              <div className="besoins__column-body">
                {urgent.length === 0 ? (
                  <p className="besoins__empty">Aucun besoin urgent.</p>
                ) : (
                  urgent.map((b) => <BesoinCard key={b.id} besoin={b} />)
                )}
                <button className="besoins__add-btn">+ Ajouter</button>
              </div>
            </div>

            {/* Normal */}
            <div className="besoins__column">
              <div className="besoins__column-header besoins__column-header--normal">
                <span>🔔 NORMAL</span>
                <span className="besoins__column-count">{normal.length}</span>
              </div>
              <div className="besoins__column-body">
                {normal.length === 0 ? (
                  <p className="besoins__empty">Aucun besoin normal.</p>
                ) : (
                  normal.map((b) => <BesoinCard key={b.id} besoin={b} />)
                )}
                <button className="besoins__add-btn">+ Ajouter</button>
              </div>
            </div>

            {/* Faible */}
            <div className="besoins__column">
              <div className="besoins__column-header besoins__column-header--faible">
                <span>📋 FAIBLE</span>
                <span className="besoins__column-count">{faible.length}</span>
              </div>
              <div className="besoins__column-body">
                {faible.length === 0 ? (
                  <p className="besoins__empty">Aucun besoin faible.</p>
                ) : (
                  faible.map((b) => <BesoinCard key={b.id} besoin={b} />)
                )}
                <button className="besoins__add-btn">+ Ajouter</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BesoinsPage;
