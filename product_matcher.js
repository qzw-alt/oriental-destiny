/**
 * product_matcher.js — BaZi-driven jewelry matching engine
 *
 * Scores products across 6 dimensions against a user's chart profile.
 * Attaches to window.ProductMatcher.
 */

(function () {
  'use strict';

  const WEIGHTS = {
    elementMatch: 0.30,
    themeMatch: 0.25,
    avoidance: 0.20,
    scenario: 0.10,
    intensity: 0.10,
    symbolFunction: 0.05
  };

  // Maps focus to symbolic needs
  const FOCUS_SYMBOL_MAP = {
    career: ['authority', 'breakthrough', 'clarity_focus', 'grounding_stability'],
    wealth: ['wealth_retention', 'grounding_stability', 'energy_clearing', 'protection_boundary'],
    love: ['social_magnetism', 'transformation', 'blessing', 'energy_clearing'],
    protection: ['protection_boundary', 'energy_clearing', 'grounding_stability', 'blessing'],
    balance: ['grounding_stability', 'energy_clearing', 'blessing', 'transformation']
  };

  // Maps element to related material elements
  const ELEMENT_MATERIALS = {
    Metal: ['Metal', 'White copper alloy'],
    Water: ['Water', 'Silver'],
    Wood: ['Wood', 'Natural fiber'],
    Fire: ['Fire', 'Brass'],
    Earth: ['Earth', 'Stone', 'Ceramic']
  };

  /**
   * Main entry: score all products against a chart-derived recommendation profile.
   * @param {Object} recProfile — from the report outline's jewelryRecommendation section
   * @param {Array} products — flat array of product objects
   * @param {Object} preferences — { carrier, materialPreference } from checkout
   * @returns {Object} { primary, alternatives, avoid, allScores }
   */
  function matchProducts(recProfile, products, preferences) {
    preferences = preferences || {};
    var flatProducts = flattenProducts(products);
    var scored = flatProducts.map(function (p) {
      return { product: p, score: scoreProduct(p, recProfile, preferences) };
    });
    scored.sort(function (a, b) { return b.score.total - a.score.total; });

    var primary = scored[0];
    var alternatives = scored.slice(1, 3).filter(function (s) { return s.score.total >= 6; });
    var avoid = scored.filter(function (s) {
      return s.score.total < 5 || s.score.details.avoidance < 3;
    }).slice(0, 2);

    return {
      primary: primary ? formatResult(primary, recProfile) : null,
      alternatives: alternatives.map(function (s) { return formatResult(s, recProfile); }),
      avoid: avoid.map(function (s) { return formatResult(s, recProfile); }),
      allScores: scored.map(function (s) {
        return { id: s.product.id, name: s.product.name, total: s.score.total };
      })
    };
  }

  function flattenProducts(categories) {
    var flat = [];
    if (Array.isArray(categories)) {
      categories.forEach(function (cat) {
        if (cat.products) flat = flat.concat(cat.products);
      });
    }
    // Also support flat array input
    if (!categories) return [];
    return flat.length > 0 ? flat : categories;
  }

  function scoreProduct(product, rec, prefs) {
    var details = {
      elementMatch: scoreElementMatch(product, rec),
      themeMatch: scoreThemeMatch(product, rec),
      avoidance: scoreAvoidance(product, rec),
      scenario: scoreScenario(product, rec),
      intensity: scoreIntensity(product, rec),
      symbolFunction: scoreSymbolFunction(product, rec)
    };

    var total = 0;
    for (var key in details) {
      total += details[key] * (WEIGHTS[key] || 0);
    }

    // Carrier preference bonus: +0.5 if product carrier matches user preference
    if (prefs.carrier && product.visualType) {
      if (prefs.carrier === 'bracelet' && product.visualType === 'bracelet') total += 0.5;
      if (prefs.carrier === 'pendant' && (product.visualType === 'pendant' || product.visualType === 'plaque')) total += 0.5;
    }

    // Material preference bonus
    if (prefs.materialPreference && product.materialElement === prefs.materialPreference) {
      total += 0.3;
    }

    return { total: Math.min(10, total), details: details };
  }

  // Dimension 1: Element match (0-10)
  function scoreElementMatch(product, rec) {
    if (!rec.neededElements || rec.neededElements.length === 0) return 5;
    var productElement = product.elementEnergy || extractElement(product.energyType);
    if (!productElement) return 5;

    var score = 0;
    rec.neededElements.forEach(function (elem, i) {
      if (productElement === elem) {
        score = i === 0 ? 10 : 7; // primary gets 10, secondary gets 7
      }
    });

    // Partial match: same element family
    if (score === 0 && rec.neededElements.some(function (e) { return e === productElement; })) {
      score = 5;
    }

    // Also check materialElement
    if (score < 7 && product.materialElement && rec.neededElements.some(function (e) {
      var mats = ELEMENT_MATERIALS[e] || [];
      return mats.indexOf(product.materialElement) !== -1;
    })) {
      score = Math.max(score, 5);
    }

    return score;
  }

  // Dimension 2: Theme/Focus match (0-10)
  function scoreThemeMatch(product, rec) {
    if (!rec.focusNeed) return 5;
    var bestFor = product.bestFor || [];
    if (!Array.isArray(bestFor)) bestFor = [bestFor];

    var focusTokens = rec.focusNeed.toLowerCase().replace(/[_-]/g, ' ').split(/\s+/);
    var matchCount = 0;
    bestFor.forEach(function (tag) {
      var tagLower = tag.toLowerCase();
      focusTokens.forEach(function (token) {
        if (tagLower.indexOf(token) !== -1 || token.indexOf(tagLower) !== -1) {
          matchCount++;
        }
      });
    });

    if (matchCount >= 2) return 10;
    if (matchCount === 1) return 7;
    return 4;
  }

  // Dimension 3: Avoidance penalty (0-10, 10 = no conflict)
  function scoreAvoidance(product, rec) {
    if (!rec.avoidElements || rec.avoidElements.length === 0) return 10;
    var productElement = product.elementEnergy || extractElement(product.energyType);
    if (!productElement) return 8;

    // Direct element conflict
    if (rec.avoidElements.indexOf(productElement) !== -1) return 0;

    // Check avoidWhen tags
    var avoidWhen = product.avoidWhen || [];
    if (!Array.isArray(avoidWhen)) avoidWhen = [avoidWhen];

    var conflictCount = 0;
    rec.avoidElements.forEach(function (avoidElem) {
      avoidWhen.forEach(function (tag) {
        if (tag.toLowerCase().indexOf(avoidElem.toLowerCase()) !== -1) conflictCount++;
      });
    });

    if (conflictCount > 0) return 2;
    return 10;
  }

  // Dimension 4: Wearing scenario (0-10)
  function scoreScenario(product, rec) {
    var scenario = product.wearingScenario || 'daily';
    // Most users need daily wear; special occasion gets lower score
    if (scenario === 'daily') return 10;
    if (scenario === 'both') return 8;
    return 5;
  }

  // Dimension 5: Intensity tolerance (0-10, 10 = perfect match)
  function scoreIntensity(product, rec) {
    var productIntensity = product.intensity || 3;
    var userTolerance = rec.intensityTolerance || 'medium';
    var toleranceNum = { low: 1, medium: 3, high: 5 }[userTolerance] || 3;

    var diff = Math.abs(productIntensity - toleranceNum);
    if (diff === 0) return 10;
    if (diff === 1) return 8;
    if (diff === 2) return 5;
    return 2;
  }

  // Dimension 6: Symbolic function match (0-10)
  function scoreSymbolFunction(product, rec) {
    if (!rec.symbolicFunction) return 6;
    var prodFunc = product.symbolFunction || '';
    var neededFunc = rec.symbolicFunction || '';

    if (prodFunc === neededFunc) return 10;
    if (prodFunc.indexOf(neededFunc) !== -1 || neededFunc.indexOf(prodFunc) !== -1) return 7;

    // Check if product function is in the focus symbol map as a secondary
    if (rec.focusNeed) {
      var focusFuncs = FOCUS_SYMBOL_MAP[rec.focusNeed] || [];
      if (focusFuncs.indexOf(prodFunc) !== -1) return 6;
    }

    return 4;
  }

  function extractElement(energyType) {
    if (!energyType) return null;
    var match = energyType.match(/^(Wood|Fire|Earth|Metal|Water)/);
    return match ? match[1] : null;
  }

  function formatResult(scored, rec) {
    return {
      product: scored.product,
      score: scored.score.total,
      details: scored.score.details,
      reason: buildReason(scored.product, rec)
    };
  }

  function buildReason(product, rec) {
    var parts = [];

    // Element reason
    var productElement = product.elementEnergy || extractElement(product.energyType);
    if (productElement && rec.neededElements && rec.neededElements.indexOf(productElement) !== -1) {
      parts.push('Your chart benefits from ' + productElement + ' energy, which this piece carries as its primary elemental signature.');
    }

    // Symbol reason
    if (product.symbolFunction && rec.emotionalNeed) {
      parts.push('The ' + (product.symbolFunction || '').replace(/_/g, ' ') + ' function of this piece supports your need for ' + rec.emotionalNeed + '.');
    }

    // Wearing reason
    if (product.wearingScenario === 'daily') {
      parts.push('Designed for continuous daily wear, keeping the energy close without interruption.');
    }

    // Material reason
    if (product.materialElement && rec.neededElements) {
      parts.push('The ' + product.materials + ' construction holds the elemental charge effectively.');
    }

    if (parts.length === 0) {
      parts.push('This piece aligns with your chart\'s elemental structure and symbolic needs.');
    }

    return parts.join(' ');
  }

  window.ProductMatcher = {
    matchProducts: matchProducts,
    WEIGHTS: WEIGHTS,
    FOCUS_SYMBOL_MAP: FOCUS_SYMBOL_MAP
  };
})();
