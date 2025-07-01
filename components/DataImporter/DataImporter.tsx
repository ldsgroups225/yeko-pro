// components/DataImporter/DataImporter.tsx

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'
import Papa from 'papaparse'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { getSchemaShape } from './getSchemaShape'

export interface ValidationError {
  row: number
  field: string
  message: string
}

// Default values as constants
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB default
const DEFAULT_ALLOWED_FILE_TYPES = ['.csv', '.xlsx', '.xls']
const DEFAULT_PREVIEW_ROW_COUNT = 5
const DEFAULT_HEADER_ROW_NUMBER = 0
const DEFAULT_TITLE = 'Importation des données'
const DEFAULT_DESCRIPTION = 'Importer des données CSV ou Excel'

interface DownloadTemplateConfig {
  buttonText?: string
}

export interface DataImporterProps<T extends z.ZodType> {
  schema: T
  onDataImported?: (data: z.infer<T>[]) => void
  maxFileSize?: number // in bytes, default is 5MB
  allowedFileTypes?: string[] // default is ['.csv', '.xlsx', '.xls']
  previewRowCount?: number // Number of rows to show in preview, default is 5
  headerRowNumber?: number // Which row contains headers, default is 0 (first row)
  onError?: (error: string) => void
  title?: string
  description?: string
  downloadTemplate?: boolean | DownloadTemplateConfig
  templateHeaders?: string[] // Optional explicit headers
}

