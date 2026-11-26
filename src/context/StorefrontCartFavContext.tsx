import React, { createContext, useContext, useEffect, useState } from 'react';
import { resolveHomeMediaUrl, type HomeProduct } from '../services/homeService';

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selected: boolean;
  colorName?: string;
  colorHex?: string | null;
  sizeName?: string;
  shopId: string;
  shopName: string;
}

export interface FavoriteProductItem {
  id: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number | null;
  shopName?: string;
  brandName?: string;
}

interface StorefrontCartFavContextValue {
  favorites: FavoriteProductItem[];
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavoriteProduct: (
    product: Partial<HomeProduct> & { id: string; name: string }
  ) => boolean;
  removeFavorite: (id: string) => void;

  cartItems: CartItem[];
  totalBagCount: number;
  addToCart: (
    product: Partial<HomeProduct> & { id: string; name: string },
    options?: {
      quantity?: number;
      colorName?: string;
      colorHex?: string | null;
      sizeName?: string;
      price?: number;
    }
  ) => void;
  updateCartQuantity: (key: string, delta: number) => void;
  toggleCartItemSelected: (key: string) => void;
  removeCartItem: (key: string) => void;
  clearSelectedCartItems: () => void;
}

const FAV_STORAGE_KEY = 'fashion_storefront_favorites_v1';
const CART_STORAGE_KEY = 'fashion_storefront_cart_v1';

const fallbackImg =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80';

const extractProductImage = (
  product: Partial<HomeProduct> & { image?: string }
): string => {
  if (product.image) {
    return resolveHomeMediaUrl(product.image) || fallbackImg;
  }
  const sorted = [...(product.images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  return resolveHomeMediaUrl(sorted[0]?.image) || fallbackImg;
};

const StorefrontCartFavContext =
  createContext<StorefrontCartFavContextValue | null>(null);

export const StorefrontCartFavProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteProductItem[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [cartItems]);

  const favoriteIds = favorites.map((f) => String(f.id));
  const isFavorite = (id: string) => favoriteIds.includes(String(id));

  const toggleFavoriteProduct = (
    product: Partial<HomeProduct> & { id: string; name: string }
  ): boolean => {
    const idStr = String(product.id);
    const exists = favoriteIds.includes(idStr);
    if (exists) {
      setFavorites((prev) => prev.filter((item) => String(item.id) !== idStr));
      return false;
    }

    const basePrice = Number(product.price ?? 0);
    const saleVal =
      product.sale_price !== null && product.sale_price !== undefined
        ? Number(product.sale_price)
        : null;

    const newItem: FavoriteProductItem = {
      id: idStr,
      name: product.name,
      image: extractProductImage(product),
      price: saleVal ?? basePrice,
      salePrice: saleVal,
      shopName: product.shop?.name || 'Atelier North',
      brandName: product.brand?.name,
    };

    setFavorites((prev) => [newItem, ...prev]);
    return true;
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.filter((item) => String(item.id) !== String(id))
    );
  };

  const addToCart: StorefrontCartFavContextValue['addToCart'] = (
    product,
    options
  ) => {
    const idStr = String(product.id);
    const qty = Math.max(1, options?.quantity ?? 1);
    const firstVariant = product.variants?.[0];

    const colorName =
      options?.colorName ?? firstVariant?.color?.name ?? undefined;
    const colorHex =
      options?.colorHex ?? firstVariant?.color?.hex_code ?? null;
    const sizeName = options?.sizeName ?? firstVariant?.size?.name ?? 'M';

    const resolvedPrice =
      options?.price ??
      Number(
        product.sale_price ??
        firstVariant?.sale_price ??
        product.price ??
        firstVariant?.price ??
        0
      );

    const shopId = String(product.shop?.id ?? 'default-shop');
    const shopName = product.shop?.name || 'ZARA';
    const key = `${idStr}__${colorName ?? ''}__${sizeName ?? ''}`;

    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.key === key);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: copy[idx].quantity + qty,
          selected: true,
        };
        return copy;
      }

      return [
        ...prev,
        {
          key,
          productId: idStr,
          name: product.name,
          image: extractProductImage(product),
          price: resolvedPrice,
          quantity: qty,
          selected: true,
          colorName,
          colorHex,
          sizeName,
          shopId,
          shopName,
        },
      ];
    });
  };

  const updateCartQuantity = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const toggleCartItemSelected = (key: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const removeCartItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearSelectedCartItems = () => {
    setCartItems((prev) => prev.filter((item) => !item.selected));
  };

  const totalBagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favorites));
      window.dispatchEvent(new Event('storefront-cart-fav-updated'));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      window.dispatchEvent(new Event('storefront-cart-fav-updated'));
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [cartItems]);
  return (
    <StorefrontCartFavContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        toggleFavoriteProduct,
        removeFavorite,
        cartItems,
        totalBagCount,
        addToCart,
        updateCartQuantity,
        toggleCartItemSelected,
        removeCartItem,
        clearSelectedCartItems,
      }}
    >
      {children}
    </StorefrontCartFavContext.Provider>
  );
};

export const useStorefrontCartFav = () => {
  const ctx = useContext(StorefrontCartFavContext);
  if (!ctx) {
    throw new Error(
      'useStorefrontCartFav يجب أن يُستخدم داخل StorefrontCartFavProvider'
    );
  }
  return ctx;
};