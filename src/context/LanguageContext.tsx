'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LanguageCode = 'en' | 'de' | 'ru' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
];

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.destinations': 'Destinations',
    'nav.map': 'Map',
    'nav.news': 'News',
    'nav.trips': 'My Trips',
    'nav.about': 'About',
    'nav.explore': 'Explore',
    'nav.savedPlaces': 'Saved Wishlist',
    'nav.saved': 'Saved',

    // Hero
    'hero.badge': "Sri Lanka's Premier Travel Guide",
    'hero.title1': 'Discover the Hidden',
    'hero.title2': 'Beauty of Sri Lanka',
    'hero.subtitle':
      'Explore pristine beaches, ancient ruins, misty mountains, and hidden waterfalls across the pearl of the Indian Ocean.',
    'hero.searchPlaceholder': 'Search destinations, towns, waterfalls...',
    'hero.searchBtn': 'Search',
    'hero.exploreBtn': 'Explore Destinations',
    'hero.hiddenGemsBtn': 'Hidden Gems',
    'hero.stats.places': 'Curated Places',
    'hero.stats.gems': 'Hidden Gems',
    'hero.stats.provinces': 'Provinces',
    'hero.stats.reviews': 'Traveler Reviews',

    // Categories
    'cat.all': 'All Places',
    'cat.beaches': 'Beaches',
    'cat.waterfalls': 'Waterfalls',
    'cat.mountains': 'Mountains',
    'cat.wildlife': 'Wildlife',
    'cat.ancientSites': 'Ancient Sites',
    'cat.historical': 'Historical',
    'cat.religiousPlaces': 'Religious Places',
    'cat.hiddenGems': 'Hidden Gems',

    // Place Card
    'card.view': 'View',
    'card.best': 'Best',
    'card.reviews': 'reviews',

    // Place Detail
    'detail.back': 'Back to Explore',
    'detail.overview': 'Destination Overview',
    'detail.thingsToDo': 'Things To Do & Experiences',
    'detail.seasonality': 'Seasonality & Weather Guide',
    'detail.visitorTips': 'Visitor Tips & Advisory',
    'detail.standardAdmission': 'Standard Admission',
    'detail.freeEntry': 'Free Entry',
    'detail.perAdult': 'per adult',
    'detail.openMaps': 'Open in Google Maps',
    'detail.viewLiveMap': 'View on Ceylon Live Map',
    'detail.saveDestination': 'Save Destination',
    'detail.savedWishlist': 'Saved to Wishlist',
    'detail.downloadOffline': 'Download Offline Guide (PDF)',
    'detail.getDirections': 'Get Driving Directions',
    'detail.similarPlaces': 'Similar Destinations',
    'detail.nearbyPlaces': 'Nearby Attractions',

    // Offline Guide
    'offline.modalTitle': 'Offline Travel Companion & PDF Guide',
    'offline.modalSubtitle': 'Save directions, GPS coordinates, and travel tips for when you have no cellular signal in Sri Lanka.',
    'offline.downloadPdf': 'Print or Save as PDF',
    'offline.gmapsTitle': 'Download Google Maps for Offline Navigation',
    'offline.gmapsStep1': '1. Open the Google Maps app on your smartphone.',
    'offline.gmapsStep2': '2. Tap your profile picture / initials in the top right corner.',
    'offline.gmapsStep3': '3. Select "Offline maps" > "Select your own map".',
    'offline.gmapsStep4': '4. Move the rectangle over Sri Lanka and tap "Download".',
    'offline.openGmaps': 'Open in Google Maps App',
    'offline.emergencyTitle': 'Emergency Hotlines in Sri Lanka',
    'offline.touristPolice': 'Tourist Police Hotline',
    'offline.ambulance': 'Free Ambulance Service (Suwasariya)',
    'offline.policeEmergency': 'Police Emergency Response',
    'offline.checklistTitle': 'Essential Offline Travel Checklist',
    'offline.check1': 'Carry sufficient cash (LKR) - remote areas have limited ATM access',
    'offline.check2': 'Keep modest clothing (covering shoulders and knees) for cultural & religious sites',
    'offline.check3': 'Download offline translation packs or phrasebooks',
    'offline.check4': 'Store offline emergency contacts and hotel addresses',

    // Wishlist Drawer
    'wishlist.title': 'Saved Places',
    'wishlist.count': 'destinations in your wishlist',
    'wishlist.clearAll': 'Clear All',
    'wishlist.emptyTitle': 'No saved places yet',
    'wishlist.emptyDesc': 'Tap the heart icon on any destination card to save your favorite spots for your upcoming trip!',
    'wishlist.browseBtn': 'Browse Destinations',
    'wishlist.exportPdf': 'Export Offline Itinerary (PDF)',
    'wishlist.viewOnMap': 'View All on Interactive Map',
    'wishlist.total': 'Total Saved',
  },

  de: {
    // Nav
    'nav.home': 'Startseite',
    'nav.destinations': 'Reiseziele',
    'nav.map': 'Karte',
    'nav.news': 'Nachrichten',
    'nav.trips': 'Meine Reisen',
    'nav.about': 'Über uns',
    'nav.explore': 'Entdecken',
    'nav.savedPlaces': 'Merkliste',
    'nav.saved': 'Gespeichert',

    // Hero
    'hero.badge': 'Sri Lankas führender Reiseführer',
    'hero.title1': 'Entdecken Sie die verborgene',
    'hero.title2': 'Schönheit von Sri Lanka',
    'hero.subtitle':
      'Erkunden Sie unberührte Strände, antike Ruinen, neblige Berge und versteckte Wasserfälle auf der Perle des Indischen Ozeans.',
    'hero.searchPlaceholder': 'Orte, Städte, Wasserfälle suchen...',
    'hero.searchBtn': 'Suchen',
    'hero.exploreBtn': 'Reiseziele entdecken',
    'hero.hiddenGemsBtn': 'Geheimtipps',
    'hero.stats.places': 'Kuratierte Orte',
    'hero.stats.gems': 'Geheimtipps',
    'hero.stats.provinces': 'Provinzen',
    'hero.stats.reviews': 'Reisebewertungen',

    // Categories
    'cat.all': 'Alle Orte',
    'cat.beaches': 'Strände',
    'cat.waterfalls': 'Wasserfälle',
    'cat.mountains': 'Berge',
    'cat.wildlife': 'Tierwelt & Safari',
    'cat.ancientSites': 'Antike Stätten',
    'cat.historical': 'Historisch',
    'cat.religiousPlaces': 'Heilige Stätten',
    'cat.hiddenGems': 'Geheimtipps',

    // Place Card
    'card.view': 'Ansehen',
    'card.best': 'Beste Zeit',
    'card.reviews': 'Bewertungen',

    // Place Detail
    'detail.back': 'Zurück zur Übersicht',
    'detail.overview': 'Überblick & Geschichte',
    'detail.thingsToDo': 'Aktivitäten & Erlebnisse',
    'detail.seasonality': 'Saison- & Wetterführer',
    'detail.visitorTips': 'Besuchertipps & Hinweise',
    'detail.standardAdmission': 'Eintrittspreis',
    'detail.freeEntry': 'Freier Eintritt',
    'detail.perAdult': 'pro Person',
    'detail.openMaps': 'In Google Maps öffnen',
    'detail.viewLiveMap': 'Auf Ceylon Live-Karte',
    'detail.saveDestination': 'Ort speichern',
    'detail.savedWishlist': 'In Merkliste gespeichert',
    'detail.downloadOffline': 'Offline-Reiseführer (PDF)',
    'detail.getDirections': 'Route berechnen',
    'detail.similarPlaces': 'Ähnliche Reiseziele',
    'detail.nearbyPlaces': 'Sehenswürdigkeiten in der Nähe',

    // Offline Guide
    'offline.modalTitle': 'Offline-Reisebegleiter & PDF-Führer',
    'offline.modalSubtitle': 'Speichern Sie Wegbeschreibungen, GPS-Koordinaten und Tipps für Gebiete ohne Mobilfunkempfang.',
    'offline.downloadPdf': 'Drucken oder als PDF speichern',
    'offline.gmapsTitle': 'Google Maps offline herunterladen',
    'offline.gmapsStep1': '1. Öffnen Sie die Google Maps App auf Ihrem Smartphone.',
    'offline.gmapsStep2': '2. Tippen Sie oben rechts auf Ihr Profilbild.',
    'offline.gmapsStep3': '3. Wählen Sie "Offlinekarten" > "Eigene Karte auswählen".',
    'offline.gmapsStep4': '4. Wählen Sie den Bereich für Sri Lanka und tippen Sie auf "Herunterladen".',
    'offline.openGmaps': 'In Google Maps App öffnen',
    'offline.emergencyTitle': 'Notrufnummern in Sri Lanka',
    'offline.touristPolice': 'Touristenpolizei Hotline',
    'offline.ambulance': 'Kostenloser Krankenwagen (Suwasariya)',
    'offline.policeEmergency': 'Polizei-Notruf',
    'offline.checklistTitle': 'Wichtige Offline-Checkliste',
    'offline.check1': 'Bargeld (LKR) mitführen – abgelegene Orte haben kaum Geldautomaten',
    'offline.check2': 'Angemessene Kleidung (Schultern und Knie bedeckt) für Tempel bereithalten',
    'offline.check3': 'Offline-Übersetzungen vorab herunterladen',
    'offline.check4': 'Hoteladressen und Notfallkontakte offline notieren',

    // Wishlist Drawer
    'wishlist.title': 'Gespeicherte Orte',
    'wishlist.count': 'Orte in Ihrer Merkliste',
    'wishlist.clearAll': 'Alle löschen',
    'wishlist.emptyTitle': 'Noch keine Orte gespeichert',
    'wishlist.emptyDesc': 'Klicken Sie auf das Herz-Symbol, um Ihre Favoriten für Ihre Sri Lanka-Reise zu speichern!',
    'wishlist.browseBtn': 'Reiseziele durchsuchen',
    'wishlist.exportPdf': 'Offline-Reiseplan exportieren (PDF)',
    'wishlist.viewOnMap': 'Alle auf Karte anzeigen',
    'wishlist.total': 'Gesamt gespeichert',
  },

  ru: {
    // Nav
    'nav.home': 'Главная',
    'nav.destinations': 'Направления',
    'nav.map': 'Карта',
    'nav.news': 'Новости',
    'nav.trips': 'Мои поездки',
    'nav.about': 'О нас',
    'nav.explore': 'Исследовать',
    'nav.savedPlaces': 'Избранное',
    'nav.saved': 'Сохранено',

    // Hero
    'hero.badge': 'Главный путеводитель по Шри-Ланке',
    'hero.title1': 'Откройте для себя скрытую',
    'hero.title2': 'Красоту Шри-Ланки',
    'hero.subtitle':
      'Исследуйте первозданные пляжи, древние руины, туманные горы и водопады на жемчужине Индийского океана.',
    'hero.searchPlaceholder': 'Поиск мест, городов, водопадов...',
    'hero.searchBtn': 'Найти',
    'hero.exploreBtn': 'Смотреть направления',
    'hero.hiddenGemsBtn': 'Скрытые жемчужины',
    'hero.stats.places': 'Отобранных мест',
    'hero.stats.gems': 'Тайных уголков',
    'hero.stats.provinces': 'Провинций',
    'hero.stats.reviews': 'Отзывов туристов',

    // Categories
    'cat.all': 'Все места',
    'cat.beaches': 'Пляжи',
    'cat.waterfalls': 'Водопады',
    'cat.mountains': 'Горы',
    'cat.wildlife': 'Дикая природа и сафари',
    'cat.ancientSites': 'Древние памятники',
    'cat.historical': 'Исторические места',
    'cat.religiousPlaces': 'Храмы и святыни',
    'cat.hiddenGems': 'Скрытые жемчужины',

    // Place Card
    'card.view': 'Открыть',
    'card.best': 'Сезон',
    'card.reviews': 'отзывов',

    // Place Detail
    'detail.back': 'Назад к списку',
    'detail.overview': 'Обзор достопримечательности',
    'detail.thingsToDo': 'Чем заняться и что посмотреть',
    'detail.seasonality': 'Погода и сезонность',
    'detail.visitorTips': 'Советы для путешественников',
    'detail.standardAdmission': 'Стоимость входа',
    'detail.freeEntry': 'Бесплатный вход',
    'detail.perAdult': 'за человека',
    'detail.openMaps': 'Открыть в Google Maps',
    'detail.viewLiveMap': 'Открыть интерактивную карту',
    'detail.saveDestination': 'В избранное',
    'detail.savedWishlist': 'Сохранено в избранное',
    'detail.downloadOffline': 'Скачать офлайн-гид (PDF)',
    'detail.getDirections': 'Маршрут проезда',
    'detail.similarPlaces': 'Похожие места',
    'detail.nearbyPlaces': 'Рядом в этой провинции',

    // Offline Guide
    'offline.modalTitle': 'Офлайн-путеводитель и PDF-гид',
    'offline.modalSubtitle': 'Сохраните координаты, маршруты и советы на случай отсутствия мобильной связи в путешествии.',
    'offline.downloadPdf': 'Печать или сохранить в PDF',
    'offline.gmapsTitle': 'Загрузка карт Google для офлайн-навигации',
    'offline.gmapsStep1': '1. Откройте приложение Google Карты на смартфоне.',
    'offline.gmapsStep2': '2. Нажмите на фото своего профиля в правом верхнем углу.',
    'offline.gmapsStep3': '3. Выберите "Офлайн-карты" > "Выбрать свою карту".',
    'offline.gmapsStep4': '4. Выберите область Шри-Ланки и нажмите "Скачать".',
    'offline.openGmaps': 'Открыть в Google Картах',
    'offline.emergencyTitle': 'Экстренные службы Шри-Ланки',
    'offline.touristPolice': 'Туристическая полиция',
    'offline.ambulance': 'Скорая помощь (бесплатно 1990)',
    'offline.policeEmergency': 'Полиция (119)',
    'offline.checklistTitle': 'Чек-лист для офлайн-путешествия',
    'offline.check1': 'Всегда имейте при себе наличные (LKR) — в отдаленных местах нет банкоматов',
    'offline.check2': 'Одежда должна закрывать плечи и колени при входе в храмы',
    'offline.check3': 'Заранее скачайте офлайн-переводчик',
    'offline.check4': 'Сохраните контакты отеля и экстренных служб',

    // Wishlist Drawer
    'wishlist.title': 'Сохраненные места',
    'wishlist.count': 'мест в вашем списке желаний',
    'wishlist.clearAll': 'Очистить всё',
    'wishlist.emptyTitle': 'В списке пока ничего нет',
    'wishlist.emptyDesc': 'Нажимайте на сердечко на карточках мест, чтобы составить свой маршрут по Шри-Ланке!',
    'wishlist.browseBtn': 'Выбрать направления',
    'wishlist.exportPdf': 'Экспорт офлайн-маршрута (PDF)',
    'wishlist.viewOnMap': 'Смотреть все на карте',
    'wishlist.total': 'Всего сохранено',
  },

  fr: {
    // Nav
    'nav.home': 'Accueil',
    'nav.destinations': 'Destinations',
    'nav.map': 'Carte',
    'nav.news': 'Actualités',
    'nav.trips': 'Mes voyages',
    'nav.about': 'À propos',
    'nav.explore': 'Explorer',
    'nav.savedPlaces': 'Favoris',
    'nav.saved': 'Enregistré',

    // Hero
    'hero.badge': 'Le guide de voyage de référence au Sri Lanka',
    'hero.title1': 'Découvrez la beauté',
    'hero.title2': 'Cachée du Sri Lanka',
    'hero.subtitle':
      "Explorez des plages préservées, des cités antiques, des montagnes brumeuses et des cascades secrètes sur la perle de l'océan Indien.",
    'hero.searchPlaceholder': 'Rechercher des lieux, villes, cascades...',
    'hero.searchBtn': 'Rechercher',
    'hero.exploreBtn': 'Explorer les destinations',
    'hero.hiddenGemsBtn': 'Trésors cachés',
    'hero.stats.places': 'Lieux d’exception',
    'hero.stats.gems': 'Trésors cachés',
    'hero.stats.provinces': 'Provinces',
    'hero.stats.reviews': 'Avis de voyageurs',

    // Categories
    'cat.all': 'Tous les lieux',
    'cat.beaches': 'Plages',
    'cat.waterfalls': 'Cascades',
    'cat.mountains': 'Montagnes',
    'cat.wildlife': 'Faune & Safari',
    'cat.ancientSites': 'Cités Antiques',
    'cat.historical': 'Sites Historiques',
    'cat.religiousPlaces': 'Lieux Sacrés',
    'cat.hiddenGems': 'Trésors Cachés',

    // Place Card
    'card.view': 'Voir',
    'card.best': 'Saison',
    'card.reviews': 'avis',

    // Place Detail
    'detail.back': 'Retour aux destinations',
    'detail.overview': 'Aperçu du site',
    'detail.thingsToDo': 'Activités & Expériences',
    'detail.seasonality': 'Guide Météo & Saisons',
    'detail.visitorTips': 'Conseils aux voyageurs',
    'detail.standardAdmission': 'Entrée standard',
    'detail.freeEntry': 'Entrée gratuite',
    'detail.perAdult': 'par adulte',
    'detail.openMaps': 'Ouvrir dans Google Maps',
    'detail.viewLiveMap': 'Voir sur la carte interactive',
    'detail.saveDestination': 'Enregistrer le lieu',
    'detail.savedWishlist': 'Ajouté aux favoris',
    'detail.downloadOffline': 'Télécharger le guide hors-ligne (PDF)',
    'detail.getDirections': 'Itinéraire routier',
    'detail.similarPlaces': 'Destinations similaires',
    'detail.nearbyPlaces': 'À proximité dans cette province',

    // Offline Guide
    'offline.modalTitle': 'Compagnon de voyage hors-ligne & Guide PDF',
    'offline.modalSubtitle': 'Sauvegardez itinéraires, coordonnées GPS et conseils essentiels même sans connexion mobile.',
    'offline.downloadPdf': 'Imprimer ou Sauvegarder en PDF',
    'offline.gmapsTitle': 'Télécharger Google Maps pour une navigation hors-ligne',
    'offline.gmapsStep1': '1. Ouvrez l’application Google Maps sur votre téléphone.',
    'offline.gmapsStep2': '2. Appuyez sur votre photo de profil en haut à droite.',
    'offline.gmapsStep3': '3. Sélectionnez "Plans hors connexion" > "Sélectionner votre propre plan".',
    'offline.gmapsStep4': '4. Cadrez la zone du Sri Lanka et appuyez sur "Télécharger".',
    'offline.openGmaps': 'Ouvrir dans Google Maps',
    'offline.emergencyTitle': 'Numéros d’urgence au Sri Lanka',
    'offline.touristPolice': 'Police touristique (Hotline)',
    'offline.ambulance': 'Ambulance gratuite (1990)',
    'offline.policeEmergency': 'Urgences police (119)',
    'offline.checklistTitle': 'Checklist de voyage hors-ligne',
    'offline.check1': 'Ayez toujours des espèces (LKR) - peu de distributeurs dans les zones rurales',
    'offline.check2': 'Prévoyez des vêtements couvrant épaules et genoux pour les temples',
    'offline.check3': 'Téléchargez vos dictionnaires et traducteurs hors-ligne',
    'offline.check4': 'Notez les coordonnées et adresses de votre hôtel hors-ligne',

    // Wishlist Drawer
    'wishlist.title': 'Lieux enregistrés',
    'wishlist.count': 'destinations dans vos favoris',
    'wishlist.clearAll': 'Tout effacer',
    'wishlist.emptyTitle': 'Aucun lieu enregistré',
    'wishlist.emptyDesc': 'Appuyez sur le cœur d’une destination pour composer votre carnet de voyage au Sri Lanka !',
    'wishlist.browseBtn': 'Explorer les destinations',
    'wishlist.exportPdf': 'Exporter l’itinéraire hors-ligne (PDF)',
    'wishlist.viewOnMap': 'Voir tout sur la carte',
    'wishlist.total': 'Total enregistré',
  },
};

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
  currentLanguage: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'uncover_ceylon_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && ['en', 'de', 'ru', 'fr'].includes(stored)) {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const syncGoogleTranslate = (targetLang: LanguageCode) => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const cookieVal = targetLang === 'en' ? '' : `/en/${targetLang}`;

    if (targetLang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      if (!isLocalhost && hostname) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
      }
    } else {
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      if (!isLocalhost && hostname) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname};`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${hostname};`;
      }
    }

    // Trigger select if ready
    const applySelect = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        if (select.value !== targetLang) {
          select.value = targetLang;
          select.dispatchEvent(new Event('change'));
        }
        return true;
      }
      return false;
    };

    if (!applySelect()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (applySelect() || attempts >= 15) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  // Sync google translate on initial mount if non-en
  useEffect(() => {
    if (lang !== 'en') {
      syncGoogleTranslate(lang);
    }
  }, [lang]);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }

    syncGoogleTranslate(newLang);
  };

  // Monitor for Google Translate combo element and sync with active lang
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lang === 'en') return;

    const checkInterval = setInterval(() => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        if (select.value !== lang) {
          select.value = lang;
          select.dispatchEvent(new Event('change'));
        }
        clearInterval(checkInterval);
      }
    }, 300);

    const timeout = setTimeout(() => clearInterval(checkInterval), 4000);
    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [lang]);

  const t = (key: string): string => {
    const langDict = translations[lang] || translations.en;
    if (langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return key;
  };

  const currentLanguage =
    LANGUAGES.find((item) => item.code === lang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        currentLanguage,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
