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
  colNom: { width: "15%" },
  colPrenom: { width: "15%" },
  colAge: { width: "8%" },
  colDaara: { width: "20%" },
  colRegion: { width: "15%" },
  colEtatCivil: { width: "12%" },
  colStatut: { width: "15%" },
  badge: { fontSize: 8, padding: "2 5", borderRadius: 4 },
  badgeGreen: { backgroundColor: "#DCFCE7", color: "#166534" },
  badgeRed: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  badgeYellow: { backgroundColor: "#FEF9C3", color: "#854D0E" },
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

function TalibesPDF({ talibes }) {
  const majeurs = talibes.filter((t) => t.est_majeur).length;
  const avecEtatCivil = talibes.filter((t) => t.a_etat_civil).length;
  const dateExport = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const getAge = (dateNaissance) => {
    if (!dateNaissance) return "—";
    const naissance = new Date(dateNaissance);
    if (isNaN(naissance.getTime())) return "—";
    const aujourdHui = new Date();
    let age = aujourdHui.getFullYear() - naissance.getFullYear();
    const moisDiff = aujourdHui.getMonth() - naissance.getMonth();
    if (
      moisDiff < 0 ||
      (moisDiff === 0 && aujourdHui.getDate() < naissance.getDate())
    )
      age--;
    if (age < 0 || age > 120) return "—";
    return `${age} ans`;
  };

  const getInsertionLabel = (statut) => {
    if (statut === "insere") return "Inséré";
    if (statut === "en_cours") return "En cours";
    if (statut === "en_attente") return "En attente";
    return "Aucune";
  };

  const getInsertionStyle = (statut) => {
    if (statut === "insere") return styles.badgeGreen;
    if (statut === "en_cours") return styles.badgeYellow;
    return styles.badgeGray;
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            TalibeVoice — Rapport des Talibés
          </Text>
          <Text style={styles.headerSub}>
            Exporté le {dateExport} · {talibes.length} talibé(s) au total
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{talibes.length}</Text>
            <Text style={styles.statLabel}>Total Talibés</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{majeurs}</Text>
            <Text style={styles.statLabel}>Majeurs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{talibes.length - majeurs}</Text>
            <Text style={styles.statLabel}>Mineurs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avecEtatCivil}</Text>
            <Text style={styles.statLabel}>Avec état civil</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNom]}>NOM</Text>
          <Text style={[styles.tableHeaderText, styles.colPrenom]}>PRÉNOM</Text>
          <Text style={[styles.tableHeaderText, styles.colAge]}>ÂGE</Text>
          <Text style={[styles.tableHeaderText, styles.colDaara]}>DAARA</Text>
          <Text style={[styles.tableHeaderText, styles.colRegion]}>RÉGION</Text>
          <Text style={[styles.tableHeaderText, styles.colEtatCivil]}>
            ÉTAT CIVIL
          </Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>
            INSERTION
          </Text>
        </View>

        {talibes.map((t, index) => (
          <View
            key={t.id}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCell, styles.colNom]}>
              {t.nom || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colPrenom]}>
              {t.prenom || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colAge]}>
              {getAge(t.date_naissance)}
            </Text>
            <Text style={[styles.tableCell, styles.colDaara]}>
              {t.daara?.nom || "—"}
            </Text>
            <Text style={[styles.tableCell, styles.colRegion]}>
              {t.daara?.region || "—"}
            </Text>
            <View style={styles.colEtatCivil}>
              <Text
                style={[
                  styles.badge,
                  t.a_etat_civil ? styles.badgeGreen : styles.badgeRed,
                ]}
              >
                {t.a_etat_civil ? "OUI" : "NON"}
              </Text>
            </View>
            <View style={styles.colStatut}>
              <Text
                style={[styles.badge, getInsertionStyle(t.statut_insertion)]}
              >
                {getInsertionLabel(t.statut_insertion)}
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

export default TalibesPDF;
