// lib/utils/saveDataIfDirty.ts

export interface SaveRecordOptions<_Id = unknown> {
  /**
   * Whether to merge the id into the optimistic state.
   * Defaults to true.
   */
  mergeId?: boolean
  /**
   * An optional error handler to be called if the update function fails.
   */
  errorHandler?: (error: Error) => void
  /**
   * An optional success handler to be called if the update function succeeds.
   */
  successHandler?: () => void
}

/**
 * Conditionally calls an update function if the new data is “dirty” (different)
 * compared to the current data for a record in an optimistic state (a record mapping).
 * It always updates the optimistic state.
 *
 * @param id - The identifier for the record.
 * @param newData - The new partial data to merge.
 * @param currentData - The current data for the record.
 * @param setOptimistic - A setter function to update the optimistic record state.
 *   This function should accept an updater that takes the previous record (a mapping of id to T)
 *   and returns a new record.
 * @param updateFn - An async update function that accepts newData and the record id.
 * @param options - Optional configuration including a flag to merge the id into the state and an error handler.
 *
 * @returns A promise that resolves when the update is complete or skipped.
 */
export async function saveRecordIfDirty<T, _Id extends string | number>(
  id: _Id,
  newData: Partial<T>,
  currentData: T,
  setOptimistic: (updater: (prev: Record<_Id, T>) => Record<_Id, T>) => void,
  updateFn: (data: Partial<T>, id: _Id) => Promise<any>,
  options?: SaveRecordOptions<_Id>,
): Promise<void> {
  const { mergeId = true, errorHandler, successHandler } = options || {}

  // Determine if any key in newData is different than in currentData.
  const isDirty = Object.keys(newData).some(
    key => newData[key as keyof T] !== currentData[key as keyof T],
  )

  // Always update the optimistic state for this record.
  setOptimistic((prev: Record<_Id, T>) => ({
    ...prev,
    [id]: {
      ...(prev[id] || {} as T),
      ...newData,
      ...(mergeId ? { id } : {}),
    },
  }))

  // If no changes are detected, do not call the update function.
  if (!isDirty)
    return

  try {
    await updateFn(newData, id)
    if (successHandler) {
      successHandler()
    }
  }
  catch (error: any) {
    if (errorHandler) {
      errorHandler(error)
    }
    else {
      console.error(error)
    }
  }
}
