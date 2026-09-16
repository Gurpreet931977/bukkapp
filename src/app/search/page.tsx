'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Business, SearchFilters, ParsedSearchIntent } from '@/types';
import { store } from '@/lib/db/store';
import { SearchIntentParser } from '@/lib/search/intentParser';
import { BusinessCard } from '@/components/business/BusinessCard';
import { FilterBar } from '@/components/search/FilterBar';
import { Search, Map, LayoutGrid, Sparkles, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-brand-surface-alt rounded-2xl flex items-center justify-center text-xs text-brand-secondary font-bold border border-brand-border">
        Loading interactive map...
      </div>
    ),
  }
);

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    neighborhood: searchParams.get('neighborhood') || undefined,
    date: searchParams.get('date') || undefined,
    sortBy: (searchParams.get('sort') as any) || 'recommended',
  });

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [parsedIntent, setParsedIntent] = useState<ParsedSearchIntent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>(undefined);

  // Sync state when searchParams change or filters update
  useEffect(() => {
    const rawQ = searchParams.get('q') || '';
    if (rawQ) {
      setQueryInput(rawQ);
      const intent = SearchIntentParser.parse(rawQ);
      setParsedIntent(intent.confidence > 0 ? intent : null);
    } else {
      setParsedIntent(null);
    }

    const currentFilters: SearchFilters = {
      query: rawQ || undefined,
      category: searchParams.get('category') || filters.category,
      neighborhood: searchParams.get('neighborhood') || filters.neighborhood,
      date: searchParams.get('date') || filters.date,
      sortBy: (searchParams.get('sort') as any) || filters.sortBy || 'recommended',
      verifiedOnly: filters.verifiedOnly,
      timePeriod: filters.timePeriod,
    };

    const results = store.getBusinesses(currentFilters);
    setBusinesses(results);
  }, [searchParams, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (queryInput.trim()) params.set('q', queryInput.trim());
    if (filters.category) params.set('category', filters.category);
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setFilters({ sortBy: 'recommended' });
    router.push('/search');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Search & Filter Header */}
      <div className="bg-white border-b border-brand-border/80 sticky top-16 z-30 shadow-subtle py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Search businesses, services, intent (e.g. dentist tomorrow after 6)..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-brand-surface-alt border border-brand-border text-sm font-medium text-brand-black placeholder-neutral-400 focus:outline-hidden focus:border-brand-black transition-all"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => setQueryInput('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-brand-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-brand-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800"
              >
                Search
              </button>
            </form>

            {/* View Mode Toggle: Grid vs Map Split */}
            <div className="flex items-center gap-1 bg-brand-surface-alt p-1 rounded-xl border border-brand-border shrink-0 self-end md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-brand-black shadow-xs' : 'text-brand-secondary hover:text-brand-black'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'split' ? 'bg-white text-brand-black shadow-xs' : 'text-brand-secondary hover:text-brand-black'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map Split</span>
              </button>
            </div>
          </div>

          {/* AI / NLP Search Intent Banner */}
          {parsedIntent && (
            <div className="mt-3 py-2 px-3.5 rounded-xl bg-[#FAFDF4] border border-[#D5F58D] flex items-center justify-between text-xs text-brand-black animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#558B07] shrink-0" />
                <span>
                  <strong>Search Intent Detected:</strong>{' '}
                  {parsedIntent.detectedCategory && <span className="underline decoration-brand-lime mr-2">Category: {parsedIntent.detectedCategory}</span>}
                  {parsedIntent.detectedNeighborhood && <span className="underline decoration-brand-lime mr-2">Area: {parsedIntent.detectedNeighborhood}</span>}
                  {parsedIntent.detectedDate && <span className="underline decoration-brand-lime mr-2">Date: {parsedIntent.detectedDate}</span>}
                  {parsedIntent.detectedTimeFrom && <span className="underline decoration-brand-lime mr-2">Time: After {parsedIntent.detectedTimeFrom}</span>}
                  {parsedIntent.detectedMaxPrice && <span className="underline decoration-brand-lime">Max Price: ₹{parsedIntent.detectedMaxPrice}</span>}
                </span>
              </div>
              <button
                onClick={() => setParsedIntent(null)}
                className="text-neutral-400 hover:text-brand-black"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Filter Controls Bar */}
        <FilterBar
          filters={filters}
          onChange={(newF) => setFilters(newF)}
          onReset={handleResetFilters}
          resultCount={businesses.length}
        />

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-brand-secondary">
          <p>
            Showing <strong className="text-brand-black">{businesses.length}</strong> available businesses in{' '}
            <strong className="text-brand-black">{filters.neighborhood || 'Dehradun'}</strong>
          </p>
        </div>

        {/* Split View Layout or Standard Grid */}
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* List column */}
            <div className="lg:col-span-7 space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {businesses.map((biz) => (
                    <div
                      key={biz.id}
                      onMouseEnter={() => setSelectedBusinessId(biz.id)}
                      className={selectedBusinessId === biz.id ? 'ring-2 ring-brand-black rounded-2xl' : ''}
                    >
                      <BusinessCard business={biz} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyResults onReset={handleResetFilters} />
              )}
            </div>

            {/* Sticky Map Column */}
            <div className="lg:col-span-5 sticky top-44">
              <LeafletMap
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                onSelectBusiness={(biz) => setSelectedBusinessId(biz.id)}
                className="h-[600px] w-full"
              />
            </div>
          </div>
        ) : (
          <div>
            {businesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            ) : (
              <EmptyResults onReset={handleResetFilters} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-brand-border/80 p-8 shadow-subtle max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-brand-surface-alt flex items-center justify-center mx-auto mb-4 text-neutral-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-brand-black">No matching businesses found</h3>
      <p className="text-xs text-brand-secondary mt-1 max-w-xs mx-auto leading-relaxed">
        We couldn&apos;t find any businesses matching your search criteria. Try adjusting your filters or searching across all areas.
      </p>
      <div className="mt-6">
        <Button variant="primary" size="sm" onClick={onReset}>
          Reset all filters
        </Button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-medium">Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
