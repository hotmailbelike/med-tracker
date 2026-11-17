import { useContext } from 'react';
import { AppDataContext, type AppDataContextValue } from '../lib/appDataContext';

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (value === null) throw new Error('useAppData must be used inside <AppDataProvider>.');
  return value;
}
