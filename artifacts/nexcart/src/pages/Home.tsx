import { useEffect, useState } from 'react';
import { useGetStoreSummary, useGetFeaturedProducts, useGetDealsOfDay, useListCategories } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Truck, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import bannerElectronics from '@assets/generated_images/banner_electronics.jpg';
import bannerFashion from '@assets/generated_images/banner_fashion.jpg';
import bannerHome from '@assets/generated_images/banner_home.jpg';
import catElectronics from '@assets/generated_images/cat_electronics.jpg';
import catFashion from '@assets/generated_images/cat_fashion.jpg';
import catHome from '@assets/generated_images/cat_home.jpg';
import catSports from '@assets/generated_images/cat_sports.jpg';
import catBooks from '@assets/generated_images/cat_books.jpg';
import catBeauty from '@assets/generated_images/cat_beauty.jpg';

// Mock banners since listBanners hook might be empty initially
const mockBanners = [
  {
    id: 1,
    title: "Next-Gen Tech is Here",
    subtitle: "Upgrade your setup with the latest electronics.",
    imageUrl: bannerElectronics,
    bgColor: "from-blue-900 to-indigo-900",
    ctaText: "Shop Electronics",
    link: "/products?category=electronics"
  },
  {
    id: 2,
    title: "Elevate Your Style",
    subtitle: "Premium fashion apparel and accessories.",
    imageUrl: bannerFashion,
    bgColor: "from-slate-900 to-gray-800",
    ctaText: "Shop Fashion",
    link: "/products?category=fashion"
  },
  {
    id: 3,
    title: "Smart Home, Smart Life",
    subtitle: "Automate your living space effortlessly.",
    imageUrl: bannerHome,
    bgColor: "from-teal-900 to-cyan-900",
    ctaText: "Shop Home",
    link: "/products?category=home"
  }
];

const mockCategoryImages: Record<string, string> = {
  electronics: catElectronics,
  fashion: catFashion,
  home: catHome,
  sports: catSports,
  books: catBooks,
  beauty: catBeauty
};

export default function Home() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useGetFeaturedProducts();
  const { data: deals, isLoading: loadingDeals } = useGetDealsOfDay();
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % mockBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Banner Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img 
              src={mockBanners[activeBanner].imageUrl} 
              alt={mockBanners[activeBanner].title} 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-20 container mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <motion.div
              key={`text-${activeBanner}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-tight drop-shadow-lg">
                {mockBanners[activeBanner].title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-lg drop-shadow">
                {mockBanners[activeBanner].subtitle}
              </p>
              <Link href={mockBanners[activeBanner].link}>
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-cyan group">
                  {mockBanners[activeBanner].ctaText}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
          {mockBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeBanner ? "w-8 bg-secondary" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Next-Day Delivery</h4>
              <p className="text-xs text-muted-foreground">On premium orders</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Secure Checkout</h4>
              <p className="text-xs text-muted-foreground">100% protected</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Easy Returns</h4>
              <p className="text-xs text-muted-foreground">30-day policy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Top Brands</h4>
              <p className="text-xs text-muted-foreground">Authentic products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Explore Categories</h2>
          <Link href="/products" className="text-primary hover:text-secondary font-medium flex items-center text-sm md:text-base">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {loadingCategories ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories?.slice(0, 6).map((cat, i) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative bg-gradient-to-br from-primary/5 to-secondary/5">
                    <img 
                      src={mockCategoryImages[cat.slug] || mockCategoryImages['electronics']} 
                      alt={cat.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-secondary transition-colors text-center">{cat.name}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Deals of the Day */}
      <section className="bg-primary/5 dark:bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Deals of the Day</h2>
            </div>
            
            {/* Simple Countdown */}
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-muted-foreground">Ends in:</span>
              <div className="flex gap-1">
                <span className="bg-foreground text-background px-2 py-1 rounded">04</span>:
                <span className="bg-foreground text-background px-2 py-1 rounded">28</span>:
                <span className="bg-foreground text-background px-2 py-1 rounded">59</span>
              </div>
            </div>
          </div>

          {loadingDeals ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals?.slice(0, 4).map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Products</h2>
          <Link href="/products" className="text-primary hover:text-secondary font-medium flex items-center text-sm md:text-base">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loadingFeatured ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 8).map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
