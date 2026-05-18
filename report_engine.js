/**
 * report_engine.js — Full report generation orchestrator
 *
 * Chains 4 AI calls: analyze → outline → narrative → review
 * Manages progress, timeout, fallback, and beforeunload protection.
 * Attaches to window.ReportEngine.
 */

(function () {
  'use strict';

  var STEP_TIMEOUT_MS = 12000;
  var MAX_RETRIES = 1;

  var REPORT_SCHEMA = {
    required: ['openingMessage', 'corePattern', 'mainTension', 'focusGuidance',
               'timingWindows', 'masterNotes', 'jewelryRecommendation', 'technicalAppendix'],
    corePattern_required: ['dayMasterNarrative', 'elementStory', 'tenGodNarrative'],
    focusGuidance_required: ['focusArea', 'actionItems'],
    timingWindows_required: ['windows'],
    masterNotes_length: 3,
    jewelryRecommendation_required: ['whyThisElement', 'whyThisSymbol', 'whyThisMaterial']
  };

  /**
   * Generate the full 7-chapter report.
   * @param {Object} userInput — { birthDate, birthTime, focus, gender, birthLocation, fullName }
   * @param {Function} onProgress — callback({ step: 1-4, label: string, detail: string })
   * @returns {Promise<Object>} { report, chartData, qualityReview, generatedAt }
   */
  async function generateFullReport(userInput, onProgress) {
    onProgress = onProgress || function () {};

    if (!window.AIBaziLayer || !window.AIBaziLayer.isReady()) {
      throw new Error('AIBaziLayer not initialized');
    }

    var chartData = window.AIBaziLayer._runBaziEngine(userInput);
    var focus = userInput.focus || 'balance';

    // Step 1: Analyze
    onProgress({ step: 1, total: 4, label: 'Analyzing chart structure', detail: 'Computing elemental flow, seasonal context, and annual triggers...' });
    var analysisResult;
    try {
      analysisResult = await withTimeout(
        window.AIBaziLayer.api.analyzeChart(chartData),
        STEP_TIMEOUT_MS
      );
    } catch (e) {
      console.warn('ReportEngine: analyzeChart failed, using fallback', e.message);
      analysisResult = buildFallbackAnalysis(chartData);
    }

    // Step 2: Outline
    onProgress({ step: 2, total: 4, label: 'Planning report structure', detail: 'Mapping your unique chart patterns to a personalized narrative outline...' });
    var outline;
    try {
      outline = await withTimeout(
        window.AIBaziLayer.generateOutline(chartData, focus),
        STEP_TIMEOUT_MS
      );
      if (!outline || !outline.sections) {
        throw new Error('Invalid outline response');
      }
    } catch (e) {
      console.warn('ReportEngine: generateOutline failed, building locally', e.message);
      outline = buildFallbackOutline(chartData, analysisResult, focus);
    }

    // Step 3: Narrative
    onProgress({ step: 3, total: 4, label: 'Writing your report', detail: 'Crafting each chapter with care — this is the longest step...' });
    var fullReport;
    var retries = 0;
    while (retries <= MAX_RETRIES) {
      try {
        fullReport = await withTimeout(
          window.AIBaziLayer.generateNarrative(outline, chartData, focus),
          STEP_TIMEOUT_MS
        );
        var schemaErrors = validateReportSchema(fullReport);
        if (schemaErrors.length === 0) break;
        if (retries < MAX_RETRIES) {
          onProgress({ step: 3, total: 4, label: 'Refining report', detail: 'Adjusting structure for completeness...' });
        }
      } catch (e) {
        console.warn('ReportEngine: generateNarrative attempt ' + (retries + 1) + ' failed', e.message);
      }
      retries++;
    }

    if (!fullReport || Object.keys(fullReport).length === 0) {
      fullReport = buildFallbackNarrative(chartData, analysisResult, outline, focus);
    }

    // Step 4: Review
    onProgress({ step: 4, total: 4, label: 'Reviewing quality', detail: 'Checking for specificity, clarity, and groundedness...' });
    var qualityReview;
    try {
      qualityReview = await withTimeout(
        window.AIBaziLayer.reviewQuality(fullReport, chartData),
        STEP_TIMEOUT_MS
      );
    } catch (e) {
      console.warn('ReportEngine: reviewQuality failed, assuming pass', e.message);
      qualityReview = { overall: 'PASS', dimensions: {}, summaryNote: 'Quality review skipped (timeout).' };
    }

    var result = {
      report: fullReport,
      chartData: chartData,
      analysisResult: analysisResult,
      outline: outline,
      qualityReview: qualityReview,
      generatedAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      localStorage.setItem('oriental_destiny_full_report', JSON.stringify(result));
    } catch (e) {
      console.warn('ReportEngine: could not save report to localStorage', e.message);
    }

    return result;
  }

  /**
   * Validate report against required schema.
   * @returns {Array<string>} list of missing/invalid fields (empty = valid)
   */
  function validateReportSchema(report) {
    if (!report || typeof report !== 'object') return ['Report is not an object'];

    var errors = [];

    REPORT_SCHEMA.required.forEach(function (field) {
      if (!report[field]) {
        errors.push('Missing required field: ' + field);
      }
    });

    if (report.corePattern) {
      (REPORT_SCHEMA.corePattern_required || []).forEach(function (field) {
        if (!report.corePattern[field]) {
          errors.push('corePattern missing: ' + field);
        }
      });
    }

    if (report.focusGuidance) {
      (REPORT_SCHEMA.focusGuidance_required || []).forEach(function (field) {
        if (!report.focusGuidance[field]) {
          errors.push('focusGuidance missing: ' + field);
        }
      });
    }

    if (report.masterNotes && !Array.isArray(report.masterNotes)) {
      errors.push('masterNotes must be an array');
    } else if (report.masterNotes && report.masterNotes.length < REPORT_SCHEMA.masterNotes_length) {
      errors.push('masterNotes should have ' + REPORT_SCHEMA.masterNotes_length + ' items, got ' + report.masterNotes.length);
    }

    if (report.timingWindows && (!report.timingWindows.windows || !Array.isArray(report.timingWindows.windows))) {
      errors.push('timingWindows.windows must be an array');
    }

    if (report.jewelryRecommendation) {
      (REPORT_SCHEMA.jewelryRecommendation_required || []).forEach(function (field) {
        if (!report.jewelryRecommendation[field]) {
          errors.push('jewelryRecommendation missing: ' + field);
        }
      });
    }

    return errors;
  }

  /**
   * Load a previously saved report from localStorage.
   */
  function loadCachedReport() {
    try {
      var raw = localStorage.getItem('oriental_destiny_full_report');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ─── Fallback builders ──────────────────────────────

  function buildFallbackAnalysis(chartData) {
    var diag = chartData.advancedAnalysis && chartData.advancedAnalysis.elementDiagnosis;
    var yong = chartData.usefulGodAnalysis;
    return {
      elementalFlow: [],
      flowSummary: diag ? diag.summary : '',
      strengthAnalysis: {
        dominantReason: diag ? diag.status : '',
        weaknessRisk: yong && yong.avoid && yong.avoid.length > 0 ? 'Be mindful of excess ' + yong.avoid.join(', ') : '',
        balanceAssessment: ''
      },
      recommendedElements: chartData.favorableElements || [],
      contraindicatedElements: yong ? yong.avoid || [] : [],
      timingWindows: []
    };
  }

  function buildFallbackOutline(chartData, analysis, focus) {
    var yong = chartData.usefulGodAnalysis || {};
    var fav = chartData.favorableElements || [];
    return {
      sections: {
        openingMessage: { theme: 'Understanding your core nature', hook: '', evidence: [], tone: 'warm', constraints: [] },
        corePattern: { dayMasterInterpretation: '', elementStory: '', tenGodNarrative: '', hook: '', evidence: [], constraints: [] },
        mainTension: { tension: '', chartBasis: '', whyItMatters: '', constraints: [] },
        focusGuidance: { focusArea: focus, specificAdvice: [], whatToAvoid: [], seasonalNotes: '', constraints: [] },
        timingWindows: { windows: [], constraints: [] },
        masterNotes: { notes: [{ type: 'character', observation: '' }, { type: 'risk', observation: '' }, { type: 'transformation', observation: '' }], constraints: [] },
        jewelryRecommendation: {
          neededElements: fav.slice(0, 2),
          avoidElements: yong.avoid || [],
          focusNeed: focus,
          emotionalNeed: '',
          intensityTolerance: 'medium',
          symbolicFunction: mapFocusToSymbol(focus),
          constraints: []
        }
      }
    };
  }

  function buildFallbackNarrative(chartData, analysis, outline, focus) {
    var profile = window.BaziTranslator ? window.BaziTranslator.translate(chartData) : chartData;
    var diag = profile.advancedAnalysis ? profile.advancedAnalysis.elementDiagnosis : {};
    var ten = profile.advancedAnalysis ? profile.advancedAnalysis.tenGodStructure : {};
    var luck = profile.advancedAnalysis ? profile.advancedAnalysis.luckPhase : {};
    var season = profile.advancedAnalysis ? profile.advancedAnalysis.seasonalCommand : {};
    var yong = profile.usefulGodAnalysis || {};
    var fav = chartData.favorableElements || [];

    return {
      openingMessage: 'Your BaZi chart reveals a person of genuine depth — someone whose inner world is richer than what most people see from the outside. ' +
        'Your Day Master is ' + (profile.dayMasterStem || '') + ' ' + (profile.dayMasterElement || '') +
        ', which means you carry the essential nature of ' + (profile.dayMasterProfile || 'growth and resilience') + '. ' +
        'Born in ' + (profile.season || '') + ', your chart carries the imprint of someone who ' +
        'navigates life with both sensitivity and strength — often feeling more than you show, and understanding more than you say.',
      corePattern: {
        dayMasterNarrative: 'Your Day Master — ' + (profile.dayMasterStem || '') + ' ' + (profile.dayMasterElement || '') +
          ' — shapes how you approach the world. ' + (profile.dayMasterProfile || '') + '. ' +
          'This is not just a label; it describes the fundamental energy you carry into every room, every relationship, every decision.',
        elementStory: 'Your elemental distribution shows ' + (typeof diag.status === 'string' ? diag.status : (diag.strongest || '') + ' energy dominates while ' + (diag.weakest || '') + ' is less present') + '. ' +
          (diag.summary || '') + '. ' +
          'The elements tell a story about where your energy flows naturally and where it meets resistance.',
        tenGodNarrative: 'Your dominant ten god structure — ' + (ten.summary || '') + ' — reveals how you relate to authority, ' +
          'opportunity, and the people around you. This is the social layer of your chart, and it explains a lot about ' +
          'why certain relationships feel effortless while others drain you.'
      },
      mainTension: 'Every chart has one central tension, and yours revolves around the balance between ' +
        (diag.strongest || 'your strongest') + ' and ' + (diag.weakest || 'your weakest') + ' energy. ' +
        'This tension is not a flaw — it is the engine of your growth. Understanding it transforms what felt like a ' +
        'recurring struggle into a clear path forward.',
      focusGuidance: {
        focusArea: focus,
        narrative: 'With your focus on ' + focus + ', your chart points to specific ways to align your natural ' +
          'energies with your goals.',
        actionItems: [
          'Ground yourself daily — structured routine helps stabilize the elemental shifts in your chart.',
          'Pay attention to seasonal transitions; your chart responds differently to each season.',
          'Build relationships with people whose elemental energy complements yours.'
        ],
        caution: 'Be cautious of spreading your energy too thin across too many directions.'
      },
      timingWindows: {
        narrative: 'Time moves in cycles, and your chart reveals which windows are most aligned with your natural rhythm.',
        windows: [
          { period: 'The coming season', elementActive: fav[0] || '', guidance: 'A favorable period to take action on what matters most.' },
          { period: 'Late 2026', elementActive: fav[1] || '', guidance: 'A window for consolidation and strengthening foundations.' }
        ]
      },
      masterNotes: [
        { type: 'On Your Nature', text: 'You have a depth of perception that most people lack — trust it.' },
        { type: 'On What to Guard Against', text: 'Your chart shows a tendency toward overextension; protect your energy as carefully as you spend it.' },
        { type: 'On Your Path Forward', text: 'The path is not about becoming someone new, but about letting your natural strengths operate without interference.' }
      ],
      jewelryRecommendation: {
        whyThisElement: 'Your chart benefits most from ' + (fav[0] || 'balanced') + ' energy, which supports your Day Master\'s natural function.',
        whyThisSymbol: 'The recommended symbolic function aligns with your chart\'s need for stability and protection.',
        whyThisMaterial: 'The material choice is based on its elemental correspondence to your favorable elements.',
        wearingGuidance: 'Wear daily, ideally in contact with skin for continuous energetic support.',
        whyNotOthers: 'Some types may introduce conflicting elemental energies that could amplify your chart\'s existing tensions.'
      },
      technicalAppendix: {
        fourPillars: 'Four Pillars computed from your birth data.',
        elementBreakdown: 'See your element distribution in the chart data above.',
        yongShenSummary: yong.summary || 'Your useful god analysis identifies your most supportive elements.',
        luckPhaseNote: (luck.summary || '')
      }
    };
  }

  function mapFocusToSymbol(focus) {
    var map = {
      career: 'authority',
      wealth: 'wealth_retention',
      love: 'social_magnetism',
      protection: 'protection_boundary',
      balance: 'grounding_stability'
    };
    return map[focus] || 'grounding_stability';
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('Timeout after ' + ms + 'ms')); }, ms);
      })
    ]);
  }

  window.ReportEngine = {
    generateFullReport: generateFullReport,
    validateReportSchema: validateReportSchema,
    loadCachedReport: loadCachedReport,
    STEP_TIMEOUT_MS: STEP_TIMEOUT_MS,
    REPORT_SCHEMA: REPORT_SCHEMA
  };
})();
