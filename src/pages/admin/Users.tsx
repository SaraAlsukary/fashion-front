import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { type AdminUserEntity } from '../../services/admin/AdminService';

export type DisplayUserStatus = 'نشط' | 'محظور / غير نشط';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roleRaw: string;
  roleLabel: string;
  statusRaw: string;
  statusLabel: DisplayUserStatus;
  createdAt: string;
  emailVerifiedAt: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'مدير النظام',
  SHOP_OWNER: 'صاحب متجر',
  CUSTOMER: 'عميل',
};

function formatRole(role: string): string {
  const upper = role.trim().toUpperCase();
  return ROLE_LABELS[upper] || role;
}

function formatStatus(status: string): DisplayUserStatus {
  const upper = status.trim().toUpperCase();
  if (upper === 'ACTIVE') return 'نشط';
  return 'محظور / غير نشط';
}

function formatDate(raw: string): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toRow(u: AdminUserEntity): AdminUserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    roleRaw: u.role,
    roleLabel: formatRole(u.role),
    statusRaw: u.status,
    statusLabel: formatStatus(u.status),
    createdAt: formatDate(u.createdAt),
    emailVerifiedAt: u.emailVerifiedAt,
  };
}

interface UsersProps {
  searchQuery?: string;
}

const Users: React.FC<UsersProps> = ({ searchQuery = '' }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<number>(1);
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // نوافذ العمليات
  const [viewingUser, setViewingUser] = useState<AdminUserRow | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState<boolean>(false);

  // حقول التعديل
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('CUSTOMER');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
    setActivePage(1);
  }, [searchQuery]);

  const effectiveSearch = (localSearch || searchQuery).trim();

  const {
    users: rawUsers,
    total,
    totalPages,
    loading,
    mutating,
    error,
    refetch,
    fetchUserDetails,
    updateUser,
    changeUserStatus,
    changeUserRole,
    removeUser,
    removeUsersBatch,
  } = useAdminUsers({
    page: activePage,
    limit: 10,
    search: effectiveSearch,
    role: roleFilter,
    status: statusFilter,
  });

  const rows = useMemo<AdminUserRow[]>(() => rawUsers.map(toRow), [rawUsers]);

  const pages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, activePage, Math.min(totalPages, activePage + 1), totalPages]);
    return Array.from(set)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, activePage]);

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenView = async (row: AdminUserRow) => {
    setViewingUser(row);
    try {
      const fresh = await fetchUserDetails(row.id);
      setViewingUser(toRow(fresh));
    } catch {
      // الإبقاء على بيانات الصف الحالية إذا فشل الجلب الفردي
    }
  };

  const handleOpenEdit = (row: AdminUserRow) => {
    setEditingUser(row);
    setEditName(row.name);
    setEditPhone(row.phone ?? '');
    setEditRole(row.roleRaw || 'CUSTOMER');
    setEditStatus(row.statusRaw || 'ACTIVE');
    setActionFeedback(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const trimmedName = editName.trim();
      const trimmedPhone = editPhone.trim();

      if (trimmedName !== editingUser.name || trimmedPhone !== (editingUser.phone ?? '')) {
        await updateUser(editingUser.id, {
          name: trimmedName || editingUser.name,
          phone: trimmedPhone ? trimmedPhone : null,
        });
      }

      if (editRole && editRole !== editingUser.roleRaw) {
        await changeUserRole(editingUser.id, editRole);
      }

      if (editStatus && editStatus !== editingUser.statusRaw) {
        await changeUserStatus(editingUser.id, editStatus);
      }

      setActionFeedback('تم حفظ تعديلات المستخدم بنجاح');
      setEditingUser(null);
    } catch {
      // الخطأ معروض بالفعل عبر hook
    }
  };

  const handleQuickToggleStatus = async (row: AdminUserRow) => {
    const nextStatus = row.statusRaw.toUpperCase() === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await changeUserStatus(row.id, nextStatus);
      setActionFeedback(
        nextStatus === 'ACTIVE' ? `تم تفعيل المستخدم ${row.name}` : `تم حظر المستخدم ${row.name}`
      );
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await removeUser(deletingUser.id);
      setSelectedIds((prev) => prev.filter((id) => id !== deletingUser.id));
      setActionFeedback(`تم حذف المستخدم ${deletingUser.name}`);
      setDeletingUser(null);
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  const handleConfirmBatchDelete = async () => {
    try {
      await removeUsersBatch(selectedIds);
      setActionFeedback(`تم حذف ${selectedIds.length} مستخدمين`);
      setSelectedIds([]);
      setConfirmBatchDelete(false);
    } catch {
      // الخطأ معروض عبر hook
    }
  };

  return (
    <div className="space-y-5">
      {/* العنوان والمسار */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">ادارة مستخدمين</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">الرئيسية &lt; المستخدمون</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              disabled={mutating}
              onClick={() => setConfirmBatchDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف المحدد ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            disabled={loading || mutating}
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-surface text-xs font-medium text-gray-700 hover:border-brand hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-wrap items-center gap-3 bg-surface border border-gray-200 rounded-xl p-3">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            setActivePage(1);
          }}
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setActivePage(1);
          }}
          aria-label="فلترة حسب الدور"
          className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg bg-surface focus:outline-none focus:border-brand"
        >
          <option value="">كل الأدوار</option>
          <option value="ADMIN">مدير النظام (ADMIN)</option>
          <option value="SHOP_OWNER">صاحب متجر (SHOP_OWNER)</option>
          <option value="CUSTOMER">عميل (CUSTOMER)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setActivePage(1);
          }}
          aria-label="فلترة حسب الحالة"
          className="px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg bg-surface focus:outline-none focus:border-brand"
        >
          <option value="">كل الحالات</option>
          <option value="ACTIVE">نشط (ACTIVE)</option>
          <option value="BLOCKED">محظور (BLOCKED)</option>
        </select>
      </div>

      {actionFeedback && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs md:text-sm text-emerald-800">
          <span>{actionFeedback}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            aria-label="إغلاق التنبيه"
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

      {/* جدول المستخدمين */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">التعديلات</th>
                <th className="py-3 px-4">تاريخ الانشاء</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">الدور</th>
                <th className="py-3 px-4">البريد الالكتروني</th>
                <th className="py-3 px-4">الاسم</th>
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="تحديد جميع المستخدمين"
                    className="w-4 h-4 rounded border-gray-400 accent-brand cursor-pointer align-middle"
                  />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-sm text-gray-500">
                    جارٍ تحميل المستخدمين...
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isChecked = selectedIds.includes(row.id);
                  const isActive = row.statusRaw.toUpperCase() === 'ACTIVE';
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${isChecked ? 'bg-brand-soft/40' : 'hover:bg-surface/80'
                        }`}
                    >
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center justify-center gap-3 text-gray-800">
                          <button
                            type="button"
                            disabled={mutating}
                            onClick={() => void handleOpenView(row)}
                            aria-label={`عرض ${row.name}`}
                            className="hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <Eye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            type="button"
                            disabled={mutating}
                            onClick={() => setDeletingUser(row)}
                            aria-label={`حذف ${row.name}`}
                            className="hover:text-rose-600 disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            type="button"
                            disabled={mutating}
                            onClick={() => handleOpenEdit(row)}
                            aria-label={`تعديل ${row.name}`}
                            className="hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <SquarePen className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-gray-700">{row.createdAt}</td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={mutating}
                          onClick={() => void handleQuickToggleStatus(row)}
                          title="انقر لتبديل الحالة"
                          className={`inline-block min-w-[64px] px-3 py-1 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-50 ${isActive
                              ? 'bg-emerald-100/90 text-emerald-700'
                              : 'bg-rose-100/90 text-rose-600'
                            }`}
                        >
                          {row.statusLabel}
                        </button>
                      </td>

                      <td className="py-3 px-4 font-medium text-gray-800">{row.roleLabel}</td>

                      <td className="py-3 px-4 font-medium text-gray-700" dir="ltr">
                        {row.email}
                      </td>

                      <td className="py-3 px-4">
                        <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                          <span>{row.name}</span>
                          <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                            <User className="w-3 h-3 text-gray-600" />
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(row.id)}
                          aria-label={`تحديد ${row.name}`}
                          className="w-4 h-4 rounded border-gray-400 accent-brand cursor-pointer align-middle"
                        />
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-sm text-gray-500">
                    لا توجد نتائج مطابقة
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
            disabled={activePage >= totalPages || loading}
            onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {pages.map((page) => {
            const isCurrent = activePage === page;
            return (
              <button
                key={page}
                type="button"
                disabled={loading}
                onClick={() => setActivePage(page)}
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${isCurrent
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
            disabled={activePage <= 1 || loading}
            onClick={() => setActivePage((p) => Math.max(1, p - 1))}
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

      {/* نافذة معاينة المستخدم */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-md w-full p-5 space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-base font-bold text-gray-900">تفاصيل المستخدم</h2>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs md:text-sm text-gray-700">
              <p><span className="font-semibold">المعرف:</span> {viewingUser.id}</p>
              <p><span className="font-semibold">الاسم:</span> {viewingUser.name}</p>
              <p><span className="font-semibold">البريد الإلكتروني:</span> <span dir="ltr">{viewingUser.email}</span></p>
              <p><span className="font-semibold">الهاتف:</span> <span dir="ltr">{viewingUser.phone || 'غير متوفر'}</span></p>
              <p><span className="font-semibold">الدور:</span> {viewingUser.roleLabel} ({viewingUser.roleRaw})</p>
              <p><span className="font-semibold">الحالة:</span> {viewingUser.statusLabel} ({viewingUser.statusRaw})</p>
              <p><span className="font-semibold">تاريخ الإنشاء:</span> {viewingUser.createdAt}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل المستخدم والدور والحالة */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void handleSaveEdit(e)}
            className="bg-surface rounded-xl border border-gray-200 max-w-md w-full p-5 space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-base font-bold text-gray-900">تعديل المستخدم: {editingUser.name}</h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+963..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الدور</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-surface focus:outline-none focus:border-brand"
                >
                  <option value="CUSTOMER">عميل (CUSTOMER)</option>
                  <option value="SHOP_OWNER">صاحب متجر (SHOP_OWNER)</option>
                  <option value="ADMIN">مدير النظام (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الحالة</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-surface focus:outline-none focus:border-brand"
                >
                  <option value="ACTIVE">نشط (ACTIVE)</option>
                  <option value="BLOCKED">محظور (BLOCKED)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setEditingUser(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={mutating}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نافذة تأكيد حذف مستخدم */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 text-right">
            <h2 className="text-base font-bold text-gray-900">تأكيد الحذف</h2>
            <p className="text-xs md:text-sm text-gray-600">
              هل أنت متأكد من حذف المستخدم <span className="font-bold text-gray-900">{deletingUser.name}</span>؟
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setDeletingUser(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={() => void handleConfirmDelete()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف الجماعي */}
      {confirmBatchDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 text-right">
            <h2 className="text-base font-bold text-gray-900">تأكيد حذف المحددين</h2>
            <p className="text-xs md:text-sm text-gray-600">
              هل أنت متأكد من حذف <span className="font-bold text-gray-900">{selectedIds.length}</span> مستخدمين محددين؟
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setConfirmBatchDelete(false)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={mutating}
                onClick={() => void handleConfirmBatchDelete()}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحذف...' : 'حذف الكل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;