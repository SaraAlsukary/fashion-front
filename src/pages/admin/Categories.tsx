import React, { useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  Search,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface AdminCategoryRow {
  id: string;
  name: string;
  productsCount: number;
}

const initialCategories: AdminCategoryRow[] = [
  {
    id: '1',
    name: 'البسة نسائية',
    productsCount: 15,
  },
  {
    id: '2',
    name: 'البسة رجالية',
    productsCount: 15,
  },
  {
    id: '3',
    name: 'احذية',
    productsCount: 15,
  },
  {
    id: '4',
    name: 'حقائب',
    productsCount: 15,
  },
];

interface CategoriesProps {
  categories?: AdminCategoryRow[];
  totalCount?: number;
  onAddCategory?: () => void;
  onViewCategory?: (category: AdminCategoryRow) => void;
  onEditCategory?: (category: AdminCategoryRow) => void;
  onDeleteCategory?: (category: AdminCategoryRow) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  categories = initialCategories,
  totalCount = 17,
  onAddCategory,
  onViewCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [rows, setRows] = useState<AdminCategoryRow[]>(categories);
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activePage, setActivePage] = useState<number>(4);

  const pages = useMemo(() => [2, 3, 4, 10], []);

  const filteredCategories = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        `${item.productsCount} منتج`.includes(q)
    );
  }, [rows, appliedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput);
  };

  const handleDelete = (category: AdminCategoryRow) => {
    setRows((prev) => prev.filter((item) => item.id !== category.id));
    onDeleteCategory?.(category);
  };

  return (
    <div className="space-y-4">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          ادارة الفئات
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; الفئات
        </p>
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
              setSearchInput(e.target.value);
              if (!e.target.value.trim()) {
                setAppliedQuery('');
              }
            }}
            placeholder="البحث عن الفئة"
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>

        <button
          type="button"
          onClick={onAddCategory}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>اضافة فئة</span>
        </button>
      </form>

      {/* جدول الفئات */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">عدد المنتجات</th>
                <th className="py-3 px-4">الفئة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-3.5 text-gray-800">
                      <button
                        type="button"
                        onClick={() => onViewCategory?.(category)}
                        aria-label={`عرض ${category.name}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        aria-label={`حذف ${category.name}`}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditCategory?.(category)}
                        aria-label={`تعديل ${category.name}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <SquarePen className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700">
                    {category.productsCount} منتج
                  </td>

                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                      <span>{category.name}</span>
                      <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-sm text-gray-500">
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
            onClick={() => setActivePage((p) => Math.min(10, p + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {pages.map((page) => {
            const isCurrent = activePage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page)}
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-gray-800 border-gray-300 hover:border-brand'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {activePage} من {totalCount}
        </div>
      </div>
    </div>
  );
};

export default Categories;