import { useContext, useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AddTnkersPro from "./AddTnkersPro";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Context } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import { formatTimeSinceLastCheck, handleCacheClear, isCacheExpired } from "@/utils/firestoreUtils";
import { Eye } from "lucide-react";
import LoadingBar from "@/components/loading/LoadingBar";
import { Link } from "react-router-dom";
import Filters from "./Filters";

// Mapping object for status to class names
const statusClassMap = {
    APPROVED: "bg-[#2ECC71]",
    OPENED: "bg-[#196aaf]",
    REJECTED: "bg-destructive",
    BLOCKED: "bg-[#f0786a]",
};

const TnkersPro = () => {
    const tnkersProCollectionRef = collection(db, 'users');
    const { user } = useContext(Context);

    const TNKERPRO_LOCAL_STORAGE_KEY_PREFIX = user.uid + 'tnkerproDataPage';
    const TNKERPRO_CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

    const [tnkersPro, setTnkersPro] = useState([]);
    const [totalTnkersPro, setTotalTnkersPro] = useState(0);
    const [totalTnkersProAPPROVED, setTotalTnkersProAPPROVED] = useState(0);
    const [totalTnkersProOPENED, setTotalTnkersProOPENED] = useState(0);
    const [totalTnkersProREJECTED, setTotalTnkersProREJECTED] = useState(0);
    const [totalTnkersProBLOCKED, setTotalTnkersProBLOCKED] = useState(0);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [currentPage, setCurrentPage] = useState(1); // Current page
    // const itemsPerPage = 5; // Number of items to fetch per page
    // const [goNext, setGoNext] = useState(true) // Flag to indicate if we should go for next page or not.
    // const [goPrev, setGoPrev] = useState(false) // Flag to indicate if we should go for prev page or not.
    // const [lastDoc, setLastDoc] = useState(null); // To keep track of the last document fetched
    // const [firstDoc, setFirstDoc] = useState(null); // To keep track of the first document fetched

    const [lastCheck, setLastCheck] = useState("")
    const [cachedData, setCachedData] = useState(true);

    // filters states
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true)
    const [filteredtnkersPro, setFilteredTnkersPro] = useState([]);
    const [search, setSearch] = useState("")
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        setError();
        setLoading(true);
        setTotalTnkersPro(0)
        setTotalTnkersProAPPROVED(0);
        setTotalTnkersProOPENED(0);
        setTotalTnkersProREJECTED(0);
        setTotalTnkersProBLOCKED(0);
        setSelectedRoles([])
        setSelectedStatus("")
        setSearch("")
        // Check if data for the current page is available in local storage
        const cachedTnkersPro = localStorage.getItem(`${TNKERPRO_LOCAL_STORAGE_KEY_PREFIX}`);
        if (cachedTnkersPro && JSON.parse(cachedTnkersPro).data.length && !isCacheExpired(JSON.parse(cachedTnkersPro), TNKERPRO_CACHE_EXPIRATION_TIME)) {
            setTnkersPro(JSON.parse(cachedTnkersPro).data);
            setFilteredTnkersPro(JSON.parse(cachedTnkersPro).data)
            // Initialize counters
            let approvedCount = 0;
            let openedCount = 0;
            let rejectedCount = 0;
            let blockedCount = 0;
            // Loop through filtered data and count statuses
            JSON.parse(cachedTnkersPro).data.forEach(item => {
                switch (item.status) {
                    case "APPROVED":
                        approvedCount++;
                        break;
                    case "OPENED":
                        openedCount++;
                        break;
                    case "REJECTED":
                        rejectedCount++;
                        break;
                    case "BLOCKED":
                        blockedCount++;
                        break;
                    default:
                        break;
                }
            });
            // Update state with the counts
            setTotalTnkersPro(JSON.parse(cachedTnkersPro).data.length)
            setTotalTnkersProAPPROVED(approvedCount);
            setTotalTnkersProOPENED(openedCount);
            setTotalTnkersProREJECTED(rejectedCount);
            setTotalTnkersProBLOCKED(blockedCount);

            setLoading(false);
            setLastCheck(formatTimeSinceLastCheck(JSON.parse(cachedTnkersPro).timestamp))
            getRoles()
        } else {
            getAllTnkersPro()
            setLastCheck(formatTimeSinceLastCheck(Date.now()))
        }

    }, [cachedData])

    useEffect(() => {
        // Apply filters whenever search, selectedStatus, or selectedRoles change
        let filteredData = tnkersPro;

        if (search) {
            filteredData = filteredData.filter(tnker =>
                tnker.name.toLowerCase().includes(search.toLowerCase()) ||
                tnker.phone.includes(search) ||
                tnker.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedStatus) {
            filteredData = filteredData.filter(tnker => tnker.status === selectedStatus);
        }

        if (selectedRoles.length > 0) {
            filteredData = filteredData.filter(tnker => selectedRoles.includes(tnker.domaine_exp));
        }

        setFilteredTnkersPro(filteredData);
    }, [search, selectedStatus, selectedRoles, tnkersPro]);


    const getRoles = () => {
        const uniqueRoles = new Set(); // Using a Set for unique values
        if (tnkersPro.length) {
            tnkersPro.forEach(tnkerpro => {
                if (tnkerpro.domaine_exp) uniqueRoles.add(tnkerpro.domaine_exp); // Add unique values to the Set
            });
        } else {
            const cachedTnkersPro = localStorage.getItem(`${TNKERPRO_LOCAL_STORAGE_KEY_PREFIX}`);
            JSON.parse(cachedTnkersPro).data.forEach(tnkerpro => {
                if (tnkerpro.domaine_exp) uniqueRoles.add(tnkerpro.domaine_exp); // Add unique values to the Set
            });
        }
        setRoles(Array.from(uniqueRoles));
        setLoadingRoles(false);
    }

    const getAllTnkersPro = async () => {
        try {
            const queryRef = query(tnkersProCollectionRef, orderBy("created_at", "desc"), where("agency", '==', user.uid));
            const data = await getDocs(queryRef);
            const filteredData = data.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            if (filteredData.length) {
                setTnkersPro(filteredData);
                setFilteredTnkersPro(filteredData);
                localStorage.setItem(TNKERPRO_LOCAL_STORAGE_KEY_PREFIX, JSON.stringify({ timestamp: Date.now(), data: filteredData }));
                getRoles()

                // Initialize counters
                let approvedCount = 0;
                let openedCount = 0;
                let rejectedCount = 0;
                let blockedCount = 0;
                // Loop through filtered data and count statuses
                filteredData.forEach(item => {
                    switch (item.status) {
                        case "APPROVED":
                            approvedCount++;
                            break;
                        case "OPENED":
                            openedCount++;
                            break;
                        case "REJECTED":
                            rejectedCount++;
                            break;
                        case "BLOCKED":
                            blockedCount++;
                            break;
                        default:
                            break;
                    }
                });
                // Update state with the counts
                setTotalTnkersPro(filteredData.length)
                setTotalTnkersProAPPROVED(approvedCount);
                setTotalTnkersProOPENED(openedCount);
                setTotalTnkersProREJECTED(rejectedCount);
                setTotalTnkersProBLOCKED(blockedCount);
            }
            setLoading(false)
        } catch (error) {
            console.error("Error fetching all data from collection: ", error);
            setError("An error occurred while fetching Data. Please try again later.");
        }
    }

    return (
        <Card className="border-transparent md:border-border">
            <CardHeader className="p-2 md:p-6 md:flex-row md:items-center">
                <CardTitle className="text-xl sm:text-2xl text-primary-foreground dark:text-primary">
                    <Button size="sm" variant="link" className="text-xl sm:text-2xl text-primary-foreground dark:text-primary px-0 font-bold"
                        onClick={() => handleCacheClear(TNKERPRO_LOCAL_STORAGE_KEY_PREFIX, setCurrentPage, setCachedData, cachedData)}>
                        Liste de vos bricoleurs
                    </Button>
                    <p className="text-xs p-0 font-semibold mb-1">dernier chèque: {lastCheck}</p>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <Link to={"/"} className="transition-colors hover:text-foreground">Dashboard</Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Tnkers Pro</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </CardTitle>
                <AddTnkersPro setTnkersPro={setTnkersPro} roles={roles} setRoles={setRoles}
                    totalTnkersPro={totalTnkersPro} setTotalTnkersPro={setTotalTnkersPro} totalTnkersProAPPROVED={totalTnkersProAPPROVED} setTotalTnkersProAPPROVED={setTotalTnkersProAPPROVED}
                    totalTnkersProOPENED={totalTnkersProOPENED} setTotalTnkersProOPENED={setTotalTnkersProOPENED} totalTnkersProREJECTED={totalTnkersProREJECTED}
                    setTotalTnkersProREJECTED={setTotalTnkersProREJECTED} totalTnkersProBLOCKED={totalTnkersProBLOCKED} setTotalTnkersProBLOCKED={setTotalTnkersProBLOCKED}
                    setFilteredTnkersPro={setFilteredTnkersPro} />
            </CardHeader>
            <CardContent className="mt-5 md:mt-0 p-0 md:px-6">
                {!loadingRoles &&
                    <Filters roles={roles} search={search} setSearch={setSearch} totalTnkersPro={totalTnkersPro} totalTnkersProAPPROVED={totalTnkersProAPPROVED}
                        totalTnkersProOPENED={totalTnkersProOPENED} totalTnkersProREJECTED={totalTnkersProREJECTED} totalTnkersProBLOCKED={totalTnkersProBLOCKED}
                        setSelectedStatus={setSelectedStatus} selectedStatus={selectedStatus} selectedRoles={selectedRoles} setSelectedRoles={setSelectedRoles} />
                }
                <Table>
                    <TableHeader >
                        <TableRow className="bg-accent text-[15px] font-bold h-14">
                            <TableHead className="font-bold">Nom</TableHead>
                            <TableHead className="font-bold">Téléphone</TableHead>
                            <TableHead className="font-bold">Rôle</TableHead>
                            <TableHead className="font-bold">Statut</TableHead>
                            <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ?
                            ( // Render loading screen if loading state is true
                                <TableRow className="hover:bg-background">
                                    <TableCell colSpan={10} className="h-20">
                                        <div className="flex justify-center">
                                            <LoadingBar className={"w-1/2 "} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) :
                            error ?
                                <TableRow className="hover:bg-background">
                                    <TableCell colSpan={10} className="h-20">
                                        <div className="flex justify-center">
                                            {error}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                :
                                filteredtnkersPro.length > 0 ?
                                    filteredtnkersPro.map((tnkerPro, index) => (
                                        <TableRow key={tnkerPro.id}>
                                            <TableCell className="flex items-center gap-2">
                                                <Avatar className="rounded-full h-16 w-16">
                                                    <AvatarImage src={tnkerPro.pdp ? tnkerPro.pdp : "/images/insta Logo.png"} />
                                                    <AvatarFallback>{`tnkerPro ${tnkerPro.name}`}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p>{tnkerPro.name}</p>
                                                    <p className="text-secondary dark:text-muted-foreground">{tnkerPro.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tnkerPro.phone}</TableCell>
                                            <TableCell>{tnkerPro.domaine_exp}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline"
                                                    className={`${statusClassMap[tnkerPro.status] || ""} py-1`} >{tnkerPro.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link to={`/pros/${tnkerPro.id}`}>
                                                    <Button size="icon" variant="link" className="text-[#242323] dark:text-primary"><Eye /></Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )) :
                                    <TableRow>
                                        <TableCell colSpan="10" className="font-medium md:text-center">Vous n'avez pas de bricoleurs pour l'instant</TableCell>
                                    </TableRow>
                        }
                    </TableBody>
                </Table>
                {/* {error || totalTnkersPro < itemsPerPage ? "" :
                    <Pagination className={"border-t"}>
                        <PaginationContent className={"md:gap-96"}>
                            <Button variant="link" className="text-primary-foreground dark:text-primary dark:disabled:text-white" onClick={() => handlePrevPage(currentPage, setCurrentPage, setGoNext, setGoPrev)} disabled={loading || currentPage === 1}>
                                <PaginationItem className="flex items-center">
                                    <PaginationPrevious /> {loading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                </PaginationItem>
                            </Button>
                            <Button variant="link" className="text-primary-foreground dark:text-primary dark:disabled:text-white" onClick={() => handleNextPage(currentPage, setCurrentPage, setGoNext, setGoPrev)} disabled={loading || tnkersPro.length < itemsPerPage || currentPage >= totalPages}>
                                <PaginationItem className="flex items-center">
                                    <PaginationNext /> {loading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                </PaginationItem>
                            </Button>
                        </PaginationContent>
                    </Pagination>
                } */}
            </CardContent>
        </Card>

    );
}

export default TnkersPro;