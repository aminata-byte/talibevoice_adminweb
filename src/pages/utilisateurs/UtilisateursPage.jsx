import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  Trash2,
  X,
  Users,
  UserCheck,
  UserX,
  Save,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./UtilisateursPage.css";

const ITEMS_PAR_PAGE = 10;

function UtilisateursPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  // Modal créer
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "agent",
    telephone: "",
    zone_affectation: "",
  });
  const [creating, setCreating] = useState(false);
  const [passwordTemp, setPasswordTemp] = useState("");

  // Modal éditer
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [userAEditer, setUserAEditer] = useState(null);
  const [formEdit, setFormEdit] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal supprimer
  const [showModalSuppr, setShowModalSuppr] = useState(false);
  const [userASupprimer, setUserASupprimer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAgents();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email) {
      alert("Nom et email sont obligatoires.");
      return;
    }
    setCreating(true);
    try {
      const res = await adminService.createAgent(form);
      setUsers((prev) => [res.user, ...prev]);
      setPasswordTemp(res.password_temporaire);
      setForm({
        name: "",
        email: "",
        role: "agent",
        telephone: "",
        zone_affectation: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  const ouvrirEdit = (user, e) => {
    e.stopPropagation();
    setUserAEditer(user);
    setFormEdit({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "agent",
      telephone: user.telephone || "",
      zone_affectation: user.zone_affectation || "",
    });
    setShowModalEdit(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateAgent(userAEditer.id, formEdit);
      setUsers((prev) =>
        prev.map((u) => (u.id === userAEditer.id ? { ...u, ...res.user } : u)),
      );
      setShowModalEdit(false);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la modification.");
    } finally {
      setSaving(false);
    }
  };

  const handleBloquer = async (id, e) => {
    e.stopPropagation();
    try {
      await adminService.bloquerAgent(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, statut: "bloque" } : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDebloquer = async (id, e) => {
    e.stopPropagation();
    try {
      await adminService.debloquerAgent(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, statut: "actif" } : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const ouvrirSuppr = (user, e) => {
    e.stopPropagation();
    setUserASupprimer(user);
    setShowModalSuppr(true);
  };

  const confirmerSuppr = async () => {
    setDeleting(true);
    try {
      await adminService.deleteAgent(userASupprimer.id);
      setUsers((prev) => prev.filter((u) => u.id !== userASupprimer.id));
      setShowModalSuppr(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const usersFiltres = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(recherche.toLowerCase()) ||
        u.email?.toLowerCase().includes(recherche.toLowerCase()),
    );
  }, [users, recherche]);

  useEffect(() => {
    setPage(1);
  }, [recherche]);

  const totalPages = Math.max(
    1,
    Math.ceil(usersFiltres.length / ITEMS_PAR_PAGE),
  );
  const usersPage = usersFiltres.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const stats = useMemo(
    () => ({
      total: users.length,
      agents: users.filter((u) => u.role === "agent").length,
      actifs: users.filter((u) => u.statut === "actif").length,
      bloques: users.filter((u) => u.statut === "bloque").length,
    }),
    [users],
  );

  return (
    <AdminLayout titre="Utilisateurs">
      <div className="utilisateurs">
        <div className="page__header">
          <div>
            <h2 className="page__title">
              Gestion des Utilisateurs
              <span className="talibes__count">({users.length})</span>
            </h2>
            <p className="page__subtitle">
              Gérez les comptes et les accès des administrateurs et des agents
              de terrain.
            </p>
          </div>
          <button
            className="page__btn-add"
            onClick={() => {
              setPasswordTemp("");
              setShowModalCreate(true);
            }}
          >
            <Plus size={18} /> Créer utilisateur
          </button>
        </div>

        {/* Stats */}
        <div className="utilisateurs__stats">
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--blue">
              <Users size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">TOTAL</p>
              <p className="utilisateurs__stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--green">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">AGENTS</p>
              <p className="utilisateurs__stat-value">{stats.agents}</p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--green">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">ACTIFS</p>
              <p className="utilisateurs__stat-value">{stats.actifs}</p>
            </div>
          </div>
          <div className="utilisateurs__stat">
            <div className="utilisateurs__stat-icon utilisateurs__stat-icon--red">
              <UserX size={20} />
            </div>
            <div>
              <p className="utilisateurs__stat-label">BLOQUÉS</p>
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
              ) : usersPage.length === 0 ? (
                <tr>
                  <td colSpan="6" className="page__table-empty">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                usersPage.map((user) => (
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
                          onClick={(e) => ouvrirEdit(user, e)}
                        >
                          <Edit size={16} />
                        </button>
                        {user.statut === "actif" ? (
                          <button
                            className="page__action-btn page__action-btn--warn"
                            title="Bloquer"
                            onClick={(e) => handleBloquer(user.id, e)}
                          >
                            <Lock size={16} />
                          </button>
                        ) : (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            title="Débloquer"
                            onClick={(e) => handleDebloquer(user.id, e)}
                          >
                            <Unlock size={16} />
                          </button>
                        )}
                        <button
                          className="page__action-btn page__action-btn--delete"
                          title="Supprimer"
                          onClick={(e) => ouvrirSuppr(user, e)}
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

        {/* Pagination */}
        <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
          <span>
            {usersFiltres.length === 0
              ? "Aucun résultat"
              : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(page * ITEMS_PAR_PAGE, usersFiltres.length)} sur ${usersFiltres.length} utilisateurs`}
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

      {/* Modal créer */}
      {showModalCreate && (
        <div
          className="modal__overlay"
          onClick={() => setShowModalCreate(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Créer un utilisateur</h3>
              <button
                className="modal__close"
                onClick={() => setShowModalCreate(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              {passwordTemp ? (
                <div className="utilisateurs__password-card">
                  <p className="utilisateurs__password-title">
                    Utilisateur créé avec succès !
                  </p>
                  <p className="utilisateurs__password-sub">
                    Mot de passe temporaire à communiquer :
                  </p>
                  <div className="utilisateurs__password-value">
                    {passwordTemp}
                  </div>
                  <p className="utilisateurs__password-warn">
                    Notez ce mot de passe — il ne sera plus affiché.
                  </p>
                </div>
              ) : (
                <div className="modal__grid">
                  <div className="modal__field">
                    <label className="modal__label">Nom complet</label>
                    <input
                      className="modal__input"
                      placeholder="Ex: Moussa Diallo"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal__field">
                    <label className="modal__label">Rôle</label>
                    <select
                      className="modal__input"
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="agent">Agent de terrain</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div className="modal__field modal__field--full">
                    <label className="modal__label">Email</label>
                    <input
                      type="email"
                      className="modal__input"
                      placeholder="email@talibevoice.sn"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal__field">
                    <label className="modal__label">Téléphone</label>
                    <input
                      type="tel"
                      className="modal__input"
                      placeholder="+221..."
                      value={form.telephone}
                      onChange={(e) =>
                        setForm({ ...form, telephone: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal__field">
                    <label className="modal__label">Zone d'affectation</label>
                    <input
                      className="modal__input"
                      placeholder="Ex: Dakar Centre"
                      value={form.zone_affectation}
                      onChange={(e) =>
                        setForm({ ...form, zone_affectation: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => {
                  setShowModalCreate(false);
                  setPasswordTemp("");
                }}
              >
                {passwordTemp ? "Fermer" : "Annuler"}
              </button>
              {!passwordTemp && (
                <button
                  className="modal__btn modal__btn--save"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  <Plus size={15} /> {creating ? "Création..." : "Créer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal éditer */}
      {showModalEdit && (
        <div className="modal__overlay" onClick={() => setShowModalEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">Modifier l'utilisateur</h3>
              <button
                className="modal__close"
                onClick={() => setShowModalEdit(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__grid">
                <div className="modal__field">
                  <label className="modal__label">Nom complet</label>
                  <input
                    className="modal__input"
                    value={formEdit.name}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, name: e.target.value })
                    }
                  />
                </div>
                <div className="modal__field">
                  <label className="modal__label">Rôle</label>
                  <select
                    className="modal__input"
                    value={formEdit.role}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, role: e.target.value })
                    }
                  >
                    <option value="agent">Agent de terrain</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="modal__field modal__field--full">
                  <label className="modal__label">Email</label>
                  <input
                    type="email"
                    className="modal__input"
                    value={formEdit.email}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, email: e.target.value })
                    }
                  />
                </div>
                <div className="modal__field">
                  <label className="modal__label">Téléphone</label>
                  <input
                    type="tel"
                    className="modal__input"
                    value={formEdit.telephone}
                    onChange={(e) =>
                      setFormEdit({ ...formEdit, telephone: e.target.value })
                    }
                  />
                </div>
                <div className="modal__field">
                  <label className="modal__label">Zone d'affectation</label>
                  <input
                    className="modal__input"
                    value={formEdit.zone_affectation}
                    onChange={(e) =>
                      setFormEdit({
                        ...formEdit,
                        zone_affectation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setShowModalEdit(false)}
              >
                Annuler
              </button>
              <button
                className="modal__btn modal__btn--save"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                <Save size={15} /> {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal supprimer */}
      {showModalSuppr && (
        <div
          className="modal__overlay"
          onClick={() => setShowModalSuppr(false)}
        >
          <div
            className="modal modal--small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h3 className="modal__title">Confirmer la suppression</h3>
              <button
                className="modal__close"
                onClick={() => setShowModalSuppr(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__confirm-text">
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <strong>{userASupprimer?.name}</strong> ? Cette action est
                irréversible.
              </p>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setShowModalSuppr(false)}
              >
                Annuler
              </button>
              <button
                className="modal__btn modal__btn--danger"
                onClick={confirmerSuppr}
                disabled={deleting}
              >
                <Trash2 size={15} /> {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default UtilisateursPage;
