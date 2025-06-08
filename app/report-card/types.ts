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
