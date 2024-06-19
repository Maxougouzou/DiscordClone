import React, { useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig'; // Assurez-vous que le chemin est correct

function AuthObserver() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Utilisateur connecté", user.uid);
      } else {
        console.log("Utilisateur déconnecté");
      }
    });

    return () => unsubscribe();
  }, []);

  return <div>Vérifiez la console pour le statut de connexion</div>;
}

export default AuthObserver;
