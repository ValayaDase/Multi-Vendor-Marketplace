import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./AuthContext";

import AuthLayout from "./authentication/AuthLayout";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import ForgotPassword from "./authentication/ForgotPassword";
import ResetPassword from "./authentication/ResetPassword";
import VerifyOtp from "./authentication/VerifyOtp";

// BUYER IMPORTS
import BuyerLayout from "./dashboard/buyer/BuyerLayout";
import BuyersDashboard from "./dashboard/buyer/BuyersDashboard";
import ProductsPage from "./dashboard/buyer/ProductsPage";
import ProductDetails from "./dashboard/buyer/ProductDetails";
import SavedProducts from "./dashboard/buyer/SavedProducts";
import PurchasedOrders from "./dashboard/buyer/PurchasedOrders";
import CartPage from "./dashboard/buyer/CartPage";
import Checkout from "./payment/Checkout";

// ADMIN
// import AdminDashboard from "./dashboard/admin/AdminDashboard";
import AdminLayout from "./dashboard/admin/AdminLayout";
import SellersPage from "./dashboard/admin/SellersPage";
import OrdersPage from "./dashboard/admin/OrdersPage";
import SellerRequests from "./dashboard/admin/SellerRequests";
import Dashboard from "./dashboard/admin/Dashboard";
import ApprovalQueue from "./dashboard/admin/ApprovalQueue";

// SELLER
import SellerDashboard from "./dashboard/seller/SellerDashboard";
import SellerLayout from "./dashboard/seller/SellerLayout";
import MyProducts from "./dashboard/seller/MyProducts";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* DEFAULT LANDING PAGE */}
          <Route path="/" element={<BuyerLayout />}>
            <Route index element={<BuyersDashboard />} />
          </Route>

          {/* AUTH PAGES — use AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* BUYER ROUTES */}
          <Route path="/buyer" element={<BuyerLayout />}>
            <Route index element={<BuyersDashboard />} />

            {/* View All Products */}
            <Route path="all" element={<ProductsPage />} />

            {/* Category Filtering */}
            <Route path="category/:name" element={<ProductsPage />} />

            {/* Saved + Purchased */}
            <Route path="saved" element={<SavedProducts />} />
            <Route path="purchased" element={<PurchasedOrders />} />
            <Route path="cart" element={<CartPage />} />

            {/* Product Details */}
            <Route path="product/:id" element={<ProductDetails />} />

            <Route path="/buyer/checkout" element={<Checkout />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sellers" element={<SellersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="requests" element={<SellerRequests />} />
            <Route path="approval-queue" element={<ApprovalQueue />} />
          </Route>

          {/* SELLER */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<MyProducts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
