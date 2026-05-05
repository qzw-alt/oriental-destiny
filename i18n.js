/**
 * i18n.js — Lightweight runtime i18n engine for Oriental Destiny
 * No build step. Pure static-site friendly.
 */
(function () {
  const STORAGE_KEY = "oriental_destiny_lang";
  const DEFAULT_LANG = "en";

  let currentLang = DEFAULT_LANG;
  let dict = {};         // { key: "translated text" }
  let baziDict = {};     // Bazi term dictionary for current lang
  let isReady = false;

  /* ─── Language detection ─────────────────────────── */
  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const browser = navigator.language || navigator.userLanguage || "";
    if (browser.startsWith("zh")) return "zh";
    return DEFAULT_LANG;
  }

  /* ─── Dictionary loading ─────────────────────────── */
  function loadDict(lang) {
    return new Promise((resolve) => {
      if (lang === DEFAULT_LANG) {
        dict = {};
        baziDict = {};
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = `translations/${lang}.js`;
      script.onload = () => {
        if (window.I18N_TRANSLATIONS) {
          dict = window.I18N_TRANSLATIONS.dict || {};
          baziDict = window.I18N_TRANSLATIONS.bazi || {};
        }
        resolve();
      };
      script.onerror = () => {
        console.warn("i18n: failed to load", lang);
        dict = {};
        baziDict = {};
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  /* ─── Core translate function ────────────────────── */
  function t(key, fallback) {
    if (typeof key !== "string") return fallback || "";
    return dict[key] || fallback || key;
  }

  /* ─── DOM replacement helpers ────────────────────── */
  function replaceText(el, text) {
    // Replace only the first text-node child (preserves child elements)
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = text;
        return;
      }
    }
    // No text node found — prepend one
    el.insertBefore(document.createTextNode(text), el.firstChild);
  }

  function applyToDocument() {
    if (!isReady) return;

    const isEnglish = currentLang === "en";

    // data-i18n: replace text content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (isEnglish) {
        // Restore original English text
        const original = el.getAttribute("data-i18n-original");
        if (original) replaceText(el, original);
        return;
      }
      // Save original text before first translation (if not already saved)
      if (!el.hasAttribute("data-i18n-original")) {
        let original = "";
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) { original += node.textContent; break; }
        }
        if (!original) original = el.textContent;
        el.setAttribute("data-i18n-original", original);
      }
      const translated = t(key);
      if (translated && translated !== key) {
        replaceText(el, translated);
      }
    });

    // data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (isEnglish) {
        const original = el.getAttribute("data-i18n-placeholder-original");
        if (original) el.placeholder = original;
        return;
      }
      if (!el.hasAttribute("data-i18n-placeholder-original")) {
        el.setAttribute("data-i18n-placeholder-original", el.placeholder);
      }
      const translated = t(key);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    });

    // data-i18n-html (full innerHTML replacement, use sparingly)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (isEnglish) {
        const original = el.getAttribute("data-i18n-html-original");
        if (original) el.innerHTML = original;
        return;
      }
      if (!el.hasAttribute("data-i18n-html-original")) {
        el.setAttribute("data-i18n-html-original", el.innerHTML);
      }
      const translated = t(key);
      if (translated && translated !== key) {
        el.innerHTML = translated;
      }
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

    // Update page title if translation exists
    const titleKey = document.querySelector("title[data-i18n-title]")?.getAttribute("data-i18n-title");
    if (titleKey) {
      const translated = t(titleKey);
      if (translated && translated !== titleKey) {
        document.title = translated;
      }
    }
  }

  /* ─── Language switcher UI ───────────────────────── */
  function createSwitcher() {
    const navs = document.querySelectorAll("header .nav, header nav, .topbar nav");
    if (!navs.length) return;

    const switcher = document.createElement("div");
    switcher.className = "lang-switcher";
    switcher.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-size:13px;font-family:Georgia,serif;";

    const btnEn = document.createElement("button");
    btnEn.textContent = "EN";
    btnEn.style.cssText = "background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:4px;font-size:13px;font-family:Georgia,serif;color:rgba(36,25,21,0.55);";

    const btnZh = document.createElement("button");
    btnZh.textContent = "中";
    btnZh.style.cssText = "background:none;border:none;cursor:pointer;padding:4px 6px;border-radius:4px;font-size:13px;font-family:Georgia,serif;color:rgba(36,25,21,0.55);";

    function updateActive() {
      const active = "background:rgba(166,58,44,0.08);color:#a63a2c;font-weight:600;";
      const inactive = "background:none;color:rgba(36,25,21,0.55);font-weight:400;";
      btnEn.style.cssText = btnEn.style.cssText.split("background:")[0] + (currentLang === "en" ? active : inactive);
      btnZh.style.cssText = btnZh.style.cssText.split("background:")[0] + (currentLang === "zh" ? active : inactive);
    }

    btnEn.addEventListener("click", () => { setLang("en"); });
    btnZh.addEventListener("click", () => { setLang("zh"); });

    switcher.appendChild(btnEn);
    switcher.appendChild(document.createTextNode(" / "));
    switcher.appendChild(btnZh);

    navs.forEach((nav) => {
      // Avoid duplicate
      if (nav.querySelector(".lang-switcher")) return;
      nav.appendChild(switcher.cloneNode(true));
    });

    updateActive();
    // Re-bind events on cloned nodes
    document.querySelectorAll(".lang-switcher").forEach((sw) => {
      const en = sw.querySelector("button:first-child");
      const zh = sw.querySelector("button:last-child");
      if (en) en.addEventListener("click", () => { setLang("en"); });
      if (zh) zh.addEventListener("click", () => { setLang("zh"); });
    });
  }

  /* ─── Public API ─────────────────────────────────── */
  async function setLang(lang) {
    if (lang === currentLang && isReady) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    await loadDict(lang);
    applyToDocument();
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("i18n:langChanged", { detail: { lang } }));
  }

  function getLang() {
    return currentLang;
  }

  function translateBaziTerms(text) {
    if (currentLang === "en" || !text || typeof text !== "string") return text;
    let result = text;
    for (const [en, zh] of Object.entries(baziDict)) {
      if (!en) continue;
      // Word boundary match for multi-word terms, simple replace for single characters
      if (en.length <= 2) {
        result = result.replace(new RegExp(en, "g"), zh);
      } else {
        result = result.replace(new RegExp("\\b" + en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), zh);
      }
    }
    return result;
  }

  function translateBaziProfile(profile) {
    if (currentLang === "en" || !profile) return profile;

    function walk(obj) {
      if (typeof obj === "string") {
        return translateBaziTerms(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(walk);
      }
      if (obj && typeof obj === "object") {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
          out[k] = walk(v);
        }
        return out;
      }
      return obj;
    }

    return walk(profile);
  }

  /* ─── Init ───────────────────────────────────────── */
  async function init() {
    currentLang = detectLang();
    await loadDict(currentLang);
    isReady = true;
    applyToDocument();
    createSwitcher();
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose global
  window.I18n = {
    t,
    setLang,
    getLang,
    translateBaziTerms,
    translateBaziProfile,
    apply: applyToDocument,
  };
})();
