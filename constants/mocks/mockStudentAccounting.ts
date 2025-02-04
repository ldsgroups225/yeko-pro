interface Student {
  id: string
  photo?: string
  fullName: string
  matriculation: string
  financialInfo: {
    totalTuition: number
    remainingBalance: number
    installmentAmount: number
    lastPayment?: {
      date: Date
      amount: number
      method: string
    }
  }
}

// Mock function for development - replace with actual API call
export async function mockFetchStudent(matriculation: string): Promise<Student> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const randomData = [
    {
      id: '1',
      fullName: 'John Doe',
      matriculation: 'MAT2023001',
      financialInfo: {
        totalTuition: 5000,
        remainingBalance: 2500,
        installmentAmount: 500,
        lastPayment: {
          date: new Date(),
          amount: 500,
          method: 'CASH',
        },
      },
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      matriculation: 'MAT2023002',
      financialInfo: {
        totalTuition: 6000,
        remainingBalance: 1500,
        installmentAmount: 750,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 15)), // 15 days ago
          amount: 750,
          method: 'CARD',
        },
      },
    },
    {
      id: '3',
      fullName: 'Robert Williams',
      matriculation: 'MAT2023003',
      financialInfo: {
        totalTuition: 4500,
        remainingBalance: 4500,
        installmentAmount: 450,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
          amount: 0, // No payment yet
          method: 'NONE', // Or perhaps 'PENDING' if you want to represent no payment
        },
      },
    },
    {
      id: '4',
      fullName: 'Emily Johnson',
      matriculation: 'MAT2023004',
      financialInfo: {
        totalTuition: 7000,
        remainingBalance: 0,
        installmentAmount: 700,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
          amount: 700,
          method: 'BANK_TRANSFER',
        },
      },
    },
    {
      id: '5',
      fullName: 'Michael Brown',
      matriculation: 'MAT2023005',
      financialInfo: {
        totalTuition: 5500,
        remainingBalance: 3000,
        installmentAmount: 600,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 45)), // 45 days ago
          amount: 600,
          method: 'CHECK',
        },
      },
    },
    {
      id: '6',
      fullName: 'Jessica Davis',
      matriculation: 'MAT2023006',
      financialInfo: {
        totalTuition: 8000,
        remainingBalance: 6000,
        installmentAmount: 800,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 60)), // 60 days ago
          amount: 800,
          method: 'CASH',
        },
      },
    },
    {
      id: '7',
      fullName: 'Christopher Wilson',
      matriculation: 'MAT2023007',
      financialInfo: {
        totalTuition: 4000,
        remainingBalance: 1000,
        installmentAmount: 400,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 90)), // 90 days ago
          amount: 400,
          method: 'CARD',
        },
      },
    },
    {
      id: '8',
      fullName: 'Ashley Garcia',
      matriculation: 'MAT2023008',
      financialInfo: {
        totalTuition: 6500,
        remainingBalance: 3500,
        installmentAmount: 650,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 120)), // 120 days ago
          amount: 650,
          method: 'BANK_TRANSFER',
        },
      },
    },
    {
      id: '9',
      fullName: 'Matthew Rodriguez',
      matriculation: 'MAT2023009',
      financialInfo: {
        totalTuition: 9000,
        remainingBalance: 7000,
        installmentAmount: 900,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 180)), // 180 days ago
          amount: 900,
          method: 'CHECK',
        },
      },
    },
    {
      id: '10',
      fullName: 'Brittany Martinez',
      matriculation: 'MAT2023010',
      financialInfo: {
        totalTuition: 5200,
        remainingBalance: 2200,
        installmentAmount: 520,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 200)), // 200 days ago
          amount: 520,
          method: 'CASH',
        },
      },
    },
    {
      id: '11',
      fullName: 'Kevin Anderson',
      matriculation: 'MAT2023011',
      financialInfo: {
        totalTuition: 7800,
        remainingBalance: 4800,
        installmentAmount: 780,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 250)), // 250 days ago
          amount: 780,
          method: 'CARD',
        },
      },
    },
    {
      id: '12',
      fullName: 'Laura Thomas',
      matriculation: 'MAT2023012',
      financialInfo: {
        totalTuition: 4800,
        remainingBalance: 1800,
        installmentAmount: 480,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 300)), // 300 days ago
          amount: 480,
          method: 'BANK_TRANSFER',
        },
      },
    },
    {
      id: '13',
      fullName: 'Brandon Jackson',
      matriculation: 'MAT2023013',
      financialInfo: {
        totalTuition: 6200,
        remainingBalance: 3200,
        installmentAmount: 620,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 365)), // 365 days ago
          amount: 620,
          method: 'CHECK',
        },
      },
    },
    {
      id: '14',
      fullName: 'Olivia White',
      matriculation: 'MAT2023014',
      financialInfo: {
        totalTuition: 5800,
        remainingBalance: 2800,
        installmentAmount: 580,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 400)), // 400 days ago
          amount: 580,
          method: 'CASH',
        },
      },
    },
    {
      id: '15',
      fullName: 'Tyler Harris',
      matriculation: 'MAT2023015',
      financialInfo: {
        totalTuition: 7200,
        remainingBalance: 4200,
        installmentAmount: 720,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 450)), // 450 days ago
          amount: 720,
          method: 'CARD',
        },
      },
    },
    {
      id: '16',
      fullName: 'Madison Martin',
      matriculation: 'MAT2023016',
      financialInfo: {
        totalTuition: 4200,
        remainingBalance: 1200,
        installmentAmount: 420,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 500)), // 500 days ago
          amount: 420,
          method: 'BANK_TRANSFER',
        },
      },
    },
    {
      id: '17',
      fullName: 'Ryan Thompson',
      matriculation: 'MAT2023017',
      financialInfo: {
        totalTuition: 6800,
        remainingBalance: 3800,
        installmentAmount: 680,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 550)), // 550 days ago
          amount: 680,
          method: 'CHECK',
        },
      },
    },
    {
      id: '18',
      fullName: 'Samantha Perez',
      matriculation: 'MAT2023018',
      financialInfo: {
        totalTuition: 5300,
        remainingBalance: 2300,
        installmentAmount: 530,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 600)), // 600 days ago
          amount: 530,
          method: 'CASH',
        },
      },
    },
    {
      id: '19',
      fullName: 'Nicholas Hall',
      matriculation: 'MAT2023019',
      financialInfo: {
        totalTuition: 7500,
        remainingBalance: 4500,
        installmentAmount: 750,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 650)), // 650 days ago
          amount: 750,
          method: 'CARD',
        },
      },
    },
    {
      id: '20',
      fullName: 'Elizabeth Allen',
      matriculation: 'MAT2023020',
      financialInfo: {
        totalTuition: 4700,
        remainingBalance: 1700,
        installmentAmount: 470,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 700)), // 700 days ago
          amount: 470,
          method: 'BANK_TRANSFER',
        },
      },
    },
    {
      id: '21',
      fullName: 'Dylan Young',
      matriculation: 'MAT2023021',
      financialInfo: {
        totalTuition: 6300,
        remainingBalance: 3300,
        installmentAmount: 630,
        lastPayment: {
          date: new Date(new Date().setDate(new Date().getDate() - 750)), // 750 days ago
          amount: 630,
          method: 'CHECK',
        },
      },
    },
  ]

  const studentData = randomData.find(student => student.matriculation === matriculation)

  if (studentData) {
    return studentData
  }
  else {
    // Handle case where matriculation is not found in dummy data
    return {
      id: '-1', // Or some error ID
      fullName: 'Student Not Found',
      matriculation,
      financialInfo: {
        totalTuition: 0,
        remainingBalance: 0,
        installmentAmount: 0,
        lastPayment: {
          date: new Date(0), // Epoch date
          amount: 0,
          method: 'NONE',
        },
      },
    }
  }
}
