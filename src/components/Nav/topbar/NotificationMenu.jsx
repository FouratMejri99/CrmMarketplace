import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils"


const NotificationMenu = ({ className, ...props }) => {
    return (
        <Sheet modal={false}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className={cn(``, className)} {...props}>
                    <Bell />
                </Button>
            </SheetTrigger>
            <SheetContent className="opacity-90 bg-gradient-to-bl from-foreground/15 backdrop-blur border-none shadow-2xl">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        Notification
                    </SheetTitle>
                </SheetHeader>

                <SheetFooter className={"sm:justify-center fixed bottom-3 inset-x-3"}>
                    <Button variant="secondary" className="w-full shadow">View All</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export default NotificationMenu;