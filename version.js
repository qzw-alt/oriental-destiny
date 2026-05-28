window.OD_VERSION = "1.12.0";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".od-version").forEach((el) => {
    el.textContent = "v" + window.OD_VERSION;
  });
});
