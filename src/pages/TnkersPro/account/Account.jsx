import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/config/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import AccountLoading from "@/components/loading/AccountLoading";
import General from "./General";
import Interventions from "./Interventions";
import NotFound from "@/pages/NotFound";
import { isCacheExpired } from "@/utils/firestoreUtils";

const Account = () => {
    const { id } = useParams();
    const clientRef = doc(db, "users", id);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

    const fetchDocument = async () => {
        try {
            const clientData = await getDoc(clientRef);
            if (clientData.exists()) {
                setClient(clientData.data());
                localStorage.setItem(`pros${clientData.data().id}`, JSON.stringify({ timestamp: Date.now(), data: clientData.data() }));
            } else {
                console.error('client does not exist');
            }
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const cachedPro = localStorage.getItem("pros" + id);
        if (cachedPro && !isCacheExpired(JSON.parse(cachedPro), CACHE_EXPIRATION_TIME)) {
            setClient(JSON.parse(cachedPro).data);
            setLoading(false);
        } else {
            fetchDocument();
        }
    }, []);

    return (
        <Card className="border-transparent bg-background shadow-none border-none">
            <CardHeader className="p-0 md:p-6">
                <CardTitle>Informations du compte</CardTitle>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to='/' className="transition-colors hover:text-foreground">
                                Dashboard
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <Link to={"/pros"} className="transition-colors hover:text-foreground">
                                Tnkers Pro
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{loading ? "" : client ? "Compte de " + client.name : ""} </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </CardHeader>
            <CardContent className="mt-5 md:mt-0 p-0">
                {loading ? (
                    <AccountLoading />
                ) : client ? (
                    <Tabs defaultValue="account">
                        <div className="overflow-x-auto mb-5">
                            <TabsList>
                                <TabsTrigger value="account">General</TabsTrigger>
                                <TabsTrigger value="interventions" >Interventions</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="account" className="lg:flex gap-6">
                            <General client={client} />
                        </TabsContent>
                        <TabsContent value="interventions">
                            <Interventions client={client} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <NotFound />
                )}
            </CardContent>
        </Card>
    );
}

export default Account;