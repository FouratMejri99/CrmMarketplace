import Lottie from "lottie-react";
import Logo from "./../assets/LogoAnimated.json"
import { useEffect, useRef, useState } from "react";

const LogoAnimated = () => {
    const lottieRef = useRef();
    const [direction, setDirection] = useState(true)

    const handleAnimationComplete = () => {
        // When animation completes forward, play it in reverse
        if (direction) lottieRef.current.playSegments([90, 0], true);
        else lottieRef.current.playSegments([0, 90], true);
        setDirection(!direction);
    };
    return (
        <Lottie animationData={Logo} lottieRef={lottieRef} onLoopComplete={handleAnimationComplete} initialSegment={[0, 90]} />
    );
}

export default LogoAnimated;