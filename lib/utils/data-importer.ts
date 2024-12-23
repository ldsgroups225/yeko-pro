import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { z } from 'zod'

export function parseCSV<T>(
  file: File,
  schema: z.ZodType<T>,
  options?: Papa.ParseConfig,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      ...options,
      complete: (results) => {
        try {
          const validatedData = results.data.map(row => schema.parse(row))
          resolve(validatedData)
        }
        catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

export function parseJSON<T>(file: File, schema: z.ZodType<T>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string)
        const validatedData = z.array(schema).parse(jsonData)
        resolve(validatedData)
      }
      catch (error) {
        reject(error)
      }
    }
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

export function parseXLSX<T>(
  file: File,
  schema: z.ZodType<T>,
  sheetName?: string,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const selectedSheetName = sheetName || workbook.SheetNames[0]
        const worksheet = workbook.Sheets[selectedSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null, // Ensures empty cells are represented as null
        })

        // Find the header row (assuming it's the first row with most non-null entries)
        const headerRowIndex = jsonData.findIndex((row: any) =>
          row.every((cell: any) => cell !== null),
        )
        const headerRow = jsonData[headerRowIndex] as string[]
        const dataRows = jsonData.slice(headerRowIndex + 1) as unknown[][]
        const rows = dataRows.map((row) => {
          const rowObject: { [key: string]: unknown } = {}
          headerRow.forEach((header, index) => {
            rowObject[header] = row[index]
          })
          return rowObject
        })

        // Validate with Zod schema
        const validatedData = rows.map(row => schema.parse(row))

        resolve(validatedData)
      }
      catch (error) {
        reject(error)
      }
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
