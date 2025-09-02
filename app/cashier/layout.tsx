'use client'

import type { StudentForPayment } from '@/types/accounting'
import { useState } from 'react'
import { UserProvider } from '@/providers/UserProvider'
import { CashierNavbar } from './_components/CashierNavbar'
import { NewPaymentModal } from './_components/NewPaymentModal'
import { StudentSearchModal } from './_components/StudentSearchModal'

interface Props {
  children: React.ReactNode
}

// Convert StudentSearchResult to StudentForPayment
function convertToStudentForPayment(student: StudentForPayment): StudentForPayment {
  return {
    id: student.id,
    photo: student.photo,
    fullName: student.fullName,
    matriculation: student.matriculation,
    financialInfo: {
      totalTuition: student.financialInfo.totalTuition,
      remainingBalance: student.financialInfo.remainingBalance,
      installmentAmount: Math.min(student.financialInfo.installmentAmount, 50000), // Default installment amount
      lastPayment: student.financialInfo.lastPayment
        ? {
            date: student.financialInfo.lastPayment.date,
            amount: student.financialInfo.lastPayment.amount,
            method: student.financialInfo.lastPayment.method,
          }
        : null,
    },
  }
}

export default function CashierLayout({ children }: Props) {
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  // const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentForPayment | undefined>()

  const handleSearchStudent = () => {
    setSearchModalOpen(true)
  }

  const handleNewPayment = () => {
    if (selectedStudent) {
      setPaymentModalOpen(true)
    }
    else {
      // If no student is selected, open search first
      setSearchModalOpen(true)
    }
  }

  const handleGenerateReport = () => {
    // setReportModalOpen(true)
  }

  const handleSelectStudent = (student: StudentForPayment) => {
    setSelectedStudent(student)
    // Optionally open payment modal after selecting a student
    setPaymentModalOpen(true)
  }

  return (
    <div className="bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] via-[hsl(var(--background))] text-foreground min-h-screen bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] via-[hsl(var(--background))] animate-gradient opacity-90"></div>
      <div className="relative z-10">
        <UserProvider>
          <div className="flex flex-col h-screen">
            {/* Navbar */}
            <CashierNavbar
              onNewPayment={handleNewPayment}
              onSearchStudent={handleSearchStudent}
              onGenerateReport={handleGenerateReport}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <div className="container mx-auto px-6 py-6">
                {children}
              </div>
            </main>
          </div>

          {/* Modals */}
          <StudentSearchModal
            open={searchModalOpen}
            onOpenChange={setSearchModalOpen}
            onSelectStudent={handleSelectStudent}
          />

          <NewPaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            selectedStudent={selectedStudent ? convertToStudentForPayment(selectedStudent) : undefined}
          />

          {/* <ReportModal
            open={reportModalOpen}
            onOpenChange={setReportModalOpen}
          /> */}
        </UserProvider>
      </div>
    </div>
  )
}
