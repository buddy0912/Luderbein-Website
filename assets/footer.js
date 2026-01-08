/* =========================================================
   LUDERBEIN – Footer Snippet (zentral)
   Pflege nur hier. Jede Seite nutzt <footer id="site-footer"></footer>
   ========================================================= */
(function () {
  const host = document.getElementById("site-footer");
  if (!host) return;

  const year = new Date().getFullYear();

  const WA_NUMBER = "491725925858";
  const MAIL_toggle = "luderbein_gravur@icloud.com";
  const INSTA_URL = "https://instagram.com/Luderbein_Gravur";

  host.innerHTML = `
    <div class="wrap foot">
      <div class="small">© <span>${year}</span> Luderbein</div>

      <div class="small">
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <a class="btn primary" href="https://wa.me/${WA_NUMBER}" rel="noopener">
            <span aria-hidden="true" style="display:inline-flex; width:18px; height:18px; margin-right:8px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C7.03 3 3 6.7 3 11.25c0 2.15.9 4.1 2.39 5.57L4 21l4.46-1.3c1.08.36 2.27.55 3.54.55 4.97 0 9-3.7 9-8.25S16.97 3 12 3Z"
                  stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M8.3 11.4h.01M12 11.4h.01M15.7 11.4h.01"
                  stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
              </svg>
            </span>
            WhatsApp
          </a>

          <a class="btn" href="mailto:${MAIL_toggle}">
            <span aria-hidden="true" style="display:inline-flex; width:18px; height:18px; margin-right:8px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 7.5h15v9h-15v-9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M5.2 8.2 12 13.2l6.8-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            E-Mail
          </a>

          <a class="btn" href="${INSTA_URL}" rel="me noopener">
            <span aria-hidden="true" style="display:inline-flex; width:18px; height:18px; margin-right:8px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4.5h8A3.5 3.5 0 0 1 19.5 8v8A3.5 3.5 0 0 1 16 19.5H8A3.5 3.5 0 0 1 4.5 16V8A3.5 3.5 0 0 1 8 4.5Z"
                  stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M12 10a2.75 2.75 0 1 0 0 5.5A2.75 2.75 0 0 0 12 10Z"
                  stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M16.6 7.6h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
              </svg>
            </span>
            Instagram
          </a>

          <a class="btn" href="/kontakt/">
            <span aria-hidden="true" style="display:inline-flex; width:18px; height:18px; margin-right:8px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 10.8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M12 8.2h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
              </svg>
            </span>
            Kontaktseite
          </a>
        </div>
      </div>

      <div class="small">
        <a href="/rechtliches/impressum.html">Impressum</a> ·
        <a href="/rechtliches/datenschutz.html">Datenschutz</a>
      </div>
    </div>
  `;
})();
