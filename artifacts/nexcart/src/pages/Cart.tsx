import { Link } from 'wouter';
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const sessionId = useSession();
  const queryClient = useQueryClient();
  const cartQueryKey = getGetCartQueryKey({ sessionId });
  const { data: cart, isLoading } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: cartQueryKey } });
  
  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
    }
  });
  const removeItem = useRemoveFromCart({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
    }
  });

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({
      productId,
      data: { quantity: newQuantity, sessionId }
    });
  };

  const handleRemove = (productId: number) => {
    removeItem.mutate({
      productId,
      data: { sessionId }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
          </div>
          <div className="w-full lg:w-1/3">
            <div className="h-80 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative">
          <ShoppingBag className="w-12 h-12 text-primary" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-background rounded-full flex items-center justify-center text-2xl">
            0
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't added anything to your cart yet. Explore our wide range of products and find something you love.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full shadow-cyan bg-secondary hover:bg-secondary/90 text-white px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        Shopping Cart 
        <span className="text-lg bg-muted text-foreground px-3 py-1 rounded-full font-medium">
          {cart.itemCount} items
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {cart.items.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                      <Link href={`/products/${item.productId}`} className="shrink-0">
                        <div className="w-24 h-24 rounded-xl bg-muted p-2 border border-border overflow-hidden">
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      </Link>
                      <div>
                        <div className="text-xs text-secondary font-bold mb-1 uppercase tracking-wide">{item.product.brand}</div>
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">{item.product.name}</h3>
                        </Link>
                        <button 
                          onClick={() => handleRemove(item.productId)}
                          className="text-xs text-destructive flex items-center gap-1 mt-2 hover:underline"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 font-semibold text-center hidden md:block">
                      ${item.product.price.toFixed(2)}
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                      <div className="flex items-center border border-border rounded-full h-10 bg-background overflow-hidden w-28">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={updateItem.isPending}
                          className="flex-1 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={updateItem.isPending}
                          className="flex-1 h-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 flex md:justify-end items-center justify-between md:block mt-4 md:mt-0">
                      <div className="md:hidden font-medium text-muted-foreground">Total:</div>
                      <div className="font-bold text-lg text-right">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{cart.deliveryFee === 0 ? <span className="text-green-600">Free</span> : `$${cart.deliveryFee.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-3xl">${cart.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right mt-1">Inclusive of all taxes</p>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full rounded-full shadow-cyan bg-secondary hover:bg-secondary/90 text-white h-14 text-lg font-semibold group">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Secure, encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
