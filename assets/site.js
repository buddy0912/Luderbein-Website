(() => {
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll('header .menu a').forEach(a => {
    const href = a.getAttribute('href');
    const normalized = href === "/" ? "/" : href.replace(/\/$/, "");
    if (normalized === path) a.setAttribute("aria-current", "page");
  });
})();
