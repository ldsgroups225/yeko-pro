import type { ClassDetailsStudent } from '@/types'
import React from 'react'

interface ClassStudentTableProps {
  classStudents: ClassDetailsStudent[]
}

export function ClassStudentTable({ classStudents }: ClassStudentTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="p-2 text-left font-medium">Nom</th>
          <th className="p-2 text-left font-medium">Prénom</th>
          <th className="p-2 text-left font-medium">Moyenne</th>
          <th className="p-2 text-left font-medium">Absences</th>
          <th className="p-2 text-left font-medium">Retards</th>
        </tr>
      </thead>
      <tbody>
        {classStudents.map((student, index) => (
          <tr key={student.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
            <td className="p-2">{student.lastName}</td>
            <td className="p-2">{student.firstName}</td>
            <td className="p-2">{student.gradeAverage.toFixed(2)}</td>
            <td className="p-2">{student.absentCount}</td>
            <td className="p-2">{student.lateCount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
