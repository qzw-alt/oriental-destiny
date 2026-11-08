# BaZi calculation-engine audit — 2026-11-08

This note records the review of the site's calculation foundation and the fixes shipped in the
companion PR. It is technical documentation for the owner; it is not user-facing copy.

## Scope

The site has three engine files:

| File | Used by | Status |
| --- | --- | --- |
| `bazi_engine_v2.js` | `instant_reading.html`, `report_viewer.html`, `report_demo_v2.html`, `snapshot_report.html`, `gen_report.js` | primary engine — seven-layer Zi Ping analysis |
| `bazi_engine.js` | legacy / reference copy | patched in sync |
| `bazi_engine.min.js` | `basic_report.html`, `full_bazi_reading.html` | patched in sync |

The seven-layer analysis (strength, pattern, useful god, symbolic stars, Da Yun, specialised
readings) is the product's differentiation and was not redesigned. The audit focused on the
calendar and pillar core that everything else depends on.

## What the core already did well

- Real astronomical solar-term calculation (solar ecliptic longitude + Newton iteration), not a
  hard-coded date table.
- Year pillar keyed to Li Chun, month pillar keyed to the 12 Jie.
- A true-solar-time layer with a ~90-city coordinate database.
- Hidden stems, Na Yin, Kong Wang, Ten Gods, Twelve Stages, Da Yun and Liu Nian are all present.

## Bugs found and fixed

### 1. The day pillar was two days behind (affects every chart)

`getDayPillar()` anchored the 60-day cycle to **1984-02-02**, treating it as a Jia Zi day. The
sexagenary day for 1984-02-02 is **Bing Yin**; the correct Jia Zi anchor is **1984-01-31**.
Because the Day Master is taken from this pillar, every reading's Day Master, Ten Gods, strength
assessment and useful-god choice were built on the wrong day.

| Birth | Before | After |
| --- | --- | --- |
| 1990-05-15 14:30 | 庚午 辛巳 **戊寅** 己未 | 庚午 辛巳 **庚辰** 癸未 |
| 2000-01-01 12:00 | 己卯 丁丑 **丙辰** 甲午 | 己卯 丙子 **戊午** 戊午 |

### 2. December and early January used the wrong month pillar

`getSolarMonthIndex()` looped the birth year's 12 Jie only. December (after Da Xue) and 1–5
January (before Xiao Han) fell through to the default Chou month, so the month pillar — and the
seasonal strength assessment that depends on it — was wrong for those dates.

The fix builds a chronologically sorted Jie list spanning the previous, current and next year and
returns the latest boundary on or before the birth date.

| Birth | Before | After |
| --- | --- | --- |
| 1990-01-03 | 己巳 **丁丑** 丙寅 癸巳 | 己巳 **丙子** 戊辰 丁巳 |
| 1990-12-31 | 庚午 **己丑** 戊辰 戊午 | 庚午 **戊子** 庚午 壬午 |
| 2000-01-01 | 己卯 **丁丑** 丙辰 甲午 | 己卯 **丙子** 戊午 戊午 |

### 3. Solar-term dates were computed in UT, not China Standard Time

The solar-term routine converts a Julian Day to a calendar date without a timezone. Published
Chinese solar terms use UTC+8, so any term occurring before 08:00 CST was dated one day early
(about one third of terms), and Xiao Han / Da Han were also estimated one year late.

| Term | Before (UT) | After (CST) |
| --- | --- | --- |
| Xiao Han 2024 | 01-05 | **01-06** |
| Li Chun 2026 | 02-03 | **02-04** |
| Da Xue 2025 | 12-06 | **12-07** |

The same offset and year-mapping corrections were applied to `bazi_engine.js` and
`bazi_engine.min.js` so the legacy report pages stay consistent with the main engine.

## Verification

`node tools/verify-bazi-engine.js` checks:

- four full-chart reference cases (year/month/day/hour),
- the day-cycle anchors,
- six December / early-January month-boundary cases,
- the full 24-term date table for 2024, 2025 and 2026.

Result: **16 passed, 0 failed**. Running the same test against the pre-fix engine produces
14 failures.

A wider cross-check against the independent `lunar-javascript` library, over targeted boundary
dates plus ~2,400 random non-boundary dates, produced **0 day, month or year mismatches**. Dates
within one day of a Jie were excluded because the engine uses date-level boundaries (see below).

## Remaining limitations

1. **Exact solar-term time.** Boundaries are date-level. A birth on a Jie day before the exact
   term time is assigned the new month/year. Example: Li Chun 2025 is 3 Feb 22:10 CST, but a
   birth at 12:00 that day already gets the 乙巳 / 戊寅 pillars. Fixing this needs the birth
   timezone, which the forms do not collect.
2. **No birth location in the UI.** `calculateProfile()` supports `birthLocation`, but
   `instant_reading.html` never passes it, so the true-solar-time layer is effectively inactive.
   The city table also uses fixed standard offsets (DST is ignored).
3. **Late Zi hour.** 23:00–23:59 is treated as the current calendar day. The "Zi hour starts the
   next day" school would shift the day pillar; the engine has no option for it.
4. **Duplicate engines.** `bazi_engine.js` / `bazi_engine.min.js` are legacy copies kept in sync
   by hand. Retiring them in favour of `bazi_engine_v2.js` would remove a maintenance risk.

## Open-source alternatives (GitHub)

| Project | Stack | Fit | Notes |
| --- | --- | --- | --- |
| [6tail/lunar-javascript](https://github.com/6tail/lunar-javascript) | JS | high | 1.7k★; solar terms, lunar calendar, EightChar/BaZi, Da Yun. Used as the reference for this audit. |
| [6tail/tyme4ts](https://github.com/6tail/tyme4ts) | TS | high | 521★; the newer successor to Lunar, cleaner API and extension points. |
| [yuangu/sxtwl_cpp](https://github.com/yuangu/sxtwl_cpp) | C++/Python | medium | 259★; astronomical-grade Chinese calendar (寿星天文历). Not browser-native. |
| [6tail/lunar-python](https://github.com/6tail/lunar-python) | Python | medium | 694★; server-side companion if report generation moves off the client. |

## Recommendation

- **Keep** the v2 analysis layers; they are the product's differentiation.
- **Now:** ship the three core fixes plus the regression check (this PR).
- **Next:** vendor `lunar-javascript` (or `tyme4ts`) as the calendar core and add an optional
  birth-location / timezone field to the free-reading and report forms. That enables exact
  solar-term boundaries, true solar time and DST for the overseas audience — the main accuracy
  gap that remains.
- **Then:** retire the legacy engine copies so only one implementation is maintained.
