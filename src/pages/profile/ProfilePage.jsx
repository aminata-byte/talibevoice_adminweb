import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { admin, setAdmin } = useAdminAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    telephone: admin?.telephone || "",
    zone_affectation: admin?.zone_affectation || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateMe(form);
      if (setAdmin) setAdmin(res.user);
      localStorage.setItem("admin", JSON.stringify(res.user));
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: admin?.name || "",
      email: admin?.email || "",
      telephone: admin?.telephone || "",
      zone_affectation: admin?.zone_affectation || "",
    });
    setEditing(false);
  };

  return (
    <AdminLayout titre="Profile">
      <div className="profile">
        <div className="page__header">
          <div>
            <h2 className="page__title">Mon Profil</h2>
            <p className="page__subtitle">Gérez vos informations personnelles.</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {editing ? (
              <>
                <button className="page__btn-export" onClick={handleCancel}>
                  <X size={16} /> Annuler
                </button>
                <button className="page__btn-add" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </>
            ) : (
              <button className="page__btn-add" onClick={() => setEditing(true)}>
                <Edit size={16} /> Modifier
              </button>
            )}
          </div>
        </div>

        {success && (
          <div style={{
            background: "var(--primary-light)", color: "var(--primary)",
            borderRadius: "var(--radius-md)", padding: "10px 16px",
            fontSize: "13px", fontWeight: 500,
          }}>
            Profil mis à jour avec succès.
          </div>
        )}

        <div className="profile__layout">
          {/* Card avatar */}
          <div className="profile__card">
            <div className="profile__avatar">
              {admin?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <h3 className="profile__name">{admin?.name || "Administrateur"}</h3>
            <span className="badge badge--green">Admin</span>
            <p className="profile__email">{admin?.email}</p>
          </div>

          {/* Infos */}
          <div className="profile__infos-card">
            <h3 className="profile__section-title">Informations personnelles</h3>

            <div className="profile__form">
              <div className="profile__form-group">
                <label className="modal__label"><User size={14} /> Nom complet</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.name || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label"><Mail size={14} /> Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.email || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label"><Phone size={14} /> Téléphone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.telephone || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label"><MapPin size={14} /> Zone d'affectation</label>
                {editing ? (
                  <input
                    type="text"
                    value={form.zone_affectation}
                    onChange={(e) => setForm({ ...form, zone_affectation: e.target.value })}
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.zone_affectation || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label">Rôle</label>
                <span className="badge badge--green">Administrateur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProfilePage;