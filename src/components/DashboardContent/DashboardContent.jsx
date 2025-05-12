import React from "react";
import { motion } from "framer-motion";

export default function AdminDashboardIntro() {
  return (
    <main className="flex-1 p-12 relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-white">
      {/* Decorative Music-Related Icon */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="absolute w-[400px] h-[400px] bg-red-100 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-pink-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="flex justify-center items-center mb-8">
          {/* Music Icon (Wave) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              loop: Infinity,
              ease: "linear",
              duration: 6,
            }}
            className="w-24 h-24 text-red-500 animate-pulse"
          >
            {/* Add a wave or music-related icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="M6 12h12M6 12c1.25-3 3.75-3 5.25-5 1.5-2 4.5-2 6-5M6 12c1.25 3 3.75 3 5.25 5 1.5 2 4.5 2 6 5" />
            </svg>
          </motion.div>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-800 mb-6 leading-tight text-center">
          Welcome Admin 🎶
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto text-center">
          Dive into your personalized Music Awards Dashboard. Curate the nominees, announce locations, manage the gallery, and highlight top sponsors—all in one place.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Gallery Management",
              desc: "Upload and arrange event moments with style.",
              emoji: "🖼️",
            },
            {
              title: "Sponsor Highlight",
              desc: "Showcase platinum and gold sponsors elegantly.",
              emoji: "💼",
            },
            {
              title: "Edit About Page",
              desc: "Publish details like location and purpose.",
              emoji: "📍",
            },
            {
              title: "Nominee Publishing",
              desc: "Highlight outstanding talent and categories.",
              emoji: "🌟",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white border border-pink-100 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all text-center"
            >
              <h3 className="text-3xl mb-2">{item.emoji}</h3>
              <h4 className="text-xl font-semibold text-red-500 mb-1">{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-10 py-4 text-lg rounded-full shadow-md hover:shadow-xl transition"
          >
            ✨ Go to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
