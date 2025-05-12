import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCog, faComments } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Search Bar */}
      <div className="relative w-64">
        <input
          type="text"
          placeholder="Search your users..."
          className="w-full border rounded-full py-2 px-4 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-4">
        {[faComments, faCog, faBell].map((icon, index) => (
          <button key={index} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-all">
            <FontAwesomeIcon icon={icon} className="text-gray-600" />
          </button>
        ))}
        {/* Profile Circle */}
        <button className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
          N
        </button>
      </div>
    </header>
  );
}

export default Navbar;
