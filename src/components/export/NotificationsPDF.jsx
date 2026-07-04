import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #1B7D4B",
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1B7D4B" },
  headerSub: { fontSize: 10, color: "#64748B", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    padding: 10,
    border: "1px solid #BBF7D0",
  },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#1B7D4B" },
  statLabel: { fontSize: 9, color: "#64748B", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1B7D4B",
    padding: "8 10",
    borderRadius: "4 4 0 0",
  },
  tableHeaderText: { fontSize: 9, color: "#ffffff", fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    padding: "7 10",
    borderBottom: "1px solid #E5E5E5",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "7 10",
    borderBottom: "1px solid #E5E5E5",
    backgroundColor: "#F8FAFC",
  },
  tableCell: { fontSize: 9, color: "#2D3748" },
  colType: { width: "20%" },
  colMessage: { width: "35%" },
  colDestinataire: { width: "20%" },
  colDate: { width: "15%" },
  colStatut: { width: "10%" },
  badge: { fontSize: 8, padding: "2 5", borderRadius: 4 },
  badgeGreen: { backgroundColor: "#DCFCE7", color: "#166534" },
  badgeYellow: { backgroundColor: "#FEF9C3", color: "#854D0E" },
  badgeRed: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  badgeGray: { backgroundColor: "#F1F5F9", color: "#475569" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #E5E5E5",
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: "#94A3B8" },
});

function NotificationsPDF({ notifications }) {
  const dateExport = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const lues = notifications.filter((n) => n.est_lue).length;
  const nonLues = notifications.filter((n) => !n.est_lue).length;
  const tauxLecture =
    notifications.length > 0
      ? Math.round((lues / notifications.length) * 100)
      : 0;

  const getTypeLabel = (type) => {
    const labels = {
      besoin_urgent: "Besoin urgent",
      offre_validee: "Offre validée",
      don_valide: "Don validé",
      redistribution: "Redistribution",
      insertion_talibe: "Insertion talibé",
      mission_assignee: "Mission assignée",
    };
    return labels[type] || type;
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            TalibeVoice — Historique des Notifications
          </Text>
          <Text style={styles.headerSub}>
            Exporté le {dateExport} · {notifications.length} notification(s) au
            total
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total envoyées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{lues}</Text>
            <Text style={styles.statLabel}>Lues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{nonLues}</Text>
            <Text style={styles.statLabel}>Non lues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tauxLecture}%</Text>
            <Text style={styles.statLabel}>Taux de lecture</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colType]}>TYPE</Text>
          <Text style={[styles.tableHeaderText, styles.colMessage]}>
            MESSAGE
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDestinataire]}>
            DESTINATAIRE
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>DATE</Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>STATUT</Text>
        </View>

        {notifications.map((notif, index) => (
          <View
            key={notif.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCell, styles.colType]}>
              {getTypeLabel(notif.type)}
            </Text>
            <Text style={[styles.tableCell, styles.colMessage]}>
              {notif.message || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colDestinataire]}>
              {notif.destinataire_type === "agent" ? "Agent" : "Partenaire"} #
              {notif.destinataire_id || "Tous"}
            </Text>
            <Text style={[styles.tableCell, styles.colDate]}>
              {new Date(notif.created_at).toLocaleDateString("fr-FR")}
            </Text>
            <View style={styles.colStatut}>
              <Text
                style={[
                  styles.badge,
                  notif.est_lue ? styles.badgeGreen : styles.badgeYellow,
                ]}
              >
                {notif.est_lue ? "Lu" : "Non lu"}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TalibeVoice — Plateforme de gestion des talibés et daaras au Sénégal
          </Text>
          <Text style={styles.footerText}>{dateExport}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default NotificationsPDF;
