import { useContext } from 'react';
import { ActivityContext } from '../contexts/ActivityContextDef';

export const useActivityData = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityData debe ser usado dentro de un ActivityProvider');
  }
  return context;
};