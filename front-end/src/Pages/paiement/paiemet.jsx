import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [categories, setCategories] = useState([]);
    const [menus, setMenus] = useState([]);
    const [servants, setServants] = useState([]); // Assuming the logged-in user is a servant
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [selectedTable, setSelectedTable] = useState("");
    const [selectedServant, setSelectedServant] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedMenu, setSelectedMenu] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentType, setPaymentType] = useState("espece");
    const [paymentStatus, setPaymentStatus] = useState("paye");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cardInfo, setCardInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [nfcStatus, setNfcStatus] = useState('waiting');
    const [cardPaymentMethod, setCardPaymentMethod] = useState('');
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState(null);
    let user, token;

    useEffect(() => {
        token = localStorage.getItem("token");
        user = localStorage.getItem("user");
        if (!token || !user) {
            navigate("/login");
        }
        user = JSON.parse(user);
        setServants([{id: user.id, name: user.name}])
        //setSelectedServant(user.id);
    }, [navigate]);

    useEffect(() => {
        const validateArray = (data) => Array.isArray(data) ? data : [];
        const fetchData = async () => {
            try {
                const [tablesRes, categoriesRes, servantsRes] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/api/tables"),
                    axios.get("http://127.0.0.1:8000/api/categories"),
                    axios.get("http://127.0.0.1:8000/api/servants"),
                ]);

                setTables(validateArray(tablesRes.data?.data));
                setCategories(validateArray(categoriesRes.data?.data));
                // setServants(validateArray(servantsRes.data));
                // go through all servants, if you found someone that includes the name of user, setSelectedServant(id)
                // normalize once
                const userNameLower = user.name.toLowerCase();

                const firstMatch = validateArray(servantsRes.data).find(servant => {
                const servantNameLower = servant.name.toLowerCase();
                const match =
                    // servant’s full name contains the user’s name
                    servantNameLower.includes(userNameLower)
                    // or the user’s name somehow contains the servant’s name
                    || userNameLower.includes(servantNameLower);

                return match;
                });

                if (firstMatch) {
                setSelectedServant(firstMatch.id);
                }


                if (id) {
                    const saleResponse = await axios.get(`http://127.0.0.1:8000/api/sales/${id}`);
                    const sale = saleResponse.data;

                    setSelectedTable(
                        typeof sale?.table === "object"
                            ? sale.table.id?.toString()
                            : sale.table_id?.toString() || ""
                    );
                    setSelectedServant(sale?.servant?.id?.toString() || sale?.servant_id?.toString() || "");
                    setPaymentType(sale?.payment_type || "espece");
                    setPaymentStatus(sale?.payment_status || "paye");

                    if (sale?.menus && Array.isArray(sale.menus)) {
                        const menusWithQuantity = sale.menus.map((menu) => ({
                            id: menu.id,
                            title: menu.title,
                            price: menu.price,
                            quantity: menu.pivot?.quantity || 0,
                        }));
                        setSelectedMenus(menusWithQuantity);
                    } else {
                        setSelectedMenus([]);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error.message);
                setError("Une erreur est survenue lors du chargement des données.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchMenus = async () => {
            if (selectedCategory) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/menus?category_id=${selectedCategory}`);
                    if (response.data && response.data.menus) {
                        setMenus(response.data.menus.data);
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des menus:', error);
                    setError("Une erreur est survenue lors du chargement des menus.");
                }
            } else {
                setMenus([]);
                setSelectedMenu("");
            }
        };
        fetchMenus();
    }, [selectedCategory]);

    const addMenu = (menuId, quantity) => {
        const existingMenu = selectedMenus.find((menu) => menu.id === parseInt(menuId));
        if (existingMenu) {
            const updatedMenus = selectedMenus.map((menu) =>
                menu.id === parseInt(menuId)
                    ? { ...menu, quantity: menu.quantity + parseInt(quantity) }
                    : menu
            );
            setSelectedMenus(updatedMenus);
        } else {
            const menu = menus.find((menu) => menu.id === parseInt(menuId));
            if (menu) {
                setSelectedMenus([...selectedMenus, { ...menu, quantity: parseInt(quantity) }]);
            }
        }
    };

    const removeMenu = (menuId) => {
        const updatedMenus = selectedMenus.filter((menu) => menu.id !== parseInt(menuId));
        setSelectedMenus(updatedMenus);
    };

    const calculateTotal = () => {
        return selectedMenus.reduce((total, menu) => total + menu.price * menu.quantity, 0);
    };

    const updateTableStatus = async (tableId, status) => {
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/tables/${tableId}/status`,
                { status }
            );
            console.log("Réponse du backend :", response.data); // Débogage
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut de la table :", error.response?.data || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const totalPrice = calculateTotal();
            const payload = {
                table_id: selectedTable,
                servant_id: selectedServant,
                total_price: totalPrice,
                payment_type: paymentType,
                payment_status: paymentStatus,
                menus: selectedMenus.map(menu => ({
                    menu_id: menu.id,
                    quantity: menu.quantity
                }))
            };

            if (id) {
                await axios.put(`http://127.0.0.1:8000/api/sales/${id}`, payload);
                alert("Vente mise à jour avec succès !");
            } else {
                await axios.post("http://127.0.0.1:8000/api/sales", payload);
                navigate("/user/servant/commandes-locales", { state: { message: 'Vente ajoutée avec succès !' } });
            }

            if (selectedTable) {
                console.log("Mise à jour du statut de la table :", selectedTable, 0);
                await updateTableStatus(selectedTable, 0);
            }

            navigate("/user/servant/commandes-locales");
        } catch (error) {
            console.error("Erreur lors de la soumission :", error);
            alert("Une erreur est survenue lors de la soumission.");
        }
    };

    const generateTicket = () => {
        const ticket = {
            date: new Date().toLocaleString(),
            table: tables.find(t => t.id.toString() === selectedTable)?.name,
            servant: servants.find(s => s.id.toString() === selectedServant)?.name,
            items: selectedMenus.map(menu => ({
                name: menu.title,
                quantity: menu.quantity,
                price: menu.price,
                total: menu.quantity * menu.price
            })),
            total: calculateTotal(),
            paymentType: paymentType === 'carte' ? 'Carte Bancaire' : 'Espèces',
            paymentMethod: cardPaymentMethod === 'nfc' ? 'NFC' : cardPaymentMethod === 'manual' ? 'Saisie manuelle' : ''
        };
        setTicketData(ticket);
        setShowTicket(true);
    };

    const handleNfcPayment = () => {
        setNfcStatus('scanning');
        setTimeout(() => {
            setNfcStatus('success');
            setPaymentStatus('paye');
            generateTicket();
        }, 2000);
    };

    const handleManualCardPayment = () => {
        if (cardInfo.cardNumber && cardInfo.cardHolder && cardInfo.expiryDate && cardInfo.cvv) {
            setPaymentStatus('paye');
            generateTicket();
        }
    };

    const handlePrintTicket = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Ticket de Vente</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
                        
                        body {
                            font-family: 'Roboto Mono', monospace;
                            padding: 20px;
                            background: #f5f5f5;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                        }
                        
                        .ticket-container {
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            max-width: 400px;
                            width: 100%;
                        }
                        
                        .ticket {
                            border: 2px dashed #ccc;
                            padding: 20px;
                            position: relative;
                        }
                        
                        .ticket::before {
                            content: '';
                            position: absolute;
                            left: -10px;
                            top: 50%;
                            width: 20px;
                            height: 20px;
                            background: #f5f5f5;
                            border-radius: 50%;
                            transform: translateY(-50%);
                        }
                        
                        .ticket::after {
                            content: '';
                            position: absolute;
                            right: -10px;
                            top: 50%;
                            width: 20px;
                            height: 20px;
                            background: #f5f5f5;
                            border-radius: 50%;
                            transform: translateY(-50%);
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 2px dashed #ccc;
                        }
                        
                        .header h2 {
                            color: #333;
                            margin: 0 0 10px 0;
                            font-size: 24px;
                        }
                        
                        .header p {
                            color: #666;
                            margin: 5px 0;
                        }
                        
                        .info {
                            margin: 20px 0;
                            padding: 10px;
                            background: #f9f9f9;
                            border-radius: 5px;
                        }
                        
                        .info p {
                            margin: 5px 0;
                            color: #444;
                        }
                        
                        .items {
                            margin: 20px 0;
                        }
                        
                        .item {
                            margin: 10px 0;
                            padding: 5px 0;
                            border-bottom: 1px dotted #ccc;
                        }
                        
                        .item:last-child {
                            border-bottom: none;
                        }
                        
                        .total {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 2px dashed #ccc;
                        }
                        
                        .total p {
                            margin: 5px 0;
                            font-weight: 500;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 2px dashed #ccc;
                            color: #666;
                        }
                        
                        .buttons {
                            display: flex;
                            justify-content: center;
                            gap: 20px;
                            margin-top: 30px;
                        }
                        
                        .button {
                            padding: 10px 20px;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: all 0.3s ease;
                        }
                        
                        .print-button {
                            background: #4CAF50;
                            color: white;
                        }
                        
                        .print-button:hover {
                            background: #45a049;
                        }
                        
                        .return-button {
                            background: #f44336;
                            color: white;
                        }
                        
                        .return-button:hover {
                            background: #da190b;
                        }
                        
                        @media print {
                            body {
                                background: white;
                            }
                            
                            .ticket-container {
                                box-shadow: none;
                                padding: 0;
                            }
                            
                            .buttons {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket-container">
                        <div class="ticket">
                            <div class="header">
                                <h2>Restaurant</h2>
                                <p>Ticket de Vente</p>
                                <p>${ticketData.date}</p>
                            </div>
                            <div class="info">
                                <p><strong>Table:</strong> ${ticketData.table}</p>
                                <p><strong>Serveur:</strong> ${ticketData.servant}</p>
                            </div>
                            <div class="items">
                                ${ticketData.items.map(item => `
                                    <div class="item">
                                        <div style="display: flex; justify-content: space-between;">
                                            <span>${item.name}</span>
                                            <span>x${item.quantity}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9em;">
                                            <span>${item.price} DH x ${item.quantity}</span>
                                            <span>${item.total} DH</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="total">
                                <p style="display: flex; justify-content: space-between; font-weight: bold;">
                                    <span>Total</span>
                                    <span>${ticketData.total} DH</span>
                                </p>
                                <p style="color: #666;">
                                    Paiement: ${ticketData.paymentType}${ticketData.paymentMethod ? ` (${ticketData.paymentMethod})` : ''}
                                </p>
                            </div>
                            <div class="footer">
                                <p>Merci de votre visite!</p>
                            </div>
                        </div>
                        <div class="buttons">
                            <button class="button print-button" onclick="window.print()">Imprimer</button>
                            <button class="button return-button" onclick="window.close()">Retour</button>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (loading) return <p>Chargement...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate('/user/servant/commandes-locales')}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Retour aux ventes
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {id ? "Modifier la Vente" : "Nouvelle Vente"}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Table et Serveur */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionnez une table</option>
                                    {tables
                                        .filter((table) => table.status === 1 || table.id.toString() === selectedTable)
                                        .map((table) => (
                                            <option key={table.id} value={table.id}>
                                                {table.name} {table.status !== 1 ? "(désactivée)" : ""}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Serveur</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                    value={selectedServant}
                                    onChange={(e) => setSelectedServant(e.target.value)}
                                    required
                                >
                                    {/* <option value="">Sélectionnez un serveur</option> */}
                                    {servants.map((servant) => (
                                        <option key={servant.id} value={servant.id}>
                                            {servant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

{/* Catégorie et Menu */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {/* Catégorie */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Catégorie
    </label>
    <select
      className="w-full px-4 py-2 rounded-lg border border-gray-300 
                 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
                 transition-all duration-200 ease-in-out bg-white shadow-sm 
                 hover:border-yellow-400"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      required
    >
      <option value="">Sélectionnez une catégorie</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  </div>

  {/* Menu + quantité + ajout */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Menu
    </label>
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <select
        className="w-full sm:flex-1 px-4 py-2 rounded-lg border border-gray-300 
                   focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 
                   transition-all duration-200 ease-in-out bg-white shadow-sm 
                   hover:border-yellow-400"
        value={selectedMenu}
        onChange={(e) => setSelectedMenu(e.target.value)}
        disabled={!selectedCategory}
      >
        <option value="">Sélectionnez un menu</option>
        {menus.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title} – {m.price} DH
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        className="w-full sm:w-20 px-3 py-2 rounded-lg border border-gray-300 
                   focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
      />

      <button
        type="button"
        onClick={() => {
          if (selectedMenu) {
            addMenu(selectedMenu, quantity);
            setSelectedMenu("");
            setQuantity(1);
          }
        }}
        className="w-full sm:w-auto px-4 py-2 bg-yellow-500 text-white rounded-lg 
                   hover:bg-yellow-600 transition-colors"
      >
        Ajouter
      </button>
    </div>
  </div>
</div>


                        {/* Menus sélectionnés */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Menus Sélectionnés</label>
                            <div className="bg-gray-50 rounded-lg p-4">
                                {selectedMenus.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Aucun menu sélectionné</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedMenus.map((menu) => (
                                            <li key={menu.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                <div>
                                                    <span className="font-medium text-gray-800">{menu.title}</span>
                                                    <span className="text-gray-500 ml-2">
                                                        {menu.quantity} x {menu.price} DH = {menu.quantity * menu.price} DH
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    onClick={() => removeMenu(menu.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Total et Paiement */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 shadow-sm text-gray-700 font-medium"
                                    value={`${calculateTotal()} DH`}
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Paiement</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                    value={paymentType}
                                    onChange={(e) => {
                                        setPaymentType(e.target.value);
                                        if (e.target.value === 'carte') {
                                            setPaymentStatus('en_attente');
                                        }
                                    }}
                                    required
                                >
                                    <option value="espece">Espèces</option>
                                    <option value="carte">Carte Bancaire</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut de Paiement</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    required
                                >
                                    <option value="paye">Payé</option>
                                    <option value="en_attente">En Attente</option>
                                </select>
                            </div>
                        </div>

                        {/* Formulaire de carte bancaire */}
                        {paymentType === "carte" && (
                            <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Paiement par Carte</h3>
                                
                                {/* Choix de la méthode de paiement par carte */}
                                <div className="mb-6">
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCardPaymentMethod('nfc')}
                                            className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                                                cardPaymentMethod === 'nfc'
                                                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                                                    : 'border-gray-200 hover:border-yellow-500 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>Paiement NFC</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCardPaymentMethod('manual')}
                                            className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
                                                cardPaymentMethod === 'manual'
                                                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                                                    : 'border-gray-200 hover:border-yellow-500 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                <span>Saisie manuelle</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Interface NFC */}
                                {cardPaymentMethod === 'nfc' && (
                                    <div className="flex flex-col items-center justify-center p-6">
                                        {nfcStatus === 'waiting' && (
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600 mb-4">Prêt pour le paiement NFC</p>
                                                <button
                                                    type="button"
                                                    onClick={handleNfcPayment}
                                                    className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm hover:shadow-md focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                                >
                                                    Démarrer le paiement NFC
                                                </button>
                                            </div>
                                        )}

                                        {nfcStatus === 'scanning' && (
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-600">Veuillez approcher votre carte...</p>
                                            </div>
                                        )}

                                        {nfcStatus === 'success' && (
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <p className="text-green-600 font-medium">Paiement réussi !</p>
                                            </div>
                                        )}

                                        {nfcStatus === 'error' && (
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <p className="text-red-600 font-medium">Erreur de paiement</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setNfcStatus('waiting')}
                                                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                                >
                                                    Réessayer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Saisie manuelle de la carte */}
                                {cardPaymentMethod === 'manual' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Numéro de carte
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={cardInfo.cardNumber}
                                                    onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                                                    maxLength="19"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Titulaire de la carte
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                                    placeholder="JEAN DUPONT"
                                                    value={cardInfo.cardHolder}
                                                    onChange={(e) => setCardInfo({...cardInfo, cardHolder: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date d'expiration
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                                    placeholder="MM/AA"
                                                    value={cardInfo.expiryDate}
                                                    onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                                                    maxLength="5"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Code de sécurité (CVV)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 ease-in-out bg-white shadow-sm hover:border-yellow-400"
                                                    placeholder="123"
                                                    value={cardInfo.cvv}
                                                    onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                                                    maxLength="3"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="button"
                                                onClick={handleManualCardPayment}
                                                className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-sm hover:shadow-md focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Confirmer le paiement
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Ticket de vente */}
                        {showTicket && ticketData && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Ticket de Vente</h3>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                    <div className="text-center mb-4">
                                        <h4 className="font-bold">Restaurant</h4>
                                        <p className="text-sm text-gray-600">{ticketData.date}</p>
                                    </div>
                                    <div className="mb-4">
                                        <p><span className="font-medium">Table:</span> {ticketData.table}</p>
                                        <p><span className="font-medium">Serveur:</span> {ticketData.servant}</p>
                                    </div>
                                    <div className="mb-4">
                                        {ticketData.items.map((item, index) => (
                                            <div key={index} className="flex justify-between py-1">
                                                <span>{item.name} x{item.quantity}</span>
                                                <span>{item.total} DH</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-2 mb-4">
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{ticketData.total} DH</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Paiement: {ticketData.paymentType}
                                            {ticketData.paymentMethod && ` (${ticketData.paymentMethod})`}
                                        </p>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <button
                                            onClick={handlePrintTicket}
                                            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                        >
                                            Imprimer le ticket
                                        </button>
                                        <button
                                            onClick={() => navigate('/user/servant/commandes-locales')}
                                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Retour aux ventes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bouton de soumission */}
                        {!showTicket && (
                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                >
                                    {id ? "Mettre à jour" : "Valider la Transaction"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Payment;