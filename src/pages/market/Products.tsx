import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  ImagePlus,
  Pencil,
  Eye,
  X,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStatus,
  useArchiveProduct,
} from '../../hooks/market/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrand';
import type { Product, ProductStatus } from '../../services/market/productService';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const colorOptions = ['#d9c98c', '#d8b4e2', '#f59e0b', '#6b1d37', '#2f4f3e'];

const defaultDressImage =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80';

const statusLabels: Record<string, { label: string; badgeClass: string }> = {
  ACTIVE: {
    label: 'نشط',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  DRAFT: {
    label: 'مسودة',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  HIDDEN: {
    label: 'مخفي',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  ARCHIVED: {
    label: 'مؤرشف',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const getProductImages = (product: Product): string[] => {
  if (product.images && product.images.length > 0) {
    return product.images.map((img: any) => img.image).filter(Boolean);
  }
  return [defaultDressImage];
};

const MarketProducts: React.FC = () => {
  // فلاتر البحث والحالة
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useProducts({
    page: 1,
    limit: 20,
    search: search.trim() || undefined,
    status: (statusFilter as ProductStatus) || undefined,
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  const { data: categoriesRes, isLoading: isLoadingCategories } = useCategories();
  const { data: brandsRes, isLoading: isLoadingBrands } = useBrands();

  const categories = categoriesRes?.data ?? [];
  const brands = brandsRes?.data ?? [];

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateStatusMutation = useUpdateProductStatus();
  const archiveProductMutation = useArchiveProduct();

  const products: Product[] = data?.data ?? [];

  // حالات النوافذ المنبثقة (Modals)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // حقول نموذج الإضافة / التعديل
  const fileRef = useRef<HTMLInputElement | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [brandId, setBrandId] = useState<string>('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [status, setStatus] = useState<ProductStatus>('ACTIVE');
  const [quantity, setQuantity] = useState('1');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [selectedColors, setSelectedColors] = useState<string[]>([
    colorOptions[3],
  ]);
  const [images, setImages] = useState<string[]>([defaultDressImage]);
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => String(c.id) === String(categoryId))) {
      setCategoryId(String(categories[0].id));
    }
  }, [categories, categoryId]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '1');
    setBrandId('');
    setPrice('');
    setSalePrice('');
    setStatus('ACTIVE');
    setQuantity('1');
    setSelectedSizes(['M', 'L']);
    setSelectedColors([colorOptions[3]]);
    setImages([defaultDressImage]);
    setActivePreviewIdx(0);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setDescription(product.description || '');
    setCategoryId(
      String(
        product.categoryId ||
        (product as any).category_id ||
        categories[0]?.id ||
        '1'
      )
    );
    const currentBrandId =
      product.brandId ?? (product as any).brand_id ?? '';
    setBrandId(currentBrandId !== null && currentBrandId !== undefined ? String(currentBrandId) : '');
    setPrice(product.price !== undefined ? String(product.price) : '');
    const rawSalePrice =
      product.salePrice !== undefined && product.salePrice !== null
        ? product.salePrice
        : (product as any).sale_price;
    setSalePrice(
      rawSalePrice !== undefined && rawSalePrice !== null
        ? String(rawSalePrice)
        : ''
    );
    setStatus(product.status || 'ACTIVE');
    const totalStock =
      product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) || 1;
    setQuantity(String(totalStock));
    const imgs = getProductImages(product);
    setImages(imgs);
    setActivePreviewIdx(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setEditingProduct(null);
        setViewingProduct(null);
        setDeletingProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((item) => item !== hex) : [...prev, hex]
    );
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImages((prev) => {
          const next = [...prev, reader.result as string];
          setActivePreviewIdx(next.length - 1);
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImageAt = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const safeList = next.length > 0 ? next : [defaultDressImage];
      setActivePreviewIdx(0);
      return safeList;
    });
  };

  const sizeIdMap: Record<string, string> = {
    XS: '1',
    S: '2',
    M: '3',
    L: '4',
    XL: '5',
  };

  const colorIdMap: Record<string, string> = {
    '#d9c98c': '1',
    '#d8b4e2': '2',
    '#f59e0b': '3',
    '#6b1d37': '4',
    '#2f4f3e': '5',
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المنتج');
      return;
    }

    const numericPrice = Number(price) || 0;
    const numericSalePrice =
      salePrice.trim() !== '' && !Number.isNaN(Number(salePrice))
        ? Number(salePrice)
        : null;

    const sourceImages = images.length > 0 ? images : [defaultDressImage];

    const formattedImages = sourceImages.map((img, index) => {
      const safeImagePath = img.startsWith('data:')
        ? '/uploads/product-placeholder.jpg'
        : img;

      return {
        image: safeImagePath,
        isPrimary: index === 0,
        sortOrder: index,
      };
    });

    const activeSizes = selectedSizes.length > 0 ? selectedSizes : ['M'];
    const activeColors =
      selectedColors.length > 0 ? selectedColors : [colorOptions[3]];

    const formattedVariants = activeSizes.map((sizeLabel, idx) => {
      const colorHex = activeColors[idx % activeColors.length];
      const resolvedColorId = colorIdMap[colorHex] ?? '1';
      const resolvedSizeId = sizeIdMap[sizeLabel] ?? '1';

      return {
        colorId: resolvedColorId,
        sizeId: resolvedSizeId,
        price: numericPrice,
        salePrice: numericSalePrice,
        sku: `${name.trim().slice(0, 6).toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-${sizeLabel}-${idx + 1}`,
      };
    });

    try {
      await createProductMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || '',
        categoryId: String(categoryId || '1'),
        brandId: brandId ? String(brandId) : null,
        price: numericPrice,
        salePrice: numericSalePrice,
        status: status || 'DRAFT',
        images: formattedImages,
        variants: formattedVariants,
      });

      toast.success('تم إضافة المنتج بنجاح');
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل إضافة المنتج');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المنتج');
      return;
    }

    const numericPrice = Number(price) || 0;
    const numericSalePrice =
      salePrice.trim() !== '' && !Number.isNaN(Number(salePrice))
        ? Number(salePrice)
        : null;

    try {
      await updateProductMutation.mutateAsync({
        productId: editingProduct.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          categoryId: String(categoryId || editingProduct.categoryId),
          brandId: brandId ? String(brandId) : null,
          price: numericPrice,
          salePrice: numericSalePrice,
        },
      });

      if (status && status !== editingProduct.status) {
        await updateStatusMutation.mutateAsync({
          productId: editingProduct.id,
          data: { status },
        });
      }

      toast.success('تم تحديث بيانات المنتج بنجاح');
      setEditingProduct(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل تحديث المنتج');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await archiveProductMutation.mutateAsync(deletingProduct.id);
      toast.success('تم حذف/أرشفة المنتج بنجاح');
      setDeletingProduct(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف المنتج');
    }
  };

  const renderProductFormFields = (
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    isEdit = false
  ) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-800">
            اسم المنتج *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال : فستان صيفي طويل"
            className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-800">
            الوصف
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ادخل وصف المنتج..."
            className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              التصنيف (Category) *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isLoadingCategories}
              className="w-full px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option value={categoryId || '1'}>
                  {isLoadingCategories ? 'جاري تحميل التصنيفات...' : `تصنيف #${categoryId || '1'}`}
                </option>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              العلامة التجارية (Brand)
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              disabled={isLoadingBrands}
              className="w-full px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            >
              <option value="">
                {isLoadingBrands ? 'جاري تحميل البراند...' : 'بدون علامة تجارية'}
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              السعر
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              سعر الخصم
            </label>
            <input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="اختياري"
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              الحالة
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            >
              <option value="ACTIVE">نشط (ACTIVE)</option>
              <option value="DRAFT">مسودة (DRAFT)</option>
              <option value="HIDDEN">مخفي (HIDDEN)</option>
            </select>
          </div>
        </div>

        {!isEdit && (
          <>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                الكمية المتوفرة
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>

            {/* المقاسات */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                المقاسات
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {sizeOptions.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`min-w-[42px] h-8 px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${active
                        ? 'bg-brand text-white border-brand'
                        : 'bg-surface text-gray-700 border-gray-300 hover:border-brand'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الألوان المتوفرة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800">
                الألوان المتوفرة
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {colorOptions.map((hex) => {
                  const active = selectedColors.includes(hex);
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => toggleColor(hex)}
                      aria-label={`اختيار اللون ${hex}`}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${active ? 'border-gray-900 scale-110' : 'border-gray-300'
                        }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* قسم معاينة الصور */}
      {!isEdit && (
        <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-800">صور المنتج</p>

          <div className="border border-gray-200 rounded-xl p-3 bg-white flex items-center justify-center">
            <img
              crossOrigin="anonymous"
              src={images[activePreviewIdx] ?? defaultDressImage}
              alt="معاينة المنتج"
              className="h-44 object-contain rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {images.map((img, idx) => (
              <div key={`${idx}-${img.slice(0, 18)}`} className="relative group">
                <button
                  type="button"
                  onClick={() => setActivePreviewIdx(idx)}
                  className={`w-14 h-14 rounded-lg border overflow-hidden p-0.5 cursor-pointer ${activePreviewIdx === idx ? 'border-brand' : 'border-gray-200'
                    }`}
                >
                  <img
                    crossOrigin="anonymous"
                    src={img}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    aria-label="حذف الصورة"
                    className="hidden group-hover:flex w-4 h-4 rounded-full bg-rose-600 text-white items-center justify-center text-[10px] absolute -top-1 -right-1 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="إضافة صورة للمنتج"
              className="w-14 h-14 rounded-lg border border-dashed border-gray-400 hover:border-brand text-gray-600 hover:text-brand flex items-center justify-center cursor-pointer"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* الترويسة وزر الإضافة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            إدارة المنتجات
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; المنتجات
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنتج..."
            className="w-full pr-10 pl-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
        >
          <option value="">جميع الحالات</option>
          <option value="ACTIVE">نشط</option>
          <option value="DRAFT">مسودة</option>
          <option value="HIDDEN">مخفي</option>
        </select>
      </div>

      {/* قائمة المنتجات */}
      <div className="space-y-3">
        <h2 className="text-sm md:text-base font-bold text-gray-900">
          المنتجات الحالية ({data?.meta?.total ?? products.length})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-xs md:text-sm">
            {error.message}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-surface border border-gray-200 rounded-2xl p-8 text-center text-xs md:text-sm text-gray-500">
            لا توجد منتجات مطابقة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((prod) => {
              const imgs = getProductImages(prod);
              const badge = statusLabels[prod.status] ?? {
                label: prod.status,
                badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
              };

              return (
                <div
                  key={prod.id}
                  className="bg-surface border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 text-xs flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {prod.name}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badge.badgeClass}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-gray-700 font-semibold">
                      السعر: {prod.price}
                      {prod.salePrice ? (
                        <span className="text-emerald-700 mr-2">
                          (خصم: {prod.salePrice})
                        </span>
                      ) : null}
                    </p>

                    {prod.description && (
                      <p className="text-gray-500 line-clamp-2">
                        {prod.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setViewingProduct(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-brand font-semibold cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingProduct(prod)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  <img
                    crossOrigin="anonymous"
                    src={imgs[0]}
                    alt={prod.name}
                    className="w-20 h-24 rounded-xl object-cover shrink-0 border border-gray-200"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 1. نافذة إضافة منتج جديد                                             */}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-gray-200 rounded-2xl w-full max-w-3xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                إضافة منتج جديد
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {renderProductFormFields(fileRef, false)}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs md:text-sm font-semibold cursor-pointer"
                >
                  {createProductMutation.isPending ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. نافذة تعديل منتج                                                 */}
      {/* ==================================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-gray-200 rounded-2xl w-full max-w-2xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                تعديل المنتج: {editingProduct.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {renderProductFormFields(editFileRef, true)}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={
                    updateProductMutation.isPending ||
                    updateStatusMutation.isPending
                  }
                  className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs md:text-sm font-semibold cursor-pointer"
                >
                  {updateProductMutation.isPending || updateStatusMutation.isPending
                    ? 'جاري التحديث...'
                    : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. نافذة عرض تفاصيل المنتج                                           */}
      {/* ==================================================================== */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-gray-200 rounded-2xl w-full max-w-xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                تفاصيل المنتج
              </h2>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getProductImages(viewingProduct).map((img, i) => (
                  <img
                    crossOrigin="anonymous"
                    key={i}
                    src={img}
                    alt={`${viewingProduct.name} ${i + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-gray-200"
                  />
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {viewingProduct.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">
                    {statusLabels[viewingProduct.status]?.label ??
                      viewingProduct.status}
                  </span>
                </div>

                <p className="text-gray-600">
                  {viewingProduct.description || 'لا يوجد وصف متاح'}
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-gray-800 font-semibold">
                  <span>السعر: {viewingProduct.price}</span>
                  {viewingProduct.salePrice ? (
                    <span className="text-emerald-700">
                      سعر الخصم: {viewingProduct.salePrice}
                    </span>
                  ) : null}
                  <span>التصنيف: #{viewingProduct.categoryId}</span>
                </div>
              </div>

              {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-800">
                    المتغيرات ({viewingProduct.variants.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.variants.map((v) => (
                      <span
                        key={v.id}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
                      >
                        مقاس: {v.sizeId} | لون: {v.colorId} | سعر: {v.price}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const target = viewingProduct;
                  setViewingProduct(null);
                  openEditModal(target);
                }}
                className="px-4 py-2 rounded-lg border border-brand text-brand hover:bg-brand/5 text-xs md:text-sm font-semibold cursor-pointer"
              >
                تعديل المنتج
              </button>
              <button
                type="button"
                onClick={() => setViewingProduct(null)}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs md:text-sm font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. نافذة تأكيد الحذف / الأرشفة                                     */}
      {/* ==================================================================== */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-200 rounded-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  تأكيد حذف المنتج
                </h3>
                <p className="text-xs text-gray-500">
                  هل أنت متأكد من حذف "{deletingProduct.name}"؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={archiveProductMutation.isPending}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs md:text-sm font-semibold cursor-pointer"
              >
                {archiveProductMutation.isPending
                  ? 'جاري الحذف...'
                  : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketProducts;