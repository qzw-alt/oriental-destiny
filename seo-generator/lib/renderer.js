// Simple template renderer — replaces {{PLACEHOLDER}} markers with values.
// No dependencies. Designed for the Oriental Destiny SEO generator.

function render(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(value != null ? String(value) : '');
  }
  return result;
}

module.exports = { render };
