export interface IInvoiceSchool {
  image?: string
  name: string
  code: string
}

export interface IInvoiceStudent {
  idNumber: string
  fullName: string
  parentName: string
  parentPhoneNumber: string
}

export interface IInvoicePaymentPlan {
  totalAmount: number
  amountPaid: number
}

export interface IInvoicePaymentHistory {
  amount: number
  method: 'cash' | 'bank_transfer' | 'mobile_money'
  paidAt: string
  reference: string
}

export interface IPaymentInvoice {
  school: IInvoiceSchool
  student: IInvoiceStudent
  paymentPlan: IInvoicePaymentPlan
  history: IInvoicePaymentHistory[]
}
