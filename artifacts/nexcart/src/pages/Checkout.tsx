import { useLocation } from 'wouter';
import { useGetCart, useCreateOrder, getGetCartQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(5, "Valid pincode is required"),
  paymentMethod: z.enum(["card", "upi", "cod"]),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const sessionId = useSession();
  const { toast } = useToast();
  
  const { data: cart, isLoading: isCartLoading } = useGetCart({ sessionId }, { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } });
  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      paymentMethod: "card",
    },
  });

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    if (!cart || cart.items.length === 0) return;

    const fullAddress = `${values.fullName}, ${values.address}, ${values.city} - ${values.pincode}. Ph: ${values.phone}`;
    
    createOrder.mutate(
      {
        data: {
          sessionId,
          deliveryAddress: fullAddress,
          paymentMethod: values.paymentMethod,
          items: cart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price
          }))
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Order Placed Successfully!",
            description: "Your order has been confirmed.",
          });
          setLocation("/orders");
        }
      }
    );
  };

  if (isCartLoading) return <div className="p-8 text-center">Loading checkout...</div>;
  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Delivery Details */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">1. Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode / ZIP</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="House/Flat No., Building Name, Street" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>City / State</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 pb-4 border-b border-border">2. Payment Method</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem className="flex items-center space-x-0 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="card" className="sr-only peer" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-xl cursor-pointer bg-card hover:bg-muted peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 transition-all">
                              <CreditCard className="w-8 h-8 mb-2 text-foreground" />
                              <span className="font-semibold text-sm">Credit/Debit Card</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-0 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="upi" className="sr-only peer" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-xl cursor-pointer bg-card hover:bg-muted peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 transition-all">
                              <Wallet className="w-8 h-8 mb-2 text-foreground" />
                              <span className="font-semibold text-sm">UPI / Wallets</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-0 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="cod" className="sr-only peer" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-center w-full p-4 border-2 rounded-xl cursor-pointer bg-card hover:bg-muted peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 transition-all">
                              <Banknote className="w-8 h-8 mb-2 text-foreground" />
                              <span className="font-semibold text-sm">Cash on Delivery</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit trigger bound to summary button */}
              <button type="submit" id="submit-order" className="hidden" />
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-card border border-border rounded-3xl p-6 sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-md bg-muted p-1 border border-border shrink-0">
                    <img src={item.product.imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                  </div>
                  <div className="flex-1 text-sm">
                    <h4 className="font-semibold line-clamp-1">{item.product.name}</h4>
                    <div className="text-muted-foreground mt-1">Qty: {item.quantity}</div>
                    <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 text-sm pt-6 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{cart.deliveryFee === 0 ? 'Free' : `$${cart.deliveryFee.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total Payable</span>
                <span className="font-bold text-3xl text-secondary">${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full rounded-full shadow-cyan bg-secondary hover:bg-secondary/90 text-white h-14 text-lg font-semibold"
              onClick={() => document.getElementById('submit-order')?.click()}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? 'Processing...' : 'Place Order'}
            </Button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Payments are secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
