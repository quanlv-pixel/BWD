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
  User as UserIcon
} from "lucide-react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider
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
  getDoc,
  where
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
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
      >
        <img 
          src={user.photoURL || "/default-avatar.png"} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border border-emerald-500"
        />
        <div className="text-left hidden sm:block">
          <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">{user.displayName?.split(' ')[0]}</p>
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
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-50 mb-1">
              <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
              <UserIcon size={16} />
              <span>Hồ sơ của tôi</span>
            </Link>
            <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
              <Settings size={16} />
              <span>Cài đặt tài khoản</span>
            </Link>
            
            <div className="border-t border-slate-50 mt-1 pt-1">
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
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

const Navbar = ({ user, searchQuery, setSearchQuery, medalsCount }: { 
  user: FirebaseUser | null, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  medalsCount: number
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchQuery(localSearch);
      navigate('/skills');
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
      isScrolled ? "bg-white/80 backdrop-blur-lg shadow-md py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight hidden md:block">Self-Study Hub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "text-sm font-semibold transition-colors flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50",
                location.pathname === link.path ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:text-emerald-500"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden xl:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm khóa học..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 focus:w-48 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
               <Link to="/rewards" className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                <Trophy size={14} /> {medalsCount} Huy chương
              </Link>
            )}

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link 
                to="/login"
                className="bg-slate-900 text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold shadow-3d hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </Link>
            )}

            <button 
              className="lg:hidden text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-all"
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
            className="lg:hidden bg-white border-t border-slate-100 mt-4 overflow-hidden rounded-2xl shadow-xl"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    location.pathname === link.path ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-600 active:bg-slate-50 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(location.pathname === link.path ? "text-emerald-600" : "text-slate-400")}>
                    {link.icon}
                  </span>
                  <span className="font-bold text-lg">{link.name}</span>
                </Link>
              ))}
              {!user && (
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-4 bg-emerald-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 text-lg"
                >
                  <LogIn size={22} /> Đăng nhập ngay
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
  const location = useLocation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      await setDoc(doc(db, "users", u.uid), {
        uid: u.uid,
        displayName: u.displayName,
        photoURL: u.photoURL,
        email: u.email,
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return <div className="pt-60 text-center font-bold text-slate-400">Bạn đã đăng nhập. Đang chuyển hướng...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-400 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-3d p-10 relative z-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen size={30} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Self-Study Hub</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mừng bạn trở lại! 👋</h1>
          <p className="text-slate-500 font-medium leading-relaxed">Hãy đăng nhập để tiếp tục hành trình học tập cùng cộng đồng.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-700 font-black py-4 px-6 border-2 border-slate-100 rounded-3xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin text-emerald-600" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            )}
            <span>Tiếp tục với Google</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-300">
              <span className="bg-white px-4">HOẶC</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-4">Email của bạn</label>
              <input type="email" placeholder="email@example.com" className="w-full bg-slate-50 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-4">Mật khẩu</label>
              <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white font-black py-4 rounded-3xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95 mt-4">
            Đăng nhập hệ thống
          </button>

          <p className="text-center text-sm text-slate-400 font-bold py-4">
            Chưa có tài khoản? <Link to="/register" className="text-emerald-600 hover:underline">Đăng ký ngay</Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-300 font-bold uppercase tracking-widest leading-none">
          <div className="p-1 px-3 border border-slate-100 rounded-full flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Bảo mật SSL
          </div>
          <div className="p-1 px-3 border border-slate-100 rounded-full flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-500" />
            GDPR Ready
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Page Content ---

const HomePage = () => {
  return (
    <div className="space-y-24 pb-20">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Award size={14} /> nền tảng tự học số 1
            </div>
            <h1 className="text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 mb-8">
              LÀM CHỦ KỸ NĂNG, <br />
              <span className="text-gradient">THAY ĐỔI TƯƠNG LAI.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-xl leading-relaxed">
              Dù bạn là sinh viên mới hay chuẩn bị ra trường, chúng tôi đều có lộ trình cá nhân hóa giúp bạn dẫn đầu trong kỷ nguyên số.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/skills" className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-bold text-lg shadow-3d hover:scale-105 active:scale-95 transition-all text-center">
                Bắt Đầu Ngay
              </Link>
              <Link to="/resources" className="bg-white text-slate-900 px-8 py-4 rounded-3xl font-bold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
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
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-bounce-slow">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiến Độ</p>
                    <p className="text-lg font-black text-slate-900">850+ Giờ Học</p>
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
          <h2 className="text-4xl font-black text-slate-900 mb-4">Lộ Trình Đào Tạo Phổ Biến</h2>
          <p className="text-slate-500">Được thiết kế dựa trên nhu cầu tuyển dụng thực tế của doanh nghiệp.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Ngoại Ngữ", icon: <Globe size={40} />, color: "bg-blue-50 text-blue-600", desc: "Tiếng Anh cho IT, IELTS, Tiếng Nhật căn bản.", path: "/skills" },
            { title: "Lập Trình", icon: <Layout size={40} />, color: "bg-emerald-50 text-emerald-600", desc: "Web Front-end, Mobile App, Python & AI.", path: "/skills" },
            { title: "Kỹ Năng Mềm", icon: <Users size={40} />, color: "bg-amber-50 text-amber-600", desc: "Thuyết trình bản lĩnh, Quản lý thời gian.", path: "/skills" },
          ].map((cat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-3d-sm transition-all"
            >
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-8", cat.color)}>
                {cat.icon}
              </div>
              <h3 className="text-2xl font-black mb-4">{cat.title}</h3>
              <p className="text-slate-500 leading-relaxed mb-6">{cat.desc}</p>
              <Link to={cat.path} className="text-emerald-600 font-bold flex items-center gap-2 group">
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
    { name: "Tất cả", icon: <Layout size={18} /> },
    { name: "Lập trình Web", icon: <Code size={18} /> },
    { name: "Ngoại ngữ", icon: <Globe size={18} /> },
    { name: "Thiết kế Đồ họa", icon: <Layout size={18} /> },
    { name: "Kinh tế - Tài chính", icon: <TrendingUp size={18} /> },
    { name: "Kỹ năng mềm", icon: <Zap size={18} /> },
  ];

  const resources = [
    { title: "HTML & CSS căn bản", category: "Lập trình Web", link: "https://www.w3schools.com/html/" },
    { title: "Lộ trình tự học English 0-5.0", category: "Ngoại ngữ", link: "#" },
    { title: "Học Photoshop trong 7 ngày", category: "Thiết kế Đồ họa", link: "#" },
    { title: "Phân tích báo cáo tài chính", category: "Kinh tế - Tài chính", link: "#" },
    { title: "Clean Code Handbook", category: "Lập trình Web", link: "#" },
    { title: "Tư duy Marketing hiện đại", category: "Kinh tế - Tài chính", link: "#" },
  ];

  const filteredResources = activeCategory === "Tất cả" 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

  return (
    <div className="pt-20 flex min-h-screen bg-white">
      {/* Sidebar - Documentation Style */}
      <aside className="w-72 border-r border-slate-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50">
        <div className="p-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Danh mục tài liệu</h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveCategory(item.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                  activeCategory === item.name 
                    ? "bg-[#04AA6D] text-white shadow-lg" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4">{activeCategory}</h1>
            <p className="text-slate-500 font-medium italic">"Tri thức là sức mạnh, và sự tự học là chìa khóa mở cánh cửa tri thức."</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {filteredResources.map((res, i) => (
              <motion.a
                key={i}
                href={res.link}
                target="_blank"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#04AA6D] transition-all group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {res.category}
                  </span>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-[#04AA6D]" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-[#04AA6D] transition-colors">{res.title}</h3>
                <div className="mt-auto flex items-center gap-2 text-slate-400 font-bold text-xs">
                  Truy cập tài liệu <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="py-20 text-center opacity-30">
              <BookOpen size={64} className="mx-auto mb-4" />
              <p className="font-bold">Đang cập nhật thêm tài liệu cho mục này...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const SkillsPage = ({ searchQuery }: { searchQuery: string }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("Tất cả");
  const navigate = useNavigate();

  const tracks = [
    { name: "Tất cả", icon: <Layout size={18} /> },
    { name: "Lập trình & CNTT", icon: <Code size={18} /> },
    { name: "Ngoại Ngữ", icon: <Globe size={18} /> },
    { name: "Kinh tế - Marketing", icon: <TrendingUp size={18} /> },
    { name: "Kỹ năng mềm", icon: <Zap size={18} /> },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Use lower case category if it's not "Tất cả"
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
    <div className="pt-20 flex min-h-screen bg-slate-50">
      {/* Sidebar - W3Schools Course Tracks */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Lộ trình học tập</h2>
          <nav className="space-y-1">
            {tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => setActiveTrack(track.name)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left",
                  activeTrack === track.name 
                    ? "bg-[#282a35] text-white shadow-lg" 
                    : "text-slate-600 hover:bg-slate-100"
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
              <h1 className="text-4xl font-black mb-2 text-slate-900">
                {activeTrack !== "Tất cả" ? activeTrack : "Thư viện Khóa học"}
              </h1>
              <p className="text-slate-500 font-medium">
                {searchQuery ? `Kết quả cho "${searchQuery}"` : "Chọn lộ trình và bắt đầu hành trình chinh phục kiến thức."}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-white rounded-[32px] animate-pulse border border-slate-100 shadow-sm" />
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
                    className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black">{course.rating}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#04AA6D] transition-colors line-clamp-2">{course.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{course.description}</p>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Users size={14} /> {course.students.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#04AA6D] bg-emerald-50 px-3 py-1 rounded-full">
                          {course.difficulty}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {courses.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <Search size={64} className="mx-auto mb-4" />
                  <p className="text-xl font-bold">Không tìm thấy khóa học nào phù hợp</p>
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
      });
    }
  }, [id, user]);

  const toggleLesson = async (lessonId: string, idx: number) => {
    if (!user || !id || !course) return;
    
    setActiveLessonIdx(idx);

    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId];
    
    if (newCompleted.length !== completedLessons.length) {
      setCompletedLessons(newCompleted);

      // Update Firestore
      const isFinished = newCompleted.length === course.lessons.length;
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
    }
  };

  if (isLoading) return <div className="pt-60 text-center animate-pulse font-black text-slate-300">Đang tải lộ trình...</div>;
  if (!course) return <div className="pt-60 text-center font-black text-slate-900">Không tìm thấy khóa học.</div>;

  const progressPercent = Math.round((completedLessons.length / course.lessons.length) * 100);
  const activeLesson = course.lessons[activeLessonIdx];

  return (
    <div className="pt-24 pb-20 px-4 md:px-6 max-w-[1600px] mx-auto">
      <div className="flex items-center gap-2 text-slate-400 font-bold mb-6 hover:text-slate-900 transition-colors cursor-pointer" onClick={() => navigate(-1)}>
        <ChevronRight className="rotate-180" size={18} /> Quay lại danh sách khóa học
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Player & Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-black aspect-video rounded-[32px] overflow-hidden shadow-2xl relative group">
            {activeLesson.videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeLesson.videoId}?autoplay=1&modestbranding=1&rel=0`}
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

          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-3d-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-50 pb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">{activeLesson.title}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  <BookOpen size={14} /> Khóa học: {course.title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleLesson(activeLesson.id, activeLessonIdx)}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
                    completedLessons.includes(activeLesson.id) 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-slate-900 text-white shadow-lg hover:bg-emerald-600"
                  )}
                >
                  {completedLessons.includes(activeLesson.id) ? <CheckCircle size={18} /> : <Zap size={18} />}
                  {completedLessons.includes(activeLesson.id) ? "Đã Hoàn Thành" : "Xác nhận hoàn thành bài này"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FileText className="text-emerald-500" /> Bài tập thực hành
                </h3>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-700 leading-relaxed font-medium">
                  "{activeLesson.exercise}"
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Star className="text-amber-500" /> Ghi chú quan trọng
                </h3>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
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
          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-3d-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">
              Nội dung khóa học
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs">{progressPercent}%</span>
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {course.lessons.map((lesson, idx) => (
                <button 
                  key={lesson.id}
                  onClick={() => toggleLesson(lesson.id, idx)}
                  className={cn(
                    "w-full p-5 rounded-3xl border-2 transition-all text-left flex items-center gap-4 group",
                    activeLessonIdx === idx 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xl" 
                      : completedLessons.includes(lesson.id)
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                    activeLessonIdx === idx ? "bg-white/20" : "bg-slate-100 text-slate-400"
                  )}>
                    {completedLessons.includes(lesson.id) ? <CheckCircle size={18} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight line-clamp-1">{lesson.title}</p>
                    <p className={cn("text-[10px] font-bold uppercase mt-1", activeLessonIdx === idx ? "text-emerald-400" : "text-slate-400")}>
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
               <Link to="/rewards" className="inline-block px-8 py-3 bg-white text-amber-600 rounded-2xl font-black text-sm hover:shadow-lg transition-all">Đổi Quà Ngay</Link>
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
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Cửa Hàng Đổi Quà</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">Tích lũy huy chương từ các khóa học để đổi lấy những phần quà giá trị.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {rewards.map((rw, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-3d-sm flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:scale-110 transition-all">
              {rw.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{rw.title}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Giá: {rw.cost} Huy chương</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">{rw.desc}</p>
            <button 
              disabled={!user}
              className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 hover:text-white disabled:opacity-50 transition-all active:scale-95"
            >
              Đổi Quà
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main Root ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [medalsCount, setMedalsCount] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) {
      setMedalsCount(0);
      return;
    }
    const q = query(collection(db, "medals"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedalsCount(snapshot.size);
    }, (error) => {
      console.error("Medals fetch error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} medalsCount={medalsCount} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage user={user} />} />
            <Route path="/skills" element={<SkillsPage searchQuery={searchQuery} />} />
            <Route path="/course/:id" element={<CourseDetailPage user={user} />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/rewards" element={<RewardsPage user={user} />} />
            <Route path="*" element={<div className="pt-40 text-center font-black text-4xl opacity-10">Sẽ sớm cập nhật...</div>} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-100 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
              <p className="font-black">Self-Study Hub &copy; 2026</p>
            </div>
            <nav className="flex gap-8">
              <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Điều Khoản</a>
              <a href="#" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Liên Hệ</a>
            </nav>
          </div>
        </footer>

        <AIAssistant />
      </div>
    </BrowserRouter>
  );
}

