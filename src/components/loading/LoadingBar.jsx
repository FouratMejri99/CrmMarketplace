import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"


const LoadingBar = ({ className }) => {
    return (
        <Skeleton className={cn("h-[10px] rounded-full bg-primary/25 animate-ping", className)} />
    );
}

export default LoadingBar;