import React, { useEffect, useRef, useState } from 'react';

export interface CategoryChipItem {
  id: string;
  name: string;
}

interface AutoCategoriesBarProps {
  categories: CategoryChipItem[];
  selectedCategoryId: string; // 'all' أو id التصنيف
  onSelectCategory: (categoryId: string) => void;
  autoScroll?: boolean;
  scrollSpeed?: number; // بكسل لكل خطوة
  intervalMs?: number; // الفاصل الزمني بالمللي ثانية
}

const AutoCategoriesBar: React.FC<AutoCategoriesBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  autoScroll = true,
  scrollSpeed = 1,
  intervalMs = 25,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // تكرار القائمة لإنشاء حركة دائرية سلسة عند وجود تصنيفات
  const items: CategoryChipItem[] = [
    { id: 'all', name: 'الكل' },
    ...categories,
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!autoScroll || isPaused || !container || categories.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!container) return;

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (maxScrollLeft <= 0) return;

      // في الاتجاه RTL قد تكون scrollLeft سالبة أو موجبة حسب المتصفح
      const isRtlNegative = container.scrollLeft < 0;
      const currentPos = Math.abs(container.scrollLeft);

      if (currentPos >= maxScrollLeft - 1) {
        container.scrollLeft = 0;
      } else {
        const nextPos = currentPos + scrollSpeed;
        container.scrollLeft = isRtlNegative ? -nextPos : nextPos;
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [autoScroll, isPaused, categories.length, scrollSpeed, intervalMs]);

  return (
    <div
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full"
    >
      <div
        ref={scrollContainerRef}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1.5 scroll-smooth"
      >
        {items.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategory(cat.id);
                setIsPaused(true);
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#6b1d37] text-white border-[#6b1d37] shadow-xs'
                  : 'bg-surface text-gray-700 border-gray-300 hover:border-[#6b1d37]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AutoCategoriesBar;