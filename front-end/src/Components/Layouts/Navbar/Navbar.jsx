import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaSignInAlt, 
  FaMapMarkedAlt, 
  FaInfoCircle, 
  FaEnvelope, 
  FaHamburger, 
  FaUtensils,
  FaComments,
  FaSignOutAlt
} from 'react-icons/fa';
import { FaLayerGroup } from 'react-icons/fa';
import './Navbar.css';
import api from '../../../Api/api';

const links = [
  { to: '/', label: 'Accueil', icon: <FaHome /> },
  { to: '/local', label: 'Localisation', icon: <FaMapMarkedAlt /> },
  { to: '/menu', label: 'Menu', icon: <FaUtensils /> },
  { to: '/about', label: 'À propos', icon: <FaInfoCircle /> },
  { to: '/feedback', label: 'Feedback', icon: <FaComments /> },
  { to: '/contact', label: 'Contact', icon: <FaEnvelope /> },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    api.get('/categories')
      .then((response) => {
        setCategories(response.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleCategoryClick = (categoryId) => {
    navigate(`/menu?category=${categoryId}`);
    setIsMenuOpen(false);
    closeMobileMenu();
  };

  const handleLogout = () => {
    // Supprimer le token et le rôle de l'utilisateur
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-base font-medium flex items-center gap-x-2 ${isActive ? 'text-blue-500' : 'text-gray-900'} no-underline hover:text-blue-500 transition-colors duration-200`;

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <NavLink to="/" className={linkClass} end>
            <FaHamburger className="h-8 w-auto text-xl" />
            <span className="sr-only">Accueil</span>
          </NavLink>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:flex lg:gap-x-8">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={closeMobileMenu}>
              {icon} {label}
            </NavLink>
          ))}

          {/* Bouton pour afficher les catégories */}
          <div className="relative">
            <button
              className="text-base font-medium flex items-center gap-x-2 text-gray-900 hover:text-blue-500 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FaLayerGroup /> Catégories
              <svg
                className={`ml-2 w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10 transform transition-all duration-200 ease-out">
                {categories.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">Aucune catégorie disponible</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full text-left px-4 py-2 text-base text-gray-900 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200"
                    >
                      {category.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoggedIn ? (
            <button onClick={handleLogout} className={linkClass}>
              <FaSignOutAlt /> Déconnexion
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
            <FaSignInAlt /> Connexion
          </NavLink>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-25 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <NavLink to="/" className={linkClass} end>
                <FaHamburger className="h-8 w-auto text-xl" />
                <span className="sr-only">Accueil</span>
              </NavLink>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="sr-only">Close menu</span>
                <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-7 py-6">
                  {links.map(({ to, label, icon }) => (
                    <NavLink key={to} to={to} className={linkClass} onClick={closeMobileMenu}>
                      {icon} {label}
                    </NavLink>
                  ))}
                  <div className="space-y-2">
                    <button
                      className="w-full text-base font-medium flex items-center gap-x-2 text-gray-900 hover:text-blue-500 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <FaLayerGroup /> Catégories
                      <svg
                        className={`ml-2 w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {isMenuOpen && (
                      <div className="space-y-2 pl-4">
                        {categories.length === 0 ? (
                          <div className="px-4 py-2 text-gray-500">Aucune catégorie disponible</div>
                        ) : (
                          categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className="w-full text-left px-4 py-2 text-base text-gray-900 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200"
                            >
                              {category.title}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="py-6">
                  {isLoggedIn ? (
                    <button onClick={handleLogout} className={linkClass}>
                      <FaSignOutAlt /> Déconnexion
                    </button>
                  ) : (
                  <NavLink to="/login" className={linkClass} onClick={closeMobileMenu}>
                    <FaSignInAlt /> Connexion
                  </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
