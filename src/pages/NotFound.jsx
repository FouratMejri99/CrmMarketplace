import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Frown, FrownIcon, LucideFrown } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    return (
        <div className="flex flex-col justify-center items-center h-[75vh]">
            <Card className="w-full md:w-1/2 text-center">
                <CardHeader>
                    <CardTitle className="text-9xl flex flex-col md:flex-row items-center justify-center gap-3">
                        <LucideFrown size={100} /> 404
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Sorry, the page you are looking for could not be found or has been removed.</p>
                    <Link to={"/"}>
                        <Button className="mt-3">Take me Back To Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

export default NotFound;