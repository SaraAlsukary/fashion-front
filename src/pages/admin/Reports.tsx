import React, { useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  Download,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export type ReportType =
  | 'مبيعات'
  | 'متاجر'
  | 'طلبات'
  | 'اشتراكات';

export type ReportStatus = 'جاهز' | 'قيد المعالجة' | 'متأخر';

export interface AdminReportRow {
  id: string;
  title: string;
  type: ReportType;
  customerOrStore: string;
  totalValue: string;
  reportDate: string;
  status: ReportStatus;
}

const initialReports: AdminReportRow[] = [
  {
    id: '1',
    title: 'تقرير المبيعات الأسبوعي',
    type: 'مبيعات',
    customerOrStore: 'سبور شيك',
    totalValue: '5000ل.س.ج',
    reportDate: '22/12/2026',
    status: 'جاهز',
  },
  {
    id: '2',
    title: 'تقرير أداء المتاجر',
    type: 'متاجر',
    customerOrStore: 'محمد محمد',
    totalValue: '12000ل.س.ج',
    reportDate: '22/12/2026',
    status: 'جاهز',
  },
  {
    id: '3',
    title: 'تقرير الطلبات والمدفوعات',
    type: 'طلبات',
    customerOrStore: 'محمد محمد',
    totalValue: '5000ل.س.ج',
    reportDate: '22/12/2026',
    status: 'قيد المعالجة',
  },
  {
    id: '4',
    title: 'تقرير الاشتراكات المنتهية',
    type: 'اشتراكات',
    customerOrStore: 'محمد محمد',
    totalValue: '40000ل.س.ج',
    reportDate: '22/12/2026',
    status: 'متأخر',
  },
];

const statusBadgeClasses: Record<ReportStatus, string> = {
  جاهز: 'bg-emerald-100/90 text-emerald-700',
  'قيد المعالجة': 'bg-amber-100/90 text-amber-700',
  متأخر: 'bg-rose-100/90 text-rose-600',
};

const typeTabs: { key: 'ALL' | ReportType; label: string }[] = [
  { key: 'ALL', label: 'كل التقارير' },
  { key: 'مبيعات', label: 'تقارير المبيعات' },
  { key: 'متاجر', label: 'تقارير المتاجر' },
  { key: 'طلبات', label: 'تقارير الطلبات' },
  { key: 'اشتراكات', label: 'تقارير الاشتراكات' },
];

interface ReportsProps {
  reports?: AdminReportRow[];
  totalCount?: number;
  onViewReport?: (report: AdminReportRow) => void;
  onDownloadReport?: (report: AdminReportRow) => void;
  onDeleteReport?: (report: AdminReportRow) => void;
}

const Reports: React.FC<ReportsProps> = ({
  reports = initialReports,
  totalCount = 17,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
}) => {
  const [rows, setRows] = useState<AdminReportRow[]>(reports);
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | ReportType>('ALL');

  const [customerInput, setCustomerInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [statusInput, setStatusInput] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    customer: '',
    date: '',
    status: '',
  });

  const [activePage, setActivePage] = useState<number>(2);
  const pages = useMemo(() => [1, 2, 3, 10], []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters({
      customer: customerInput.trim().toLowerCase(),
      date: dateInput.trim().toLowerCase(),
      status: statusInput.trim(),
    });
  };

  const filteredReports = useMemo(() => {
    return rows.filter((item) => {
      const matchesTab = activeTypeTab === 'ALL' || item.type === activeTypeTab;
      const matchesCustomer =
        !appliedFilters.customer ||
        item.customerOrStore.toLowerCase().includes(appliedFilters.customer) ||
        item.title.toLowerCase().includes(appliedFilters.customer);
      const matchesDate =
        !appliedFilters.date ||
        item.reportDate.toLowerCase().includes(appliedFilters.date);
      const matchesStatus =
        !appliedFilters.status || item.status === appliedFilters.status;

      return matchesTab && matchesCustomer && matchesDate && matchesStatus;
    });
  }, [rows, activeTypeTab, appliedFilters]);

  const handleDelete = (reportItem: AdminReportRow) => {
    setRows((prev) => prev.filter((item) => item.id !== reportItem.id));
    onDeleteReport?.(reportItem);
  };

  const handleExportCsv = () => {
    const headers = ['العنوان', 'النوع', 'العميل / المتجر', 'القيمة', 'التاريخ', 'الحالة'];
    const csvLines = [
      headers.join(','),
      ...filteredReports.map((r) =>
        [
          `"${r.title}"`,
          `"${r.type}"`,
          `"${r.customerOrStore}"`,
          `"${r.totalValue}"`,
          `"${r.reportDate}"`,
          `"${r.status}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const kpiCards = [
    { label: 'إجمالي التقارير الصادرة', value: '128 تقرير', delta: '+8% مقارنة بالشهر الماضي' },
    { label: 'إجمالي قيمة المبيعات', value: '12000 ل.س.ج', delta: '+6% مقارنة بالشهر الماضي' },
    { label: 'التقارير الجاهزة للتحميل', value: '94 تقرير', delta: '+12% مقارنة بالشهر الماضي' },
    { label: 'التقارير قيد المعالجة', value: '34 تقرير', delta: 'تحديث تلقائي يومي' },
  ];

  return (
    <div className="space-y-4">
      {/* العنوان والمسار وزر التصدير */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            التقارير
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; التقارير
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تصدير CSV</span>
        </button>
      </div>

      {/* بطاقات ملخص التقارير */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-gray-200 rounded-xl p-3.5 space-y-1 shadow-2xs"
          >
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className="text-base md:text-lg font-bold text-gray-900">
              {card.value}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      {/* تبويبات نوع التقرير */}
      <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
        {typeTabs.map((tab) => {
          const isSelected = activeTypeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTypeTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-surface text-gray-700 border-gray-300 hover:border-brand hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* فلاتر البحث */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center gap-2.5"
      >
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            placeholder="البحث عن عميل أو متجر معين"
            className="w-full pr-9 pl-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand"
          />
        </div>

        <input
          type="text"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="تاريخ التقرير"
          className="flex-1 min-w-[140px] px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand"
        />

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            aria-label="حالة التقرير"
            className="w-full appearance-none pr-3 pl-8 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="">حالة التقرير</option>
            <option value="جاهز">جاهز</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="متأخر">متأخر</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>
      </form>

      {/* جدول التقارير */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">تاريخ التقرير</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">القيمة</th>
                <th className="py-3 px-4">التقرير</th>
                <th className="py-3 px-4">العميل / المتجر</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-3 text-gray-800">
                      <button
                        type="button"
                        onClick={() => onViewReport?.(report)}
                        aria-label={`عرض ${report.title}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadReport?.(report)}
                        aria-label={`تحميل ${report.title}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <Download className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(report)}
                        aria-label={`حذف ${report.title}`}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                    {report.reportDate}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block min-w-[74px] px-3 py-1 rounded-md text-xs font-semibold ${
                        statusBadgeClasses[report.status]
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td
                    className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap"
                    dir="ltr"
                  >
                    {report.totalValue}
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-800">
                    {report.title}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                      <span>{report.customerOrStore}</span>
                      <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-sm text-gray-500">
                    لا توجد تقارير مطابقة
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

export default Reports;