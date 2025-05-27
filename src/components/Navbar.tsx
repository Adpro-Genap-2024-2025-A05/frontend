"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { 
  Calendar, 
  MessageSquare, 
  Search, 
  Stethoscope,
  User,
  Home,
  History,
  Star
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); 

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isUnauthenticatedPage = pathname === "/";

  const handleLogoClick = () => {
    if (user?.role === "CAREGIVER" || user?.role === "PACILIAN") {
      router.push("/homepage");
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4">
      <div className="mx-auto flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center space-x-2">
          <Image
            src="/LogoPandaCare.png"
            alt="PandaCare Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </button>

        {!isAuthPage && !isUnauthenticatedPage && user && (
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavigation('/homepage')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActivePath('/homepage') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            {user.role === 'PACILIAN' && (
              <>
                <button
                  onClick={() => handleNavigation('/doctors')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/doctors') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">Doctor List</span>
                </button>

                <button
                  onClick={() => handleNavigation('/konsultasi')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/konsultasi') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Konsultasi</span>
                </button>

                <button
                  onClick={() => handleNavigation('/chat/sessions')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/chat') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </>
            )}

            {user.role === 'CAREGIVER' && (
              <>
                <button
                  onClick={() => handleNavigation('/konsultasi')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/konsultasi') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-sm font-medium">Konsultasi</span>
                </button>

                <button
                  onClick={() => handleNavigation('/schedule')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/schedule') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Schedule</span>
                </button>

                <button
                  onClick={() => handleNavigation('/chat/sessions')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/chat') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </>
            )}
          </div>
        )}

        {!isAuthPage && !isUnauthenticatedPage && user && (
          <div className="flex items-center space-x-4">
            <a
              href="/profile"
              className="flex items-center bg-white border border-blue-100 rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition"
            >
              <div className="h-8 w-8 bg-blue-100 rounded-full mr-2 flex items-center justify-center" />
              <span className="text-sm font-medium text-gray-700">
                Kelola Akun Anda
              </span>
            </a>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {!isAuthPage && !isUnauthenticatedPage && user && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleNavigation('/homepage')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActivePath('/homepage') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </button>

            {user.role === 'PACILIAN' && (
              <>
                <button
                  onClick={() => handleNavigation('/doctors')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/doctors') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">Doctor List</span>
                </button>

                <button
                  onClick={() => handleNavigation('/konsultasi')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/konsultasi') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Konsultasi</span>
                </button>

                <button
                  onClick={() => handleNavigation('/chat/sessions')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/chat') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </>
            )}

            {user.role === 'CAREGIVER' && (
              <>
                <button
                  onClick={() => handleNavigation('/konsultasi')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/konsultasi') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-sm font-medium">Konsultasi</span>
                </button>

                <button
                  onClick={() => handleNavigation('/schedule')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/schedule') 
                      ? 'bg-blue-100 text-blue-606' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Schedule</span>
                </button>

                <button
                  onClick={() => handleNavigation('/chat/sessions')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActivePath('/chat') 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleNavigation('/profile')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActivePath('/profile') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}