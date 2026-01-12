import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Car, MessageCircle, CheckCircle, Clock, Lock, Filter } from 'lucide-react';
import './Services.css';

const services = [
    { id: 1, icon: <Car className="icon" style={{color:"white"}} />, title: "Personalized Vehicle Recommendations", description: "Receive vehicle suggestions tailored to your preferences, including make, model, budget, and more, to help you find the perfect match." },
    { id: 2, icon: <MessageCircle className="icon" style={{color:"white"}}/>, title: "Seamless Seller Communication", description: "Connect with trusted sellers directly through our platform for smooth, transparent negotiations and purchases." },
    { id: 3, icon: <CheckCircle className="icon" style={{color:"white"}}/>, title: "Verified Vehicle Listings", description: "Browse a curated selection of verified vehicles with detailed information and trusted seller reviews to ensure peace of mind." },
    { id: 4, icon: <Clock className="icon" style={{color:"white"}}/>, title: "Instant Availability Updates", description: "Get real-time notifications on vehicle availability and updates from sellers, ensuring you're always in the loop." },
    { id: 5, icon: <Lock className="icon" style={{color:"white"}}/>, title: "Secure Transaction Support", description: "We provide secure payment and transaction processes, ensuring safe and reliable vehicle purchases." },
    { id: 6, icon: <Filter className="icon" style={{color:"white"}}/>, title: "Advanced Vehicle Search Filters", description: "Use advanced search filters to find the vehicle that meets your exact specifications, from price range to features and more." }
];

const Services = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const serviceRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of element is visible
    );

    serviceRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => {
      serviceRefs.current.forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex + 1 >= services.length - 2 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex - 1 < 0 ? services.length - 3 : prevIndex - 1
    );
  };

  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          titleRef.current.classList.add("fade-in-visible");
        }
      },
      { threshold: 0.5 } // Trigger when 50% visible
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) {
        observer.unobserve(titleRef.current);
      }
    };
  }, []);

  return (
    <div id="services" className="services-container">
      <div className="services-wrapper">
      <h2 ref={titleRef} className="services-title" style={{marginLeft:"500px"}}>Our Services</h2>


        <div className="slider-container">
          <div 
            className="slider-track"
            style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
          >
            {services.map((service, index) => (
              <div 
                key={service.id} 
                ref={(el) => serviceRefs.current[index] = el}
                className="service-card fade-in"
              >
                <div className="icon-container" style={{color:"white"}}>{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="nav-button prev-button">
            <ChevronLeft />
          </button>

          <button onClick={nextSlide} className="nav-button next-button">
            <ChevronRight />
          </button>

          <div className="slider-indicators">
            {Array.from({ length: services.length - 2 }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`indicator ${i === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
