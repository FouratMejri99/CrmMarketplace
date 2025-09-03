import { useContext, useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BarChart2, Loader2 } from "lucide-react";
import { collection } from "firebase/firestore";
import { db } from "@/config/firebase";
import { fetchTotalData, formatTimeSinceLastCheck, handleCacheClear, isCacheExpired } from "@/utils/firestoreUtils";
import { Button } from "@/components/ui/button";
import { Context } from "@/context/AuthContext";

const CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

const TotalUsers = () => {
    const { user } = useContext(Context);

    const [totalUsers, setTotalUsers] = useState(0);
    const [totalTnkersPro, setTotalTnkersPro] = useState(0);
    const [totalTnkers, setTotalTnkers] = useState(0);
    const usersCollectionRef = collection(db, "users");
    const [cachedData, setCachedData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState("")

    // Effect hook to fetch total number of Users
    useEffect(() => {
        setLoading(true);
        // Check if data for total number of data is available in local storage
        const cachedTotalUsers = localStorage.getItem(user.uid + `usersTotal`);
        if (cachedTotalUsers && !isCacheExpired(JSON.parse(cachedTotalUsers), CACHE_EXPIRATION_TIME)) {
            setTotalUsers(JSON.parse(cachedTotalUsers).data);
            setLoading(false)
            setLastCheck(formatTimeSinceLastCheck(JSON.parse(cachedTotalUsers).timestamp))
        } else {
            // this is a function to fetch total data from firestore
            // it's a utility function reusable in many files
            // make sure to put the parametres in order
            fetchTotalData(usersCollectionRef, setTotalUsers, user.uid + "usersTotal", 'agency', user.uid, setLoading)
            setLastCheck(formatTimeSinceLastCheck(Date.now()))
        }
    }, [cachedData]);

    return (
        <Card className="drop-shadow-2xl">
            <CardHeader className="relative">
                <CardTitle className="absolute -top-4 border rounded-xl w-20 h-20 bg-[#3F98EE] flex justify-center items-center">
                    <BarChart2 className="text-white" size={32} />
                </CardTitle>
                <CardDescription className="flex flex-col items-end">
                    <Button variant="link" className="text-base text-muted-foreground p-0 h-auto"
                        onClick={() => handleCacheClear([user.uid + "usersTotal", "DashboardtnkersTotal", "DashboardtnkersproTotal"], null, setCachedData, cachedData)}>
                        Total Users
                    </Button>
                    <span className="text-2xl font-bold text-foreground">{loading ? <Loader2 className="animate-spin" /> : totalUsers}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs p-0 mt-3 text-right">last Check: {lastCheck}</div>
            </CardContent>
        </Card>
    );
}

export default TotalUsers;