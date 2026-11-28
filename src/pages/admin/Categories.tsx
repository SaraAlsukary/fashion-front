import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  Search,
  FolderTree,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import { CategoryServiceProvider, useCategory } from '../../hooks/admin/useCategory';
import {
  type CategoryEntity,
  slugifyCategoryName,
} from '../../services/admin/categoryService';

export interface AdminCategoryRow {
  id: string;
  parentId: string | null;
  parentName: string | null;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  productsCount: number;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toCategoryRow(cat: CategoryEntity): AdminCategoryRow {
  return {
    id: cat.id,
    parentId: cat.parentId,
    parentName: cat.parent?.name ?? null,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    isActive: cat.isActive,
    productsCount: cat.counts?.products ?? 0,
    childrenCount: cat.counts?.children ?? 0,
    createdAt: formatDate(cat.createdAt),
    updatedAt: formatDate(cat.updatedAt),
  };
}

interface CategoriesContentProps {
  searchQuery?: string;
}

const CategoriesContent: React.FC<CategoriesContentProps> = ({ searchQuery = '' }) => {
  const {
    categories,
    page,
    total,
    totalPages,
    search,
    loading,
    mutating,
    error,
    setPage,
    setSearch,
    refetch,
    fetchCategoryDetails,
    createCategory,
    updateCategory,
    setCategoryStatus,
    deleteCategory,
  } = useCategory();

  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [feedback, setFeedback] = useState<string | null>(null);

  // نافذة العرض
  const [viewingCategory, setViewingCategory] = useState<AdminCategoryRow | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // نافذة الإضافة والتعديل
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [slugInput, setSlugInput] = useState<string>('');
  const [slugTouched, setSlugTouched] = useState<boolean>(false);
  const [parentIdInput, setParentIdInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState<boolean>(false);
  const [statusInput, setStatusInput] = useState<1 | 0>(1);

  // نافذة تأكيد الحذف
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryRow | null>(null);

  useEffect(() => {
    setSearchInput(searchQuery);
    setSearch(searchQuery);
    setPage(1);
  }, [searchQuery, setSearch, setPage]);

  useEffect(() => {
    if (!selectedFile) return;
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const rows = useMemo<AdminCategoryRow[]>(
    () => categories.map(toCategoryRow),
    [categories]
  );

  const pages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, page, Math.min(totalPages, page + 1), totalPages]);
    return Array.from(set)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const resetFormModal = () => {
    setFormMode(null);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveImageFlag(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setEditingId(null);
    setNameInput('');
    setSlugInput('');
    setSlugTouched(false);
    setParentIdInput('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveImageFlag(false);
    setStatusInput(1);
    setFeedback(null);
  };

  const openEditModal = (row: AdminCategoryRow) => {
    setFormMode('edit');
    setEditingId(row.id);
    setNameInput(row.name);
    setSlugInput(row.slug);
    setSlugTouched(true);
    setParentIdInput(row.parentId ?? '');
    setSelectedFile(null);
    setPreviewUrl(row.image);
    setRemoveImageFlag(false);
    setStatusInput(row.isActive ? 1 : 0);
    setFeedback(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setSelectedFile(file);
    setRemoveImageFlag(false);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveImageFlag(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNameChange = (value: string) => {
    setNameInput(value);
    if (!slugTouched) {
      setSlugInput(slugifyCategoryName(value));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    const computedSlug =
      slugInput.trim() || slugifyCategoryName(trimmedName) || `category-${Date.now()}`;

    try {
      if (formMode === 'create') {
        await createCategory({
          name: trimmedName,
          slug: computedSlug,
          parentId: parentIdInput || null,
          image: selectedFile,
          status: statusInput,
        });
        setFeedback(`تمت إضافة الفئة "${trimmedName}" بنجاح`);
      } else if (formMode === 'edit' && editingId) {
        const currentRow = rows.find((r) => r.id === editingId);
        const prevStatus: 1 | 0 = currentRow?.isActive ? 1 : 0;

        await updateCategory(editingId, {
          name: trimmedName,
          slug: computedSlug,
          parentId: parentIdInput || null,
          image: selectedFile ?? undefined,
          removeImage: !selectedFile && removeImageFlag,
        });

        if (prevStatus !== statusInput) {
          await setCategoryStatus(editingId, statusInput);
        }

        if (viewingCategory?.id === editingId) {
          const fresh = await fetchCategoryDetails(editingId);
          setViewingCategory(toCategoryRow(fresh));
        }
        setFeedback(`تم تحديث الفئة "${trimmedName}" بنجاح`);
      }
      resetFormModal();
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  const handleViewCategory = async (row: AdminCategoryRow) => {
    setViewingCategory(row);
    setLoadingDetails(true);
    try {
      const fresh = await fetchCategoryDetails(row.id);
      setViewingCategory(toCategoryRow(fresh));
    } catch {
      // الإبقاء على بيانات الصف الحالية
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (row: AdminCategoryRow) => {
    const nextStatus: 1 | 0 = row.isActive ? 0 : 1;
    try {
      await setCategoryStatus(row.id, nextStatus);
      setFeedback(
        nextStatus === 1
          ? `تم تفعيل الفئة "${row.name}"`
          : `تم تعطيل الفئة "${row.name}"`
      );
      if (viewingCategory?.id === row.id) {
        const fresh = await fetchCategoryDetails(row.id);
        setViewingCategory(toCategoryRow(fresh));
      }
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      setFeedback(`تم حذف الفئة "${deletingCategory.name}"`);
      if (viewingCategory?.id === deletingCategory.id) {
        setViewingCategory(null);
      }
      setDeletingCategory(null);
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  const availableParentOptions = useMemo(
    () => rows.filter((item) => item.id !== editingId),
    [rows, editingId]
  );

  return (
    <div className="space-y-4">
      {/* العنوان والمسار وأزرار التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">ادارة الفئات</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">الرئيسية &lt; الفئات</p>
        </div>

        <button
          type="button"
          disabled={loading || mutating}
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-surface text-xs font-medium text-gray-700 hover:border-brand hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* شريط البحث وزر بحث وزر إضافة فئة */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-center gap-3 pt-0.5"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (!val.trim() && search) {
                setSearch('');
                setPage(1);
              }
            }}
            placeholder="البحث عن الفئة"
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || mutating}
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold disabled:opacity-50 transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>

        <button
          type="button"
          disabled={mutating}
          onClick={openCreateModal}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>اضافة فئة</span>
        </button>
      </form>

      {feedback && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs md:text-sm text-emerald-800">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs md:text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* جدول الفئات */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الفئة الأم</th>
                <th className="py-3 px-4">عدد المنتجات</th>
                <th className="py-3 px-4">الفئة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    جارٍ تحميل الفئات...
                  </td>
                </tr>
              ) : (
                rows.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-surface/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-2.5 text-gray-800 flex-wrap">
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => void handleToggleStatus(category)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer ${category.isActive
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                        >
                          {category.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>

                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => void handleViewCategory(category)}
                          aria-label={`عرض ${category.name}`}
                          className="hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>

                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => setDeletingCategory(category)}
                          aria-label={`حذف ${category.name}`}
                          className="hover:text-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>

                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => openEditModal(category)}
                          aria-label={`تعديل ${category.name}`}
                          className="hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <SquarePen className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block min-w-[68px] px-3 py-1 rounded-md text-xs font-semibold ${category.isActive
                          ? 'bg-emerald-100/90 text-emerald-700'
                          : 'bg-rose-100/90 text-rose-600'
                          }`}
                      >
                        {category.isActive ? 'نشطة' : 'معطلة'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-gray-700">
                      {category.parentName || 'رئيسية'}
                    </td>

                    <td className="py-3 px-4 font-medium text-gray-700">
                      {category.productsCount} منتج
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                        {category.image ? (
                          <img
                            crossOrigin="anonymous"
                            src={category.image}
                            alt={category.name}
                            className="w-6 h-6 rounded-full object-cover border border-gray-300 shrink-0"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-gray-400 inline-flex items-center justify-center shrink-0">
                            <FolderTree className="w-3 h-3 text-gray-600" />
                          </span>
                        )}
                        <span>{category.name}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    لا توجد فئات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* شريط الترقيم السفلي */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs md:text-sm text-gray-700">
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {pages.map((p) => {
            const isCurrent = page === p;
            return (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${isCurrent
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-gray-800 border-gray-300 hover:border-brand'
                  }`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage(Math.max(1, page - 1))}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {rows.length} من {total || rows.length}
        </div>
      </div>

      {/* نافذة إضافة / تعديل الفئة */}
      {formMode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void handleFormSubmit(e)}
            className="bg-surface rounded-xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-base font-bold text-gray-900">
                {formMode === 'create' ? 'إضافة فئة جديدة' : 'تعديل الفئة'}
              </h2>
              <button
                type="button"
                onClick={resetFormModal}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">اسم الفئة</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثال: Women Fashion"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الرابط المختصر (Slug)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={slugInput}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlugInput(e.target.value);
                  }}
                  placeholder="women-fashion"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الفئة الأم</label>
                <select
                  value={parentIdInput}
                  onChange={(e) => setParentIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                >
                  <option value="">بدون (فئة رئيسية)</option>
                  {availableParentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* رفع الصورة من الجهاز */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">صورة الفئة</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={mutating}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-surface hover:border-brand hover:text-brand text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{previewUrl ? 'تغيير الصورة من الجهاز' : 'اختيار صورة من الجهاز'}</span>
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      disabled={mutating}
                      onClick={handleClearImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>إزالة الصورة</span>
                    </button>
                  )}
                </div>

                {selectedFile && (
                  <p className="text-[11px] text-gray-500 mt-1" dir="ltr">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}

                {previewUrl && (
                  <div className="mt-2">
                    <img
                      crossOrigin="anonymous"
                      src={previewUrl}
                      alt="معاينة صورة الفئة"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 bg-gray-100"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الحالة</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(Number(e.target.value) === 0 ? 0 : 1)}
                  className="w-full px-3 py-1.5 bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                >
                  <option value={1}>نشطة (1)</option>
                  <option value={0}>معطلة (0)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={mutating}
                onClick={resetFormModal}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={mutating}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحفظ...' : formMode === 'create' ? 'إضافة' : 'حفظ التعديل'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نافذة تفاصيل الفئة */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-md w-full p-5 space-y-3.5 text-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-base font-bold text-gray-900">
                تفاصيل الفئة: {viewingCategory.name}
              </h2>
              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails && (
              <p className="text-xs text-gray-500">جارٍ تحديث بيانات الفئة...</p>
            )}

            {viewingCategory.image && (
              <img
                crossOrigin="anonymous"
                src={viewingCategory.image}
                alt={viewingCategory.name}
                className="w-full h-36 object-cover rounded-lg border border-gray-200 bg-gray-100"
              />
            )}

            <div className="space-y-1.5 text-xs md:text-sm text-gray-700">
              <p>
                <span className="font-semibold">المعرف:</span> {viewingCategory.id}
              </p>
              <p>
                <span className="font-semibold">الاسم:</span> {viewingCategory.name}
              </p>
              <p>
                <span className="font-semibold">الرابط المختصر (Slug):</span>{' '}
                <span dir="ltr">{viewingCategory.slug || '—'}</span>
              </p>
              <p>
                <span className="font-semibold">الفئة الأم:</span>{' '}
                {viewingCategory.parentName || 'رئيسية'}
              </p>
              <p>
                <span className="font-semibold">الحالة:</span>{' '}
                {viewingCategory.isActive ? 'نشطة' : 'معطلة'}
              </p>
              <p>
                <span className="font-semibold">عدد المنتجات:</span>{' '}
                {viewingCategory.productsCount} منتج
              </p>
              <p>
                <span className="font-semibold">الفئات الفرعية:</span>{' '}
                {viewingCategory.childrenCount}
              </p>
              <p>
                <span className="font-semibold">تاريخ الإنشاء:</span> {viewingCategory.createdAt}
              </p>
              <p>
                <span className="font-semibold">آخر تحديث:</span> {viewingCategory.updatedAt}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={mutating}
                  onClick={() => openEditModal(viewingCategory)}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold cursor-pointer"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  disabled={mutating}
                  onClick={() => void handleToggleStatus(viewingCategory)}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold cursor-pointer"
                >
                  {viewingCategory.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد حذف الفئة */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 text-right">
            <h2 className="text-base font-bold text-gray-900">تأكيد حذف الفئة</h2>
            <p className="text-xs md:text-sm text-gray-700">
              هل أنت متأكد من حذف الفئة{' '}
              <span className="font-semibold">"{deletingCategory.name}"</span>؟
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoriesProps {
  searchQuery?: string;
}

const Categories: React.FC<CategoriesProps> = ({ searchQuery = '' }) => {
  return (
    <CategoryServiceProvider>
      <CategoriesContent searchQuery={searchQuery} />
    </CategoryServiceProvider>
  );
};

export default Categories;