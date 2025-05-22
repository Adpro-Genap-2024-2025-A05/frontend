"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function NavbarWithSchedule() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4">
      <div className="mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl font-bold text-blue-500">PandaCare</div>
        </Link>

        {/* Navigation Links */}
        {user && user.role === "CAREGIVER" && (
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/schedule"
              className={`text-sm font-medium ${
                pathname === "/schedule"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Manage Schedule
            </Link>
            <Link
              href="/konsultasi"
              className={`text-sm font-medium ${
                pathname === "/konsultasi"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Consultations
            </Link>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center bg-white rounded-lg px-4 py-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center text-blue-600 font-medium">
                  {user?.name?.[0] || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {user?.name || "User"}
                </span>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}