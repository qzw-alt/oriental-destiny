(function () {
  const focus = new URLSearchParams(window.location.search).get("focus") || "career";

  const copy = {
    demo: {
      career: {
        focus: "Career visibility and grounding",
        carrier: "Bracelet for daily wear",
        material: "Citrine, tiger eye, warm-toned stone, or a Fire-and-Earth balancing mix",
        reason: "The chart already has plenty of thought and sensitivity. The jewelry should reinforce confidence, momentum, and steady execution rather than add more inward analysis."
      },
      wealth: {
        focus: "Wealth retention and steady income flow",
        carrier: "Bracelet for regular wear or money-focused carrying",
        material: "Citrine, golden rutilated quartz, earthy jade, or a steady Earth-Metal combination",
        reason: "The chart benefits from support that helps gather and hold resources. The jewelry should emphasize containment, discipline, and cleaner money flow rather than restless expansion."
      },
      love: {
        focus: "Emotional harmony and relationship warmth",
        carrier: "Bracelet with softer daily presence",
        material: "Rose quartz, moonstone, soft jade, or a gentler Water-Wood balancing mix",
        reason: "The chart benefits from support that softens tension, improves receptivity, and steadies emotional rhythm. The jewelry should support harmony rather than force intensity."
      },
      protection: {
        focus: "Protection, grounding, and boundary support",
        carrier: "Pendant or close-wear protective form",
        material: "Obsidian, darker jade, protective silver forms, or a Water-Metal guarding combination",
        reason: "The chart benefits from support that settles disturbance and guards the field. The jewelry should quiet interference and strengthen boundaries rather than stir more force."
      },
      balance: {
        focus: "Overall balance and elemental adjustment",
        carrier: "Bracelet as the broadest daily support",
        material: "A tailored combination based on the chart's weak element and seasonal need",
        reason: "The chart is best served by restoring proportion. The jewelry should reinforce what is thin, moderate what is excessive, and accompany the body in a steady way."
      }
    },
    brief: {
      career: {
        focus: "Career and public standing",
        carrier: "Bracelet",
        material: "Tiger eye, citrine, warm amber-toned stones, or a grounding Earth-Fire combination",
        reason: "The chart benefits from energy that helps the client be seen, trusted, and more consistent in execution.",
        forecast: "The year 2026, the Year of the Fire Horse, is a more visible year for this chart. It favors speaking, publishing, asking for recognition, and stepping into the public side of work rather than staying only in the background."
      },
      wealth: {
        focus: "Wealth retention and practical growth",
        carrier: "Bracelet",
        material: "Citrine, golden rutilated quartz, yellow jade, or a steady Earth-Metal combination",
        reason: "The chart benefits from energy that gathers, stabilizes, and preserves resources instead of letting them disperse.",
        forecast: "The year 2026 favors cleaner management of money, stronger personal value, and more disciplined decisions around earnings, pricing, and retention."
      },
      love: {
        focus: "Love, harmony, and emotional steadiness",
        carrier: "Bracelet",
        material: "Rose quartz, moonstone, soft jade, or a Water-Wood harmonizing combination",
        reason: "The chart benefits from energy that softens emotional strain, improves receptivity, and supports steady connection.",
        forecast: "The year 2026 increases movement in relationships. It can bring new openings, but the chart benefits most from sincerity, calm pacing, and clear communication."
      },
      protection: {
        focus: "Protection and calm boundary support",
        carrier: "Pendant",
        material: "Obsidian, darker jade, silver protective forms, or a Water-Metal guarding combination",
        reason: "The chart benefits from energy that calms disturbance, contains leakage, and protects the body's field more quietly.",
        forecast: "The year 2026 may bring more outer stimulation around this chart, making calm boundaries, steadier rest, and better energetic protection especially valuable."
      },
      balance: {
        focus: "General elemental balance",
        carrier: "Bracelet",
        material: "A custom mix based on what the chart lacks most clearly",
        reason: "The chart benefits from restoring proportion rather than overemphasizing what is already strong.",
        forecast: "The year 2026 rewards better balance: knowing when to advance, when to rest, and when to reinforce what the chart can actually carry."
      }
    },
    premium: {
      career: {
        focus: "Career and Allies",
        carrier: "Bracelet for regular daily wear",
        material: "Tiger eye, citrine, amber-toned stone, warm jade, or another Fire-and-Earth balancing mix",
        symbol: "A subtle authority or advancement accent if the client prefers stronger symbolic meaning",
        reason: "The chart already contains enough sensitivity and internal movement. The jewelry should support confidence, practical momentum, and stronger social presence."
      },
      wealth: {
        focus: "Wealth and Retention",
        carrier: "Bracelet for regular financial support",
        material: "Citrine, golden rutilated quartz, yellow jade, or a steady Earth-Metal gathering mix",
        symbol: "A restrained prosperity accent if the client prefers a more explicit wealth symbol",
        reason: "The chart benefits from support that helps gather, keep, and regulate resources rather than simply increasing outer activity."
      },
      love: {
        focus: "Love and Harmony",
        carrier: "Bracelet for close daily resonance",
        material: "Rose quartz, moonstone, soft jade, or a gentler Water-Wood harmonizing mix",
        symbol: "A subtle harmony or union accent if the client prefers stronger relational symbolism",
        reason: "The chart benefits from support that softens strain, steadies emotion, and encourages connection without overwhelming the heart."
      },
      protection: {
        focus: "Protection and Boundary Guarding",
        carrier: "Pendant for close-wear guarding",
        material: "Obsidian, darker jade, silver protective forms, or a Water-Metal stabilizing mix",
        symbol: "A guardian or warding accent if the client prefers stronger protective symbolism",
        reason: "The chart benefits from support that settles interference, strengthens boundaries, and gathers the spirit rather than exciting it."
      },
      balance: {
        focus: "Overall Elemental Balance",
        carrier: "Bracelet for broad daily support",
        material: "A tailored mix chosen according to seasonal need and the chart's weaker element",
        symbol: "A simple balancing accent if the client prefers a quieter symbolic form",
        reason: "The chart benefits most when excess is moderated and deficiency is supported with patience and proper measure."
      }
    }
  };

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  function applyTier(tier) {
    const data = (copy[tier] && copy[tier][focus]) || copy[tier].career;
    setText("focusPlan", data.focus);
    setText("focusCarrier", data.carrier);
    setText("focusMaterial", data.material);
    setText("focusReason", data.reason);
    setText("focusForecast", data.forecast);
    setText("focusSymbol", data.symbol);
  }

  window.ReportFocus = { applyTier };
})();
