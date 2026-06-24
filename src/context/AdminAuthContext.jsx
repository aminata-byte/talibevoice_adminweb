import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    const token = localStorage.getItem("admin_token");
    if (stored && token) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        localStorage.removeItem("admin");
        localStorage.removeItem("admin_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Identifiants incorrects.",
        };
      }

      if (data.user.role !== "admin") {
        return {
          success: false,
          message: "Accès réservé aux administrateurs.",
        };
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.user));
      setAdmin(data.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: "Erreur de connexion. Vérifiez que le serveur est démarré.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("admin_token");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        setAdmin,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth doit être utilisé dans AdminAuthProvider");
  }
  return context;
}

export default AdminAuthContext;
