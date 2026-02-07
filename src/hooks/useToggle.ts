import { useState, useCallback } from 'react';

export type UseToggleReturn = [
  boolean,
  {
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
    setState: (value: boolean) => void;
  }
];

/**
 * Custom hook for managing boolean state with convenient toggle methods
 * @param initialState - Initial boolean value (default: false)
 * @returns Tuple of [state, { toggle, setTrue, setFalse, setState }]
 * 
 * @example
 * const [isOpen, { toggle, setTrue: open, setFalse: close }] = useToggle();
 * const [isVisible, { toggle, setState }] = useToggle(true);
 */
export const useToggle = (initialState: boolean = false): UseToggleReturn => {
  const [state, setState] = useState<boolean>(initialState);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, { toggle, setTrue, setFalse, setState }];
};

export default useToggle;
