'use client';

import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Download, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Chapter {
  title: string;
  content: string;
}

interface EbookData {
  title: string;
  coverPrompt: string;
  chapters: Chapter[];
  coverImage?: string;
}

export default function EbookGenerator() {
  const [topic, setTopic] = useState('');
  const [age, setAge] = useState('13-15');
  const [tone, setTone] = useState('Inspiratif & Menyenangkan');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [progress, setProgress] = useState('');
  const [ebookData, setEbookData] = useState<EbookData | null>(null);
  const [error, setError] = useState('');

  const generateEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsGenerating(true);
    setError('');
    setEbookData(null);
    setProgress('Menyusun struktur dan isi e-book...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      // 1. Generate Text Content
      const prompt = `
        Anda adalah seorang penulis ahli dan edukator untuk generasi muda.
        Buatkan sebuah e-book edukasi yang menarik tentang "${topic}".
        Target pembaca: Usia ${age} tahun.
        Gaya bahasa/Tone: ${tone}.

        Kembalikan data dalam format JSON dengan struktur berikut:
        {
          "title": "Judul E-book",
          "coverPrompt": "Prompt bahasa Inggris yang sangat detail untuk AI image generator. Deskripsikan ilustrasi cover yang menarik, tanpa teks/tulisan, sesuai dengan topik dan target usia.",
          "chapters": [
            {
              "title": "Judul Bab",
              "content": "Isi bab dalam format Markdown. Buatlah informatif, menarik, dan cukup panjang (sekitar 300-500 kata per bab). Gunakan heading, bullet points, dan paragraf yang rapi."
            }
          ]
        }
        Buatlah minimal 3 bab dan maksimal 5 bab.
      `;

      const textResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              coverPrompt: { type: Type.STRING },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["title", "content"]
                }
              }
            },
            required: ["title", "coverPrompt", "chapters"]
          }
        }
      });

      const text = textResponse.text;
      if (!text) throw new Error("Gagal mendapatkan teks dari AI");
      const data = JSON.parse(text) as EbookData;
      setProgress('Membuat ilustrasi cover yang menarik...');

      // 2. Generate Cover Image
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: data.coverPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      let base64Image = "";
      for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      setEbookData({ ...data, coverImage: base64Image });
      setProgress('');
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kesalahan saat membuat e-book. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ebookData) return;
    setIsGeneratingPDF(true);
    
    // Give UI a moment to update before printing
    setTimeout(() => {
      window.print();
      setIsGeneratingPDF(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 print:hidden">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-serif font-medium text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              Mulai Buat E-Book
            </h2>
            
            <form onSubmit={generateEbook} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Topik E-Book</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Literasi Finansial, Kesehatan Mental..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Usia</label>
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                  >
                    <option value="10-12">10-12 Tahun</option>
                    <option value="13-15">13-15 Tahun</option>
                    <option value="16-18">16-18 Tahun</option>
                    <option value="19-22">19-22 Tahun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gaya Bahasa</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white"
                  >
                    <option value="Inspiratif & Menyenangkan">Inspiratif</option>
                    <option value="Santai & Gaul">Santai & Gaul</option>
                    <option value="Serius & Informatif">Serius</option>
                    <option value="Bercerita (Storytelling)">Bercerita</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Generate E-Book
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 bg-white/50 rounded-3xl border border-slate-100 border-dashed"
              >
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p className="text-lg font-medium text-slate-700">{progress}</p>
                <p className="text-sm mt-2">Proses ini membutuhkan waktu sekitar 30-60 detik.</p>
              </motion.div>
            ) : ebookData ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 text-emerald-600 font-medium">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    E-Book Berhasil Dibuat!
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isGeneratingPDF ? 'Menyiapkan PDF...' : 'Download PDF'}
                  </button>
                </div>

                {/* Visual Preview */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 shrink-0">
                      {ebookData.coverImage ? (
                        <img 
                          src={ebookData.coverImage} 
                          alt="Cover" 
                          className="w-full aspect-[3/4] object-cover rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-serif font-medium text-slate-900 mb-4 leading-tight">
                        {ebookData.title}
                      </h3>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Daftar Isi</h4>
                        <ul className="space-y-3">
                          {ebookData.chapters.map((chapter, idx) => (
                            <li key={idx} className="flex gap-3 text-slate-700">
                              <span className="font-mono text-indigo-400 font-medium">
                                {(idx + 1).toString().padStart(2, '0')}
                              </span>
                              <span>{chapter.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-3xl border border-slate-100 border-dashed p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada E-Book</h3>
                <p className="max-w-sm">Isi form di samping untuk mulai menghasilkan e-book edukasi yang menarik untuk murid-murid Anda.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden PDF Content Structure */}
      {ebookData && (
        <div className="hidden print:block">
          <div id="pdf-content" style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
            <style>{`
              .pdf-markdown h1, .pdf-markdown h2, .pdf-markdown h3 {
                font-family: serif;
                font-weight: bold;
                color: #0f172a;
                margin-top: 2em;
                margin-bottom: 1em;
              }
              .pdf-markdown h1 { font-size: 2.25em; }
              .pdf-markdown h2 { font-size: 1.8em; }
              .pdf-markdown h3 { font-size: 1.5em; }
              .pdf-markdown p {
                margin-bottom: 1.5em;
                color: #334155;
                line-height: 1.8;
              }
              .pdf-markdown ul, .pdf-markdown ol {
                margin-bottom: 1.5em;
                padding-left: 2em;
                color: #334155;
              }
              .pdf-markdown li {
                margin-bottom: 0.5em;
              }
              .pdf-markdown strong {
                font-weight: bold;
                color: #0f172a;
              }
              .pdf-markdown a {
                color: #4f46e5;
                text-decoration: none;
              }
            `}</style>
            {/* Cover Page */}
            <div style={{ width: '8.27in', height: '11.69in', position: 'relative', pageBreakAfter: 'always', overflow: 'hidden', backgroundColor: '#0f172a' }}>
              {ebookData.coverImage && (
                <img 
                  src={ebookData.coverImage} 
                  alt="Cover" 
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                />
              )}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1in', color: '#ffffff' }}>
                <h1 style={{ fontSize: '4rem', fontFamily: 'serif', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                  {ebookData.title}
                </h1>
                <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, letterSpacing: '0.025em' }}>
                  Edisi Edukasi Khusus Usia {age} Tahun
                </p>
              </div>
            </div>

            {/* Table of Contents */}
            <div style={{ width: '8.27in', minHeight: '11.69in', padding: '1in', pageBreakAfter: 'always', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
              <h2 style={{ fontSize: '2.25rem', fontFamily: 'serif', fontWeight: 'bold', marginBottom: '3rem', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                Daftar Isi
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {ebookData.chapters.map((chapter, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>
                      <span style={{ color: '#4f46e5', marginRight: '1rem', fontFamily: 'monospace' }}>{(idx + 1).toString().padStart(2, '0')}</span>
                      {chapter.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapters */}
            {ebookData.chapters.map((chapter, idx) => (
              <div key={idx} style={{ width: '8.27in', minHeight: '11.69in', padding: '1in', pageBreakAfter: 'always', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
                <div style={{ marginBottom: '3rem' }}>
                  <span style={{ color: '#4f46e5', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                    Bab {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <h2 style={{ fontSize: '2.25rem', fontFamily: 'serif', fontWeight: 'bold', marginTop: '1rem', color: '#0f172a', lineHeight: 1.2 }}>
                    {chapter.title}
                  </h2>
                </div>
                <div className="pdf-markdown" style={{ color: '#334155', fontSize: '1.125rem', lineHeight: 1.75 }}>
                  <ReactMarkdown>{chapter.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
