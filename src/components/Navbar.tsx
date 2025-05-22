"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4">
      <div className="mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/LogoPandaCare.png"
            alt="PandaCare Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Navigation Links for Pacilian */}
        {user && user.role === "PACILIAN" && !isAuthPage && (
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/doctors"
              className={`text-sm font-medium transition ${
                pathname === "/doctors" || pathname.startsWith("/doctors/")
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Cari Dokter
            </Link>
            <Link
              href="/chat/sessions"
              className={`text-sm font-medium transition ${
                pathname === "/chat/sessions" || pathname.startsWith("/chat/")
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Chat
            </Link>
            <Link
              href="/konsultasi"
              className={`text-sm font-medium transition ${
                pathname === "/konsultasi"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Konsultasi
            </Link>
          </div>
        )}

        {/* Navigation Links for Caregiver */}
        {user && user.role === "CAREGIVER" && !isAuthPage && (
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/schedule"
              className={`text-sm font-medium transition ${
                pathname === "/schedule"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Kelola Jadwal
            </Link>
            <Link
              href="/chat/sessions"
              className={`text-sm font-medium transition ${
                pathname === "/chat/sessions" || pathname.startsWith("/chat/")
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Chat
            </Link>
            <Link
              href="/konsultasi"
              className={`text-sm font-medium transition ${
                pathname === "/konsultasi"
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Konsultasi
            </Link>
          </div>
        )}

        {/* Right Section */}
        {!isAuthPage && (
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Account Button */}
                <Link
                  href="/account"
                  className="flex items-center bg-white border border-blue-100 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user?.name?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}