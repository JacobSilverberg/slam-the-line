import React, { createContext, useContext } from 'react';

const LeagueContext = createContext();

export const useLeague = () => {
  return useContext(LeagueContext);
};

export const LeagueProvider = ({ leagueId, children }) => {
  return (
    <LeagueContext.Provider value={leagueId}>
      {children}
    </LeagueContext.Provider>
  );
};
