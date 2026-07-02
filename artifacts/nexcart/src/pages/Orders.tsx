import { useListOrders, getListOrdersQueryKey } from '@workspace/api-client-react';
import { useSession } from '@/hooks/use-session';
import { Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Orders() {
  const sessionId = useSession();
  const { data: orders, isLoading } = useListOrders({ sessionId }, { query: { enabled: !!sessionId, queryKey: getListOrdersQueryKey({ sessionId }) } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-muted rounded-3xl" />)}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8">
          <Package className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">No orders yet</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Looks like you haven't placed any orders. Discover amazing products and get them delivered to your doorstep.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-500';
      case 'cancelled': return 'text-destructive';
      case 'shipped': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Status steps for the tracker
  const steps = ['pending', 'confirmed', 'shipped', 'delivered'];

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-8">
        {orders.map((order) => {
          const currentStepIndex = steps.indexOf(order.status);
          const isCancelled = order.status === 'cancelled';

          return (
            <div key={order.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="bg-muted/30 p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Order Placed</div>
                    <div className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Total</div>
                    <div className="font-semibold">${order.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Order ID</div>
                    <div className="font-semibold font-mono text-xs mt-1 bg-background px-2 py-0.5 rounded border border-border">
                      #{order.id.toString().padStart(8, '0')}
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  <StatusIcon status={order.status} />
                  {order.status}
                </div>
              </div>

              <div className="p-6">
                {/* Visual Tracker */}
                {!isCancelled && (
                  <div className="mb-10 px-4 md:px-10">
                    <div className="relative">
                      {/* Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 rounded-full z-0"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-secondary -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
                        style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                      ></div>
                      
                      {/* Dots */}
                      <div className="relative z-10 flex justify-between">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-card transition-colors ${
                                isCompleted ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-secondary/20 scale-110' : ''}`}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                              </div>
                              <span className={`text-xs mt-2 font-medium capitalize ${
                                isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {order.estimatedDelivery && order.status !== 'delivered' && (
                      <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
                        Estimated delivery by: <span className="text-foreground">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-lg border-b border-border pb-2">Items in this order</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6">
                      <Link href={`/products/${item.productId}`} className="shrink-0 bg-muted/20 p-2 rounded-xl border border-border">
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-contain mix-blend-multiply" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-xs text-secondary font-semibold uppercase tracking-wider mb-1">{item.product.brand}</div>
                        <Link href={`/products/${item.productId}`} className="hover:text-primary transition-colors inline-block w-fit">
                          <h3 className="font-semibold text-lg line-clamp-1">{item.product.name}</h3>
                        </Link>
                        <div className="text-muted-foreground text-sm mt-1">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex sm:flex-col justify-between sm:justify-center items-end sm:items-end">
                        <div className="font-bold text-xl">${(item.price * item.quantity).toFixed(2)}</div>
                        <Button variant="outline" size="sm" className="mt-2 rounded-full h-8 text-xs">
                          Buy Again
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