export function DataImporter<T extends z.ZodType>({
  schema,
  onDataImported,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
  previewRowCount = DEFAULT_PREVIEW_ROW_COUNT,
  headerRowNumber = DEFAULT_HEADER_ROW_NUMBER,
  onError,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  downloadTemplate,
  templateHeaders,
}: DataImporterProps<T>) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [validatedData, setValidatedData] = useState<z.infer<T>[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [status, setStatus] = useState<'idle' | 'validating' | 'validated' | 'error'>('idle')

  // Obtenir le texte du bouton du template
  const templateButtonText = typeof downloadTemplate === 'object'
    ? downloadTemplate.buttonText || 'Download Template'
    : 'Download Template'

  // Gérer le téléchargement du template Excel
  const handleDownloadTemplate = () => {
    try {
      let headers: string[] | null = null
      if (templateHeaders && templateHeaders.length > 0) {
        headers = templateHeaders
      }
      else {
        const shape = getSchemaShape(schema)
        if (!shape)
          throw new Error('Le schéma doit avoir des champs définis')
        headers = Object.keys(shape)
      }
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet([headers])
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
      XLSX.writeFile(workbook, 'emploi_du_temps.xlsx')
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      if (onError)
        onError(`Échec du téléchargement du template: ${errorMessage}`)
    }
  }

  // Validate data in batches
  const validateDataBatches = (data: any[]) => {
    const batchSize = 100
    const batches = Math.ceil(data.length / batchSize)

    const validData: z.infer<T>[] = []
    const errors: ValidationError[] = []

    let batchProcessed = 0

    const processBatch = (batchIndex: number) => {
      const start = batchIndex * batchSize
      const end = Math.min(start + batchSize, data.length)
      const batch = data.slice(start, end)

      batch.forEach((row, idx) => {
        const rowIndex = start + idx
        try {
          const validatedRow = schema.parse(row)
          validData.push(validatedRow)
        }
        catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              errors.push({
                row: rowIndex + 1, // +1 for human-readable row numbers
                field: err.path.join('.'),
                message: err.message,
              })
            })
          }
        }
      })

      batchProcessed++
      setProcessingProgress(Math.floor((batchProcessed / batches) * 100))

      if (batchProcessed < batches) {
        // Process next batch
        setTimeout(() => processBatch(batchIndex + 1), 0)
      }
      else {
        // All batches processed
        setValidatedData(validData)
        setValidationErrors(errors)
        setIsProcessing(false)
        setStatus('validated')
      }
    }

    // Start processing the first batch
    processBatch(0)
  }

  // Process parsed results and validate against the schema
  const processParseResults = (data: any[], headers: string[]) => {
    setParsedData(data)
    setHeaders(headers)

    // Batch validation to avoid blocking the UI
    validateDataBatches(data)
  }

  // Parse CSV files using PapaParse
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        processParseResults(results.data, results.meta.fields || [])
      },
      error: (error) => {
        setIsProcessing(false)
        if (onError)
          onError(`CSV parsing error: ${error.message}`)
        setStatus('error')
      },
    })
  }

  // Parse Excel files using SheetJS
  const parseExcel = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer)

      // Get the first sheet
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convert to JSON with headers
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (data.length <= headerRowNumber) {
        throw new Error('Ce fichier est vide')
      }

      // Extract headers from the specified header row
      const headers = data[headerRowNumber] as string[]

      // Extract data rows (skip header row)
      const rows = data.slice(headerRowNumber + 1).map((row) => {
        const rowObj: Record<string, any> = {};
        (row as any[]).forEach((cell, index) => {
          if (index < headers.length) {
            rowObj[headers[index]] = cell
          }
        })
        return rowObj
      })

      processParseResults(rows, headers)
    }
    catch (error) {
      setIsProcessing(false)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      if (onError)
        onError(`Erreur lors du parsing du fichier: ${errorMessage}`)
      setStatus('error')
    }
  }

  // Parse the uploaded file (CSV or XLSX)
  const parseFile = async (file: File) => {
    setIsProcessing(true)
    setStatus('validating')

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        parseCSV(file)
      }
      else if (
        file.name.toLowerCase().endsWith('.xlsx')
        || file.name.toLowerCase().endsWith('.xls')
      ) {
        await parseExcel(file)
      }
      else {
        throw new Error('Format de fichier non supporté')
      }
    }
    catch (error) {
      setIsProcessing(false)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      if (onError)
        onError(errorMessage)
      setStatus('error')
    }
  }

  // File upload handler using react-dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const uploadedFile = acceptedFiles[0]

      // Validate file size
      if (uploadedFile.size > maxFileSize) {
        throw new Error(`Taille du fichier dépassée. Limite: ${maxFileSize / (1024 * 1024)}MB`)
      }

      // Validate file type
      const fileExtension = `.${uploadedFile.name.split('.').pop()?.toLowerCase()}`
      if (!allowedFileTypes.includes(fileExtension)) {
        throw new Error(`Type de fichier non supporté. Types supportés: ${allowedFileTypes.join(', ')}`)
      }

      setFile(uploadedFile)
      setStatus('idle')
      setParsedData([])
      setHeaders([])
      setValidatedData([])
      setValidationErrors([])
      setProcessingProgress(0)

      // Parse the file
      await parseFile(uploadedFile)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      if (onError)
        onError(errorMessage)
      setStatus('error')
    }
  }, [maxFileSize, allowedFileTypes, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  })

  // Handle import button click
  const handleImport = () => {
    if (onDataImported && validatedData.length > 0) {
      onDataImported(validatedData)
    }
  }

  // Calculate validation stats
  const totalRows = parsedData.length
  const validRows = validatedData.length
  const invalidRows = totalRows - validRows
  const uniqueErrorFields = new Set(validationErrors.map(err => err.field))

  // Download validation errors as CSV
  const downloadErrorsCSV = () => {
    if (validationErrors.length === 0)
      return

    const csvContent = Papa.unparse({
      fields: ['Row', 'Field', 'Error Message'],
      data: validationErrors.map(err => [err.row, err.field, err.message]),
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `validation_errors_${new Date().toISOString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>

          {downloadTemplate && (
            <div className="mb-4 ml-auto">
              <Button variant="outline" onClick={handleDownloadTemplate} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                {templateButtonText}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!file && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragActive ? 'Déposez le fichier ici' : 'Déplacez-le ici, ou cliquez pour sélectionner'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Les formats supportés sont :
                  {' '}
                  {allowedFileTypes.join(', ')}
                  {' '}
                  (Max:
                  {' '}
                  {maxFileSize / 1024 / 1024}
                  MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="outline" className="ml-2">
                  {(file.size / 1024).toFixed(1)}
                  {' '}
                  KB
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setStatus('idle')
                  setParsedData([])
                  setHeaders([])
                  setValidatedData([])
                  setValidationErrors([])
                }}
              >
                Changer le fichier
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Validation des données...</span>
                  <span>
                    {processingProgress}
                    %
                  </span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}

            {status === 'validated' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-muted-foreground text-sm">Lignes totales</div>
                    <div className="text-2xl font-semibold mt-1">{totalRows}</div>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-green-700 text-sm">Lignes validées</div>
                    <div className="text-2xl font-semibold text-green-800 mt-1">{validRows}</div>
                  </div>
                  <div className={`${invalidRows > 0 ? 'bg-red-100' : 'bg-muted/50'} p-4 rounded-lg`}>
                    <div className={`${invalidRows > 0 ? 'text-red-700' : 'text-muted-foreground'} text-sm`}>
                      Lignes invalidées
                    </div>
                    <div className={`text-2xl font-semibold ${invalidRows > 0 ? 'text-red-800' : ''} mt-1`}>
                      {invalidRows}
                    </div>
                  </div>
                </div>

                {invalidRows > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Problèmes de validation</AlertTitle>
                    <AlertDescription>
                      Found
                      {' '}
                      {validationErrors.length}
                      {' '}
                      errors across
                      {' '}
                      {uniqueErrorFields.size}
                      {' '}
                      fields.
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={downloadErrorsCSV}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Erreurs de téléchargement
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {headers.length > 0 && parsedData.length > 0 && (
                  <div className="border rounded-md">
                    <div className="text-sm font-medium p-3 border-b">
                      Prévisualisation (
                      {Math.min(previewRowCount, parsedData.length)}
                      {' '}
                      de
                      {' '}
                      {parsedData.length}
                      {' '}
                      lignes)
                    </div>
                    <div className="max-h-80 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">#</TableHead>
                            {headers.map(header => (
                              <TableHead key={header}>
                                {header}
                              </TableHead>
                            ))}
                            <TableHead className="w-20 text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.slice(0, previewRowCount).map((row, rowIndex) => {
                            // Check if this row has errors
                            const rowErrors = validationErrors.filter(err => err.row === rowIndex + 1)
                            const isValid = rowErrors.length === 0

                            return (
                              <TableRow key={row}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {rowIndex + 1}
                                </TableCell>
                                {headers.map((header) => {
                                  // Check if this cell has errors
                                  const hasError = rowErrors.some(err => err.field === header)

                                  return (
                                    <TableCell
                                      key={`${header}`}
                                      className={hasError ? 'text-red-500' : ''}
                                    >
                                      {row[header] !== undefined && row[header] !== null
                                        ? String(row[header])
                                        : <span className="text-muted-foreground italic">vide</span>}
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="text-right">
                                  {isValid
                                    ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                                      )
                                    : (
                                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                                      )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="border rounded-md">
                    <div className="text-sm font-medium p-3 border-b text-red-700 bg-red-50">
                      Validation Errors (
                      {Math.min(5, validationErrors.length)}
                      {' '}
                      of
                      {' '}
                      {validationErrors.length}
                      )
                    </div>
                    <div className="max-h-80 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ligne</TableHead>
                            <TableHead>Champ</TableHead>
                            <TableHead>Erreur</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationErrors.slice(0, 5).map(error => (
                            <TableRow key={error.row}>
                              <TableCell className="font-mono">{error.row}</TableCell>
                              <TableCell>{error.field}</TableCell>
                              <TableCell>{error.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an error processing your file. Please check the file format and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {file && status === 'validated' && (
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setFile(null)
                setStatus('idle')
                setParsedData([])
                setHeaders([])
                setValidatedData([])
                setValidationErrors([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={validRows === 0 || isProcessing}
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {validRows === totalRows ? 'Import Data' : `Import ${validRows} Valid Rows`}
            </Button>
          </div>
        )}

        {(!file || status !== 'validated') && (
          <div className="w-full flex justify-end">
            {file && (
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setStatus('idle')
                  setParsedData([])
                  setHeaders([])
                  setValidatedData([])
                  setValidationErrors([])
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
