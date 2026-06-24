import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./ProfilePage.css";

function ProfilePage() {
  const { admin, setAdmin } = useAdminAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    telephone: admin?.telephone || "",
    zone_affectation: admin?.zone_affectation || "",
  });

  // Mot de passe
  const [formPassword, setFormPassword] = useState({
    ancien_password: "",
    nouveau_password: "",
    nouveau_password_confirmation: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateMe(form);
      if (setAdmin) setAdmin(res.user);
      localStorage.setItem("admin", JSON.stringify(res.user));
      setSuccess("Profil mis à jour avec succès.");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
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

  const handleChangePassword = async () => {
    setErrorPassword("");
    if (
      !formPassword.ancien_password ||
      !formPassword.nouveau_password ||
      !formPassword.nouveau_password_confirmation
    ) {
      setErrorPassword("Veuillez remplir tous les champs.");
      return;
    }
    if (
      formPassword.nouveau_password !==
      formPassword.nouveau_password_confirmation
    ) {
      setErrorPassword("Les mots de passe ne correspondent pas.");
      return;
    }
    if (formPassword.nouveau_password.length < 6) {
      setErrorPassword(
        "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }
    setSavingPassword(true);
    try {
      await adminService.changePassword(formPassword);
      setSuccess("Mot de passe modifié avec succès.");
      setFormPassword({
        ancien_password: "",
        nouveau_password: "",
        nouveau_password_confirmation: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setErrorPassword(
        err.response?.data?.message ||
          "Erreur lors du changement de mot de passe.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AdminLayout titre="Profile">
      <div className="profile">
        <div className="page__header">
          <div>
            <h2 className="page__title">Mon Profil</h2>
            <p className="page__subtitle">
              Gérez vos informations personnelles.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {editing ? (
              <>
                <button className="page__btn-export" onClick={handleCancel}>
                  <X size={16} /> Annuler
                </button>
                <button
                  className="page__btn-add"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </>
            ) : (
              <button
                className="page__btn-add"
                onClick={() => setEditing(true)}
              >
                <Edit size={16} /> Modifier
              </button>
            )}
          </div>
        </div>

        {success && (
          <div
            style={{
              background: "var(--primary-light)",
              color: "var(--primary)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {success}
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
            <h3 className="profile__section-title">
              Informations personnelles
            </h3>

            <div className="profile__form">
              <div className="profile__form-group">
                <label className="modal__label">
                  <User size={14} /> Nom complet
                </label>
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
                <label className="modal__label">
                  <Mail size={14} /> Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.email || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label">
                  <Phone size={14} /> Téléphone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm({ ...form, telephone: e.target.value })
                    }
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">{form.telephone || "—"}</p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label">
                  <MapPin size={14} /> Zone d'affectation
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.zone_affectation}
                    onChange={(e) =>
                      setForm({ ...form, zone_affectation: e.target.value })
                    }
                    className="modal__input"
                  />
                ) : (
                  <p className="profile__value">
                    {form.zone_affectation || "—"}
                  </p>
                )}
              </div>

              <div className="profile__form-group">
                <label className="modal__label">Rôle</label>
                <span className="badge badge--green">Administrateur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changement mot de passe */}
        <div className="profile__password-card">
          <h3 className="profile__section-title">
            <Lock size={16} /> Changer le mot de passe
          </h3>

          {errorPassword && (
            <p
              style={{
                background: "rgba(220,38,38,0.08)",
                color: "#dc2626",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                fontSize: "13px",
                marginBottom: "1rem",
              }}
            >
              {errorPassword}
            </p>
          )}

          <div className="profile__form">
            <div className="profile__form-group">
              <label className="modal__label">Ancien mot de passe</label>
              <div className="profile__password-input">
                <input
                  type={showAncien ? "text" : "password"}
                  value={formPassword.ancien_password}
                  onChange={(e) =>
                    setFormPassword({
                      ...formPassword,
                      ancien_password: e.target.value,
                    })
                  }
                  className="modal__input"
                  placeholder="Votre mot de passe actuel"
                />
                <button
                  className="profile__eye"
                  onClick={() => setShowAncien(!showAncien)}
                >
                  {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile__form-group">
              <label className="modal__label">Nouveau mot de passe</label>
              <div className="profile__password-input">
                <input
                  type={showNouveau ? "text" : "password"}
                  value={formPassword.nouveau_password}
                  onChange={(e) =>
                    setFormPassword({
                      ...formPassword,
                      nouveau_password: e.target.value,
                    })
                  }
                  className="modal__input"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  className="profile__eye"
                  onClick={() => setShowNouveau(!showNouveau)}
                >
                  {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="profile__form-group">
              <label className="modal__label">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={formPassword.nouveau_password_confirmation}
                onChange={(e) =>
                  setFormPassword({
                    ...formPassword,
                    nouveau_password_confirmation: e.target.value,
                  })
                }
                className="modal__input"
                placeholder="Répétez le nouveau mot de passe"
              />
            </div>

            <button
              className="page__btn-add"
              onClick={handleChangePassword}
              disabled={savingPassword}
              style={{ marginTop: "0.5rem" }}
            >
              <Lock size={15} />
              {savingPassword ? "Modification..." : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProfilePage;
