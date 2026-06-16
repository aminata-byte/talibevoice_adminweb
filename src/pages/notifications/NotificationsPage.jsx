import { useState, useEffect } from "react";
import { Send, Download } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./NotificationsPage.css";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "",
    destinataire_agents: false,
    destinataire_partenaires: false,
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.type || !form.message) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    setSending(true);
    try {
      await adminService.sendNotification({
        message: form.message,
        type: form.type,
        destinataire_type: form.destinataire_agents ? "agent" : "partenaire",
        destinataire_id: 1,
      });
      alert("Notification envoyée avec succès !");
      setForm({
        type: "",
        destinataire_agents: false,
        destinataire_partenaires: false,
        message: "",
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

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
              <Send size={16} />
              Envoyer une notification
            </h3>

            <div className="notifs__form">
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

              <div className="notifs__form-group">
                <label className="modal__label">Destinataires</label>
                <div className="notifs__checkboxes">
                  <label className="notifs__checkbox">
                    <input
                      type="checkbox"
                      checked={form.destinataire_agents}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          destinataire_agents: e.target.checked,
                        })
                      }
                    />
                    <span>Agents de terrain</span>
                  </label>
                  <label className="notifs__checkbox">
                    <input
                      type="checkbox"
                      checked={form.destinataire_partenaires}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          destinataire_partenaires: e.target.checked,
                        })
                      }
                    />
                    <span>Partenaires</span>
                  </label>
                </div>
              </div>

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
                <Download size={14} />
                Exporter
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
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="page__table-empty">
                      Aucune notification.
                    </td>
                  </tr>
                ) : (
                  notifications.map((notif) => (
                    <tr key={notif.id}>
                      <td>
                        <div className="notifs__type">
                          <span
                            className={`notif__dot ${getTypeDot(notif.type)}`}
                          />
                          <span>{getTypeLabel(notif.type)}</span>
                        </div>
                      </td>
                      <td>
                        {notif.destinataire_type === "agent"
                          ? "Agents de terrain"
                          : "Partenaires"}
                      </td>
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
                Affichage de {Math.min(notifications.length, 5)} sur{" "}
                {notifications.length} notifications
              </span>
              <div className="talibes__pages">
                <button className="talibes__page-btn">‹</button>
                <button className="talibes__page-btn talibes__page-btn--active">
                  1
                </button>
                <button className="talibes__page-btn">›</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bas */}
        <div className="notifs__stats">
          <div className="notifs__stat-card">
            <p className="notifs__stat-value">84%</p>
            <p className="notifs__stat-label">Taux de lecture</p>
            <p className="notifs__stat-sub">+5% par rapport au mois dernier</p>
          </div>
          <div className="notifs__stat-card">
            <p className="notifs__stat-value">1,240</p>
            <p className="notifs__stat-label">Destinataires actifs</p>
            <div className="notifs__avatars">
              <div className="notifs__avatar notifs__avatar--green">AD</div>
              <div className="notifs__avatar notifs__avatar--yellow">FF</div>
              <div className="notifs__avatar notifs__avatar--blue">YL</div>
            </div>
          </div>
          <div className="notifs__stat-card">
            <p className="notifs__stat-label">Dernier envoi</p>
            <p className="notifs__stat-value" style={{ fontSize: "1.1rem" }}>
              Il y a 2 heures
            </p>
            <p className="notifs__stat-sub">Type: Besoin urgent</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default NotificationsPage;
