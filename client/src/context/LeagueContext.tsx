import React, { createContext, useContext } from 'react';

const LeagueContext = createContext<string | null>(null);

export const useLeague = () => useContext(LeagueContext);

export const LeagueProvider = ({ leagueId, children }: { leagueId: string; children: React.ReactNode }) => (
  <LeagueContext.Provider value={leagueId}>{children}</LeagueContext.Provider>
);
