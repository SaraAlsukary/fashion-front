import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Eye,
    Trash2,
    SquarePen,
    Search,
    Tag,
    Plus,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Upload,
    X,
} from 'lucide-react';
import { BrandServiceProvider, useBrand } from '../../hooks/admin/useBrand';
import { type BrandEntity } from '../../services/admin/brandService';

export interface AdminBrandRow {
    id: string;
    name: string;
    logo: string | null;
    isActive: boolean;
    productsCount: number;
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

function toBrandRow(brand: BrandEntity): AdminBrandRow {
    return {
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        isActive: brand.isActive,
        productsCount: brand.counts?.products ?? 0,
        createdAt: formatDate(brand.createdAt),
        updatedAt: formatDate(brand.updatedAt),
    };
}

interface BrandsContentProps {
    searchQuery?: string;
}

const BrandsContent: React.FC<BrandsContentProps> = ({ searchQuery = '' }) => {
    const {
        brands,
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
        fetchBrandDetails,
        createBrand,
        updateBrand,
        setBrandStatus,
        deleteBrand,
    } = useBrand();

    const [searchInput, setSearchInput] = useState<string>(searchQuery);
    const [feedback, setFeedback] = useState<string | null>(null);

    // نافذة العرض
    const [viewingBrand, setViewingBrand] = useState<AdminBrandRow | null>(null);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

    // نافذة الإضافة والتعديل
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [removeLogoFlag, setRemoveLogoFlag] = useState<boolean>(false);
    const [statusInput, setStatusInput] = useState<1 | 0>(1);

    // نافذة تأكيد الحذف
    const [deletingBrand, setDeletingBrand] = useState<AdminBrandRow | null>(null);

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

    const rows = useMemo<AdminBrandRow[]>(
        () => brands.map(toBrandRow),
        [brands]
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
        setRemoveLogoFlag(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openCreateModal = () => {
        setFormMode('create');
        setEditingId(null);
        setNameInput('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setRemoveLogoFlag(false);
        setStatusInput(1);
        setFeedback(null);
    };

    const openEditModal = (row: AdminBrandRow) => {
        setFormMode('edit');
        setEditingId(row.id);
        setNameInput(row.name);
        setSelectedFile(null);
        setPreviewUrl(row.logo);
        setRemoveLogoFlag(false);
        setStatusInput(row.isActive ? 1 : 0);
        setFeedback(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setSelectedFile(file);
        setRemoveLogoFlag(false);
    };

    const handleClearLogo = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setRemoveLogoFlag(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = nameInput.trim();
        if (!trimmedName) return;

        try {
            if (formMode === 'create') {
                await createBrand({
                    name: trimmedName,
                    logo: selectedFile,
                    status: statusInput,
                });
                setFeedback(`تمت إضافة العلامة التجارية "${trimmedName}" بنجاح`);
            } else if (formMode === 'edit' && editingId) {
                const currentRow = rows.find((r) => r.id === editingId);
                const prevStatus: 1 | 0 = currentRow?.isActive ? 1 : 0;

                await updateBrand(editingId, {
                    name: trimmedName,
                    logo: selectedFile ?? undefined,
                    removeLogo: !selectedFile && removeLogoFlag,
                });

                if (prevStatus !== statusInput) {
                    await setBrandStatus(editingId, statusInput);
                }

                if (viewingBrand?.id === editingId) {
                    const fresh = await fetchBrandDetails(editingId);
                    setViewingBrand(toBrandRow(fresh));
                }
                setFeedback(`تم تحديث العلامة التجارية "${trimmedName}" بنجاح`);
            }
            resetFormModal();
        } catch {
            // الخطأ معروض عبر hook
        }
    };

    const handleViewBrand = async (row: AdminBrandRow) => {
        setViewingBrand(row);
        setLoadingDetails(true);
        try {
            const fresh = await fetchBrandDetails(row.id);
            setViewingBrand(toBrandRow(fresh));
        } catch {
            // الإبقاء على بيانات الصف الحالية
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleToggleStatus = async (row: AdminBrandRow) => {
        const nextStatus: 1 | 0 = row.isActive ? 0 : 1;
        try {
            await setBrandStatus(row.id, nextStatus);
            setFeedback(
                nextStatus === 1
                    ? `تم تفعيل العلامة التجارية "${row.name}"`
                    : `تم تعطيل العلامة التجارية "${row.name}"`
            );
            if (viewingBrand?.id === row.id) {
                const fresh = await fetchBrandDetails(row.id);
                setViewingBrand(toBrandRow(fresh));
            }
        } catch {
            // الخطأ معروض عبر hook
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingBrand) return;
        try {
            await deleteBrand(deletingBrand.id);
            setFeedback(`تم حذف العلامة التجارية "${deletingBrand.name}"`);
            if (viewingBrand?.id === deletingBrand.id) {
                setViewingBrand(null);
            }
            setDeletingBrand(null);
        } catch {
            // الخطأ معروض عبر hook
        }
    };

    return (
        <div className="space-y-4">
            {/* العنوان والمسار وأزرار التحكم */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">
                        ادارة العلامات التجارية
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                        الرئيسية &lt; العلامات التجارية
                    </p>
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

            {/* شريط البحث وزر بحث وزر إضافة علامة تجارية */}
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
                        placeholder="البحث عن العلامة التجارية"
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
                    <span>اضافة علامة تجارية</span>
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

            {/* جدول العلامات التجارية */}
            <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse min-w-[680px]">
                        <thead>
                            <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                                <th className="py-3 px-4">العمليات</th>
                                <th className="py-3 px-4">الحالة</th>
                                <th className="py-3 px-4">عدد المنتجات</th>
                                <th className="py-3 px-4">العلامة التجارية</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-sm text-gray-500">
                                        جارٍ تحميل العلامات التجارية...
                                    </td>
                                </tr>
                            ) : (
                                rows.map((brandItem) => (
                                    <tr
                                        key={brandItem.id}
                                        className="hover:bg-surface/80 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="inline-flex items-center justify-center gap-2.5 text-gray-800 flex-wrap">
                                                <button
                                                    type="button"
                                                    disabled={mutating}
                                                    onClick={() => void handleToggleStatus(brandItem)}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer ${
                                                        brandItem.isActive
                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    }`}
                                                >
                                                    {brandItem.isActive ? 'تعطيل' : 'تفعيل'}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={mutating}
                                                    onClick={() => void handleViewBrand(brandItem)}
                                                    aria-label={`عرض ${brandItem.name}`}
                                                    className="hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
                                                >
                                                    <Eye className="w-[18px] h-[18px]" />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={mutating}
                                                    onClick={() => setDeletingBrand(brandItem)}
                                                    aria-label={`حذف ${brandItem.name}`}
                                                    className="hover:text-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-[18px] h-[18px]" />
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={mutating}
                                                    onClick={() => openEditModal(brandItem)}
                                                    aria-label={`تعديل ${brandItem.name}`}
                                                    className="hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
                                                >
                                                    <SquarePen className="w-[18px] h-[18px]" />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block min-w-[68px] px-3 py-1 rounded-md text-xs font-semibold ${
                                                    brandItem.isActive
                                                        ? 'bg-emerald-100/90 text-emerald-700'
                                                        : 'bg-rose-100/90 text-rose-600'
                                                }`}
                                            >
                                                {brandItem.isActive ? 'نشطة' : 'معطلة'}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 font-medium text-gray-700">
                                            {brandItem.productsCount} منتج
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                                                {brandItem.logo ? (
                                                    <img
                                                        src={brandItem.logo}
                                                        alt={brandItem.name}
                                                        className="w-6 h-6 rounded-full object-cover border border-gray-300 shrink-0"
                                                    />
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                                                        <Tag className="w-3 h-3 text-gray-600" />
                                                    </span>
                                                )}
                                                <span>{brandItem.name}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}

                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-sm text-gray-500">
                                        لا توجد علامات تجارية مطابقة
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
                                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                                    isCurrent
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

            {/* نافذة إضافة / تعديل العلامة التجارية */}
            {formMode && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <form
                        onSubmit={(e) => void handleFormSubmit(e)}
                        className="bg-surface rounded-xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 text-right"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h2 className="text-base font-bold text-gray-900">
                                {formMode === 'create' ? 'إضافة علامة تجارية' : 'تعديل العلامة التجارية'}
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
                                <label className="block font-semibold text-gray-700 mb-1">
                                    اسم العلامة التجارية
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="مثال: Zara"
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                                />
                            </div>

                            {/* رفع الشعار من الجهاز */}
                            <div>
                                <label className="block font-semibold text-gray-700 mb-1">
                                    شعار العلامة التجارية
                                </label>
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
                                        <span>
                                            {previewUrl ? 'تغيير الشعار من الجهاز' : 'اختيار شعار من الجهاز'}
                                        </span>
                                    </button>

                                    {previewUrl && (
                                        <button
                                            type="button"
                                            disabled={mutating}
                                            onClick={handleClearLogo}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>إزالة الشعار</span>
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
                                            src={previewUrl}
                                            alt="معاينة شعار العلامة التجارية"
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

            {/* نافذة تفاصيل العلامة التجارية */}
            {viewingBrand && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-xl border border-gray-200 max-w-md w-full p-5 space-y-3.5 text-right">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h2 className="text-base font-bold text-gray-900">
                                تفاصيل العلامة التجارية: {viewingBrand.name}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setViewingBrand(null)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {loadingDetails && (
                            <p className="text-xs text-gray-500">جارٍ تحديث بيانات العلامة التجارية...</p>
                        )}

                        {viewingBrand.logo && (
                            <img
                                src={viewingBrand.logo}
                                alt={viewingBrand.name}
                                className="w-full h-36 object-cover rounded-lg border border-gray-200 bg-gray-100"
                            />
                        )}

                        <div className="space-y-1.5 text-xs md:text-sm text-gray-700">
                            <p>
                                <span className="font-semibold">المعرف:</span> {viewingBrand.id}
                            </p>
                            <p>
                                <span className="font-semibold">الاسم:</span> {viewingBrand.name}
                            </p>
                            <p>
                                <span className="font-semibold">الحالة:</span>{' '}
                                {viewingBrand.isActive ? 'نشطة' : 'معطلة'}
                            </p>
                            <p>
                                <span className="font-semibold">عدد المنتجات:</span>{' '}
                                {viewingBrand.productsCount} منتج
                            </p>
                            <p>
                                <span className="font-semibold">تاريخ الإنشاء:</span> {viewingBrand.createdAt}
                            </p>
                            <p>
                                <span className="font-semibold">آخر تحديث:</span> {viewingBrand.updatedAt}
                            </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={mutating}
                                    onClick={() => openEditModal(viewingBrand)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold cursor-pointer"
                                >
                                    تعديل
                                </button>
                                <button
                                    type="button"
                                    disabled={mutating}
                                    onClick={() => void handleToggleStatus(viewingBrand)}
                                    className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold cursor-pointer"
                                >
                                    {viewingBrand.isActive ? 'تعطيل' : 'تفعيل'}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewingBrand(null)}
                                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* نافذة تأكيد حذف العلامة التجارية */}
            {deletingBrand && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 text-right">
                        <h2 className="text-base font-bold text-gray-900">تأكيد حذف العلامة التجارية</h2>
                        <p className="text-xs md:text-sm text-gray-700">
                            هل أنت متأكد من حذف العلامة التجارية{' '}
                            <span className="font-semibold">"{deletingBrand.name}"</span>؟
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                disabled={mutating}
                                onClick={() => setDeletingBrand(null)}
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

interface BrandsProps {
    searchQuery?: string;
}

const Brands: React.FC<BrandsProps> = ({ searchQuery = '' }) => {
    return (
        <BrandServiceProvider>
            <BrandsContent searchQuery={searchQuery} />
        </BrandServiceProvider>
    );
};

export default Brands;