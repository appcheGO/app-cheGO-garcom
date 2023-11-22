import{ createContext, useContext, useState } from "react";

const MenuContext = createContext();

// eslint-disable-next-line react/prop-types
export const MenuProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const addToSelectedItems = (item) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
  };

  return (
    <MenuContext.Provider value={{ selectedItems, addToSelectedItems }}>
      {children}
    </MenuContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMenu = () => {
  return useContext(MenuContext);
};
