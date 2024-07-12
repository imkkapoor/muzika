import { createContext, useState } from "react";

const User = createContext();

const UserContext = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    return (
        <User.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </User.Provider>
    );
};

export { UserContext, User };
