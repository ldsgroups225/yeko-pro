'use client'

import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useEducatorConduct } from '../hooks'

export function GenerateConductReport() {
  const { isLoading, filters } = useEducatorConduct()
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true)

      // Build query parameters for the PDF generation
      const queryParams = new URLSearchParams()

      if (filters.classId) {
        queryParams.set('classId', filters.classId)
      }
      if (filters.gradeFilter) {
        queryParams.set('gradeFilter', filters.gradeFilter)
      }
      if (filters.scoreRange) {
        queryParams.set('minScore', filters.scoreRange.min.toString())
        queryParams.set('maxScore', filters.scoreRange.max.toString())
      }

      // Generate the PDF report
      const reportUrl = `/api/generate-conduct-report-pdf?${queryParams.toString()}`
      const response = await fetch(reportUrl)

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename based on current filters
      const getFileName = () => {
        const date = new Date().toISOString().split('T')[0]
        let filename = `rapport_conduite_${date}`

        if (filters.classId) {
          filename += `_classe_${filters.classId}`
        }
        if (filters.gradeFilter) {
          filename += `_${filters.gradeFilter.toLowerCase()}`
        }

        return `${filename}.pdf`
      }

      link.download = getFileName()
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Rapport PDF généré avec succès')
    }
    catch (error) {
      console.error('Report generation error:', error)
      toast.error('Échec de la génération du rapport PDF')
    }
    finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGenerateReport}
      className="hidden sm:flex bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-md transition-all duration-200 border-secondary/20"
      disabled={isLoading || isGeneratingReport}
    >
      {isGeneratingReport
        ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          )
        : (
            'Générer Rapport'
          )}
    </Button>
  )
}
