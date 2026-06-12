import { createContext, useContext } from 'react';
import { useActivities } from '../hooks/useActivities';
import { getTodayDate } from '../utils/dateHelpers';
import { getSourceCounts } from '../pages/Dashboard/utils/dashboardCalculations';
import { SOURCES } from '../constants/sources';

const ActivityContext = createContext();

export function ActivityProvider({ children }) { 
  const { data: activities, isLoading, refetch } = useActivities(getTodayDate());
  const sourceCounts = getSourceCounts(activities || [], SOURCES);

  
  return (
    <ActivityContext.Provider value={{ activities, sourceCounts, isLoading, refreshActivities: refetch }}>
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivityData = () => useContext(ActivityContext);
