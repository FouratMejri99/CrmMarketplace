import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { fr } from "date-fns/locale";

const DatePicker = ({ setDateStart }) => {
    const [date, setDate] = useState("")
    // get current year ?
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "justify-start text-left font-normal h-16 rounded-2xl",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "P") : <span>Choisir une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(v) => { setDate(v); if (setDateStart && v) setDateStart(format(v, "P")); else setDateStart("") }}
                    initialFocus
                    locale={fr}
                    captionLayout="dropdown-buttons" fromYear={1990} toYear={new Date().getFullYear()}
                    classNames={{ caption_label: "hidden" }}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker;