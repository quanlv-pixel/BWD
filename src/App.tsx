import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  Home, 
  Layout, 
  BookOpen, 
  Book,
  Library,
  DollarSign,
  Search, 
  Code,
  Globe, 
  TrendingUp, 
  ChevronRight, 
  ArrowRight, 
  GraduationCap, 
  Users, 
  Star, 
  Trophy, 
  Gift, 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Zap,
  ExternalLink,
  MessageSquare,
  Heart,
  Clock,
  Plus,
  Loader2,
  Share2,
  Award,
  ChevronDown,
  Bell,
  CheckCircle2,
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  User as UserIcon,
  Sun,
  Moon,
  Camera,
  Edit3,
  Save,
  Mail,
  Shield,
  ArrowLeft,
  Phone,
  MapPin
} from "lucide-react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  where,
  limit
} from "firebase/firestore";
import { auth, db, googleProvider } from "./lib/firebase";
import { cn } from "./lib/utils";
import { AIAssistant } from "./components/AIAssistant";
import type { Course, Post, UserProfile } from "./types";

// --- Types & Constants ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Layout Components ---

const UserMenu = ({ user }: { user: FirebaseUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => signOut(auth);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=10b981&color=fff`} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border border-emerald-500"
        />
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">{user.displayName?.split(' ')[0]}</p>
          <p className="text-[10px] text-slate-400 font-medium leading-none">Thành viên</p>
        </div>
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <UserIcon size={16} />
              <span>Hồ sơ của tôi</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Settings size={16} />
              <span>Cài đặt tài khoản</span>
            </Link>
            
            <div className="border-t border-slate-50 dark:border-slate-800 mt-1 pt-1">
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = ({ user, searchQuery, setSearchQuery, medalsCount, darkMode, setDarkMode }: { 
  user: FirebaseUser | null, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  medalsCount: number,
  darkMode: boolean,
  setDarkMode: (d: boolean) => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Đồng bộ hóa localSearch khi searchQuery thay đổi
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (localSearch.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(localSearch)}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Fetch suggestions error", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (location.pathname === '/skills') {
      setSearchQuery(val);
    }
  };

  const handleSelectSuggestion = (id: string, title: string) => {
    setSearchQuery(title);
    setLocalSearch(title);
    setShowSuggestions(false);
    if (id.startsWith('py_') || id.startsWith('js_') || id.startsWith('dl_') || id.startsWith('ai_') || id.startsWith('ielts_') || id.startsWith('toeic_') || id.startsWith('mkt_') || id.startsWith('finance_') || id.startsWith('soft_') || id.startsWith('time_')) {
      navigate(`/course/${id}`);
    } else {
      navigate('/skills');
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchQuery(localSearch);
      if (location.pathname !== '/skills') {
        navigate('/skills');
      }
    }
  };

  const navLinks = [
    { name: "Trang Chủ", path: "/", icon: <Home size={18} /> },
    { name: "Khóa Học", path: "/skills", icon: <Layout size={18} /> },
    { name: "Tài Liệu", path: "/resources", icon: <BookOpen size={18} /> },
    { name: "Đổi Quà", path: "/rewards", icon: <Gift size={18} /> },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 py-4",
      isScrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight hidden md:block dark:text-white">Self-Study Hub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "text-sm font-semibold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800",
                location.pathname === link.path 
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-6">
          <div ref={searchContainerRef} className="hidden xl:flex items-center relative group">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Search size={16} className="text-slate-400 group-focus-within:text-emerald-500" />
              <input 
                type="text" 
                placeholder="Tìm khóa học..." 
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                onFocus={() => localSearch.length >= 2 && setShowSuggestions(true)}
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 focus:w-52 transition-all outline-none dark:text-white"
              />
              {localSearch && (
                <button 
                  onClick={() => {
                    setLocalSearch("");
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kết quả gợi ý</p>
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSuggestion(s.id, s.title)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 shrink-0">
                        <BookOpen size={14} />
                      </div>
                      <span className="font-bold truncate">{s.title}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      setSearchQuery(localSearch);
                      setShowSuggestions(false);
                      if (location.pathname !== '/skills') navigate('/skills');
                    }}
                    className="w-full px-4 py-2 mt-1 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center border-t border-slate-50 dark:border-slate-800"
                  >
                    Xem tất cả kết quả
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              id="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-emerald-400 transition-all active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} className="animate-pulse" /> : <Moon size={20} />}
            </button>

            {user && (
               <Link to="/rewards" className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                <Trophy size={14} /> {medalsCount} Huy chương
              </Link>
            )}

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link 
                to="/login"
                className="bg-slate-900 dark:bg-emerald-600 text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold shadow-3d hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center gap-2 active:scale-95"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </Link>
            )}

            <button 
              className="lg:hidden text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-4 overflow-hidden rounded-[24px] shadow-2xl transition-colors"
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsMobileMenuOpen(false);
                      handleSearchKeyPress(e);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    location.pathname === link.path 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-600 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-800"
                  )}
                >
                  <span className={cn(location.pathname === link.path ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                    {link.icon}
                  </span>
                  <span className="font-bold">{link.name}</span>
                </Link>
              ))}

              {!user && (
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl text-emerald-600 font-black bg-emerald-50 dark:bg-emerald-900/20 mt-2"
                >
                  <LogIn size={20} />
                  <span>Đăng nhập ngay</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const LoginPage = ({ user }: { user: FirebaseUser | null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.successMsg;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      try {
        await setDoc(doc(db, "users", u.uid), {
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
          email: u.email,
          lastLogin: serverTimestamp()
        }, { merge: true });
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, `users/${u.uid}`);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi đăng nhập bằng Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message === "Firebase: Error (auth/user-not-found)." ? "Tài khoản không tồn tại." : "Email hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="pt-60 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="font-bold text-slate-400">Bạn đã đăng nhập. Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-3d p-10 relative z-10 border border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen size={30} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Self-Study Hub</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Mừng bạn trở lại! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Hãy đăng nhập để tiếp tục hành trình học tập cùng cộng đồng.</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
            <CheckCircle size={18} />
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black py-4 px-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>Tiếp tục với Google</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-300 dark:text-slate-600">
              <span className="bg-white dark:bg-slate-900 px-4 transition-colors">HOẶC</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">Email của bạn</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com" 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 mt-4 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Đăng nhập hệ thống"}
          </button>

          <p className="text-center text-sm text-slate-400 font-bold py-4">
            Chưa có tài khoản? <Link to="/register" className="text-emerald-600 hover:underline">Đăng ký ngay</Link>
          </p>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest leading-none">
          <div className="p-1 px-3 border border-slate-100 dark:border-slate-800 rounded-full flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Bảo mật SSL
          </div>
          <div className="p-1 px-3 border border-slate-100 dark:border-slate-800 rounded-full flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            V 1.0
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const RegisterPage = ({ user }: { user: FirebaseUser | null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !displayName) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    
    if (password.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const u = result.user;
      
      // Update User Data in Firestore
      try {
        await setDoc(doc(db, "users", u.uid), {
          uid: u.uid,
          displayName: displayName,
          email: email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`,
          createdAt: serverTimestamp()
        });
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, `users/${u.uid}`);
      }
      
      // Force sign out because createUserWithEmailAndPassword auto-signs in
      await auth.signOut();
      navigate("/login", { state: { successMsg: "Đăng ký thành công! Hãy đăng nhập để bắt đầu học tập." } });
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra khi đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-3d p-10 relative z-10 border border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen size={30} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Self-Study Hub</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Tạo tài khoản mới ✨</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Tham gia cùng hàng nghìn học viên đang tự học mỗi ngày.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">Họ và tên</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nguyễn Văn A" 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự" 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-emerald-500 transition-all active:scale-95 mt-4 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Đăng ký ngay"}
          </button>

          <p className="text-center text-sm text-slate-400 font-bold py-4">
            Đã có tài khoản? <Link to="/login" className="text-emerald-600 hover:underline">Đăng nhập</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

