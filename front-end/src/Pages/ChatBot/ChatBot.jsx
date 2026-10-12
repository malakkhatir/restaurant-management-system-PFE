import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Bonjour ! Je suis FoodyChat, votre assistant virtuel du restaurant Foody. Je suis là pour vous aider à découvrir notre menu, faire des réservations ou répondre à vos questions. Comment puis-je vous aider aujourd'hui ?",
      sender: 'bot',
      options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentStep, setCurrentStep] = useState('initial');
  const [isTyping, setIsTyping] = useState(false);
  const [menuCategories, setMenuCategories] = useState([]);
  const [clientName, setClientName] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Restaurant contact information
  const restaurantInfo = {
    name: "Foody Restaurant",
    address: "123 Avenue de la Gastronomie, 75001 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@foody-restaurant.com",
    hours: "Lundi - Dimanche: 11h30 - 23h00"
  };

  // Greetings and responses
  const greetings = {
    hello: ['salut', 'bonjour', 'coucou', 'hello', 'hi', 'hey', 'slt', 'cc', 'bjr'],
    howAreYou: ['ça va', 'comment ça va', 'comment vas-tu', 'comment allez-vous', 'ça va bien', 'cv', 'comment tu vas'],
    thanks: ['merci', 'merci beaucoup', 'thanks', 'thank you', 'merci bien'],
    bye: ['au revoir', 'bye', 'à bientôt', 'goodbye', 'ciao', 'bye bye'],
    name: ['je m\'appelle', 'mon nom est', 'mon prénom est', 'je suis'],
    botName: ['ton nom', 'comment tu t\'appelles', 'qui es-tu', 'c\'est quoi ton nom', 'tu t\'appelles comment']
  };

  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleGreeting = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for bot name questions
    if (greetings.botName.some(phrase => lowerMessage.includes(phrase))) {
      return {
        text: "Je suis FoodyChat, l'assistant virtuel du restaurant Foody. Je suis là pour vous aider à découvrir notre menu, faire des réservations ou répondre à vos questions. Comment puis-je vous aider ?",
        options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
      };
    }

    // Check for name introduction
    if (greetings.name.some(phrase => lowerMessage.includes(phrase))) {
      const name = lowerMessage.split(phrase => greetings.name.find(p => lowerMessage.includes(p)))[1]?.trim();
      if (name) {
        setClientName(name);
        return {
          text: `Enchanté ${name} ! Je suis FoodyChat, l'assistant virtuel du restaurant Foody. Je suis ravi de faire votre connaissance. Comment puis-je vous aider aujourd\'hui ?`,
          options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
        };
      }
    }

    // Check for simple greetings
    if (greetings.hello.some(greeting => lowerMessage.includes(greeting))) {
      const responses = clientName 
        ? [
            `Bonjour ${clientName} ! Je suis FoodyChat. Comment puis-je vous aider aujourd\'hui ?`,
            `Salut ${clientName} ! Je suis FoodyChat, que puis-je faire pour vous ?`,
            `Bonjour ${clientName} ! Je suis FoodyChat, je suis ravi de vous aider. Que souhaitez-vous ?`
          ]
        : [
            "Bonjour ! Je suis FoodyChat. Comment puis-je vous aider aujourd'hui ?",
            "Salut ! Je suis FoodyChat, que puis-je faire pour vous ?",
            "Bonjour ! Je suis FoodyChat, je suis ravi de vous aider. Que souhaitez-vous ?"
          ];
      
      return {
        text: getRandomResponse(responses),
        options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
      };
    }

    // Check for how are you
    if (greetings.howAreYou.some(greeting => lowerMessage.includes(greeting))) {
      const responses = clientName
        ? [
            `Je vais très bien ${clientName}, merci ! Et vous, comment puis-je vous aider ?`,
            `Très bien ${clientName}, merci ! Que souhaitez-vous faire aujourd\'hui ?`,
            `Je vais parfaitement ${clientName} ! Comment puis-je vous être utile ?`
          ]
        : [
            "Je vais très bien, merci ! Et vous, comment puis-je vous aider ?",
            "Très bien, merci ! Que souhaitez-vous faire aujourd'hui ?",
            "Je vais parfaitement ! Comment puis-je vous être utile ?"
          ];

      return {
        text: getRandomResponse(responses),
        options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
      };
    }

    // Check for thanks
    if (greetings.thanks.some(greeting => lowerMessage.includes(greeting))) {
      const responses = clientName
        ? [
            `Je vous en prie ${clientName} ! Y a-t-il autre chose que je puisse faire pour vous ?`,
            `Avec plaisir ${clientName} ! Puis-je vous aider avec autre chose ?`,
            `De rien ${clientName} ! N'hésitez pas si vous avez d'autres questions.`
          ]
        : [
            "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous ?",
            "Avec plaisir ! Puis-je vous aider avec autre chose ?",
            "De rien ! N'hésitez pas si vous avez d'autres questions."
          ];

      return {
        text: getRandomResponse(responses),
        options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
      };
    }

    // Check for goodbye
    if (greetings.bye.some(greeting => lowerMessage.includes(greeting))) {
      const responses = clientName
        ? [
            `Au revoir ${clientName} ! N'hésitez pas à revenir si vous avez des questions.`,
            `À bientôt ${clientName} ! Bonne journée !`,
            `Au revoir ${clientName} ! Merci d'avoir discuté avec moi.`
          ]
        : [
            "Au revoir ! N'hésitez pas à revenir si vous avez des questions.",
            "À bientôt ! Bonne journée !",
            "Au revoir ! Merci d'avoir discuté avec moi."
          ];

      return {
        text: getRandomResponse(responses),
        options: ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact']
      };
    }

    // If no greeting is recognized, return null to handle as a regular message
    return null;
  };

  // Fetch menu categories
  const fetchMenuCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/menu/category');
      setMenuCategories(response.data);
    } catch (error) {
      console.error('Error fetching menu categories:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMenuCategories();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setInputMessage('');
    }
  };

  const handleOptionClick = (option) => {
    setInputMessage(option);
    handleSendMessage({ preventDefault: () => {} }, option);
  };

  const simulateTyping = (callback) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1000);
  };

  const formatMenuMessage = (category) => {
    let message = `${category.title} :\n\n`;
    category.menus.forEach(menu => {
      message += `🍽️ ${menu.title}\n`;
      message += `💰 Prix: ${menu.price}€\n`;
      if (menu.description) {
        message += `📝 ${menu.description}\n`;
      }
      message += '\n';
    });
    return message;
  };

  const formatContactMessage = () => {
    return `📍 Adresse : ${restaurantInfo.address}\n\n` +
           `📞 Téléphone : ${restaurantInfo.phone}\n\n` +
           `✉️ Email : ${restaurantInfo.email}\n\n` +
           `⏰ Horaires : ${restaurantInfo.hours}`;
  };

  const handleSendMessage = (e, customMessage = null) => {
    e.preventDefault();
    const message = customMessage || inputMessage;
    if (message.trim() === '') return;

    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    setInputMessage('');

    simulateTyping(() => {
      let botResponse;
      let options = [];

      // Check for greetings first
      const greetingResponse = handleGreeting(message);
      if (greetingResponse) {
        botResponse = greetingResponse.text;
        options = greetingResponse.options;
      } else {
        switch (message.toLowerCase()) {
          case 'voir le menu':
            botResponse = "Voici nos catégories de plats :";
            options = menuCategories.map(cat => cat.title);
            options.push('Retour au menu principal');
            setCurrentStep('menu');
            break;

          case 'contact':
            botResponse = formatContactMessage();
            options = ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Retour au menu principal'];
            break;

          case 'horaires d\'ouverture':
            botResponse = `⏰ Nos horaires d'ouverture :\n\n${restaurantInfo.hours}`;
            options = ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Contact', 'Retour au menu principal'];
            break;

          case 'faire une réservation':
            botResponse = "Pour faire une réservation, vous devez être connecté. Voulez-vous vous connecter maintenant ?";
            options = ['Se connecter', 'Retour au menu principal'];
            setCurrentStep('reservation');
            break;

          case 'se connecter':
            navigate('/login');
            botResponse = "Redirection vers la page de connexion...";
            options = ['Retour au menu principal'];
            break;

          case 'commander en ligne':
            botResponse = "Pour commander en ligne, vous devez être connecté. Voulez-vous vous connecter maintenant ?";
            options = ['Se connecter', 'Retour au menu principal'];
            setCurrentStep('order');
            break;

          case 'retour au menu principal':
            botResponse = "Comment puis-je vous aider ?";
            options = ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact'];
            setCurrentStep('initial');
            break;

          default:
            const selectedCategory = menuCategories.find(
              cat => cat.title.toLowerCase() === message.toLowerCase()
            );

            if (selectedCategory) {
              botResponse = formatMenuMessage(selectedCategory);
              options = menuCategories.map(cat => cat.title);
              options.push('Retour au menu principal');
            } else {
              botResponse = "Je ne comprends pas votre demande. Voici ce que je peux faire pour vous :";
              options = ['Voir le menu', 'Faire une réservation', 'Commander en ligne', 'Horaires d\'ouverture', 'Contact'];
            }
        }
      }

      setMessages(prev => [...prev, { text: botResponse, sender: 'bot', options }]);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        <FaRobot className="text-xl sm:text-2xl transform group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-10 sm:-top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-lg text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat avec FoodyChat
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 sm:absolute sm:bottom-20 sm:right-0 w-[calc(100%-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <FaRobot className="text-lg sm:text-xl" />
              <h3 className="font-medium text-sm sm:text-base">FoodyChat</h3>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <i className="fas fa-times text-base sm:text-lg"></i>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className="mb-3 sm:mb-4">
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl p-2 sm:p-3 max-w-[85%] sm:max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-white text-gray-800 shadow-md'
                  }`}>
                    <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  </div>
                </div>
                {message.options && (
                  <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                    {message.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => handleOptionClick(option)}
                        className="bg-blue-50 text-blue-700 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3 sm:mb-4">
                <div className="bg-white text-gray-800 shadow-md rounded-2xl p-2 sm:p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t p-3 sm:p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <button 
                type="submit"
                disabled={isTyping}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="text-sm sm:text-base" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 