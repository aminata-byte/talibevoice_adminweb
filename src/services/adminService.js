import api from "./api";

const adminService = {
  // Dashboard stats
  getStats: async () => {
    const response = await api.get("/stats");
    return response.data;
  },

  // Daaras
  getDaaras: async (params = {}) => {
    const response = await api.get("/admin/daaras", { params });
    return response.data;
  },
  getDaara: async (id) => {
    const response = await api.get(`/admin/daaras/${id}`);
    return response.data;
  },
  createDaara: async (data) => {
    const response = await api.post("/admin/daaras", data);
    return response.data;
  },
  updateDaara: async (id, data) => {
    const response = await api.put(`/admin/daaras/${id}`, data);
    return response.data;
  },
  deleteDaara: async (id) => {
    const response = await api.delete(`/admin/daaras/${id}`);
    return response.data;
  },
  validerDaara: async (id) => {
    const response = await api.post(`/admin/daaras/${id}/valider`);
    return response.data;
  },

  // Talibés
  getTalibes: async (params = {}) => {
    const response = await api.get("/admin/talibes", { params });
    return response.data;
  },
  getTalibe: async (id) => {
    const response = await api.get(`/admin/talibes/${id}`);
    return response.data;
  },
  deleteTalibe: async (id) => {
    const response = await api.delete(`/admin/talibes/${id}`);
    return response.data;
  },

  // Dons
  getDons: async (params = {}) => {
    const response = await api.get("/admin/dons", { params });
    return response.data;
  },
  getDon: async (id) => {
    const response = await api.get(`/admin/dons/${id}`);
    return response.data;
  },
  validerDon: async (id) => {
    const response = await api.post(`/admin/dons/${id}/valider`);
    return response.data;
  },
  rejeterDon: async (id) => {
    const response = await api.post(`/admin/dons/${id}/rejeter`);
    return response.data;
  },
  getDonsStats: async () => {
    const response = await api.get("/admin/dons/stats");
    return response.data;
  },

  // Partenaires
  getPartenaires: async (params = {}) => {
    const response = await api.get("/admin/partenaires", { params });
    return response.data;
  },

  // Formations
  getFormations: async (params = {}) => {
    const response = await api.get("/admin/formations", { params });
    return response.data;
  },
  validerFormation: async (id) => {
    const response = await api.post(`/admin/formations/${id}/valider`);
    return response.data;
  },
  activerFormation: async (id) => {
    const response = await api.post(`/admin/formations/${id}/activer`);
    return response.data;
  },
  inscrireTalibe: async (formationId, talibeId) => {
    const response = await api.post(
      `/admin/formations/${formationId}/inscrire-talibe`,
      { talibe_id: talibeId },
    );
    return response.data;
  },

  // Agents
  getAgents: async () => {
    const response = await api.get("/admin/utilisateurs");
    return response.data;
  },
  createAgent: async (data) => {
    const response = await api.post("/admin/utilisateurs", data);
    return response.data;
  },
  updateAgent: async (id, data) => {
    const response = await api.put(`/admin/utilisateurs/${id}`, data);
    return response.data;
  },
  bloquerAgent: async (id) => {
    const response = await api.post(`/admin/utilisateurs/${id}/bloquer`);
    return response.data;
  },
  debloquerAgent: async (id) => {
    const response = await api.post(`/admin/utilisateurs/${id}/debloquer`);
    return response.data;
  },

  // Rapports
  getRapports: async (params = {}) => {
    const response = await api.get("/admin/rapports", { params });
    return response.data;
  },
  validerRapport: async (id) => {
    const response = await api.post(`/admin/rapports/${id}/valider`);
    return response.data;
  },

  // Redistributions
  getRedistributions: async () => {
    const response = await api.get("/admin/redistributions");
    return response.data;
  },
  createRedistribution: async (data) => {
    const response = await api.post("/admin/redistributions", data);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
  },
  sendNotification: async (data) => {
    const response = await api.post("/admin/notifications", data);
    return response.data;
  },

  // Besoins
  getBesoins: async (params = {}) => {
    const response = await api.get("/admin/besoins", { params });
    return response.data;
  },

  // Insertions
  getInsertions: async (params = {}) => {
    const response = await api.get("/admin/insertions", { params });
    return response.data;
  },

  activerDaara: async (id) => {
    const response = await api.post(`/admin/daaras/${id}/activer`);
    return response.data;
  },
  desactiverDaara: async (id) => {
    const response = await api.post(`/admin/daaras/${id}/desactiver`);
    return response.data;
  },
};

export default adminService;
