import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../app/firebaseConfig';

const useSession = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const q = query(collection(db, "users"), where("uid", "==", currentUser.uid));
        getDocs(q)
          .then((docs) => {
            docs.forEach((doc) => {
              if (doc.exists()) {
                setUser({ id: doc.id, ...doc.data()});
              }
            })
          });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();  
  }, []);

  return user;
};

export default useSession;
