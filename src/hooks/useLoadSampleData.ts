import { useCallback } from 'react';
import { buildSampleData } from '../lib/sampleData';
import { useAppData } from './useAppData';

const SAMPLE_LOADED_MESSAGE = 'Sample data loaded: two people, eight medicines and a week of history.';

export function useLoadSampleData(): () => Promise<boolean> {
  const { actions } = useAppData();
  return useCallback(() => actions.replaceData(buildSampleData(new Date()), SAMPLE_LOADED_MESSAGE), [actions]);
}
