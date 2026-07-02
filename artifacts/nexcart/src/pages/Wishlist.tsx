import { Link } from 'wouter';
import { useGetWishlist, useAddToCart, useRemoveFromWishlist, getGetWishlistQueryKey, getGetCartQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
  const sessionId = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wishlistQueryKey = getGetWishlistQueryKey({ sessionId });
  const cartQueryKey = getGetCartQueryKey({ sessionId });
  
  const { data: wishlist, isLoading } = useGetWishlist({ sessionId }, { query: { enabled: !!sessionId, queryKey: wishlistQueryKey } });
  const removeFromWishlist = useRemoveFromWishlist({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistQueryKey }) }
  });
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }) }
  });

  const handleRemove = (productId: number, productName: string) => {
    removeFromWishlist.mutate(
      { productId, data: { sessionId } },
      {
        onSuccess: () => {
          toast({
            description: `${productName} removed from wishlist`,
          });
        }
      }
    );
  };

  const handleMoveToCart = (product: any) => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1, sessionId } },
      {
        onSuccess: () => {
          handleRemove(product.id, product.name);
          toast({
            title: "Moved to Cart",
            description: `${product.name} added to your cart.`,
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const isEmpty = !wishlist || wishlist.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8">
          <Heart className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Save items you like in your wishlist. Review them anytime and easily move them to cart.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        My Wishlist 
        <span className="text-lg bg-muted text-foreground px-3 py-1 rounded-full font-medium">
          {wishlist.length} items
        </span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {wishlist.map((product, idx) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col group"
            >
              {/* Image & Remove button */}
              <div className="relative pt-[100%] bg-muted/20 w-full overflow-hidden">
                <button 
                  onClick={() => handleRemove(product.id, product.name)}
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
                <Link href={`/products/${product.id}`}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs text-secondary font-semibold mb-1 tracking-wider uppercase">
                  {product.brand}
                </div>
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors h-12">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-end justify-between mt-auto mb-4">
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        ${product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                <Button 
                  onClick={() => handleMoveToCart(product)}
                  className="w-full rounded-full"
                  disabled={!product.inStock || addToCart.isPending}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Move to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
