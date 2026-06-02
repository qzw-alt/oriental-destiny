// Sentence template variator — ensures content uniqueness across generated pages.
// Each concept has a pool of 3-5 sentence variants. Selection is deterministic by slug.

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick(pool, seed) {
  return pool[hashCode(seed) % pool.length];
}

const VARIANTS = {

  zodiacIntro: [
    (name) => `The ${name} occupies a special place in the Chinese zodiac — the first sign in the 12-year cycle, associated with new beginnings, sharp intelligence, and survival instinct. People born in ${name} years carry a distinct blend of charm, resourcefulness, and an almost uncanny ability to land on their feet.`,
    (name) => `In the Chinese zodiac, the ${name} is known for quick thinking, social intelligence, and a natural talent for turning situations to their advantage. Those born under this sign are survivors — they adapt, they charm, and they rarely miss an opportunity.`,
    (name) => `The ${name} is one of the most recognized and celebrated signs in the Chinese zodiac. ${name}-year people tend to be quick-witted, socially adept, and remarkably good at reading the room — qualities that have made this sign central to Chinese folklore for millennia.`,
  ],

  zodiacElementVariant: [
    (animal, elem, desc) => `${elem} ${animal} years bring ${desc.toLowerCase()}. Those born in these years carry the ${animal}'s native intelligence filtered through ${elem}'s particular energy.`,
    (animal, elem, desc) => `When the ${animal} meets ${elem}, the result is ${desc.toLowerCase()}. This combination shapes how the ${animal}'s core traits express themselves in the world.`,
  ],

  careerIntro: [
    (name) => `${name}-year people tend to excel in careers that reward quick thinking, social intelligence, and the ability to spot opportunities before others do. They are natural strategists who thrive when the work engages their mind and allows them some autonomy.`,
    (name) => `The ${name}'s natural talents — intelligence, adaptability, and social instinct — map well to careers where these qualities are rewarded. They tend to do best in environments that are dynamic rather than static, and where their ability to read situations gives them an edge.`,
  ],

  relationshipIntro: [
    (name) => `In relationships, ${name}-year people bring warmth, loyalty, and a playful intelligence. They tend to be attentive partners who notice the small things — but they also need a partner who understands their need for occasional independence and intellectual stimulation.`,
    (name) => `When it comes to love and partnership, the ${name} is loyal, protective, and deeply committed to those in their inner circle. They show love through acts of service and thoughtful gestures rather than grand declarations.`,
  ],

  fortune2026Career: [
    (name) => `For ${name}-year professionals, 2026 presents a year of strategic positioning. The Fire Horse's momentum favors those who take calculated risks in Q2 and Q4. A mentorship opportunity or leadership role may emerge — be ready to step forward when it does.`,
    (name) => `Career-wise, 2026 brings a window of visibility for the ${name}. The Fire Horse energy activates your professional sector, particularly in the middle months. This is a year to showcase your skills rather than work behind the scenes.`,
    (name) => `The 2026 Fire Horse year brings dynamic energy to ${name}'s career path. Watch for an unexpected opportunity around mid-year. The key is to balance the Horse's impulse with the ${name}'s natural strategic sense — don't rush, but don't hesitate either.`,
  ],

  fortune2026Love: [
    (name) => `In love, 2026 brings warmth but also tests of patience for the ${name}. Single ${name}s may meet someone through social or professional circles in the second half of the year. Committed ${name}s should focus on shared goals and avoid letting work stress spill into the relationship.`,
    (name) => `For matters of the heart, the ${name} finds 2026 to be a year of deepening connections. The Fire Horse's passionate energy can spark new romance or rekindle existing bonds. Key months for love are April, July, and October.`,
  ],

  fortune2026Wealth: [
    (name) => `Financially, 2026 favors steady growth over speculation for the ${name}. The Fire Horse year brings opportunities for supplementary income, especially through creative or side projects. Spring calls for caution with large purchases; autumn is more favorable for investment decisions.`,
    (name) => `The ${name}'s financial picture in 2026 is one of moderate but reliable growth. Windfall potential exists in the autumn months, but the real story is steady accumulation through consistent effort. Avoid get-rich-quick temptations in the spring.`,
  ],

  fortune2026Health: [
    (name) => `Health-wise, ${name}s should pay attention to stress management in 2026. The Fire Horse's intense energy can lead to burnout if you don't build in recovery time. Regular exercise that you enjoy — not dread — is the medicine this year. Watch digestion in February and September.`,
    (name) => `For ${name} health in 2026, the main theme is balance. The Fire Horse year is high-energy, which is great for motivation but can lead to adrenal fatigue if unchecked. Prioritize sleep, stay hydrated (the Horse's Fire element needs Water balance), and listen to your body's signals.`,
  ],

  dayMasterIntro: [
    (stem, element, image) => `${stem} ${element} Day Masters are ${image}. In BaZi, ${stem} carries the energy of ${element} in its most direct, outward-moving form — the kind of energy that shapes leadership, vision, and the drive to build something lasting.`,
    (stem, element, image) => `People born with a ${stem} Day Master carry ${element} energy in its purest expression. ${image}. This Day Master type is known for its distinctive blend of strength, vision, and a natural inclination toward leadership.`,
  ],

  dayMasterCareer: [
    (stem, element) => `${stem} ${element} Day Masters tend to find their stride in careers that call for vision, structure, and the ability to see the big picture. They are natural architects — of ideas, organizations, or physical spaces — and do their best work when they can shape something from the ground up.`,
    (stem, element) => `Career satisfaction for ${stem} ${element} Day Masters often comes through roles that allow them to build, direct, and take ownership. They thrive when given responsibility and the freedom to execute their vision, and tend to struggle in roles that feel constraining or purely administrative.`,
  ],

  dayMasterRelationships: [
    (stem, element) => `In relationships, ${stem} ${element} Day Masters are protective, steady, and deeply loyal. They show love through reliability and presence rather than words — their partner can count on them to show up, follow through, and provide a sense of security.`,
    (stem, element) => `When it comes to love and partnership, the ${stem} ${element} Day Master brings depth, commitment, and a protective instinct. They are not the most verbally expressive partners, but their actions speak clearly: they build, they provide, and they stay.`,
  ],
};

function vary(key, seed, ...args) {
  const pool = VARIANTS[key];
  if (!pool) throw new Error(`Unknown variant key: ${key}`);
  const fn = pick(pool, seed);
  return fn(...args);
}

module.exports = { vary, pick, hashCode };
