import React from 'react';
import './Footer.css';
import logo from '../Images/Photopro.jpg';

import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-section">
          <h4>Restaurant</h4>
          <ul>
            <li><a href="#">À propos de nous</a></li>
            <li><a href="#">Carrières</a></li>
            <li><a href="#">Politique de confidentialité</a></li>
            <li><a href="#">Conditions d'utilisation</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li><a href="#">Contactez-nous</a></li>
            <li><a href="#">Support</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Suivez-nous</h4>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram /> 
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedinIn /> 
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h4>Nos développeurs</h4>
          {/* ✅ Photos alignées horizontalement */}
          <div className="developers flex flex-row gap-x-6 items-center justify-center mt-4">
            <div className="developer flex flex-col items-center">
              <a href="https://www.linkedin.com/in/said-ouchrif-990947194/" target="_blank" rel="noopener noreferrer">
                <img src={logo} alt="Développeur 1" className="developer-image"/>
              </a>
              <p>Said Ouchrif</p>
            </div>
            <div className="developer flex flex-col items-center">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img src={require('../Images/icon.jpg')} alt="Développeuse 2" className="developer-image"/>
              </a>
              <p>Malak Bernaoui</p>
            </div>
            <div className="developer flex flex-col items-center">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <img src={require('../Images/icon.jpg')} alt="Développeuse 3" className="developer-image"/>
              </a>
              <p>Malak Khatir</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
