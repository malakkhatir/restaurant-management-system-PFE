import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiCheck, FiX, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ title: "", slug: "" });
  const [editCategory, setEditCategory] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      navigate("/login");
    }
  }, []);

  const fetchCategories = async (page = 1) => {
    setLoadingCategories(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/categories?page=${page}`);
      if (response.data?.data) {
        setCategories(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
      } else {
        setCategories([]);
      }
      setError(null);
    } catch (error) {
      setError("Erreur lors du chargement des catégories");
      console.error(error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.title.trim() || !newCategory.slug.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/categories", newCategory);
      setCategories([...categories, response.data]);
      setNewCategory({ title: "", slug: "" });
      setSuccess("Catégorie ajoutée avec succès");
      setError(null);
    } catch (error) {
      setError("Erreur lors de l'ajout de la catégorie");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`);
      setCategories(categories.filter((cat) => cat.id !== id));
      setSuccess("La catégorie a été supprimée avec succès");
      setError(null);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      setError("Une erreur est survenue lors de la suppression de la catégorie");
      console.error(error);
    }
  };

  const handleEdit = (category) => {
    setEditCategory(category);
  };

  const handleSaveEdit = async () => {
    if (!editCategory.title.trim() || !editCategory.slug.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
  
      try {
          const response = await axios.put(`http://127.0.0.1:8000/api/categories/${editCategory.id}`, editCategory);
          setCategories(categories.map((category) =>
              category.id === editCategory.id ? response.data : category
      ));
      setEditCategory(null);
          setSuccess("Catégorie modifiée avec succès");
      } catch (error) {
          setError("Erreur lors de la modification de la catégorie");
          console.error(error);
      }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const filteredCategories = categories.filter(category => {
    if (selectedCategory === "all") return true;
    return category.title === selectedCategory;
  });

  const handleAddMenu = (categoryId, categoryTitle) => {
    localStorage.setItem('selectedCategory', JSON.stringify({ id: categoryId, title: categoryTitle }));
    navigate('/user/admin/menus');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/user/admin/menus')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
              >
                <FiPlus className="mr-2" />
                Gérer les Menus
              </button>
              <button
                onClick={() => navigate('/user/admin')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiArrowLeft className="mr-2" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto pl-3">
                  <FiX className="h-5 w-5 text-red-500 hover:text-red-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="ml-auto pl-3">
                  <FiX className="h-5 w-5 text-green-500 hover:text-green-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">Filtrer par catégorie</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === "all"
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Toutes les catégories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.title)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.title
                        ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedCategory === "all" 
                  ? `${categories.length} catégorie(s)`
                  : `${categories.filter(cat => cat.title === selectedCategory).length} catégorie(s) trouvée(s)`
                }
              </span>
              <div className="h-4 w-px bg-gray-300"></div>
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiPlus className="mr-2 text-indigo-600" />
              Ajouter une nouvelle catégorie
            </h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Titre de la catégorie
              </label>
              <div className="relative">
          <input
            type="text"
                  placeholder="Entrez le titre"
            value={newCategory.title}
            onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 text-sm">📝</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <div className="relative">
          <input
            type="text"
                  placeholder="exemple-de-slug"
            value={newCategory.slug}
            onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 text-sm">🔗</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus className="mr-2" />
              Ajouter la catégorie
          </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loadingCategories ? (
              <div className="p-6 text-center text-gray-500">
                Chargement des catégories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {selectedCategory === "all" ? "Aucune catégorie trouvée." : `Aucune catégorie trouvée pour "${selectedCategory}".`}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
            <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    {editCategory && editCategory.id === category.id ? (
                      <input
                        type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editCategory.title}
                        onChange={(e) => setEditCategory({ ...editCategory, title: e.target.value })}
                      />
                    ) : (
                          <span className="text-sm text-gray-900">{category.title}</span>
                    )}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    {editCategory && editCategory.id === category.id ? (
                      <input
                        type="text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={editCategory.slug}
                        onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                      />
                    ) : (
                          <span className="text-sm text-gray-500">{category.slug}</span>
                    )}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
    {editCategory && editCategory.id === category.id ? (
      <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm group relative"
                                title="Enregistrer"
                              >
                                <FiCheck className="h-5 w-5" />
        </button>
        <button
          onClick={() => setEditCategory(null)}
                                className="p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm group relative"
                                title="Annuler"
        >
                                <FiX className="h-5 w-5" />
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => handleEdit(category)}
                                className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm group relative"
                                title="Modifier"
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(category)}
                                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm group relative"
                                title="Supprimer"
                              >
                                <FiTrash2 className="h-5 w-5" />
        </button>
        <button
                                onClick={() => handleAddMenu(category.id, category.title)}
                                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm group relative"
                                title="Ajouter un menu"
        >
                                <FiPlus className="h-5 w-5" />
        </button>
      </>
    )}
                        </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => fetchCategories(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => fetchCategories(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
      <button
        onClick={() => fetchCategories(currentPage - 1)}
        disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
                <span className="sr-only">Précédent</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
      </button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
        key={pageNumber}
          onClick={() => fetchCategories(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNumber
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
        >
          {pageNumber}
        </button>
    ))}
      <button
        onClick={() => fetchCategories(currentPage + 1)}
        disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
                <span className="sr-only">Suivant</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
      </button>
</nav>
          </div>
        </div>

        {showDeleteModal && categoryToDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-scale-in">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100 animate-pulse">
                    <FiAlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmer la suppression
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Êtes-vous sûr de vouloir supprimer la catégorie <span className="font-semibold text-gray-900">{categoryToDelete.title}</span> ?
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setCategoryToDelete(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      <FiX className="h-5 w-5 mr-2" />
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(categoryToDelete.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 shadow-sm"
                    >
                      <FiTrash2 className="h-5 w-5 mr-2" />
                      Confirmer la suppression
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
      {`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}
      </style>
    </div>
  );
};

export default Categories;
