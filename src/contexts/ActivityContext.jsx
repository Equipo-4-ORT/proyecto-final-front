import { useState } from 'react';
import { ActivityContext } from './ActivityContextDef'; 
import { useActivities } from '../hooks/useActivities';
import { getTodayDate } from '../utils/dateHelpers';
import { getSourceCounts } from '../pages/Dashboard/utils/dashboardCalculations';
import { SOURCES } from '../constants/sources';

export function ActivityProvider({ children }) {
  // NOTA: la fecha es estado compartido por todas las rutas protegidas. Si en el
  // Dashboard se selecciona otra fecha y luego se navega a /settings o /history,
  // los batches del sidebar reflejan esa fecha (no "hoy"), porque esas pantallas
  // no tienen selector de fecha. Comportamiento aceptado; revisar si molesta.
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