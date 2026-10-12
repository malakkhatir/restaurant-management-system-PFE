import React, { useEffect, useState, useRef } from "react";
import { FaCheckCircle, FaTimesCircle, FaCreditCard, FaWifi, FaTable, FaArrowLeft, FaPrint, FaDownload } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../../../../Api/api";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';

// API functions for reservations
const reservationApi = {
  // Create a new reservation
  create: async (reservationData) => {
    return await api.post("/reservations", reservationData);
  },

  // Get all reservations
  getAll: async () => {
    return await api.get("/reservations");
  },

  // Get a specific reservation by ID
  getById: async (id) => {
    return await api.get(`/reservations/${id}`);
  },

  // Update a reservation
  update: async (id, reservationData) => {
    return await api.put(`/reservations/${id}`, reservationData);
  },

  // Delete a reservation
  delete: async (id) => {
    return await api.delete(`/reservations/${id}`);
  }
};

const getNext5Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
};

const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

// Fonction utilitaire pour grouper par catégorie
function groupByCategory(items) {
  return items.reduce((acc, item) => {
    acc[item.categorie] = acc[item.categorie] || [];
    acc[item.categorie].push(item);
    return acc;
  }, {});
}

// Fonction pour normaliser (enlever accents, mettre en minuscule)
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Fonction pour valider les données de réservation
const validateReservationData = (data) => {
  const errors = [];
  if (!data.id_user) errors.push("ID utilisateur manquant");
  if (!data.id_table) errors.push("Table non sélectionnée");
  if (!data.date) errors.push("Date non sélectionnée");
  if (!data.menu || data.menu.length === 0) errors.push("Aucun menu sélectionné");
  if (!data.payment) errors.push("Méthode de paiement non sélectionnée");
  return errors;
};

// Fonction pour formater les données du menu de manière compacte
const formatMenuData = (menus) => {
  if (!Array.isArray(menus)) return [];
  return menus.map(menu => ({
    id: menu.id,
    title: menu.title,
    quantity: menu.quantity || 1,
    total: parseFloat(menu.total) || 0
  }));
};

// Fonction pour formater les données de réservation
const formatReservationData = (user, selectedTable, date, time, reservationMenus, paymentMethod) => {
  const totalPrice = reservationMenus.reduce((sum, menu) => sum + menu.total, 0);
  
  return {
    id_user: user.id,
    id_table: selectedTable,
    date: `${date} ${time}`,
    menu: JSON.stringify({
      items: reservationMenus,
      total: totalPrice,
      timestamp: new Date().toISOString()
    }),
    payment: paymentMethod === "nfc" ? "NFC" : "Carte",
    status: "pending" // Statut initial de la réservation
  };
};

// Fonction principale pour ajouter une réservation
const addReservation = async (reservationData) => {
  try {
    // Validation des données
    const validationErrors = validateReservationData(reservationData);
    if (validationErrors.length > 0) {
      throw new Error(`Données invalides: ${validationErrors.join(", ")}`);
    }

    // Envoi de la requête à l'API
    const response = await api.post("/reservations", reservationData);
    
    if (!response.data) {
      throw new Error("Pas de données reçues de l'API");
    }

    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réservation:", error);
    throw error;
  }
};

