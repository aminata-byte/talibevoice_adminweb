import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total_talibes: "—",
    total_daaras: "—",
    total_agents: "—",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/stats");
      const data = await response.json();
      setStats({
        total_talibes: data.total_talibes?.toLocaleString() || "0",
        total_daaras: data.total_daaras?.toLocaleString() || "0",
        total_agents: data.total_agents?.toLocaleString() || "0",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login">
      {/* Panneau gauche */}
      <div className="login__left">
        <div className="login__left-content">
          <div className="login__brand">
            <div className="login__brand-logo">
              <img src="/src/assets/logo.jpg" alt="TalibeVoice" />
            </div>
            <h1 className="login__brand-name">TalibeVoice</h1>
            <span className="login__brand-badge">Administration</span>
          </div>

          <p className="login__brand-desc">
            Plateforme de gestion des talibés et daaras au Sénégal
          </p>

          <div className="login__stats">
            <div className="login__stat">
              <span className="login__stat-number">{stats.total_talibes}</span>
              <span className="login__stat-label">TALIBÉS</span>
            </div>
            <div className="login__stat">
              <span className="login__stat-number">{stats.total_daaras}</span>
              <span className="login__stat-label">DAARAS</span>
            </div>
            <div className="login__stat">
              <span className="login__stat-number">{stats.total_agents}</span>
              <span className="login__stat-label">AGENTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="login__right">
        <div className="login__form-container">
          <div className="login__form-header">
            <h2 className="login__form-title">Connexion</h2>
            <p className="login__form-subtitle">
              Accès réservé aux administrateurs
            </p>
          </div>

          <div className="login__form">
            <div className="login__form-group">
              <label className="login__label">Adresse email</label>
              <div className="login__input-wrapper">
                <Mail size={16} className="login__input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@talibevoice.sn"
                  value={form.email}
                  onChange={handleForm}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="login__input"
                />
              </div>
            </div>

            <div className="login__form-group">
              <label className="login__label">Mot de passe</label>
              <div className="login__input-wrapper">
                <Lock size={16} className="login__input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleForm}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="login__input"
                />
                <button
                  className="login__eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login__options">
              <label className="login__remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            {error && <p className="login__error">{error}</p>}

            <button
              className="login__btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              <ShieldCheck size={18} />
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>

          <div className="login__form-footer">
            <p>Accès sécurisé — TalibeVoice v1.0</p>
            <div className="login__form-footer-links">
              <a href="#">CONDITIONS</a>
              <a href="#">SÉCURITÉ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
