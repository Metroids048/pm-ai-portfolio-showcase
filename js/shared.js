/* ============================================================
   SHARED — utilities, shell (topbar/footer), UI primitives
   Content comes from data.js untouched; this layer only frames it.
   ============================================================ */

window.UI = (function () {
  const data = window.SHOWCASE_DATA;

  /** Fixed display order of the case list. */
  const PROJECT_ORDER = [
    'agent-platform',
    'ai-bidding-platform',
    'listing-compliance',
    'ai-image-editing',
    'ai-writing-platform',
    'agent-system-design',
    'alpha-mining',
    'ai-quant-platform',
  ];

  /** English UI label per project — assistive label, not new content. */
  const PROJECT_KIND = {
    'alpha-mining': '量化研究治理',
    'ai-quant-platform': '量化研究平台',
    'agent-platform': '企业智能体平台',
    'ai-bidding-platform': '招采业务 AI',
    'ai-writing-platform': 'Agent + RAG',
    'agent-system-design': 'AI 开放平台',
    'listing-compliance': 'AI 风控产品',
    'ai-image-editing': 'AIGC 编辑器',
  };

  const ARROW = '<span class="arw" aria-hidden="true">→</span>';

  /** Encode each path segment so non-ASCII asset names remain valid URLs. */
  function fileHref(path) {
    if (!path) return '';
    return path
      .split('/')
      .map((s) => encodeURIComponent(s))
      .join('/');
  }

  function esc(str) {
    return String(str == null ? '' : str).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  }

  function orderedProjects() {
    return PROJECT_ORDER.map((id) => data.projects.find((p) => p.id === id)).filter(Boolean);
  }

  function kindOf(project) {
    return PROJECT_KIND[project.id] || 'AI 产品';
  }

  /** Leading keyword of a module line, e.g. "研究生成层：…" -> "研究生成层". */
  function keywords(project, limit = 3) {
    return (project.modules || [])
      .slice(0, limit)
      .map((m) => String(m).split(/[：:]/)[0].trim())
      .filter(Boolean);
  }

  function tags(items, limit = 4) {
    const list = (items || []).slice(0, limit);
    if (!list.length) return '';
    return `<div class="tags">${list.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
  }

  /* ---------- Shell ---------- */

  function topbar(active) {
    const items = [
      ['index.html', '首页', 'home'],
      ['index.html#work', '代表项目', 'work'],
      ['methodology.html', '实践手记', 'methodology'],
      ['about.html', '关于我', 'about'],
    ];
    const link = ([href, label, key]) =>
      `<a class="${active === key ? 'active' : ''}"${
        active === key ? ' aria-current="page"' : ''
      } href="${href}">${label}</a>`;

    return `
      <a class="skip-link" href="#main-content">跳到主要内容</a>
      <div class="scroll-progress" data-progress aria-hidden="true"></div>
      <header class="topbar${active === 'home' ? ' topbar--home' : ''}" data-topbar>
        <div class="container topbar-inner">
          <nav class="nav" aria-label="主导航">
            ${items.map(link).join('')}
          </nav>
          <button
            class="nav-toggle"
            type="button"
            data-nav-toggle
            aria-expanded="false"
            aria-controls="mobile-nav"
            aria-label="打开导航菜单"
          >
            <span class="nav-toggle-bars" aria-hidden="true"><i></i><i></i></span>
          </button>
        </div>
        <!-- Mobile disclosure: carries every entry, so nothing is dropped
             on small screens the way display:none used to drop them. -->
        <div class="mobile-nav" id="mobile-nav" data-mobile-nav hidden>
          <nav class="container mobile-nav-list" aria-label="移动端导航">
            ${items.map(link).join('')}
          </nav>
        </div>
      </header>`;
  }

  function footer() {
    const p = data.profile;
    const c = p.contact || {};
    return `
      <footer class="footer">
        <div class="container footer-inner">
          <div><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></div>
          <nav aria-label="页脚导航"><a href="index.html#work">代表项目</a><a href="methodology.html">实践手记</a><a href="about.html">关于我</a></nav>
          <span>© ${new Date().getFullYear()} ${esc(p.name)}</span>
        </div>
      </footer>`;
  }

  /* ---------- Screenshot frame ---------- */

  /**
   * Product window frame around a real screenshot.
   * `fit: 'contain'` for screenshots that must not lose UI.
   */
  function frame(src, alt, opts = {}) {
    const { label = '', fit = 'cover', eager = false, ratioClass = '' } = opts;
    return `
      <div class="frame">
        ${
          label
            ? `<div class="frame-bar"><i></i><i></i><i></i><b>${esc(label)}</b></div>`
            : ''
        }
        <div class="frame-media ${fit === 'contain' ? 'frame-media-contain' : ''} ${ratioClass}">
          <img src="${esc(src)}" alt="${esc(alt)}" ${
            eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'
          }>
        </div>
      </div>`;
  }

  return {
    data,
    ARROW,
    esc,
    fileHref,
    orderedProjects,
    kindOf,
    keywords,
    tags,
    topbar,
    footer,
    frame,
  };
})();
