import { useContext, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { db } from "@/config/firebase";
import { arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { Context } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";



const AddTnkersPro = ({ setCurrentPage, setTnkersPro, totalTnkersPro, setTotalTnkersPro, roles, setRoles,
    totalTnkersProAPPROVED, setTotalTnkersProAPPROVED, totalTnkersProOPENED, setTotalTnkersProOPENED, totalTnkersProREJECTED, setTotalTnkersProREJECTED,
    totalTnkersProBLOCKED, setTotalTnkersProBLOCKED, setFilteredTnkersPro
}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uidError, setUidError] = useState("");
    const [submitErrors, setSubmitErrors] = useState("");
    const [uid, setUid] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false);

    const tnkersProCollectionRef = collection(db, 'users');
    const agencyCollectionRef = collection(db, 'agencies');

    const { user } = useContext(Context);

    const TNKERPRO_LOCAL_STORAGE_KEY_PREFIX = user.uid + 'tnkerproDataPage';

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitErrors("")
        setUidError("")

        if (!uid.trim()) {
            setUidError("Please enter blog title.");
            return;
        }

        setIsSubmitting(true)

        const userDocRef = doc(tnkersProCollectionRef, uid);
        try {
            const userData = await fetchUserData(userDocRef);

            if (!userData) {
                setUidError("Le bricoleur que vous cherchez n'existe pas");
                return;
            }

            if ("agency" in userData) {
                if (userData.agency === user.uid) setUidError("Cet utilisateur est déjà ajouté à votre agence.");
                else setUidError("Cet utilisateur est déjà ajouté à une autre agence.");

                return;
            }

            if (userData.runtimeType !== "handyman") {
                setUidError("Cet utilisateur n'est pas un bricoleur.");
                return;
            }

            await updateAgency(userDocRef, user.uid, userData);
        } catch (error) {
            console.error("Error handling form submission: ", error);
            setSubmitErrors("Erreur d'ajout de bricoleur");
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchUserData = async (userDocRef) => {
        try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user data: ", error);
            throw new Error("Erreur lors de la récupération des données de l'utilisateur");
        }
    };

    const updateAgency = async (userDocRef, agencyId, userData) => {
        try {
            await updateDoc(userDocRef, {
                agency: agencyId
            });

            // add the id of the handyman to the agency doc 
            const agencyDocRef = doc(agencyCollectionRef, agencyId);
            await updateDoc(agencyDocRef, {
                tnkerspro: arrayUnion(uid)
            });

            // Retrieve existing cached data
            const cachedData = localStorage.getItem(TNKERPRO_LOCAL_STORAGE_KEY_PREFIX);
            let cachedDataArray = [];
            if (cachedData) {
                cachedDataArray = JSON.parse(cachedData).data;
            }

            // Prepend the new tnkerPro data to the existing cached data
            const updatedCachedData = {
                timestamp: Date.now(),
                data: [userData, ...cachedDataArray] // Insert at the beginning
            };

            // Update the cache with the combined data
            localStorage.setItem(TNKERPRO_LOCAL_STORAGE_KEY_PREFIX, JSON.stringify(updatedCachedData));
            setTnkersPro(updatedCachedData.data);
            setFilteredTnkersPro(updatedCachedData.data)
            setTotalTnkersPro(totalTnkersPro + 1);

            // to be continued error here is that this is all the data i only need the suer data
            switch (userData.status) {
                case "APPROVED":
                    setTotalTnkersProAPPROVED(totalTnkersProAPPROVED + 1);;
                    break;
                case "OPENED":
                    setTotalTnkersProOPENED(totalTnkersProOPENED + 1);
                    break;
                case "REJECTED":
                    setTotalTnkersProREJECTED(totalTnkersProREJECTED + 1);
                    break;
                case "BLOCKED":
                    setTotalTnkersProBLOCKED(totalTnkersProBLOCKED + 1);
                    break;
                default:
                    break;
            }
            // localStorage.setItem(user.uid + "tnkerproDataPageTotal", JSON.stringify({ timestamp: Date.now(), data: totalTnkersPro + 1 }));
            // setCurrentPage(1)
            0
            // Check if the newData already exists in the roles array
            if (!roles.includes(updatedCachedData.data.domaine_exp)) {
                // Update the roles array with the new data
                setRoles(prevRoles => [...prevRoles, updatedCachedData.data.domaine_exp]);
            }

            // Reset form fields and states
            setUid("");
            toast({ title: "Bricoleur ajouté à votre agence!" })
            setDialogOpen(false)
        } catch (error) {
            console.error("Error adding agency: ", error);
            throw new Error("Erreur d'ajout de bricoleur");
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
            <DialogTrigger asChild>
                <Button size="sm" className="md:ml-auto font-semibold bg-[#242323] dark:bg-primary text-white dark:text-background hover:text-primary-foreground"><Plus /> Ajouter un bricoleur</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un bricoleur a votre agence</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="mt-3">
                    <div className="w-full relative mb-4">
                        <Label htmlFor="UID" className="absolute -top-2 left-3 bg-card">Utilisateur UID</Label>
                        <Input type="text" id="UID" placeholder="UID" className={`py-6 hover:border-foreground focus:border-none focus-visible:ring-offset-0 ${uidError && "border-destructive"}`}
                            value={uid} onChange={(e) => setUid(e.target.value)} />
                        {uidError && <span className="text-destructive">{uidError}</span>}
                    </div>
                    {submitErrors && <div className="text-destructive text-center mb-4">{submitErrors}</div>}
                    <DialogFooter className="flex-col sm:justify-between">
                        <Button className="w-full mb-4 sm:mb-0" type="submit" disabled={isSubmitting}>Enregistrer {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</Button>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" className="w-full">
                                Fermer
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}

export default AddTnkersPro;