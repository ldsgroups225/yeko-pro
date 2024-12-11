import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Define a more specific type for your school data using Ent
import { DataModel } from '@/convex/_generated/dataModel'; // Import DataModel
type School = DataModel['schools']['document']

// Updated interface to allow undefined
interface ISchoolData {
  school: School | null | undefined;
  isLoading: boolean;
  error: any; // You might want to define a more specific error type later
}

// Create the context with the updated interface
const SchoolContext = createContext<ISchoolData>({
  school: null,
  isLoading: true,
  error: null,
});

// Create the provider component
export const SchoolProvider = ({ children }: { children: React.ReactNode }) => {
  const [schoolData, setSchoolData] = useState<ISchoolData>({ // Add type here
    school: null,
    isLoading: true,
    error: null,
  });

  const fetchedSchool = useQuery(api.schools.getStaffSchool, {});

  useEffect(() => {
    if (fetchedSchool === undefined) {
      // Query is still in progress
      setSchoolData({ ...schoolData, isLoading: true, error: null });
    } else if (fetchedSchool === null) {
      // Query returned null, no school found or user not logged in
      setSchoolData({ school: null, isLoading: false, error: null });
    } else {
      // Data is fetched
      setSchoolData({
        school: fetchedSchool, // No need for casting anymore
        isLoading: false,
        error: null,
      });
    }
  }, [fetchedSchool]);

  return (
    <SchoolContext.Provider value={schoolData}>
      {children}
    </SchoolContext.Provider>
  );
};

// Create a custom hook to use the context
export const useSchool = () => useContext(SchoolContext);
