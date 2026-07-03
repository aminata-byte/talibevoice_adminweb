import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #1B7D4B",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B7D4B",
  },
  headerSub: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    padding: 10,
    border: "1px solid #BBF7D0",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B7D4B",
  },
  statLabel: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1B7D4B",
    padding: "8 10",
    borderRadius: "4 4 0 0",
  },
  tableHeaderText: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "bold",
  },
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
  tableCell: {
    fontSize: 9,
    color: "#2D3748",
  },
  colNom: { width: "25%" },
  colRegion: { width: "15%" },
  colResponsable: { width: "22%" },
  colTelephone: { width: "18%" },
  colTalibes: { width: "10%" },
  colStatut: { width: "10%" },
  badge: {
    fontSize: 8,
    padding: "2 6",
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  badgeYellow: {
    backgroundColor: "#FEF9C3",
    color: "#854D0E",
  },
  badgeGray: {
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },
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
  footerText: {
    fontSize: 8,
    color: "#94A3B8",
  },
});

function DaarasPDF({ daaras }) {
  const actifs = daaras.filter((d) => d.statut === "actif").length;
  const enAttente = daaras.filter((d) => d.statut === "en_attente").length;
  const inactifs = daaras.filter((d) => d.statut === "inactif").length;
  const totalTalibes = daaras.reduce(
    (acc, d) => acc + (d.nombre_talibes || 0),
    0,
  );
  const dateExport = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getBadgeStyle = (statut) => {
    if (statut === "actif") return styles.badgeGreen;
    if (statut === "en_attente") return styles.badgeYellow;
    return styles.badgeGray;
  };

  const getStatutLabel = (statut) => {
    if (statut === "actif") return "Actif";
    if (statut === "en_attente") return "En attente";
    return "Inactif";
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            TalibeVoice — Rapport des Daaras
          </Text>
          <Text style={styles.headerSub}>
            Exporté le {dateExport} · {daaras.length} daara(s) au total
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daaras.length}</Text>
            <Text style={styles.statLabel}>Total Daaras</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{actifs}</Text>
            <Text style={styles.statLabel}>Actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{enAttente}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{inactifs}</Text>
            <Text style={styles.statLabel}>Inactifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalTalibes}</Text>
            <Text style={styles.statLabel}>Total Talibés</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNom]}>NOM</Text>
          <Text style={[styles.tableHeaderText, styles.colRegion]}>RÉGION</Text>
          <Text style={[styles.tableHeaderText, styles.colResponsable]}>
            RESPONSABLE
          </Text>
          <Text style={[styles.tableHeaderText, styles.colTelephone]}>
            TÉLÉPHONE
          </Text>
          <Text style={[styles.tableHeaderText, styles.colTalibes]}>
            TALIBÉS
          </Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>STATUT</Text>
        </View>

        {/* Table rows */}
        {daaras.map((daara, index) => (
          <View
            key={daara.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCell, styles.colNom]}>
              {daara.nom || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colRegion]}>
              {daara.region || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colResponsable]}>
              {daara.nom_responsable || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colTelephone]}>
              {daara.telephone_responsable || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colTalibes]}>
              {daara.nombre_talibes ?? 0}
            </Text>
            <View style={styles.colStatut}>
              <Text style={[styles.badge, getBadgeStyle(daara.statut)]}>
                {getStatutLabel(daara.statut)}
              </Text>
            </View>
          </View>
        ))}

        {/* Footer */}
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

export default DaarasPDF;
