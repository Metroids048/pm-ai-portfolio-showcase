/* ============================================================
   CASE — project detail page
   Editorial rhythm: narrow prose, wide imagery. Content unchanged.
   ============================================================ */

window.CasePage = (function () {
  const U = window.UI;
  const { data, esc, ARROW } = U;

  /* ---------- primitives ---------- */

  function spec(items, dash = false) {
    const list = (items || []).filter(Boolean);
    if (!list.length) return '';
    return `<ul class="spec ${dash ? 'spec-dash' : ''}">${list
      .map((x) => `<li>${esc(x)}</li>`)
      .join('')}</ul>`;
  }

  function prose(text) {
    return text ? `<p class="prose">${esc(text)}</p>` : '';
  }

  function subhead(text) {
    return text ? `<div class="subhead">${esc(text)}</div>` : '';
  }

  /** Workflow and architecture use separate responsive grids. */
  function flow(items, kind = 'workflow') {
    const list = (items || []).filter(Boolean);
    if (!list.length) return '';
    const className = kind === 'architecture' ? 'architecture-grid' : 'workflow-grid';
    return `<div class="${className}">${list.map((x, i) => {
      const parts = String(x).split(/：|:/);
      const title = parts.shift();
      const detail = parts.join('：');
      return `<article class="flow-step">
        <b class="flow-index">${String(i + 1).padStart(2, '0')}</b>
        <div><h3>${esc(title)}</h3>${detail ? `<p>${esc(detail)}</p>` : ''}</div>
      </article>`;
    }).join('')}</div>`;
  }

  function metrics(list) {
    const items = (list || []).filter(Boolean);
    if (!items.length) return '';
    return `<div class="metrics">${items
      .map(
        (m) => {
          const status = String(m.value || '').toUpperCase() === 'PENDING_SIMULATION';
          const label = status ? `${m.label} · PENDING_SIMULATION` : m.label;
          return `<div class="metric${status ? ' metric-status' : ''}"><strong>${esc(status ? '待模拟' : m.value)}</strong><span>${esc(label)}</span></div>`;
        },
      )
      .join('')}</div>`;
  }

  function block(id, eyebrow, title, body) {
    if (!body || !body.trim()) return '';
    return `
      <section class="case-block reveal" id="${id}">
        <span class="eyebrow">${esc(eyebrow)}</span>
        <h2>${esc(title)}</h2>
        ${body}
      </section>`;
  }

  /** A file column, or '' when there is nothing to link.
      Absence reads better than "暂未配置" boilerplate. */
  function fileColumn(title, list) {
    const items = (list || []).filter(Boolean);
    if (!items.length) return '';
    return `
      <div>
        <div class="subhead-mono">${esc(title)}</div>
        <ul class="files">${items
          .map(
            (f) =>
              `<li><a href="${U.fileHref(f.path)}" target="_blank" rel="noopener">
                 <span>${esc(f.label)}</span>${ARROW}
               </a></li>`,
          )
          .join('')}</ul>
      </div>`;
  }

  function fileCols(p) {
    const publicFiles = (p.prototypeFiles || []).filter((f) => /^assets\/prototypes\//i.test(String(f.path || '')));
    const cols = fileColumn('界面证据', publicFiles);
    return cols ? `<div class="file-cols">${cols}</div>` : '';
  }

  /* ---------- optional sections ---------- */

  function agentCatalog(groups) {
    if (!groups || !groups.length) return '';
    return `
      <div class="group-grid">
        ${groups
          .map(
            (g) => `
              <div class="group">
                <h3>${esc(g.title)}</h3>
                <ul class="group-items">
                  ${(g.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}
                </ul>
              </div>`,
          )
          .join('')}
      </div>`;
  }

  function agentGuide(guide) {
    if (!guide) return '';
    const blocks = [
      ['Agent 设计方法', guide.designMethod],
      ['Function Call 工具设计', guide.functionCalling],
      ['短期记忆', guide.shortTermMemory],
      ['长期记忆', guide.longTermMemory],
      ['RAG 配置策略', guide.ragConfig],
      ['多轮对话编排', guide.multiTurn],
    ].filter(([, v]) => v && v.length);
    if (!blocks.length) return '';
    return blocks.map(([t, items]) => `${subhead(t)}${spec(items, true)}`).join('');
  }

  function references(refs) {
    if (!refs || !refs.length) return '';
    return `<ul class="refs">${refs
      .map(
        (r) =>
          `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">
             ${esc(r.label)}<span>↗</span>
           </a></li>`,
      )
      .join('')}</ul>`;
  }

  function gallery(list, name) {
    const imgs = (list || []).filter(Boolean);
    if (!imgs.length) return '';
    return `<div class="gallery">${imgs
      .map((src) => U.frame(src, `${name} 截图`, { fit: 'contain' }))
      .join('')}</div>`;
  }

  function videoGallery(list) {
    const videos = (list || []).filter((item) => item && item.src);
    if (!videos.length) return '';
    return `<div class="video-gallery">${videos
      .map(
        (item) => `
          <figure class="case-video">
            <div class="case-video-bar"><span>Agent output</span><strong>${esc(item.title || '视频成果')}</strong></div>
            <video controls playsinline preload="metadata"${item.poster ? ` poster="${esc(item.poster)}"` : ''} aria-label="${esc(item.title || '项目视频成果')}">
              <source src="${esc(item.src)}" type="video/mp4">
              当前浏览器不支持视频播放。
            </video>
            ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
          </figure>`,
      )
      .join('')}</div>`;
  }

  /* ---------- page ---------- */

  function heroSection(p) {
    return `
      <section class="page-hero">
        <div class="page-hero-grid" aria-hidden="true"></div>
        <div class="container">
          <a class="back-link reveal" href="index.html#work">
            <span class="arw" aria-hidden="true">←</span> 返回项目列表
          </a>
          <span class="eyebrow reveal" style="--reveal-delay:40ms">${esc(U.kindOf(p))}</span>
          <h1 class="reveal" style="--reveal-delay:80ms">${esc(p.name)}</h1>
          <p class="lead reveal" style="--reveal-delay:130ms">${esc(p.summary)}</p>
          <dl class="meta-strip reveal" style="--reveal-delay:180ms">
            <div class="meta-cell"><dt>目标用户</dt><dd>${esc(p.user)}</dd></div>
            <div class="meta-cell"><dt>我的职责</dt><dd>${esc(p.responsibility)}</dd></div>
            <div class="meta-cell"><dt>核心成果</dt><dd>${esc(p.result)}</dd></div>
          </dl>
          <div class="shot-wide reveal" style="--reveal-delay:220ms">
            ${U.frame(p.cover, p.name, { label: p.name, fit: 'cover', eager: true })}
          </div>
        </div>
      </section>`;
  }

  function nextProject(p) {
    const all = U.orderedProjects();
    const i = all.findIndex((x) => x.id === p.id);
    const next = all[(i + 1) % all.length];
    if (!next || next.id === p.id) return '';
    return `
      <section class="section-tight">
        <div class="container">
          <a class="next-project reveal" href="project.html?id=${next.id}">
            <div>
              <span class="eyebrow">下一个项目</span>
              <h2>${esc(next.name)}</h2>
            </div>
            <span class="arw" aria-hidden="true">→</span>
          </a>
        </div>
      </section>`;
  }

  function render() {
    const params = new URLSearchParams(window.location.search);
    const all = U.orderedProjects();
    const id = params.get('id') || all[0].id;
    const p = data.projects.find((x) => x.id === id) || all[0];
    document.title = `${p.name} · 孙伟棚-AI产品经理作品集`;

    const toc = [
      ['problem', '背景与问题'],
      ['task', '目标与 AI 适配'],
      ['action', '产品方案'],
      ['result', '结果与复盘'],
      ['artifacts', '截图与附件'],
    ];

    const body = [
      block(
        'problem',
        '项目背景',
        '背景与问题',
        prose(p.background) + subhead('业务痛点') + spec(p.painPoints, true),
      ),
      block(
        'task',
        '产品目标',
        '目标与 AI 适配性',
        prose(p.goal) +
          subhead('为什么适合用 AI') +
          prose(p.whyAI) +
          subhead('典型使用场景') +
          spec(p.useCases),
      ),
      block(
        'action',
        '方案设计',
        '产品方案与关键决策',
        prose(p.solution) +
          subhead('核心功能模块') +
          spec(p.modules, true) +
          subhead('AI / 规则 / 人工分工') +
          spec(p.aiDesign, true) +
          subhead('技术选型与方案') +
          spec(p.techStack, true) +
          (p.prd && p.prd.length ? subhead('PRD 摘要与验收标准') + spec(p.prd) : '') +
          (p.workflow && p.workflow.length ? subhead('产品链路') + flow(p.workflow, 'workflow') : '') +
          (p.architecture && p.architecture.length
            ? subhead('架构拆解') + flow(p.architecture, 'architecture')
            : '') +
          (p.agentDesign && p.agentDesign.length
            ? subhead('Agent 设计') + spec(p.agentDesign, true)
            : '') +
          (p.agentCatalogGroups && p.agentCatalogGroups.length
            ? subhead('Agent 模块总览') + agentCatalog(p.agentCatalogGroups)
            : '') +
          agentGuide(p.agentGuide),
      ),
      block(
        'result',
        '结果复盘',
        '结果指标与复盘',
        metrics(p.metrics) +
          (p.value && p.value.length ? subhead('产品价值') + spec(p.value, true) : '') +
          (p.myRole && p.myRole.length ? subhead('我的职责') + spec(p.myRole, true) : '') +
          subhead('复盘反思') +
          spec(p.reflection && p.reflection.length ? p.reflection : [p.lessons], true),
      ),
      block(
        'artifacts',
        '交付材料',
        '截图与附件',
        gallery(p.gallery, p.name) +
          videoGallery(p.videos) +
          fileCols(p) +
          (p.references && p.references.length
            ? `${subhead('参考资料')}${references(p.references)}`
            : ''),
      ),
    ].join('');

    return (
      U.topbar('work') +
      `<main id="main-content">
        ${heroSection(p)}
        <section class="section">
          <div class="container case-body">
            <nav class="case-toc" aria-label="案例章节" data-toc>
              ${toc.map(([h, l]) => `<a href="#${h}">${l}</a>`).join('')}
            </nav>
            <div class="case-main">${body}</div>
          </div>
        </section>
        ${nextProject(p)}
      </main>` +
      U.footer()
    );
  }

  return { render, spec, flow, metrics, videoGallery };
})();
