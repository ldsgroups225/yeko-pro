import { DataModel } from '@/convex/_generated/dataModel';
import { atom, createStore, Atom, WritableAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { useMemo } from 'react';


/**
 * Represents the data structure for a school.
*/
type School = DataModel['schools']['document']

/**
 * Jotai atom to store the current user's ID.
 * Initialized to null, indicating no user is initially set.
 */
const userAtom: WritableAtom<string | null, [string | null], void> = atom<string | null>(null);

/**
 * Jotai atom to store the current school data.
 * Initialized to null, indicating no school is initially selected.
 */
const schoolAtom: WritableAtom<School | null, [School | null], void> = atom<School | null>(null);

/**
 * Jotai atom to store the timestamp when the school data was last cached.
 * Initialized to 0, indicating that the cache is initially empty.
 */
const cachedAtAtom: WritableAtom<number, [number], void> = atom<number>(0);

/**
 * Cache duration in milliseconds (1 hour).
 */
const CACHE_DURATION: number = 60 * 60 * 1000;

/**
 * Custom hook for managing school data with Jotai, including caching and SSR support.
 *
 * @param initialSchool - (Optional) Initial school data to hydrate the store with on the server-side.
 * @param initialUser - (Optional) Initial user ID to hydrate the store with on the server-side.
 * @returns An object containing functions to get, set, and clear the school data,
 *          as well as the Jotai store instance.
 *
 * @example
 * // Client-side usage with SSR hydration:
 * const { getSchool, setSchool, clearSchool, schoolStore } = schoolStore(initialSchoolData, initialUserId);
 *
 * // Basic usage without initial data:
 * const { getSchool, setSchool, clearSchool, schoolStore } = schoolStore();
 */
export const schoolStore = (initialSchool?: School, initialUser?: string) => {
  /**
   * Creates a Jotai store instance.
   *
   * On the server-side, a new store is created for each request to prevent data leakage.
   * On the client-side, `useMemo` ensures that the store is created only once and reused
   * across renders, maintaining the application state.
   */
  const schoolStore = useMemo(() => createStore(), []);

  /**
   * Hydrates the Jotai atoms with initial values, primarily used for server-side rendering (SSR).
   *
   * This hook takes an array of [atom, value] pairs and initializes the atoms in the provided store
   * with these values. If `initialSchool` is provided, `cachedAtAtom` is set to the current timestamp,
   * effectively setting a new cache starting point.
   */
  useHydrateAtoms(
    [
      [schoolAtom, initialSchool ?? null],
      [userAtom, initialUser ?? null],
      [cachedAtAtom, initialSchool ? Date.now() : 0],
    ] as const,
    { store: schoolStore },
  );

  /**
   * Retrieves the current school data from the store.
   *
   * If the school data is present in the cache and the cache is not expired (within the `CACHE_DURATION`),
   * it returns the cached school data along with the current user ID. Otherwise, it returns null.
   *
   * @returns The cached school data and user ID, or null if the cache is invalid or expired.
   */
  const getSchool = (): School | null => {
    const currentSchool = schoolStore.get(schoolAtom);
    const cachedAt = schoolStore.get(cachedAtAtom);
    const currentTimestamp = Date.now();

    if (
      currentSchool &&
      cachedAt > 0 &&
      (currentTimestamp - cachedAt) < CACHE_DURATION
    ) {
      return currentSchool;
    }

    return null;
  };

  /**
   * Sets or updates the school data in the store.
   *
   * @param school - (Optional) The school data to set. If null or undefined, it effectively clears the school data.
   * @param userId - (Optional) The user ID associated with the school. If null or undefined it will be cleared.
   */
  const setSchool = (school?: School, userId?: string): void => {
    schoolStore.set(schoolAtom, school ?? null);
    schoolStore.set(cachedAtAtom, school ? Date.now() : 0);
    schoolStore.set(userAtom, userId ?? null);
  };

  /**
   * Clears the school data, user ID, and cache timestamp from the store.
   */
  const clearSchool = (): void => {
    schoolStore.set(schoolAtom, null);
    schoolStore.set(cachedAtAtom, 0);
    schoolStore.set(userAtom, null);
  };

  return {
    getSchool,
    setSchool,
    clearSchool,
    schoolStore,
  };
};
