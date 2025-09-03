import { useEffect, useState, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import { Context } from "@/context/AuthContext";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, LayoutDashboard, LayoutList, UsersRound, Settings, SquareUser, TrendingUp, Headset } from "lucide-react"

// List of navigation items with title, icon, active state, and link
const navItems = [
    {
        title: "Dashboard",
        icon: <LayoutDashboard />,
        link: "/",
    },
    {
        title: "Pros",
        icon: <SquareUser />,
        link: "/pros",
    },
    {
        title: "Clients",
        icon: <UsersRound />,
        link: "/clients",
    },
    {
        title: "Interventions",
        icon: <LayoutList />,
        link: "/interventions",
    },
    {
        title: "Analytics",
        icon: <TrendingUp />,
        link: "/analytics",
    },
]

const Sidebar = ({ className, expanded, setExpanded, ...props }) => {
    const { user } = useContext(Context);

    const location = useLocation();
    // the activeLink state is used to highlight the current active item of the sidebar. 
    const [activeLink, setActiveLink] = useState("");
    // the expanded state of our sidebar. this is a hook that keeps track of whether our sidebar is currently expanded or not.

    useEffect(() => {
        // Update active link when the location changes
        setActiveLink(location.pathname);
    }, [location]);
    return (
        <Card className={cn(`${expanded ? "w-[250px]" : "w-[150px]"} fixed h-full transition-all hidden xl:flex flex-col rounded-none`, className)} {...props}>
            <CardHeader className="relative mb-3">
                <CardTitle className="flex justify-center">
                    <img
                        src={"/images/Logo-TnkerProAgency-Full.png"}
                        className={`overflow-hidden transition-all ${expanded ? "w-3/4" : "w-full"} `}
                        alt="Tnker Logo"
                    />
                </CardTitle>
                <Button variant="outline" size="sm"
                    onClick={() => setExpanded((curr) => !curr)}
                    className="absolute rounded-full -right-5 p-1.5 hover:bg-primary/50 transition-all">
                    {expanded ? <ChevronLeft /> : <ChevronRight />}
                </Button>
            </CardHeader>
            {/* Content */}
            <div className="overflow-auto h-full custom-scrollbar">
                <div className="min-h-full flex flex-col justify-between">
                    <CardContent>
                        {navItems.map((item, index) => (
                            <Link to={item.link} key={index} className={`mb-2 p-3 flex items-center last:mb-0 cursor-pointer rounded-md transition-all 
                                ${item.link === activeLink ? "bg-primary/15 hover:bg-primary/50" : "hover:bg-accent"}
                                ${expanded ? "" : "flex-col"}`}>
                                {item.icon}
                                <p className={`${expanded ? "text-lg" : "text-sm"}  font-medium leading-none ms-1`}>{item.title}</p>
                            </Link>
                        ))}
                    </CardContent>

                    <CardContent>
                        <Link to={"/supprot"} className={`mb-2 p-3 flex items-center last:mb-0 cursor-pointer rounded-md transition-all 
                            ${"/supprot" === activeLink ? "bg-primary/15 hover:bg-primary/50" : "hover:bg-accent"}
                            ${expanded ? "" : "flex-col"}`}>
                            <Headset />
                            <p className={`${expanded ? "text-lg" : "text-sm"}  font-medium leading-none ms-1`}>Supprot</p>
                        </Link>
                        <Link to={"/settings"} className={`mb-2 p-3 flex items-center last:mb-0 cursor-pointer rounded-md transition-all 
                            ${"/settings" === activeLink ? "bg-primary/15 hover:bg-primary/50" : "hover:bg-accent"}
                            ${expanded ? "" : "flex-col"}`}>
                            <Settings />
                            <p className={`${expanded ? "text-lg" : "text-sm"}  font-medium leading-none ms-1`}>Settings</p>
                        </Link>
                        <div className="flex flex-col items-center mt-3">
                            <Avatar className="h-14 w-14 border">
                                <AvatarImage src="/images/Logo Tinker f.svg" alt="@shadcn" />
                                <AvatarFallback className="text-center">Tnker Admin</AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col items-center overflow-hidden transition-all ${expanded ? "" : "hidden"}`}>
                                <h4 className="font-semibold">{user.displayName ? user.displayName : "Tnker Admin"}</h4>
                                <span className="text-xs">{user.email}</span>
                                <Link to={"/re-new-plan"}>
                                    <Button className="mt-3 rounded-xl">Upgrade Plan</Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </div>
            {/* end Content */}
        </Card>
    )
}

export default Sidebar;
