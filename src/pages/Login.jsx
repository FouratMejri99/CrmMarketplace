import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { OrbitingCirclesDemo } from "@/components/OrbitingCirclesDemo";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [signInError, setSignInError] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSignInError("")
        setEmailError('');
        setPasswordError('');

        if (!email.trim()) {
            setEmailError('L\'email ne peut pas être vide');
            return;
        }

        if (!password.trim()) {
            setPasswordError('Le mot de passe ne peut pas être vide');
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user document exists in Firestore
            const agencyRef = doc(db, "agencies", user.uid);
            const agencyDoc = await getDoc(agencyRef);

            if (!agencyDoc.exists()) {
                // User not found in agency collection, handle non-agency case
                setSignInError('Compte de l\'agence introuvable !');

                // Logout non-agency user
                await auth.signOut();

                return; // Exit the function
            } else
                navigate('/');

        } catch (error) {
            setPassword('')
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setSignInError('Email ou mot de passe non valide');
            } else {
                console.error('Error signing in:', error);
                setSignInError('Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <main className="h-screen grid lg:grid-cols-2 font-baloo2">
            <div className="hidden lg:flex">
                <OrbitingCirclesDemo />
            </div>
            <div className="p-2 self-center md:mx-20 lg:mx-0 xl:mx-20 2xl:mx-48">
                <Card className="drop-shadow-xl">
                    <CardHeader>
                        <CardDescription className="flex justify-center"><img src="/images/Logo Tinker black T.svg" alt="Tnker Logo" className="max-w-64" /></CardDescription>
                        {/* <CardTitle className="text-[1.25rem]">Connectez-vous à Tnker Pro</CardTitle>
                        <CardDescription>Agency Edition</CardDescription> */}
                    </CardHeader>
                    <CardContent className="px-10">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-10">
                                <div className="grid gap-1">
                                    {emailError && <p className="text-destructive">{emailError}</p>}
                                    <Input
                                        id="email"
                                        placeholder="Enter Email Address"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        className={`${emailError ? "border-destructive" : ""} hover:border-foreground focus:border-none transition-all h-16 rounded-2xl`}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-1">
                                    {passwordError && <p className="text-destructive">{passwordError}</p>}
                                    <Input
                                        id="password"
                                        placeholder="Enter password"
                                        type="password"
                                        disabled={isLoading}
                                        className={`${passwordError ? "border-destructive" : ""} py-6 hover:border-foreground focus:border-none transition-all h-16 rounded-2xl`}
                                        onChange={(e) => setPassword(e.target.value)}
                                        value={password}
                                    />
                                </div>
                                {signInError && <p className="text-destructive text-center">{signInError}</p>}
                                <div className="text-right text-sm text-muted-foreground">
                                    <Link href="#" className="underline underline-offset-4 hover:text-primary">Mot de passe oublié?</Link>
                                </div>
                                <div className="mt-10 grid md:grid-cols-2  gap-2">
                                    <Button disabled={isLoading} className="font-bold rounded-2xl uppercase tracking-wider h-16  bg-[#242323] text-white hover:text-primary-foreground"
                                        type="submit">
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Connectez-vous
                                    </Button>
                                    <Link to={"/register"} className="">
                                        <Button variant="outline" disabled={isLoading} className="font-bold rounded-2xl uppercase tracking-wider h-16 w-full" type="button">
                                            Créer un compte
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-3">
                        ©{new Date().getFullYear()} Ste Tnker
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}

export default Login;