import { Link, useLocation } from 'wouter';
import { useGetCart, useGetWishlist, getGetCartQueryKey, getGetWishlistQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { ShoppingCart, Heart, Search, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import logo from '@assets/ChatGPT_Image_Jul_1,_2026,_06_59_33_PM_1782956871976.png';

export function NavBar() {
  const sessionId = useSession();
  const [, setLocation] = useLocation();
  const { data: cart } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const { data: wishlist } = useGetWishlist({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetWishlistQueryKey({ sessionId }) } });
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <img src={logo} alt="NEXCART" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search for products, brands and more" 
              className="w-full pl-10 pr-4 py-6 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/50 focus-visible:bg-background transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav className="flex items-center gap-2 md:gap-6">
          <Link href="/wishlist" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative group">
            <Heart className="h-6 w-6 group-hover:fill-secondary/20 group-hover:text-secondary transition-all" />
            <span className="text-[10px] font-medium hidden md:block">Wishlist</span>
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 md:right-1 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          
          <Link href="/cart" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors relative group">
            <ShoppingCart className="h-6 w-6 group-hover:fill-primary/20 group-hover:text-primary transition-all" />
            <span className="text-[10px] font-medium hidden md:block">Cart</span>
            {cart && cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 md:right-1 bg-secondary text-secondary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>

          <Link href="/orders" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium hidden md:block">Account</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
