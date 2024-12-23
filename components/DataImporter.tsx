import type { ColumnDef } from '@tanstack/react-table'
import type { ChangeEvent, DragEvent } from 'react'
import { Input } from '@/components/ui/input'
import { parseCSV, parseJSON, parseXLSX } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import { DataTable } from './DataTable'

interface SchemaOption {
  label: string
  value: string
  schema: z.ZodType<any>
  columns: ColumnDef<any>[]
}

interface DataImporterProps {
  schemaOptions: SchemaOption
}

export function DataImporter({ schemaOptions }: DataImporterProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (file: File | null) => {
    if (!file)
      return

    setIsLoading(true)
    setError(null)
    setData([])

    try {
      let parsedData: any[] = []
      if (file.type === 'text/csv') {
        parsedData = await parseCSV(file, schemaOptions.schema, {
          skipEmptyLines: 'greedy',
        })
      }
      else if (
        file.type === 'application/json'
        || file.name.endsWith('.json')
      ) {
        parsedData = await parseJSON(file, schemaOptions.schema)
      }
      else if (
        file.type
        === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        || file.name.endsWith('.xlsx')
      ) {
        parsedData = await parseXLSX(file, schemaOptions.schema)
      }
      else {
        setError('Type de fichier non supporté')
        return
      }

      if (parsedData && parsedData.length > 0) {
        setData(parsedData)
      }
      else {
        setError('Pas de données trouvées dans le fichier ou l\'analyse a échoué.')
      }
    }
    catch (err) {
      const errorMessage = err instanceof z.ZodError
        ? `Erreur de validation : ${err.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join('; ')}`
        : err instanceof Error
          ? `Erreur : ${err.message}`
          : 'Une erreur inconnue est survenue'

      setError(errorMessage)
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleDrag = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragging(true)
    }
    else if (event.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      setIsDragging(false)

      const file = event.dataTransfer.files?.[0]
      handleFileChange(file)
    },
    [handleFileChange],
  )

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      handleFileChange(file ?? null)
    },
    [handleFileChange],
  )

  const columns = schemaOptions ? schemaOptions.columns : ([] as ColumnDef<any>[])

  return (
    <>
      <div className="mb-4">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-6 mt-4 border-2 border-dashed rounded-md cursor-pointer text-center ${
            isDragging ? 'bg-gray-100 border-gray-400' : 'border-gray-300'
          }`}
        >
          <p className="text-gray-600">
            Glissez-déposez votre fichier ici, ou
            {' '}
            <label
              htmlFor="file-upload"
              className="text-blue-500 cursor-pointer"
            >
              cliquez pour sélectionner un fichier
            </label>
            .
          </p>
          <Input
            id="file-upload"
            type="file"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && data.length > 0 && (
        <DataTable columns={columns} data={data} />
      )}
    </>
  )
}
