import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"


const Support = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Demander un support technique</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 relative">
                    <Label className="absolute -top-1.5 left-5 bg-card">Sujet</Label>
                    <Input placeholder="Enter Votre sujet" className={`hover:border-foreground focus:border-none transition-all h-16 rounded-2xl`} />
                </div>
                <div className="relative">
                    <Label className="absolute -top-1.5 left-5 bg-card">Message</Label>
                    <Textarea placeholder="Enter Votre message" className={`hover:border-foreground focus:border-none transition-all rounded-2xl`} />
                </div>
                <div className="text-right mt-5">
                    <Button>Envoyer</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default Support;