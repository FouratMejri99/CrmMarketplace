import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const TermConditionDialog = ({ message }) => {
    return (
        <Dialog>
            <DialogTrigger className="underline">{message}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>règles et conditions</DialogTitle>
                    <DialogDescription>
                        règles et conditions
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    );
}

export default TermConditionDialog;