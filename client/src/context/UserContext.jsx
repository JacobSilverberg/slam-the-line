import React, { createContext, useState } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create the UserContextProvider component
// import};

import PropTypes from 'prop-types';

export const UserContextProvider = ({ children }) => {
    const [userId, setUserId] = useState('');

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
