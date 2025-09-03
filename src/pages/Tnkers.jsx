import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const Tnkers = () => {
    return (
        <Card className="border-transparent md:border-border">
            <CardHeader className="p-2 md:p-6">
                <CardTitle className="text-xl sm:text-2xl text-primary-foreground dark:text-primary">Liste de vos clients</CardTitle>
            </CardHeader>
            <CardContent className="mt-5 md:mt-0 p-0 md:px-6">
                <Table>
                    <TableHeader >
                        <TableRow className="bg-accent text-[15px]">
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Pseudo</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Region</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan="6" className="font-medium md:text-center">Vous n'avez pas de clients pour l'instant</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default Tnkers;