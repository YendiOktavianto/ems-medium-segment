"use client";


import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { motion } from "framer-motion";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ExperiencePage() {
  const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);
  
    if (isLoading) return <LoadingOverlay show={true} text="Loading..." />;

  return (
    <main className="px-6 md:px-12 lg:px-20 min-h-screen bg-gradient-to-br from-[#041023] via-[#06305a] to-[#021026] text-white">
      
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-20 text-center mt-15">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-[#6fb6ff]"
        >
          Experience Power Management System in Action
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[#cfe9ff]"
        >
          Explore real-time monitoring, interactive dashboards, and smart automation. 
          See how PowerSys makes energy management easier and smarter.
        </motion.p>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {[
          { title: "Live Demo", desc: "Try out our live demo and experience how PowerSys responds instantly." },
          { title: "Real-Time Monitoring", desc: "See live updates on energy usage, device performance, and more." },
          { title: "Interactive Dashboard", desc: "Explore charts and data visualization designed for clarity and speed." },
          { title: "Smart Automation", desc: "Set rules and schedules to optimize energy usage automatically." },
          { title: "Alerts & Notifications", desc: "Receive instant alerts for anomalies or high consumption events." },
          { title: "Custom Reports", desc: "Generate detailed reports to analyze patterns and reduce costs." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="bg-[#06294f]/40 p-6 md:p-8 rounded-2xl shadow-lg border border-[#0d3f70]"
          >
            <h3 className="text-2xl font-bold text-[#6fb6ff]">{item.title}</h3>
            <p className="mt-4 text-[#cfe9ff]">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-[#6fb6ff]"
        >
          How PowerSys Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-[#cfe9ff] text-lg md:text-xl max-w-3xl mx-auto"
        >
          PowerSys integrates smart sensors, real-time data analytics, and intuitive dashboards
          to give you complete control over your energy management. From monitoring usage to
          automating devices, everything happens seamlessly in one platform.
        </motion.p>
        <div className="mt-12 grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {[
            { step: "1", title: "Connect Devices", desc: "Easily link all your energy-consuming devices." },
            { step: "2", title: "Monitor Usage", desc: "Track consumption in real-time and get insights." },
            { step: "3", title: "Automate & Optimize", desc: "Set rules to reduce waste and maximize efficiency." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#06294f]/40 p-6 md:p-8 rounded-xl shadow-md border border-[#0d3f70]"
            >
              <div className="text-4xl md:text-5xl font-bold text-[#1d9bf0] mb-4">{item.step}</div>
              <h4 className="text-xl md:text-2xl font-semibold text-[#6fb6ff]">{item.title}</h4>
              <p className="mt-2 text-[#cfe9ff]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section - full-width kotak luar */}
      <section className="py-20 bg-[#021026]/60 relative -mx-6 md:-mx-12 lg:-mx-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#6fb6ff]">What Our Users Say</h2>

        {/* Grid card responsive dengan padding horizontal */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 md:gap-10 lg:gap-12 px-6 md:px-12 lg:px-20">
          {[
            { name: "Alex Johnson", feedback: "PowerSys helped us reduce energy costs by 30% in just 3 months!" },
            { name: "Samantha Lee", feedback: "The real-time monitoring is a game-changer for our operations." },
            { name: "Alex Johnson", feedback: "PowerSys helped us reduce energy costs by 30% in just 3 months!" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#06294f]/40 p-6 md:p-8 rounded-xl shadow-md border border-[#0d3f70]"
            >
              <p className="text-[#cfe9ff]">&quot;{item.feedback}&quot;</p>
              <h4 className="mt-4 font-bold text-[#1d9bf0]">{item.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-30 pb-10 text-center">
        <motion.a
          whileHover={{ scale: 1.05 }}
          href="/register"
          className="px-8 py-4 md:px-10 md:py-5 rounded-xl bg-[#1d9bf0] hover:bg-[#1277c9] transition font-medium text-lg md:text-xl shadow-lg shadow-blue-900/40"
        >
          Try Power Management System Now
        </motion.a>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#6fb6ff]">Frequently Asked Questions</h2>
        <div className="mt-12 space-y-6 md:space-y-8 lg:space-y-10">
          {[
            { q: "Can I try PowerSys for free?", a: "Yes! We offer a live demo so you can explore the system without any commitment." },
            { q: "Does it support multiple devices?", a: "Absolutely. PowerSys can manage multiple devices across different locations." },
            { q: "Is my data secure?", a: "We use advanced encryption and follow strict security protocols to protect your data." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-[#06294f]/40 p-6 md:p-8 rounded-xl border border-[#0d3f70]"
            >
              <h4 className="font-semibold text-[#6fb6ff]">{item.q}</h4>
              <p className="mt-2 text-[#cfe9ff]">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
