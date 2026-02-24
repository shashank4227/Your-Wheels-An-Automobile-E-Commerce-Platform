import React, { useEffect, useRef } from 'react';
import { Phone, MessageSquare, MapPin } from 'lucide-react';
import './Contact.css';

function Contact() {
  const titleRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.3 } // Lowered threshold to trigger effect earlier
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
      cardRefs.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <div id="contact" className="contact-page">
      <div className="contact-container">
        {/* Contact Title with Fade-in */}
        <h1 ref={titleRef} className="services-title">Get in Touch</h1>
        <p className="subtitle">Need help finding the perfect vehicle? We're here to assist you.</p>

        <div className="contact-grid">
          {[
            { Icon: MessageSquare, title: "Chat with Sales", desc: "Discuss your vehicle requirements with our expert team.", link: "mailto:yourwheels123@gmail.com", linkText: "yourwheels123@gmail.com" },
            { Icon: Phone, title: "Call Us", desc: "Available Mon-Fri, 9AM to 6PM", link: "tel:+1234567890", linkText: "+91 9876543210" },
            { Icon: MapPin, title: "Visit Our Location", desc: "Come see our fleet in person", link: "https://maps.google.com", linkText: "View on Maps" }
          ].map((item, index) => (
            <div key={index} ref={(el) => (cardRefs.current[index] = el)} className="contact-card">
              <item.Icon className="icon" />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer">{item.linkText}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;
