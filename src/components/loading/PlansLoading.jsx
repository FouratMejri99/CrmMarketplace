import { Skeleton } from "@/components/ui/skeleton"


const PlansLoading = () => {
    return (
        <div className="flex items-center space-x-4 z-50">
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-96 w-96" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-96 w-96" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-96 w-96" />
            </div>
        </div>
    );
}

export default PlansLoading;