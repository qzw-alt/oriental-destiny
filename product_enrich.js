/**
 * product_enrich.js — Runtime enrichment for products.json
 *
 * Adds the new matching fields (elementEnergy, symbolFunction, avoidWhen,
 * intensity, materialElement, wearingScenario, emotionalPurpose) to products
 * loaded from products.json, derived from existing fields.
 *
 * Load this AFTER products.json is fetched and BEFORE product_matcher.js.
 * Usage: enrichedProducts = ProductEnrich.enrich(rawProductsJSON);
 */

(function () {
  'use strict';

  // Map energyType strings to structured fields
  var ENERGY_MAP = {
    'Wood (Yin)':    { element: 'Wood', intensity: 2, material: 'Wood' },
    'Wood (Yang)':   { element: 'Wood', intensity: 4, material: 'Wood' },
    'Fire (Yin)':    { element: 'Fire', intensity: 2, material: 'Fire' },
    'Fire (Yang)':   { element: 'Fire', intensity: 4, material: 'Fire' },
    'Earth (Yin)':   { element: 'Earth', intensity: 2, material: 'Earth' },
    'Earth (Yang)':  { element: 'Earth', intensity: 4, material: 'Earth' },
    'Metal (Yin)':   { element: 'Metal', intensity: 2, material: 'Metal' },
    'Metal (Yang)':  { element: 'Metal', intensity: 3, material: 'Metal' },
    'Water (Yin)':   { element: 'Water', intensity: 2, material: 'Water' },
    'Water (Yang)':  { element: 'Water', intensity: 3, material: 'Water' }
  };

  // Derive symbolFunction from bestFor tags
  function deriveSymbolFunction(bestFor) {
    if (!bestFor || !Array.isArray(bestFor)) return 'grounding_stability';
    var tags = bestFor.join(' ').toLowerCase();
    if (/protect|safety|warding|shield/.test(tags)) return 'protection_boundary';
    if (/wealth|income|business|prosper/.test(tags)) return 'wealth_retention';
    if (/love|charm|magnetism|social|allure/.test(tags)) return 'social_magnetism';
    if (/career|authority|breakthrough|decisive/.test(tags)) return 'authority';
    if (/clarity|focus|wisdom|study/.test(tags)) return 'clarity_focus';
    if (/transform|passion|purif/.test(tags)) return 'transformation';
    if (/blessing|spiritual|devotion|gratitude|compassion/.test(tags)) return 'blessing';
    if (/clear|joy|fearless/.test(tags)) return 'energy_clearing';
    if (/ground|center|balance|stability|health|longevity/.test(tags)) return 'grounding_stability';
    return 'grounding_stability';
  }

  // Derive avoidWhen from bestFor (opposite scenarios)
  function deriveAvoidWhen(bestFor, element) {
    var avoid = [];
    var tags = (bestFor || []).join(' ').toLowerCase();

    if (/protect|shield|warding/.test(tags)) avoid.push('excess_' + element.toLowerCase());
    if (/wealth|prosper/.test(tags)) avoid.push('scarcity_mindset');
    if (/love|charm|magnetism/.test(tags)) avoid.push('isolation');
    if (/breakthrough|decisive|action/.test(tags)) avoid.push('passivity');
    if (/transform|passion/.test(tags)) avoid.push('stagnation');
    if (/ground|stability|balance/.test(tags)) avoid.push('chaos');

    if (avoid.length === 0) avoid.push('excess_' + element.toLowerCase());
    return avoid;
  }

  // Derive emotionalPurpose from bestFor + symbolism
  function deriveEmotionalPurpose(bestFor, symbolism) {
    if (bestFor && bestFor.length > 0) {
      var primary = bestFor[0].toLowerCase();
      if (/protect|safety/.test(primary)) return 'feel safe and protected in daily life';
      if (/wealth|income|business/.test(primary)) return 'feel confident attracting and retaining resources';
      if (/love|charm|social/.test(primary)) return 'feel magnetic and at ease in relationships';
      if (/career|authority|breakthrough/.test(primary)) return 'feel empowered to take decisive action';
      if (/transform|passion/.test(primary)) return 'feel energized to embrace change';
      if (/wisdom|study|focus/.test(primary)) return 'feel clear and receptive to insight';
      if (/blessing|spiritual|devotion/.test(primary)) return 'feel connected to something larger than yourself';
      if (/ground|balance|stability|health/.test(primary)) return 'feel steady and centered regardless of circumstances';
      if (/joy|fearless/.test(primary)) return 'feel light and courageous in facing life';
    }
    return 'feel more aligned with your natural energy';
  }

  // Determine wearingScenario
  function deriveScenario(visualType, bestFor) {
    var tags = (bestFor || []).join(' ').toLowerCase();
    if (/daily wear|daily/.test(tags)) return 'daily';
    if (/ceremon|ritual|special/.test(tags)) return 'special';
    // Rings and bracelets are inherently daily-wear
    if (visualType === 'ring' || visualType === 'bracelet') return 'daily';
    // Pendants and plaques can go either way
    return 'daily';
  }

  /**
   * Enrich a single product with derived matching fields.
   * Only adds fields that are missing.
   */
  function enrichProduct(product) {
    if (!product) return product;

    var energyInfo = ENERGY_MAP[product.energyType] || { element: null, intensity: 3, material: null };

    // Only set if not already present
    if (!product.elementEnergy) product.elementEnergy = energyInfo.element || 'Metal';
    if (!product.symbolFunction) product.symbolFunction = deriveSymbolFunction(product.bestFor);
    if (!product.avoidWhen) product.avoidWhen = deriveAvoidWhen(product.bestFor, product.elementEnergy);
    if (!product.intensity) product.intensity = energyInfo.intensity || 3;
    if (!product.materialElement) product.materialElement = energyInfo.material || 'Metal';
    if (!product.wearingScenario) product.wearingScenario = deriveScenario(product.visualType, product.bestFor);
    if (!product.emotionalPurpose) product.emotionalPurpose = deriveEmotionalPurpose(product.bestFor, product.symbolism);

    return product;
  }

  /**
   * Enrich all products in the categories structure.
   * @param {Object|Array} data — the parsed products.json (with .categories array)
   * @returns {Object} same structure with enriched products
   */
  function enrich(data) {
    if (!data) return data;
    var categories = data.categories || (Array.isArray(data) ? data : []);
    if (!Array.isArray(categories)) return data;

    categories.forEach(function (cat) {
      if (cat.products && Array.isArray(cat.products)) {
        cat.products.forEach(enrichProduct);
      }
    });

    return data;
  }

  /**
   * Get flat array of all enriched products.
   */
  function flatten(data) {
    if (!data) return [];
    var categories = data.categories || (Array.isArray(data) ? data : []);
    if (!Array.isArray(categories)) return [];
    var flat = [];
    categories.forEach(function (cat) {
      if (cat.products) flat = flat.concat(cat.products);
    });
    return flat;
  }

  window.ProductEnrich = {
    enrich: enrich,
    enrichProduct: enrichProduct,
    flatten: flatten,
    ENERGY_MAP: ENERGY_MAP
  };
})();
