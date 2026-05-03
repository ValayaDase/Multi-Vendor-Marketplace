import { useEffect, useState } from "react";
import { Sparkles, ShoppingBag, Leaf, Truck, ChevronRight, ChevronLeft } from "lucide-react";
import { getImageUrl } from "../../config/api";
import Button from "../../components/ui/Button";

const iconMap = {
  Sparkles,
  ShoppingBag,
  Leaf,
  Truck,
};

export default function HeroSlider({ products = [], onExplore }) {
  // --- LOGIC REMAINS EXACTLY THE SAME ---
  const slides = products.slice(0, 4).map((product, index) => ({
    id: product._id,
    title: product.title,
    subtitle: [
      "Curated daily deals with premium quality.",
      "Best value picks with standout visuals.",
      "Eco-led products for a sustainable lifestyle.",
      "Fresh arrivals curated for your local city.",
    ][index] || "Featured collection",
    badge: ["Trending", "Hot Deals", "Eco Choice", "Express Picks"][index] || "Featured",
    bgClass: [
      "bg-gradient-to-br from-[#ffb6c1]/40 via-[#ffe4e1]/20 to-[#fff0f5]/60", // Pastel Pink
      "bg-gradient-to-br from-[#b5e2fa]/40 via-[#e0f4ff]/20 to-[#f0f9ff]/60", // Pastel Blue
      "bg-gradient-to-br from-[#c1fba4]/40 via-[#eaffd0]/20 to-[#f4ffe8]/60", // Pastel Green
      "bg-gradient-to-br from-[#e2d4f0]/40 via-[#f4eaff]/20 to-[#faf5ff]/60", // Pastel Purple
    ][index],
    icon: [ShoppingBag, Sparkles, Leaf, Truck][index] || ShoppingBag,
    image: product.images?.[0],
    price: product.price,
    category: product.category,
  }));

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[active];
  const Icon = slide.icon || iconMap.Sparkles;

  const nextSlide = () => setActive((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActive((prev) => (prev - 1 + slides.length) % slides.length);
  // --- END LOGIC ---

  return (
    <section className="relative overflow-hidden rounded-[3rem] shadow-sm border border-slate-100 group fade-up">
      {/* Dynamic Pastel Background */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${slide.bgClass}`} />
      
      {/* Refined Background Elements */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/50 blur-[80px] transition-all duration-1000" />
      <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-white/50 blur-[80px] transition-all duration-1000" />

      <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-12 p-8 md:p-16 items-center min-h-[540px]">
        
        {/* Left Content Area */}
        <div className="space-y-8 text-slate-900 z-10 slide-in" key={active}>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-5 py-2 text-xs font-black uppercase tracking-widest text-slate-800 shadow-sm">
            <Icon size={18} className="text-brand" />
            {slide.badge}
          </div>

          <div className="space-y-6 max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900">
              Premium shopping, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400">beautifully simple.</span>
            </h1>
            <p className="max-w-lg text-lg text-slate-700 font-semibold leading-relaxed">
              {slide.subtitle} Discover products with a pastel touch and modern elegance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 pt-4">
            <Button onClick={onExplore} variant="primary" size="lg" icon={ChevronRight} iconPosition="right" className="shadow-xl shadow-brand/20 rounded-2xl py-4 px-8 text-lg font-bold">
              Explore Now
            </Button>
            <div className="rounded-2xl bg-white/70 px-6 py-4 text-base font-black text-slate-800 shadow-sm border border-white/80 backdrop-blur-md">
              {slide.category} • <span className="text-brand">₹{slide.price?.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-8">
             <div className="flex gap-3 bg-white/50 p-2 rounded-full backdrop-blur-sm">
               {slides.map((item, index) => (
                 <button
                   key={item.id}
                   onClick={() => setActive(index)}
                   className={`h-2.5 rounded-full transition-all duration-500 ${
                     index === active ? "w-10 bg-slate-900" : "w-2.5 bg-slate-400/50 hover:bg-slate-600"
                   }`}
                   aria-label={`Go to slide ${index + 1}`}
                 />
               ))}
             </div>
             
             <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={prevSlide} className="p-3 rounded-full bg-white/80 hover:bg-white text-slate-800 transition shadow-md backdrop-blur-md border border-white">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="p-3 rounded-full bg-white/80 hover:bg-white text-slate-800 transition shadow-md backdrop-blur-md border border-white">
                  <ChevronRight size={24} />
                </button>
             </div>
          </div>
        </div>

        {/* Right Fancy Image Area */}
        <div className="relative flex justify-center lg:justify-end z-10 w-full" key={`img-${active}`}>
          <div className="w-full max-w-[480px] relative float-in aspect-[4/5]">
             
             {/* Offset Fancy Card Background */}
             <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2.5rem] rotate-6 scale-105 border border-white/50 shadow-2xl transition-transform duration-700" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/60 to-transparent rounded-[2.5rem] -rotate-3 scale-105 border border-white shadow-xl transition-transform duration-700 delay-100" />

             {/* Main Image Container */}
             <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl group/image">
               <img
                 src={getImageUrl(slide.image)}
                 alt={slide.title}
                 className="h-full w-full object-cover transition-transform duration-1000 group-hover/image:scale-110"
               />
               
               {/* Fancy Overlay Gradient & Text */}
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent p-8 text-white translate-y-4 group-hover/image:translate-y-0 transition-transform duration-500">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-widest text-white/90">{slide.badge}</p>
                 </div>
                 <h3 className="text-3xl font-black leading-tight line-clamp-2">{slide.title}</h3>
               </div>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
}