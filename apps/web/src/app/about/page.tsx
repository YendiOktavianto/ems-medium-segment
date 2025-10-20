"use client";

import { motion } from "framer-motion";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function AboutPage() {
  const distributorStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #072b70, #072b60)",
    color: "#7ec7ff",
    borderRadius: 12,
    padding: 12,
    fontSize: 10,
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#041023] via-[#06305a] to-[#021026] text-white font-poppins">
      <Navbar />
      {/* Hero */}
      <section
        className="relative py-40 px-6 md:px-12 text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/company.png')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-4xl md:text-6xl font-bold text-[#e6f5ff]"
        >
          About <span className="text-[#6fb6ff]">PT Innotech Global Solusindo</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mt-6 max-w-3xl mx-auto text-[#cfe9ff] leading-relaxed"
        >
          Driving innovative electrical solutions for a smarter and sustainable
          energy future.
        </motion.p>
      </section>

      {/* History */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 rounded-3xl p-10 shadow-lg border border-[#1d9bf0]/20"
        >
          <h2 className="text-3xl font-bold text-[#7ec7ff] mb-6">Brief History</h2>
          <p className="text-[#cfe9ff] leading-relaxed text-base space-y-4">
            <span>
              The rapid development of technology across sectors has led to an
              ever-growing demand for electricity—both in terms of quantity and
              quality. Inspired to take an active role in delivering
              sustainable and reliable electrical solutions, PT Innotech Global
              Solusindo (PT IGS) was established as a local Indonesian company
              providing products and solutions for the power industry.
            </span>
            <br />
            <span>
              This represents not only a great opportunity but also a challenge
              that motivates us to consistently deliver high-quality electrical
              products, integrated solutions, and awareness of the importance of
              reliable electricity for society worldwide.
            </span>
          </p>
        </motion.div>
      </section>

      {/* Vision Mission */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 rounded-3xl p-10 shadow-lg border border-[#1d9bf0]/20"
          >
            <h3 className="text-2xl font-bold text-[#7ec7ff] mb-4">Vision</h3>
            <p className="text-[#cfe9ff] leading-relaxed">
              To be the pioneer of innovative electrical solutions worldwide.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 rounded-3xl p-10 shadow-lg border border-[#1d9bf0]/20"
          >
            <h3 className="text-2xl font-bold text-[#7ec7ff] mb-4">Mission</h3>
            <p className="text-[#cfe9ff] leading-relaxed">
              To provide innovative, valuable, and reliable electrical
              solutions, tailored to the specific needs of industries and
              communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#e6f5ff] mb-12">
          Why Choose PT Innotech Global Solusindo?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Innovation & Quality",
              desc: "All products and services are designed to meet the highest standards of reliability and efficiency.",
            },
            {
              title: "Professional Technical Support",
              desc: "Our certified engineers provide full assistance from pre-implementation to after-sales support.",
            },
            {
              title: "Integrated Solutions",
              desc: "We deliver customizable solutions aligned with your budget and specific business requirements.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#072b56]/70 to-[#041023]/70 rounded-3xl p-8 shadow-lg border border-[#1d9bf0]/20"
            >
              <h3 className="text-xl font-semibold text-[#7ec7ff] mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-[#cfe9ff] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Line of Products */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#e6f5ff] mb-16">
          Line of Products & Services
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { title: "Electric Power Quality Improver", icon: "⚡" },
            { title: "Electric Power Management System", icon: "🖥️" },
            { title: "Sheet Metal Fabrication", icon: "🏭" },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-tr from-[#072b56]/80 to-[#041023]/80 hover:from-[#0a3a70]/90 hover:to-[#062344]/90 transition-all duration-300 text-start rounded-2xl p-10 shadow-lg border border-[#1d9bf0]/30 hover:scale-[1.05] cursor-pointer"
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="text-lg font-semibold text-[#7ec7ff]">{p.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
