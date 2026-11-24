import React, { useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface AdminColorRow {
  id: string;
  name: string;
  hex: string;
  code: string;
  productsCount: number;
}

const initialColors: AdminColorRow[] = [
  {
    id: '1',
    name: 'الاحمر',
    hex: '#ef233c',
    code: '323232342242342',
    productsCount: 45,
  },
  {
    id: '2',
    name: 'الخضر',
    hex: '#1b5e20',
    code: '323232342242342',
    productsCount: 45,
  },
  {
    id: '3',
    name: 'الاصفر',
    hex: '#f5b700',
    code: '323232342242342',
    productsCount: 45,
  },
  {
    id: '4',
    name: 'الابيض',
    hex: '#ffffff',
    code: '323232342242342',
    productsCount: 45,
  },
];

interface ColorsProps {
  colors?: AdminColorRow[];
  totalCount?: number;
  onAddColor?: () => void;
  onViewColor?: (color: AdminColorRow) => void;
  onEditColor?: (color: AdminColorRow) => void;
  onDeleteColor?: (color: AdminColorRow) => void;
}

const Colors: React.FC<ColorsProps> = ({
  colors = initialColors,
  totalCount = 17,
  onAddColor,
  onViewColor,
  onEditColor,
  onDeleteColor,
}) => {
  const [rows, setRows] = useState<AdminColorRow[]>(colors);
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activePage, setActivePage] = useState<number>(6);

  const pages = useMemo(() => [4, 5, 6, 10], []);

  const filteredColors = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        `${item.productsCount} منتج`.includes(q)
    );
  }, [rows, appliedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput);
  };

  const handleDelete = (colorItem: AdminColorRow) => {
    setRows((prev) => prev.filter((item) => item.id !== colorItem.id));
    onDeleteColor?.(colorItem);
  };

  return (
    <div className="space-y-4">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          ادارة الالوان
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; الالوان
        </p>
      </div>

      {/* شريط البحث وزر بحث وزر إضافة لون */}
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
            placeholder="ابحث عن لون مجدد"
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
          onClick={onAddColor}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>اضافة لون</span>
        </button>
      </form>

      {/* جدول الألوان */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">المنتجات باللون الاحمر</th>
                <th className="py-3 px-4">الرمز</th>
                <th className="py-3 px-4">اللون</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {filteredColors.map((colorItem) => (
                <tr
                  key={colorItem.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-3.5 text-gray-800">
                      <button
                        type="button"
                        onClick={() => onViewColor?.(colorItem)}
                        aria-label={`عرض ${colorItem.name}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(colorItem)}
                        aria-label={`حذف ${colorItem.name}`}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditColor?.(colorItem)}
                        aria-label={`تعديل ${colorItem.name}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <SquarePen className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700">
                    {colorItem.productsCount} منتج
                  </td>

                  <td
                    className="py-3 px-4 font-medium text-gray-700"
                    dir="ltr"
                  >
                    {colorItem.code}
                  </td>

                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-2.5 text-gray-800 font-medium">
                      <span>{colorItem.name}</span>
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: colorItem.hex }}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredColors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-sm text-gray-500">
                    لا توجد ألوان مطابقة
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

export default Colors;