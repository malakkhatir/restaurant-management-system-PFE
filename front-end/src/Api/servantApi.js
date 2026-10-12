import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Fonction pour récupérer le token
const getToken = () => {
  return localStorage.getItem('token');
};

// Configuration des headers avec le token
const getHeaders = () => {
  return {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Accept': 'application/json'
    }
  };
};

// Commandes en ligne
export const getCommandesEnLigne = async () => {
  try {
    const response = await axios.get(`${API_URL}/commandes-en-ligne`, getHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusCommandeEnLigne = async (commandeId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/commandes-en-ligne/${commandeId}/status`,
      { status },
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Commandes locales
export const getCommandesLocales = async () => {
  try {
    const response = await axios.get(`${API_URL}/commandes-locales`, getHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCommandeLocale = async (commandeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/commandes-locales`,
      commandeData,
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusCommandeLocale = async (commandeId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/commandes-locales/${commandeId}/status`,
      { status },
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Livraisons
export const getLivraisons = async () => {
  try {
    const response = await axios.get(`${API_URL}/livraisons`, getHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusLivraison = async (livraisonId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/livraisons/${livraisonId}/status`,
      { status },
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Réservations
export const getReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations`, getHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusReservation = async (reservationId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/reservations/${reservationId}/status`,
      { status },
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tables
export const getTables = async () => {
  try {
    const response = await axios.get(`${API_URL}/tables`, getHeaders());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusTable = async (tableId, status) => {
  try {
    const response = await axios.put(
      `${API_URL}/tables/${tableId}/status`,
      { status },
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}; 