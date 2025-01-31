import type { ICandidature, IGradeNote, IPonctualite } from '@/types'

export const ponctualiteData: IPonctualite[] = [
  { month: 'Sept', absences: 45, lates: 30 },
  { month: 'Oct', absences: 52, lates: 35 },
  { month: 'Nov', absences: 48, lates: 28 },
  { month: 'Déc', absences: 70, lates: 45 },
  { month: 'Jan', absences: 55, lates: 38 },
]

export const candidatures: ICandidature[] = [
  { time: '2h', name: 'Marie Dupont', type: 'Professeur', status: 'En attente' },
  { time: '5h', name: 'Jean Martin', type: 'Élève', status: 'En attente' },
  { time: '1j', name: 'Sophie Bernard', type: 'Professeur', status: 'En attente' },
  { time: '2j', name: 'Lucas Petit', type: 'Élève', status: 'En attente' },
  { time: '2j', name: 'Emma Dubois', type: 'Élève', status: 'En attente' },
]

export const notes: IGradeNote[] = [
  {
    id: 'N12306',
    classroom: 'Terminale S2',
    studentCount: 35,
    minNote: 8,
    maxNote: 18,
    createdAt: '2024-01-15',
    teacher: 'Dr. Lambert',
    subject: 'Mathématiques',
    status: 'À publier',
  },
  {
    id: 'N12307',
    classroom: 'Première L1',
    studentCount: 32,
    minNote: 10,
    maxNote: 19,
    createdAt: '2024-01-16',
    teacher: 'Mme. Rousseau',
    subject: 'Français',
    status: 'À publier',
  },
  {
    id: 'N12308',
    classroom: 'Seconde A3',
    studentCount: 33,
    minNote: 7,
    maxNote: 17,
    createdAt: '2024-01-16',
    teacher: 'M. Martin',
    subject: 'Physique',
    status: 'À publier',
  },
  {
    id: 'N12309',
    classroom: 'Terminale ES1',
    studentCount: 34,
    minNote: 9,
    maxNote: 18,
    createdAt: '2024-01-17',
    teacher: 'Mme. Dubois',
    subject: 'Histoire',
    status: 'À publier',
  },
  {
    id: 'N12310',
    classroom: 'Première S1',
    studentCount: 36,
    minNote: 6,
    maxNote: 16,
    createdAt: '2024-01-17',
    teacher: 'M. Bernard',
    subject: 'SVT',
    status: 'À publier',
  },
]
