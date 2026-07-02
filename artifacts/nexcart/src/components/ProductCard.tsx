import { Link } from 'wouter';
import { Product } from '@workspace/api-client-react';
import { StarRating } from './ui/star-rating';
import { Button } from './ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAddToCart, useAddToWishlist } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const sessionId = useSession();
  const { toast } = useToast();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1, sessionId } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${product.name} added to your cart.`,
          });
        }
      }
    );
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToWishlist.mutate(
      { productId: product.id, data: { sessionId } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Wishlist",
            description: `${product.name} saved for later.`,
          });
        }
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="perspective-1000 w-full h-full"
    >
      <Link href={`/products/${product.id}`} className="block h-full group">
        <div className="relative h-full bg-card rounded-2xl border border-card-border overflow-hidden transform-style-3d hover-3d-card flex flex-col">
          
          {/* Discount Badge */}
          {product.discountPercent && product.discountPercent > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
              {product.discountPercent}% OFF
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={handleAddToWishlist}
            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-destructive hover:scale-110 transition-all shadow-sm"
          >
            <Heart size={18} />
          </button>

          {/* Image Container */}
          <div className="relative pt-[100%] bg-muted/20 w-full overflow-hidden">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-contain p-6 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <div className="text-xs text-secondary font-semibold mb-1 tracking-wider uppercase">
              {product.brand}
            </div>
            
            <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
              {product.name}
            </h3>
            
            <div className="mb-3">
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>
            
            <div className="flex items-end justify-between mt-auto">
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
              
              <Button 
                onClick={handleAddToCart}
                size="sm" 
                className="rounded-full w-10 h-10 p-0 shrink-0 shadow-md group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300"
                disabled={!product.inStock || addToCart.isPending}
              >
                <ShoppingCart size={18} className="translate-x-[-1px]" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
