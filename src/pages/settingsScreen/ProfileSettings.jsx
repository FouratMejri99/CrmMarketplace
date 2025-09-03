import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import PaysList from "../register/PaysList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Context } from "@/context/AuthContext";
import { db, storage } from "@/config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AccountLoading from "@/components/loading/AccountLoading";
import { isCacheExpired } from "@/utils/firestoreUtils";
import { updateProfile } from "firebase/auth";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Progress } from "@/components/ui/progress";

const CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

const ProfileSettings = ({ setScreen }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [matFiscal, setMatFiscal] = useState("");
    const [phone, setPhone] = useState("");
    const [activities, setActivities] = useState("");
    const [pays, setPays] = useState("");
    const [address, setAddress] = useState("");
    const [photoURL, setPhotoURL] = useState(null);
    const [errors, setErrors] = useState([]);

    const [agency, setAgency] = useState([]);

    const { user } = useContext(Context);
    const agencyRef = doc(db, "agencies", user.uid);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [uploadProgress, setUploadProgress] = useState(null);

    const { toast } = useToast()

    const getAgency = async () => {
        try {
            const agencyData = await getDoc(agencyRef);
            if (agencyData.exists()) {
                setAgency(agencyData.data());
                const agencyDataObject = agencyData.data();
                const { password, ...agencyDataWithoutPassword } = agencyDataObject;
                localStorage.setItem(`agency${user.uid}`, JSON.stringify({ timestamp: Date.now(), data: agencyDataWithoutPassword }));
                setActivities(agencyDataObject.activities);
                setName(agencyDataObject.name)
                setEmail(agencyDataObject.email)
                setMatFiscal(agencyDataObject.matFiscal)
                setPhone(agencyDataObject.phone)
                setAddress(agencyDataObject.address)
                setPays(agencyDataObject.pays)
                setPhotoURL(user.photoURL)
            } else {
                console.error('client does not exist');
            }
        } catch (error) {
            console.error("Error fetching agency data : ", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        const cachedAgency = localStorage.getItem("agency" + user.uid);
        if (cachedAgency && !isCacheExpired(JSON.parse(cachedAgency), CACHE_EXPIRATION_TIME)) {
            const AgencyData = JSON.parse(cachedAgency).data
            setAgency(AgencyData);
            setActivities(AgencyData.activities);
            setName(AgencyData.name)
            setEmail(AgencyData.email)
            setMatFiscal(AgencyData.matFiscal)
            setPhone(AgencyData.phone)
            setAddress(AgencyData.address)
            setPays(AgencyData.pays)
            setPhotoURL(user.photoURL)
            setLoading(false);
        } else {
            getAgency();
        }
        setScreen("info")
    }, [])

    const handleActivitiesChange = (activity, checked) => {
        if (checked) {
            // Concatenate the activity to the existing selected activities
            setActivities(prev => prev + activity + ',');
        } else {
            // Remove the activity from the selected activities
            setActivities(prev => prev.replace(activity + ',', ''));
            setActivities(prev => prev.replace(activity, ''));
        }
    };
    const handleImageChange = (e) => {
        let file = e.target.files[0]
        if (file) setPhotoURL(file)
        else setPhotoURL(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // check for empty fields
        if (name.trim() || matFiscal.trim() || phone.trim() || email.trim() || activities.trim() || pays.trim() || address.trim()) {
            setErrors({
                agencyName: !name.trim() && "Veuillez saisir le nom votre l'agence.",
                agencyMatFiscal: !matFiscal.trim() && "Veuillez saisir votre Matricule Fiscal.",
                agencyPhone: !phone.trim() && "Veuillez saisir votre Numéro de Téléphone.",
                agencyEmail: !email.trim() && "Veuillez saisir votre E-mail.",
                agencyActivities: !activities.trim() && "Veuillez cocher Vos activités.",
                agencyPays: !pays.trim() && "Veuillez sélectionner Votre pays.",
                agencyAddress: !address.trim() && "Veuillez saisir votre Adresse."
            });
        }
        if (name.trim() !== agency.name.trim() || matFiscal.trim() !== agency.matFiscal.trim() || phone.trim() !== agency.phone.trim()
            || email.trim() !== agency.email.trim() || activities.trim() !== agency.activities.trim() || pays.trim() !== agency.pays.trim()
            || address.trim() !== agency.address.trim() || phone.trim() !== agency.phone.trim() || email.trim() !== agency.email.trim()
            || activities.trim() !== agency.activities.trim() || pays.trim() !== agency.pays.trim() || address.trim() !== agency.address.trim()) {
            setIsSubmitting(true);
            try {
                // Update the agency data in Firestore
                await updateDoc(agencyRef, {
                    name: name,
                    email: email,
                    phone: phone,
                    matFiscal: matFiscal,
                    pays: pays,
                    address: address,
                    activities: activities
                });
                // update user profile 
                await updateProfile(user, {
                    displayName: name,
                    email: email
                });
                // Update the agency in the cache
                localStorage.setItem(`agency${user.uid}`, JSON.stringify({
                    timestamp: Date.now(), data: {
                        name: name,
                        email: email,
                        phone: phone,
                        matFiscal: matFiscal,
                        pays: pays,
                        address: address,
                        activities: activities,
                        created_at: agency.created_at,
                        dateStart: agency.dateStart,
                    }
                }));
                const cachedData = localStorage.getItem(`agency${user.uid}`);
                setAgency(JSON.parse(cachedData).data);
                toast({ title: "Votre profil a été mis à jour !" });
            } catch (error) {
                console.error("error updating profile : ", error);
                toast({ title: "Erreur de mise à jour de votre profil.", variant: "destructive" });
            } finally {
                setIsSubmitting(false);
            }
        }

        if (photoURL instanceof File) {
            setIsSubmitting(true);
            const fileName = new Date().getTime() + photoURL.name;
            const storageRef = ref(storage, `agency_images/${fileName}`);
            const uploadTaskSnapshot = uploadBytesResumable(storageRef, photoURL);
            uploadTaskSnapshot.on("state_changed", (snapshot) => {
                // Progress updates
                // const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                // setUploadProgress(progress);
            }, (error) => {
                // Error handling
                console.error('Error uploading image:', error);
                toast({ title: "Erreur de mise à jour de votre image de profil.", variant: "destructive" });
                setIsSubmitting(false);
            }, async () => {
                // Delete previous image from storage
                if (user.photoURL !== null) {
                    const desertRef = ref(storage, user.photoURL);
                    await deleteObject(desertRef);
                }

                // Get download URL of the newly uploaded image
                let downloadURL = await getDownloadURL(uploadTaskSnapshot.snapshot.ref);
                await updateDoc(agencyRef, {
                    photoURL: downloadURL,
                });
                await updateProfile(user, {
                    photoURL: downloadURL,
                });
                setPhotoURL(downloadURL)
                setUploadProgress(null);
                setIsSubmitting(false);
                toast({ title: "Votre image de profil a été mis à jour !" });
            })
        }

    }

    const deleteImage = async () => {
        setIsSubmitting(true)
        try {
            if (user.photoURL !== null) {
                const desertRef = ref(storage, user.photoURL);
                await deleteObject(desertRef);
                await updateDoc(agencyRef, {
                    photoURL: "",
                });
                await updateProfile(user, {
                    photoURL: "",
                });
                setPhotoURL(null)
                toast({ title: "Votre image de profil a été supprimer !" });
            }
        } catch (error) {
            console.error("error deleting profile image : ", error);
            toast({ title: "erreur de suppression de l'image de profil !", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {loading ? <AccountLoading /> :
                (<div className="lg:flex gap-6">
                    <Card className="rounded-xl xl:w-1/3 mb-8 lg:mb-0">
                        <CardHeader className="flex items-center">
                            <Avatar className="w-28 h-28 mb-6 cursor-pointer">
                                <Input type="file" id="avatarUpload" accept=".jpeg, .jpg, .png" style={{ display: 'none' }} />
                                {photoURL ? (
                                    <AvatarImage src={photoURL instanceof File ? URL.createObjectURL(photoURL) : photoURL} alt="Selected" />
                                ) : (
                                    <AvatarImage src={"/images/insta Logo.png"} />
                                )}
                                <AvatarFallback>CN</AvatarFallback>
                                <Label htmlFor="img" className="absolute h-full w-full flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                    <Camera />
                                    Modifier votre photo
                                </Label>
                            </Avatar>
                            <CardDescription className="flex flex-col items-center">
                                <span>Autorisé *.jpeg, *.jpg, *.png</span>
                                <span>Taille maximale de 3 Mo</span>
                                <input type="file" id="img" hidden onChange={(e) => handleImageChange(e)} />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-5 text-center">
                            {photoURL && <Button variant='destructive' disabled={isSubmitting} onClick={() => deleteImage()}>Supprimer l'image de votre profil {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</Button>}
                            {/* {isSubmitting && (
                                <Progress value={uploadProgress} />
                            )} */}
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl flex-1">
                        <CardHeader className="relative">
                            <CardTitle className="absolute -top-3 left-4">informations générales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => handleSubmit(e)}>
                                <div className="md:flex gap-4">
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="name" className="absolute -top-2 left-4 bg-card">Nom</Label>
                                        <Input type="text" id="name" placeholder="Nom" className={`h-16 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                            value={name} onChange={(e) => setName(e.target.value)} />
                                        {errors.agencyName && <div className="text-destructive mt-2">{errors.agencyName}</div>}
                                    </div>
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="matFiscal" className="absolute -top-2 left-4 bg-card">Matricule Fiscal</Label>
                                        <Input type="text" id="matFiscal" placeholder="Matricule Fiscal" className={`h-16 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                            value={matFiscal} onChange={(e) => setMatFiscal(e.target.value)} />
                                        {errors.agencyMatFiscal && <div className="text-destructive mt-2">{errors.agencyMatFiscal}</div>}
                                    </div>
                                </div>
                                <div className="md:flex gap-4">
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="phone" className="absolute -top-2 left-4 bg-card">Téléphone</Label>
                                        <Input type="text" id="phone" placeholder="Téléphone" className={`h-16 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                            value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        {errors.agencyPhone && <div className="text-destructive mt-2">{errors.agencyPhone}</div>}
                                    </div>
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="email" className="absolute -top-2 left-4 bg-card">E-mail</Label>
                                        <Input type="email" id="email" placeholder="email" className={`h-16 rounded-2xl hover:border-foreground focus:border-none transition-all`}
                                            value={email} onChange={(e) => setEmail(e.target.value)} />
                                        {errors.agencyEmail && <div className="text-destructive mt-2">{errors.agencyEmail}</div>}
                                    </div>
                                </div>
                                <div className="grid gap-1 mb-8">
                                    <span className="text-sm font-medium">Secteur d'activités</span>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="Plomberie" checked={activities.includes("Plomberie")} onCheckedChange={(check) => { handleActivitiesChange('Plomberie', check) }} />
                                            <Label htmlFor="Plomberie">Plomberie</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="Ménager" checked={activities.includes("Ménager")} onCheckedChange={(check) => { handleActivitiesChange('Ménager', check) }} />
                                            <Label htmlFor="Ménager">Ménager</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="Chaud/Froid" checked={activities.includes("Chaud/Froid")} onCheckedChange={(check) => { handleActivitiesChange('Chaud/Froid', check) }} />
                                            <Label htmlFor="Chaud/Froid">Chaud/Froid</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="Electricité" checked={activities.includes("Electricité")} onCheckedChange={(check) => { handleActivitiesChange('Electricité', check) }} />
                                            <Label htmlFor="Electricité">Electricité</Label>
                                        </div>
                                    </div>
                                    {errors.agencyActivities && <div className="text-destructive mt-2">{errors.agencyActivities}</div>}
                                </div>
                                <div className="md:flex gap-4">
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="pays" className="absolute -top-2 left-4 bg-card">pays</Label>
                                        <PaysList setPays={setPays} pays={pays} />
                                        {errors.agencyPays && <div className="text-destructive mt-2">{errors.agencyPays}</div>}
                                    </div>
                                    <div className="w-full relative mb-5">
                                        <Label htmlFor="address" className="absolute -top-2 left-4 bg-card">Adresse</Label>
                                        <Textarea placeholder="Adresse" id="address" className="rounded-2xl hover:border-foreground focus:border-none transition-all min-h-[63px]"
                                            value={address} onChange={(e) => setAddress(e.target.value)} />
                                        {errors.agencyAddress && <div className="text-destructive mt-2">{errors.agencyAddress}</div>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Button size="lg" className="text-md" disabled={isSubmitting} >Enregistrer {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                )
            }
        </>
    );
}

export default ProfileSettings;