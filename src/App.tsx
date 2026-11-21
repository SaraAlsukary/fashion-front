import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إعداد React Query
const queryClient = new QueryClient();

// التحميل الكسول (Lazy Loading) للمكونات والصفحات
const LoginLayout = lazy(() => import('./layout/LoginLayout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Admin = lazy(() => import('./pages/Admin'));
const Market = lazy(() => import('./pages/Market'));

// مكون التحميل المؤقت (Spinner) يتماشى مع ألوان التطبيق
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full">
    <svg className="animate-spin h-10 w-10 text-[#6b1d37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginLayout>
          <Suspense fallback={<PageLoader />}>
            <Login />
          </Suspense>
        </LoginLayout>
      </Suspense>
    ),
  },
  {
    path: '/signup',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginLayout>
          <Suspense fallback={<PageLoader />}>
            <Register />
          </Suspense>
        </LoginLayout>
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginLayout>
          <Suspense fallback={<PageLoader />}>
            <Admin />
          </Suspense>
        </LoginLayout>
      </Suspense>
    ),
  },
    {
    path: '/market',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginLayout>
          <Suspense fallback={<PageLoader />}>
            <Market />
          </Suspense>
        </LoginLayout>
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginLayout>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-[#6b1d37] mb-4">الصفحة غير موجودة 404</h2>
            <a href="/" className="inline-block py-3 px-8 bg-[#6b1d37] text-white rounded-full hover:bg-[#52162a] transition-all">
              العودة للرئيسية
            </a>
          </div>
        </LoginLayout>
      </Suspense>
    ),
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;