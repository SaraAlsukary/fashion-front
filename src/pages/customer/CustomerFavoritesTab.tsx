import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useStorefrontCartFav } from '../../context/StorefrontCartFavContext';

const CustomerFavoritesTab: React.FC = () => {
    const navigate = useNavigate();
    const { favorites, removeFavorite, addToCart } = useStorefrontCartFav();

    const handleMoveToCart = (
        item: (typeof favorites)[number],
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        addToCart(
            {
                id: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                shop: { id: item.id, name: item.shopName || 'المتجر' },
            },
            { quantity: 1, price: item.price }
        );
        toast.success('تمت إضافة المنتج إلى السلة');
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFavorite(id);
        toast.success('تمت الإزالة من المفضلة');
    };

    return (
        <div className="space-y-6">
            {/* رأس التاب */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-brand text-brand" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-brand-ink">
                            قائمة المفضلة ({favorites.length})
                        </h2>
                        <p className="text-xs text-gray-500">
                            المنتجات المحفوظة للرجوع إليها أو نقلها إلى السلة
                        </p>
                    </div>
                </div>

                <Link
                    to="/products"
                    className="text-xs sm:text-sm font-semibold text-brand hover:underline"
                >
                    تصفح المنتجات
                </Link>
            </div>

            {/* حالة المفضلة الفارغة */}
            {favorites.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
                        <Heart className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-brand-ink">
                            قائمة المفضلة فارغة حالياً
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                            اضغطي على أيقونة القلب في المنتجات لحفظ ما يعجبك هنا.
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs sm:text-sm font-bold shadow-sm transition-all"
                    >
                        <span>تسوق الآن</span>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                /* شبكة بطاقات المفضلة */
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                    {favorites.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/products/${item.id}`)}
                            className="group relative rounded-2xl bg-brand text-surface p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] text-white/85 truncate">
                                    {item.shopName || 'المتجر'}
                                </span>

                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(item.id, e)}
                                    aria-label={`إزالة ${item.name} من المفضلة`}
                                    className="w-7 h-7 rounded-lg border border-surface/40 bg-surface/15 hover:bg-rose-600/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-surface" />
                                </button>
                            </div>

                            <div className="my-2.5 h-28 sm:h-32 rounded-xl overflow-hidden bg-surface/5">
                                <img
                                    crossOrigin="anonymous"
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="space-y-2 pt-1">
                                <p className="text-xs sm:text-sm font-semibold text-surface truncate">
                                    {item.name}
                                </p>

                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className="text-xs sm:text-sm font-bold text-surface"
                                        dir="ltr"
                                    >
                                        {item.price}$
                                    </span>

                                    <button
                                        type="button"
                                        onClick={(e) => handleMoveToCart(item, e)}
                                        className="px-2.5 py-1 rounded-full bg-surface text-brand hover:bg-brand-neutral/40 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>للسلة</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerFavoritesTab;