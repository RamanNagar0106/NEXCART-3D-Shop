import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/Layout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import Search from '@/pages/Search';
import { Chatbot } from '@/components/Chatbot';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/orders" component={Orders} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
      <Chatbot />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
