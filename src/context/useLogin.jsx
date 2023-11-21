/* eslint-disable no-unused-vars */
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { createContext, useContext, useState } from 'react';
// import auth from '../services/firebaseConfig';

const LoginContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useLogin() {
  return useContext(LoginContext);
}

// eslint-disable-next-line react/prop-types
export function LoginProvider({ children }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e) => {
    const auth = getAuth();
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <LoginContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        handleSignIn,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
