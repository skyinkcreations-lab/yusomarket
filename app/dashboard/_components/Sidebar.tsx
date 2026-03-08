// app/dashboard/_components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <FaTachometerAlt /> },
    { label: "Orders", href: "/dashboard/orders", icon: <FaShoppingCart /> },
    { label: "Products", href: "/dashboard/products", icon: <FaBox /> },
    { label: "Customers", href: "/dashboard/customers", icon: <FaUsers /> },
    { label: "Analytics", href: "/dashboard/analytics", icon: <FaChartBar /> },
    { label: "Settings", href: "/dashboard/settings", icon: <FaCog /> },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Vendor Dashboard</h2>

      <nav className="sidebar-links">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button className="sidebar-logout">
        <FaSignOutAlt />
        Log Out
      </button>
    </aside>
  );
}
