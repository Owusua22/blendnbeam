import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

// Import images from assets folder
import dryerImg from '../assets/dry.png';
import massageBedImg from '../assets/bed.png';
import chairImg from '../assets/chairs.png';
import steamerImg from '../assets/steamer.jpg';
import heaterImg from '../assets/heater.jpg';
import tripodImg from '../assets/tripod.jpg';

const ShopCategories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const categories = [
    {
      name: 'Dryers',
      gradient: 'from-yellow-50 to-orange-50',
      accent: 'from-yellow-400 to-orange-500',
      image: dryerImg
    },
    {
      name: 'Massage Bed',
      gradient: 'from-purple-50 to-pink-50',
      accent: 'from-purple-400 to-pink-500',
      image: massageBedImg
    },
    {
      name: 'Chairs',
      gradient: 'from-blue-50 to-cyan-50',
      accent: 'from-blue-400 to-cyan-500',
      image: chairImg
    },
    {
      name: 'Steamer',
      gradient: 'from-emerald-50 to-teal-50',
      accent: 'from-emerald-400 to-teal-500',
      image: steamerImg
    },
    {
      name: 'Heater',
      gradient: 'from-rose-50 to-red-50',
      accent: 'from-rose-400 to-red-500',
      image: heaterImg
    },
    {
      name: 'Tripod',
      gradient: 'from-indigo-50 to-violet-50',
      accent: 'from-indigo-400 to-violet-500',
      image: tripodImg
    }
  ];

  const itemsPerView = window.innerWidth >= 1024 ? 6 : window.innerWidth >= 768 ? 4 : 3;
  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className=" mx-auto px-4 py-4">
      {/* Header */}
      <div className=" mb-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">
          Shop Our Top Categories
        </h2>
       
      </div>
      
      <div className="relative">
        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-2xl transition-all hover:scale-110 border border-gray-100"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Categories Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out gap-4 md:gap-6"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView + 1.5)}%)` }}
          >
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[calc(33.333%-0.67rem)] md:w-[calc(25%-1rem)] lg:w-[calc(16.666%-1.25rem)]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="group cursor-pointer">
                  {/* Card Container */}
                  <div
                    className={`relative bg-gradient-to-br ${category.gradient} rounded-2xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-gray-100`}
                  >
                    {/* Circular Image Container */}
                    <div className="relative mb-4 aspect-square">
                      <div className="absolute inset-0 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {/* Gradient Ring */}
                       
                        
                        {/* Image */}
                        <div className="absolute inset-2 flex items-center justify-center">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      
                      {/* Floating Badge */}
                      {hoveredIndex === index && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-white to-gray-50 rounded-full p-2 shadow-lg border border-gray-200 animate-bounce">
                          <ShoppingBag className="w-4 h-4 text-gray-700" />
                        </div>
                      )}
                    </div>
                    
                    {/* Category Name */}
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 text-xs md:text-base mb-1 group-hover:text-gray-900 transition-colors">
                        {category.name}
                      </h3>
                      <div className={`h-0.5 w-0 group-hover:w-full mx-auto bg-gradient-to-r ${category.accent} transition-all duration-300 rounded-full`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-2xl transition-all hover:scale-110 border border-gray-100"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Category Indicators */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index 
                  ? 'w-8 bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopCategories;