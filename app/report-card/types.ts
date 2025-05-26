// app/report-card/types.ts

export interface GradeEntry {
  discipline: string
  trim1?: string // Note: In a real scenario, these would be numbers or null
  rang1?: string
  trim2?: string
  rang2?: string
  mg?: string // Moyenne Générale for the subject
  rang?: string // Final rank for the subject
  teacher?: string
  evaluation?: string // Appreciation for the subject
}

export interface ReportCardData {
  // Header
  ministere: string
  bulletinTitle: string
  term: string // e.g., "2ème Trimestre"
  schoolYear: string // e.g., "2024-2025"

  // School Info
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolCode: string
  schoolStatus: string // e.g., "Privé"

  // Student Info
  studentFullName: string
  studentMatricule: string // This is idNumber
  studentClass: string // e.g., "1ère A"
  studentEffectif: string // Class size
  studentSex: string // "M" or "F"
  studentBirthDate: string // "DD/MM/YYYY"
  studentBirthplace: string
  studentNationality?: string
  studentRedoublement: string // "OUI" or "NON"
  studentRegime: string // e.g., "NAFF"
  studentStatut?: string
  studentIntern?: string // Boarder status

  // Grades Table
  grades: GradeEntry[]
  totalPoints: string // Sum of MG * Coef (if applicable, else sum of MGs)

  // Summary - Student
  absencesTotal: string
  absencesJustified: string
  absencesUnjustified: string
  studentAverage: string // e.g., "10.51 / 20"
  studentRank: string // e.g., "14e / 18"
  studentRecallTrim1: string // e.g., "MOY = 10.29 Rang = 14e"

  // Summary - Class (for the current term)
  classMoyMaxi: string
  classMoyMini: string
  classMoyClasse: string // Class average
  classMoyLt85: string // Percentage of students with avg < 8.5
  classMoy85To10: string // Percentage of students with 8.5 <= avg <= 10
  classMoyGt10: string // Percentage of students with avg > 10

  // Mention & Appreciation
  distinction: string // The checked distinction, e.g., "TRAVAIL PASSABLE"
  distinctionsAvailable: { label: string, checked: boolean }[]
  sanctionsAvailable: { label: string, checked: boolean }[]
  appreciationText: string // General appreciation from class council

  // Footer/Signatures
  headTeacherSignatureLabel: string // Usually "Nom, Signature et Cachet du Chef d'Établissement"
  principalTeacherLabel: string // Usually "Nom, Signature du Professeur Principal"
  principalTeacherName: string
  reportDateLabel: string // Usually "Fait le"
  reportDate: string // "DD/MM/YYYY"
  footerSchoolName: string
  footerYekoVersion: string
  footerDisclaimer: string
}

