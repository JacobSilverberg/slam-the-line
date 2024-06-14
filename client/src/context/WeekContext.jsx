import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const WeekContext = createContext();


export const WeekProvider = ({ children }) => {
  const [week, setWeek] = useState(1); // Default week is 1

  useEffect(() => {
    // Calculate the current week based on the current date
    const currentDate = new Date();
    // Adjust the start date of the NFL season as needed
    const startDate = new Date('2024-09-04'); // Example: Start date of the NFL season
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const currentWeek = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

    if (currentWeek >= 1 && currentWeek <= 18) {
      setWeek(currentWeek);
    } else {
      setWeek(1);
    }
  }, []);

  return (
    <WeekContext.Provider value={{ week, setWeek }}>
      {children}
    </WeekContext.Provider>
  );

  
};

WeekProvider.propTypes = {
    children: PropTypes.node.isRequired,
};