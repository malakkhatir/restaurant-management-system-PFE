            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <button className="text-white hover:text-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                        Menu
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-500 hover:text-white transition-colors duration-200"
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
                {isConnected ? ( 