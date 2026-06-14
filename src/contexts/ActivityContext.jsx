import { createContext, useContext, useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { getTodayDate } from '../utils/dateHelpers';
import { getSourceCounts } from '../pages/Dashboard/utils/dashboardCalculations';
import { SOURCES } from '../constants/sources';

const ActivityContext = createContext();

export function ActivityProvider({ children }) {
  const [date, setDate] = useState(getTodayDate());
  
  const { data: activities, isLoading, error, refetch } = useActivities(date);
  const sourceCounts = getSourceCounts(activities || [], SOURCES);

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      sourceCounts, 
      isLoading, 
      error, 
      refreshActivities: refetch,
      date, 
      setDate 
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivityData = () => useContext(ActivityContext);