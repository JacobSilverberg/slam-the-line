import React, { createContext, useState, useEffect } from 'react';

interface WeekContextValue {
  week: number;
  setWeek: (w: number) => void;
}

export const WeekContext = createContext<WeekContextValue>({ week: 1, setWeek: () => {} });

const NFL_SEASON_START = import.meta.env.VITE_NFL_SEASON_START || '2025-09-02';
const NFL_SEASON_WEEKS = 18;

export const WeekProvider = ({ children }: { children: React.ReactNode }) => {
  const [week, setWeek] = useState(1);

  useEffect(() => {
    const start = new Date(NFL_SEASON_START);
    const now = new Date();
    const dayDiff = Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const current = Math.floor(dayDiff / 7) + 1;
    setWeek(current >= 1 && current <= NFL_SEASON_WEEKS ? current : 1);
  }, []);

  return <WeekContext.Provider value={{ week, setWeek }}>{children}</WeekContext.Provider>;
};
