import { useContext, useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Armchair, Loader2 } from "lucide-react";
import { fetchTotalData, formatTimeSinceLastCheck, handleCacheClear, isCacheExpired } from "@/utils/firestoreUtils";
import { collection } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Button } from "@/components/ui/button";
import { Context } from "@/context/AuthContext";

const BOOKINGS_CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

const TotalBookings = () => {
    const { user } = useContext(Context);

    const [totalBookings, setTotalBookings] = useState(0);
    const bookingsCollectionRef = collection(db, "appointements");
    const [cachedData, setCachedData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState("")

    // Effect hook to fetch total number of bookings
    useEffect(() => {
        setLoading(true);
        // Check if data for total number of data is available in local storage
        const cachedTotalBookings = localStorage.getItem(user.uid + `bookingsTotal`);
        if (cachedTotalBookings && !isCacheExpired(JSON.parse(cachedTotalBookings), BOOKINGS_CACHE_EXPIRATION_TIME)) {
            setTotalBookings(JSON.parse(cachedTotalBookings).data);
            setLoading(false)
            setLastCheck(formatTimeSinceLastCheck(JSON.parse(cachedTotalBookings).timestamp))
        } else {
            // this is a function to fetch total data from firestore
            // it's a utility function reusable in many files
            // make sure to put the parametres in order
            fetchTotalData(bookingsCollectionRef, setTotalBookings, user.uid + "bookingsTotal", "agency", user.uid, setLoading)
            setLastCheck(formatTimeSinceLastCheck(Date.now()))
        }
    }, [cachedData]);


    return (
        <Card className="drop-shadow-2xl">
            <CardHeader className="relative">
                <CardTitle className="absolute -top-4 border rounded-xl w-20 h-20 bg-[#37373D] flex justify-center items-center">
                    <Armchair className="text-white" size={32} />
                </CardTitle>
                <CardDescription className="flex flex-col items-end">
                    <Button variant="link" className="text-base flex items-center gap-1 text-muted-foreground p-0 h-auto"
                        onClick={() => handleCacheClear(user.uid + "bookingsTotal", null, setCachedData, cachedData)}>
                        Bookings
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </Button>
                    <span className="text-2xl font-bold text-foreground">{totalBookings}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* <span className="text-green-500">+55%</span> than last week */}
                <div className="text-xs p-0 mt-3 text-right">last Check: {lastCheck}</div>
            </CardContent>
        </Card>
    );
}

export default TotalBookings;