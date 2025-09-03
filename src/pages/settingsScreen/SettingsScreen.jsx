import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AppSettings from "./AppSettings";
import ProfileSettings from "./ProfileSettings";
import SubscriptionsScreen from "./SubscriptionsScreen";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useState } from "react";

const SettingsScreen = () => {
    const [screen, setScreen] = useState("settings")
    return (
        <Card className="border-none shadow-none">
            <CardHeader className="p-3">
                <CardTitle>paramètres</CardTitle>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to='/' className="transition-colors hover:text-foreground">
                                Dashboard
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>paramètres</BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{screen === "info" ? "Information du compte" : screen === "settings" ? "Paramètres d'application" : screen === "subscriptions" ? "Plan d'abonnements" : ""}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </CardHeader>
            <CardContent className="p-0 md:p-3">
                <Tabs defaultValue={screen}>
                    <div className="overflow-x-auto">
                        <TabsList className="mb-3 md:h-12">
                            <TabsTrigger value="settings" className="text-md md:text-xl font-semibold leading-none tracking-tight">Paramètres d'application</TabsTrigger>
                            <TabsTrigger value="info" className="text-md md:text-xl font-semibold leading-none tracking-tight">Information du compte</TabsTrigger>
                            <TabsTrigger value="subscriptions" className="text-md md:text-xl font-semibold leading-none tracking-tight">liste des abonnements</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="settings"><AppSettings setScreen={setScreen} /></TabsContent>
                    <TabsContent value="info"><ProfileSettings setScreen={setScreen} /></TabsContent>
                    <TabsContent value="subscriptions"><SubscriptionsScreen setScreen={setScreen} /></TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default SettingsScreen;