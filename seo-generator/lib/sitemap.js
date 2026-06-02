// Sitemap updater — reads, merges, and writes sitemap.xml
const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, '..', '..', 'sitemap.xml');

function readSitemap() {
  try {
    return fs.readFileSync(SITEMAP_PATH, 'utf8');
  } catch (e) {
    return null;
  }
}

function addUrls(sitemapXml, newUrls) {
  const urls = newUrls.map(u => `  <url>
    <loc>https://oriental-destiny.com/${u.loc}</loc>
    <changefreq>${u.changefreq || 'monthly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`).join('\n');

  // Insert before closing </urlset>
  const closingTag = '</urlset>';
  const insertPos = sitemapXml.lastIndexOf(closingTag);
  if (insertPos === -1) {
    throw new Error('Invalid sitemap.xml: missing </urlset>');
  }

  return sitemapXml.slice(0, insertPos) + urls + '\n' + sitemapXml.slice(insertPos);
}

function removeExistingUrls(sitemapXml, slugs) {
  // Remove any existing entries with matching URLs
  let result = sitemapXml;
  for (const slug of slugs) {
    const pattern = new RegExp(`\\s*<url>\\s*<loc>https://oriental-destiny\\.com/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.html</loc>[\\s\\S]*?</url>\\s*`, 'g');
    result = result.replace(pattern, '');
  }
  return result;
}

function writeSitemap(sitemapXml) {
  fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf8');
}

function updateSitemap(pages) {
  let xml = readSitemap();
  if (!xml) {
    console.error('Could not read sitemap.xml');
    return false;
  }

  // Remove existing entries for these slugs
  const slugs = pages.map(p => p.loc.replace('.html', ''));
  xml = removeExistingUrls(xml, slugs);

  // Add new entries
  xml = addUrls(xml, pages);

  writeSitemap(xml);
  console.log(`Sitemap updated: ${pages.length} URLs added/updated`);
  return true;
}

module.exports = { updateSitemap, readSitemap };
