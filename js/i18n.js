(function () {
  const STORAGE_KEY = 'cindie_lang';
  const DEFAULT_LANG = 'en';

  const translations = {
    en: {
      nav_quiz: 'Placement Quiz',
      nav_course: 'My Course',
      nav_games: 'Games',
      nav_pronunciation: 'Pronunciation',
      nav_login: 'Login',
      nav_signup: 'Sign up',
      brand: 'CINDIE',
      hero_title_part1: 'Learn English',
      hero_title_part2: 'with AI',
      hero_subtitle: 'Smart placement quiz, personalized interactive course, fun games, and a pronunciation coach.',
      cta_start_quiz: 'Start Placement Quiz',
      cta_play_games: 'Play Games',
      cta_improve_pronunciation: 'Improve Pronunciation',
      features_quiz_title: 'Placement Quiz',
      features_quiz_desc: '15 smart questions in grammar, reading, and listening to find your level.',
      features_course_title: 'Personalized Course',
      features_course_desc: 'AI generates lessons tailored to your strengths and gaps.',
      features_games_title: 'Mini Games',
      features_games_desc: 'Learn through play with word match and sentence builder.',
      features_pron_title: 'Pronunciation Coach',
      features_pron_desc: 'Speak and get instant feedback using your browser\'s microphone.',
      footer_made: 'Made with ❤️ for learners.'
    },
    mn: {
      nav_quiz: 'Түвшин тогтоох тест',
      nav_course: 'Миний курс',
      nav_games: 'Тоглоом',
      nav_pronunciation: 'Дуудлага',
      nav_login: 'Нэвтрэх',
      nav_signup: 'Бүртгүүлэх',
      brand: 'СИНДИ',
      hero_title_part1: 'Англи хэлээ',
      hero_title_part2: 'ХИЙМЭЛ ОЮУНТАЙ хамт сур',
      hero_subtitle: 'Ухаалаг түвшин тогтоох тест, хувьчилсан хичээл, хөгжилтэй тоглоом, мөн дуудлагын дасгалжуулагч.',
      cta_start_quiz: 'Тест эхлүүлэх',
      cta_play_games: 'Тоглоом тоглох',
      cta_improve_pronunciation: 'Дуудлагаа сайжруулах',
      features_quiz_title: 'Түвшин тогтоох тест',
      features_quiz_desc: 'Таны түвшинг олохын тулд дүрэм, уншлага, сонсголын 15 асуулт.',
      features_course_title: 'Хувьчилсан курс',
      features_course_desc: 'ХИЙМЭЛ ОЮУН таны давуу болон сул талыг харгалзан хичээл үүсгэнэ.',
      features_games_title: 'Жижиг тоглоом',
      features_games_desc: 'Үг тааруулах, өгүүлбэр бүтээх тоглоомоор хөгжилтэй суралц.',
      features_pron_title: 'Дуудлага дасгал',
      features_pron_desc: 'Танд микрофоноор шууд хариу өгөх.',
      footer_made: 'Сурагчдад зориулан ❤️-аар бүтээгдэв.'
    }
  };

  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (_) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    applyTranslations(lang);
    document.documentElement.setAttribute('lang', lang === 'mn' ? 'mn' : 'en');
  }

  function t(key, lang) {
    const l = lang || getLang();
    return translations[l]?.[key] || translations[DEFAULT_LANG][key] || '';
  }

  function qs(selector) { return document.querySelector(selector); }
  function qsa(selector) { return Array.from(document.querySelectorAll(selector)); }

  function setText(selector, text) {
    const el = qs(selector);
    if (el) el.textContent = text;
  }

  function applyTranslations(lang) {
    // Common header/footer
    qsa('[data-i18n="nav_quiz"]').forEach(el => el.textContent = t('nav_quiz', lang));
    qsa('[data-i18n="nav_course"]').forEach(el => el.textContent = t('nav_course', lang));
    qsa('[data-i18n="nav_games"]').forEach(el => el.textContent = t('nav_games', lang));
    qsa('[data-i18n="nav_pronunciation"]').forEach(el => el.textContent = t('nav_pronunciation', lang));
    qsa('[data-i18n="nav_login"]').forEach(el => el.textContent = t('nav_login', lang));
    qsa('[data-i18n="nav_signup"]').forEach(el => el.textContent = t('nav_signup', lang));
    qsa('[data-i18n="brand"]').forEach(el => el.textContent = t('brand', lang));
    qsa('[data-i18n="footer_made"]').forEach(el => el.textContent = t('footer_made', lang));

    // Index page
    setText('[data-i18n="hero_title_part1"]', t('hero_title_part1', lang));
    setText('[data-i18n="hero_title_part2"]', t('hero_title_part2', lang));
    setText('[data-i18n="hero_subtitle"]', t('hero_subtitle', lang));
    setText('[data-i18n="cta_start_quiz"]', t('cta_start_quiz', lang));
    setText('[data-i18n="cta_play_games"]', t('cta_play_games', lang));
    setText('[data-i18n="cta_improve_pronunciation"]', t('cta_improve_pronunciation', lang));
    setText('[data-i18n="features_quiz_title"]', t('features_quiz_title', lang));
    setText('[data-i18n="features_quiz_desc"]', t('features_quiz_desc', lang));
    setText('[data-i18n="features_course_title"]', t('features_course_title', lang));
    setText('[data-i18n="features_course_desc"]', t('features_course_desc', lang));
    setText('[data-i18n="features_games_title"]', t('features_games_title', lang));
    setText('[data-i18n="features_games_desc"]', t('features_games_desc', lang));
    setText('[data-i18n="features_pron_title"]', t('features_pron_title', lang));
    setText('[data-i18n="features_pron_desc"]', t('features_pron_desc', lang));

    // Update selector value if exists
    const sel = qs('#lang-select');
    if (sel && sel.value !== lang) sel.value = lang;
  }

  function mountLanguageSelector() {
    const container = document.querySelector('.header-inner');
    if (!container) return;
    if (document.getElementById('lang-select')) return;

    const select = document.createElement('select');
    select.id = 'lang-select';
    select.className = 'lang-select';
    select.innerHTML = '<option value="en">English</option><option value="mn">Монгол</option>';
    select.value = getLang();
    select.addEventListener('change', function () { setLang(this.value); });

    // Place after nav
    const nav = container.querySelector('.nav');
    if (nav) {
      // push selector to far right
      nav.style.marginLeft = 'auto';
      nav.appendChild(select);
    } else {
      container.appendChild(select);
    }
  }

  function init() {
    mountLanguageSelector();
    applyTranslations(getLang());
  }

  document.addEventListener('DOMContentLoaded', init);

  window.CindieI18n = { getLang, setLang, t, applyTranslations };
})();


