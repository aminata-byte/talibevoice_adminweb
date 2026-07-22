import { useState, useEffect, useMemo } from "react";
import { Send, CheckCircle } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import adminService from "../../services/adminService";
import "./RedistributionsPage.css";

function RedistributionsPage() {
  const [redistributions, setRedistributions] = useState([]);
  const [dons, setDons] = useState([]);
  const [daaras, setDaaras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    don_id: "",
    daara_id: "",
    montant: "",
    motif: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [redistData, donsData, daarasData] = await Promise.all([
        adminService.getRedistributions(),
        adminService.getDons(),
        adminService.getDaaras(),
      ]);
      setRedistributions(Array.isArray(redistData) ? redistData : []);
      setDons(Array.isArray(donsData) ? donsData : []);
      setDaaras(Array.isArray(daarasData) ? daarasData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const donsEligibles = useMemo(
    () =>
      dons.filter((d) => d.type === "financier" && d.statut === "valide"),
    [dons],
  );

  const handleSubmit = async () => {
    if (!form.don_id || !form.daara_id || !form.montant) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminService.createRedistribution({
        don_id: form.don_id,
        daara_id: form.daara_id,
        montant: Number(form.montant),
        motif: form.motif || null,
      });
      setSuccess(true);
      setForm({ don_id: "", daara_id: "", montant: "", motif: "" });
      await fetchAll();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de planifier cette redistribution.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleValider = async (id) => {
    try {
      await adminService.validerRedistribution(id);
      setRedistributions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: "valide" } : r)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getStatutClass = (statut) => {
    if (statut === "valide") return "badge badge--green";
    if (statut === "effectue") return "badge badge--green";
    return "badge badge--yellow";
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validée";
    if (statut === "effectue") return "Effectuée";
    return "Planifiée";
  };

  const getDonateurNom = (don) => {
    if (!don?.donateur) return "Inconnu";
    if (don.donateur.est_anonyme) return "Anonyme";
    return `${don.donateur.prenom || ""} ${don.donateur.nom || ""}`.trim() || "Inconnu";
  };

  return (
    <AdminLayout titre="Redistributions">
      <div className="redist">
        <div className="page__header">
          <div>
            <h2 className="page__title">Redistribution des dons</h2>
            <p className="page__subtitle">
              Planifiez puis validez la redistribution des dons financiers
              validés vers les daaras.
            </p>
          </div>
        </div>

        <div className="redist__layout">
          {/* Formulaire */}
          <div className="redist__form-card">
            <h3 className="redist__section-title">
              <Send size={16} /> Planifier une redistribution
            </h3>

            {success && (
              <div className="redist__success">
                Redistribution planifiée avec succès !
              </div>
            )}
            {error && <div className="redist__error">{error}</div>}

            <div className="redist__form">
              <div className="redist__form-group">
                <label className="modal__label">Don à redistribuer</label>
                <select
                  className="modal__input"
                  value={form.don_id}
                  onChange={(e) =>
                    setForm({ ...form, don_id: e.target.value })
                  }
                >
                  <option value="">Sélectionnez un don validé</option>
                  {donsEligibles.map((d) => (
                    <option key={d.id} value={d.id}>
                      #TV-{String(d.id).padStart(4, "0")} —{" "}
                      {getDonateurNom(d)} —{" "}
                      {Number(d.montant).toLocaleString()} FCFA
                    </option>
                  ))}
                </select>
                <span className="redist__hint">
                  Seuls les dons financiers validés sont proposés.
                </span>
              </div>

              <div className="redist__form-group">
                <label className="modal__label">Daara bénéficiaire</label>
                <select
                  className="modal__input"
                  value={form.daara_id}
                  onChange={(e) =>
                    setForm({ ...form, daara_id: e.target.value })
                  }
                >
                  <option value="">Sélectionnez un daara</option>
                  {daaras.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom} ({d.region || d.adresse})
                    </option>
                  ))}
                </select>
              </div>

              <div className="redist__form-group">
                <label className="modal__label">Montant (FCFA)</label>
                <input
                  type="number"
                  className="modal__input"
                  placeholder="ex: 5000"
                  value={form.montant}
                  onChange={(e) =>
                    setForm({ ...form, montant: e.target.value })
                  }
                />
              </div>

              <div className="redist__form-group">
                <label className="modal__label">Motif (facultatif)</label>
                <textarea
                  className="modal__input"
                  placeholder="ex: Achat de vivres pour le trimestre"
                  value={form.motif}
                  onChange={(e) =>
                    setForm({ ...form, motif: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <button
                className="redist__submit-btn"
                onClick={handleSubmit}
                disabled={saving}
              >
                <Send size={16} />
                {saving ? "Envoi..." : "Planifier la redistribution"}
              </button>
            </div>
          </div>

          {/* Historique */}
          <div className="redist__history-card">
            <h3 className="redist__section-title">
              Historique des redistributions
            </h3>

            <table className="page__table">
              <thead>
                <tr>
                  <th>Don</th>
                  <th>Daara</th>
                  <th>Montant</th>
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
                ) : redistributions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="page__table-empty">
                      Aucune redistribution planifiée.
                    </td>
                  </tr>
                ) : (
                  redistributions.map((r) => (
                    <tr key={r.id}>
                      <td>
                        #TV-{String(r.don?.id ?? r.don_id).padStart(4, "0")}
                      </td>
                      <td>{r.daara?.nom || `Daara #${r.daara_id}`}</td>
                      <td>{Number(r.montant).toLocaleString()} FCFA</td>
                      <td>
                        {new Date(r.date_redistribution).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td>
                        <span className={getStatutClass(r.statut)}>
                          {getStatutLabel(r.statut)}
                        </span>
                      </td>
                      <td>
                        {r.statut === "planifie" && (
                          <button
                            className="page__action-btn page__action-btn--validate"
                            title="Valider"
                            onClick={() => handleValider(r.id)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default RedistributionsPage;
