import { createContext, useContext, useReducer } from 'react';

const actionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  CLEAR_CART: 'CLEAR_CART',
};

const CartContext = createContext();

// eslint-disable-next-line react/prop-types
export const CartProvider = ({ children }) => {
  const initialState = {
    items: [],
  };

  const cartReducer = (state, action) => {
    switch (action.type) {
      case actionTypes.ADD_TO_CART:
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      case actionTypes.CLEAR_CART:
        return {
          ...state,
          items: [],
        };
      default:
        return state;
    }
  };

  const [cartState, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (item, mesa) => {
    // Aqui você pode adicionar lógica personalizada antes de despachar a ação
    dispatch({ type: actionTypes.ADD_TO_CART, payload: { item, mesa } });
  };

  return (
    <CartContext.Provider value={{ cartState, dispatch, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
