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
        <div className="hero-container">
            <div className="hero">
                <h1 ref={titleRef} className="services-title fade-in">Welcome to Your Wheels</h1>
                <p ref={descRef} style={{fontSize:"15px"}} className="description fade-in">Your Wheels – The ultimate hub for vehicle enthusiasts! Get personalized recommendations, connect with sellers, and explore rental options effortlessly. Discover the hottest trending bikes and cars, all in one place! Experience a seamless journey from browsing to buying, renting, and beyond.</p>
            </div>
            <img src="/hero-car.png" alt="Car" />
        </div>
    );
};

export default Hero;
