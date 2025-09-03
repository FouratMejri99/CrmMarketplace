import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchFirestoreDataWithPagination, fetchTotalData, handleCacheClear, isCacheExpired } from "@/utils/firestoreUtils";
import LoadingBar from "@/components/loading/LoadingBar";
import { collection, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Context } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

const SubscriptionsScreen = ({ setScreen }) => {
    const { user } = useContext(Context);

    const [subscriptions, setSubscriptions] = useState([]);
    const [totalSubscriptions, setTotalSubscriptions] = useState(0);

    const [tableLoading, setTableLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lastDoc, setLastDoc] = useState(null); // To keep track of the last document fetched
    const [firstDoc, setFirstDoc] = useState(null);
    const [goNext, setGoNext] = useState(true) // Flag to indicate if we should go for next page or not.
    const [goPrev, setGoPrev] = useState(false) // Flag to indicate if we should go for prev page or not.
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const itemsPerPage = 5; // Number of items to fetch per page

    const [cachedData, setCachedData] = useState(true);

    const totalPages = Math.ceil(totalSubscriptions / itemsPerPage);

    const getSubscriptionsByAgency = async () => {
        const cachePrefix = `agency${user.uid}subscriptionpage`;
        const agencyRef = doc(db, "agencies", user.uid);

        const subscriptionsCollectionRef = collection(agencyRef, "subscriptions");

        // Check if data for the current page is available in local storage
        const cachedSubscriptions = localStorage.getItem(cachePrefix + currentPage);
        if (cachedSubscriptions && !isCacheExpired(JSON.parse(cachedSubscriptions), CACHE_EXPIRATION_TIME)) {
            setSubscriptions(JSON.parse(cachedSubscriptions).data);
            setTableLoading(false);
        } else {
            fetchFirestoreDataWithPagination(
                "subscriptions", subscriptionsCollectionRef, "created_at", "desc", itemsPerPage, currentPage, goNext, goPrev, lastDoc,
                setLastDoc, firstDoc, setFirstDoc, setTableLoading, setError, cachePrefix, setSubscriptions, setCurrentPage, null, null
            )
        }

        // Check if data for total number of data is available in local storage
        const cachedTotalSubscriptions = localStorage.getItem(`${cachePrefix}Total`);
        if (cachedTotalSubscriptions && !isCacheExpired(JSON.parse(cachedTotalSubscriptions), CACHE_EXPIRATION_TIME)) {
            setTotalSubscriptions(JSON.parse(cachedTotalSubscriptions).data);
        } else {
            // this is a function to fetch total data from firestore
            // it's a utility function reusable in many files
            // make sure to put the parametres in order
            fetchTotalData(subscriptionsCollectionRef, setTotalSubscriptions, `${cachePrefix}Total`, null, null)
        }
    }

    useEffect(() => {
        setScreen("subscriptions")
        getSubscriptionsByAgency();
    }, [currentPage, cachedData])

    return (
        <Card className="rounded-xl mt-5">
            <CardHeader className="relative">
                <CardTitle className="absolute -top-5 sm:left-3 left-0">
                    <Button variant="link" className="sm:text-2xl text-primary-foreground dark:text-primary text-xl font-semibold leading-none tracking-tight"
                        onClick={() => handleCacheClear(`agency${user.uid}subscriptionpage`, setCurrentPage, setCachedData, cachedData)}>
                        Liste des Abonnements {totalSubscriptions > 0 ? "(" + totalSubscriptions + ")" : ""}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-accent text-[15px]">
                        <TableRow className="h-14">
                            <TableHead>Nom</TableHead>
                            <TableHead>Max Clients</TableHead>
                            <TableHead>Max Staff</TableHead>
                            <TableHead>Prix</TableHead>
                            <TableHead>Periode</TableHead>
                            <TableHead>Date Debut</TableHead>
                            <TableHead>Date Fin</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableLoading ? ( // Render loading screen if loading state is true
                            <TableRow className="hover:bg-background">
                                <TableCell colSpan={9} className="h-20">
                                    <div className="flex justify-center">
                                        <LoadingBar className={"w-1/2 "} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) :
                            error ?
                                <TableRow className="hover:bg-background">
                                    <TableCell colSpan={8} className="h-20">
                                        <div className="flex justify-center">
                                            {error}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                :
                                subscriptions.length > 0 ?
                                    subscriptions.map((subscription) => (
                                        <TableRow key={subscription.id}>
                                            <TableCell>{subscription.name}</TableCell>
                                            <TableCell>{subscription.maxClients}</TableCell>
                                            <TableCell>{subscription.maxStaff}</TableCell>
                                            <TableCell>{subscription.price}DT {subscription.haveCoupon && "(with " + subscription.haveCoupon + "% coupon)"} </TableCell>
                                            <TableCell>{subscription.periode}</TableCell>
                                            <TableCell>
                                                {subscription.startDate ?
                                                    new Date(subscription.startDate.seconds * 1000).getFullYear() + "/" +
                                                    String(new Date(subscription.startDate.seconds * 1000).getMonth() + 1).padStart(2, '0') + "/" +
                                                    String(new Date(subscription.startDate.seconds * 1000).getDate()).padStart(2, '0') + " " +
                                                    String(new Date(subscription.startDate.seconds * 1000).getHours()).padStart(2, '0') + ":" +
                                                    String(new Date(subscription.startDate.seconds * 1000).getMinutes()).padStart(2, '0')
                                                    :
                                                    "Not Started Yet"
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {subscription.endDate ?
                                                    new Date(subscription.endDate.seconds * 1000).getFullYear() + "/" +
                                                    String(new Date(subscription.endDate.seconds * 1000).getMonth() + 1).padStart(2, '0') + "/" +
                                                    String(new Date(subscription.endDate.seconds * 1000).getDate()).padStart(2, '0') + " " +
                                                    String(new Date(subscription.endDate.seconds * 1000).getHours()).padStart(2, '0') + ":" +
                                                    String(new Date(subscription.endDate.seconds * 1000).getMinutes()).padStart(2, '0')
                                                    :
                                                    "Not Started Yet"
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${subscription.status === "Pending" && "bg-secondary"} ${subscription.status === "Active" && "bg-primary"} ${subscription.status === "Expired" && "bg-destructive text-destructive-foreground"}`}>
                                                    {subscription.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) :
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-20">
                                            <div className="flex md:justify-center">
                                                No subscriptions available
                                            </div>
                                        </TableCell>
                                    </TableRow>
                        }
                    </TableBody>
                </Table>
                {error ? "" :
                    <Pagination className={"border-t"}>
                        <PaginationContent className={"md:gap-96"}>
                            <Button variant="link" className="disabled:text-white" onClick={() => handlePrevPage(currentPage, setCurrentPage, setGoNext, setGoPrev)} disabled={tableLoading || currentPage === 1}>
                                <PaginationItem className="flex items-center">
                                    <PaginationPrevious className={"text-primary-foreground dark:text-primary"} /> {tableLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                </PaginationItem>
                            </Button>
                            <Button variant="link" className="disabled:text-white" onClick={() => handleNextPage(currentPage, setCurrentPage, setGoNext, setGoPrev)} disabled={tableLoading || subscriptions.length < itemsPerPage || currentPage >= totalPages}>
                                <PaginationItem className="flex items-center">
                                    <PaginationNext className={"text-primary-foreground dark:text-primary"} /> {tableLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                </PaginationItem>
                            </Button>
                        </PaginationContent>
                    </Pagination>
                }
            </CardContent>
        </Card>
    );
}

export default SubscriptionsScreen;