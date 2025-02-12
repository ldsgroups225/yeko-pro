import type { IPaymentInvoice } from '@/types/invoice'
import {
  renderToStream,
} from '@react-pdf/renderer'
import { PaymentInvoiceDocument } from './PaymentInvoiceDocument'

export async function pdfStream(invoice: IPaymentInvoice) {
  return await renderToStream(<PaymentInvoiceDocument invoice={invoice} />)
}
