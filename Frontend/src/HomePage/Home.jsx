import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import Hero from './Hero';
import Services from './Services';
import Footer from './Footer';
import Contact from './Contact';
import About from './About';
import { useEffect } from 'react';

const Home = () => {

  useEffect(() => {
      // Scroll to top when component mounts
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location]); // Run effect when location changes
  
  return (
    <div>
        <NavBar />
      <Hero />
      <About/>
      <Services />
      <Contact/>
      <Footer />
    </div>
  );
};

export default Home;