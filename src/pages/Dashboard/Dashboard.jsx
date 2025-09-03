import TotalBookings from "./TotalBookings";
import TotalUsers from "./TotalUsers";



const Dashboard = () => {
    return (
        <>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-7 lg:gap-4 mt-10">
                <TotalBookings />
                <TotalUsers />
            </div>
        </>
    )
}

export default Dashboard;