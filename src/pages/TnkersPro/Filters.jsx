import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const Filters = ({ roles, search, setSearch, totalTnkersPro, totalTnkersProAPPROVED, totalTnkersProOPENED, totalTnkersProREJECTED, totalTnkersProBLOCKED,
    setSelectedStatus, selectedStatus, selectedRoles, setSelectedRoles
}) => {
    const [open, setOpen] = useState(false);

    const handleRoleChange = (role) => {
        if (selectedRoles.includes(role)) {
            const updatedRoles = selectedRoles.filter(selectedRole => selectedRole !== role);
            setSelectedRoles(updatedRoles);
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    }
    return (
        <div>
            <div className="flex gap-6 w-full bg-accent p-3 pb-0 rounded-t-xl border-b-4 dark:border-b-muted overflow-auto">
                <div className={`flex items-center gap-2 pb-2 cursor-pointer border-b-2 transition-all ${selectedStatus === "" && "border-b-primary"}  hover:border-b-primary`}
                    onClick={() => setSelectedStatus("")} >
                    All <Badge className={"rounded-md text-white"}>{totalTnkersPro}</Badge>
                </div>
                <div className={`flex items-center gap-2 pb-2 cursor-pointer border-b-2 transition-all ${selectedStatus === "APPROVED" ? "border-b-[#2ECC71]" : "border-b-transparent"} hover:border-b-[#2ECC71]`}
                    onClick={() => setSelectedStatus("APPROVED")}>
                    APPROVED <Badge className={"rounded-md text-white bg-[#2ECC71] hover:bg-[#2ECC71]/50"}>{totalTnkersProAPPROVED}</Badge>
                </div>
                <div className={`flex items-center gap-2 pb-2 cursor-pointer border-b-2 transition-all ${selectedStatus === "OPENED" ? "border-b-[#196aaf]" : "border-b-transparent"} hover:border-b-[#196aaf]`}
                    onClick={() => setSelectedStatus("OPENED")} >
                    OPENED <Badge className={"rounded-md text-white bg-[#196aaf] hover:bg-[#196aaf]/50"}>{totalTnkersProOPENED}</Badge>
                </div>
                <div className={`flex items-center gap-2 pb-2 cursor-pointer border-b-2 transition-all ${selectedStatus === "REJECTED" ? "border-b-destructive" : "border-b-transparent"} hover:border-b-destructive`}
                    onClick={() => setSelectedStatus("REJECTED")}>
                    REJECTED <Badge variant={"destructive"} className={"rounded-md"}>{totalTnkersProREJECTED}</Badge>
                </div>
                <div className={`flex items-center gap-2 pb-2 cursor-pointer border-b-2 transition-all ${selectedStatus === "BLOCKED" ? "border-b-[#f0786a]" : "border-b-transparent"} hover:border-b-[#f0786a]`}
                    onClick={() => setSelectedStatus("BLOCKED")}>
                    BLOCKED <Badge className={"rounded-md text-white bg-[#f0786a] hover:bg-[#f0786a]/50 "}>{totalTnkersProBLOCKED}</Badge>
                </div>
            </div>
            <div className="border flex items-center py-4 p-2 gap-2">
                <DropdownMenu onOpenChange={() => setOpen(!open)}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-44 h-12 justify-between">
                            Rôles {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" >
                        <DropdownMenuLabel>Rôles</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {roles.map((role, index) => (
                            <DropdownMenuCheckboxItem key={index}
                                checked={selectedRoles.includes(role)}
                                onCheckedChange={() => handleRoleChange(role)}
                                onSelect={(e) => e.preventDefault()} >
                                {role}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="relative w-full">
                    <Label htmlFor="search" className="absolute left-2 top-3 bg-card"><Search className="text-secondary dark:text-secondary-foreground" /></Label>
                    <Input type="text" id="search" placeholder="Chercher" className={`py-6 indent-9 hover:border-foreground focus:border-none focus-visible:ring-offset-0`}
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
        </div>
    );
}

export default Filters;