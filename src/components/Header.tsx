import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Heart,
    ShoppingBag,
    Search,
    SlidersHorizontal,
    ChevronDown,
    Check,
} from 'lucide-react';
import type { HomeCategory } from '../services/homeService';

export interface StorefrontHeaderProps {
    locationLabel?: string;
    onToggleLocation?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    categories?: HomeCategory[];
    selectedCategorySlug?: string;
    onSelectCategory?: (slug: string) => void;
    selectedSize?: string;
    onSelectSize?: (size: string) => void;
    priceSort?: 'none' | 'asc' | 'desc';
    onChangePriceSort?: (sort: 'none' | 'asc' | 'desc') => void;
    favoriteCount?: number;
    bagCount?: number;
}

const categoryArabicLabels: Record<string, string> = {
    women: 'نسائي',
    men: 'رجالي',
    dresses: 'فساتين',
    bags: 'حقائب',
    shoes: 'أحذية',
    accessories: 'إكسسوارات',
    jackets: 'جاكيتات',
    casual: 'كاجوال',
    formal: 'رسمي',
};

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
    locationLabel = 'حلب، الفرقان',
    onToggleLocation,
    searchQuery = '',
    onSearchChange,
    categories = [],
    selectedCategorySlug = '',
    onSelectCategory,
    selectedSize = '',
    onSelectSize,
    priceSort = 'none',
    onChangePriceSort,
    favoriteCount = 0,
    bagCount = 0,
}) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [filterOpen, setFilterOpen] = useState(false);

    const handleLocationClick = () => {
        if (onToggleLocation) {
            onToggleLocation();
        }
    };

    return (
        <header className="relative bg-gradient-to-b from-brand-plum to-brand-rose text-surface pt-4 pb-10 px-4 md:px-10">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* الصف العلوي: الموقع + روابط سطح المكتب + أيقونات المفضلة والسلة */}
                <div className="flex items-center justify-between gap-3">
                    {/* الموقع */}
                    <button
                        type="button"
                        onClick={handleLocationClick}
                        className="text-right group cursor-pointer"
                    >
                        <span className="text-[11px] text-surface/80 flex items-center gap-1">
                            <span>Location</span>
                            <ChevronDown className="w-3 h-3" />
                        </span>
                        <span className="text-xs md:text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-4 h-4 text-surface shrink-0" />
                            <span>{locationLabel}</span>
                        </span>
                    </button>

                    {/* روابط التنقل لسطح المكتب */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-surface/95">
                        <Link
                            to="/home"
                            className={
                                pathname === '/home' || pathname === '/'
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            الرئيسية
                        </Link>
                        <Link
                            to="/shops"
                            className={
                                pathname.startsWith('/shops')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            المتاجر
                        </Link>
                        <Link
                            to="/products"
                            className={
                                pathname.startsWith('/products')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            المنتجات
                        </Link>
                        <Link
                            to="/offers"
                            className={
                                pathname.startsWith('/offers')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            العروض
                        </Link>
                    </nav>

                    {/* أيقونات القلب والسلة */}
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => navigate('/favorites')}
                            aria-label="المفضلة"
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/90 hover:bg-surface text-brand-rose shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                        >
                            <Heart className="w-4 h-4 md:w-5 md:h-5 fill-brand-rose/20" />
                            {favoriteCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
                                    {favoriteCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/cart')}
                            aria-label="السلة"
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/90 hover:bg-surface text-brand-rose shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                        >
                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                            {bagCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
                                    {bagCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* شريط البحث + زر الفلتر المنسدل */}
                {onSearchChange && (
                    <div className="relative max-w-2xl mx-auto flex items-center gap-2.5">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="ابحث عن ملابس، أحذية، حقائب....."
                                className="w-full h-10 md:h-11 pr-4 pl-10 rounded-lg bg-surface/25 backdrop-blur-xs text-surface placeholder-surface/85 text-xs md:text-sm border border-surface/20 focus:outline-none focus:bg-surface/30"
                            />
                            <Search className="w-4 h-4 md:w-5 md:h-5 text-surface absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {onSelectCategory && onSelectSize && onChangePriceSort && (
                            <button
                                type="button"
                                onClick={() => setFilterOpen((prev) => !prev)}
                                aria-label="تصفية النتائج"
                                className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-surface/25 hover:bg-surface/35 border border-surface/20 shadow-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            >
                                <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-surface" />
                            </button>
                        )}

                        {filterOpen && onSelectCategory && onSelectSize && onChangePriceSort && (
                            <div className="absolute left-0 top-12 z-40 w-72 sm:w-80 bg-surface text-brand-charcoal rounded-2xl shadow-xl border border-brand-neutral/60 p-4 space-y-3.5">
                                {categories.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-brand-ink">نوع الثياب</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {categories.slice(0, 6).map((cat) => {
                                                const active = selectedCategorySlug === cat.slug;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() =>
                                                            onSelectCategory(active ? '' : cat.slug)
                                                        }
                                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${active
                                                                ? 'bg-brand text-surface'
                                                                : 'bg-surface-muted text-brand-charcoal hover:bg-brand-neutral/60'
                                                            }`}
                                                    >
                                                        {categoryArabicLabels[cat.slug] ?? cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-brand-ink">الحجم</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
                                            const active = selectedSize === sz;
                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => onSelectSize(active ? '' : sz)}
                                                    className={`py-1 rounded border text-[11px] font-semibold cursor-pointer ${active
                                                            ? 'bg-brand text-surface border-brand'
                                                            : 'border-brand-neutral text-brand-charcoal hover:border-brand'
                                                        }`}
                                                >
                                                    {sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-brand-ink">السعر</p>
                                    <div className="space-y-1.5 text-xs">
                                        {[
                                            { code: 'desc', label: 'من الأغلى للأرخص' },
                                            { code: 'asc', label: 'من الأرخص للأغلى' },
                                        ].map((opt) => {
                                            const checked = priceSort === opt.code;
                                            return (
                                                <button
                                                    key={opt.code}
                                                    type="button"
                                                    onClick={() =>
                                                        onChangePriceSort(
                                                            checked ? 'none' : (opt.code as 'asc' | 'desc')
                                                        )
                                                    }
                                                    className="w-full px-3 py-1.5 rounded-lg border border-brand-neutral flex items-center justify-between text-brand-charcoal hover:border-brand cursor-pointer"
                                                >
                                                    <span>{opt.label}</span>
                                                    <span
                                                        className={`w-4 h-4 rounded flex items-center justify-center border ${checked
                                                                ? 'bg-brand border-brand text-surface'
                                                                : 'border-brand-neutral'
                                                            }`}
                                                    >
                                                        {checked && <Check className="w-3 h-3" />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* القوس السفلي للهيدر */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -bottom-px h-6 bg-surface"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
            />
        </header>
    );
};

export default StorefrontHeader;