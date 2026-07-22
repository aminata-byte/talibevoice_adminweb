import { useState, useEffect, useMemo } from "react";
import { Mail, Eye, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./MessagesPage.css";

function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await adminService.getContacts();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const stats = useMemo(() => {
    const total = messages.length;
    const nonLus = messages.filter((m) => !m.est_lu).length;
    return { total, nonLus };
  }, [messages]);

  const handleView = async (message) => {
    setSelected(message);
    if (!message.est_lu) {
      try {
        await adminService.marquerContactLu(message.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, est_lu: true } : m)),
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await adminService.deleteContact(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout titre="Messages">
      <div className="messages">
        <div className="page__header">
          <div>
            <h2 className="page__title">Messages de contact</h2>
            <p className="page__subtitle">
              Messages envoyés depuis le formulaire de contact du site public.
            </p>
          </div>
          <span className="badge badge--yellow">
            {stats.nonLus} non lu{stats.nonLus > 1 ? "s" : ""}
          </span>
        </div>

        <table className="page__table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Sujet</th>
              <th>Date</th>
              <th>Statut</th>
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
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan="6" className="page__table-empty">
                  Aucun message reçu.
                </td>
              </tr>
            ) : (
              messages.map((m) => (
                <tr key={m.id}>
                  <td>{m.nom}</td>
                  <td>{m.email}</td>
                  <td>{m.sujet}</td>
                  <td>
                    {new Date(m.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={
                        m.est_lu ? "badge badge--green" : "badge badge--yellow"
                      }
                    >
                      {m.est_lu ? "Lu" : "Non lu"}
                    </span>
                  </td>
                  <td>
                    <div className="page__actions">
                      <button
                        className="page__action-btn page__action-btn--view"
                        title="Voir le message"
                        onClick={() => handleView(m)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="page__action-btn page__action-btn--delete"
                        title="Supprimer"
                        onClick={() => handleDelete(m.id)}
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

      {selected && (
        <div className="modal__overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="modal__title">
                <Mail size={16} /> Message de {selected.nom}
              </h3>
              <button className="modal__close" onClick={() => setSelected(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__grid">
                <div className="modal__field">
                  <span className="modal__label">Email</span>
                  <span>{selected.email}</span>
                </div>
                <div className="modal__field">
                  <span className="modal__label">Sujet</span>
                  <span>{selected.sujet}</span>
                </div>
                <div className="modal__field modal__field--full">
                  <span className="modal__label">Message</span>
                  <span>{selected.message}</span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="modal__btn modal__btn--cancel"
                onClick={() => setSelected(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default MessagesPage;
