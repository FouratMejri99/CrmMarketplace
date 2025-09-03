import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
const General = ({ client }) => {
    return (
        <>
            <Card className="rounded-xl xl:w-1/4 h-52 mb-8 lg:mb-0">
                <CardHeader className="flex items-center pb-0">
                    <Avatar className="w-28 h-28 mb-6">
                        <Input type="file" id="avatarUpload" accept=".jpeg, .jpg, .png, .gif" style={{ display: 'none' }} />
                        <AvatarImage src={client.pdp ? client.pdp : "/images/insta Logo.png"} />
                        <AvatarFallback>{client.name}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent>
                    Statut du compte : {client.status}
                </CardContent>
            </Card>
            <Card className="rounded-xl flex-1">
                <CardHeader className="relative">
                    <CardTitle className="absolute -top-3 left-3">Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="md:flex gap-4">
                        <div className="w-full relative mb-5">
                            <Label htmlFor="name" className="absolute -top-2 left-3 bg-card">Nom</Label>
                            <Input type="text" id="name" placeholder="Nom" className={`py-6 focus:border-none cursor-default`}
                                value={client.name} readOnly />
                        </div>
                        <div className="w-full relative mb-5">
                            <Label htmlFor="pseudo" className="absolute -top-2 left-3 bg-card">Pseudo</Label>
                            <Input type="text" id="pseudo" placeholder="pseudo" className={`py-6 focus:border-none cursor-default`}
                                value={client.pseudo} readOnly />
                        </div>
                    </div>
                    <div className="md:flex gap-4">
                        <div className="w-full relative mb-5">
                            <Label htmlFor="phone" className="absolute -top-2 left-3 bg-card">Téléphone</Label>
                            <Input type="text" id="phone" placeholder="Téléphone" className={`py-6 focus:border-none cursor-default`}
                                value={client.phone} readOnly />
                        </div>
                        <div className="w-full relative mb-5">
                            <Label htmlFor="email" className="absolute -top-2 left-3 bg-card">E-mail</Label>
                            <Input type="email" id="email" placeholder="email" className={`py-6 focus:border-none cursor-default`}
                                value={client.email} readOnly />
                        </div>
                    </div>
                    <div className="md:flex gap-4 mb-5">
                        <div className="w-full relative">
                            <Label htmlFor="region" className="absolute -top-2 left-3 bg-card">Région</Label>
                            <Textarea placeholder="Région" id="region" className="cursor-default focus:border-none" value={client.region} readOnly />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {client.cinUrlFront &&
                            <div>
                                <Dialog>
                                    <DialogTrigger>
                                        <img src={client.cinUrlFront} alt="" className="w-full h-full rounded-xl" />
                                    </DialogTrigger>
                                    <DialogContent className="p-0">
                                        <img src={client.cinUrlFront} alt="" className="w-full h-full" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        }
                        {client.cinUrlBack &&
                            <div>
                                <Dialog>
                                    <DialogTrigger>
                                        <img src={client.cinUrlBack} alt="" className="w-full h-full rounded-xl" />
                                    </DialogTrigger>
                                    <DialogContent className="p-0">
                                        <img src={client.cinUrlBack} alt="" className="w-full h-full" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        }
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default General;