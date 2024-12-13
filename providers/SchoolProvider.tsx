import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { DataModel } from '@/convex/_generated/dataModel';
type School = DataModel['schools']['document']

interface ISchoolData {
  school: School | null;
  isLoading: boolean;
  error: any; // TODO: define error type
}

const SchoolContext = createContext<ISchoolData>({
  school: null,
  isLoading: true,
  error: null,
});

export const SchoolProvider = ({ children }: { children: React.ReactNode }) => {
  const [schoolData, setSchoolData] = useState<ISchoolData>({
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
        school: fetchedSchool,
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
