/**
 * bazi_translator.js — Wrapper around I18n for bazi_engine.js output translation
 * Usage: const zhProfile = BaziTranslator.translate(profile);
 */
(function () {
  window.BaziTranslator = {
    translate(profile) {
      if (typeof window.I18n === "undefined") return profile;
      return window.I18n.translateBaziProfile(profile);
    },

    translateText(text) {
      if (typeof window.I18n === "undefined") return text;
      return window.I18n.translateBaziTerms(text);
    }
  };
})();
