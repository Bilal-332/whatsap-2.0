import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth , GoogleAuthProvider} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAiowqFscDXt0jzb_0yAJ-4wFULXRlTfZQ",
    authDomain: "whatsap-clone-2.firebaseapp.com",
    projectId: "whatsap-clone-2",
    storageBucket: "whatsap-clone-2.firebasestorage.app",
    messagingSenderId: "943496221703",
    appId: "1:943496221703:web:64da59fc1bd4f2f56946a2"
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore and Auth services
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
    
export { db, auth, provider };