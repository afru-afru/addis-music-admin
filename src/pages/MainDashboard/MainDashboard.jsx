import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import the components for each section
import AboutUs from '../../components/AboutUs/aboutUs';
import Nominees from '../../components/nominees.js/Nominees';
import Location from '../../components/Location/location';
import WonArtistsAdmin from '../../components/PreviousWinners/PreviousWinners';
import SponsorsPage from '../../components/Sponsors/Sponsors';
import GalleryPage from '../../components/Gallery/Gallery';
import AdminDashboardIntro from '../../components/DashboardContent/DashboardContent';

import Sidebar from '../../components/Sidebar/side';
import Navbar from '../../components/Navbar/navbar';

function MainDashboard() {
  const [selectedComponent, setSelectedComponent] = useState('dashboard');

  const handleSidebarClick = (componentId) => {
    setSelectedComponent(componentId);
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'dashboard':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><AdminDashboardIntro /></motion.div>;
      case 'about':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><AboutUs /></motion.div>;
      case 'nominees':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><Nominees /></motion.div>;
      case 'location':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><Location /></motion.div>;
      case 'previous-winners':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><WonArtistsAdmin /></motion.div>;
      case 'sponsors':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><SponsorsPage /></motion.div>;
      case 'gallery':
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}><GalleryPage /></motion.div>;
      default:
        return <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>Default Dashboard Content</motion.div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with the callback to handle item clicks */}
      <Sidebar onItemClick={handleSidebarClick} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        {/* <Navbar /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-red-50 via-pink-50 to-white">
          {/* Animated Component Rendering */}
          <AnimatePresence mode="wait">
            {renderComponent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;