
import { useState, useCallback, useRef } from 'react';

export type DevourerState = 
  | 'IDLE' 
  | 'STARVING' 
  | 'BUFFER_LOADED' 
  | 'DEVOURING_BUFFER' 
  | 'DNA_LINKED' 
  | 'LATTICE_ACTIVE' 
  | 'LATTICE_FAIL' 
  | 'DNA_HARVESTED' 
  | 'AUDITING_BUFFER' 
  
  | 'DETECTING_SILHOUETTE'
  | 'DNA_RESTORED'
  | 'CRITICAL_DRIFT';

export const useDevourer = (initialState: DevourerState = 'IDLE') => {
  const [status, setStatus] = useState<DevourerState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastState = useRef<DevourerState>(initialState);

  const transition = useCallback((newState: DevourerState, processing = false) => {
    lastState.current = status;
    setStatus(newState);
    setIsProcessing(processing);
  }, [status]);

  const revert = useCallback(() => {
    setStatus(lastState.current);
    setIsProcessing(false);
  }, []);

  return { 
    status, 
    isProcessing, 
    transition,
    revert
  };
};