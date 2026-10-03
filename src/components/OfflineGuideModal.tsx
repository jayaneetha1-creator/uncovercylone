'use client';

import { useEffect, useState } from 'react';
import { Place } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Printer, MapPin, Download, Phone, ShieldCheck,
  Map, ArrowUpRight, CheckCircle2, AlertTriangle, ExternalLink, Calendar, Star
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OfflineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  place?: Place;
  places?: Place[];
  title?: string;
}

export default function OfflineGuideModal({
  isOpen,
  onClose,
  place,
  places = [],
  title,
}: OfflineGuideModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guide' | 'gmaps' | 'emergency'>('guide');

  const items = place ? [place] : places;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10005] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md no-print"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-[#f8fafc] rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {title || (place ? `${place.name} — Offline Guide` : 'Sri Lanka Offline Itinerary Guide')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('offline.modalSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-sky-600/25 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('offline.downloadPdf')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (No Print) */}
          <div className="px-5 pt-3 bg-white border-b border-slate-200 flex items-center gap-2 text-xs font-bold no-print">
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Travel Guide Sheet
            </button>
            <button
              onClick={() => setActiveTab('gmaps')}
              className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gmaps'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Google Maps Offline Setup
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'emergency'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Emergency & Checklist
            </button>
          </div>

          {/* Modal Body / Printable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
            
            {/* PRINT-ONLY HEADER */}
            <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">UncoverCeylon — Travel Companion</h1>
                  <p className="text-xs text-slate-600">Official Sri Lanka Offline Destination Guide</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Generated for Offline Travel</span>
                </div>
              </div>
            </div>

            {/* TAB 1: DESTINATION GUIDE SHEET */}
            {(activeTab === 'guide' || typeof window !== 'undefined') && (
              <div className={activeTab === 'guide' ? 'space-y-6' : 'hidden print:block space-y-6'}>
                
                {/* Single or Multiple places list */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 print:border-slate-300 print:shadow-none print:break-inside-avoid"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                              {items.length > 1 ? `Stop #${index + 1} • ${item.category}` : item.category}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.province}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 mt-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>{item.location}, Sri Lanka</span>
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-end">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {item.entry_fee || 'Free'}
                          </span>
                        </div>
                      </div>

                      {/* GPS & Navigation Bar */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-900 font-mono">
                          <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>GPS: {item.lat.toFixed(4)}° N, {item.lng.toFixed(4)}° E</span>
                        </div>
                        <div className="flex items-center gap-2 no-print">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Description & Advice */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.short_description || item.description?.slice(0, 220) + '...'}
                      </p>

                      {/* Quick Facts */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Best Travel Season:</span>
                          <span className="font-bold text-slate-900">{item.best_time || 'November to April'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Distance from Colombo:</span>
                          <span className="font-bold text-slate-900">{item.distance_km > 0 ? `${item.distance_km} km` : 'Scenic drive'}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-500 block">Admission:</span>
                          <span className="font-bold text-slate-900">{item.entry_fee || 'Free Admission'}</span>
                        </div>
                      </div>

                      {/* Tips */}
                      {item.tips && (
                        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900">
                          <strong>💡 Offline Tip:</strong> {item.tips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE MAPS OFFLINE INSTRUCTIONS */}
            {(activeTab === 'gmaps' || typeof window !== 'undefined') && (
              <div className={activeTab === 'gmaps' ? 'space-y-5' : 'hidden print:block space-y-5'}>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <Map className="w-5 h-5 text-sky-600" />
                    <span>How to Cache Sri Lanka in Google Maps for 100% Offline Navigation</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Even when you enter rural valleys, misty highlands, or national parks with zero cellular signal, your phone’s internal GPS hardware remains active. Follow these 4 quick steps on hotel Wi-Fi before traveling:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1">1</span>
                      <strong className="text-slate-900 block">Open Google Maps App</strong>
                      <span className="text-slate-500">Launch Google Maps on your iPhone or Android device connected to Wi-Fi.</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1">2</span>
                      <strong className="text-slate-900 block">Tap Profile & Offline Maps</strong>
                      <span className="text-slate-500">Tap your profile avatar at top right, then select <strong>Offline Maps</strong>.</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1">3</span>
                      <strong className="text-slate-900 block">Select Custom Area</strong>
                      <span className="text-slate-500">Tap <strong>Select Your Own Map</strong>, then drag the blue boundary over Sri Lanka.</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-1">4</span>
                      <strong className="text-slate-900 block">Tap Download</strong>
                      <span className="text-slate-500">Maps will save locally. You can now search roads and navigate completely offline!</span>
                    </div>
                  </div>

                  {place && (
                    <div className="pt-2 no-print">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-600/25"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-300" />
                        <span>Open {place.name} in Google Maps</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EMERGENCY & OFFLINE CHECKLIST */}
            {(activeTab === 'emergency' || typeof window !== 'undefined') && (
              <div className={activeTab === 'emergency' ? 'space-y-5' : 'hidden print:block space-y-5'}>
                
                {/* Emergency Numbers */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <Phone className="w-5 h-5 text-rose-600" />
                    <span>Sri Lanka 24/7 Tourist Emergency Hotlines</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-rose-950 block">Tourist Police Emergency</span>
                        <span className="text-rose-700 text-[11px]">Dedicated assistance for international visitors</span>
                      </div>
                      <span className="font-black text-base text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200 font-mono">
                        1912
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-emerald-950 block">Suwasariya Free Ambulance</span>
                        <span className="text-emerald-700 text-[11px]">Island-wide rapid emergency medical dispatch</span>
                      </div>
                      <span className="font-black text-base text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
                        1990
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 block">National Police Emergency</span>
                        <span className="text-slate-600 text-[11px]">General police response nationwide</span>
                      </div>
                      <span className="font-black text-base text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                        119
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-amber-950 block">Fire & Rescue Service</span>
                        <span className="text-amber-700 text-[11px]">Island emergency rescue & civil defense</span>
                      </div>
                      <span className="font-black text-base text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                        110
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    <span>Essential Sri Lanka Offline Travel Checklist</span>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Carry cash (LKR):</strong> ATMs can be sparse in rural hill country and remote coastal villages. Keep small denominations for tuk-tuks, coconuts, and entry tickets.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Modest temple attire:</strong> Shoulders and knees must be covered at ancient sites, temples, and stupas. Remove shoes and hats before entering sacred premises.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Hydration & Sun protection:</strong> Tropical sun is intense. Carry at least 1.5L of water on hikes such as Sigiriya, Pidurangala, or Ella Rock.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span><strong>Local SIM card backup:</strong> Dialog or Mobitel tourist eSIMs / SIM cards are available at Bandaranaike International Airport for fast local coverage.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar (No Print) */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between no-print">
            <div className="text-xs text-slate-500 hidden sm:block">
              Tip: Click &quot;Print or Save as PDF&quot; to save directly to your mobile files or print an A4 copy.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-600/25 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
