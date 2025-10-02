"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ProductPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) return <LoadingOverlay show={true} text="Loading..." />;

  // advantages
  const advantages = [
    "All-in-one solution: hardware + software package.",
    "Monitor lamps in real-time from anywhere.",
    "Automated scheduling reduces energy costs.",
    "Easy installation with step-by-step guide.",
    "Secure cloud connection and encrypted data.",
  ];

  const features = [
    {
      title: "Hardware Kit",
      desc: "Includes smart sensors for your lamps. Visualize connections with our setup diagram for easy installation.",
      img: "/monitoring.png",
    },
    {
      title: "Web App",
      desc: "Control and monitor lamps remotely. Dashboard includes real-time status, energy consumption charts, and interactive controls.",
      img: "/monitoring.png",
    },
    {
      title: "Analytics & Reports",
      desc: "Track energy usage, monitor efficiency, generate actionable insights. Charts, bar graphs, and PDF export included.",
      img: "/monitoring.png",
    },
  ];

  const steps = [
    {
      title: "Install Devices",
      desc: "Mount controllers and sensors to lamps following our guide. Connect each device securely to the network.",
    },
    {
      title: "Connect to App",
      desc: "Link devices via Wi-Fi or IoT gateway. Ensure each lamp is registered and visible on the dashboard.",
    },
    {
      title: "Monitor & Optimize",
      desc: "Access real-time data, receive alerts, and automate schedules. Analyze energy consumption for cost savings.",
    },
  ];

  const benefits = [
    {
      title: "Reduce Energy Costs",
      desc: "Save up to 30% on electricity by automating schedules and monitoring usage.",
    },
    {
      title: "Save Time & Maintenance",
      desc: "Automated alerts reduce manual inspection and ensure timely maintenance.",
    },
    {
      title: "Data-Driven Decisions",
      desc: "Analytics provide actionable insights to optimize operations and performance.",
    },
    {
      title: "Secure & Reliable",
      desc: "Encrypted data and secure cloud connection ensures safety of all information.",
    },
  ];

  const testimonials = [
    {
      name: "Alice Johnson",
      role: "Facility Manager, GreenTech Co.",
      feedback: "Monitoring multiple lamps has never been easier. The integrated system is seamless!",
      avatar: "/profile.svg",
    },
    {
      name: "Mark Davis",
      role: "Operations Lead, BrightEnergy",
      feedback: "Installation was simple and the dashboard is extremely intuitive. Energy savings are noticeable!",
      avatar: "/profile.svg",
    },
    {
      name: "Sophia Lee",
      role: "Energy Analyst, EcoSmart",
      feedback: "I love the analytics feature. It helps me track energy usage efficiently.",
      avatar: "/profile.svg",
    },
    {
      name: "John Smith",
      role: "Maintenance Supervisor, UrbanLights",
      feedback: "The remote control works perfectly. I can manage lamps from anywhere.",
      avatar: "/profile.svg",
    },
  ];

  const comparisons = [
    {
      title: "Stability & Reliability",
      desc: "System uptime is 99.9% with minimal maintenance.",
    },
    {
      title: "Scalability",
      desc: "Easily expand to multiple locations or lamp groups without performance drop.",
    },
    {
      title: "Integration",
      desc: "Compatible with other IoT systems and third-party apps.",
    },
    {
      title: "Performance",
      desc: "Real-time response under 2 seconds and optimized resource usage.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#041023] via-[#06305a] to-[#021026] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[100vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12">
        <div className="absolute inset-0 bg-[url('/product-hero.jpg')] bg-cover bg-center opacity-30"></div>
        
        {/* Animated shapes */}
        <motion.div
          className="absolute top-10 left-10 -z-0"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="#6fb6ff20"   
            xmlns="http://www.w3.org/2000/svg"
            className="w-40 h-40"
          >
            <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-20 -z-0"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <svg
            width="500"
            height="500"
            viewBox="0 0 24 24"
            fill="#1d9bf020"   
            xmlns="http://www.w3.org/2000/svg"
            className="w-60 h-60"
          >
            <path d="M13 2L3 14h7v8l11-14h-7l-1-6z" />
          </svg>
        </motion.div>


        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#6fb6ff] leading-snug"
        >
          Smart Lamp Monitoring Kit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mt-4 sm:mt-6 max-w-2xl sm:max-w-3xl text-base sm:text-lg md:text-xl text-[#cfe9ff]"
        >
          Integrated hardware and software solution for real-time lamp
          monitoring, control, and energy optimization.
        </motion.p>
        <motion.a
          href="/register"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-6 bg-[#1d9bf0] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#1480d1] transition-all"
        >
          Get Started
        </motion.a>
      </section>

      {/* Features Section → fade-in dari bawah */}
      <section id="features" className="py-16 sm:py-20 bg-[#021026]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#6fb6ff] mb-12">
            Product Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-[#06294f]/60 p-6 rounded-2xl shadow-lg border border-[#0d3f70] flex flex-col gap-3"
              >
                <CheckCircle size={28} className="text-[#1d9bf0]" />
                <h3 className="text-xl font-bold text-[#6fb6ff]">{item.title}</h3>
                <p className="text-[#cfe9ff] text-sm sm:text-base">{item.desc}</p>
                {item.img && (
                  <img src={item.img} alt={item.title} className="mt-4 rounded-xl border border-[#0d3f70]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section → slide kiri/kanan gantian */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#6fb6ff] mb-12">
            How It Works
          </h2>
          <div className="flex flex-col gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className="bg-[#06294f]/50 p-6 rounded-xl shadow-md border border-[#0d3f70] flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="text-[#1d9bf0] font-bold text-2xl sm:text-3xl">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#6fb6ff]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-[#cfe9ff] text-sm sm:text-base md:text-base">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits → zoom-in */}
      <section className="py-16 sm:py-20 bg-[#021026]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#6fb6ff] mb-12">
            Benefits & Value
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-[#06294f]/60 p-6 rounded-2xl shadow-lg border border-[#0d3f70] flex flex-col gap-3"
              >
                <h3 className="text-xl font-bold text-[#6fb6ff]">{item.title}</h3>
                <p className="text-[#cfe9ff] text-sm sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison → fade-in delay bertahap */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#6fb6ff] mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {comparisons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: i * 0.25 }}
                className="bg-[#06294f]/60 p-6 rounded-2xl shadow-lg border border-[#0d3f70] flex flex-col gap-3"
              >
                <h3 className="text-xl font-bold text-[#6fb6ff]">{item.title}</h3>
                <p className="text-[#cfe9ff] text-sm sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (biarin) */}
      <section id="testimonials" className="w-full py-16 bg-[#041c34]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-white mb-10">
            What Our Customers Say
          </h2>

          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: ".custom-pagination" }}
            breakpoints={{
              640: { slidesPerView: 1, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 25 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
            }}
            className="pb-12"
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index} className="h-full">
                <div className="h-full min-h-[280px] flex flex-col justify-between items-center p-6 rounded-2xl shadow-lg border border-[#0d3f70] bg-[#06294f]/60">
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-16 h-16 rounded-full border-2 border-[#1d9bf0] mb-4 object-cover object-center"
                    />
                  )}
                  <p className="text-sm sm:text-base text-[#cfe9ff] text-center italic flex-grow">
                    &quot;{item.feedback}&quot;
                  </p>
                  <div className="mt-4 text-center">
                    <h4 className="font-semibold text-[#1d9bf0] text-sm sm:text-base">
                      {item.name}
                    </h4>
                    {item.role && (
                      <p className="text-xs sm:text-sm text-[#cfe9ff]/80">
                        {item.role}
                      </p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="custom-pagination flex justify-center mt-4"></div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
