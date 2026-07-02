import { useState } from 'react';
import { useListProducts, useListCategories, ListProductsSort } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { useLocation, useSearch } from 'wouter';
import { Filter, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Products() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryParam = searchParams.get('category') || undefined;
  const isDealParam = searchParams.get('isDeal') === 'true';

  const [sortBy, setSortBy] = useState<ListProductsSort>(ListProductsSort.popular);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useListCategories();
  
  // For the actual api call, handle the query params mapping
  const queryParams: any = {
    sort: sortBy,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    limit: 50,
  };
  
  if (categoryParam) queryParams.category = categoryParam;
  if (selectedBrands.length > 0) queryParams.brand = selectedBrands[0]; // just passing first brand for simplicity

  const { data: response, isLoading } = useListProducts(queryParams);
  const products = isDealParam && response ? response.products.filter(p => p.isDeal) : response?.products;

  // Extract unique brands for filter
  const allBrands = Array.from(new Set(response?.products.map(p => p.brand) || []));

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceChange = (value: number[]) => {
    if (value.length === 2) {
      setPriceRange([value[0], value[1]]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {isDealParam ? 'Deals of the Day' : categoryParam ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)}` : 'All Products'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {products?.length || 0} products found
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[160px] justify-between">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Sort By
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as ListProductsSort)}>
                <DropdownMenuRadioItem value={ListProductsSort.popular}>Most Popular</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={ListProductsSort.newest}>Newest Arrivals</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={ListProductsSort.price_asc}>Price: Low to High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={ListProductsSort.price_desc}>Price: High to Low</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={ListProductsSort.rating}>Highest Rated</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4 pb-4 border-b border-border">Filters</h3>
            
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-4">Price Range</h4>
              <Slider
                defaultValue={[0, 5000]}
                max={5000}
                step={50}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="bg-muted px-2 py-1 rounded border border-border">${priceRange[0]}</span>
                <span className="text-muted-foreground">-</span>
                <span className="bg-muted px-2 py-1 rounded border border-border">${priceRange[1]}</span>
              </div>
            </div>

            {/* Brands */}
            {allBrands.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm mb-3">Brands</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {allBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4 transition-all"
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={() => {
                setPriceRange([0, 5000]);
                setSelectedBrands([]);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
              <div className="w-24 h-24 mb-6 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any products matching your current filters. Try adjusting your search criteria.
              </p>
              <Button 
                className="mt-6"
                onClick={() => {
                  setPriceRange([0, 5000]);
                  setSelectedBrands([]);
                  setSortBy(ListProductsSort.popular);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
