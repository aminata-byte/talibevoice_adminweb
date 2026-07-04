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
  statValue: { fontSize: 16, fontWeight: "bold", color: "#1B7D4B" },
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
  colId: { width: "10%" },
  colDonateur: { width: "22%" },
  colMontant: { width: "18%" },
  colType: { width: "12%" },
  colDate: { width: "18%" },
  colStatut: { width: "20%" },
  badge: { fontSize: 8, padding: "2 5", borderRadius: 4 },
  badgeGreen: { backgroundColor: "#DCFCE7", color: "#166534" },
  badgeYellow: { backgroundColor: "#FEF9C3", color: "#854D0E" },
  badgeRed: { backgroundColor: "#FEE2E2", color: "#991B1B" },
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

const formatMontant = (montant) => {
  if (!montant) return "Don matériel";
  if (montant >= 1000000) return `${(montant / 1000000).toFixed(1)}M FCFA`;
  if (montant >= 1000) return `${(montant / 1000).toFixed(0)}K FCFA`;
  return `${Number(montant).toLocaleString()} FCFA`;
};

function DonsPDF({ dons }) {
  const dateExport = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const donsFinanciers = dons.filter((d) => d.type === "financier");
  const totalValide = donsFinanciers
    .filter((d) => d.statut === "valide")
    .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);
  const totalEnAttente = donsFinanciers
    .filter((d) => d.statut === "en_attente")
    .reduce((acc, d) => acc + (Number(d.montant) || 0), 0);

  const getDonateur = (don) => {
    if (don.donateur?.est_anonyme) return "Anonyme";
    return (
      `${don.donateur?.prenom || ""} ${don.donateur?.nom || ""}`.trim() ||
      "Inconnu"
    );
  };

  const getStatutStyle = (statut) => {
    if (statut === "valide") return styles.badgeGreen;
    if (statut === "en_attente") return styles.badgeYellow;
    return styles.badgeRed;
  };

  const getStatutLabel = (statut) => {
    if (statut === "valide") return "Validé";
    if (statut === "en_attente") return "En attente";
    return "Rejeté";
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TalibeVoice — Rapport des Dons</Text>
          <Text style={styles.headerSub}>
            Exporté le {dateExport} · {dons.length} don(s) au total
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dons.length}</Text>
            <Text style={styles.statLabel}>Total dons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMontant(totalValide)}</Text>
            <Text style={styles.statLabel}>Montant validé</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatMontant(totalEnAttente)}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dons.filter((d) => d.type === "materiel").length}
            </Text>
            <Text style={styles.statLabel}>Dons matériels</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colId]}>ID</Text>
          <Text style={[styles.tableHeaderText, styles.colDonateur]}>
            DONATEUR
          </Text>
          <Text style={[styles.tableHeaderText, styles.colMontant]}>
            MONTANT
          </Text>
          <Text style={[styles.tableHeaderText, styles.colType]}>TYPE</Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>DATE</Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>STATUT</Text>
        </View>

        {dons.map((don, index) => (
          <View
            key={don.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCell, styles.colId]}>
              #TV-{String(don.id).padStart(4, "0")}
            </Text>
            <Text style={[styles.tableCell, styles.colDonateur]}>
              {getDonateur(don)}
            </Text>
            <Text style={[styles.tableCell, styles.colMontant]}>
              {formatMontant(don.montant)}
            </Text>
            <Text style={[styles.tableCell, styles.colType]}>
              {don.type === "financier" ? "Financier" : "Matériel"}
            </Text>
            <Text style={[styles.tableCell, styles.colDate]}>
              {new Date(don.created_at).toLocaleDateString("fr-FR")}
            </Text>
            <View style={styles.colStatut}>
              <Text style={[styles.badge, getStatutStyle(don.statut)]}>
                {getStatutLabel(don.statut)}
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

export default DonsPDF;
