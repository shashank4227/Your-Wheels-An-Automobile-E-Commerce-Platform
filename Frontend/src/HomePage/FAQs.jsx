import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import './FAQs.css';
import { Link, useLocation } from 'react-router-dom';

function FAQs() {
  const [faqs, setFaqs] = useState([
    {
      "question": "What is Your Wheels?",
      "answer": "Your Wheels is an online automobile e-commerce platform where you can buy and sell vehicles easily, compare options, and get the best deals.",
      "isOpen": true
    },
    {
      "question": "How does Your Wheels work?",
      "answer": "Your Wheels connects buyers and sellers by providing a seamless online marketplace with detailed vehicle listings, financing options, and secure transactions.",
      "isOpen": false
    },
    {
      "question": "Can I sell my car on Your Wheels?",
      "answer": "Yes! You can list your car on Your Wheels by creating an account, uploading photos, and setting a price. Our platform helps you reach potential buyers quickly.",
      "isOpen": false
    },
    {
      "question": "What are the fees for using Your Wheels?",
      "answer": "Our pricing varies based on listing types and additional services like premium visibility. Contact our support team for detailed pricing information.",
      "isOpen": false
    },
    {
      "question": "How do I set up my account on Your Wheels?",
      "answer": "Setting up an account is simple. Sign up on our platform, verify your details, and start browsing or listing vehicles immediately.",
      "isOpen": false
    },
    {
      "question": "Do you offer financing options for buyers?",
      "answer": "Yes, we partner with financial institutions to offer financing options. Buyers can check their eligibility and apply directly through our platform.",
      "isOpen": false
    },
    {
      "question": "Is it safe to buy a car on Your Wheels?",
      "answer": "Absolutely! We verify sellers and provide secure payment options to ensure a safe buying experience.",
      "isOpen": false
    },
    {
      "question": "Can I compare different cars on Your Wheels?",
      "answer": "Yes! Our platform allows you to compare specifications, features, and prices of multiple vehicles to help you make the best decision.",
      "isOpen": false
    },
    {
      "question": "Do you offer vehicle inspection services?",
      "answer": "We provide third-party inspection services to ensure that buyers can purchase with confidence. Check the listing details to see if an inspection report is available.",
      "isOpen": false
    },
    {
      "question": "How do I contact customer support?",
      "answer": "You can reach our customer support team via email, phone, or live chat on our website. We are available to assist you with any inquiries.",
      "isOpen": false
    },
    {
      "question": "Do you offer trade-in options?",
      "answer": "Yes, we provide trade-in options where you can exchange your old car for a new one at a competitive price.",
      "isOpen": false
    },
    {
      "question": "Can I schedule a test drive before buying?",
      "answer": "Yes! Some sellers allow test drives. You can contact the seller through our platform to schedule a test drive.",
      "isOpen": false
    },
    {
      "question": "What types of vehicles are available on Your Wheels?",
      "answer": "We offer a wide range of vehicles, including new and used cars, motorcycles, trucks, and more.",
      "isOpen": false
    },
    {
      "question": "Are there any warranties or return policies?",
      "answer": "Some vehicles come with manufacturer warranties or third-party protection plans. Be sure to check the listing details or contact the seller for more information.",
      "isOpen": false
    }
  ]);

  const location = useLocation(); // Get current location

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]); // Run effect when location changes

  const toggleFAQ = (index) => {
    setFaqs(faqs.map((faq, i) => {
      if (i === index) {
        return { ...faq, isOpen: !faq.isOpen };
      }
      return faq;
    }));
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </div>
        
      </nav>
      
      <div className="faq-application-container" style={{backgroundColor:"black"}}>
        <main className="faq-content-container">
        <Link to="/" className="back-link">
          Back to website →
        </Link>
          <h1 className="faq-main-heading" style={{color:"white"}}>FAQs</h1>
          <p className="faq-main-subtitle">Your questions answered here.</p>

          <div className="faq-content-section">
            <h2 className="faq-section-heading" style={{color:"white"}}>General Questions</h2>
            
            <div className="faq-questions-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-question-item">
                  <button 
                    className="faq-question-button" 
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="faq-question-text">{faq.question}</span>
                    {faq.isOpen ? 
                      <Minus size={20} className="faq-icon-minus" /> : 
                      <Plus size={20} className="faq-icon-plus" />
                    }
                  </button>
                  {faq.isOpen && (
                    <div className="faq-answer-container">
                      <p className="faq-answer-text">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default FAQs;
