interface Transaction {
  id: string
  studentName: string
  matriculation: string
  paymentDate: Date
  amount: number
  remainingBalance: number
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    studentName: 'John Doe',
    matriculation: 'MAT2023001',
    paymentDate: new Date(),
    amount: 500,
    remainingBalance: 2000,
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    matriculation: 'MAT2023002',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 3)), // 3 days ago
    amount: 750,
    remainingBalance: 750,
  },
  {
    id: '3',
    studentName: 'Robert Williams',
    matriculation: 'MAT2023003',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
    amount: 450,
    remainingBalance: 4050,
  },
  {
    id: '4',
    studentName: 'Emily Johnson',
    matriculation: 'MAT2023004',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
    amount: 700,
    remainingBalance: -700, // Overpaid example
  },
  {
    id: '5',
    studentName: 'Michael Brown',
    matriculation: 'MAT2023005',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 20)), // 20 days ago
    amount: 600,
    remainingBalance: 2400,
  },
  {
    id: '6',
    studentName: 'Jessica Davis',
    matriculation: 'MAT2023006',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 15)), // 15 days ago
    amount: 800,
    remainingBalance: 5200,
  },
  {
    id: '7',
    studentName: 'Christopher Wilson',
    matriculation: 'MAT2023007',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
    amount: 400,
    remainingBalance: 600,
  },
  {
    id: '8',
    studentName: 'Ashley Garcia',
    matriculation: 'MAT2023008',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 25)), // 25 days ago
    amount: 650,
    remainingBalance: 2850,
  },
  {
    id: '9',
    studentName: 'Matthew Rodriguez',
    matriculation: 'MAT2023009',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 40)), // 40 days ago
    amount: 900,
    remainingBalance: 6100,
  },
  {
    id: '10',
    studentName: 'Brittany Martinez',
    matriculation: 'MAT2023010',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 35)), // 35 days ago
    amount: 520,
    remainingBalance: 1680,
  },
  {
    id: '11',
    studentName: 'Kevin Anderson',
    matriculation: 'MAT2023011',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 50)), // 50 days ago
    amount: 780,
    remainingBalance: 4020,
  },
  {
    id: '12',
    studentName: 'Laura Thomas',
    matriculation: 'MAT2023012',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 45)), // 45 days ago
    amount: 480,
    remainingBalance: 1320,
  },
  {
    id: '13',
    studentName: 'Brandon Jackson',
    matriculation: 'MAT2023013',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 60)), // 60 days ago
    amount: 620,
    remainingBalance: 2580,
  },
  {
    id: '14',
    studentName: 'Olivia White',
    matriculation: 'MAT2023014',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 55)), // 55 days ago
    amount: 580,
    remainingBalance: 2220,
  },
  {
    id: '15',
    studentName: 'Tyler Harris',
    matriculation: 'MAT2023015',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 70)), // 70 days ago
    amount: 720,
    remainingBalance: 3480,
  },
  {
    id: '16',
    studentName: 'Madison Martin',
    matriculation: 'MAT2023016',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 65)), // 65 days ago
    amount: 420,
    remainingBalance: 780,
  },
  {
    id: '17',
    studentName: 'Ryan Thompson',
    matriculation: 'MAT2023017',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 80)), // 80 days ago
    amount: 680,
    remainingBalance: 3120,
  },
  {
    id: '18',
    studentName: 'Samantha Perez',
    matriculation: 'MAT2023018',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 75)), // 75 days ago
    amount: 530,
    remainingBalance: 1770,
  },
  {
    id: '19',
    studentName: 'Nicholas Hall',
    matriculation: 'MAT2023019',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 90)), // 90 days ago
    amount: 750,
    remainingBalance: 3750,
  },
  {
    id: '20',
    studentName: 'Elizabeth Allen',
    matriculation: 'MAT2023020',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 85)), // 85 days ago
    amount: 470,
    remainingBalance: 1230,
  },
  {
    id: '21',
    studentName: 'Dylan Young',
    matriculation: 'MAT2023021',
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 100)), // 100 days ago
    amount: 630,
    remainingBalance: 2670,
  },
  {
    id: '22',
    studentName: 'John Doe', // Reusing name for variety
    matriculation: 'MAT2023001', // Reusing matriculation for variety
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 120)),
    amount: 500,
    remainingBalance: 1500, // Balance after second payment
  },
  {
    id: '23',
    studentName: 'Jane Smith', // Reusing name for variety
    matriculation: 'MAT2023002', // Reusing matriculation for variety
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 110)),
    amount: 750,
    remainingBalance: 0, // Fully paid after second payment
  },
  {
    id: '24',
    studentName: 'Alice Johnson', // New Name
    matriculation: 'MAT2024001', // New Matriculation (different year)
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    amount: 600,
    remainingBalance: 5400,
  },
  {
    id: '25',
    studentName: 'Bob Williams', // New Name
    matriculation: 'MAT2024002', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 15)),
    amount: 450,
    remainingBalance: 4050,
  },
  {
    id: '26',
    studentName: 'Charlie Brown', // New Name
    matriculation: 'MAT2024003', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 25)),
    amount: 700,
    remainingBalance: 6300,
  },
  {
    id: '27',
    studentName: 'Diana Davis', // New Name
    matriculation: 'MAT2024004', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 35)),
    amount: 550,
    remainingBalance: 4950,
  },
  {
    id: '28',
    studentName: 'Ethan Smith', // New Name
    matriculation: 'MAT2024005', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 45)),
    amount: 800,
    remainingBalance: 7200,
  },
  {
    id: '29',
    studentName: 'Fiona Wilson', // New Name
    matriculation: 'MAT2024006', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 55)),
    amount: 650,
    remainingBalance: 5850,
  },
  {
    id: '30',
    studentName: 'George Garcia', // New Name
    matriculation: 'MAT2024007', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 65)),
    amount: 500,
    remainingBalance: 4500,
  },
  {
    id: '31',
    studentName: 'Hannah Rodriguez', // New Name
    matriculation: 'MAT2024008', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 75)),
    amount: 750,
    remainingBalance: 6750,
  },
  {
    id: '32',
    studentName: 'Ian Martinez', // New Name
    matriculation: 'MAT2024009', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 85)),
    amount: 600,
    remainingBalance: 5400,
  },
  {
    id: '33',
    studentName: 'Julia Anderson', // New Name
    matriculation: 'MAT2024010', // New Matriculation
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 95)),
    amount: 450,
    remainingBalance: 4050,
  },
]
