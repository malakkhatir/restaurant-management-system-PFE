import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEye, FaSpinner, FaSearch, FaFilter, FaArrowLeft, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaFileDownload, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const LivreursAdmin = () => {
  const navigate = useNavigate();
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: '',
    password: '',
    password_confirmation: '',
    status: 'inactif'
  });
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [livreurToDelete, setLivreurToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAttestation, setShowAttestation] = useState(false);
  const attestationRef = useRef(null);

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/livreurs');
      setLivreurs(response.data);
    } catch (error) {
      console.error('Error fetching livreurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handlePrintAttestation = async () => {
    if (attestationRef.current) {
      try {
        const canvas = await html2canvas(attestationRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`attestation-${selectedLivreur.nom}-${selectedLivreur.prenom}.pdf`);
        showNotification('Attestation téléchargée avec succès');
      } catch (error) {
        showNotification('Erreur lors du téléchargement de l\'attestation', 'error');
      }
    }
  };

  const handleDownloadAttestation = async () => {
    if (attestationRef.current) {
      try {
        const canvas = await html2canvas(attestationRef.current);
        const link = document.createElement('a');
        link.download = `attestation-${selectedLivreur.nom}-${selectedLivreur.prenom}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showNotification('Attestation téléchargée avec succès');
      } catch (error) {
        showNotification('Erreur lors du téléchargement de l\'attestation', 'error');
      }
    }
  };

  const handleAddLivreur = async (e) => {
    e.preventDefault();
    setError('');

    // Validation du mot de passe
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('La confirmation du mot de passe ne correspond pas');
      return;
    }

    try {
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.cin,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: parseInt(formData.code_postal),
        pays: formData.pays,
        status: formData.status,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };

      await axios.post('http://localhost:8000/api/livreurs', dataToSend);
      setShowAddModal(false);
      fetchLivreurs();
      resetForm();
      showNotification('Livreur ajouté avec succès');
    } catch (error) {
      console.error('Erreur complète:', error.response); // Pour le débogage
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.password) {
          setError(errors.password[0]);
        } else if (errors.cin) {
          setError(errors.cin[0]);
        } else if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.telephone) {
          setError(errors.telephone[0]);
        } else {
          setError('Erreur lors de l\'ajout du livreur');
        }
      } else {
        setError(error.response?.data?.message || 'Erreur lors de l\'ajout du livreur');
      }
    }
  };

  const handleEditLivreur = async (e) => {
    e.preventDefault();
    setError('');

    // Validation du mot de passe si fourni
    if (formData.password) {
      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        setError('La confirmation du mot de passe ne correspond pas');
        return;
      }
    }

    try {
      const dataToSend = {
        nom: formData.nom,
        prenom: formData.prenom,
        cin: formData.cin,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: parseInt(formData.code_postal),
        pays: formData.pays,
        status: formData.status,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };

      await axios.put(`http://localhost:8000/api/livreurs/${selectedLivreur.id_livreur}`, dataToSend);
      setShowEditModal(false);
      fetchLivreurs();
      resetForm();
      showNotification('Livreur modifié avec succès');
    } catch (error) {
      console.error('Erreur complète:', error.response); // Pour le débogage
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.password) {
          setError(errors.password[0]);
        } else if (errors.cin) {
          setError(errors.cin[0]);
        } else if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.telephone) {
          setError(errors.telephone[0]);
        } else {
          setError('Erreur lors de la modification du livreur');
        }
      } else {
        setError(error.response?.data?.message || 'Erreur lors de la modification du livreur');
      }
    }
  };

  const handleDeleteClick = (livreur) => {
    setLivreurToDelete(livreur);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/livreurs/${livreurToDelete.id_livreur}`);
      setShowDeleteConfirmation(false);
      setLivreurToDelete(null);
      fetchLivreurs();
      showNotification('Livreur supprimé avec succès');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression du livreur');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setLivreurToDelete(null);
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = selectedLivreur.status === 'actif' ? 'inactif' : 'actif';
      await axios.put(`http://localhost:8000/api/livreurs/${selectedLivreur.id_livreur}`, {
        status: newStatus
      });
      setShowStatusModal(false);
      fetchLivreurs();
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      cin: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      code_postal: '',
      pays: '',
      password: '',
      password_confirmation: '',
      status: 'inactif'
    });
    setError('');
  };

  const filteredLivreurs = livreurs.filter(livreur =>
    (livreur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livreur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    livreur.telephone.includes(searchTerm)) &&
    (!statusFilter || livreur.status === statusFilter)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {notification.message}
        </div>
      )}

      {/* Bouton de retour */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/user/admin')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Retour à l'administration
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Livreurs</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
        >
          <FaPlus className="mr-2" />
          Ajouter un livreur
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>
      </div>

      {/* Livreurs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLivreurs.map((livreur) => (
                <tr key={livreur.id_livreur}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {livreur.nom} {livreur.prenom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{livreur.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{livreur.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        livreur.status === 'actif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      onClick={() => {
                        setSelectedLivreur(livreur);
                        setShowStatusModal(true);
                      }}
                    >
                      {livreur.status === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedLivreur(livreur);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEye className="text-xl" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLivreur(livreur);
                        setFormData({
                          ...livreur,
                          password: '',
                          password_confirmation: ''
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <FaEdit className="text-xl" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(livreur)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal with Attestation Button */}
      {showDetailsModal && selectedLivreur && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du livreur</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Nom complet</h4>
                  <p className="text-gray-600">{selectedLivreur.nom} {selectedLivreur.prenom}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">CIN</h4>
                  <p className="text-gray-600">{selectedLivreur.cin}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Email</h4>
                  <p className="text-gray-600">{selectedLivreur.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Téléphone</h4>
                  <p className="text-gray-600">{selectedLivreur.telephone}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Adresse</h4>
                  <p className="text-gray-600">{selectedLivreur.adresse}</p>
                  <p className="text-gray-600">{selectedLivreur.ville}, {selectedLivreur.code_postal}</p>
                  <p className="text-gray-600">{selectedLivreur.pays}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Statut</h4>
                  <p className="text-gray-600">{selectedLivreur.status === 'actif' ? 'Actif' : 'Inactif'}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAttestation(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Générer Attestation
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un livreur</h3>
              <form onSubmit={handleAddLivreur} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CIN</label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code postal</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pays</label>
                  <input
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inactif">Inactif</option>
                    <option value="actif">Actif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 8 caractères</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedLivreur && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le livreur</h3>
              <form onSubmit={handleEditLivreur} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CIN</label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code postal</label>
                  <input
                    type="text"
                    name="code_postal"
                    value={formData.code_postal}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pays</label>
                  <input
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="inactif">Inactif</option>
                    <option value="actif">Actif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe (optionnel)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength="8"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 8 caractères</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    minLength="8"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Div */}
      {showDeleteConfirmation && livreurToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer le livreur {livreurToDelete.nom} {livreurToDelete.prenom} ?
                Cette action est irréversible.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedLivreur && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Changer le statut</h3>
              <p className="text-gray-600">
                Voulez-vous {selectedLivreur.status === 'actif' ? 'désactiver' : 'activer'} le livreur {selectedLivreur.nom} {selectedLivreur.prenom} ?
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStatusChange}
                  className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    selectedLivreur.status === 'actif'
                      ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                      : 'bg-green-500 hover:bg-green-600 focus:ring-green-300'
                  }`}
                >
                  {selectedLivreur.status === 'actif' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attestation Modal */}
      {showAttestation && selectedLivreur && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div ref={attestationRef} className="p-8 bg-white">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800">Restaurants Foody</h1>
                  <p className="text-gray-600">Attestation de Travail</p>
                </div>
                <div className="mb-8">
                  <p className="text-gray-700 mb-4">
                    Je soussigné(e), Directeur des Restaurants Foody, certifie que :
                  </p>
                  <div className="ml-8 mb-4">
                    <p className="font-semibold">Nom et Prénom : {selectedLivreur.nom} {selectedLivreur.prenom}</p>
                    <p>CIN : {selectedLivreur.cin}</p>
                    <p>Adresse : {selectedLivreur.adresse}</p>
                    <p>Ville : {selectedLivreur.ville}</p>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Est employé(e) en tant que livreur dans nos restaurants depuis le {new Date().toLocaleDateString()}.
                  </p>
                  <p className="text-gray-700">
                    Cette attestation est délivrée à sa demande pour servir et valoir ce que de droit.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700">Fait à {selectedLivreur.ville}, le {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-700 mt-8">Le Directeur</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={handleDownloadAttestation}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                >
                  <FaFileDownload className="mr-2" />
                  Télécharger
                </button>
                <button
                  onClick={handlePrintAttestation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                >
                  <FaPrint className="mr-2" />
                  Imprimer
                </button>
                <button
                  onClick={() => setShowAttestation(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivreursAdmin;
