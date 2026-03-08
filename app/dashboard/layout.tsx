"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">Vendor Dashboard</div>

        <nav className="sidebar-nav">

          {/* Dashboard */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard">
              <span className="sidebar-icon"><FaHome /></span>
              Dashboard
            </Link>
          </div>

          {/* Orders */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard/orders">
              <span className="sidebar-icon"><FaShoppingCart /></span>
              Orders
            </Link>
          </div>

          {/* PRODUCTS WITH SUBMENU */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard/products">
              <span className="sidebar-icon"><FaBox /></span>
              Products
            </Link>

            {/* SUBMENU */}
            <div className="submenu">
              <Link href="/dashboard/products">All Products</Link>
              <Link href="/dashboard/products/add">Add New Product</Link>
              <Link href="/dashboard/products/brands">Brands</Link>
              <Link href="/dashboard/products/categories">Categories</Link>
              <Link href="/dashboard/products/tags">Tags</Link>
              <Link href="/dashboard/products/attributes">Attributes</Link>
              <Link href="/dashboard/products/reviews">Reviews</Link>
            </div>
          </div>

          {/* Customers */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard/customers">
              <span className="sidebar-icon"><FaUsers /></span>
              Customers
            </Link>
          </div>

          {/* ❌ REMOVED VENDORS TAB */}
          {/* <div className="sidebar-nav-item">
            <Link href="/dashboard/vendors">
              <span className="sidebar-icon"><FaUsers /></span>
              Vendors
            </Link>
          </div> */}

          {/* Analytics */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard/analytics">
              <span className="sidebar-icon"><FaChartBar /></span>
              Analytics
            </Link>
          </div>

          {/* Settings */}
          <div className="sidebar-nav-item">
            <Link href="/dashboard/settings">
              <span className="sidebar-icon"><FaCog /></span>
              Settings
            </Link>
          </div>

        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => router.push("/logout")}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="dashboard-content">{children}</main>
    </div>
  );
}