// --- Page Content ---

const HomePage = () => {
  return (
    <div className="space-y-24 pb-20 dark:bg-slate-950 transition-colors">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Award size={14} /> nền tảng tự học số 1
            </div>
            <h1 className="text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-8">
              LÀM CHỦ KỸ NĂNG, <br />
              <span className="text-gradient">THAY ĐỔI TƯƠNG LAI.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-xl leading-relaxed">
              Dù bạn là sinh viên mới hay chuẩn bị ra trường, chúng tôi đều có lộ trình cá nhân hóa giúp bạn dẫn đầu trong kỷ nguyên số.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/skills" className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-bold text-lg shadow-3d hover:scale-105 active:scale-95 transition-all text-center">
                Bắt Đầu Ngay
              </Link>
              <Link to="/resources" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-3xl font-bold text-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <span>Xem Tài Liệu</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-700">
               <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Students" 
                className="rounded-[40px] shadow-3d w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 animate-bounce-slow">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiến Độ</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">850+ Giờ Học</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Lộ Trình Đào Tạo Phổ Biến</h2>
          <p className="text-slate-500 dark:text-slate-400">Được thiết kế dựa trên nhu cầu tuyển dụng thực tế của doanh nghiệp.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Ngoại Ngữ", icon: <Globe size={40} />, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", desc: "Tiếng Anh cho IT, IELTS, Tiếng Nhật căn bản.", path: "/skills" },
            { title: "Lập Trình", icon: <Layout size={40} />, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400", desc: "Web Front-end, Mobile App, Python & AI.", path: "/skills" },
            { title: "Kỹ Năng Mềm", icon: <Users size={40} />, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400", desc: "Thuyết trình bản lĩnh, Quản lý thời gian.", path: "/skills" },
          ].map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-3d-sm transition-all"
            >
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-8", cat.color)}>
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 dark:text-white">{cat.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{cat.desc}</p>
              <Link to={cat.path} className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 group">
                Tìm hiểu thêm <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const sidebarItems = [
    { name: "Tất cả", icon: <Library size={18} /> },
    { name: "Lập trình", icon: <Code size={18} /> },
    { name: "Ngoại ngữ", icon: <Globe size={18} /> },
    { name: "Kinh tế", icon: <DollarSign size={18} /> },
    { name: "Kỹ năng mềm", icon: <Zap size={18} /> },
  ];

  const resources = [
    // Lập trình
    { 
      title: "Clean Code: A Handbook of Agile Software Craftsmanship", 
      author: "Robert C. Martin",
      category: "Lập trình", 
      link: "https://www.google.com/search?q=Clean+Code+Robert+C.+Martin",
      desc: "Cuốn sách 'gối đầu giường' của mọi lập trình viên về cách viết mã sạch và hiệu quả."
    },
    { 
      title: "The Pragmatic Programmer", 
      author: "Andrew Hunt & David Thomas",
      category: "Lập trình", 
      link: "https://www.google.com/search?q=The+Pragmatic+Programmer",
      desc: "Những triết lý và kiến thức thực tế để trở thành một lập trình viên chuyên nghiệp."
    },
    { 
      title: "You Don't Know JS Yet", 
      author: "Kyle Simpson",
      category: "Lập trình", 
      link: "https://github.com/getify/You-Dont-Know-JS",
      desc: "Bộ sách đi sâu vào những ngóc ngách chuyên sâu nhất của ngôn ngữ JavaScript."
    },
    
    // Ngoại ngữ
    { 
      title: "English Grammar in Use", 
      author: "Raymond Murphy",
      category: "Ngoại ngữ", 
      link: "https://www.google.com/search?q=English+Grammar+in+Use+Raymond+Murphy",
      desc: "Tài liệu học ngữ pháp tiếng Anh phổ biến nhất thế giới dành cho mọi trình độ."
    },
    { 
      title: "Hack não 1500 từ tiếng Anh", 
      category: "Ngoại ngữ", 
      link: "#",
      desc: "Phương pháp học từ vựng qua âm thanh tương tự giúp ghi nhớ nhanh và lâu."
    },

    // Kinh tế
    { 
      title: "Kinh Tế Học Hài Hước (Freakonomics)", 
      author: "Steven D. Levitt & Stephen J. Dubner",
      category: "Kinh tế", 
      link: "https://www.google.com/search?q=Freakonomics",
      desc: "Khám phá những khía cạnh ẩn giấu đằng sau các hiện tượng kinh tế trong đời sống."
    },
    { 
      title: "Nhà Đầu Tư Thông Minh", 
      author: "Benjamin Graham",
      category: "Kinh tế", 
      link: "https://www.google.com/search?q=The+Intelligent+Investor",
      desc: "Cuốn sách kinh điển về đầu tư giá trị được Warren Buffett khuyên đọc."
    },
    { 
      title: "Cha Giàu Cha Nghèo", 
      author: "Robert Kiyosaki",
      category: "Kinh tế", 
      link: "https://www.google.com/search?q=Rich+Dad+Poor+Dad",
      desc: "Bài học về tư duy tài chính, quản lý tiền bạc và sự khác biệt giữa tài sản - tiêu sản."
    },

    // Kỹ năng mềm
    { 
      title: "Đắc Nhân Tâm (How to Win Friends and Influence People)", 
      author: "Dale Carnegie",
      category: "Kỹ năng mềm", 
      link: "https://www.google.com/search?q=How+to+Win+Friends+and+Influence+People",
      desc: "Nghệ thuật giao tiếp và thu phục lòng người vượt thời đại."
    },
    { 
      title: "7 Thói Quen Để Thành Đạt", 
      author: "Stephen R. Covey",
      category: "Kỹ năng mềm", 
      link: "https://www.google.com/search?q=The+7+Habits+of+Highly+Effective+People",
      desc: "Xây dựng những thói quen giúp bạn làm chủ cuộc sống và sự nghiệp công việc."
    },
    { 
      title: "Tư Duy Nhanh Và Chậm", 
      author: "Daniel Kahneman",
      category: "Kỹ năng mềm", 
      link: "https://www.google.com/search?q=Thinking+Fast+and+Slow",
      desc: "Hiểu về cơ chế vận hành của não bộ để đưa ra những quyết định sáng suốt hơn."
    },
  ];

  const filteredResources = activeCategory === "Tất cả" 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

  return (
    <div className="pt-20 flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* Sidebar - Library Style */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto bg-white dark:bg-slate-900 transition-colors shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <Library className="text-emerald-600" size={24} />
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Thư Viện Sách</h2>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveCategory(item.name)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all text-left",
                  activeCategory === item.name 
                    ? "bg-emerald-600 text-white shadow-3d-sm translate-x-1" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  activeCategory === item.name ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
                )}>
                  {item.icon}
                </div>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30">
            <Book className="text-emerald-600 dark:text-emerald-400 mb-4" size={32} />
            <h4 className="font-black text-emerald-900 dark:text-emerald-100 text-sm mb-2">Đề cử hôm nay</h4>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 leading-relaxed font-medium">
              "Sách là ngọn đèn bất diệt của trí tuệ con người."
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
               <span className="h-px w-8 bg-emerald-600"></span>
               <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Kho tài liệu số</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{activeCategory}</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Tổng hợp những cuốn sách điện tử, tài liệu chuyên sâu giúp bạn mở rộng tư duy và nắm vững kiến thức nền tảng trong nhiều lĩnh vực.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-2 gap-8">
            {filteredResources.map((res, i) => (
              <motion.a
                key={i}
                href={res.link}
                target="_blank"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex flex-col min-h-[280px]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                       {res.category}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                      {res.title}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                    <Book size={20} />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   {res.author && (
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                       <UserIcon size={14} /> Tác giả: <span className="text-slate-600 dark:text-slate-300">{res.author}</span>
                     </p>
                   )}
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-3">
                     {res.desc}
                   </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                    Đọc tài liệu <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <ExternalLink size={16} className="text-slate-300 dark:text-slate-600" />
                </div>
              </motion.a>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="py-32 text-center opacity-30">
              <Library size={80} className="mx-auto mb-6 text-slate-300 dark:text-slate-700" />
              <p className="text-xl font-black dark:text-slate-500">Đang cập nhật kho sách cho mục này...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SkillsPage = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (q: string) => void }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("Tất cả");
  const navigate = useNavigate();

  const handleTrackChange = (trackName: string) => {
    setActiveTrack(trackName);
    // Clear global search query when changing tracks to avoid confusion
    if (searchQuery) {
      setSearchQuery("");
    }
  };

  const tracks = [
    { name: "Tất cả", icon: <Layout size={18} /> },
    { name: "Lập trình & CNTT", icon: <Code size={18} /> },
    { name: "Ngoại Ngữ", icon: <Globe size={18} /> },
    { name: "Kinh tế - Marketing", icon: <TrendingUp size={18} /> },
    { name: "Kỹ năng mềm", icon: <Zap size={18} /> },
  ];

  useEffect(() => {
    setIsLoading(true);
    // If the track is "Tất cả" and there's no search query, fetch everything
    // Otherwise, we prioritize search query, then category query
    const categoryQuery = activeTrack === "Tất cả" ? "" : activeTrack.toLowerCase();
    const finalQuery = searchQuery || categoryQuery;
    
    fetch(`/api/courses?q=${encodeURIComponent(finalQuery)}`)
      .then(r => r.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch courses error:", err);
        setCourses([]);
        setIsLoading(false);
      });
  }, [searchQuery, activeTrack]);

  return (
    <div className="pt-20 flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar - W3Schools Course Tracks */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto transition-colors">
        <div className="p-8">
          <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Lộ trình học tập</h2>
          <nav className="space-y-1">
            {tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => handleTrackChange(track.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left",
                  activeTrack === track.name 
                    ? "bg-[#282a35] dark:bg-emerald-600 text-white shadow-lg" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                {track.icon}
                {track.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl text-left">
              <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">
                {activeTrack !== "Tất cả" ? activeTrack : "Thư viện Khóa học"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {searchQuery ? `Kết quả cho "${searchQuery}"` : "Chọn lộ trình và bắt đầu hành trình chinh phục kiến thức."}
              </p>
            </div>
          </div>

          {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white dark:bg-slate-900 rounded-[32px] animate-pulse border border-slate-100 dark:border-slate-800 shadow-sm" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {courses.map(course => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black dark:text-white">{course.rating}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#04AA6D] dark:group-hover:text-emerald-500 transition-colors line-clamp-2">{course.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{course.description}</p>
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Users size={14} /> {course.students.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#04AA6D] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {courses.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <Search size={64} className="mx-auto mb-4 dark:text-slate-500" />
                  <p className="text-xl font-bold dark:text-white">Không tìm thấy khóa học nào phù hợp</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const CourseDetailPage = ({ user }: { user: FirebaseUser | null }) => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/courses`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((c: any) => c.id === id);
        setCourse(found);
        setIsLoading(false);
      });
    
    if (user && id) {
      const progressRef = doc(db, "userProgress", `${user.uid}_${id}`);
      getDoc(progressRef).then(snapshot => {
        if (snapshot.exists()) {
          setCompletedLessons(snapshot.data().completedLessonIds || []);
        }
      }).catch(error => {
        handleFirestoreError(error, OperationType.GET, `userProgress/${user.uid}_${id}`);
      });
    }
  }, [id, user]);

  const switchLesson = (idx: number) => {
    setActiveLessonIdx(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu tiến độ học tập!");
      return;
    }
    if (!id || !course) return;

    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId];
    
    if (newCompleted.length !== completedLessons.length) {
      setCompletedLessons(newCompleted);

      // Update Firestore
      const isFinished = newCompleted.length === course.lessons.length;
      try {
        await setDoc(doc(db, "userProgress", `${user.uid}_${id}`), {
          userId: user.uid,
          courseId: id,
          completedLessonIds: newCompleted,
          isCompleted: isFinished,
          lastAccessed: serverTimestamp()
        }, { merge: true });

        if (isFinished) {
          await setDoc(doc(db, "medals", `${user.uid}_${id}`), {
            userId: user.uid,
            courseId: id,
            medalName: `Chuyên gia ${course.title}`,
            earnedAt: serverTimestamp()
          }, { merge: true });
        }

        // Auto move to next lesson if available
        if (activeLessonIdx < course.lessons.length - 1) {
          setTimeout(() => switchLesson(activeLessonIdx + 1), 500);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `userProgress/${user.uid}_${id}`);
      }
    } else {
      // If already completed, just move to next if available
      if (activeLessonIdx < course.lessons.length - 1) {
        switchLesson(activeLessonIdx + 1);
      }
    }
  };

  if (isLoading) return <div className="pt-60 text-center animate-pulse font-black text-slate-300">Đang tải lộ trình...</div>;
  if (!course) return <div className="pt-60 text-center font-black text-slate-900">Không tìm thấy khóa học.</div>;

  const progressPercent = Math.round((completedLessons.length / course.lessons.length) * 100);
  const activeLesson = course.lessons[activeLessonIdx];

  return (
    <div className="pt-24 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto transition-colors">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold mb-6 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" onClick={() => navigate(-1)}>
        <ChevronRight className="rotate-180" size={18} /> Quay lại danh sách khóa học
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Player & Content */}
        <div className="lg:col-span-8 space-y-6">
              <div className="bg-black aspect-video rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl relative group">
                {activeLesson.videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeLesson.videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                    <PlayCircle size={64} className="mb-4 opacity-20" />
                    <p className="font-bold">Video bài học đang được cập nhật</p>
                  </div>
                )}
              </div>

          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[40px] shadow-3d-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-50 dark:border-slate-800 pb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{activeLesson.title}</h1>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <BookOpen size={14} /> Khóa học: {course.title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => completeLesson(activeLesson.id)}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
                    completedLessons.includes(activeLesson.id) 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" 
                      : "bg-slate-900 dark:bg-emerald-600 text-white shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-500"
                  )}
                >
                  {completedLessons.includes(activeLesson.id) ? <CheckCircle size={18} /> : <Zap size={18} />}
                  {completedLessons.includes(activeLesson.id) ? "Đã Hoàn Thành" : "Xác nhận hoàn thành bài này"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="text-emerald-500" /> Bài tập thực hành
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium transition-colors">
                  "{activeLesson.exercise}"
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Star className="text-amber-500" /> Ghi chú quan trọng
                </h3>
                <ul className="space-y-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    Thực hành ngay sau khi xem hết video để nhớ lâu hơn.
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                    Nếu gặp lỗi, hãy kiểm tra lại cú pháp hoặc hỏi cộng đồng.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] shadow-3d-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              Nội dung khóa học
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full text-xs">{progressPercent}%</span>
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {course.lessons.map((lesson, idx) => (
                <button 
                  key={lesson.id}
                  onClick={() => switchLesson(idx)}
                  className={cn(
                    "w-full p-5 rounded-3xl border-2 transition-all text-left flex items-center gap-4 group",
                    activeLessonIdx === idx 
                      ? "bg-slate-900 dark:bg-emerald-600 border-slate-900 dark:border-emerald-600 text-white shadow-xl" 
                      : completedLessons.includes(lesson.id)
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                        : "bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                    activeLessonIdx === idx ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                  )}>
                    {completedLessons.includes(lesson.id) ? <CheckCircle size={18} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight line-clamp-1">{lesson.title}</p>
                    <p className={cn("text-[10px] font-bold uppercase mt-1", activeLessonIdx === idx ? "text-emerald-400" : "text-slate-400 dark:text-slate-500")}>
                      {lesson.duration} phút
                    </p>
                  </div>
                  {activeLessonIdx === idx && <PlayCircle size={18} className="animate-pulse" />}
                </button>
              ))}
            </div>
          </div>

          {progressPercent === 100 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-500 p-8 rounded-[40px] text-white text-center shadow-3d relative overflow-hidden">
               <Trophy size={80} className="absolute -bottom-4 -right-4 opacity-20 rotate-12" />
               <h4 className="text-2xl font-black mb-2">Hoàn Thành! 🏆</h4>
               <p className="text-amber-100 text-sm font-bold mb-6">Bạn đã mở khóa 1 Huy chương chuyên gia.</p>
               <Link to="/rewards" className="inline-block px-8 py-3 bg-white dark:bg-slate-100 text-amber-600 rounded-2xl font-black text-sm hover:shadow-lg transition-all">Đổi Quà Ngay</Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const RewardsPage = ({ user }: { user: FirebaseUser | null }) => {
  const rewards = [
    { title: "Gói Premium 1 Tháng", cost: 3, icon: <Zap className="text-emerald-500" />, desc: "Mở khóa toàn bộ tài liệu chuyên sâu và bài giải mẫu." },
    { title: "Giảm giá 50% Khóa Offline", cost: 5, icon: <Gift className="text-blue-500" />, desc: "Áp dụng cho các khóa học thực tế tại trung tâm đối tác." },
    { title: "Bộ Stickers Hub", cost: 2, icon: <Star className="text-amber-500" />, desc: "Bộ sticker độc quyền cực cool dán laptop." },
    { title: "Thẻ Quà Tặng Starbucks", cost: 10, icon: <Heart className="text-red-500" />, desc: "Phần thưởng cho những nỗ lực học tập không mệt mỏi." }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto dark:bg-slate-950 transition-colors">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-slate-900 dark:text-white">Cửa Hàng Đổi Quà</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Tích lũy huy chương từ các khóa học để đổi lấy những phần quà giá trị.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {rewards.map((rw, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:scale-110 transition-all">
              {rw.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{rw.title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-4">Giá: {rw.cost} Huy chương</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-1">{rw.desc}</p>
            <button 
              disabled={!user}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white disabled:opacity-50 transition-all active:scale-95"
            >
              Đổi Quà
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = ({ user }: { user: FirebaseUser | null }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medals, setMedals] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch Profile
    const profileRef = doc(db, "users", user.uid);
    getDoc(profileRef).then(snap => {
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    });

    // Fetch Medals
    const medalsQ = query(collection(db, "medals"), where("userId", "==", user.uid));
    onSnapshot(medalsQ, (snap) => {
      setMedals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Progress
    const progressQ = query(collection(db, "userProgress"), where("userId", "==", user.uid), orderBy("lastAccessed", "desc"), limit(5));
    onSnapshot(progressQ, (snap) => {
      setProgress(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="pt-40 text-center">
        <h2 className="text-2xl font-black mb-4">Vui lòng đăng nhập để xem hồ sơ</h2>
        <Link to="/login" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto dark:bg-slate-950 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-3d overflow-hidden mb-12">
        <div className="h-48 bg-gradient-to-r from-emerald-600 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
        </div>
        <div className="px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-20 mb-8">
            <div className="relative group">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`} 
                alt="Avatar" 
                className="w-40 h-40 rounded-[40px] border-8 border-white dark:border-slate-900 shadow-2xl object-cover"
              />
              <Link to="/settings" className="absolute bottom-4 right-4 bg-emerald-600 text-white p-2 rounded-xl shadow-lg hover:bg-emerald-500 transition-colors">
                <Camera size={18} />
              </Link>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{profile?.displayName || user.displayName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm font-bold">
                <span className="flex items-center gap-1.5"><Mail size={16} /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Clock size={16} /> Tham gia: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('vi-VN') : 'Mới đây'}</span>
              </div>
            </div>
            <div className="pb-2">
              <Link to="/settings" className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                <Edit3 size={18} /> Chỉnh sửa hồ sơ
              </Link>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-3xl leading-relaxed">
            {profile?.bio || "Chưa có tiểu sử. Hãy cập nhật để mọi người hiểu rõ hơn về bạn!"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Achievements */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Thống kê</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                <Trophy className="text-emerald-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 leading-none">{medals.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mt-1">Huy chương</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-center">
                <BookOpen className="text-blue-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-black text-blue-900 dark:text-blue-100 leading-none">{progress.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60 mt-1">Khóa học</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Huy chương đạt được</h3>
            {medals.length > 0 ? (
              <div className="space-y-4">
                {medals.map(m => (
                  <div key={m.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{m.medalName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đạt được: {m.earnedAt?.toDate().toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-30">
                <Trophy size={48} className="mx-auto mb-4" />
                <p className="font-bold text-sm">Chưa có huy chương nào</p>
              </div>
            )}
            {medals.length > 0 && (
              <Link to="/rewards" className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:bg-amber-600 transition-all active:scale-95">
                <Gift size={18} /> Đổi quà ngay
              </Link>
            )}
          </div>
        </div>

        {/* Right Column: Course Activity */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Hành trình học tập</h3>
            {progress.length > 0 ? (
              <div className="space-y-6">
                {progress.map(p => (
                  <div 
                    key={p.id} 
                    className="group flex flex-col md:flex-row md:items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-4xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all cursor-pointer"
                    onClick={() => navigate(`/course/${p.courseId}`)}
                  >
                    <div className="w-full md:w-40 aspect-video rounded-2xl overflow-hidden bg-slate-200 shrink-0">
                      <img 
                        src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80`} 
                        alt="Course" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Đang học</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {p.lastAccessed?.toDate ? p.lastAccessed.toDate().toLocaleDateString('vi-VN') : 'Đang xử lý...'}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 transition-colors">ID Khóa học: {p.courseId}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-slate-500">Tiến độ hoàn thành: {p.completedLessonIds?.length || 0} bài học</span>
                          <span className="text-emerald-600">{p.isCompleted ? 'Hoàn thành' : 'Đang tiếp tục'}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: p.isCompleted ? '100%' : '60%' }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-20">
                <Book className="mx-auto mb-4" size={64} />
                <p className="text-lg font-bold">Bạn chưa bắt đầu khóa học nào</p>
                <Link to="/skills" className="text-emerald-600 mt-2 inline-block hover:underline">Khám phá khóa học ngay</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ user }: { user: FirebaseUser | null }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      return;
    }

    const profileRef = doc(db, "users", user.uid);
    getDoc(profileRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setDisplayName(data.displayName || "");
        setBio(data.bio || "");
      }
      setIsDataLoading(false);
    });
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Update Firebase Auth Profile
      await updateProfile(user, { displayName });

      // Update Firestore Profile
      const profileRef = doc(db, "users", user.uid);
      await setDoc(profileRef, {
        displayName,
        bio,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMessage({ text: "Cập nhật thông tin thành công!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Có lỗi xảy ra: " + err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="pt-40 text-center">Vui lòng đăng nhập</div>;
  if (isDataLoading) return <div className="pt-40 text-center animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto dark:bg-slate-950 transition-colors">
      <button 
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors mb-6 group"
      >
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
          <ArrowLeft size={18} />
        </div>
        <span>Quay lại hồ sơ</span>
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Cài đặt tài khoản</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Quản lý thông tin cá nhân và thiết lập tài khoản của bạn.</p>
      </div>

      <div className="space-y-8">
        <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm space-y-8">
          <div className="flex items-center gap-6 pb-8 border-b border-slate-50 dark:border-slate-800">
            <div className="relative group">
               <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=10b981&color=fff`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-3xl border-4 border-slate-50 dark:border-slate-800 object-cover"
              />
              <button type="button" className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-emerald-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Ảnh đại diện</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-[200px]">Tính năng cập nhật ảnh trực tiếp sẽ sớm ra mắt.</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-4 flex items-center gap-2">
                <UserIcon size={16} className="text-slate-400" /> Tên hiển thị <span className="text-[10px] opacity-50 font-medium">(Tùy chọn)</span>
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-5 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-4 flex items-center gap-2">
                <Edit3 size={16} className="text-slate-400" /> Giới thiệu ngắn <span className="text-[10px] opacity-50 font-medium">(Tùy chọn)</span>
              </label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Một chút về bạn..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-5 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none dark:text-white font-medium resize-none"
              />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 ml-4 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" /> Email liên kết
                </label>
                <div className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-5 text-slate-400 font-bold opacity-70">
                  {user.email} (Không thể thay đổi)
                </div>
            </div>
          </div>

          {message.text && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={cn(
                "p-4 rounded-2xl text-sm font-black flex items-center gap-3",
                message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}
            >
              {message.type === "success" ? <CheckCircle size={18} /> : <X size={18} />}
              {message.text}
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Lưu thay đổi</>}
            </button>
            <button 
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black py-4 rounded-3xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
            >
              Hủy
            </button>
          </div>
        </form>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800">
           <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <Shield size={20} className="text-blue-500" /> Bảo mật và Tài khoản
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
             Bạn đang sử dụng hệ thống đăng nhập được bảo mật bởi Firebase. Thông tin tài khoản của bạn luôn được mã hóa và bảo vệ.
           </p>
           <button 
             onClick={() => signOut(auth)}
             className="text-red-500 font-black text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all"
           >
             <LogOut size={18} /> Đăng xuất khỏi thiết bị này
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Root ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [medalsCount, setMedalsCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user) {
      setMedalsCount(0);
      return;
    }
    const q = query(collection(db, "medals"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedalsCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "medals");
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 dark:text-white transition-colors duration-300">
        <Navbar 
          user={user} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          medalsCount={medalsCount} 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage user={user} />} />
            <Route path="/register" element={<RegisterPage user={user} />} />
            <Route path="/skills" element={<SkillsPage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
            <Route path="/course/:id" element={<CourseDetailPage user={user} />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/rewards" element={<RewardsPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/settings" element={<SettingsPage user={user} />} />
            <Route path="*" element={<div className="pt-40 text-center font-black text-4xl opacity-10">Sẽ sớm cập nhật...</div>} />
          </Routes>
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-12 px-6 transition-colors text-slate-900 dark:text-white">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <BookOpen size={20} />
                  </div>
                  <p className="font-extrabold text-xl tracking-tight">Self-Study Hub &copy; 2026</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-md">
                  Nền tảng tự học trực tuyến hàng đầu, cung cấp các lộ trình học tập tối ưu và tài nguyên chất lượng cao cho cộng đồng sinh viên.
                </p>
              </div>

              <div className="space-y-4 md:pt-2">
                <p className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Thông tin liên hệ</p>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400 transition-colors">
                    <MapPin size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                    <p className="font-bold text-sm">
                      470 Trần Đại Nghĩa, Phường Ngũ Hành Sơn, TP. Đà Nẵng
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 transition-colors">
                    <Phone size={18} className="shrink-0 text-emerald-500" />
                    <p className="font-bold text-sm">0708019***</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <AIAssistant />
      </div>
    </BrowserRouter>
  );
}

