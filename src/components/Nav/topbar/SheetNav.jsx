import { useContext, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { Context } from "@/context/AuthContext";

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Headset, LayoutDashboard, LayoutList, Menu, Settings, SquareUser, TrendingUp, UsersRound } from "lucide-react"

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
    {
        title: "supprot",
        icon: <Headset />,
        link: "/supprot",
    },
    {
        title: "Settings",
        icon: <Settings />,
        link: "/settings",
    },
]


const SheetNav = () => {
    const { user } = useContext(Context);

    const location = useLocation();
    // the activeLink state is used to highlight the current active item of the sidebar. 
    const [activeLink, setActiveLink] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);

    const TriggerSheet = () => {
        setSheetOpen(!sheetOpen); // Close the sheet when a link is clicked
    };

    const { theme } = useTheme();
    const logoSrc = theme === 'light' ? '/images/Logo Tinker black T.svg' : '/images/Logo Tinker w N.svg';

    useEffect(() => {
        // Update active link when the location changes
        setActiveLink(location.pathname);
    }, [location]);
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild onClick={TriggerSheet}>
                <Button variant="outline" size="sm">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gradient-to-br from-foreground/5 overflow-scroll">
                <SheetHeader>
                    <SheetTitle>
                        <img
                            src={logoSrc}
                            className={`overflow-hidden transition-all`}
                            alt=""
                        />
                    </SheetTitle>
                </SheetHeader>
                {navItems.map((item, index) => (
                    <Link to={item.link} key={index} className={`mb-2 p-3 flex items-center last:mb-0 cursor-pointer rounded-md transition-all 
                    ${item.link === activeLink ? "bg-primary/15 hover:bg-primary/50" : "hover:bg-accent"}
                    `}
                        onClick={TriggerSheet}>
                        {item.icon}
                        <p className={` font-medium leading-none ms-1`}>{item.title}</p>
                    </Link>
                ))}
                <SheetFooter className={"flex-col"}> 
                    <div className={"flex border-t p-2 w-full items-center"}>
                        <Avatar className="h-14 w-14 me-2 border border-primary">
                            <AvatarImage src="/images/Logo Tinker f.svg" alt="@shadcn" />
                            <AvatarFallback className="text-center">{user.displayName}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold">{user.displayName}</h4>
                            <span className="text-xs">{user.email}</span>
                        </div>
                    </div>
                    <Link to={"/re-new-plan"} onClick={TriggerSheet}>
                        <Button className="mt-3 rounded-xl">Upgrade Plan</Button>
                    </Link>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default SheetNav;