// app/t/(schools)/(navigations)/schedules/import/page.tsx

'use client'

import type { Database } from '@/lib/supabase/types'
import { Groq } from 'groq-sdk'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { DataImporter } from '@/components/DataImporter'
import { useClasses } from '@/hooks'
import { useSubject } from '@/hooks/useSubject'
import { importSchedule } from '@/services'
import useUserStore from '@/store/userStore'

const ScheduleSchema = z.object({
  classroom: z.string().min(2, { message: 'Le nom de la classe doit contenir au moins 2 caractères.' }),
  subject: z.string().min(2, { message: 'Le nom de la matière doit contenir au moins 2 caractères.' }),
  dayOfWeek: z.string().min(2, { message: 'Le jour de la semaine doit contenir au moins 2 caractères.' }),
  startTime: z.string().min(2, { message: 'L\'heure de début doit contenir au moins 2 caractères.' }),
  endTime: z.string().min(2, { message: 'L\'heure de fin doit contenir au moins 2 caractères.' }),
  room: z.string().min(2, { message: 'Le nom de la salle doit contenir au moins 2 caractères.' }),
})

type ScheduleInsertionType = Database['public']['Tables']['schedules']['Insert']
type Schedule = z.infer<typeof ScheduleSchema>

interface ImportError {
  row: number
  message: string
}

interface AiResponse {
  class_id: string
  subject_id: string
  day_of_week: number
  start_time: string
  end_time: string
  room: string
  correct_class: string
  correct_subject: string
  correct_day: string
}

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROK_KEY

const customInstructions = `
  You are a data normalization assistant. Your tasks:
  1. Match classes to existing IDs using case-insensitive comparison
  2. Match subjects to existing IDs using case-insensitive comparison
  3. Convert day names to French and match to numeric values:
     - Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5
  4. Convert times to ISO 8601 format (HH:MM:SS)
  5. Return JSON array with:
     [{
       "class_id": "matched-id",
       "subject_id": "matched-id",
       "day_of_week": number,
       "start_time": "HH:MM:SS",
       "end_time": "HH:MM:SS",
       "room": "string",
       "correct_class": "string",
       "correct_subject": "string",
       "correct_day": "string"
     }]
  Mark unmatched entries with class_id: "error"
`

function ImportSchedulePage() {
  const { user } = useUserStore()
  const router = useRouter()

  const { classes: remoteClasses, loadClasses } = useClasses()
  const { subjects: remoteSubjects } = useSubject()
  const [importSuccess, setImportSuccess] = useState(false)
  const [importErrors, setImportErrors] = useState<ImportError[]>([])

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
  ]

  const validateSchedule = (schedule: any, row: number): ImportError | null => {
    if (!schedule.subject_id || schedule.subject_id === 'error') {
      return { row, message: `Sujet introuvable: "${schedule.original_subject}"` }
    }
    if (!daysOfWeek.find(d => d.value === schedule.day_of_week)) {
      return { row, message: `Jour invalide: "${schedule.original_day}"` }
    }
    if (new Date(`1970-01-01T${schedule.start_time}`) >= new Date(`1970-01-01T${schedule.end_time}`)) {
      return { row, message: `L'heure de fin doit être après l'heure de début` }
    }
    return null
  }

  useEffect(() => {
    if (!remoteClasses.length) {
      loadClasses(user!.school.id).then(r => r)
    }
  }, [])

  const handleScheduleImport = async (data: Schedule[]) => {
    setImportSuccess(false)
    setImportErrors([])

    try {
      if (!GROQ_API_KEY) {
        throw new Error('Clé API Groq non configurée')
      }

      // Initialize Groq client
      const groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
      })

      // Prepare prompt text
      const promptText = `${customInstructions}\n\nImport Data:\n${JSON.stringify(data)}\n\nReference Data:\n${
        JSON.stringify({
          classes: remoteClasses,
          subjects: remoteSubjects,
          days: daysOfWeek,
        })
      }`

      // Call Groq API with Kimi model
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: promptText,
          },
        ],
        model: 'moonshotai/kimi-k2-instruct',
        temperature: 0.25,
        max_completion_tokens: 4096,
        top_p: 1,
        stream: false,
        response_format: {
          type: 'json_object',
        },
        stop: null,
      })

      const rawText = chatCompletion.choices[0]?.message?.content || ''

      if (!rawText) {
        throw new Error('L\'IA n\'a pas pu traiter les données')
      }

      let aiResponse: AiResponse[]

      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch && jsonMatch.length >= 2) {
        const cleanedJson = jsonMatch[1]
        aiResponse = JSON.parse(cleanedJson)
      }
      else {
        // Try to parse the full response as JSON
        try {
          aiResponse = JSON.parse(rawText)
        }
        catch {
          throw new Error('Format de données invalide, réessayez')
        }
      }

      // Validate and transform AI response
      const errors: ImportError[] = []

      aiResponse.forEach((item: any, index: number) => {
        const error = validateSchedule(item, index + 1)
        if (error) {
          errors.push(error)
        }
      })

      if (errors.length > 0) {
        setImportErrors(errors)
        return
      }

      // Insert to Supabase
      await importSchedule({
        data: aiResponse.map(event => ({
          class_id: event.class_id,
          subject_id: event.subject_id,
          day_of_week: event.day_of_week,
          start_time: event.start_time,
          end_time: event.end_time,
          room: event.room,
        } satisfies ScheduleInsertionType)),
      })

      setImportSuccess(true)
      setTimeout(() => setImportSuccess(false), 5000)
      router.push('/t/schedules')
    }
    catch (error: any) {
      console.error('Import Error:', error)
      setImportErrors([{
        row: 0,
        message: error.message.includes('JSON')
          ? 'Erreur de format des données traitées'
          : error.message.includes('Groq') || error.message.includes('API')
            ? 'Erreur de traitement des données par l\'IA'
            : error.message.includes('API key')
              ? 'Clé API Groq non configurée'
              : 'Erreur de base de données',
      }])
    }
  }

  return (
    <div className="space-y-4">
      <DataImporter
        schema={ScheduleSchema}
        onDataImported={handleScheduleImport}
        allowedFileTypes={['.csv', '.xlsx']}
        maxFileSize={10 * 1024 * 1024}
        previewRowCount={5}
        downloadTemplate={{
          buttonText: 'Télécharger le template',
          exportName: 'emploi_du_temps',
        }}
      />

      {importSuccess && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          Importation réussie !
        </div>
      )}

      {importErrors.length > 0 && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          <h3 className="font-bold mb-2">
            Erreurs (
            {importErrors.length}
            ):
          </h3>
          <ul className="list-disc pl-4">
            {importErrors.map(error => (
              <li key={error.row}>
                {error.row > 0 ? `Ligne ${error.row}: ` : ''}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ImportSchedulePage
