import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBX32Ts--fEjvUA_VnbwSetDmsQiSRdTSk",
  authDomain: "discordclone-bb1dc.firebaseapp.com",
  projectId: "discordclone-bb1dc",
  storageBucket: "discordclone-bb1dc.appspot.com",
  messagingSenderId: "748652341316",
  appId: "1:748652341316:web:5318bac86aacc55d93f411",
  measurementId: "G-3HXLX1RNVJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Ajoutez cette ligne pour inclure le stockage

export { auth, db, storage };
