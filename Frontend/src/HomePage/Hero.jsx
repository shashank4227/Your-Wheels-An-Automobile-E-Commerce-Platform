import React, { useRef, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
    const titleRef = useRef(null);
    const descRef = useRef(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("fade-in-visible");
                    }
                });
            },
            { threshold: 0.3 } // Trigger earlier for smoother effect
        );

        if (titleRef.current) observer.observe(titleRef.current);
        if (descRef.current) observer.observe(descRef.current);

        return () => {
            if (titleRef.current) observer.unobserve(titleRef.current);
            if (descRef.current) observer.unobserve(descRef.current);
        };
    }, []);

    return (
        <div className="hero-container flex flex-col md:flex-row justify-center items-center bg-black min-h-screen px-4 md:px-10">
            <div className="hero w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left pt-20 md:pt-0">
                <h1 ref={titleRef} className="services-title fade-in text-4xl md:text-6xl font-bold text-white mt-10 md:mt-0">Welcome to Your Wheels</h1>
                <p ref={descRef} className="description fade-in text-gray-400 font-bold mt-6 text-sm md:text-base leading-relaxed max-w-lg">Your Wheels – The ultimate hub for vehicle enthusiasts! Get personalized recommendations, connect with sellers, and explore rental options effortlessly. Discover the hottest trending bikes and cars, all in one place! Experience a seamless journey from browsing to buying, renting, and beyond.</p>
            </div>
            <div className="w-full md:w-1/2 flex justify-center mt-12 md:mt-0">
               <img src="/hero-car.png" alt="Car" className="w-full max-w-lg object-cover" />
            </div>
        </div>
    );
};

export default Hero;
