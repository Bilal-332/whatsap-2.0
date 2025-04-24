import "@/styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth , db } from "../firebase";
import Login from "./login";
import Loading from "@/components/Loading";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
export default function App({ Component, pageProps }) {
  const [user , loading] = useAuthState(auth);
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        email: user.email,
        lastSeen: serverTimestamp(),
        photoURL: user.photoURL,
      });
    }
  }, [user]);
  

  if (loading) return <Loading/>; // You can add a loading spinner here
  if (!user) return <Login />;
  
  return <Component {...pageProps} />;
}
