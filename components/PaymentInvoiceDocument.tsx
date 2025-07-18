import type { IPaymentInvoice } from '@/types/invoice'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { PAYMENT_METHOD_FROM_STRING_OPTIONS_MAP_LABEL } from '@/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#000000',
  },

  // Header compact
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 15,
  },
  logo: {
    width: 40,
    height: 40,
  },
  schoolInfo: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    color: '#333333',
    marginBottom: 1,
  },
  invoiceTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // Sections compactes
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  sectionHeader: {
    backgroundColor: '#000000',
    padding: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  sectionContent: {
    padding: 8,
  },

  // Lignes de texte compactes
  textRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'center',
  },
  label: {
    width: 70,
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 8,
  },
  value: {
    flex: 1,
    color: '#000000',
    fontSize: 8,
    paddingLeft: 8,
  },

  // Table compacte
  table: {
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    padding: 4,
  },
  tableHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    minHeight: 20,
  },
  tableRowEven: {
    backgroundColor: '#f5f5f5',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    color: '#000000',
    paddingHorizontal: 2,
  },

  // Badge méthode de paiement
  paymentMethodText: {
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Section totaux compacte
  totalSection: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 8,
  },
  totalSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingVertical: 2,
  },
  totalRowHighlight: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    marginHorizontal: -4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 9,
    textAlign: 'right',
    color: '#000000',
    fontWeight: 'bold',
  },
  totalValueHighlight: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Footer compact
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    fontSize: 7,
    textAlign: 'center',
    color: '#666666',
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc',
    paddingTop: 4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 4,
  },

  // Info compact
  infoBox: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 4,
    marginVertical: 4,
  },
  infoText: {
    fontSize: 7,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

export function PaymentInvoiceDocument({ invoice }: { invoice: IPaymentInvoice }) {
  const remainingAmount = invoice.paymentPlan.totalAmount - invoice.paymentPlan.amountPaid
  const paymentProgress = (invoice.paymentPlan.amountPaid / invoice.paymentPlan.totalAmount) * 100

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header compact */}
        <View style={styles.header} fixed>
          {invoice.school?.image && (
            <Image src={invoice.school.image} style={styles.logo} />
          )}
          <View style={styles.schoolInfo}>
            <Text style={styles.title}>
              {invoice.school?.name || 'Non renseigné'}
            </Text>
            <Text style={styles.subtitle}>
              Code:
              {' '}
              {invoice.school?.code || 'N/A'}
            </Text>
            <Text style={styles.invoiceTitle}>Facture de Paiement</Text>
          </View>
        </View>

        {/* Section élève */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Élève</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.textRow}>
              <Text style={styles.label}>Matricule:</Text>
              <Text style={styles.value}>{invoice.student?.idNumber || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>{invoice.student?.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Parent:</Text>
              <Text style={styles.value}>{invoice.student?.parentName || 'N/A'}</Text>
            </View>
            <View style={styles.textRow}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{invoice.student?.parentPhoneNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Progression */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Progression:
            {' '}
            {paymentProgress.toFixed(1)}
            % payé
          </Text>
        </View>

        {/* Table des paiements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historique Paiements</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Référence</Text>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Montant</Text>
                <Text style={styles.tableHeaderCell}>Méthode</Text>
              </View>
              {invoice.history?.slice(0, 8).map((payment, index) => (
                <View
                  key={payment.reference}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {payment.reference.length > 10
                      ? `${payment.reference.slice(0, 10)}...`
                      : payment.reference || 'N/A'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatDate(payment.paidAt)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={[styles.tableCell, styles.paymentMethodText]}>
                    {PAYMENT_METHOD_FROM_STRING_OPTIONS_MAP_LABEL[payment.method]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Section totaux */}
        <View style={styles.totalSection}>
          <Text style={styles.totalSectionTitle}>Résumé</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Scolarité totale:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.paymentPlan.totalAmount)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Montant payé:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.paymentPlan.amountPaid)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.totalRow, styles.totalRowHighlight]}>
            <Text style={[styles.totalLabel, { fontSize: 10 }]}>
              Reste à payer:
            </Text>
            <Text style={[styles.totalValue, styles.totalValueHighlight]}>
              {formatCurrency(remainingAmount)}
            </Text>
          </View>

          {remainingAmount === 0 && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ✓ PAIEMENT COMPLET
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Facture générée le ${formatDate(new Date())} | Page ${pageNumber}/${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
