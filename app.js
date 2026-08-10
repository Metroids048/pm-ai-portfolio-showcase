/* ============================================================
   APP — page dispatch
   Renderers live in js/: shared, home, case, pages, interactions.
   ============================================================ */

(function () {
  if (!window.SHOWCASE_DATA) return;

  const page = document.body.dataset.page;

  const routes = {
    index: () => window.HomePage.render(),
    project: () => window.CasePage.render(),
    methodology: () => window.MethodologyPage.render(),
    about: () => window.AboutPage.render(),
  };

  const render = routes[page] || routes.index;
  document.body.innerHTML = render();

  window.Interactions.init();
})();
