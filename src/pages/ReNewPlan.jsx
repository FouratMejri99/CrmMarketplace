import { useContext, useEffect, useState } from "react";
import { Context } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import PlansLoading from "@/components/loading/PlansLoading";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";


const ReNewPlan = () => {
    const { user } = useContext(Context);
    const [currentPlan, setCurrentPlan] = useState([]);
    const [currentPlanLoading, setCurrentPlanLoading] = useState(true)

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const [periode, setPeriode] = useState(1)
    const [price, setPrice] = useState(0)
    const [coupon, setCoupon] = useState("")
    const [couponError, setCouponError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const plansCollectionRef = collection(db, 'plans');

    const { toast } = useToast()

    const getPlans = async () => {
        try {
            const queryRef = query(plansCollectionRef, where("showInRegistration", '==', true));
            const data = await getDocs(queryRef);
            const filteredData = data.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            if (filteredData.length) {
                setPlans(filteredData);
            }
        } catch (error) {
            console.error("Error Fetching Plans : ", error);
        } finally {
            setLoading(false);
        }
    }

    const handlePeriodeChange = (duration) => {
        const parts = duration.split("-");
        setPeriode(parseInt(parts[0], 10))
        setPrice(parseFloat(parts[1]))
    }

    const handlePlanChoice = async (plan) => {
        setIsSubmitting(true)
        setCouponError("")
        let couponDiscount = null;
        let priceValue = parseFloat(price);
        try {
            if (coupon.trim() !== "") {
                const couponRef = doc(db, "coupons", coupon.trim());
                const couponRefData = await getDoc(couponRef);
                if (couponRefData.exists()) {
                    const couponData = couponRefData.data();
                    if (couponData.agencyId !== "" && couponData.agencyId !== null && couponData.agencyId !== user.id) {
                        setCouponError("Ce coupon ne vous appartient pas")
                        return
                    }
                    const date = new Date(couponData.expirationDate.seconds * 1000);
                    const now = new Date().getTime();
                    if (date < now) {
                        setCouponError("Coupon expiré")
                        return
                    }
                    priceValue = price - (price * (couponData.solde / 100));
                    couponDiscount = couponData.solde;
                } else {
                    setCouponError("Coupon non trouvé ou expiré")
                    return
                }
            }
            const userDoc = doc(db, "agencies", user.uid);
            const subscriptionsCollectionRef = collection(userDoc, "subscriptions");

            await addDoc(subscriptionsCollectionRef, {
                agency: user.uid,
                plan: plan.id,
                name: plan.name,
                maxClients: plan.maxClients,
                maxStaff: plan.maxStaff,
                features: plan.features,
                periode: periode,
                status: "Pending",
                price: priceValue,
                created_at: serverTimestamp(),
                coupon: couponDiscount
            });

            navigate('/');
        } catch (error) {
            console.error("error Choosing plan : ", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        getPlans()
    }, [])

    useEffect(() => {
        const cachedplan = localStorage.getItem("agencyPlan" + user.uid);
        if (cachedplan && JSON.parse(cachedplan).data) {
            const cachedData = JSON.parse(cachedplan).data;
            setCurrentPlan(cachedData);
            setCurrentPlanLoading(false)
        }
    }, []);

    const handleContactFormSubmit = () => {
        console.log("haha");
    }

    return (
        <div className="">
            <h1 className="font-bold text-primary text-2xl mb-5">Renouvellement du plan</h1>
            <div className="px-10 md:px-5">
                <Carousel opts={{ align: "start", loop: true, }}>
                    <CarouselContent>
                        {loading ? <PlansLoading /> : (
                            <>
                                {plans.length > 0 ?
                                    <>
                                        {plans.map((plan, index) =>
                                            <CarouselItem className={`md:basis-auto`} key={index}>
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex flex-col md:flex-row md:items-center md:gap-4">
                                                            {plan.name}
                                                            {currentPlan.plan === plan.id &&
                                                                <CardDescription>Abonnement en cours</CardDescription>
                                                            }
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-left">
                                                        <h2 className="text-2xl font-bold underline">gestion du personnel</h2>
                                                        <ul className="list-disc p-4 pt-3 pl-9 text-secondary dark:text-secondary-foreground">
                                                            <li>Ajouter et supprimer des membres du personnel</li>
                                                            <li>Profils de base du personnel (nom, coordonnées, rôle)</li>
                                                            <li>Comptes de personnel limités <span className="font-semibold">(jusqu'à {plan.maxStaff} users)</span></li>
                                                        </ul>
                                                        <h2 className="text-2xl font-bold underline">Planification et Envoi</h2>
                                                        <ul className="list-disc p-4 pt-3 pl-9 text-secondary dark:text-secondary-foreground">
                                                            <li>Planification et affectation de base des tâches</li>
                                                            <li>Vue du calendrier pour le suivi des tâches</li>
                                                            <li>Avis d'affectation</li>
                                                        </ul>
                                                        <h2 className="text-2xl font-bold underline">Gestion des clients</h2>
                                                        <ul className="list-disc p-4 pt-3 pl-9 text-secondary dark:text-secondary-foreground">
                                                            <li>Profils de base des clients (nom, coordonnées, historique des emplois)</li>
                                                            <li>Comptes clients limités <span className="font-semibold">(jusqu'à {plan.maxClients} clients)</span></li>
                                                        </ul>
                                                        <h2 className="text-2xl font-bold underline">Rapports et soutien</h2>
                                                        <ul className="list-disc p-4 pt-3 pl-9 text-secondary dark:text-secondary-foreground">
                                                            <li>Exporter les rapports au format CSV</li>
                                                            <li>Support par email</li>
                                                        </ul>
                                                        <Accordion type="single" collapsible >
                                                            <AccordionItem value="item-1" className="border-none">
                                                                <AccordionTrigger className="text-2xl font-bold underline">Autres fonctionnalités</AccordionTrigger>
                                                                <AccordionContent>
                                                                    {plan.features.map((feature, index) => (
                                                                        <div key={index} className="pl-3">
                                                                            <h4 className="text-lg font-semibold">- {feature.featureName}</h4>
                                                                            <ul className="list-disc pl-9 text-secondary dark:text-secondary-foreground">
                                                                                {feature.descriptions.map((description, index) => (
                                                                                    <li key={index} className="text-base">{description}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                        <div className="text-center mt-5">
                                                            <Dialog onOpenChange={() => { setPeriode(plan.durations[0].duration); setPrice(plan.durations[0].price) }}>
                                                                <DialogTrigger asChild>
                                                                    <Button size="lg" className="bg-[#242323] text-white text-2xl font-semibold rounded-lg h-14 px-11">S'inscrire</Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Êtes-vous sure</DialogTitle>
                                                                        <DialogDescription>
                                                                            Cette action ne peut pas être annulée. Cette action choisira définitivement le plan "plan.name" pour votre compte.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div>
                                                                        <RadioGroup defaultValue={plan.durations[0].duration + "-" + plan.durations[0].price} className="grid grid-cols-3" onValueChange={(v) => handlePeriodeChange(v)}>
                                                                            {plan.durations.map((duration, index) => (
                                                                                <div key={index} className="flex flex-col items-center">
                                                                                    <RadioGroupItem value={duration.duration + "-" + duration.price} id={`${duration.duration}-month`} />
                                                                                    <Label htmlFor={`${duration.duration}-month`}>{duration.duration} mois</Label>
                                                                                </div>
                                                                            ))}
                                                                        </RadioGroup>
                                                                    </div>
                                                                    <div>
                                                                        Prix : <span className="font-semibold">price DT</span>
                                                                    </div>
                                                                    <div className="w-full relative">
                                                                        <Label htmlFor="coupon" className="absolute -top-1.5 left-3 bg-card">Vous Avez un coupon ?</Label>
                                                                        <Input type="text" id="coupon" placeholder="Coupon" className={`hover:border-foreground focus:border-none transition-all h-16 rounded-2xl`}
                                                                            value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                                                                        {couponError && <span className="text-destructive">{couponError}</span>}
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <Button onClick={() => handlePlanChoice(plan)} disabled={isSubmitting}>Confirmer {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />} </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </CarouselItem>
                                        )}
                                        <CarouselItem className={`md:basis-auto`} key="custom-plan-card">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className=" text-2xl font-bold">Plan Personnalisé</CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-left">
                                                    <p className="mb-4 text-lg">
                                                        Vous souhaitez un plan sur mesure ? Contactez-nous pour discuter de vos besoins spécifiques.
                                                    </p>
                                                    <div className="text-center mt-5">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button size="lg" className="bg-[#242323] text-white text-2xl font-semibold rounded-lg h-14 px-11">
                                                                    Contactez-nous
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Nous Contacter</DialogTitle>
                                                                    <DialogDescription>
                                                                        Remplissez le formulaire ci-dessous ou envoyez-nous un email pour discuter de votre plan personnalisé.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="flex flex-col gap-4">
                                                                    <Label htmlFor="name">Nom</Label>
                                                                    <Input type="text" id="name" placeholder="Votre nom" className="mb-2" />

                                                                    <Label htmlFor="email">Email</Label>
                                                                    <Input type="email" id="email" placeholder="Votre email" className="mb-2" />

                                                                    <Label htmlFor="message">Message</Label>
                                                                    <Textarea id="message" placeholder="Décrivez vos besoins" className="h-32 p-2 border rounded-md" />

                                                                    <DialogFooter className="mt-4">
                                                                        <Button onClick={() => handleContactFormSubmit()} disabled={isSubmitting}>
                                                                            Envoyer {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </CarouselItem>
                                    </>
                                    : <Card className="z-50 drop-shadow-xl mx-auto">
                                        <CardHeader className="text-center">
                                            <CardTitle>Merci de réessayer plus tard</CardTitle>
                                            <CardDescription>Plans en construction</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-center">
                                            <a href="https://tnker.tn/" target="_blank">
                                                <Button size="lg" className="bg-[#242323] text-white text-2xl font-semibold rounded-lg h-14 px-11">Visiter notre site</Button>
                                            </a>
                                        </CardContent>
                                    </Card>}
                            </>
                        )}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
}

export default ReNewPlan;