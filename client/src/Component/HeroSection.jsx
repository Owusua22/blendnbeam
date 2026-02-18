// src/Components/HeroSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActiveBannersThunk } from "../Redux/slice/bannerSlice"; // adjust path if needed

export default function HeroSection() {
  const dispatch = useDispatch();
  const { active: banners = [], loading } = useSelector((s) => s.banners);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Load banners once
  useEffect(() => {
    dispatch(fetchActiveBannersThunk());
  }, [dispatch]);

  // Build slides from DB banners (keep exact bg UI)
  const slides = useMemo(() => {
    const sorted = [...(banners || [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    );

    // Keep your exact gradient color (same as before)
    const color = "from-green-500 to-emerald-600";

    return sorted.map((b) => ({
      image: b?.image?.url,
      title: b?.title || "Blend & Beam",
      subtitle: b?.subtitle || "",
      link: b?.link || "",
      color,
    }));
  }, [banners]);

  // Keep index in range when banners change
  useEffect(() => {
    if (currentSlide > slides.length - 1) setCurrentSlide(0);
  }, [slides.length, currentSlide]);

  const nextSlide = () => {
    if (!slides.length || isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setIsVisible(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  const prevSlide = () => {
    if (!slides.length || isAnimating) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsVisible(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  const goToSlide = (index) => {
    if (!slides.length || isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsVisible(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 300);
  };

  // Auto-play
  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, currentSlide]); // keep behaviour close to your original

  // Fallback UI if no banners
  if (!loading && slides.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-50 to-white">
        <div className="relative w-full h-[250px] md:h-[350px] lg:h-[400px] xl:h-[600px] overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-100 grid place-items-center">
          <div className="text-sm font-semibold text-gray-600">
            No active banners yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-white">
      <div className="">
        {/* Main Hero Container (kept EXACT classes/structure) */}
        <div className="relative w-full h-[250px]  md:h-[350px] lg:h-[400px] xl:h-[600px] overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-100">
          {/* Slides */}
          {slides.map((slide, index) => (
            <div
              key={slide.image || index}
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Background Gradient (kept exact UI) */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-10 z-0`}
              />

              {/* Content Grid (kept exact UI) */}
              <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 md:py-8">
                {/* Image Container */}
                <div className="relative flex items-center justify-center w-full lg:w-auto">
                  <div
                    className={`relative transition-all duration-700 delay-500 ${
                      isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[650px] max-h-[200px] sm:max-h-[250px] md:max-h-[350px] lg:max-h-[450px] xl:max-h-[550px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows (kept exact UI) */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 z-20 group border border-gray-200 hover:border-gray-300 hover:scale-110 disabled:opacity-60"
            disabled={isAnimating || slides.length < 2}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-3 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 z-20 group border border-gray-200 hover:border-gray-300 hover:scale-110 disabled:opacity-60"
            disabled={isAnimating || slides.length < 2}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>

          {/* Dots Indicator (kept exact UI) */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 md:gap-3 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl border border-gray-200">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative rounded-full transition-all duration-500 group ${
                  index === currentSlide
                    ? "w-6 sm:w-8 md:w-10 lg:w-12 bg-gradient-to-r from-gray-800 to-gray-600 shadow-lg transform scale-110"
                    : "w-2 sm:w-2.5 md:w-3 bg-gray-300 hover:bg-gray-400"
                } h-2 sm:h-2.5 md:h-3`}
                aria-label={`Go to slide ${index + 1}`}
                disabled={isAnimating}
              >
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    index === currentSlide ? "opacity-100" : ""
                  }`}
                />
                {index === currentSlide && (
                  <div className="absolute inset-0 rounded-full border border-white animate-ping" />
                )}
              </button>
            ))}
          </div>

          {/* Progress Bar (kept exact UI) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-20">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-5000 ease-linear"
              style={{
                width: isAnimating ? "100%" : "0%",
                animation: isAnimating ? "progress 5s linear" : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Animations (kept exact UI) */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}