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
  colTitre: { width: "28%" },
  colAgent: { width: "18%" },
  colDaara: { width: "18%" },
  colType: { width: "14%" },
  colDate: { width: "12%" },
  colStatut: { width: "10%" },
  badge: { fontSize: 8, padding: "2 5", borderRadius: 4 },
  badgeGreen: { backgroundColor: "#DCFCE7", color: "#166534" },
  badgeYellow: { backgroundColor: "#FEF9C3", color: "#854D0E" },
  badgeBlue: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
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

function RapportsPDF({ rapports }) {
  const dateExport = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const valides = rapports.filter((r) => r.statut === "valide").length;
  const enAttente = rapports.filter((r) => r.statut === "soumis").length;
  const conformite =
    rapports.length > 0 ? Math.round((valides / rapports.length) * 100) : 0;

  const getTypeLabel = (type) => {
    if (type === "recensement") return "Recensement";
    if (type === "suivi") return "Suivi";
    if (type === "distribution") return "Distribution";
    return "Autre";
  };

  const getTypeStyle = (type) => {
    if (type === "recensement") return styles.badgeBlue;
    if (type === "suivi") return styles.badgeGreen;
    if (type === "distribution") return styles.badgeYellow;
    return styles.badgeGray;
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            TalibeVoice — Rapport Global des Activités
          </Text>
          <Text style={styles.headerSub}>
            Exporté le {dateExport} · {rapports.length} rapport(s) au total
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{rapports.length}</Text>
            <Text style={styles.statLabel}>Total rapports</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{enAttente}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{valides}</Text>
            <Text style={styles.statLabel}>Validés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{conformite}%</Text>
            <Text style={styles.statLabel}>Taux de conformité</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colTitre]}>TITRE</Text>
          <Text style={[styles.tableHeaderText, styles.colAgent]}>AGENT</Text>
          <Text style={[styles.tableHeaderText, styles.colDaara]}>DAARA</Text>
          <Text style={[styles.tableHeaderText, styles.colType]}>TYPE</Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>DATE</Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>STATUT</Text>
        </View>

        {rapports.map((r, index) => (
          <View
            key={r.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCell, styles.colTitre]}>
              {r.titre || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colAgent]}>
              {r.agent?.name || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colDaara]}>
              {r.daara?.nom || "—"}
            </Text>
            <View style={styles.colType}>
              <Text style={[styles.badge, getTypeStyle(r.type)]}>
                {getTypeLabel(r.type)}
              </Text>
            </View>
            <Text style={[styles.tableCell, styles.colDate]}>
              {r.date_creation
                ? new Date(r.date_creation).toLocaleDateString("fr-FR")
                : "—"}
            </Text>
            <View style={styles.colStatut}>
              <Text
                style={[
                  styles.badge,
                  r.statut === "valide"
                    ? styles.badgeGreen
                    : styles.badgeYellow,
                ]}
              >
                {r.statut === "valide" ? "Validé" : "Attente"}
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

export default RapportsPDF;

