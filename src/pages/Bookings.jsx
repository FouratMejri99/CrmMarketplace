import LoadingBar from "@/components/loading/LoadingBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { db } from "@/config/firebase";
import { Context } from "@/context/AuthContext";
import { fetchFirestoreDataWithPagination, fetchTotalData, formatTimeSinceLastCheck, isCacheExpired } from "@/utils/firestoreUtils";
import { collection } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";

const BOOKINGS_CACHE_EXPIRATION_TIME = 60 * 60 * 1000;


const Bookings = () => {
    const { user } = useContext(Context);

    const [bookings, setBookings] = useState([]);
    const [totalBookings, setTotalBookings] = useState(0);

    const [tableLoading, setTableLoading] = useState(true);
    const [error, setError] = useState(null);

    const [lastDoc, setLastDoc] = useState(null); // To keep track of the last document fetched
    const [firstDoc, setFirstDoc] = useState(null);
    const [goNext, setGoNext] = useState(true) // Flag to indicate if we should go for next page or not.
    const [goPrev, setGoPrev] = useState(false) // Flag to indicate if we should go for prev page or not.
    const [currentPage, setCurrentPage] = useState(1); // Current page
    const itemsPerPage = 5; // Number of items to fetch per page
    const bookingsCollectionRef = collection(db, "appointements");

    const [cachedData, setCachedData] = useState(true);

    const totalPages = Math.ceil(totalBookings / itemsPerPage);
    const [lastCheck, setLastCheck] = useState("")


    const getAppointments = async () => {
        const cachePrefix = `${user.uid}bookingpage`
        // Check if data for the current page is available in local storage
        const cachedBookings = localStorage.getItem(cachePrefix + currentPage);
        if (cachedBookings && JSON.parse(cachedBookings).data.length && !isCacheExpired(JSON.parse(cachedBookings), BOOKINGS_CACHE_EXPIRATION_TIME)) {
            setBookings(JSON.parse(cachedBookings).data);
            setTableLoading(false);
            setLastCheck(formatTimeSinceLastCheck(JSON.parse(cachedBookings).timestamp))
        } else {
            // this is a function to fetch data from firestore
            // it's a utility function reusable in many files
            // make sure to put the parametres in order
            fetchFirestoreDataWithPagination(
                "appointements", bookingsCollectionRef, "created_at", "desc", itemsPerPage, currentPage, goNext, goPrev, lastDoc,
                setLastDoc, firstDoc, setFirstDoc, setTableLoading, setError, cachePrefix, setBookings, setCurrentPage, "agency", user.uid
            )
            setLastCheck(formatTimeSinceLastCheck(Date.now()))
        }

        // Check if data for total number of data is available in local storage
        const cachedTotalBookings = localStorage.getItem(`${user.uid}bookingpageTotal`);
        if (cachedTotalBookings && !isCacheExpired(JSON.parse(cachedTotalBookings), BOOKINGS_CACHE_EXPIRATION_TIME)) {
            setTotalBookings(JSON.parse(cachedTotalBookings).data);
        } else {
            // this is a function to fetch total data from firestore
            // it's a utility function reusable in many files
            // make sure to put the parametres in order
            fetchTotalData(bookingsCollectionRef, setTotalBookings, `${user.uid}bookingpageTotal`, "agency", user.uid)
        }
    };

    useEffect(() => {
        getAppointments();
    }, [currentPage, cachedData])
    return (
        <Card className="border-transparent bg-background">
            <CardHeader className="p-0 md:px-6 md:pt-6">
                <CardTitle className="text-xl sm:text-2xl text-primary-foreground dark:text-primary">
                    <Button variant="link" className="sm:text-2xl text-primary-foreground dark:text-primary text-2xl font-semibold leading-none tracking-tight px-0"
                        onClick={() => handleCacheClear(`${client.id}bookingpage`, setCurrentPage, setCachedData, cachedData)}>
                        Réservations récentes {totalBookings > 0 ? "(" + totalBookings + ")" : ""}
                    </Button></CardTitle>
                <CardDescription>Dernière vérification des données : {lastCheck}</CardDescription>
            </CardHeader>
            <CardContent className="mt-5 md:mt-0 p-0 md:p-6">
                <div className="border rounded-md shadow-md bg-card">
                    <Table>
                        <TableHeader className="bg-accent text-[15px]">
                            <TableRow className="h-14">
                                <TableHead>Pro</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead className="w-[150px]">services</TableHead>
                                <TableHead>Prix de départ</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Distance</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[150px]">Créé à</TableHead>
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
                                        <TableCell colSpan={9} className="h-20">
                                            <div className="flex justify-center">
                                                {error}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    :
                                    bookings.length > 0 ?
                                        bookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>{booking.sneyyi.name}</TableCell>
                                                <TableCell>{booking.owner.name}</TableCell>
                                                <TableCell>{booking.servicesCat}</TableCell>
                                                <TableCell>{booking.services}</TableCell>
                                                <TableCell>{booking.startingPrice}</TableCell>
                                                <TableCell>
                                                    {
                                                        new Date(booking.dateTime).getFullYear() + "/" +
                                                        String(new Date(booking.dateTime).getMonth() + 1).padStart(2, '0') + "/" +
                                                        String(new Date(booking.dateTime).getDate()).padStart(2, '0') + " " +
                                                        String(new Date(booking.dateTime).getHours()).padStart(2, '0') + ":" +
                                                        String(new Date(booking.dateTime).getMinutes()).padStart(2, '0')
                                                    }
                                                </TableCell>
                                                <TableCell>{booking.distance}</TableCell>
                                                <TableCell>{booking.status}</TableCell>
                                                <TableCell>
                                                    {
                                                        new Date(booking.created_at).getFullYear() + "/" +
                                                        String(new Date(booking.created_at).getMonth() + 1).padStart(2, '0') + "/" +
                                                        String(new Date(booking.created_at).getDate()).padStart(2, '0') + " " +
                                                        String(new Date(booking.created_at).getHours()).padStart(2, '0') + ":" +
                                                        String(new Date(booking.created_at).getMinutes()).padStart(2, '0')
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        )) :
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-20">
                                                <div className="flex md:justify-center">
                                                    Vous n'avez aucune réservation pour le moment
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
                                <Button variant="link" className="disabled:text-white" onClick={() => handleNextPage(currentPage, setCurrentPage, setGoNext, setGoPrev)} disabled={tableLoading || bookings.length < itemsPerPage || currentPage >= totalPages}>
                                    <PaginationItem className="flex items-center">
                                        <PaginationNext className={"text-primary-foreground dark:text-primary"} /> {tableLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                    </PaginationItem>
                                </Button>
                            </PaginationContent>
                        </Pagination>
                    }
                </div>
            </CardContent>
        </Card>
    );
}

export default Bookings;