import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  motion, 
  AnimatePresence 
} from "framer-motion";
import { 
  BookOpen, 
  Search, 
  User, 
  LogOut, 
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
  X
} from "lucide-react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
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

const Navbar = ({ user }: { user: FirebaseUser | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const path = `users/${u.uid}`;
      try {
        await setDoc(doc(db, "users", u.uid), {
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => signOut(auth);

  const navLinks = [
    { name: "Trang Chủ", path: "/", icon: <Home size={18} /> },
    { name: "Kỹ Năng", path: "/skills", icon: <Layout size={18} /> },
    { name: "Tài Liệu", path: "/resources", icon: <BookOpen size={18} /> },
    { name: "Cộng Đồng", path: "/community", icon: <Users size={18} /> },
    { name: "Về Chúng Tôi", path: "/about", icon: <Info size={18} /> },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/80 backdrop-blur-lg shadow-md py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight hidden sm:block">Self-Study Hub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "text-sm font-semibold transition-colors flex items-center gap-2",
                location.pathname === link.path ? "text-emerald-600" : "text-slate-600 hover:text-emerald-500"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-32 focus:w-48 transition-all"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                <button onClick={logout} className="text-[10px] text-slate-400 hover:text-red-500 font-semibold uppercase tracking-wider">Đăng Xuất</button>
              </div>
              <img 
                src={user.photoURL || "/default-avatar.png"} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-emerald-500 ring-2 ring-emerald-500/20"
              />
            </div>
          ) : (
            <button 
              onClick={login}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-3d hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
              <User size={18} />
              <span>Đăng Nhập</span>
            </button>
          )}

          <button 
            className="lg:hidden text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
                    "flex items-center gap-4 p-3 rounded-xl transition-all",
                    location.pathname === link.path ? "bg-emerald-50 text-emerald-600" : "text-slate-600 active:bg-slate-50"
                  )}
                >
                  {link.icon}
                  <span className="font-bold">{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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

const CommunityPage = ({ user }: { user: FirebaseUser | null }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [input, setInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const path = "posts";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  const createPost = async () => {
    if (!user || !input.trim() || isPosting) return;
    setIsPosting(true);
    const path = "posts";
    try {
      await addDoc(collection(db, path), {
        authorId: user.uid,
        authorName: user.displayName,
        content: input.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-black mb-10 text-center">Cộng Đồng Học Tập</h1>
      
      {/* Create Post */}
      <div className="bg-white p-6 rounded-3xl shadow-3d-sm border border-slate-100 mb-12">
        <div className="flex gap-4">
          <img src={user?.photoURL || "/default-avatar.png"} className="w-12 h-12 rounded-full" alt="avatar" />
          <div className="flex-1">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "Bạn muốn chia sẻ điều gì hôm nay?" : "Vui lòng đăng nhập để đăng bài..."}
              disabled={!user}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all resize-none min-h-[120px]"
            />
            <div className="mt-4 flex justify-end">
              <button 
                onClick={createPost}
                disabled={!user || !input.trim() || isPosting}
                className="bg-emerald-600 text-white px-8 py-2.5 rounded-full font-bold shadow-3d disabled:opacity-50 transition-all hover:bg-emerald-700 flex items-center gap-2"
              >
                {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Đăng Bài
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-8">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-3d-sm border border-slate-100 animate-pulse h-40" />
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          posts.map(post => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl shadow-3d-sm border border-slate-100"
            >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{post.authorName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {post.createdAt?.toDate().toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
              <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors font-bold text-sm">
                <Heart size={18} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors font-bold text-sm">
                <MessageSquare size={18} /> Phản hồi
              </button>
              <button className="ml-auto text-slate-400 hover:text-blue-500 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        )))}
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
        setCourses(data);
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
            <Route path="/community" element={<CommunityPage user={user} />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/resources" element={<SkillsPage />} />
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
              <Link to="/about" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">Về Chúng Tôi</Link>
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
