import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiFilter, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const Menu2 = () => {
    const navigate = useNavigate();
      useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (!token || !user) {
          navigate("/login");
        }
      }, []);

    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filteredMenus, setFilteredMenus] = useState([]);
    const [newMenu, setNewMenu] = useState({
        title: "",
        slug: "",
        description: "",
        price: "",
        image: null,
        category_id: ""
    });
    const [editMenu, setEditMenu] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Vérifier s'il y a une catégorie sélectionnée dans localStorage
        const selectedCategory = localStorage.getItem('selectedCategory');
        if (selectedCategory) {
            const { id, title } = JSON.parse(selectedCategory);
            setNewMenu(prev => ({
                ...prev,
                category_id: id
            }));
            // Supprimer la catégorie sélectionnée du localStorage
            localStorage.removeItem('selectedCategory');
        }
    }, []);

    // Charger les menus et les catégories
    const fetchMenusAndCategories = async (page = 1) => {
        setIsLoading(true);
        try {
            // Construire l'URL avec les paramètres de filtrage
            let url = `http://127.0.0.1:8000/api/menus?page=${page}&per_page=${itemsPerPage}`;
            if (selectedCategory) {
                url += `&category_id=${selectedCategory}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const response = await axios.get(url);
            console.log('API Response:', response.data);

            if (response.data) {
                const menusData = response.data.menus?.data || [];
                const categoriesData = response.data.categories || [];

                setMenus(menusData);
                setCategories(categoriesData);
                setCurrentPage(response.data.menus?.current_page || 1);
                setTotalPages(response.data.menus?.last_page || 1);
                setFilteredMenus(menusData);
            } else {
                setError("La structure de la réponse de l'API est incorrecte.");
            }
        } catch (err) {
            setError("Erreur lors du chargement des menus.");
            console.error('Erreur API:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenusAndCategories();
    }, []);

    // Modifier l'effet de filtrage pour déclencher un rechargement
    useEffect(() => {
        fetchMenusAndCategories(1); // Recharger à la première page lors du changement de filtre
    }, [selectedCategory, searchQuery]);

    // Ajouter une fonction pour gérer le changement de page
    const handlePageChange = async (pageNumber) => {
        setIsLoading(true);
        try {
            let url = `http://127.0.0.1:8000/api/menus?page=${pageNumber}&per_page=${itemsPerPage}`;
            if (selectedCategory) {
                url += `&category_id=${selectedCategory}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }

            const response = await axios.get(url);
            console.log('Page Change Response:', response.data);

            if (response.data) {
                const menusData = response.data.menus?.data || [];
                setMenus(menusData);
                setCurrentPage(response.data.menus?.current_page || 1);
                setTotalPages(response.data.menus?.last_page || 1);
                setFilteredMenus(menusData);
            }
        } catch (err) {
            setError("Erreur lors du chargement des menus.");
            console.error('Erreur changement de page:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMenu = async () => {
        if (!newMenu.title || !newMenu.slug || !newMenu.description || !newMenu.price || !newMenu.category_id) {
            setError("Veuillez remplir tous les champs requis.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(newMenu).forEach(([key, value]) => {
                if (value !== null) formData.append(key, value);
            });

            await axios.post("http://127.0.0.1:8000/api/menus", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setNewMenu({ title: "", slug: "", description: "", price: "", category_id: "", image: null });
            setSuccess("Menu ajouté avec succès");
            setError(null);
            await fetchMenusAndCategories(currentPage);
        } catch (error) {
            setError("Erreur lors de l'ajout du menu.");
            console.error('Erreur ajout menu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
            try {
                await axios.delete(`http://127.0.0.1:8000/api/menus/${id}`);
                setSuccess("Menu supprimé avec succès");
            setShowDeleteModal(false);
            setMenuToDelete(null);
            await fetchMenusAndCategories(currentPage);
            } catch (err) {
                setError("Erreur lors de la suppression.");
            console.error('Erreur suppression:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editMenu || !editMenu.title || !editMenu.slug || !editMenu.description || !editMenu.price || !editMenu.category_id) {
            setError("Veuillez remplir tous les champs requis.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', editMenu.title);
            formData.append('slug', editMenu.slug);
            formData.append('description', editMenu.description);
            formData.append('price', editMenu.price);
            formData.append('category_id', editMenu.category_id);
            if (editMenu.image instanceof File) {
                formData.append('image', editMenu.image);
            }

            await axios.post(`http://127.0.0.1:8000/api/menus/${editMenu.id}?_method=PUT`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setSuccess("Menu modifié avec succès");
            setEditMenu(null);
            await fetchMenusAndCategories(currentPage);
        } catch (err) {
            setError("Erreur lors de la modification.");
            console.error('Erreur modification:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (menu) => {
        setEditMenu({
            ...menu,
            category_id: menu.category_id?.toString() || "",
            price: menu.price?.toString() || ""
        });
    };
    
    const openDeleteModal = (menu) => {
        setMenuToDelete(menu);
        setShowDeleteModal(true);
    };

    // Fonction pour générer les numéros de page à afficher
    const getPageNumbers = () => {
        const pages = [];
        const maxPages = 4;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

   return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Menus</h1>
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Messages de notification */}
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
                                <button 
                                    onClick={() => setError(null)}
                                    className="ml-auto pl-3"
                                >
                                    <svg className="h-5 w-5 text-red-500 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
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
                                <button 
                                    onClick={() => setSuccess(null)}
                                    className="ml-auto pl-3"
                                >
                                    <svg className="h-5 w-5 text-green-500 hover:text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtres et recherche */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Barre de recherche */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher un menu..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>

                        {/* Filtre par catégorie */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiFilter className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out appearance-none"
                            >
                                <option value="">Toutes les catégories</option>
                                {Array.isArray(categories) && categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.title}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Résultats de la recherche */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">
                                {filteredMenus.length} menu{filteredMenus.length !== 1 ? 's' : ''} trouvé{filteredMenus.length !== 1 ? 's' : ''}
                            </span>
                            {(selectedCategory !== "" || searchQuery !== "") && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory("");
                                        setSearchQuery("");
                                    }}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                        {searchQuery !== "" && (
                            <div className="text-sm text-gray-500">
                                Recherche : "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulaire d'ajout */}
                <div className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <FiPlus className="mr-2 text-indigo-600" />
                            Ajouter un nouveau menu
                        </h2>
                        <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Titre */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Titre du menu
                            </label>
                            <div className="relative">
                        <input
                            type="text"
                                    placeholder="Entrez le titre"
                            value={newMenu.title}
                            onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-400 text-sm">📝</span>
                                </div>
                            </div>
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Slug
                            </label>
                            <div className="relative">
                        <input
                            type="text"
                                    placeholder="exemple-de-slug"
                            value={newMenu.slug}
                            onChange={(e) => setNewMenu({ ...newMenu, slug: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-400 text-sm">🔗</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="relative">
                        <input
                            type="text"
                                    placeholder="Description du menu"
                            value={newMenu.description}
                            onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-400 text-sm">📄</span>
                                </div>
                            </div>
                        </div>

                        {/* Prix */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Prix
                            </label>
                            <div className="relative">
                        <input
                            type="number"
                                    placeholder="0.00"
                            value={newMenu.price}
                            onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-400 text-sm">💰</span>
                                </div>
                            </div>
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Catégorie
                            </label>
                            <div className="relative">
                        <select
                            value={newMenu.category_id}
                            onChange={(e) => setNewMenu({ ...newMenu, category_id: parseInt(e.target.value) })}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out pl-4 pr-10 py-2.5 appearance-none"
                        >
                            <option value="">Sélectionnez une catégorie</option>
                            {Array.isArray(categories) && categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.title}</option>
                            ))}
                        </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-400 text-sm">📂</span>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Image
                            </label>
                            <div className="relative">
                        <input
                            type="file"
                            onChange={(e) => setNewMenu({ ...newMenu, image: e.target.files[0] })}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition duration-150 ease-in-out"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bouton d'ajout */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleAddMenu}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                        >
                            <FiPlus className="mr-2" />
                            Ajouter le menu
                        </button>
                    </div>
                </div>

                    {/* Tableau des menus */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                                <p className="text-sm text-gray-500">Chargement des menus...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : Array.isArray(filteredMenus) && filteredMenus.length > 0 ? (
                                    filteredMenus.map((menu, index) => (
                                        <tr key={menu.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    {editMenu && editMenu.id === menu.id ? (
                                        <>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={editMenu.title || ""}
                                                    onChange={(e) => setEditMenu({ ...editMenu, title: e.target.value })}
                                                />
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={editMenu.slug || ""}
                                                    onChange={(e) => setEditMenu({ ...editMenu, slug: e.target.value })}
                                                />
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={editMenu.description || ""}
                                                    onChange={(e) => setEditMenu({ ...editMenu, description: e.target.value })}
                                                />
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={editMenu.price || ""}
                                                    onChange={(e) => setEditMenu({ ...editMenu, price: e.target.value })}
                                                />
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={editMenu.category_id || ""}
                                                    onChange={(e) => setEditMenu({ ...editMenu, category_id: e.target.value })}
                                                >
                                                    <option value="">Sélectionnez une catégorie</option>
                                                    {Array.isArray(categories) && categories.map((category) => (
                                                        <option key={category.id} value={category.id}>{category.title}</option>
                                                    ))}
                                                </select>
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {editMenu.image && (
                                                            <img
                                                                src={`http://127.0.0.1:8000/storage/${editMenu.image}`}
                                                                alt={editMenu.title}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        )}
                                                <input
                                                    type="file"
                                                            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    onChange={(e) => setEditMenu({ ...editMenu, image: e.target.files[0] })}
                                                />
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={handleSaveEdit}
                                                                className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm group relative"
                                                                title="Enregistrer"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                    Enregistrer
                                                                </span>
                                                </button>
                                                            <button
                                                                onClick={() => setEditMenu(null)}
                                                                className="p-2 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm group relative"
                                                                title="Annuler"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                    Annuler
                                                                </span>
                                                </button>
                                                        </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{menu.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.slug}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.price}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {categories.find((cat) => cat.id === menu.category_id)?.title}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {menu.image && (
                                                            <img
                                                                src={`http://127.0.0.1:8000/storage/${menu.image}`}
                                                                alt={menu.title}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        )}
                                            </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={() => handleEdit(menu)}
                                                                className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm group relative"
                                                                title="Modifier"
                                                            >
                                                                <FiEdit2 className="h-5 w-5" />
                                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                    Modifier
                                                                </span>
                                                </button>
                                                            <button
                                                                onClick={() => openDeleteModal(menu)}
                                                                className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm group relative"
                                                                title="Supprimer"
                                                            >
                                                                <FiTrash2 className="h-5 w-5" />
                                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                    Supprimer
                                                                </span>
                                                </button>
                                                        </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucun menu trouvé
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                    </div>
                </div>

                    {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Précédent</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {getPageNumbers().map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    disabled={isLoading}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === pageNumber
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || isLoading}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Suivant</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && menuToDelete && (
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
                                    Êtes-vous sûr de vouloir supprimer le menu <span className="font-semibold text-gray-900">{menuToDelete.title}</span> ?
                                </p>
                                <div className="flex items-center justify-center space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setMenuToDelete(null);
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 shadow-sm"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Annuler
                                    </button>
                                <button
                                        onClick={() => handleDelete(menuToDelete.id)}
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
        );
    };
    
    export default Menu2;

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