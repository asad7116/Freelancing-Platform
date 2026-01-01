import React from "react";
import Header from "../components/Header";
import "../styles/homepage.css";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ExploreSection from "../components/ExploreSection";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";

const Homepage = () => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="homepage-wrapper">
      {/* Animated gradient background */}
      <div className="homepage-gradient-bg"></div>
      
      {/* Floating animated shapes */}
      <div 
        className="homepage-decorative-circle circle-1"
        style={{
          transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`
        }}
      ></div>
      <div 
        className="homepage-decorative-circle circle-2"
        style={{
          transform: `translate(${-mousePosition.x / 15}px, ${mousePosition.y / 15}px)`
        }}
      ></div>
      <div 
        className="homepage-decorative-circle circle-3"
        style={{
          transform: `translate(${mousePosition.x / 10}px, ${-mousePosition.y / 10}px)`
        }}
      ></div>
      
      <Header />
      <Hero />
      <ExploreSection />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Homepage;
