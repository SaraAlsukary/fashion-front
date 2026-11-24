import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  MapPin,
  Clock,
  Phone,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeactivateBranch,
  useUpdateBranchStatus,
} from '../../hooks/market/useBranches';
import type { Branch } from '../../services/market/branchService';

const formatBranchAddress = (branch: Branch): string => {
  const parts = [branch.city, branch.area, branch.address]
    .map((v) => v?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(' ، ') : 'غير محدد';
};

const getBranchImage = (branch: Branch): string | null => {
  const raw = (branch as any).imageUrl || (branch as any).image || null;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
};

const Branches: React.FC = () => {
  const { data, isLoading, error } = useBranches();
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deactivateBranchMutation = useDeactivateBranch();
  const updateStatusMutation = useUpdateBranchStatus();

  const branches: Branch[] = data?.data ?? [];

  const [search, setSearch] = useState('');

  // حالات النوافذ المنبثقة (Modals)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // حقول النموذج
  const [name, setName] = useState('');
  const [city, setCity] = useState('حلب');
  const [area, setArea] = useState('الفرقان');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('من 9 الى 12 ليلا');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFormModalOpen(false);
        setEditingBranch(null);
        setDeletingBranch(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => {
      const fullAddress = formatBranchAddress(b).toLowerCase();
      return (
        b.name?.toLowerCase().includes(q) ||
        fullAddress.includes(q) ||
        b.phone?.toLowerCase().includes(q)
      );
    });
  }, [branches, search]);

  const openAddModal = () => {
    setEditingBranch(null);
    setName('');
    setCity('حلب');
    setArea('الفرقان');
    setAddress('');
    setPhone('');
    setHours('من 9 الى 12 ليلا');
    setIsFormModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name || '');
    setCity(branch.city || 'حلب');
    setArea(branch.area || '');
    setAddress(branch.address || '');
    setPhone(branch.phone || '');
    setHours('من 9 الى 12 ليلا');
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingBranch(null);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم الفرع');
      return;
    }

    const payload = {
      name: name.trim(),
      city: city.trim() || undefined,
      area: area.trim() || undefined,
      address: address.trim() || hours.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    try {
      if (editingBranch) {
        await updateBranchMutation.mutateAsync({
          branchId: editingBranch.id,
          data: payload,
        });
        toast.success('تم تعديل بيانات الفرع');
      } else {
        await createBranchMutation.mutateAsync(payload);
        toast.success('تمت إضافة الفرع بنجاح');
      }

      closeFormModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر حفظ بيانات الفرع');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBranch) return;
    try {
      await deactivateBranchMutation.mutateAsync(deletingBranch.id);
      toast.success('تم إلغاء تفعيل / حذف الفرع');
      setDeletingBranch(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر حذف الفرع');
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    const nextStatus = branch.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    try {
      await updateStatusMutation.mutateAsync({
        branchId: branch.id,
        data: { status: nextStatus },
      });
      toast.success(
        nextStatus === 'ACTIVE' ? 'تم تفعيل الفرع' : 'تم تعطيل الفرع'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر تحديث حالة الفرع');
    }
  };

  const isSaving =
    createBranchMutation.isPending || updateBranchMutation.isPending;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">الفروع</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; الفروع
        </p>
      </div>

      {/* البحث وأزرار التحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن الفروع....."
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-gray-200/80 border border-transparent rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-brand focus:bg-surface transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>اضافة فرع</span>
        </button>
      </div>

      {/* حالات التحميل والخطأ والبيانات الفارغة */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
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
      ) : filteredBranches.length === 0 ? (
        <div className="bg-surface border border-gray-200 rounded-2xl p-8 text-center text-xs md:text-sm text-gray-500">
          لا توجد فروع مطابقة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredBranches.map((branch) => {
            const isInactive = branch.status === 'INACTIVE';
            const branchImage = getBranchImage(branch);

            return (
              <div
                key={branch.id}
                className="bg-surface border border-gray-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col sm:flex-row"
              >
                {branchImage && (
                  <img
                    src={branchImage}
                    alt={branch.name}
                    className="w-full sm:w-44 h-44 sm:h-auto object-cover shrink-0"
                  />
                )}

                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        {branch.name}
                      </h2>
                      {branch.status && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(branch)}
                          disabled={updateStatusMutation.isPending}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer ${
                            isInactive
                              ? 'bg-gray-100 text-gray-600 border-gray-300'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isInactive ? 'غير نشط' : 'نشط'}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{formatBranchAddress(branch)}</span>
                    </p>

                    {branch.phone && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span dir="ltr">{branch.phone}</span>
                      </p>
                    )}

                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span>{hours}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openEditModal(branch)}
                      className="px-4 py-1.5 rounded-lg bg-brand-soft text-brand hover:bg-brand hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <SquarePen className="w-3.5 h-3.5" />
                      <span>تعديل الفرع</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingBranch(branch)}
                      disabled={deactivateBranchMutation.isPending}
                      className="px-4 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف الفرع</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* نافذة منبثقة: إضافة / تعديل فرع                                    */}
      {/* ==================================================================== */}
      {isFormModalOpen && (
        <div
          onClick={closeFormModal}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-gray-200 rounded-2xl w-full max-w-lg p-5 space-y-4 my-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900">
                {editingBranch
                  ? `تعديل الفرع: ${editingBranch.name}`
                  : 'إضافة فرع جديد'}
              </h2>
              <button
                type="button"
                onClick={closeFormModal}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800">
                  اسم الفرع *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الفرع الرئيسي"
                  className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="المدينة"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    المنطقة / الحي
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="المنطقة / الحي"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-800">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع رئيسي، بناء رقم 12"
                  className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-800">
                    أوقات العمل
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="أوقات العمل"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs md:text-sm font-semibold cursor-pointer"
                >
                  {isSaving
                    ? 'جاري الحفظ...'
                    : editingBranch
                    ? 'حفظ التعديلات'
                    : 'إضافة الفرع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* نافذة منبثقة: تأكيد حذف / إلغاء تفعيل فرع                            */}
      {/* ==================================================================== */}
      {deletingBranch && (
        <div
          onClick={() => setDeletingBranch(null)}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-gray-200 rounded-2xl w-full max-w-md p-5 space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  تأكيد حذف الفرع
                </h3>
                <p className="text-xs text-gray-500">
                  هل أنت متأكد من حذف الفرع "{deletingBranch.name}"؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deactivateBranchMutation.isPending}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs md:text-sm font-semibold cursor-pointer"
              >
                {deactivateBranchMutation.isPending
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

export default Branches;