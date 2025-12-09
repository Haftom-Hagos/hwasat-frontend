import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '/images/logo.png'   // adjust path as needed

const links = [
  { to: '/', label: 'Home' },
  { to: '/maps', label: 'Dashboard' },
  { to: '/data', label: 'Data Portal' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' }
]

export default function Navbar(){
  return (
    <header className="w-full shadow-lg sticky top-0 z-50">
      <div className="w-full bg-gray-800 max-w-none px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <img 
            {/*src={logo}*/} 
            alt="Logo"
            className="w-12 h-12 object-contain"  
          />
          <div className="text-xl font-semibold text-white">Hwasat Geosense</div>
        </div>

        <nav className="hidden md:flex gap-4 items-center">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({isActive}) => 
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'bg-white text-gray-700' : 'text-white hover:bg-gray-500 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

      </div>
    </header>
  )
}
