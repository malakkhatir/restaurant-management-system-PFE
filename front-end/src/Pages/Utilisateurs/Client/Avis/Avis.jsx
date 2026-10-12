import React from "react";
import FeedbackForm from "../../../FeedbacksPage/Feedbacks";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Avis() {
    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-4">
            <button
                onClick={() => navigate('/user/client')}
                className="flex items-center gap-2 px-4 py-2 mb-6 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all"
            >
                <FaArrowLeft /> Retour
            </button>
            <FeedbackForm />
        </div>
    );
}

