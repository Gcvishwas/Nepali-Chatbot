import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const RootLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isExplorePage=location.pathname==="/explore"
  const isEmergencyPage=location.pathname==="/emergency"

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <div className="px-6 md:px-16 py-4 h-screen flex flex-col">
        {/* ===== Header ===== */}
        <header className="flex items-center justify-between relative animate-slideDown">
          {/* Logo (always visible) */}
          <Link
            to="/"
            className="flex items-center font-bold gap-2 text-lg"
            onClick={() => setMenuOpen(false)}
          >
            <img src="/vite.svg" alt="logo" className="w-6 h-6" />
            <span className="font-bold bg-gradient-to-r from-[#217bfe] to-[#e55571] bg-clip-text text-transparent">
              प्रकोप.AI
            </span>
          </Link>

          {/* Centered Navbar */}
          {!isDashboardRoute && (
            <nav className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-10 font-semibold text-gray-400">
              <Link to="/" className="hover:text-white transition">
                गृहपृष्ठ
              </Link>
              <Link to="/explore" className="hover:text-white transition">
                अन्वेषण
              </Link>
              <Link to="/emergency" className="text-red-400 hover:text-red-500 transition">
                आकस्मिक सम्पर्क
              </Link>
              <Link to="/dashboard" className="hover:text-white transition">
                च्याटबोट
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            {!isDashboardRoute && (
              <button
                className="md:hidden text-gray-300 hover:text-white transition"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {menuOpen ? <span className="text-xl">✕</span> : <span className="text-2xl">☰</span>}
              </button>
            )}

            {/* ===== UserButton (only on dashboard routes) ===== */}
            {isDashboardRoute && (
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            )}
          </div>

          {/* ===== Mobile Dropdown ===== */}
          {menuOpen && !isDashboardRoute && (
            <div className="absolute top-14 right-0 w-40 bg-[#1c1a29] rounded-xl shadow-md p-4 flex flex-col gap-3 text-gray-300 md:hidden z-50">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#217bfe] transition"
              >
                गृहपृष्ठ
              </Link>
              <Link
                to="/explore"
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#217bfe] transition"
              >
                अन्वेषण
              </Link>
              <Link
                to="/emergency"
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#217bfe] transition"
              >
                आपतकालीन सम्पर्क
              </Link>
              <Link
                to="/emergency"
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#217bfe] transition"
              >
                च्याटबोट
              </Link>
            </div>
          )}
        </header>

        {/* ===== Main Content ===== */}
        <main className={`flex-1 mt-5 ${!isExplorePage && !isEmergencyPage ? "overflow-hidden" : "overflow-auto"}`}>
          <Outlet />
        </main>
      </div>
    </ClerkProvider>
  );
};

export default RootLayout;
