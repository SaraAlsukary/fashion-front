import { api } from './api';

export interface ProductCategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBrandInfo {
  id: string;
  name: string;
}

export interface ShopBranchInfo {
  id: string;
  name: string;
  city?: string | null;
  area?: string | null;
  address?: string | null;
  phone?: string | null;
}

export interface ProductShopInfo {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  status?: string;
  branches?: ShopBranchInfo[];
}

export interface ProductImageItem {
  id: string;
  image: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductVariantColor {
  id: string;
  name: string;
  hex_code?: string | null;
}

export interface ProductVariantSize {
  id: string;
  name: string;
  type?: string | null;
}

export interface ProductVariantItem {
  id: string;
  price: string | number;
  sale_price?: string | number | null;
  sku?: string;
  color?: ProductVariantColor | null;
  size?: ProductVariantSize | null;
}

export interface ProductActiveOffer {
  id: string;
  title: string;
  description?: string | null;
  discount_type: 'PERCENTAGE' | 'FIXED' | string;
  discount_value: string | number;
  start_at: string;
  end_at: string;
  shop?: {
    id: string;
    name: string;
  };
}

export interface StorefrontProductDetail {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  sale_price?: string | number | null;
  status?: string;
  created_at?: string;
  category?: ProductCategoryInfo | null;
  brand?: ProductBrandInfo | null;
  shop?: ProductShopInfo | null;
  images?: ProductImageItem[];
  variants?: ProductVariantItem[];
  activeOffers?: ProductActiveOffer[];
}

export interface ProductDetailResponse {
  success?: boolean;
  message?: string;
  data: StorefrontProductDetail;
}

export interface RelatedProductsResponse {
  success?: boolean;
  message?: string;
  data: StorefrontProductDetail[];
}

export const resolveProductMediaUrl = (path?: string | null): string => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const baseURL = (api.defaults.baseURL || '').replace(/\/api\/v1\/?$/i, '');
  if (!baseURL) return trimmed;
  return `${baseURL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export const getUniqueSortedImages = (
  images?: ProductImageItem[]
): ProductImageItem[] => {
  if (!Array.isArray(images) || images.length === 0) return [];

  const sorted = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const seenUrls = new Set<string>();
  const unique: ProductImageItem[] = [];

  for (const img of sorted) {
    const key = (img.image || '').trim();
    if (!key || seenUrls.has(key)) continue;
    seenUrls.add(key);
    unique.push(img);
  }

  return unique;
};

export const productDetailService = {
  getProductById: async (id: string): Promise<ProductDetailResponse> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  getRelatedProducts: async (id: string): Promise<RelatedProductsResponse> => {
    const res = await api.get(`/products/${id}/related`);
    return res.data;
  },
};