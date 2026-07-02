import { useState } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct, useGetRelatedProducts, useListReviews, useAddToCart, useAddToWishlist } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Heart, Truck, ShieldCheck, Share2, 
  Minus, Plus, MapPin, CheckCircle2, ChevronRight, MessageSquare, Star 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductDetail() {
  const [, params] = useRoute('/products/:id');
  const productId = parseInt(params?.id || '0', 10);
  
  const sessionId = useSession();
  const { toast } = useToast();
  
  const { data: product, isLoading } = useGetProduct(productId);
  const { data: relatedProducts } = useGetRelatedProducts(productId);
  const { data: reviews } = useListReviews(productId);
  
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-10 animate-pulse">
          <div className="w-full md:w-1/2 h-[500px] bg-muted rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-24 bg-muted rounded w-full" />
            <div className="h-12 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.images || [])];

  const handleAddToCart = () => {
    addToCart.mutate(
      { data: { productId: product.id, quantity, sessionId } },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${quantity}x ${product.name} added to your cart.`,
          });
        }
      }
    );
  };

  const handleAddToWishlist = () => {
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

  const checkPincode = () => {
    if (pincode.length < 5) return;
    setPincodeStatus('checking');
    setTimeout(() => {
      // Mock validation
      setPincodeStatus(Math.random() > 0.3 ? 'valid' : 'invalid');
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <a href="/" className="hover:text-primary">Home</a>
        <ChevronRight className="w-4 h-4 mx-2" />
        <a href={`/products?category=${product.categoryName.toLowerCase()}`} className="hover:text-primary">{product.categoryName}</a>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Images Gallery */}
        <div className="w-full lg:w-[45%] flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar py-2 md:py-0">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-secondary shadow-md' : 'border-transparent hover:border-border'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain bg-white p-2 mix-blend-multiply" />
              </button>
            ))}
          </div>
          
          <div className="flex-1 bg-white dark:bg-card border border-border rounded-3xl p-8 relative overflow-hidden group perspective-1000">
            {product.discountPercent && product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-accent text-white text-sm font-bold px-3 py-1.5 rounded-md shadow-sm">
                {product.discountPercent}% OFF
              </div>
            )}
            
            <button className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm">
              <Share2 size={20} />
            </button>

            <motion.div 
              key={activeImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full min-h-[300px] md:min-h-[500px] flex items-center justify-center transform-style-3d group-hover:rotate-x-2 group-hover:-rotate-y-2 transition-transform duration-500"
            >
              <img 
                src={allImages[activeImage]} 
                alt={product.name} 
                className="w-full max-h-[500px] object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-[55%] flex flex-col">
          <div className="mb-2 text-secondary font-semibold tracking-wider uppercase text-sm">
            {product.brand}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={product.rating} count={product.reviewCount} size={20} />
            <span className="w-1 h-1 bg-border rounded-full"></span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
          </div>

          {/* Quantity and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border border-border rounded-full h-14 bg-background">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-full flex items-center justify-center hover:bg-muted rounded-l-full transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-full flex items-center justify-center hover:bg-muted rounded-r-full transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <Button 
              size="lg" 
              className="flex-1 h-14 rounded-full text-lg shadow-cyan bg-secondary hover:bg-secondary/90 text-white"
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCart.isPending}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 w-14 rounded-full shrink-0 border-border"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>

          {/* Delivery Check */}
          <div className="bg-card border border-border p-6 rounded-2xl mb-8">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-secondary" />
              Check Delivery Eligibility
            </h3>
            <div className="flex gap-3">
              <Input 
                placeholder="Enter Pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="max-w-[200px] h-12"
              />
              <Button onClick={checkPincode} variant="secondary" className="h-12 px-6">
                Check
              </Button>
            </div>
            {pincodeStatus === 'valid' && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">
                <CheckCircle2 size={16} /> Delivery available for this location.
              </p>
            )}
            {pincodeStatus === 'invalid' && (
              <p className="text-sm text-destructive mt-3 flex items-center gap-1">
                Currently out of delivery area for this pincode.
              </p>
            )}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={20} />
              </div>
              <span className="text-sm font-medium">1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <Truck size={20} />
              </div>
              <span className="text-sm font-medium">Free Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="mb-20">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start h-auto border-b border-border bg-transparent p-0 mb-8 rounded-none">
            <TabsTrigger 
              value="description" 
              className="text-lg py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="specifications" 
              className="text-lg py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="text-lg py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-secondary data-[state=active]:shadow-none rounded-none flex gap-2"
            >
              Reviews <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{product.reviewCount}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="animate-in fade-in-50 duration-500">
            <div className="prose dark:prose-invert max-w-4xl">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {product.description || "No description available for this product."}
              </p>
              
              {product.highlights && product.highlights.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Key Highlights</h3>
                  <ul className="space-y-2">
                    {product.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="animate-in fade-in-50 duration-500">
            <div className="max-w-4xl bg-card rounded-2xl border border-border overflow-hidden">
              {product.specifications ? (
                <div className="divide-y divide-border">
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-medium text-muted-foreground sm:col-span-1">{key}</div>
                      <div className="sm:col-span-2 font-medium">{value as string}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No specifications available.</div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="animate-in fade-in-50 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Rating summary */}
              <div className="md:col-span-4 bg-card rounded-2xl border border-border p-8 h-fit">
                <h3 className="font-bold text-xl mb-6">Customer Reviews</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-bold">{product.rating.toFixed(1)}</div>
                  <div>
                    <StarRating rating={product.rating} size={20} className="mb-1" />
                    <div className="text-sm text-muted-foreground">Based on {product.reviewCount} reviews</div>
                  </div>
                </div>
                
                {/* Visual Rating Bars (mocked data based on overall rating) */}
                <div className="space-y-3 mb-8">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const percentage = star === Math.round(product.rating) ? 60 : 
                                      star === Math.round(product.rating) - 1 ? 20 : 
                                      star === Math.round(product.rating) + 1 ? 10 : 5;
                    return (
                      <div key={star} className="flex items-center gap-3 text-sm font-medium">
                        <div className="w-3">{star}</div>
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="w-8 text-right text-muted-foreground">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
                
                <Button className="w-full rounded-full" variant="outline">Write a Review</Button>
              </div>
              
              {/* Reviews List */}
              <div className="md:col-span-8 space-y-6">
                {reviews?.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{review.author}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {review.verifiedPurchase && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {review.verifiedPurchase ? 'Verified Purchase' : 'Guest'}
                            <span className="mx-1">•</span>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    <h4 className="font-bold mt-3 mb-2">{review.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{review.body}</p>
                    <div className="mt-4 flex gap-4 text-xs font-medium text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <MessageSquare className="w-4 h-4" /> Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">You Might Also Like</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp, idx) => (
              <ProductCard key={rp.id} product={rp} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
