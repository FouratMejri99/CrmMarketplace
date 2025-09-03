import { useState, useEffect, createContext } from "react";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import LogoAnimated from "@/components/LogoAnimated";

export const Context = createContext();
export function AuthContext({ children }) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe;
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setLoading(false);
            if (currentUser) setUser(currentUser);
            else { setUser(null) }
        });
        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, []);
    const values = {
        user: user,
        setUser: setUser
    }
    return <Context.Provider value={values}>
        {loading ? <div className="relative hidden h-full max-h-screen dark:border-r lg:flex justify-center">
            <LogoAnimated />
        </div> : children}
    </Context.Provider>
}