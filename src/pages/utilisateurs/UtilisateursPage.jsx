import { useState, useEffect } from "react";
import { Search, Plus, Edit, Lock, Unlock, Trash2 } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./UtilisateursPage.css";

function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "agent",
    telephone: "",
    zone_affectation: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAgents();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminService.createAgent(form);
      setShowModal(false);
      setForm({
        name: "",
        email: "",
        role: "agent",
        telephone: "",
        zone_affectation: "",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBloquer = async (id) => {
    try {
      await adminService.bloquerAgent(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDebloquer = async (id) => {
    try {
      await adminService.debloquerAgent(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const usersFiltres = users.filter(
    (u) =>
      u.name.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase()),
  );

  const stats = {
    total: users.length,
    agents: users.filter((u) => u.role === "agent").length,
    actifs: users.filter((u) => u.statut === "actif").length,
    bloques: users.filter((u) => u.statut === "bloque").length,
  };

  return (
    <AdminLayout titre="Utilisateurs">
      <div className="utilisateurs">
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Utilisateurs</h2>
            <p className="page__subtitle">
              Gérez les comptes et les accès des administrateurs et des agents
              de terrain.
            </p>
          </div>
          <button className="page__btn-add" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Créer utilisateur
          </button>
        </div>

        {/* Stats */}
        <div className="utilisateurs__stats">
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--green">
              <Plus size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">TOTAL UTILISATEURS</p>
              <p className="utilisateurs__stat-value">
                {stats.total.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--blue">
              <Plus size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">AGENTS DE TERRAIN</p>
              <p className="utilisateurs__stat-value">{stats.agents}</p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--green">
              <Plus size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">ACTIFS CE MOIS</p>
              <p className="utilisateurs__stat-value">
                {stats.actifs > 0
                  ? Math.round((stats.actifs / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--red">
              <Lock size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">ACCÈS BLOQUÉS</p>
              <p className="utilisateurs__stat-value">{stats.bloques}</p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="page__filters">
          <div className="page__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="page__search-input"
            />
          </div>
        </div>

        {/* Table */}
        <div className="page__table-container">
          <table className="page__table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Zone d'affectation</th>
                <th>Statut</th>
                <th>Date d'inscription</th>
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
              ) : usersFiltres.length === 0 ? (
                <tr>
                  <td colSpan="6" className="page__table-empty">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                usersFiltres.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="page__table-user">
                        <div
                          className="utilisateurs__avatar"
                          style={{
                            backgroundColor:
                              user.role === "admin"
                                ? "var(--primary)"
                                : "var(--secondary-medium)",
                          }}
                        >
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{user.name}</p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          user.role === "admin"
                            ? "badge badge--green"
                            : "badge badge--gray"
                        }
                      >
                        {user.role === "admin" ? "Admin" : "Agent"}
                      </span>
                    </td>
                    <td>{user.zone_affectation || "—"}</td>
                    <td>
                      <div className="utilisateurs__statut">
                        <span
                          className={`utilisateurs__dot ${user.statut === "actif" ? "utilisateurs__dot--green" : "utilisateurs__dot--red"}`}
                        />
                        <span>
                          {user.statut === "actif"
                            ? "Actif"
                            : user.statut === "bloque"
                              ? "Bloqué"
                              : "Inactif"}
                        </span>
                      </div>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <div className="page__actions">
                        <button
                          className="page__action-btn page__action-btn--view"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        {user.statut === "actif" ? (
                          <button
                            className="page__action-btn page__action-btn--delete"
                            onClick={() => handleBloquer(user.id)}
                            title="Bloquer"
                          >
                            <Lock size={16} />
                          </button>
                        ) : (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            onClick={() => handleDebloquer(user.id)}
                            title="Débloquer"
                          >
                            <Unlock size={16} />
                          </button>
                        )}
                        <button
                          className="page__action-btn page__action-btn--delete"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="talibes__pagination">
          <span>Affichage 1-3 sur {usersFiltres.length} utilisateurs</span>
          <div className="talibes__pages">
            <button className="talibes__page-btn">‹</button>
            <button className="talibes__page-btn talibes__page-btn--active">
              1
            </button>
            <button className="talibes__page-btn">2</button>
            <button className="talibes__page-btn">›</button>
          </div>
        </div>
      </div>

      {/* Modal Créer */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Créer un utilisateur</h3>
              <button
                className="modal__close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__row">
                <div className="modal__group">
                  <label className="modal__label">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="modal__input"
                    placeholder="Ex: Moussa Diallo"
                  />
                </div>
                <div className="modal__group">
                  <label className="modal__label">Rôle</label>
                  <select
                    className="modal__input"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="agent">Agent de terrain</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="modal__group">
                <label className="modal__label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="modal__input"
                  placeholder="email@talibevoice.sn"
                />
              </div>
              <div className="modal__row">
                <div className="modal__group">
                  <label className="modal__label">Téléphone</label>
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    className="modal__input"
                    placeholder="+221..."
                  />
                </div>
                <div className="modal__group">
                  <label className="modal__label">Zone d'affectation</label>
                  <input
                    type="text"
                    value={form.zone_affectation}
                    onChange={(e) =>
                      setForm({ ...form, zone_affectation: e.target.value })
                    }
                    className="modal__input"
                    placeholder="Ex: Dakar Centre"
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button className="modal__btn-submit" onClick={handleCreate}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default UtilisateursPage;
