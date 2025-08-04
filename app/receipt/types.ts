// app/receipt/types.ts

export interface ReceiptData {
  // Receipt Info
  receiptNumber: string
  receiptDate: string
  academicYear: string

  // School Info
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolCode: string

  // Student Info
  studentFullName: string
  studentIdNumber: string
  studentGender: string
  studentDateOfBirth: string
  studentAddress: string

  // Payment Info
  paymentAmount: number
  paymentMethod: string
  paymentDate: string
  paymentReference: string
  isStateAssigned: boolean

  // Grade/Class Info
  gradeName: string
  academicLevel: string

  // Additional Info
  paymentDescription: string
  footerText: string
  schoolLogo?: string
}
