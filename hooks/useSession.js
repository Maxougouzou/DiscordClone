import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const useSession = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // L'utilisateur est connecté
        setUser(currentUser);
      } else {
        // L'utilisateur n'est pas connecté
        setUser(null);
      }
    });

    return () => unsubscribe();  // Nettoyer l'abonnement
  }, []);

  return user;
};

export default useSession;
