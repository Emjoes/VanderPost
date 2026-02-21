import { useContext } from 'react';
import { ApiContext } from './ApiProvider';

export const useApi = () => {
  const ctx = useContext(ApiContext);

  if (!ctx) {
    throw new Error('useApi must be used inside ApiProvider');
  }

  return ctx;
};
