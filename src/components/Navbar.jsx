import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "/images/logo.png";  
import { Link } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/maps", label: "Dashboard" },
  { to: "/data", label: "Data Portal" },
  { to: "/about", label: "About" }
  
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="w-full shadow-lg sticky top-0 z-50 bg-gray-800">
      <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">

        {/* Logo & Title */}
    <Link to="/" className="flex items-center gap-3">
      {/*<img
        src={logo}
        alt="Logo"
        className="w-10 h-10 object-contain"
      />*/}
      <div className="text-xl font-semibold text-white">
      Hwasat Geosense
      </div>
    </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-4 items-center">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-white text-gray-800"
                    : "text-white hover:bg-gray-500 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger (Mobile only) */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? (
            // X icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900 overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-4 pb-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)} // close menu
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium mt-1 transition ${
                  isActive
                    ? "bg-white text-gray-800"
                    : "text-white hover:bg-gray-600"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
