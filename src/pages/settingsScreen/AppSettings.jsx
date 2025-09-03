import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const AppSettings = ({ setScreen }) => {
    const { setTheme, theme } = useTheme()

    useEffect(() => {
        setScreen("settings")
    }, [])

    return (
        <div className="flex flex-col md:flex-row gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Théme</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 justify-center">
                        <Button variant="ouline" size="icon" className={`border w-20 h-20 hover:bg-accent ${theme === "light" && "bg-accent"}`} onClick={() => setTheme("light")}>
                            <Sun />
                        </Button>
                        <Button variant="ouline" size="icon" className={`border w-20 h-20 hover:bg-accent ${theme === "dark" && "bg-accent"}`} onClick={() => setTheme("dark")}>
                            <Moon />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Langue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 justify-center">
                        <Button variant="ouline" className={`border w-20 h-20 hover:bg-accent text-lg`}>
                            Français
                        </Button>
                        <Button variant="ouline" className={`border w-20 h-20 hover:bg-accent text-lg`}>
                            Arabe
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AppSettings;