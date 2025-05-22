"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("token");
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

        {/* Right Section */}
        {!isAuthPage && (
          <div className="flex items-center space-x-4">
            {/* Account Button */}
            <Link
              href="/profile"
              className="flex items-center bg-white border border-blue-100 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              <div className="h-8 w-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center">
              </div>
              <span className="text-sm font-medium text-gray-700">
                Kelola Akun Anda
              </span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
