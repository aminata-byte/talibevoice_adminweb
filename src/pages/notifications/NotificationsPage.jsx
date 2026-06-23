import { useState, useEffect, useMemo } from "react";
import { Send, Download } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./NotificationsPage.css";

const ITEMS_PAR_PAGE = 10;

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Destinataires
  const [agents, setAgents] = useState([]);
  const [partenaires, setPartenaires] = useState([]);

  // Formulaire
  const [form, setForm] = useState({
    type: "",
    destinataire_type: "agent",
    destinataire_id: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [notifs, agentsData, partenairesData] = await Promise.all([
        adminService.getNotifications(),
        adminService.getAgents(),
        adminService.getPartenaires(),
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setAgents(
        Array.isArray(agentsData)
          ? agentsData.filter((a) => a.role === "agent")
          : [],
      );
      setPartenaires(
        Array.isArray(partenairesData)
          ? partenairesData.filter((p) => p.statut === "valide")
          : [],
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.message || !form.destinataire_type) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSending(true);
    try {
      await adminService.sendNotification({
        message: form.message,
        type: form.type,
        destinataire_type: form.destinataire_type,
        destinataire_id: form.destinataire_id || null,
      });
      setSendSuccess(true);
      setForm({
        type: "",
        destinataire_type: "agent",
        destinataire_id: "",
        message: "",
      });
      await fetchAll();
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  // Stats calculées
  const stats = useMemo(() => {
    const total = notifications.length;
    const lues = notifications.filter((n) => n.est_lue).length;
    const tauxLecture = total > 0 ? Math.round((lues / total) * 100) : 0;
    const derniere = notifications[0];
    return { total, lues, tauxLecture, derniere };
  }, [notifications]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / ITEMS_PAR_PAGE),
  );
  const notifPage = notifications.slice(
    (page - 1) * ITEMS_PAR_PAGE,
    page * ITEMS_PAR_PAGE,
  );

  const getTypeLabel = (type) => {
    const labels = {
      besoin_urgent: "Besoin urgent",
      offre_validee: "Offre validée",
      don_valide: "Don validé",
      redistribution: "Redistribution",
      insertion_talibe: "Insertion talibé",
    };
    return labels[type] || type;
  };

  const getTypeDot = (type) => {
    if (type === "besoin_urgent") return "notif__dot--red";
    if (type === "offre_validee") return "notif__dot--blue";
    if (type === "don_valide") return "notif__dot--green";
    return "notif__dot--gray";
  };

  const getDestinataireNom = (notif) => {
    if (!notif.destinataire_id) {
      return notif.destinataire_type === "agent"
        ? "Tous les agents"
        : "Tous les partenaires";
    }
    if (notif.destinataire_type === "agent") {
      const agent = agents.find((a) => a.id === notif.destinataire_id);
      return agent?.name || `Agent #${notif.destinataire_id}`;
    }
    const partenaire = partenaires.find((p) => p.id === notif.destinataire_id);
    return partenaire?.nom || `Partenaire #${notif.destinataire_id}`;
  };

  return (
    <AdminLayout titre="Notifications">
      <div className="notifs">
        <div className="page__header">
          <div>
            <h2 className="page__title">Gestion des Notifications</h2>
            <p className="page__subtitle">
              Envoyez des alertes ciblées et suivez l'historique des
              communications.
            </p>
          </div>
        </div>

        <div className="notifs__layout">
          {/* Formulaire */}
          <div className="notifs__form-card">
            <h3 className="notifs__section-title">
              <Send size={16} /> Envoyer une notification
            </h3>

            {sendSuccess && (
              <div className="notifs__success">
                Notification(s) envoyée(s) avec succès !
              </div>
            )}

            <div className="notifs__form">
              {/* Type de notification */}
              <div className="notifs__form-group">
                <label className="modal__label">Type de notification</label>
                <select
                  className="modal__input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="besoin_urgent">Besoin urgent</option>
                  <option value="offre_validee">Offre validée</option>
                  <option value="don_valide">Don validé</option>
                  <option value="redistribution">Redistribution</option>
                  <option value="insertion_talibe">Insertion talibé</option>
                </select>
              </div>

              {/* Type de destinataire */}
              <div className="notifs__form-group">
                <label className="modal__label">Type de destinataire</label>
                <div className="notifs__radio-group">
                  <label className="notifs__radio">
                    <input
                      type="radio"
                      name="destinataire_type"
                      value="agent"
                      checked={form.destinataire_type === "agent"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          destinataire_type: e.target.value,
                          destinataire_id: "",
                        })
                      }
                    />
                    <span>Agent</span>
                  </label>
                  <label className="notifs__radio">
                    <input
                      type="radio"
                      name="destinataire_type"
                      value="partenaire"
                      checked={form.destinataire_type === "partenaire"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          destinataire_type: e.target.value,
                          destinataire_id: "",
                        })
                      }
                    />
                    <span>Partenaire</span>
                  </label>
                </div>
              </div>

              {/* Destinataire spécifique */}
              <div className="notifs__form-group">
                <label className="modal__label">Destinataire</label>
                <select
                  className="modal__input"
                  value={form.destinataire_id}
                  onChange={(e) =>
                    setForm({ ...form, destinataire_id: e.target.value })
                  }
                >
                  {form.destinataire_type === "agent" ? (
                    <>
                      <option value="">Tous les agents</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="">Tous les partenaires</option>
                      {partenaires.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Message */}
              <div className="notifs__form-group">
                <label className="modal__label">Message</label>
                <textarea
                  className="modal__input"
                  placeholder="Rédigez votre message ici..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  rows={5}
                />
              </div>

              <button
                className="notifs__send-btn"
                onClick={handleSubmit}
                disabled={sending}
              >
                <Send size={16} />
                {sending ? "Envoi..." : "Envoyer la notification"}
              </button>
            </div>
          </div>

          {/* Historique */}
          <div className="notifs__history-card">
            <div className="notifs__history-header">
              <h3 className="notifs__section-title">
                Historique des notifications
              </h3>
              <button className="page__btn-export">
                <Download size={14} /> Exporter
              </button>
            </div>

            <table className="page__table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Destinataire</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="page__table-empty">
                      Chargement...
                    </td>
                  </tr>
                ) : notifPage.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="page__table-empty">
                      Aucune notification.
                    </td>
                  </tr>
                ) : (
                  notifPage.map((notif) => (
                    <tr key={notif.id}>
                      <td>
                        <div className="notifs__type">
                          <span
                            className={`notif__dot ${getTypeDot(notif.type)}`}
                          />
                          <span>{getTypeLabel(notif.type)}</span>
                        </div>
                      </td>
                      <td>{getDestinataireNom(notif)}</td>
                      <td>
                        {new Date(notif.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            notif.est_lue
                              ? "badge badge--green"
                              : "badge badge--yellow"
                          }
                        >
                          {notif.est_lue ? "Lu" : "Non lu"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="talibes__pagination" style={{ marginTop: "1rem" }}>
              <span>
                {notifications.length === 0
                  ? "Aucune notification"
                  : `Affichage ${(page - 1) * ITEMS_PAR_PAGE + 1}–${Math.min(page * ITEMS_PAR_PAGE, notifications.length)} sur ${notifications.length} notifications`}
              </span>
              <div className="talibes__pages">
                <button
                  className="talibes__page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      className={`talibes__page-btn${page === p ? " talibes__page-btn--active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
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
        </div>

        {/* Stats bas — calculées depuis les vraies données */}
        <div className="notifs__stats">
          <div className="notifs__stat-card">
            <p className="notifs__stat-value">{stats.tauxLecture}%</p>
            <p className="notifs__stat-label">Taux de lecture</p>
            <p className="notifs__stat-sub">
              {stats.lues} lues sur {stats.total}
            </p>
          </div>
          <div className="notifs__stat-card">
            <p className="notifs__stat-value">{stats.total}</p>
            <p className="notifs__stat-label">Notifications envoyées</p>
            <p className="notifs__stat-sub">Depuis le début</p>
          </div>
          <div className="notifs__stat-card">
            <p className="notifs__stat-label">Dernier envoi</p>
            <p className="notifs__stat-value" style={{ fontSize: "1rem" }}>
              {stats.derniere
                ? new Date(stats.derniere.created_at).toLocaleDateString(
                    "fr-FR",
                    { day: "2-digit", month: "short" },
                  )
                : "—"}
            </p>
            <p className="notifs__stat-sub">
              {stats.derniere
                ? getTypeLabel(stats.derniere.type)
                : "Aucun envoi"}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationsPage;