// Composant du ticket de réservation
const ReservationTicket = ({ reservationData, onClose }) => {
  const ticketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Log des données pour le débogage
  console.log('Reservation Data complet:', reservationData);

  // Accéder aux données de réservation
  const reservation = reservationData?.Reservation || reservationData;
  const reservationId = reservation?.id || reservation?.id_reservation || 'N/A';

  // Fonction pour parser en toute sécurité les données du menu
  const parseMenuData = (menuData) => {
    try {
      if (!menuData) return [];
      if (typeof menuData === 'string') {
        const parsed = JSON.parse(menuData);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(menuData) ? menuData : [];
    } catch (error) {
      console.error('Erreur lors du parsing des données du menu:', error);
      return [];
    }
  };

  // Parser les données du menu et calculer le total
  const menuItems = parseMenuData(reservation?.menu);
  console.log('Menu Items parsés:', menuItems);
  const totalAmount = menuItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Formater l'heure
  const formatTime = (dateString) => {
    if (!dateString) return 'Heure non définie';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Heure invalide';
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de l\'heure:', error);
      return 'Heure invalide';
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const ticketContent = ticketRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de Réservation - Foody</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@400;500;600&display=swap');
            
            body {
              font-family: 'Poppins', sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            
            .ticket {
              max-width: 400px;
              margin: 20px auto;
              padding: 25px;
              background: white;
              border: 1px solid #e0e0e0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              position: relative;
            }
            
            .ticket::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #2563eb, #3b82f6);
            }
            
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 2px dashed #e0e0e0;
            }
            
            .restaurant-name {
              font-family: 'Playfair Display', serif;
              font-size: 28px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 5px;
              letter-spacing: 1px;
            }
            
            .ticket-title {
              font-size: 18px;
              color: #374151;
              margin: 10px 0;
            }
            
            .info-section {
              margin: 15px 0;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .info-label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .info-value {
              font-weight: 600;
              color: #1e40af;
            }
            
            .menu-items {
              margin: 20px 0;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            
            .menu-item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 8px;
              background: white;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .total-section {
              margin: 20px 0;
              padding: 15px;
              background: #f0f9ff;
              border-radius: 8px;
              border: 1px solid #bae6fd;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: 600;
              color: #0369a1;
            }
            
            .footer {
              text-align: center;
              margin-top: 25px;
              padding-top: 20px;
              border-top: 2px dashed #e0e0e0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .reservation-code {
              background: #f3f4f6;
              padding: 10px;
              border-radius: 6px;
              margin-top: 15px;
              display: inline-block;
            }
            
            .code-value {
              font-family: monospace;
              font-size: 16px;
              color: #1e40af;
              font-weight: 600;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .ticket {
                box-shadow: none;
                border: 1px solid #e0e0e0;
                margin: 0;
                padding: 20px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="restaurant-name">Foody</div>
              <div class="ticket-title">Ticket de Réservation</div>
              <div style="font-size: 12px; color: #6b7280;">
                Date d'émission: ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Numéro de Réservation</span>
                <span class="info-value">#${reservationId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date</span>
                <span class="info-value">${formatDate(reservation?.date)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Heure</span>
                <span class="info-value">${formatTime(reservation?.date)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Table</span>
                <span class="info-value">Table ${reservation?.id_table || 'N/A'}</span>
              </div>
            </div>
            
            <div class="menu-items">
              <div style="font-weight: 600; color: #374151; margin-bottom: 10px;">Menus commandés</div>
              ${menuItems.map(item => `
                <div class="menu-item">
                  <div>
                    <span style="font-weight: 500;">${item.title || 'Menu sans titre'}</span>
                    <span style="color: #6b7280; margin-left: 8px;">x${item.quantity || 1}</span>
                  </div>
                  <span style="font-weight: 600; color: #1e40af;">${item.total || 0} DH</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)} DH</span>
              </div>
              <div class="info-row" style="margin-top: 8px;">
                <span class="info-label">Méthode de paiement</span>
                <span class="info-value">${reservation?.payment || 'N/A'}</span>
              </div>
            </div>
            
            <div class="footer">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">
                Merci de votre réservation!
              </div>
              <div style="margin-bottom: 15px;">
                Présentez ce ticket à votre arrivée
              </div>
              <div class="reservation-code">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                  Code de réservation
                </div>
                <div class="code-value">${reservationId}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveAsImage = async () => {
    try {
      setIsLoading(true);
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `reservation-ticket-${reservationId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-3 max-w-sm w-full">
        {/* En-tête avec titre et boutons d'action */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Ticket de Réservation</h2>
          <div className="flex justify-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-xs"
            >
              <FaPrint size={14} /> Imprimer
            </button>
            <button
              onClick={handleSaveAsImage}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg text-xs disabled:opacity-50"
            >
              <FaDownload size={14} /> {isLoading ? 'Génération...' : 'Télécharger'}
            </button>
          </div>
        </div>

        {/* Ticket */}
        <div ref={ticketRef} className="bg-white p-3 rounded-lg border border-gray-300 shadow-lg">
          {/* En-tête du ticket */}
          <div className="text-center mb-2 border-b pb-2">
            <h2 className="text-base font-bold text-gray-800">Foody</h2>
            <p className="text-xs text-gray-500">Date: {new Date().toLocaleString()}</p>
          </div>
          
          {/* Informations de réservation */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Réservation</span>
              <span className="text-blue-600 font-bold">#{reservationId}</span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Date</span>
              <span className="text-gray-700">{formatDate(reservation?.date)}</span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Heure</span>
              <span className="text-gray-700">{formatTime(reservation?.date)}</span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Table</span>
              <span className="text-green-600 font-semibold">Table {reservation?.id_table || 'N/A'}</span>
            </div>
            
            {/* Détails des menus */}
            <div className="border-b pb-1">
              <span className="font-semibold block mb-1">Menus</span>
              <ul className="space-y-1">
                {menuItems && menuItems.length > 0 ? (
                  menuItems.map((item, index) => (
                    <li key={index} className="flex justify-between bg-gray-50 p-1 rounded text-xs">
                      <div>
                        <span className="font-medium">{item.title || 'Menu sans titre'}</span>
                        <span className="text-gray-500 ml-1">x{item.quantity || 1}</span>
                      </div>
                      <span className="font-semibold text-blue-600">{item.total || 0} DH</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-xs">Aucun menu sélectionné</li>
                )}
              </ul>
            </div>
            
            {/* Total */}
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-green-600">
                {totalAmount.toFixed(2)} DH
              </span>
            </div>
            
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Paiement</span>
              <span className="text-blue-600">{reservation?.payment || 'N/A'}</span>
            </div>
          </div>
          
          {/* Message de confirmation */}
          <div className="mt-2 text-center text-xs text-gray-600 border-t pt-2">
            <p className="font-semibold text-gray-800">Merci de votre réservation!</p>
            <p>Présentez ce ticket à votre arrivée</p>
          </div>

          {/* Code de réservation */}
          <div className="mt-2 text-center">
            <div className="inline-block p-1 bg-gray-100 rounded">
              <p className="text-[10px] text-gray-500">Code de réservation</p>
              <p className="font-mono text-xs font-bold text-gray-800">
                {reservationId}
              </p>
            </div>
          </div>
        </div>
        
        {/* Bouton fermer */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-lg text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant du bulletin de versement bancaire
const BankSlip = ({ reservationData, onClose }) => {
  const slipRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Accéder aux données de réservation
  const reservation = reservationData?.Reservation || reservationData;
  const reservationId = reservation?.id || reservation?.id_reservation || 'N/A';

  // Fonction pour parser en toute sécurité les données du menu
  const parseMenuData = (menuData) => {
    try {
      if (!menuData) return [];
      if (typeof menuData === 'string') {
        const parsed = JSON.parse(menuData);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(menuData) ? menuData : [];
    } catch (error) {
      console.error('Erreur lors du parsing des données du menu:', error);
      return [];
    }
  };

  // Calculer le total
  const menuItems = parseMenuData(reservation?.menu);
  const totalAmount = menuItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const slipContent = slipRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bulletin de Versement - Foody</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@400;500;600&display=swap');
            
            body {
              font-family: 'Poppins', sans-serif;
              background: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            
            .slip {
              max-width: 350px;
              margin: 20px auto;
              padding: 20px;
              background: white;
              border: 1px solid #e0e0e0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px dashed #e0e0e0;
            }
            
            .restaurant-name {
              font-family: 'Playfair Display', serif;
              font-size: 20px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .info-section {
              margin: 12px 0;
              padding: 12px;
              background: #f8fafc;
              border-radius: 8px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 6px 0;
              padding: 4px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            
            .info-label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .info-value {
              font-weight: 600;
              color: #1e40af;
            }
            
            .bank-details {
              margin: 15px 0;
              padding: 12px;
              background: #f0f9ff;
              border-radius: 8px;
              border: 1px solid #bae6fd;
            }
            
            .instructions {
              margin-top: 15px;
              padding: 12px;
              background: #f8fafc;
              border-radius: 8px;
              font-size: 12px;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .slip {
                box-shadow: none;
                border: 1px solid #e0e0e0;
                margin: 0;
                padding: 15px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <div class="restaurant-name">Foody</div>
              <div style="font-size: 16px; color: #374151; margin: 8px 0;">Bulletin de Versement</div>
              <div style="font-size: 11px; color: #6b7280;">
                Date: ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Réservation</span>
                <span class="info-value">#${reservationId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Montant</span>
                <span class="info-value">${totalAmount.toFixed(2)} DH</span>
              </div>
            </div>
            
            <div class="bank-details">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px;">Coordonnées bancaires</div>
              <div class="info-row">
                <span class="info-label">Banque</span>
                <span class="info-value">Attijariwafa Bank</span>
              </div>
              <div class="info-row">
                <span class="info-label">IBAN</span>
                <span class="info-value">MA 123 456 789 012 345 678 901 234</span>
              </div>
              <div class="info-row">
                <span class="info-label">SWIFT</span>
                <span class="info-value">BCMAMAM1</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bénéficiaire</span>
                <span class="info-value">Foody</span>
              </div>
            </div>
            
            <div class="instructions">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">Instructions</div>
              <ul style="list-style-type: disc; padding-left: 15px; color: #4b5563;">
                <li>Effectuez le virement avec le numéro de réservation en référence</li>
                <li>Conservez une copie du reçu de virement</li>
                <li>Présentez le reçu lors de votre arrivée</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveAsImage = async () => {
    try {
      setIsLoading(true);
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `bank-slip-${reservationId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Bulletin de Versement</h2>
          <div className="flex justify-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-xs"
            >
              <FaPrint size={14} /> Imprimer
            </button>
            <button
              onClick={handleSaveAsImage}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg text-xs disabled:opacity-50"
            >
              <FaDownload size={14} /> {isLoading ? 'Génération...' : 'Télécharger'}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg text-xs"
            >
              <FaTimesCircle size={14} /> Fermer
            </button>
          </div>
        </div>

        {/* Bulletin */}
        <div ref={slipRef} className="bg-white p-3 rounded-lg border border-gray-300 shadow-lg">
          <div className="text-center mb-2 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-800">Foody</h2>
            <p className="text-xs text-gray-500">Bulletin de Versement</p>
            <p className="text-[10px] text-gray-500">Date: {new Date().toLocaleString()}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Réservation</span>
              <span className="text-blue-600 font-bold">#{reservationId}</span>
            </div>

            <div className="flex justify-between border-b pb-1">
              <span className="font-semibold">Montant</span>
              <span className="text-lg font-bold text-green-600">
                {totalAmount.toFixed(2)} DH
              </span>
            </div>

            <div className="border-b pb-1">
              <p className="font-semibold mb-1">Coordonnées bancaires</p>
              <div className="bg-gray-50 p-2 rounded text-[10px]">
                <p>Banque: <span className="font-semibold">Attijariwafa Bank</span></p>
                <p>IBAN: <span className="font-semibold">MA 123 456 789 012 345 678 901 234</span></p>
                <p>SWIFT: <span className="font-semibold">BCMAMAM1</span></p>
                <p>Bénéficiaire: <span className="font-semibold">Foody</span></p>
              </div>
            </div>

            <div className="text-[10px] text-gray-600">
              <p className="font-semibold mb-1">Instructions</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Effectuez le virement avec le numéro de réservation en référence</li>
                <li>Conservez une copie du reçu de virement</li>
                <li>Présentez le reçu lors de votre arrivée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Reservation() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [menus, setMenus] = useState({ entrees: [], plats: [], desserts: [] });
  const [selectedMenu, setSelectedMenu] = useState({ entree: "", plat: "", dessert: "" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [step, setStep] = useState(1);
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [nfcProcessing, setNfcProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [menuQuantity, setMenuQuantity] = useState(1);
  const [reservationMenus, setReservationMenus] = useState([]);
  const [menuQuantities, setMenuQuantities] = useState({});
  const [categories, setCategories] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [categoriesWithMenus, setCategoriesWithMenus] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [showTicket, setShowTicket] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [showBankSlip, setShowBankSlip] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Charger les tables et menus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Utilisation des endpoints complets
        const tablesRes = await api.get("/tables");
        console.log('Réponse tables:', tablesRes.data.data);
        let tablesData = tablesRes.data.data;
        if (Array.isArray(tablesData)) {
          setTables(tablesData);
        } else if (Array.isArray(tablesData.tables)) {
          setTables(tablesData.tables);
        } else if (typeof tablesData === 'object') {
          // Prend le premier tableau trouvé dans l'objet
          const firstArray = Object.values(tablesData).find(v => Array.isArray(v));
          setTables(firstArray || []);
        } else {
          setTables([]);
        }

        // Récupérer les catégories
        const categoriesRes = await api.get("/categories");
        const categoriesData = Array.isArray(categoriesRes.data.data)
          ? categoriesRes.data.data
          : Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data
          : Object.values(categoriesRes.data.data).find(v => Array.isArray(v)) || [];
        setCategories(categoriesData);

        // Récupérer tous les menus
        const allMenusRes = await api.get("/menus");
        const allMenusData = Array.isArray(allMenusRes.data.menus?.data)
          ? allMenusRes.data.menus.data
          : Array.isArray(allMenusRes.data.data) ? allMenusRes.data.data
          : Array.isArray(allMenusRes.data.data) ? allMenusRes.data
          : Object.values(allMenusRes.data.data).find(v => Array.isArray(v)) || [];
        setAllMenus(allMenusData);

        // Filtrer par type de catégorie (avec normalisation)
        const entreesData = addCategoryToMenu(allMenusData).filter(menu =>
          normalize(menu.categorie).includes("entree")
        );
        const platsData = addCategoryToMenu(allMenusData).filter(menu =>
          normalize(menu.categorie).includes("plat")
        );
        const dessertsData = addCategoryToMenu(allMenusData).filter(menu =>
          normalize(menu.categorie).includes("dessert")
        );

        // Pour debug : afficher tous les menus dans chaque select
        setMenus({
          entrees: addCategoryToMenu(allMenusData),
          plats: addCategoryToMenu(allMenusData),
          desserts: addCategoryToMenu(allMenusData),
        });
      } catch (err) {
        setNotification({ type: "error", message: "Erreur lors du chargement des données." });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategoriesWithMenus = async () => {
      try {
        const res = await api.get("/menu/category");
        setCategoriesWithMenus(Array.isArray(res.data) ? res.data : []);
        console.log('Categories with menus:', res.data);
      } catch (err) {
        // Gérer l'erreur si besoin
      }
    };
    fetchCategoriesWithMenus();
  }, []);

  // Notification auto-hide
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Gestion du paiement NFC (simulation)
  const handleNfcPayment = async () => {
    setNfcProcessing(true);
    try {
      // Vérification des champs obligatoires avant le paiement
      if (!selectedTable || !date || !time || (reservationMenus.length === 0)) {
        setNotification({ 
          type: "info", 
          message: "Veuillez remplir tous les champs obligatoires." 
        });
        return;
      }

      // Simuler le paiement NFC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer la réservation après le paiement réussi
      const formattedData = {
        id_user: user.id,
        id_table: selectedTable,
        date: `${date} ${time}`,
        menu: JSON.stringify(formatMenuData(reservationMenus)),
        payment: "NFC"
      };

      console.log("Envoi des données de réservation:", formattedData);

      const response = await api.post("/reservations", formattedData);
      console.log("Réponse de l'API:", response);
      
      if (response.data) {
        setNotification({ type: "success", message: "Paiement NFC et réservation réussis !" });
        setShowTicket(true);
        setReservationData(response.data);
        setStep(4);

        // Réinitialisation des champs après succès
        setSelectedTable(null);
        setDate("");
        setTime("");
        setReservationMenus([]);
        setPaymentMethod("");
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      let errorMessage = "Erreur lors du paiement. Veuillez réessayer.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      
      setNotification({ 
        type: "error", 
        message: errorMessage 
      });
    } finally {
      setNfcProcessing(false);
    }
  };

  // Validation du paiement par carte
  const handleCardPayment = async (e) => {
    e.preventDefault();
    
    // Vérification des champs obligatoires
    if (!selectedTable || !date || !time || (reservationMenus.length === 0)) {
      setNotification({ 
        type: "info", 
        message: "Veuillez remplir tous les champs obligatoires." 
      });
      return;
    }

    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvc) {
      setNotification({ type: "info", message: "Veuillez remplir toutes les informations de la carte." });
      return;
    }

    try {
      // Simuler le paiement par carte
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Créer la réservation après le paiement réussi
      const formattedData = {
        id_user: user.id,
        id_table: selectedTable,
        date: `${date} ${time}`,
        menu: JSON.stringify(formatMenuData(reservationMenus)),
        payment: "Carte"
      };

      console.log("Envoi des données de réservation:", formattedData);

      const response = await api.post("/reservations", formattedData);
      console.log("Réponse de l'API:", response);
      
      if (response.data) {
        setNotification({ type: "success", message: "Paiement par carte et réservation réussis !" });
        setShowTicket(true);
        setReservationData(response.data);
        setStep(4);

        // Réinitialisation des champs après succès
        setSelectedTable(null);
        setDate("");
        setTime("");
        setReservationMenus([]);
        setPaymentMethod("");
        setCardData({ number: "", name: "", expiry: "", cvc: "" });
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      let errorMessage = "Erreur lors du paiement. Veuillez réessayer.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      
      setNotification({ 
        type: "error", 
        message: errorMessage 
      });
    }
  };

  // Déclare la fonction ici :
  function addCategoryToMenu(menuList) {
    return menuList.map(menu => ({
      ...menu,
      categorie: menu.category?.title || (categories.find(cat => cat.id === menu.category_id)?.title) || "Autre"
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Notification */}
        {notification.message && (
          <div className={`fixed top-4 right-4 z-50 animate-fade-in-down w-[90%] sm:w-auto`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white
              ${notification.type === "success" ? "bg-green-500" : ""}
              ${notification.type === "error" ? "bg-red-500" : ""}
              ${notification.type === "info" ? "bg-blue-500" : ""}
            `}>
              {notification.type === "success" && <FaCheckCircle size={20} />}
              {notification.type === "error" && <FaTimesCircle size={20} />}
              {notification.type === "info" && <MdRestaurantMenu size={20} />}
              <span className="text-sm">{notification.message}</span>
              <button className="ml-2" onClick={() => setNotification({ type: "", message: "" })}>×</button>
            </div>
          </div>
        )}

        {/* Animation style */}
        <style>{`
          .animate-fade-in-down {
            animation: fadeInDown 0.7s ease-out;
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-30px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>

        {/* Bouton retour */}
        <button
          onClick={() => navigate('/user/client')}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all"
        >
          <FaArrowLeft /> Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaTable className="text-blue-500" /> Réserver une table
          </h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              ))}
            </div>
          ) : step === 1 ? (
            <>
              {/* Sélection de la date */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Date de réservation</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 mb-2"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                >
                  <option value="">Choisir une date</option>
                  {getNext5Days().map(d => (
                    <option key={d.toISOString()} value={d.toISOString().slice(0, 10)}>
                      {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              {/* Sélection de l'heure */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Heure</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 mb-2"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                >
                  <option value="">Choisir une heure</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              {/* Sélection de la table */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Choisissez une table</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {tables.map(table => (
                    <button
                      key={table.id}
                      type="button"
                      disabled={table.status !== 1}
                      onClick={() => setSelectedTable(table.id)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-lg shadow
                        border-2 transition-all
                        ${selectedTable === table.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"}
                        ${table.status === 1 ? "hover:border-blue-400 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                      `}
                    >
                      <FaTable className={`mb-2 ${table.status === 1 ? "text-green-500" : "text-gray-400"}`} size={28} />
                      <span className="font-bold">{table.name}</span>
                      <span className={`text-xs ${table.status === 1 ? "text-green-600" : "text-gray-400"}`}>
                        {table.status === 1 ? "Disponible" : "Indisponible"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Suivant */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!date || !time || !selectedTable) {
                      setNotification({ type: "info", message: "Veuillez choisir la date, l'heure et la table." });
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
                >
                  Suivant
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              {/* Choix du menu par catégorie */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Choisissez vos menus</h2>
              {/* Sélection de la catégorie */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Catégorie</label>
                <select
                  value={selectedCategoryId}
                  onChange={e => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedMenuId("");
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 mb-4"
                >
                  <option value="">Choisir une catégorie</option>
                  {categoriesWithMenus.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
                {/* Sélection du menu de la catégorie choisie */}
                {selectedCategoryId && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                      {(categoriesWithMenus.find(cat => String(cat.id) === String(selectedCategoryId))?.menus || []).map(menu => {
                        const quantity = menuQuantities[menu.id] || 1;
                        const total = (parseFloat(menu.price) * quantity).toFixed(2);
                        return (
                          <div key={menu.id} className="flex flex-col items-center bg-white rounded-xl shadow p-4">
                            <img
                              src={`http://localhost:8000/storage/${menu.image}`}
                              alt={menu.title}
                              className="w-32 h-32 object-cover rounded-lg border mb-2"
                            />
                            <div className="font-semibold text-gray-800">{menu.title}</div>
                            <div className="text-blue-600 font-bold mb-2">{menu.price} DH</div>
                            <div className="flex items-center gap-2 mb-2">
                              <label className="text-gray-700">Quantité :</label>
                              <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={e =>
                                  setMenuQuantities(q => ({ ...q, [menu.id]: Math.max(1, Number(e.target.value)) }))
                                }
                                className="w-16 border border-gray-300 rounded-lg p-1"
                              />
                            </div>
                            <div className="mb-2 text-sm text-gray-500">Total : <span className="font-bold">{total} DH</span></div>
                            <button
                              onClick={() => {
                                setReservationMenus(prev => [
                                  ...prev,
                                  { ...menu, quantity, total: parseFloat(menu.price) * quantity }
                                ]);
                                setMenuQuantities(q => ({ ...q, [menu.id]: 1 }));
                              }}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
                            >
                              Ajouter
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Liste des menus choisis */}
                    {reservationMenus.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Menus choisis :</h3>
                        <ul className="divide-y divide-gray-100">
                          {reservationMenus.map((menu, idx) => (
                            <li key={idx} className="flex items-center justify-between py-2">
                              <span>{menu.title} x <span className="font-bold">{menu.quantity}</span> = <span className="font-bold text-blue-600">{menu.total.toFixed(2)} DH</span></span>
                              <button
                                type="button"
                                onClick={() => setReservationMenus(reservationMenus.filter((_, i) => i !== idx))}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Retirer
                              </button>
                            </li>
                          ))}
                          {/* Calcul et affichage du total général */}
                          <li className="flex items-center justify-between py-2 font-bold text-blue-700">
                            <span>Total général :</span>
                            <span>{reservationMenus.reduce((sum, m) => sum + m.total, 0).toFixed(2)} DH</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Suivant / Précédent */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                >
                  Précédent
                </button>
                <button
                  onClick={() => {
                    if (reservationMenus.length === 0) {
                      setNotification({ type: "info", message: "Veuillez ajouter au moins un menu." });
                      return;
                    }
                    setStep(3);
                  }}
                  disabled={reservationMenus.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  Suivant
                </button>
              </div>
            </>
          ) : step === 3 ? (
            <>
              {/* Paiement */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Paiement</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("nfc")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg shadow font-semibold transition-all
                    ${paymentMethod === "nfc" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}
                  `}
                >
                  <FaWifi /> Paiement NFC
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg shadow font-semibold transition-all
                    ${paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}
                  `}
                >
                  <FaCreditCard /> Carte bancaire
                </button>
              </div>

              {/* NFC */}
              {paymentMethod === "nfc" && (
                <div className="text-center my-6">
                  <FaWifi className="mx-auto text-blue-500 text-4xl animate-pulse mb-2" />
                  <p className="mb-4 text-gray-700">Approchez votre carte NFC du terminal...</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleNfcPayment}
                      disabled={nfcProcessing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                      {nfcProcessing ? "Paiement en cours..." : "Simuler le paiement NFC"}
                    </button>
                  </div>
                </div>
              )}

              {/* Carte bancaire */}
              {paymentMethod === "card" && (
                <form onSubmit={handleCardPayment} className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 shadow-inner">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Numéro de carte</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={e => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Nom sur la carte</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom Prénom"
                      value={cardData.name}
                      onChange={e => setCardData({ ...cardData, name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">Expiration</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">CVC</label>
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="CVC"
                        maxLength={4}
                        value={cardData.cvc}
                        onChange={e => setCardData({ ...cardData, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-300 transition-all"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
                    >
                      Valider le paiement
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            // Confirmation finale
            <div className="text-center py-12">
              <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Réservation confirmée !</h2>
              <p className="text-gray-600 mb-6">Veuillez choisir le type de bulletin à afficher :</p>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <button
                  onClick={() => {
                    setShowTicket(true);
                    setShowBankSlip(false);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <FaPrint size={20} /> Bulletin de Réservation
                </button>
                <button
                  onClick={() => {
                    setShowBankSlip(true);
                    setShowTicket(false);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  <FaPrint size={20} /> Bulletin de Versement
                </button>
                <button
                  onClick={() => navigate('/user/client')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shadow-lg"
                >
                  <FaArrowLeft size={20} /> Retour à l'accueil
                </button>
              </div>

              {/* Afficher le bulletin approprié uniquement si un bouton a été cliqué */}
              {showTicket && reservationData && (
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
                  <ReservationTicket
                    reservationData={reservationData}
                    onClose={() => setShowTicket(false)}
                  />
                </div>
              )}

              {showBankSlip && reservationData && (
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
                  <BankSlip
                    reservationData={reservationData}
                    onClose={() => setShowBankSlip(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
