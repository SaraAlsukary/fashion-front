import React, { useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type UserStatus = 'نشط' | 'غير نشط';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

const initialUsers: AdminUserRow[] = [
  {
    id: '1',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    role: 'المدير',
    status: 'نشط',
    createdAt: '22/12/2026',
  },
  {
    id: '2',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    role: 'المدير',
    status: 'نشط',
    createdAt: '22/12/2026',
  },
  {
    id: '3',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    role: 'المدير',
    status: 'نشط',
    createdAt: '22/12/2026',
  },
  {
    id: '4',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    role: 'المدير',
    status: 'غير نشط',
    createdAt: '22/12/2026',
  },
];

const statusBadgeClasses: Record<UserStatus, string> = {
  نشط: 'bg-emerald-100/90 text-emerald-700',
  'غير نشط': 'bg-rose-100/90 text-rose-600',
};

interface UsersProps {
  users?: AdminUserRow[];
  totalCount?: number;
  searchQuery?: string;
  onViewUser?: (user: AdminUserRow) => void;
  onEditUser?: (user: AdminUserRow) => void;
  onDeleteUser?: (user: AdminUserRow) => void;
}

const Users: React.FC<UsersProps> = ({
  users = initialUsers,
  totalCount = 17,
  searchQuery = '',
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePage, setActivePage] = useState<number>(2);

  const pages = useMemo(() => [1, 2, 3, 10], []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.includes(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          ادارة مستخدمين
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; المستخدمون
        </p>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[720px]">
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
              {filteredUsers.map((row) => {
                const isChecked = selectedIds.includes(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isChecked ? 'bg-brand-soft/40' : 'hover:bg-surface/80'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-3 text-gray-800">
                        <button
                          type="button"
                          onClick={() => onViewUser?.(row)}
                          aria-label={`عرض ${row.name}`}
                          className="hover:text-brand transition-colors cursor-pointer"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser?.(row)}
                          aria-label={`حذف ${row.name}`}
                          className="hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditUser?.(row)}
                          aria-label={`تعديل ${row.name}`}
                          className="hover:text-brand transition-colors cursor-pointer"
                        >
                          <SquarePen className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-gray-700">
                      {row.createdAt}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block min-w-[64px] px-3 py-1 rounded-md text-xs font-semibold ${
                          statusBadgeClasses[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-gray-800">
                      {row.role}
                    </td>

                    <td
                      className="py-3 px-4 font-medium text-gray-700"
                      dir="ltr"
                    >
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
              })}

              {filteredUsers.length === 0 && (
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

export default Users;