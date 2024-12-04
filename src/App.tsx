import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthGuard } from './components/auth/AuthGuard';
import { useStore } from './lib/store';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Rentals = React.lazy(() => import('./pages/Rentals'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Login = React.lazy(() => import('./pages/Login'));

function App() {
  const currentUser = useStore((state) => state.currentUser);
  const initAuth = useStore((state) => state.initAuth);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    initAuth().then(() => setIsInitialized(true));
  }, [initAuth]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <React.Suspense fallback={<div>Loading...</div>}>
                <Login />
              </React.Suspense>
            )
          }
        />

        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Dashboard />
              </React.Suspense>
            }
          />
          <Route
            path="products"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Products />
              </React.Suspense>
            }
          />
          <Route
            path="customers"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Customers />
              </React.Suspense>
            }
          />
          <Route
            path="rentals"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Rentals />
              </React.Suspense>
            }
          />
          <Route
            path="reports"
            element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <Reports />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;