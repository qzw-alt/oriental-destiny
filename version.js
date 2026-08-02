window.OD_VERSION = "2.0.1";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".od-version").forEach((el) => {
    el.textContent = "v" + window.OD_VERSION;
  });
});
