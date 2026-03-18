import EbookGenerator from '@/components/EbookGenerator';
import { BookOpenText } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <BookOpenText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
              Youth EduBook AI
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Beranda</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Tentang</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Panduan</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Powered by Gemini AI
        </div>
        <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-6 leading-tight tracking-tight">
          Ciptakan E-Book Edukasi <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Hanya Dalam Hitungan Detik
          </span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Alat revolusioner untuk para edukator. Masukkan topik, pilih target usia, dan AI kami akan menyusun materi, membuat cover menarik, dan menyajikannya dalam format PDF siap pakai.
        </p>
      </section>

      {/* Main Generator Component */}
      <EbookGenerator />

      {/* Footer */}
      <footer className="mt-24 py-8 border-t border-slate-200 text-center text-slate-500 text-sm print:hidden">
        <p>&copy; {new Date().getFullYear()} Youth EduBook AI. Dibuat untuk para edukator generasi muda.</p>
      </footer>
    </main>
  );
}
