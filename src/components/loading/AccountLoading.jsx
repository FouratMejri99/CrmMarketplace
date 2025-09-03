import { Skeleton } from "@/components/ui/skeleton"

const AccountLoading = () => {
    return (
        <div className="lg:flex space-y-3 lg:space-y-0 lg:space-x-3">
            <Skeleton className="h-[205px] lg:h-[350px] w-full lg:w-[250px] rounded-xl" />
            <div className="space-y-3 flex-1">
                <Skeleton className="h-[275px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                </div>
            </div>
        </div>
    );
}

export default AccountLoading;