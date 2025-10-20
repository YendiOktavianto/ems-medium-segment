"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBolt, FaChartBar, FaLock, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import LoadingOverlay from "./components/LoadingOverlay";

// features data (original)
const features = [
  { icon: <FaBolt size={48} />, title: "Real-Time Monitoring", desc: "Monitor your devices instantly and gain full control over your energy usage in real time."},
  { icon: <FaChartBar size={48} />, title: "Energy Analytics", desc: "Visualize your energy consumption through detailed, interactive analytics and actionable insights." },
  { icon: <FaLock size={48} />, title: "Data Security", desc: "All your data is encrypted and protected with industry-standard security measures for complete peace of mind."},
];

// leadership/executives
const leadership = [
  { name: "Alice Williams", role: "CEO - Leading the company's vision for sustainable energy solutions.", img: "/profile.svg" },
  { name: "Robert Brown", role: "CTO - Overseeing technological innovation and product development.", img: "/profile.svg" },
  { name: "Emma Davis", role: "COO - Managing operations to ensure efficiency and growth.", img: "/profile.svg" },
];

// contact team
const contacts = [
  { name: "David", number: "6281234567890", role: "Sales Manager", img: "/profile.svg" },
  { name: "Sophia", number: "6289876543210", role: "Customer Support", img: "/profile.svg" },
  { name: "Michael", number: "6281122334455", role: "Technical Support", img: "/profile.svg" },
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingOverlay show={true} text="Loading..." />;

  return (
    <main className="relative min-h-screen text-white font-poppins overflow-x-hidden bg-gradient-to-br from-[#041023] via-[#06305a] to-[#021026] ">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-39 pb-32 px-6 md:px-12 text-center overflow-hidden">
        <motion.video
          autoPlay loop muted
          className="absolute top-0 left-0 w-full h-full object-cover -z-10 opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </motion.video>

        {/* Animated shapes */}
        <motion.div 
          className="absolute top-10 left-10 w-40 h-40 bg-[#6fb6ff]/10 rounded-full -z-0"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-60 h-60 bg-[#1d9bf0]/10 rounded-full -z-0"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold leading-tight text-[#e6f5ff]"
        >
          Intelligent <span className="text-[#6fb6ff]">Energy Management</span> for a Smarter, Sustainable Future
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-[#cfe9ff] max-w-2xl mx-auto"
        >
          power management system offers a cutting-edge platform for real-time energy monitoring and management, helping you optimize consumption, reduce costs, and promote sustainability—all through a secure and intuitive interface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex justify-center gap-4"
        >
          <motion.a href="/register" whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] transition font-medium shadow-lg shadow-blue-900/40">
            Experience It Now
          </motion.a>
          <motion.a href="/discover" whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-xl border border-[#6fb6ff] hover:bg-[#06294f]/40 transition font-medium">
            Discover More Features
          </motion.a>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-[#e6f5ff] mb-6"
        >
          About <span className="text-[#6fb6ff]">PowerSys</span>
        </motion.h2>
        
        <p className="max-w-3xl mx-auto text-[#cfe9ff] leading-relaxed mb-8">
          Power Monitoring System is an intelligent energy management platform designed to help 
          businesses monitor, analyze, and optimize their power usage in real time. 
          With advanced analytics and secure infrastructure, PowerSys empowers 
          organizations to reduce costs and embrace a sustainable future.
        </p>

        {/* Stats / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 shadow-lg border border-[#1d9bf0]/20"
          >
            <h3 className="text-4xl font-bold text-[#7ec7ff]">3k+</h3>
            <p className="text-sm text-[#cfe9ff] mt-2">Businesses already trust Power Monitoring System</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 shadow-lg border border-[#1d9bf0]/20"
          >
            <h3 className="text-4xl font-bold text-[#7ec7ff]">20%</h3>
            <p className="text-sm text-[#cfe9ff] mt-2">Average energy savings per client</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 shadow-lg border border-[#1d9bf0]/20"
          >
            <h3 className="text-4xl font-bold text-[#7ec7ff]">24/7</h3>
            <p className="text-sm text-[#cfe9ff] mt-2">Secure monitoring & support</p>
          </motion.div>
        </div>

        {/* CTA to Company About Page */}
        <div className="mt-10">
          <a 
            href="/about"
            className="inline-block px-6 py-3 rounded-xl border border-[#6fb6ff] hover:bg-[#06294f]/40 transition text-sm font-medium"
          >
            Learn More About Our Company
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 
                        shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 p-10 md:p-16">
          {/* Top Content */}
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div>
              <span className="uppercase text-xs tracking-widest text-[#6fb6ff] font-semibold">
                Future Energy
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#e6f5ff] leading-snug">
                Experience that grows with your scale.
              </h2>
            </div>
            <p className="text-[#cfe9ff] leading-relaxed text-base md:text-sm my-12 mx-12">
              Design an energy management system tailored to your needs, featuring real-time monitoring, actionable insights, and secure data handling. scale effortlessly as your operations grow.
            </p>
          </div>

          {/* Bottom Features */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-start text-left"
              >
                <div className="mb-4 text-[#6fb6ff]">{f.icon}</div>
                <h3 className="text-lg font-semibold text-[#7ec7ff]">{f.title}</h3>
                <p className="text-sm text-[#cfe9ff] mt-2 mr-5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Product Promotion Section */}
      <section id="products" className="py-20 px-6 md:px-12 max-w-6xl mx-auto lg:px-25">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#e6f5ff] mb-16">
          Why Choose Power Management System
        </h2>

        <div className="space-y-10">
          

          {/* Grid for the rest */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Box 2 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 
                            p-10 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 
                            flex flex-col items-start justify-center text-start">
              <h3 className="text-7xl font-semibold text-[#7ec7ff] mb-4">3k +</h3>
            <p className="text-[#cfe9ff] leading-relaxed max-w-3xl text-sm">
              Businesses already Running on Power Management System
            </p>
            </div>

            {/* Box 3 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 
                            p-10 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 
                            flex flex-col items-start justify-start text-start">
              <p className="mt-4 text-[#cfe9ff] text-sm">
                PowerSys integrates effortlessly with your existing infrastructure, ensuring a smooth transition 
                without disruptions to your daily workflow.
              </p>
            </div>
            
          </div>
          {/* Full Width Box */}
          <div className="rounded-2xl bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 
                p-12 shadow-lg shadow-blue-900/30 border border-[#1d9bf0]/20 
                flex flex-col md:flex-row items-center md:items-start justify-center gap-10"
          >
            {/* Text Kiri */}
            <div className="flex-1 text-left text-sm">
              <h3 className="text-5xl font-semibold text-[#7ec7ff] mb-6">
                Stable Performance
              </h3>
              <p className="mt-4 text-[#cfe9ff] text-sm">
                No asset volatility – reliable, consistent, and predictable performance. with powersys, your operations remain uninterrupted, ensuring smooth performance that scales with your business. designed for durability and long-term stability, our system provides confidence at every step of your energy journey.
              </p>
            </div>

            {/* Gambar Kanan */}
            <div className="flex-1 flex justify-center md:justify-end">
              <img 
                src="/monitoring.png" 
                alt="Stable Performance Illustration" 
                className="w-full h-full object-cover rounded-t-2xl md:rounded-bl-none md:rounded-tr-2xl mb-[-100rem]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="team" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#e6f5ff] mb-12">
          Our Leadership Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {leadership.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                boxShadow: "0px 0px 25px rgba(111,182,255,0.6)", 
                borderColor: "#6fb6ff"
              }}
              className="bg-gradient-to-br from-[#072b56]/80 to-[#041023]/80 
                        rounded-2xl p-6 shadow-lg shadow-blue-900/40 
                        border border-[#1d9bf0]/20 
                        transition-all duration-300 text-center"
            >
              <Image
                src={t.img}
                alt={t.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover 
                          border-2 border-[#6fb6ff]/40"
              />
              <h3 className="text-lg font-semibold text-[#7ec7ff]">{t.name}</h3>
              <p className="text-sm text-[#cfe9ff] mt-2">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Contact Section (WhatsApp multiple numbers) */}
      <section id="contact" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#e6f5ff] mb-4">
          Contact Our Team
        </h2>
        <p className="text-[#cfe9ff] mb-12 max-w-2xl mx-auto text-center">
          Reach out directly to the right expert. Quick, simple, and professional.
        </p>

        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8">
          {contacts.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 p-6 rounded-3xl shadow-lg shadow-blue-900/30
                        border border-[#1d9bf0]/20 flex flex-col items-center text-center transition-all duration-300
                        hover:shadow-xl"
            >
              {/* Foto */}
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={c.img}
                  alt={c.name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-2 border-[#6fb6ff]/50 shadow-sm"
                />
                {/* Status online */}
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-[#041023] rounded-full"></span>
              </div>

              {/* Nama & Role */}
              <h3 className="text-lg font-semibold text-[#7ec7ff]">{c.name}</h3>
              <p className="text-sm text-[#cfe9ff] mb-4">{c.role}</p>

              {/* WhatsApp button */}
              <a
                href={`https://wa.me/${c.number}?text=Hello%20${encodeURIComponent(c.name)},%20I%20would%20like%20to%20inquire%20about%20PowerSys`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium
                          shadow-md hover:bg-[#1ebe5d] hover:shadow-lg transition"
              >
                <FaWhatsapp className="text-base" /> Chat
              </a>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Lokasi */}
      <section
        id="location"
        className=" px-6 md:px-12 max-w-7xl mx-auto"
      >
        <div className="p-10">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#e6f5ff] tracking-tight">
              Our Location
            </h2>
            <p className="mt-4 text-[#cfe9ff] max-w-xl mx-auto text-base">
              Visit our head office or reach out through phone.  
              We’re available during business hours.
            </p>
          </div>

          {/* Content */}
          <div className="py-10 grid md:grid-cols-2 gap-12 items-start bg-gradient-to-br from-[#072b56]/60 to-[#041023]/60 rounded-2xl p-8 shadow-lg shadow-blue-900/40 border border-[#1d9bf0]/20">
            {/* Info Section */}
            <div className="rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[#7ec7ff] mb-6">
                Headquarters
              </h3>
              <ul className="space-y-5 text-[#cfe9ff] text-sm md:text-base leading-relaxed">
                <li className="flex items-start gap-3  text-sm">
                  <MapPin className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                  Jl. Kp Pamahan No 63 Kel. Jatimekar, Kel. Jatiasih Bekasi - Jawa Barat.
                </li>
                <li className="flex items-start gap-3  text-sm">
                  <Clock className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                  Monday – Friday, 09:00 – 17:30
                </li>
                <li className="flex items-start gap-3  text-sm">
                  <Phone className="text-[#1d9bf0] w-5 h-5 mt-0.5" />
                  +62 812 3456 7890
                </li>
              </ul>

              <a
                href="https://maps.app.goo.gl/gvk4YYXyBh6SgBPQA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1d9bf0] to-[#1277c9] hover:opacity-90 text-white text-sm font-medium shadow-md shadow-[#1d9bf0]/30 transition"
              >
                Open Google Maps
              </a>
            </div>

            {/* Map Section */}
            <div className="relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#1d9bf0]/30 shadow-xl shadow-[#1d9bf0]/20">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.635313053707!2d106.8302673153913!3d-6.208763662548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e7f2e7d2bb%3A0x9f1a6e6d4e02a2e7!2sJakarta!5e0!3m2!1sen!2sid!4v1691234567890!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
