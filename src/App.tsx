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
  Tv,
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
  MapPin,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  Send,
  HelpCircle
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
  console.warn('Firestore Notice (Handled): ', JSON.stringify(errInfo));
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

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Trying to sign in with a demo account. 
      // If it fails, we show a helpful message.
      await signInWithEmailAndPassword(auth, "demo@example.com", "123456");
      navigate("/");
    } catch (err: any) {
      setError("Tài khoản Demo (demo@example.com / 123456) chưa tồn tại. Bạn hãy sử dụng Google Login hoặc tự đăng ký một tài khoản để test nhé!");
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

          <div className="pt-2 text-center">
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="text-xs font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto py-2"
            >
              <Zap size={14} /> Đăng nhập nhanh (Demo)
            </button>
          </div>

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
  // DocViewerModal state
  const [docViewerUrl, setDocViewerUrl] = useState<string | null>(null);
  const [docViewerTitle, setDocViewerTitle] = useState<string>("");

  const openDoc = (url: string, title: string) => {
    // Only embed if it's a direct linkable resource; Google search links open normally
    if (url.startsWith("http") && !url.includes("google.com/search") && url !== "#") {
      setDocViewerUrl(url);
      setDocViewerTitle(title);
    } else {
      // For search links or placeholder links, open externally
      if (url !== "#") window.open(url, "_blank", "noreferrer");
    }
  };

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
              <motion.div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => openDoc(res.link, res.title)}
                onKeyDown={e => e.key === "Enter" && openDoc(res.link, res.title)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-600 dark:hover:border-emerald-500 transition-all flex flex-col min-h-[280px] cursor-pointer"
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
                  <Book size={16} className="text-slate-300 dark:text-slate-600" />
                </div>
              </motion.div>
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

      {/* ── DocViewerModal ── In-app iframe document viewer */}
      <AnimatePresence>
        {docViewerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-stretch bg-slate-900/95 backdrop-blur-md"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0">
                  <Book size={18} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Tài liệu số</p>
                  <h3 className="text-sm font-black text-white truncate">{docViewerTitle}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <a
                  href={docViewerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all"
                >
                  <ExternalLink size={13} /> Mở tab mới
                </a>
                <button
                  onClick={() => { setDocViewerUrl(null); setDocViewerTitle(""); }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  aria-label="Đóng"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* iframe */}
            <iframe
              src={docViewerUrl}
              className="flex-1 w-full border-0 bg-white"
              title={docViewerTitle}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </motion.div>
        )}
      </AnimatePresence>
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
        // API now returns { primary, alternativeVideos, items }
        const courseList = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        setCourses(courseList);
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

  const [alternativeVideos, setAlternativeVideos] = useState<any[]>([]);
  const [isSearchingAlts, setIsSearchingAlts] = useState(false);
  const [customVideoId, setCustomVideoId] = useState<string | null>(null);

  // AI Exercise States
  const [aiExercise, setAiExercise] = useState<any | null>(null);
  const [isGeneratingExercise, setIsGeneratingExercise] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
  const [writingInputs, setWritingInputs] = useState<Record<number, string>>({});
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [codeFeedback, setCodeFeedback] = useState<any | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Dynamic AI Quiz States (for Complete Lesson requirement)
  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Helper: Generate AI Practice Exercise
  const generateAiExercise = async () => {
    const activeLesson = course?.lessons[activeLessonIdx];
    if (!activeLesson || !course) return;

    setIsGeneratingExercise(true);
    setGenerationError(null);
    setAiExercise(null);
    setCodeFeedback(null);
    setSubmittedCode("");
    setQuizAnswers({});
    setShowSolutions({});
    setWritingInputs({});

    try {
      const response = await fetch("/api/generate-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: customVideoId || activeLesson.videoId,
          lessonTitle: activeLesson.title,
          courseTitle: course.title,
          category: course.category
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate exercise.");
      }

      const data = await response.json();
      if (data.success && data.exercise) {
        setAiExercise(data.exercise);
        if (data.exercise.type === "code_challenge" && data.exercise.codeChallenge?.starterCode) {
          setSubmittedCode(data.exercise.codeChallenge.starterCode);
        }
      } else {
        throw new Error("No exercise data returned from server.");
      }
    } catch (err: any) {
      console.error("Error generating AI exercise:", err);
      setGenerationError(err.message || "Đã xảy ra lỗi khi tạo bài tập AI.");
    } finally {
      setIsGeneratingExercise(false);
    }
  };

  // Helper: Submit code challenge for AI evaluation
  const submitCodeChallenge = async () => {
    const activeLesson = course?.lessons[activeLessonIdx];
    if (!activeLesson || !aiExercise?.codeChallenge) return;

    setIsValidatingCode(true);
    setCodeFeedback(null);

    try {
      const response = await fetch("/api/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: submittedCode,
          starterCode: aiExercise.codeChallenge.starterCode,
          instructions: aiExercise.codeChallenge.instructions || aiExercise.description,
          expectedOutput: aiExercise.codeChallenge.expectedOutput,
          lessonTitle: activeLesson.title
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to validate code.");
      }

      const feedback = await response.json();
      setCodeFeedback(feedback);
    } catch (err: any) {
      console.error("Error validating code challenge:", err);
      setCodeFeedback({
        passed: false,
        score: 0,
        feedback: `Lỗi kết nối hoặc xử lý AI: ${err.message}. Bạn vui lòng thử lại nhé!`
      });
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Helper: Start AI Complete Lesson Quiz Flow
  const startCompleteLessonQuiz = async () => {
    const activeLesson = course?.lessons[activeLessonIdx];
    if (!activeLesson || !course) return;

    // If already completed, just allow direct navigation or trigger the normal completeLesson (which moves forward)
    if (completedLessons.includes(activeLesson.id)) {
      completeLesson(activeLesson.id);
      return;
    }

    if (!user) {
      alert("Vui lòng đăng nhập để tham gia bài trắc nghiệm và lưu kết quả!");
      return;
    }

    setIsGeneratingQuiz(true);
    setQuizError(null);
    setQuizData(null);
    setUserAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
    setShowQuizModal(true);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeLesson.title,
          description: course.description || "",
          exercise: activeLesson.exercise || ""
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Không thể khởi tạo bộ câu hỏi trắc nghiệm.");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuizData(data);
      } else {
        throw new Error("Không nhận được dữ liệu trắc nghiệm hợp lệ từ AI.");
      }
    } catch (err: any) {
      console.error("Error generating complete lesson quiz:", err);
      setQuizError(err.message || "Đã xảy ra lỗi khi lập đề trắc nghiệm.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Helper: Submit complete lesson quiz answers (10 questions, 8/10 to pass)
  const submitQuizAnswers = () => {
    if (!quizData) return;

    let correctCount = 0;
    quizData.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount >= 8) {
      // Passed (>= 8/10 correct)
      setTimeout(async () => {
        const activeLesson = course?.lessons[activeLessonIdx];
        if (activeLesson) {
          await completeLesson(activeLesson.id);
          setShowQuizModal(false);
        }
      }, 2500);
    }
  };

  useEffect(() => {
    if (!course) return;
    const activeLesson = course.lessons[activeLessonIdx];
    if (!activeLesson) return;

    setCustomVideoId(null);
    setAlternativeVideos([]);
    setIsSearchingAlts(true);

    // Reset AI state on lesson switch
    setAiExercise(null);
    setGenerationError(null);
    setQuizAnswers({});
    setShowSolutions({});
    setWritingInputs({});
    setSubmittedCode("");
    setCodeFeedback(null);

    // Reset Dynamic Complete Lesson Quiz states
    setQuizData(null);
    setIsGeneratingQuiz(false);
    setUserAnswers({});
    setQuizScore(null);
    setQuizError(null);
    setShowQuizModal(false);
    setQuizSubmitted(false);

    const searchQuery = `${course.title} ${activeLesson.title}`;
    fetch(`/api/courses?q=${encodeURIComponent(searchQuery)}`)
      .then(r => r.json())
      .then(data => {
        // API now returns { primary, alternativeVideos, items }
        const primaryVideo: any | null = data.primary ?? null;
        const altList: any[] = Array.isArray(data.alternativeVideos)
          ? data.alternativeVideos
          : [];

        // Set the first (primary) video from the API as the active video
        if (primaryVideo?.videoId) {
          setCustomVideoId(primaryVideo.videoId);
        }

        // Build alternative videos list from the API's alternativeVideos,
        // ensuring the primary video is not duplicated in the list
        const primaryId = primaryVideo?.videoId ?? null;
        const uniqueAlts = altList
          .filter(v => v.videoId && v.videoId !== primaryId)
          .map(v => ({
            videoId: v.videoId,
            title: v.title || "Video liên quan",
            author: v.author || "YouTube Creator",
            thumbnail: v.thumbnail || ""
          }))
          // Also exclude the lesson's own videoId to avoid duplicates
          .filter(v => v.videoId !== activeLesson.videoId)
          .slice(0, 8);

        setAlternativeVideos(uniqueAlts);
        setIsSearchingAlts(false);
      })
      .catch(err => {
        console.error("Error fetching alternative videos:", err);
        setIsSearchingAlts(false);
      });
  }, [course, activeLessonIdx]);

  useEffect(() => {
    fetch(`/api/courses`)
      .then(r => r.json())
      .then(data => {
        // API now returns { primary, alternativeVideos, items }
        const courseList = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        const found = courseList.find((c: any) => c.id === id);
        setCourse(found ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

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
  const currentVideoId = customVideoId || (activeLesson ? activeLesson.videoId : "");

  return (
    <div className="pt-24 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto transition-colors">
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold mb-6 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" onClick={() => navigate(-1)}>
        <ChevronRight className="rotate-180" size={18} /> Quay lại danh sách khóa học
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Player & Content */}
        <div className="lg:col-span-8 space-y-6">
              <div className="bg-black aspect-video rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl relative group">
                {currentVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
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

              {currentVideoId && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100/50 dark:bg-slate-900/40 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Gặp sự cố khi phát video? Một số video Youtube có thể giới hạn phát trong website.
                  </div>
                  <a 
                    href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    Xem trực tiếp trên YouTube <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Alternative sources bar */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-3d-sm transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tv className="text-emerald-500" size={20} />
                    <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">Nguồn phát dự phòng (YouTube)</h4>
                  </div>
                  {customVideoId && (
                    <button 
                      onClick={() => setCustomVideoId(null)}
                      className="text-xs font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                      Xóa nguồn tùy chỉnh
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-medium leading-relaxed">
                  Nếu video mặc định gặp lỗi không thể nhúng, bạn có thể chọn một trong các nguồn phát thay thế chất lượng cao bên dưới để tiếp tục buổi học:
                </p>

                {isSearchingAlts ? (
                  <div className="flex items-center gap-2 justify-center py-4 text-xs font-bold text-slate-400">
                    <Loader2 className="animate-spin text-emerald-500" size={16} /> Đang tìm nguồn thay thế...
                  </div>
                ) : alternativeVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {alternativeVideos.map((vid, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCustomVideoId(vid.videoId)}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-2xl border text-left transition-all active:scale-[0.98]",
                          currentVideoId === vid.videoId
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0 relative">
                          <img src={vid.thumbnail} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <PlayCircle size={14} className="text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-xs font-bold truncate",
                            currentVideoId === vid.videoId ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                          )}>
                            {vid.title}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate mt-0.5">
                            Kênh: {vid.author}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400 font-bold">
                    Không tìm thấy nguồn video thay thế tự động. Bạn hãy bấm nút "Xem trực tiếp trên YouTube" ở trên nhé!
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
                  onClick={startCompleteLessonQuiz}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
                    completedLessons.includes(activeLesson.id) 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" 
                      : "bg-slate-900 dark:bg-emerald-600 text-white shadow-lg hover:bg-emerald-600 dark:hover:bg-emerald-500"
                  )}
                >
                  {completedLessons.includes(activeLesson.id) ? <CheckCircle size={18} /> : <Zap size={18} />}
                  {completedLessons.includes(activeLesson.id) ? "Đã Hoàn Thành" : "Làm Quiz để Hoàn thành"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 mt-6">
              {/* Core Exercise Workspace */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 transition-all">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                      <BrainCircuit size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        Hệ thống Luyện tập thông minh
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        Phân tích nội dung & Cá nhân hóa bởi AI
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!aiExercise && (
                      <button
                        onClick={generateAiExercise}
                        disabled={isGeneratingExercise}
                        className={cn(
                          "px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95 shadow-md",
                          isGeneratingExercise
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/10"
                        )}
                      >
                        <Sparkles size={14} className={cn(isGeneratingExercise && "animate-spin")} />
                        {isGeneratingExercise ? "Đang lập đề..." : "✨ Kích hoạt Bài tập Thực hành AI"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Default/Static Exercise view if AI is not active */}
                {!aiExercise && !isGeneratingExercise && !generationError && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-black text-sm">
                        <FileText size={16} className="text-emerald-500" /> Nhiệm vụ bài học (Mặc định)
                      </div>
                      <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                        "{activeLesson.exercise}"
                      </div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-2">
                          <Sparkles size={16} /> Bứt phá hiệu suất học tập cùng AI!
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          Bằng cách kích hoạt chế độ AI, hệ thống sẽ tự động quét phụ đề (transcript) của video này từ YouTube để biên soạn bài tập trắc nghiệm, thử thách viết code hoặc câu hỏi tự luận sát thực tế nhất cho bài học này.
                        </p>
                      </div>
                      <button
                        onClick={generateAiExercise}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all text-center self-start"
                      >
                        Thử ngay bài tập AI →
                      </button>
                    </div>
                  </div>
                )}

                {/* Generating Loading State */}
                {isGeneratingExercise && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                      <BrainCircuit size={28} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                    </div>
                    <h4 className="text-base font-black text-slate-800 dark:text-white mb-2">Đang xử lý tài liệu video</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md font-bold leading-relaxed animate-pulse">
                      Hệ thống đang tải phụ đề YouTube, trích xuất dữ liệu bài học và đồng bộ với Gemini AI để xây dựng giáo án thực hành cá nhân hóa dành riêng cho bạn...
                    </p>
                  </div>
                )}

                {/* Generation Error State */}
                {generationError && (
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-red-700 dark:text-red-400 mb-1">Không thể kích hoạt bài tập AI</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                        AI hiện đang quá tải hoặc video bị giới hạn phụ đề. Bạn có thể thử lại hoặc dùng bài tập mặc định!
                      </p>
                      <p className="text-[11px] text-red-500/70 font-mono mb-4 break-all">{generationError}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={generateAiExercise}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                        >
                          Thử lại với AI
                        </button>
                        <button
                          onClick={() => setGenerationError(null)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                        >
                          Sử dụng bài học mặc định
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render Loaded AI Exercise */}
                {aiExercise && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Header info badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          aiExercise.type === "code_challenge" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          aiExercise.type === "quiz" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                          aiExercise.type === "qa_writing" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}>
                          {aiExercise.type === "code_challenge" ? "💻 Thử thách Viết Code" : 
                           aiExercise.type === "quiz" ? "📝 Trắc nghiệm Tương tác" : "✍️ Thực hành Tự luận & Tư duy"}
                        </span>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white mt-2">{aiExercise.title}</h4>
                      </div>
                      <button
                        onClick={generateAiExercise}
                        disabled={isGeneratingExercise}
                        className="text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles size={12} /> Làm đề AI mới
                      </button>
                    </div>

                    {/* Description & Instruction */}
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold prose max-w-none dark:prose-invert">
                      {aiExercise.description}
                    </div>

                    {/* EXERCISE CONTENT BY TYPE */}

                    {/* Type 1: CODE CHALLENGE */}
                    {aiExercise.type === "code_challenge" && aiExercise.codeChallenge && (
                      <div className="space-y-6">
                        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl font-mono text-xs space-y-3 shadow-lg border border-slate-800">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                            <span>💻 Interactive Workspace ({aiExercise.codeChallenge.language || "python"})</span>
                            <button 
                              onClick={() => setSubmittedCode(aiExercise.codeChallenge.starterCode || "")}
                              className="hover:text-white transition-colors"
                            >
                              [Reset Code]
                            </button>
                          </div>
                          <div className="text-slate-300 italic mb-2">
                            # Đề bài: {aiExercise.codeChallenge.instructions}
                          </div>
                          {aiExercise.codeChallenge.expectedOutput && (
                            <div className="text-emerald-400/90 mb-4">
                              # Đầu ra mong đợi: {aiExercise.codeChallenge.expectedOutput}
                            </div>
                          )}
                          <textarea
                            value={submittedCode}
                            onChange={(e) => setSubmittedCode(e.target.value)}
                            className="w-full h-48 bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-4 font-mono text-xs text-emerald-400 resize-none outline-none leading-relaxed"
                            placeholder="# Hãy viết mã nguồn của bạn vào đây..."
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={submitCodeChallenge}
                            disabled={isValidatingCode || !submittedCode.trim()}
                            className={cn(
                              "px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md",
                              isValidatingCode || !submittedCode.trim()
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/10 active:scale-95"
                            )}
                          >
                            {isValidatingCode ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                            {isValidatingCode ? "AI đang chấm điểm..." : "Nộp bài & AI nhận xét"}
                          </button>
                          
                          <button
                            onClick={() => setShowSolutions(prev => ({ ...prev, code: !prev.code }))}
                            className="px-6 py-3 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          >
                            {showSolutions['code'] ? "Ẩn gợi ý giải" : "Xem gợi ý giải"}
                          </button>
                        </div>

                        {/* AI Code Feedback output */}
                        {codeFeedback && (
                          <div className={cn(
                            "p-6 rounded-3xl border animate-slideUp space-y-4",
                            codeFeedback.passed 
                              ? "bg-emerald-500/5 border-emerald-500/20" 
                              : "bg-amber-500/5 border-amber-500/20"
                          )}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-3 h-3 rounded-full animate-ping",
                                  codeFeedback.passed ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                                <h5 className={cn(
                                  "text-sm font-black",
                                  codeFeedback.passed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                )}>
                                  {codeFeedback.passed ? "Chúc mừng! Đã vượt qua thành công 🎉" : "Cần sửa lại một chút 💪"}
                                </h5>
                              </div>
                              <span className="text-xl font-black bg-slate-900 text-white px-4 py-1.5 rounded-2xl shadow-sm font-mono">
                                {codeFeedback.score}/100
                              </span>
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                              {codeFeedback.feedback}
                            </div>

                            {codeFeedback.refactoredCode && (
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Mã nguồn mẫu tối ưu từ AI:</p>
                                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-900">
                                  {codeFeedback.refactoredCode}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Toggleable Solution code */}
                        {showSolutions['code'] && (
                          <div className="p-5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 animate-slideUp space-y-3">
                            <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                              <HelpCircle size={14} /> Ý tưởng & Gợi ý xử lý:
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              Hãy chú ý kiểm tra đúng các kiểu dữ liệu, viết hàm chuẩn hóa đầu vào và in/trả về kết quả đúng với mô tả trong "Đầu ra mong đợi" để vượt qua các điều kiện kiểm tra nhé!
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Type 2: INTERACTIVE QUIZ */}
                    {aiExercise.type === "quiz" && aiExercise.quizQuestions && (
                      <div className="space-y-8">
                        {aiExercise.quizQuestions.map((q: any, qIdx: number) => {
                          const isAnswered = quizAnswers[qIdx] !== undefined;
                          const selectedAnswer = quizAnswers[qIdx];
                          return (
                            <div key={qIdx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                              <h5 className="text-sm font-black text-slate-800 dark:text-white flex items-start gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2 py-1 rounded-lg">Câu {qIdx + 1}</span>
                                <span>{q.question}</span>
                              </h5>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const isSelectedIdx = selectedAnswer === optIdx;
                                  const isCorrectIdx = q.correctAnswerIdx === optIdx;
                                  
                                  return (
                                    <button
                                      key={optIdx}
                                      disabled={isAnswered}
                                      onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                      className={cn(
                                        "p-4 rounded-2xl text-xs font-bold text-left transition-all flex items-center justify-between border active:scale-[0.98]",
                                        !isAnswered && "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                                        isAnswered && isCorrectIdx && "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                                        isAnswered && isSelectedIdx && !isCorrectIdx && "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
                                        isAnswered && !isSelectedIdx && !isCorrectIdx && "bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-900 text-slate-400"
                                      )}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && isCorrectIdx && (
                                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                                      )}
                                      {isAnswered && isSelectedIdx && !isCorrectIdx && (
                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold">✕</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Interactive Explanation Box */}
                              {isAnswered && (
                                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl animate-slideUp space-y-1">
                                  <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Lời giải chi tiết:</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Type 3: CRITICAL THINKING / WRITING */}
                    {aiExercise.type === "qa_writing" && aiExercise.writingTasks && (
                      <div className="space-y-6">
                        {aiExercise.writingTasks.map((t: any, tIdx: number) => {
                          const isSolutionShown = showSolutions[tIdx];
                          return (
                            <div key={tIdx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                              <h5 className="text-sm font-black text-slate-800 dark:text-white flex items-start gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2 py-1 rounded-lg">Bài tập {tIdx + 1}</span>
                                <span>{t.prompt}</span>
                              </h5>

                              <textarea
                                value={writingInputs[tIdx] || ""}
                                onChange={(e) => setWritingInputs(prev => ({ ...prev, [tIdx]: e.target.value }))}
                                className="w-full h-32 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl p-4 font-semibold text-xs text-slate-700 dark:text-slate-300 resize-none outline-none leading-relaxed"
                                placeholder="Hãy tự viết câu trả lời hoặc suy nghĩ của bạn tại đây để kiểm tra mức độ hiểu bài học..."
                              />

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowSolutions(prev => ({ ...prev, [tIdx]: !prev[tIdx] }))}
                                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                                >
                                  {isSolutionShown ? "Ẩn gợi ý giải đáp" : "💡 Xem gợi ý giải đáp mẫu"}
                                </button>
                              </div>

                              {/* Suggestion block */}
                              {isSolutionShown && (
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-slideUp space-y-2">
                                  <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Gợi ý bài giải tối ưu mẫu:</p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-line">
                                    {t.suggestedAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

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

      {/* Beautiful AI Quiz Modal for Course Completion Verification */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                // Only allow closing if not currently generating or successfully completed
                if (!isGeneratingQuiz && (!quizSubmitted || (quizScore !== null && quizScore < 2))) {
                  setShowQuizModal(false);
                }
              }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <BrainCircuit size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">AI Quiz Hoàn Thành Bài Học</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Trả lời đúng ít nhất 8/10 câu hỏi để hoàn thành bài giảng và nhận huy chương!</p>
                  </div>
                </div>
                {!isGeneratingQuiz && (!quizSubmitted || (quizScore !== null && quizScore < 2)) && (
                  <button
                    onClick={() => setShowQuizModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Body State 1: Loading / Generating Quiz */}
              {isGeneratingQuiz && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
                  <h4 className="text-base font-black text-slate-800 dark:text-white mb-2">Trí tuệ nhân tạo đang soạn đề...</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed font-semibold">
                    Gemini đang tổng hợp kiến thức từ bài học <b>"{activeLesson?.title}"</b> để tạo ra bộ 3 câu hỏi trắc nghiệm chất lượng cao dành riêng cho bạn.
                  </p>
                </div>
              )}

              {/* Body State 2: Error */}
              {!isGeneratingQuiz && quizError && (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-black flex-shrink-0">!</div>
                  <h4 className="text-base font-black text-red-600 dark:text-red-400 mb-2">Không thể tải đề thi trắc nghiệm</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto font-medium">{quizError}</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={startCompleteLessonQuiz}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-md"
                    >
                      Thử lại ngay
                    </button>
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              {/* Body State 3: Quiz Loaded & Answering */}
              {!isGeneratingQuiz && !quizError && quizData && (
                <div className="space-y-6">
                  {/* Render questions list */}
                  {quizData.map((q, qIdx) => {
                    const isSelected = userAnswers[qIdx] !== undefined;
                    const hasSubmitted = quizSubmitted;
                    const isCorrect = userAnswers[qIdx] === q.correctIndex;

                    return (
                      <div key={qIdx} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 transition-all text-left">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-start gap-2 mb-4">
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-lg flex-shrink-0">Câu {qIdx + 1}</span>
                          <span className="leading-relaxed">{q.question}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((option: string, oIdx: number) => {
                            const isCurrentSelection = userAnswers[qIdx] === oIdx;
                            let btnClass = "border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10";
                            let iconIndicator = null;

                            if (hasSubmitted) {
                              if (oIdx === q.correctIndex) {
                                // Correct option
                                btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                                iconIndicator = <span className="text-emerald-500 text-xs font-black">✓ Đúng</span>;
                              } else if (isCurrentSelection) {
                                // Wrong selection
                                btnClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-bold";
                                iconIndicator = <span className="text-red-500 text-xs font-black">✗ Sai</span>;
                              } else {
                                btnClass = "opacity-55 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed";
                              }
                            } else if (isCurrentSelection) {
                              btnClass = "bg-emerald-500 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-600 text-white font-bold shadow-md shadow-emerald-500/10";
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={hasSubmitted}
                                onClick={() => setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                className={cn(
                                  "w-full text-left p-4 rounded-xl border-2 text-xs font-semibold leading-relaxed transition-all flex items-center justify-between",
                                  btnClass
                                )}
                              >
                                <span className="flex-1 pr-2">{option}</span>
                                {iconIndicator}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Footer Actions / Results */}
                  <div className="border-t border-slate-50 dark:border-slate-800 pt-6 mt-6">
                    {!quizSubmitted ? (
                       <div className="flex items-center justify-between gap-4">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                          Đã làm: {Object.keys(userAnswers).length}/{quizData.length} câu
                        </p>
                        <button
                          onClick={submitQuizAnswers}
                          disabled={Object.keys(userAnswers).length < quizData.length}
                          className={cn(
                            "px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-md",
                            Object.keys(userAnswers).length === quizData.length
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                          )}
                        >
                          Nộp bài trắc nghiệm
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {quizScore !== null && quizScore >= 8 ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
                          >
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-black">🎉</div>
                            <h4 className="text-base font-black text-emerald-800 dark:text-emerald-400 mb-1">Xuất sắc vượt qua!</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Bạn đạt điểm số <span className="text-emerald-600 font-black">{quizScore}/10</span> câu đúng — Xuất sắc!
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse font-black uppercase tracking-wider">Đang lưu kết quả và chuyển tới bài học tiếp theo...</p>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
                          >
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-black">⚡</div>
                            <h4 className="text-base font-black text-red-600 dark:text-red-400 mb-1">Chưa đạt yêu cầu</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Bạn đạt <span className="text-red-500 font-black">{quizScore}/10</span>. Cần tối thiểu <span className="font-black text-amber-500">8/10</span> để nhận huy chương.
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-4">Hãy xem kỹ lại video bài học và thử lại nhé!</p>
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={startCompleteLessonQuiz}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                              >
                                Làm lại trắc nghiệm
                              </button>
                              <button
                                onClick={() => setShowQuizModal(false)}
                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                              >
                                Đóng và Ôn tập lại
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RewardsPage = ({ user }: { user: FirebaseUser | null }) => {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [totalMedals, setTotalMedals] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReward, setSuccessReward] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // 1 medal = 100 points
  const POINTS_PER_MEDAL = 100;

  const rewards = [
    {
      id: "shopee_50",
      title: "Shopee Voucher 50k",
      cost: 500,
      icon: "🛍️",
      gradient: "from-orange-400 to-red-500",
      desc: "Mã giảm giá 50.000₫ áp dụng cho mọi đơn hàng trên Shopee.",
      tag: "Phổ biến"
    },
    {
      id: "book_cleancode",
      title: "Sách Clean Code",
      cost: 1500,
      icon: "📚",
      gradient: "from-blue-500 to-indigo-600",
      desc: "Cuốn sách ‘gối đầu giường’ của mọi lập trình viên về viết mã sạch.",
      tag: "Giá trị cao"
    },
    {
      id: "mentor_session",
      title: "Mentor 1-on-1 (60 phút)",
      cost: 3000,
      icon: "🧑‍🏫",
      gradient: "from-emerald-500 to-teal-600",
      desc: "Buổi tư vấn 1-1 với chuyên gia giàu kinh nghiệm trong lĩnh vực bạn chọn.",
      tag: "Premium"
    },
    {
      id: "premium_1m",
      title: "Gói Premium 1 Tháng",
      cost: 800,
      icon: "⚡",
      gradient: "from-amber-400 to-yellow-500",
      desc: "Mở khóa toàn bộ tài liệu chuyên sâu, bài giải mẫu và chứng chỉ trong 30 ngày.",
      tag: "Hật cơ"
    },
    {
      id: "gongcha_voucher",
      title: "Gongcha Voucher 100k",
      cost: 1000,
      icon: "🧃",
      gradient: "from-pink-400 to-rose-500",
      desc: "Phần thưởng ngọt ngào sau những buổi học chăm chỉ!",
      tag: "Hot 🔥"
    },
    {
      id: "sticker_pack",
      title: "Bộ Stickers SSH",
      cost: 200,
      icon: "🎨",
      gradient: "from-violet-400 to-purple-600",
      desc: "Bộ sticker độc quyền cực cool dán laptop, thể hiện phong cách lập trình viên.",
      tag: "Mới"
    }
  ];

  useEffect(() => {
    if (!user) return;

    const medalsQ = query(collection(db, "medals"), where("userId", "==", user.uid));
    const unsubMedals = onSnapshot(medalsQ, (snap) => {
      setTotalMedals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "medals"));

    const redemptionsQ = query(collection(db, "redemptions"), where("userId", "==", user.uid), orderBy("redeemedAt", "desc"));
    const unsubRedemptions = onSnapshot(redemptionsQ, (snap) => {
      setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "redemptions"));

    return () => { unsubMedals(); unsubRedemptions(); };
  }, [user]);

  const totalEarnedPoints = totalMedals.length * POINTS_PER_MEDAL;
  const totalSpentPoints = redemptions.reduce((acc, curr) => acc + (curr.costPoints || 0), 0);
  const availablePoints = totalEarnedPoints - totalSpentPoints;

  const handleRedeem = async (rw: typeof rewards[0]) => {
    if (!user) { alert("Vui lòng đăng nhập để đổi quà!"); return; }
    if (availablePoints < rw.cost) {
      setErrorMsg(`Bạn cần thêm ${rw.cost - availablePoints} điểm để đổi “${rw.title}”.`);
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }
    setIsProcessing(true);
    setErrorMsg("");
    try {
      const randHex = Math.random().toString(16).substring(2, 10).toUpperCase();
      const code = `SSH-${rw.id.split("_")[0].toUpperCase()}-${randHex}`;
      await addDoc(collection(db, "redemptions"), {
        userId: user.uid,
        rewardId: rw.id,
        rewardTitle: rw.title,
        costPoints: rw.cost,
        promoCode: code,
        redeemedAt: serverTimestamp()
      });
      // Update user points record
      await setDoc(doc(db, "users", user.uid), {
        totalSpentPoints: totalSpentPoints + rw.cost,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccessReward({ ...rw, code });
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Đã xảy ra lỗi trong quá trình đổi quà. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center dark:bg-slate-950 transition-colors">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-10 rounded-[45px] shadow-3d-sm border border-slate-100 dark:border-slate-800">
          <Gift size={64} className="text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black mb-4">Vui lòng đăng nhập để đổi quà</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium">Tích lũy điểm thưởng qua từng bài học, đổi quà hấp dẫn!</p>
          <Link to="/login" className="block w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all">Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto dark:bg-slate-950 transition-colors">

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-[40px] p-8 md:p-12 mb-10 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 40%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Cửa Hàng Phần Thưởng</p>
            <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">Reward Store</h1>
            <p className="text-slate-300 font-medium text-sm max-w-md">Hoàn thành khóa học → nhận huy chương → quy đổi điểm → đổi quà xịt!</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1">Điểm hiện có</p>
              <p className="text-4xl font-black text-amber-300 leading-none">{availablePoints.toLocaleString()}</p>
              <p className="text-[10px] text-white/50 font-bold mt-1">pts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-1">Huy chương</p>
              <p className="text-4xl font-black text-emerald-300 leading-none">{totalMedals.length}</p>
              <p className="text-[10px] text-white/50 font-bold mt-1">{POINTS_PER_MEDAL} pts/hc</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative z-10 mt-8">
          <div className="flex items-center justify-between text-xs font-bold text-white/60 mb-2">
            <span>Tổng điểm tích lũy: {totalEarnedPoints.toLocaleString()} pts</span>
            <span>Đã dùng: {totalSpentPoints.toLocaleString()} pts</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: totalEarnedPoints > 0 ? `${(availablePoints / totalEarnedPoints) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Earning guide */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
          <Trophy className="text-emerald-600" size={20} />
        </div>
        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">
          Cách kiếm điểm: Hoàn thành toàn bộ bài học trong một khóa học để nhận <span className="text-emerald-600 font-black">1 huy chương = 100 điểm</span>. Đạt điểm kỳ thi tối thiểu 8/10 để hoàn thành mỗi bài!
        </p>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-4 mb-6 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-3 border border-red-100 dark:border-red-900/20"
          >
            <X size={18} /> {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Grid */}
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Chọn quà của bạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {rewards.map((rw) => {
          const isAffordable = availablePoints >= rw.cost;
          return (
            <motion.div
              key={rw.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Gradient top bar */}
              <div className={`h-2 bg-gradient-to-r ${rw.gradient}`} />
              {rw.tag && (
                <span className={`absolute top-5 right-5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r ${rw.gradient} text-white shadow-sm`}>
                  {rw.tag}
                </span>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="text-5xl mb-4">{rw.icon}</div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{rw.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">{rw.desc}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-amber-500">{rw.cost.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>
                  {!isAffordable && (
                    <span className="text-[10px] font-bold text-red-400">
                      Cần thêm {(rw.cost - availablePoints).toLocaleString()} pts
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRedeem(rw)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95",
                    isAffordable
                      ? `bg-gradient-to-r ${rw.gradient} text-white shadow-md hover:shadow-lg hover:opacity-90 cursor-pointer`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? "Đang xử lý..." : isAffordable ? "Đổi quà ngay" : "Chưa đủ điểm"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Redemption History */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Gift size={24} className="text-emerald-500" /> Lịch sử đổi quà
        </h3>
        {redemptions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {redemptions.map((red) => (
              <div key={red.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">{red.rewardTitle}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide mt-1">
                    {red.costPoints?.toLocaleString()} pts &bull; {red.redeemedAt?.toDate ? red.redeemedAt.toDate().toLocaleString('vi-VN') : 'Vừa xong'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-black text-slate-700 dark:text-slate-300">
                    {red.promoCode}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">Sẵn sàng dùng</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Gift size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold text-sm">Bạn chưa đổi phần quà nào. Hãy tích cực hoàn thành khóa học để tích điểm nhé!</p>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setSuccessReward(null)} />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 z-10"
            >
              <div className="text-6xl mb-4">{successReward.icon}</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Đổi quà thành công! 🎉</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                Bạn đã đổi thành công <span className="font-black text-slate-800 dark:text-white">{successReward.title}</span>
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mã ưu đãi của bạn</p>
                <p className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-wider">{successReward.code}</p>
              </div>
              <button
                onClick={() => setSuccessReward(null)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all"
              >
                Tuyệt vời!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FlashcardsPage — 3D flip cards with AI generation + Firestore persistence
// ─────────────────────────────────────────────────────────────────────────────

interface Flashcard { id: string; front: string; back: string; }

const FlipCard = ({ card, idx }: { card: Flashcard; idx: number }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={() => setFlipped(f => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 200 }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-shadow"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">Mặt trước • Nhấn để lật</span>
          <p className="text-base font-black text-slate-800 dark:text-white text-center leading-relaxed">{card.front}</p>
          <div className="mt-4 w-8 h-1 bg-emerald-400 rounded-full" />
        </div>
        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[28px] p-6 flex flex-col items-center justify-center shadow-md"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-3">Mặt sau • Giải thích</span>
          <p className="text-sm font-semibold text-white text-center leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FlashcardsPage = ({ user }: { user: FirebaseUser | null }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'add' | 'ai'>('browse');

  // Load saved flashcards from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "flashcards"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setCards(snap.docs.map(d => ({ id: d.id, ...d.data() } as Flashcard)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user?.uid}/flashcards`));
    return () => unsub();
  }, [user]);

  const saveCard = async (newCard: Omit<Flashcard, 'id'>) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "flashcards"), {
      ...newCard,
      createdAt: serverTimestamp()
    });
  };

  const handleAddCard = async () => {
    if (!front.trim() || !back.trim()) return;
    setIsSaving(true);
    try {
      await saveCard({ front: front.trim(), back: back.trim() });
      setFront(""); setBack("");
    } finally { setIsSaving(false); }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", user.uid, "flashcards", cardId));
    } catch (err) {
      console.error("Delete flashcard error:", err);
    }
  };

  const handleGenerateAI = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo flashcards.");
      }
      const data: Array<{ front: string; back: string }> = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error("AI trả về dữ liệu rỗng.");
      // Save all generated cards to Firestore if user is logged in
      if (user) {
        await Promise.all(data.map(c => saveCard({ front: c.front, back: c.back })));
      }
      setTopic("");
    } catch (err: any) {
      setGenError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs: { key: 'browse' | 'add' | 'ai'; label: string; icon: React.ReactNode }[] = [
    { key: 'browse', label: `Thẻ của tôi (${cards.length})`, icon: <BookOpen size={16} /> },
    { key: 'add',    label: 'Tạo thẻ mới',               icon: <Plus size={16} /> },
    { key: 'ai',     label: 'AI Tạo đồng loạt',          icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="pt-28 pb-20 px-4 md:px-6 max-w-7xl mx-auto dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Đọc lập hoà Ghi nhớ</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Flashcards 🃏</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
          Hệ thống thẻ ghi nhớ thông minh — tự tạo hoặc để AI tạo cho bạn. Nhấp vào thẻ để lật và xem đáp án!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              activeTab === t.key
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Browse cards */}
      {activeTab === 'browse' && (
        <>
          {cards.length === 0 ? (
            <div className="text-center py-32 opacity-30">
              <BrainCircuit size={80} className="mx-auto mb-6" />
              <p className="text-xl font-black">Chưa có thẻ nào. Hãy tạo thẻ đầu tiên của bạn!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <div key={card.id} className="relative group">
                  <FlipCard card={card} idx={idx} />
                  {user && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-md z-10"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Add card manually */}
      {activeTab === 'add' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Tạo thẻ thủ công</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-2 mb-1.5 block">Mặt trước (câu hỏi / khái niệm)</label>
                <textarea
                  value={front}
                  onChange={e => setFront(e.target.value)}
                  placeholder="VD: Arrow function là gì?"
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white resize-none transition-all border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-2 mb-1.5 block">Mặt sau (câu trả lời / giải thích)</label>
                <textarea
                  value={back}
                  onChange={e => setBack(e.target.value)}
                  placeholder="VD: Arrow function là cú pháp ngắn gọn hơn của function expression..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white resize-none transition-all border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800"
                />
              </div>
              <button
                onClick={handleAddCard}
                disabled={!front.trim() || !back.trim() || isSaving}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {isSaving ? "Đang lưu..." : "Thêm thẻ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Generate */}
      {activeTab === 'ai' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-emerald-500" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">AI Tạo đồng loạt</h2>
                <p className="text-xs text-slate-400 font-bold">Nhập chủ đề — AI sẽ tạo 10 thẻ ghi nhớ ngay lập tức</p>
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerateAI()}
                placeholder="VD: React Hooks, Python OOP, IELTS Vocabulary..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800 transition-all"
              />
              <button
                onClick={handleGenerateAI}
                disabled={!topic.trim() || isGenerating}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap shadow-md"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? "Đang tạo..." : "Tạo ngay"}
              </button>
            </div>
            {genError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                <AlertCircle size={16} />{genError}
              </div>
            )}
            {isGenerating && (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-sm font-black text-slate-600 dark:text-slate-400 animate-pulse">
                  Gemini đang tạo 10 thẻ ghi nhớ về “{topic}”...
                </p>
              </div>
            )}
            {!isGenerating && !genError && (
              <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">💡 Gợi ý chủ đề</p>
                <div className="flex flex-wrap gap-2">
                  {['React Hooks', 'Python OOP', 'IELTS Vocabulary', 'SQL cơ bản', 'Machine Learning', 'Quản lý thời gian', 'CSS Flexbox', 'Git cơ bản'].map(s => (
                    <button key={s} onClick={() => setTopic(s)}
                      className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition-all"
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

