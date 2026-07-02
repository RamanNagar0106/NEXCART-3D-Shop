import { useLocation, useSearch } from 'wouter';
import { useListProducts, useGetSearchSuggestions, getListProductsQueryKey, getGetSearchSuggestionsQueryKey } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export default function Search() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialQuery = searchParams.get('q') || '';
  
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialQuery) {
      setLocation(`/search?q=${encodeURIComponent(debouncedQuery)}`, { replace: true });
    }
  }, [debouncedQuery, initialQuery, setLocation]);

  const { data: response, isLoading } = useListProducts(
    { search: debouncedQuery || undefined },
    { query: { enabled: !!debouncedQuery, queryKey: getListProductsQueryKey({ search: debouncedQuery || undefined }) } }
  );

  const { data: suggestions } = useGetSearchSuggestions(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 2, queryKey: getGetSearchSuggestionsQueryKey({ q: debouncedQuery }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-[70vh]">
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories..." 
            className="w-full pl-14 pr-4 py-8 text-lg rounded-2xl bg-card border-2 border-border focus-visible:border-secondary focus-visible:ring-secondary/20 shadow-sm"
            autoFocus
          />
        </div>
        
        {suggestions && suggestions.length > 0 && query && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground py-1">Suggestions:</span>
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => setQuery(s)}
                className="text-sm bg-muted hover:bg-secondary hover:text-white px-3 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {!debouncedQuery ? (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-2xl font-semibold mb-2">What are you looking for?</h2>
          <p>Start typing to search across thousands of products</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : response?.products.length ? (
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Search results for "{debouncedQuery}" 
            <span className="text-muted-foreground ml-2 font-normal text-sm">({response.total} found)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {response.products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find anything matching "{debouncedQuery}". Try checking your spelling or using more general terms.
          </p>
        </div>
      )}
    </div>
  );
}
