import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  BookOpen, 
  Search, 
  Home, 
  Globe, 
  Layout, 
  Users, 
  Info,
  Youtube,
  GraduationCap,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Menu,
  X,
  LogIn,
  LogOut, 
  Settings,
  User as UserIcon,
  ChevronDown,
  Bell,
  CheckCircle2
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
  getDoc
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

const Navbar = ({ user }: { user: FirebaseUser | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Trang Chủ", path: "/", icon: <Home size={18} /> },
    { name: "Kỹ Năng", path: "/skills", icon: <Layout size={18} /> },
    { name: "Tài Liệu", path: "/resources", icon: <BookOpen size={18} /> },
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
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 focus:w-48 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all hidden sm:flex">
              <Bell size={20} />
            </button>

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
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-3xl font-bold text-lg shadow-3d hover:scale-105 active:scale-95 transition-all">
                Bắt Đầu Ngay
              </button>
              <button className="bg-white text-slate-900 px-8 py-4 rounded-3xl font-bold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                <span>Xem Tài Liệu</span>
                <ChevronRight size={20} />
              </button>
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
            { title: "Ngoại Ngữ", icon: <Globe size={40} />, color: "bg-blue-50 text-blue-600", desc: "Tiếng Anh cho IT, IELTS, Tiếng Nhật căn bản." },
            { title: "Lập Trình", icon: <Layout size={40} />, color: "bg-emerald-50 text-emerald-600", desc: "Web Front-end, Mobile App, Python & AI." },
            { title: "Kỹ Năng Mềm", icon: <Users size={40} />, color: "bg-amber-50 text-amber-600", desc: "Thuyết trình bản lĩnh, Quản lý thời gian." },
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
              <Link to="/skills" className="text-emerald-600 font-bold flex items-center gap-2 group">
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
  const resources = [
    { 
      title: "Sách Lập Trình", 
      category: "Ebook", 
      icon: <BookOpen className="text-blue-500" />, 
      desc: "Tổng hợp các đầu sách kinh điển về sạch code, cấu trúc dữ liệu và giải thuật.",
      links: ["Clean Code", "You Don't Know JS", "Design Patterns"] 
    },
    { 
      title: "Công Cụ AI", 
      category: "AI Tools", 
      icon: <TrendingUp className="text-emerald-500" />, 
      desc: "Những trợ lý AI đắc lực giúp bạn viết code nhanh hơn và học tập thông minh hơn.",
      links: ["ChatGPT", "Claude AI", "Github Copilot"] 
    },
    { 
      title: "Ngoại Ngữ", 
      category: "Language", 
      icon: <Globe className="text-amber-500" />, 
      desc: "Nguồn học liệu tiếng Anh chuyên ngành và tiếng Anh giao tiếp cho người tự học.",
      links: ["Duolingo", "Memrise", "Oxford Learner's"] 
    },
    { 
      title: "Thiết Kế UI/UX", 
      category: "Design", 
      icon: <Layout className="text-purple-500" />, 
      desc: "Tài liệu về nguyên lý thiết kế, bảng màu và các công cụ thiết kế chuyên nghiệp.",
      links: ["Figma Tutorials", "Laws of UX", "Color Hunt"] 
    },
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Kho Tài Liệu Tổng Hợp</h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">
          "Học mà không có tài liệu như đi biển mà không có la bàn." - Chúng tôi đã chọn lọc những tài liệu chất lượng nhất dành cho bạn.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {resources.map((res, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-3d-sm flex flex-col group"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-inner group-hover:bg-slate-100 transition-colors">
              {res.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{res.category}</p>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{res.title}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed mb-auto">{res.desc}</p>
            
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-50">
              {res.links.map((link, i) => (
                <div key={i} className="flex items-center gap-3 group/item cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full group-hover/item:scale-150 group-hover/item:bg-emerald-600 transition-all" />
                  <span className="text-sm font-semibold text-slate-600 group-hover/item:text-emerald-600 transition-colors">{link}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SkillsPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("Courses data is not an array:", data);
          setCourses([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch courses error:", err);
        setCourses([]);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Thư Viện Bài Giảng</h1>
        <p className="text-slate-500">Cập nhật những kỹ năng mới nhất trực tiếp từ YouTube.</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-video bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <motion.div 
              key={course.id}
              whileHover={{ scale: 1.02 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-3d-sm hover:shadow-3d transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                    <Youtube size={24} />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Miễn Phí
                  </span>
                  <span className="text-xs text-slate-400 font-medium tracking-tight">Kênh: {course.author}</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 line-clamp-2">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed">{course.description}</p>
                <a 
                  href={`https://www.youtube.com/watch?v=${course.id}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg group-hover:bg-emerald-600 transition-all"
                >
                  <GraduationCap size={20} />
                  Bắt Đầu Học
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Root ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar user={user} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage user={user} />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="*" element={<div className="pt-40 text-center font-black text-4xl opacity-10">Sẽ sớm cập nhật...</div>} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-100 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
              <p className="font-black">Self-Study Hub &copy; 2024</p>
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

const Loader2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
