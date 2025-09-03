import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import PaysList from "./PaysList";
import { Label } from "@/components/ui/label";
import DatePicker from "@/components/DatePicker";
import TermConditionDialog from "./TermConditionDialog";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { OrbitingCirclesDemo } from "@/components/OrbitingCirclesDemo";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"


const Register = () => {
    const [step, setStep] = useState(1);

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const [pays, setPays] = useState('');
    const [paysError, setPaysError] = useState('');

    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState('');

    const [matFiscal, setMatFiscal] = useState('');
    const [matFiscalError, setMatFiscalError] = useState('');

    const [activities, setActivities] = useState('');
    const [activitiesError, setActivitiesError] = useState('');

    const [dateStart, setDateStart] = useState('');
    const [dateStartError, setDateStartError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [termConditionCheck, setTermConditionCheck] = useState('');
    const [termConditionCheckError, setTermConditionCheckError] = useState('');

    const [signUpError, setSignUpError] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const { toast } = useToast()

    const handleActivitiesChange = (activity, checked) => {
        if (checked) {
            // Concatenate the activity to the existing selected activities
            setActivities(prev => prev + activity + ',');
        } else {
            // Remove the activity from the selected activities
            setActivities(prev => prev.replace(activity + ',', ''));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            setNameError("")
            setEmailError('');
            setPhoneError('');
            setPaysError('');
            setAddressError('');

            if (!name.trim()) {
                setNameError('Le nom ne peut pas être vide');
                return;
            }
            if (!email.trim()) {
                setEmailError('L\'e-mail ne peut pas être vide');
                return;
            }
            //check if email is in email patern ?
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                setEmailError('Entrer un e-mail valide');
                return;
            }
            if (!phone.trim()) {
                setPhoneError('Le numéro de téléphone ne peut pas être vide');
                return;
            }
            if (!pays.trim()) {
                setPaysError('Sélectionner une ville');
                return;
            }
            if (!address.trim()) {
                setAddressError('L\'adresse ne peut pas être vide');
                return;
            }

            setStep(2)
        }
        if (step === 2) {
            setMatFiscalError("")
            setActivitiesError("")
            setDateStartError("")

            if (!matFiscal.trim()) {
                setMatFiscalError('La matricule fiscale ne peut pas être vide');
                return;
            }
            if (!activities.trim()) {
                setActivitiesError('Sélectionner au moins une activité');
                return;
            }
            if (!dateStart.trim()) {
                setDateStartError('Sélectionner une date');
                return;
            }

            setStep(3)
        }
    }
    const handlePrev = () => {
        if (step === 2) {
            setStep(1)
        }
        if (step === 3) {
            setStep(2)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setConfirmPasswordError('');
        setTermConditionCheckError('');
        setEmailError('');

        if (!password.trim()) {
            setPasswordError('Le mot de passe ne peut pas être vide');
            return;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError('Le mot de passe ne correspond pas');
            return;
        }
        if (!termConditionCheck) {
            setTermConditionCheckError('Merci d\'accepter les règle et conditions');
            return;
        }

        setIsLoading(true);
        try {
            // Create a new user agency
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: name,
            });

            // Create a new document in Firestore for the agency data
            await setDoc(doc(db, "agencies", userCredential.user.uid), {
                name: name,
                email: email,
                phone: phone,
                pays: pays,
                address: address,
                matFiscal: matFiscal,
                activities: activities.endsWith(',') ? activities.slice(0, -1) : activities,
                dateStart: dateStart,
                password: password,
                created_at: serverTimestamp()
            })
            toast({ title: "Compte créé avec succès!" })
            navigate("/login")
        } catch (error) {
            console.log("error in creating account: ", error)
            console.log(error?.code)

            // Handle errors based on error code or message (e.g., display user-friendly messages)
            switch (error.code) {
                case 'auth/weak-password':
                    setSignUpError("Le mot de passe doit comporter au moins 6 caractères.");
                    break;
                case 'auth/invalid-email':
                    setSignUpError("Format de email non valide.");
                    setStep(1)
                    break;
                case 'auth/email-already-in-use':
                    setSignUpError("Email déjà utilisé!");
                    setEmailError('Mercie de changer votre email');
                    setStep(1)
                    break;
                // Handle other potential error codes
                default:
                    setSignUpError("Une erreur est survenue. Veuillez réessayer.");
                    setStep(1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen grid grid-cols-1 lg:grid-cols-2">
            <div className="hidden lg:flex">
                <OrbitingCirclesDemo />
            </div>
            <div className="p-2 md:px-5 flex items-center justify-center">
                <Card className="drop-shadow-2xl w-full">
                    <CardHeader className="p-0 items-center">
                        <img src="/images/Logo Tinker black T.svg" alt="Tnker Logo" className="max-w-64 lg:w-48" />
                    </CardHeader>
                    <CardContent className="px-2 pb-2">
                        <form onSubmit={handleSubmit}>
                            {/* first step */}
                            <div className={`flex items-center gap-1 font-bold transition-all ${step !== 1 && "text-secondary"}`}>
                                <span className={`flex items-center justify-center min-w-8 h-8 border-2 border-accent rounded-full text-lg ${step === 1 && "bg-primary"} `}>1</span>
                                <span>Information Générale</span>
                            </div>
                            <div className={`pr-1 transition-all ease-out overflow-hidden ${step !== 1 ? "max-h-0 opacity-0 duration-0 hidden" : "max-h-screen opacity-100 duration-500"}`}>
                                <div className={`border-l-2 border-primary ml-4 pl-2 py-2`}>
                                    <div className="grid gap-2">
                                        <div className="grid gap-1">
                                            {nameError && <p className="text-destructive">{nameError}</p>}
                                            <Input
                                                id="name"
                                                placeholder="Nom / Raison sociale"
                                                type="text"
                                                autoCapitalize="none"
                                                autoComplete="name"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                className={`${nameError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            {emailError && <p className="text-destructive">{emailError}</p>}
                                            <Input
                                                id="email"
                                                placeholder="Entrer l'adresse e-mail"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                className={`${emailError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            {phoneError && <p className="text-destructive">{phoneError}</p>}
                                            <Input
                                                id="phone"
                                                placeholder="Entrer le numéro de téléphone"
                                                type="text"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                className={`${phoneError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            {paysError && <p className="text-destructive">{paysError}</p>}
                                            <PaysList setPays={setPays} paysError={paysError} />
                                        </div>
                                        <div className="grid gap-1">
                                            {addressError && <p className="text-destructive">{addressError}</p>}
                                            <Input
                                                id="address"
                                                placeholder="entrer l'adresse"
                                                type="text"
                                                disabled={isLoading}
                                                className={`${addressError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                            <span className="text-xs">fournir le lien de Google Maps indiquant votre adresse</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="button" className="w-1/2 mt-5 font-bold uppercase tracking-wider h-16 lg:h-12 rounded-2xl bg-[#242323] text-white hover:text-primary-foreground"
                                            onClick={() => handleNext()}>Suivant</Button>
                                    </div>
                                </div>
                            </div>
                            {/* second step */}
                            <div className={`mt-2 flex items-center gap-1 font-bold transition-all ${step !== 2 && "text-secondary"}`}>
                                <span className={`flex items-center justify-center min-w-8 h-8 border-2 border-accent rounded-full text-lg ${step === 2 && "bg-primary"} `}>2</span>
                                <span>Information Juridique</span>
                            </div>
                            <div className={`pr-1 transition-all  ease-out overflow-hidden ${step !== 2 ? "max-h-0 opacity-0 duration-0 hidden" : "max-h-screen opacity-100 duration-500"}`}>
                                <div className={`border-l-2 border-primary ml-4 pl-2 py-2`}>
                                    <div className="grid gap-4">
                                        <div className="grid gap-1">
                                            {matFiscalError && <p className="text-destructive">{matFiscalError}</p>}
                                            <Input
                                                id="fiscal"
                                                placeholder="Matricul Fiscal"
                                                type="text"
                                                autoCapitalize="none"
                                                autoComplete="fiscal"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                className={`${matFiscalError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setMatFiscal(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="font-medium">Secteur d'activités</span>
                                            {activitiesError && <p className="text-destructive">{activitiesError}</p>}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="Plomberie" onCheckedChange={(check) => { handleActivitiesChange('Plomberie', check) }} />
                                                    <Label htmlFor="Plomberie">Plomberie</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="Ménager" onCheckedChange={(check) => { handleActivitiesChange('Ménager', check) }} />
                                                    <Label htmlFor="Ménager">Ménager</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="Chaud/Froid" onCheckedChange={(check) => { handleActivitiesChange('Chaud/Froid', check) }} />
                                                    <Label htmlFor="Chaud/Froid">Chaud/Froid</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="Electricité" onCheckedChange={(check) => { handleActivitiesChange('Electricité', check) }} />
                                                    <Label htmlFor="Electricité">Electricité</Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid gap-1">
                                            <span className="font-medium">Date debut</span>
                                            {dateStartError && <p className="text-destructive">{dateStartError}</p>}
                                            <DatePicker setDateStart={setDateStart} />
                                        </div>
                                        <div className="mt-7 flex gap-2">
                                            <Button variant="outline" type="button" className="w-full font-bold uppercase tracking-wider h-16 lg:h-12 rounded-2xl"
                                                onClick={() => handlePrev()}>Précédent</Button>
                                            <Button type="button" className="w-full font-bold uppercase tracking-wider h-16 lg:h-12 rounded-2xl bg-[#242323] text-white hover:text-primary-foreground"
                                                onClick={() => handleNext()}>Suivant</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* third step */}
                            <div className={`mt-2 flex items-center gap-1 font-bold transition-all ${step !== 3 && "text-secondary"} `}>
                                <span className={`flex items-center justify-center min-w-8 h-8 border-2 border-accent rounded-full text-lg ${step === 3 && "bg-primary"} `}>3</span>
                                <span>Securité</span>
                            </div>
                            <div className={`pr-1 transition-all ease-out overflow-hidden ${step !== 3 ? "max-h-0 opacity-0 duration-0 hidden" : "max-h-screen opacity-100 duration-500"}`}>
                                <div className={`ml-4 pl-2 py-2`}>
                                    <div className="grid gap-4">
                                        <div className="grid gap-1">
                                            {passwordError && <p className="text-destructive">{passwordError}</p>}
                                            <Input
                                                id="password"
                                                placeholder="Entrer le mot de passe"
                                                type="password"
                                                disabled={isLoading}
                                                className={`${passwordError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1">
                                            {confirmPasswordError && <p className="text-destructive">{confirmPasswordError}</p>}
                                            <Input
                                                id="confirmpassword"
                                                placeholder="confirmer le mot de passe"
                                                type="password"
                                                disabled={isLoading}
                                                className={`${confirmPasswordError ? "border-destructive" : ""} h-16 lg:h-12 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="terms" onCheckedChange={(v) => setTermConditionCheck(v)} />
                                                <label
                                                    htmlFor="terms"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Accepter les <TermConditionDialog message={"règles et conditions"} />  de Tnker Pro
                                                </label>
                                            </div>
                                            {termConditionCheckError && <p className="text-destructive">{termConditionCheckError}</p>}
                                        </div>
                                        <div className="mt-7 flex gap-2">
                                            <Button disabled={isLoading} type="button" variant="outline" className="w-full font-bold uppercase tracking-wider h-16 lg:h-12 rounded-2xl"
                                                onClick={() => handlePrev()}>Précédent</Button>
                                            <Button disabled={isLoading} className="w-full font-bold uppercase tracking-wider h-16 lg:h-12 rounded-2xl bg-[#242323] text-white hover:text-primary-foreground"
                                                type="submit">
                                                {isLoading && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                S'inscrire
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {signUpError &&
                                <div className="mt-5">
                                    <p className="text-destructive text-center">{signUpError}</p>
                                </div>
                            }
                        </form>
                    </CardContent>
                    <div className="flex items-center flex-col md:flex-row justify-end gap-1 text-muted-foreground px-3 mt-3">
                        Vous avez déjà un compte?
                        <Link to={'/login'} className="font-bold hover:underline uppercase">
                            Connectez-vous
                        </Link>
                    </div>
                    <CardFooter className="justify-center pb-3 mt-3">
                        ©{new Date().getFullYear()} Ste Tnker
                    </CardFooter>
                </Card>

            </div>
        </main>
    );
}

export default Register;