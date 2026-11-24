import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import MarketLayout from './layout/MarketLayout';
import { StorefrontCartFavProvider } from './context/StorefrontCartFavContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

const LoginLayout = lazy(() => import('./layout/LoginLayout'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));
const MainLayout = lazy(() => import('./layout/MainLayout'));

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Products = lazy(() => import('./pages/Products'));
const CreateShop = lazy(() => import('./pages/market/CreateShop'));

// Admin
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const Markets = lazy(() => import('./pages/admin/Markets'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Brands = lazy(() => import('./pages/admin/Brands'));
const Colors = lazy(() => import('./pages/admin/Colors'));
const Sizes = lazy(() => import('./pages/admin/Sizes'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const Subscriptions = lazy(() => import('./pages/admin/Subscriptions'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const StorefrontHome = lazy(() => import('./pages/Home'));
const StorefrontFavorites = lazy(() => import('./pages/Favorites'));
const StorefrontCart = lazy(() => import('./pages/Cart'));

// Market
const MarketReviews = lazy(() => import('./pages/market/Reviews'));
const Market = lazy(() => import('./pages/market/Market'));
const MarketSettings = lazy(() => import('./pages/market/Settings'));
const MarketBranches = lazy(() => import('./pages/market/Branches'));
const MarketOffers = lazy(() => import('./pages/market/Offers'));
const MarketOrders = lazy(() => import('./pages/market/Orders'));
const MarketProducts = lazy(() => import('./pages/market/Products'));
const MarketSubscriptions = lazy(() => import('./pages/market/Subscriptions'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[300px] w-full">
    <svg
      className="animate-spin h-10 w-10 text-brand"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
);

const WithSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <WithSuspense>
        <LoginLayout>
          <Login />
        </LoginLayout>
      </WithSuspense>
    ),
  },

  // داخل مصفوفة createBrowserRouter:
  {
    path: '/',
    element: (
      <WithSuspense>
        <MainLayout />
      </WithSuspense>
    ),
    children: [{
      index: true,
      element: <StorefrontHome />
    }, {
      path: 'products',
      element: (
        <WithSuspense>
          <Products />
        </WithSuspense>
      ),
    }, {
      path: 'products/:id',
      element: <ProductDetails />
    },
    // داخل createBrowserRouter تحت MainLayout:
    {
      path: 'favorites',
      element: (
        <WithSuspense>
          <StorefrontFavorites />
        </WithSuspense>
      ),
    },
    {
      path: 'cart',
      element: (
        <WithSuspense>
          <StorefrontCart />
        </WithSuspense>
      ),
    },]
  },
  {
    path: '/signup',
    element: (
      <WithSuspense>
        <LoginLayout>
          <Register />
        </LoginLayout>
      </WithSuspense>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <WithSuspense>
        <LoginLayout>
          <VerifyEmail />
        </LoginLayout>
      </WithSuspense>
    ),
  },
  {
    path: '/create-shop',
    element: (
      <WithSuspense>
        <LoginLayout>
          <CreateShop />
        </LoginLayout>
      </WithSuspense>
    ),
  },
  {
    path: '/market',
    element: (
      <ProtectedRoute allowedRoles={['SHOP_OWNER']} fallback={<PageLoader />}>
        <WithSuspense>
          <MarketLayout />
        </WithSuspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <Market />
          </WithSuspense>
        ),
      },
      {
        path: 'reviews',
        element: (
          <WithSuspense>
            <MarketReviews />
          </WithSuspense>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <WithSuspense>
            <MarketSubscriptions />
          </WithSuspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <WithSuspense>
            <MarketSettings />
          </WithSuspense>
        ),
      },
      {
        path: 'branches',
        element: (
          <WithSuspense>
            <MarketBranches />
          </WithSuspense>
        ),
      },
      {
        path: 'products',
        element: (
          <WithSuspense>
            <MarketProducts />
          </WithSuspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <WithSuspense>
            <MarketOrders />
          </WithSuspense>
        ),
      },
      {
        path: 'offers',
        element: (
          <WithSuspense>
            <MarketOffers />
          </WithSuspense>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']} fallback={<PageLoader />}>
        <WithSuspense>
          <AdminLayout />
        </WithSuspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <WithSuspense>
            <Dashboard />
          </WithSuspense>
        ),
      },
      {
        path: 'users',
        element: (
          <WithSuspense>
            <Users />
          </WithSuspense>
        ),
      },
      {
        path: 'markets',
        element: (
          <WithSuspense>
            <Markets />
          </WithSuspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <WithSuspense>
            <Orders />
          </WithSuspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <WithSuspense>
            <Categories />
          </WithSuspense>
        ),
      },
      {
        path: 'brands',
        element: (
          <WithSuspense>
            <Brands />
          </WithSuspense>
        ),
      },
      {
        path: 'colors',
        element: (
          <WithSuspense>
            <Colors />
          </WithSuspense>
        ),
      },
      {
        path: 'sizes',
        element: (
          <WithSuspense>
            <Sizes />
          </WithSuspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <WithSuspense>
            <Reports />
          </WithSuspense>
        ),
      },
      {
        path: 'subscriptions',
        element: (
          <WithSuspense>
            <Subscriptions />
          </WithSuspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <WithSuspense>
            <Settings />
          </WithSuspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <WithSuspense>
        <LoginLayout>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-brand mb-4">
              الصفحة غير موجودة 404
            </h2>
            <Link
              to="/"
              className="inline-block py-3 px-8 bg-brand text-white rounded-full hover:bg-brand-dark transition-all"
            >
              العودة للرئيسية
            </Link>
          </div>
        </LoginLayout>
      </WithSuspense>
    ),
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StorefrontCartFavProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" reverseOrder={false} />
        </StorefrontCartFavProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;