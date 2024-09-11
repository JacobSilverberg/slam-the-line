import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const WeekContext = createContext();

export const WeekProvider = ({ children }) => {
  const [week, setWeek] = useState(0); // Default week is 1

  useEffect(() => {
    const calculateCurrentNFLWeek = () => {
      const currentDate = new Date();
      const startDate = new Date('2024-09-03'); // Tuesday, Sept 3, 2024

      // Calculate the difference in days from the start date
      const timeDiffInMilliseconds = currentDate.getTime() - startDate.getTime();
      const dayDiff = Math.floor(timeDiffInMilliseconds / (1000 * 3600 * 24));

      // Calculate the current week (each week starts on Tuesday)
      const currentWeek = Math.floor(dayDiff / 7) + 1;

      if (currentWeek >= 1 && currentWeek <= 18) {
        setWeek(currentWeek);
      } else {
        setWeek(0); // Default to week 1 if out of range
      }
    };

    calculateCurrentNFLWeek();
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
