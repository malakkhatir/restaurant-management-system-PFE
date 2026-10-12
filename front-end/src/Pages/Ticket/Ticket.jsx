import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ticket = () => {
    const { id } = useParams();
    const [vente, setVente] = useState(null);
    const navigate = useNavigate(); // Utilisation de useNavigate pour la redirection

      useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (!token || !user) {
          navigate("/login");
        }
      }, []);
    useEffect(() => {
        const fetchVente = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/sales/${id}`);
                setVente(res.data);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
            }
        };

        fetchVente();
    }, [id]);

    useEffect(() => {
        if (vente) {
            generatePDFTicket();
        }
    }, [vente]);

    const generatePDFTicket = () => {
        const doc = new jsPDF();

        // En-tête
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(" Ticket de Vente", 105, 20, { align: "center" });

        // Infos vente
        doc.setFontSize(12);
        const info = [
            ["ID Vente :", vente.id],
            ["Table :", vente.table?.name || "N/A"],
            ["Serveur :", vente.servant?.name || "N/A"],
            ["Total :", `${vente.total_price} DH`],
            ["Type de Paiement :", vente.payment_type],
            ["Statut :", vente.payment_status],
        ];

        let y = 30;
        info.forEach(([label, value]) => {
            doc.text(`${label}`, 20, y);
            doc.text(`${value}`, 70, y);
            y += 8;
        });

        // Ligne séparatrice
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, 190, y);
        y += 10;

        // Table des menus
        autoTable(doc, {
            startY: y,
            head: [["Menu", "Quantité"]],
            body: (vente.menus || []).map((menu) => [
                menu?.title ?? "Inconnu",
                menu?.pivot?.quantity?.toString() ?? "0"
            ]),
            theme: "striped",
            styles: { halign: "center" },
            headStyles: { fillColor: [22, 160, 133] },
        });

        // Signature
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Généré automatiquement par le système de gestion des ventes", 105, doc.internal.pageSize.height - 10, { align: "center" });

        doc.save(`ticket-vente-${vente.id}.pdf`);
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">🎟️ Ticket de Vente</h2>

            {vente ? (
                <div>
                    <p><strong>ID Vente :</strong> {vente.id}</p>
                    <p><strong>Table :</strong> {vente.table?.name || "N/A"}</p>
                    <p><strong>Serveur :</strong> {vente.servant?.name || "N/A"}</p>
                    <p><strong>Total :</strong> {vente.total_price} DH</p>
                    <p><strong>Type de Paiement :</strong> {vente.payment_type}</p>
                    <p><strong>Statut :</strong> {vente.payment_status}</p>
                    <p><strong>🧾 Menus :</strong></p>
                    <ul>
                        {vente.menus.map((menu) => (
                            <li key={menu.id}>
                                {menu.title} x {menu.pivot?.quantity ?? "0"}
                            </li>
                        ))}
                    </ul>

                    <p className="mt-3 text-success">✅ Le ticket PDF a été généré  !</p>
                </div>
            ) : (
                <p>Chargement des données...</p>
            )}
        </div>
    );
};

export default Ticket;
