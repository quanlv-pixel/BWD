const fs = require('fs');

function updateApp() {
  const file = 'D:\\NewWeb\\BWD\\src\\App.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Hero section
  content = content.replace('text-slate-900 mb-8', 'text-slate-900 dark:text-white mb-8');
  content = content.replace('text-slate-500 mb-10', 'text-slate-500 dark:text-slate-300 mb-10');
  content = content.replace('bg-white text-slate-900 px-8 py-4 rounded-3xl font-bold text-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2', 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-3xl font-bold text-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2');
  content = content.replace('bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-bounce-slow', 'bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow');
  content = content.replace('<p className="text-lg font-black text-slate-900">850+ Giờ Học</p>', '<p className="text-lg font-black text-slate-900 dark:text-white">850+ Giờ Học</p>');
  content = content.replace('bg-emerald-100 text-emerald-600 rounded-full', 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full');

  // Categories
  content = content.replace('<h2 className="text-4xl font-black text-slate-900 mb-4">Lộ Trình Đào Tạo Phổ Biến</h2>', '<h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Lộ Trình Đào Tạo Phổ Biến</h2>');
  content = content.replace('<p className="text-slate-500">Được thiết kế dựa trên nhu cầu tuyển dụng thực tế của doanh nghiệp.</p>', '<p className="text-slate-500 dark:text-slate-400">Được thiết kế dựa trên nhu cầu tuyển dụng thực tế của doanh nghiệp.</p>');
  content = content.replace(/className="bg-white p-10 rounded-\[32px\] border border-slate-100 shadow-3d-sm transition-all"/g, 'className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-3d-sm transition-all"');
  content = content.replace(/<h3 className="text-2xl font-black mb-4">/g, '<h3 className="text-2xl font-black dark:text-white mb-4">');
  content = content.replace(/<p className="text-slate-500 leading-relaxed mb-6">/g, '<p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">');

  // Resources
  content = content.replace('<div className="pt-20 flex min-h-screen bg-white">', '<div className="pt-20 flex min-h-screen bg-white dark:bg-slate-950">');
  content = content.replace('border-slate-100 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50', 'border-slate-100 dark:border-slate-800 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50');
  content = content.replace('<h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Danh mục tài liệu</h2>', '<h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Danh mục tài liệu</h2>');
  content = content.replace(/"text-slate-600 hover:bg-slate-100"/g, '"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"');
  content = content.replace('<h1 className="text-4xl font-black text-slate-900 mb-4">{activeCategory}</h1>', '<h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{activeCategory}</h1>');
  content = content.replace('<p className="text-slate-500 font-medium italic">', '<p className="text-slate-500 dark:text-slate-400 font-medium italic">');
  content = content.replace(/className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-\[#04AA6D\] transition-all group flex flex-col"/g, 'className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-[#04AA6D] transition-all group flex flex-col"');
  content = content.replace(/<h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-\[#04AA6D\] transition-colors">/g, '<h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 group-hover:text-[#04AA6D] transition-colors">');

  // Skills
  content = content.replace('<div className="pt-20 flex min-h-screen bg-slate-50">', '<div className="pt-20 flex min-h-screen bg-slate-50 dark:bg-slate-950">');
  content = content.replace('bg-white border-r border-slate-200 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto', 'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto');
  content = content.replace('<h1 className="text-4xl font-black mb-2 text-slate-900">', '<h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">');
  content = content.replace('<p className="text-slate-500 font-medium">', '<p className="text-slate-500 dark:text-slate-400 font-medium">');
  content = content.replace(/className="bg-white rounded-\[32px\] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"/g, 'className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"');
  content = content.replace(/className="absolute top-4 right-4 bg-white\/90 backdrop-blur px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm"/g, 'className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm"');
  content = content.replace(/<h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-\[#04AA6D\] transition-colors line-clamp-2">/g, '<h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#04AA6D] transition-colors line-clamp-2">');
  content = content.replace(/<p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">/g, '<p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">');
  content = content.replace(/className="flex items-center justify-between border-t border-slate-50 pt-4"/g, 'className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4"');
  content = content.replace(/className="h-80 bg-white rounded-\[32px\] animate-pulse border border-slate-100 shadow-sm"/g, 'className="h-80 bg-white dark:bg-slate-900 rounded-[32px] animate-pulse border border-slate-100 dark:border-slate-800 shadow-sm"');
  content = content.replace('<h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Lộ trình học tập</h2>', '<h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Lộ trình học tập</h2>');

  // Course Details
  content = content.replace('text-slate-400 font-bold mb-6 hover:text-slate-900 transition-colors cursor-pointer', 'text-slate-400 font-bold mb-6 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer');
  content = content.replace(/bg-white p-8 md:p-10 rounded-\[40px\] shadow-3d-sm border border-slate-100/g, 'bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[40px] shadow-3d-sm border border-slate-100 dark:border-slate-800');
  content = content.replace('border-b border-slate-50 pb-8', 'border-b border-slate-50 dark:border-slate-800 pb-8');
  content = content.replace('<h1 className="text-3xl font-black text-slate-900 mb-2">{activeLesson.title}</h1>', '<h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{activeLesson.title}</h1>');
  content = content.replace(/<h3 className="text-xl font-black text-slate-800 flex items-center gap-2">/g, '<h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">');
  content = content.replace('bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-700 leading-relaxed font-medium', 'bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium');
  content = content.replace('<ul className="space-y-3 text-slate-500 text-sm font-medium">', '<ul className="space-y-3 text-slate-500 dark:text-slate-400 text-sm font-medium">');
  content = content.replace('bg-white p-6 md:p-8 rounded-[40px] shadow-3d-sm border border-slate-100', 'bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] shadow-3d-sm border border-slate-100 dark:border-slate-800');
  content = content.replace('<h3 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">', '<h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center justify-between">');
  content = content.replace('"bg-emerald-50 border-emerald-100 text-emerald-700"', '"bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"');
  content = content.replace('"bg-white border-slate-50 hover:border-slate-200 text-slate-600"', '"bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300"');
  content = content.replace('"bg-white/20" : "bg-slate-100 text-slate-400"', '"bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300"');

  // Rewards
  content = content.replace('<h1 className="text-5xl font-black mb-4">Cửa Hàng Đổi Quà</h1>', '<h1 className="text-5xl font-black dark:text-white mb-4">Cửa Hàng Đổi Quà</h1>');
  content = content.replace('<p className="text-slate-500 max-w-2xl mx-auto font-medium">Tích lũy huy chương từ các khóa học để đổi lấy những phần quà giá trị.</p>', '<p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Tích lũy huy chương từ các khóa học để đổi lấy những phần quà giá trị.</p>');
  content = content.replace(/bg-white p-8 rounded-\[40px\] border border-slate-100 shadow-3d-sm flex flex-col items-center text-center group/g, 'bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-3d-sm flex flex-col items-center text-center group');
  content = content.replace(/w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:scale-110 transition-all/g, 'w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:scale-110 transition-all');
  content = content.replace(/<h3 className="text-xl font-black text-slate-900 mb-3">\{rw\.title\}<\/h3>/g, '<h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{rw.title}</h3>');
  content = content.replace(/<p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">\{rw\.desc\}<\/p>/g, '<p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 flex-1">{rw.desc}</p>');
  content = content.replace('bg-slate-100 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 hover:text-white disabled:opacity-50 transition-all active:scale-95', 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white disabled:opacity-50 transition-all active:scale-95');

  // Footer
  content = content.replace('<footer className="bg-white border-t border-slate-100 py-12 px-6">', '<footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12 px-6">');
  content = content.replace('w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white', 'w-10 h-10 bg-slate-900 dark:bg-emerald-600 rounded-xl flex items-center justify-center text-white');
  content = content.replace('<p className="font-black">Self-Study Hub &copy; 2026</p>', '<p className="font-black dark:text-white">Self-Study Hub &copy; 2026</p>');
  content = content.replace(/text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors/g, 'text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors');

  // LoginPage
  content = content.replace('bg-slate-50 relative overflow-hidden', 'bg-slate-50 dark:bg-slate-950 relative overflow-hidden');
  content = content.replace('bg-white rounded-[40px] shadow-3d p-10 relative z-10 border border-slate-100', 'bg-white dark:bg-slate-900 rounded-[40px] shadow-3d p-10 relative z-10 border border-slate-100 dark:border-slate-800');
  content = content.replace('<span className="text-2xl font-black tracking-tight text-slate-900">Self-Study Hub</span>', '<span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Self-Study Hub</span>');
  content = content.replace('<h1 className="text-3xl font-black text-slate-900 mb-2">Mừng bạn trở lại! 👋</h1>', '<h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Mừng bạn trở lại! 👋</h1>');
  content = content.replace('<p className="text-slate-500 font-medium leading-relaxed">Hãy đăng nhập để tiếp tục hành trình học tập cùng cộng đồng.</p>', '<p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Hãy đăng nhập để tiếp tục hành trình học tập cùng cộng đồng.</p>');
  content = content.replace('className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-50 text-slate-700 font-black py-4 px-6 border-2 border-slate-100 rounded-3xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"', 'className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black py-4 px-6 border-2 border-slate-100 dark:border-slate-700 rounded-3xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"');
  content = content.replace('<div className="w-full border-t border-slate-100"></div>', '<div className="w-full border-t border-slate-100 dark:border-slate-800"></div>');
  content = content.replace('<span className="bg-white px-4">HOẶC</span>', '<span className="bg-white dark:bg-slate-900 px-4">HOẶC</span>');
  content = content.replace(/<label className="text-sm font-bold text-slate-700 ml-4">/g, '<label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-4">');
  content = content.replace(/w-full bg-slate-50 border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500\/20 transition-all outline-none/g, 'w-full bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-3xl p-4 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none');

  // UserMenu
  content = content.replace('bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden', 'bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden');
  content = content.replace('px-4 py-3 border-b border-slate-50 mb-1', 'px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1');
  content = content.replace('<p className="text-sm font-bold text-slate-900">{user.displayName}</p>', '<p className="text-sm font-bold text-slate-900 dark:text-white">{user.displayName}</p>');
  content = content.replace(/text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors/g, 'text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors');

  fs.writeFileSync(file, content);
}

function updateAIAssistant() {
  const file = 'D:\\NewWeb\\BWD\\src\\components\\AIAssistant.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace('bg-white rounded-2xl shadow-3d z-50 flex flex-col overflow-hidden border border-slate-200', 'bg-white dark:bg-slate-900 rounded-2xl shadow-3d z-50 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800');
  content = content.replace('className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"', 'className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"');
  content = content.replace('<div className="text-center py-10 text-slate-400">', '<div className="text-center py-10 text-slate-400 dark:text-slate-500">');
  content = content.replace(': "bg-white text-slate-800 border border-slate-100 rounded-bl-none"', ': "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none"');
  content = content.replace('bg-white border border-slate-100 rounded-2xl rounded-bl-none shadow-sm animate-pulse', 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none shadow-sm animate-pulse');
  content = content.replace('className="p-3 bg-white border-t border-slate-100 flex gap-2"', 'className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2"');
  content = content.replace('bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all', 'bg-slate-100 dark:bg-slate-800 dark:text-slate-200 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all');

  fs.writeFileSync(file, content);
}

updateApp();
updateAIAssistant();
