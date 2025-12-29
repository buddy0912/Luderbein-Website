(() => {
  // active nav highlight
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll('header .menu a').forEach(a => {
    const href = a.getAttribute('href');
    const normalized = href === "/" ? "/" : href.replace(/\/$/, "");
    if (normalized === path) a.setAttribute("aria-current", "page");
  });

  // mobile menu toggle
  const btn = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!btn || !nav) return;

  const setOpen = (open) => {
    nav.dataset.open = open ? "1" : "0";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  btn.addEventListener("click", () => {
    const open = nav.dataset.open !== "1";
    setOpen(open);
  });

  // close on link click (mobile)
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => setOpen(false));
  });

  // close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // default closed
  setOpen(false);
})();
