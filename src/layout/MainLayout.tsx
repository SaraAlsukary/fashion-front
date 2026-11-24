import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import StorefrontHeader, {
  type StorefrontHeaderProps,
} from '../components/Header';
import StorefrontFooter from '../components/Footer';
import type { HomeCategory } from '../services/homeService';
import FloatingDockAndCartSidebar from '../components/FloatingDockAndCartSidebar';

export interface StorefrontOutletContext {
  locationLabel: string;
  setLocationLabel: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  categories: HomeCategory[];
  setCategories: React.Dispatch<React.SetStateAction<HomeCategory[]>>;
  selectedCategorySlug: string;
  setSelectedCategorySlug: React.Dispatch<React.SetStateAction<string>>;
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  priceSort: 'none' | 'asc' | 'desc';
  setPriceSort: React.Dispatch<React.SetStateAction<'none' | 'asc' | 'desc'>>;
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  bagCount: number;
  incrementBagCount: (by?: number) => void;
}

export const useStorefrontContext = () =>
  useOutletContext<StorefrontOutletContext | null>();

interface StorefrontLayoutProps {
  children?: React.ReactNode;
  headerProps?: StorefrontHeaderProps;
  favoriteCount?: number;
  bagCount?: number;
}

const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({
  children,
  headerProps,
  favoriteCount = 0,
  bagCount: initialBagCount = 2,
}) => {
  const [locationLabel, setLocationLabel] = useState('حلب، الفرقان');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [bagCount, setBagCount] = useState<number>(initialBagCount);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const incrementBagCount = (by = 1) => {
    setBagCount((c) => c + by);
  };

  const resolvedFavCount =
    headerProps?.favoriteCount ?? (favoriteIds.length > 0 ? favoriteIds.length : favoriteCount);
  const resolvedBagCount = headerProps?.bagCount ?? bagCount;

  const outletContext: StorefrontOutletContext = {
    locationLabel,
    setLocationLabel,
    searchQuery,
    setSearchQuery,
    categories,
    setCategories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    selectedSize,
    setSelectedSize,
    priceSort,
    setPriceSort,
    favoriteIds,
    toggleFavorite,
    bagCount: resolvedBagCount,
    incrementBagCount,
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-surface text-brand-ink pb-20 md:pb-0 flex flex-col"
    >
      <StorefrontHeader
        locationLabel={locationLabel}
        onToggleLocation={() =>
          setLocationLabel((prev) =>
            prev === 'حلب، الفرقان' ? 'دمشق، المزة' : 'حلب، الفرقان'
          )
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={setSelectedCategorySlug}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        priceSort={priceSort}
        onChangePriceSort={setPriceSort}
        {...headerProps}
        favoriteCount={resolvedFavCount}
        bagCount={resolvedBagCount}
      />

      <div className="flex-1">
        {children ?? <Outlet context={outletContext} />}
        <FloatingDockAndCartSidebar />
      </div>

      <StorefrontFooter
        favoriteCount={resolvedFavCount}
        bagCount={resolvedBagCount}
      />
    </div>
  );
};

export default StorefrontLayout;