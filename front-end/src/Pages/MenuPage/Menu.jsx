import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import api from '../../Api/api';

const Menu = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/menu')
      .then((response) => {
        setMenus(response.data.menus);
        setCategories(response.data.categories);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Scroll to category and highlight if ?category=ID is present
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categoryRefs.current[categoryId]) {
      setActiveCategory(categoryId);
      setTimeout(() => {
        categoryRefs.current[categoryId].scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [searchParams, categories]);

  // Handle click on category title or button
  const handleCategoryClick = (categoryId) => {
    setSearchParams({ category: categoryId });
    setActiveCategory(categoryId);
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl xs:text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
          <FaUtensils className="text-blue-400 text-2xl xs:text-3xl" /> Menu du Restaurant
        </h1>
        <div className="flex gap-2 mb-6 animate-pulse overflow-x-auto w-full px-2">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-8 xs:h-10 w-24 xs:w-32 bg-blue-100 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-6 w-full max-w-6xl">
          {[1, 2, 3].map((categoryIndex) => (
            <div key={categoryIndex}>
              <div className="h-6 xs:h-8 w-36 xs:w-48 bg-gray-200 rounded-lg animate-pulse opacity-50 mb-3 mx-auto"></div>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((itemIndex) => (
                  <div key={itemIndex} className="bg-white shadow-md rounded-xl overflow-hidden animate-pulse opacity-50">
                    <div className="w-full h-32 xs:h-40 bg-gray-200"></div>
                    <div className="p-3 xs:p-5">
                      <div className="h-5 xs:h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 xs:h-5 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-3 xs:p-4">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-6 xs:mb-8 flex items-center justify-center gap-2 animate-fade-in">
        <FaUtensils className="text-blue-400 text-2xl xs:text-3xl" /> Menu du Restaurant
      </h1>

      {categories.length === 0 ? (
        <div className="flex justify-center items-center h-64 xs:h-96">
          <div className="text-lg xs:text-xl font-semibold text-gray-700 text-center px-4">Aucune catégorie disponible pour le moment.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 xs:gap-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              ref={el => categoryRefs.current[category.id] = el}
              className="transition-all duration-300 animate-fade-in-up"
            >
              <h2
                className={`text-xl xs:text-2xl sm:text-3xl font-bold mt-8 xs:mt-12 mb-4 xs:mb-6 cursor-pointer transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg w-fit ${
                  activeCategory === category.id.toString() ? 'text-blue-500 bg-blue-100 shadow' : 'text-gray-800 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <FaUtensils className="text-blue-400 text-lg xs:text-xl" /> {category.title}
              </h2>
              {menus.filter(menu => menu.category_id === category.id).length === 0 ? (
                <div className="flex justify-center items-center mb-4 xs:mb-6">
                  <div className="text-base xs:text-lg text-gray-500">Aucun plat disponible dans cette catégorie.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6">
                  {menus.filter(menu => menu.category_id === category.id).map((item) => (
                    <div key={item.id} className="bg-white shadow-lg xs:shadow-xl rounded-xl xs:rounded-2xl overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-[1.02] animate-fade-in-up flex flex-col items-center">
                      <img 
                        src={`http://127.0.0.1:8000/storage/${item.image}`} 
                        alt={item.title} 
                        className="w-full h-36 xs:h-40 sm:h-48 object-cover" 
                      />
                      <div className="p-4 xs:p-6 flex flex-col gap-2 w-full items-center">
                        <h3 className="text-lg xs:text-xl font-semibold text-gray-800 text-center">{item.title}</h3>
                        <span className="inline-block bg-green-100 text-green-700 font-bold rounded-full px-3 xs:px-4 py-1 text-base xs:text-lg shadow-sm mt-1 xs:mt-2">{item.price}$</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s; }
        .animate-fade-in-up { animation: fadeInUp 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Menu;
