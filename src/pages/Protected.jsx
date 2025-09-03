import LogoAnimated from "@/components/LogoAnimated";
import { db } from "@/config/firebase";
import { Context } from "@/context/AuthContext";
import { isCacheExpired } from "@/utils/firestoreUtils";
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

export const Protected = ({ children }) => {
    const { user } = useContext(Context);
    const location = useLocation();
    const [loading, setLoading] = useState(true)
    if (!user) {
        return <Navigate to={'/login'} replace />
    } else {
        const [lastPlan, setLastPlan] = useState(null);
        const navigate = useNavigate();
        const agencyDoc = doc(db, "agencies", user.uid);
        const subscriptionsCollectionRef = collection(agencyDoc, "subscriptions");

        const fetchLastPlan = async () => {
            try {
                const querySnapshot = await getDocs(query(subscriptionsCollectionRef, where("status", "==", "Active"), orderBy('created_at', 'desc'), limit(1)));
                if (!querySnapshot.empty) {
                    const lastPlanData = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
                    if (new Date() > new Date(lastPlanData.endDate.seconds * 1000 + lastPlanData.endDate.nanoseconds / 1000000)) {
                        await updateDoc(querySnapshot.docs[0].ref, {
                            status: "Expired"
                        })
                        console.log("The Plans is Expired")
                        navigate("/plans?expired=true", { state: { lastPlanData: lastPlanData } })
                    }
                    setLastPlan(lastPlanData);
                    localStorage.setItem("agencyPlan" + user.uid, JSON.stringify({ timestamp: Date.now(), data: lastPlanData }));
                    if (location.pathname === "/plans") {
                        navigate("/")
                    }
                    return
                }
                const querySnapshotPending = await getDocs(query(subscriptionsCollectionRef, where("status", "==", "Pending"), orderBy('created_at', 'desc'), limit(1)));
                if (!querySnapshotPending.empty) {
                    const lastPlanPendingData = querySnapshotPending.docs[0].data();
                    console.log("Votre abonnement est toujours en attente de paiement")
                    navigate("/plans?pending=true", { state: { lastPlanData: lastPlanPendingData } })
                    return;
                }
                const querySnapshotExpired = await getDocs(query(subscriptionsCollectionRef, where("status", "==", "Expired"), orderBy('created_at', 'desc'), limit(1)));
                if (!querySnapshotExpired.empty) {
                    const lastPlanExpiredData = querySnapshotExpired.docs[0].data();
                    console.log("Votre abonnement est expiré")
                    navigate("/plans?expired=true", { state: { lastPlanData: lastPlanExpiredData } })
                    return;
                }
                setLoading(false)
                console.log('No plans found for this user.');
                navigate("/plans")
            } catch (error) {
                console.error('Error fetching last plan:', error);
            }
        };

        useEffect(() => {
            // Check if data for the current page is available in local storage
            const cachedplan = localStorage.getItem("agencyPlan" + user.uid);
            if (cachedplan && JSON.parse(cachedplan).data && !isCacheExpired(JSON.parse(cachedplan), CACHE_EXPIRATION_TIME)) {
                const cachedData = JSON.parse(cachedplan).data;
                if (new Date() > new Date(cachedData.endDate.seconds * 1000 + cachedData.endDate.nanoseconds / 1000000)) {
                    if (cachedData.status !== "Expired") {
                        const subscriptionDocRef = doc(db, `agencies/${user.uid}/subscriptions/${cachedData.id}`);
                        const updateStat = async () => {
                            await updateDoc(subscriptionDocRef, {
                                status: "Expired",
                            });
                            const updatedCachedData = { ...cachedData, status: "Expired" }
                            localStorage.setItem("agencyPlan" + user.uid, JSON.stringify({ timestamp: Date.now(), data: updatedCachedData }));
                            console.log("The Plans is Expired")
                            navigate("/plans?expired=true", { state: { lastPlanData: updatedCachedData } })
                        }
                        updateStat()
                    } else {
                        console.log("The Plans is Expired")
                        navigate("/plans?expired=true", { state: { lastPlanData: cachedData } })
                    }
                }
                setLoading(false)
            } else {
                fetchLastPlan()
            }
        }, [loading])
        if (loading)
            return <div className="relative hidden h-full max-h-screen dark:border-r lg:flex justify-center"><LogoAnimated /></div>;
        else
            return children
    }
}