// Placeholder for fetching actual data
export async function getReportCardDataForStudent(studentIdNumber: string, _trimesterId?: string): Promise<ReportCardData> {
  // In a real application, you would fetch data from your services:
  // const student = await studentService.getStudentByIdNumber(studentIdNumber);
  // const school = await schoolService.getSchoolById(student.schoolId);
  // const grades = await noteService.getGradesForReport(studentIdNumber, termId);
  // const absences = await attendanceService.getAbsencesForStudent(studentIdNumber, termId);
  // const classStats = await classService.getClassStats(student.classId, termId);
  // ... and so on for all data points.

  // For now, returning sample data. Replace with actual data fetching.
  return {
    ministere: 'MINISTÈRE DE L\'EDUCATION NATIONALE ET DE L\'ALPHABÉTISATION',
    bulletinTitle: 'BULLETIN TRIMESTRIEL',
    term: '2ème Trimestre', // This should be dynamic
    schoolYear: '2024-2025', // This should be dynamic from school_years table
    schoolName: 'COLLÈGE VICTOR LOBA DJOKOUEHI YOPOUGON ZONE CHU', // from student.school
    schoolAddress: '275 CIDEX 1 ABIDJAN II PLATEAUX',
    schoolPhone: '01 01 45 45 89',
    schoolCode: '190296',
    schoolStatus: 'Privé',
    studentFullName: 'John Doe', // from student
    studentMatricule: studentIdNumber,
    studentClass: '1ère A', // from student_school_class
    studentEffectif: '18', // from class stats
    studentSex: 'M',
    studentBirthDate: '25/12/2006',
    studentBirthplace: 'SÉGUÉLA',
    studentNationality: 'IVOIRIENNE',
    studentRedoublement: 'NON',
    studentRegime: 'NAFF', // Needs to be defined what this means
    studentStatut: '',
    studentIntern: '',
    grades: [
      { discipline: 'PHILOSOPHIE', trim1: '11.66', rang1: '8e', trim2: '08.75', rang2: '15e', mg: '09.72', rang: '14e', teacher: 'BA LOU', evaluation: 'Travail Insuffisant' },
      { discipline: 'FRANÇAIS', trim1: '10.00', rang1: '13e', trim2: '10.75', rang2: '12e', mg: '10.50', rang: '15e', teacher: 'ABOU MEGNAN', evaluation: 'Travail Passable' },
      { discipline: 'ANGLAIS', trim1: '08.33', rang1: '16e', trim2: '09.25', rang2: '13e', mg: '08.94', rang: '16e', teacher: 'DOUTE BAHO ANDERSON', evaluation: 'Travail Insuffisant' },
      { discipline: 'ESPAGNOL (L.V2)', trim1: '11.66', rang1: '8e', trim2: '10.00', rang2: '13e', mg: '10.45', rang: '11e', teacher: 'LEGNON BLE DESIRE', evaluation: 'Travail Passable' },
      { discipline: 'HIST-GEO', trim1: '12.00', rang1: '5e', trim2: '11.00', rang2: '11e', mg: '11.35', rang: '10e', teacher: 'ASSOUMAN BAH', evaluation: 'Travail Passable' },
      { discipline: 'BILAN LITTERAIRES', trim1: '10.68', trim2: '10', mg: '10.22' },
      { discipline: 'MATHÉMATIQUES', trim1: '05.00', rang1: '17e', trim2: '12.25', rang2: '6e', mg: '09.83', rang: '11e', teacher: 'SAVI DEGBEY PAULIN', evaluation: 'Assez Bien' },
      { discipline: 'PHYSIQUE-CHIMIE', mg: '' },
      { discipline: 'SCIENCE DE LA VIE ET DE LA TERRE', mg: '' },
      { discipline: 'BILAN SCIENCES', trim1: '05.00', trim2: '12.25', mg: '09.83' },
      { discipline: 'EPS', trim1: '14.00', rang1: '3e', trim2: '12.37', rang2: '3e', mg: '12.91', rang: '3e', teacher: 'DOUBA TIEBI TRA', evaluation: 'Assez Bien' },
      { discipline: 'CONDUITE', trim1: '11.00', rang1: '17e', trim2: '13.50', rang2: '17e', mg: '12.25', rang: '17e', teacher: 'BROU DIAMA', evaluation: 'Assez Bien' },
      { discipline: 'BILAN AUTRES', trim1: '12.50', trim2: '12.93', mg: '12.78' },
    ],
    totalPoints: '210.57',
    absencesTotal: '0', // from attendance service
    absencesJustified: '0',
    absencesUnjustified: '0',
    studentAverage: '10.51 / 20', // from student_semester_average_view
    studentRank: '14e / 18', // from student_semester_average_view
    studentRecallTrim1: 'MOY = 10.29 Rang = 14e', // from previous semester data
    classMoyMaxi: '13.98', // from class stats service
    classMoyMini: '07.02',
    classMoyClasse: '11.04',
    classMoyLt85: '11.11%',
    classMoy85To10: '05.55%',
    classMoyGt10: '83.33%',
    distinction: 'TRAVAIL PASSABLE', // Calculated or from a specific table
    distinctionsAvailable: [
      { label: 'TABLEAU D\'HONNEUR + FÉLICITATION', checked: false },
      { label: 'TABLEAU D\'HONNEUR + ENCOURAGEMENT', checked: false },
      { label: 'TABLEAU D\'HONNEUR', checked: false },
      { label: 'TRAVAIL PASSABLE', checked: true },
    ],
    sanctionsAvailable: [
      { label: 'AVERTISSEMENT TRAVAIL', checked: false },
      { label: 'BLÂME TRAVAIL', checked: false },
    ],
    appreciationText: 'Travail Passable', // From class council or calculated
    headTeacherSignatureLabel: 'Nom, Signature et Cachet du Chef d\'Établissement',
    principalTeacherLabel: 'Nom, Signature du Professeur Principal',
    principalTeacherName: 'DOUTE BAHO ANDERSON', // from teacher_class_assignments
    reportDateLabel: 'Fait le',
    reportDate: new Date().toLocaleDateString('fr-FR'), // Generation date
    footerSchoolName: 'COLLÈGE VICTOR LOBA DJOKOUEHI YOPOUGON ZONE CHU',
    footerYekoVersion: 'YEKO / Version: 1.0.0',
    footerDisclaimer: 'Ceci est un document original, aucun duplicata ne sera délivré.',
  }
}
