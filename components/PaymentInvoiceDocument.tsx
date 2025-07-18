import type { IPaymentInvoice } from '@/types/invoice'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import { PAYMENT_METHOD_OPTIONS_MAP } from '@/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    position: 'relative',
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#112131',
    paddingBottom: 10,
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  schoolInfo: {
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  totalValue: {
    fontSize: 12,
    textAlign: 'right',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 10,
    textAlign: 'center',
    color: '#888',
  },
})

export function PaymentInvoiceDocument({ invoice }: { invoice: IPaymentInvoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fixed Header */}
        <View style={styles.header} fixed>
          {invoice.school?.image && <Image src={invoice.school.image} style={styles.logo} />}
          <View style={styles.schoolInfo}>
            <Text style={styles.title}>
              {invoice.school?.name || 'Non renseigné'}
            </Text>
            <Text style={styles.subtitle}>
              Code:
              {' '}
              {invoice.school?.code || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Student Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'élève</Text>
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

        {/* Payment History Table Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des paiements</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Référence</Text>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Montant</Text>
              <Text style={styles.tableCell}>Méthode</Text>
            </View>
            {invoice.history?.map((payment, index) => (
              <View
                key={payment.reference}
                style={[
                  styles.tableRow,
                  { backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' },
                ]}
              >
                <Text style={styles.tableCell}>
                  {payment.reference || 'N/A'}
                </Text>
                <Text style={styles.tableCell}>
                  {formatDate(payment.paidAt)}
                </Text>
                <Text style={styles.tableCell}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Text style={styles.tableCell}>
                  {PAYMENT_METHOD_OPTIONS_MAP[payment.method]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Summary Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Scolarité:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.paymentPlan.totalAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Payé:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.paymentPlan.amountPaid)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: 'red' }]}>
              Reste à payer:
            </Text>
            <Text style={[styles.totalValue, { color: 'red' }]}>
              {formatCurrency(
                invoice.paymentPlan.totalAmount - invoice.paymentPlan.amountPaid,
              )}
            </Text>
          </View>
        </View>

        {/* Fixed Footer with Page Numbers */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
