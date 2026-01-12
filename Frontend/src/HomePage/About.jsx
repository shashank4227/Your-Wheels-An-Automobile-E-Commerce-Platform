import React, { useRef, useEffect } from 'react';
import { Car, Search, Key, BarChart3 } from "lucide-react";
import './About.css';

function About() {
    const titleRef = useRef(null);
    const metricsRef = useRef(null);
    const cardRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("fade-visible");
                        observer.unobserve(entry.target); // Stops observing once faded in
                    }
                });
            },
            { threshold: 0.3 } // Lower threshold ensures smoother animation
        );

        if (titleRef.current) observer.observe(titleRef.current);
        if (metricsRef.current) observer.observe(metricsRef.current);
        cardRefs.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className='body'>
            <div className="info-section" id='about' style={{ width: "100%" }}>
                <h2 ref={titleRef} className="" style={{ fontSize: "40px", textAlign: "center", color: "white",marginLeft:"450px" }}>About Us</h2>

                <section ref={metricsRef} className="metrics fade">
                    <div className="metric-item">
                        <div className="metric-value">100+</div>
                        <div className="metric-label">Vehicles Listed</div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-value">500+</div>
                        <div className="metric-label">Happy Customers</div>
                    </div>
                    <div className="metric-item">
                        <div className="metric-value">98%</div>
                        <div className="metric-label">Satisfaction Rate</div>
                    </div>
                </section>

                <section className="features-grid">
                    {[{
                        icon: <Car className="feature-symbol" />, title: "Buy & Sell Vehicles",
                        desc: "Hassle-free transactions with verified listings, ensuring a smooth and secure experience for all parties involved."
                    }, {
                        icon: <Search className="feature-symbol" />, title: "Smart Recommendations",
                        desc: "AI-powered suggestions tailored to your needs, helping you find the perfect vehicle match."
                    }, {
                        icon: <Key className="feature-symbol" />, title: "Rent with Ease",
                        desc: "Wide range of rental vehicles available for both short-term and long-term use, with flexible options."
                    }, {
                        icon: <BarChart3 className="feature-symbol" />, title: "Real-Time Insights",
                        desc: "Stay informed with dynamic customer metrics and vehicle trends to make informed decisions."
                    }].map((feature, index) => (
                        <div key={index} ref={el => cardRefs.current[index] = el} className="feature-box fade">
                            <div className="feature-header">
                                <span className="icon">{feature.icon}</span>
                                <h3>{feature.title}</h3>
                            </div>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default About;
