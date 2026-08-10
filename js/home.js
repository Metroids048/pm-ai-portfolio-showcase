/* Homepage — final bright tech editorial direction. */
window.HomePage = (function () {
  const U = window.UI;
  const { data, esc, ARROW } = U;

  function hero() {
    const p = data.profile;
    return `
      <section class="hero hero-final">
        <div class="hero-atmosphere" aria-hidden="true"></div>
        <div class="container hero-inner">
          <div class="hero-copy">
            <h1 class="hero-name reveal">${esc(p.name)}</h1>
            <div class="hero-role reveal" style="--reveal-delay:80ms">${esc(p.role)} <span class="signature-slash">/</span></div>
            <p class="hero-tagline reveal" style="--reveal-delay:140ms">${esc(p.tagline)}</p>
            <p class="hero-lead reveal" style="--reveal-delay:190ms">${esc(p.intro)}</p>
            <div class="hero-actions reveal" style="--reveal-delay:250ms">
              <a class="btn btn-primary magnetic" data-magnetic href="#work">查看代表项目 ${ARROW}</a>
              ${p.contact && p.contact.resume ? `<a class="btn" href="${U.fileHref(p.contact.resume)}" target="_blank" rel="noopener">查看简历</a>` : ''}
            </div>
          </div>
          <div class="hero-tech-stage hero-montage reveal" style="--reveal-delay:120ms" aria-label="真实 AI 产品界面组合">
            <div class="montage-grid" aria-hidden="true"></div>
            <span class="montage-label montage-label-top">真实项目界面 / 01—03</span>
            <div class="montage-card montage-card-back">
              ${U.frame('assets/prototypes/p1-quant.webp', 'AI 量化研究与自动交易平台界面', { label: 'Testnet / Research', fit: 'contain', eager: true })}
            </div>
            <div class="montage-card montage-card-mid">
              ${U.frame('assets/prototypes/p2-bidding.png', 'AI 标讯管理系统界面', { label: 'AI Bidding', fit: 'contain', eager: true })}
            </div>
            <div class="montage-card montage-card-front">
              ${U.frame('assets/prototypes/p7-agent-platform-cover.webp', '企业级智能体服务平台界面', { label: 'Agent Platform', fit: 'contain', eager: true })}
            </div>
            <div class="montage-signal"><i></i><span>AI 产品交付</span><b>0→1</b></div>
            <span class="montage-label montage-label-bottom">界面证据 · 方案判断 · 交付落地</span>
          </div>
        </div>
      </section>`;
  }

  function valueStrip() {
    return `
      <section class="value-strip" aria-label="核心能力">
        <div class="container value-strip-inner">
          <span>AI 产品设计</span><i></i><span>Prompt / Skills / Agent / Workflow</span><i></i><span>Vibe Coding</span><i></i><span>0→1 快速落地</span>
        </div>
      </section>`;
  }

  function projectCard(p, index) {
    return `
      <article class="project-item project-peer reveal">
        <a class="project-media" href="project.html?id=${p.id}" aria-label="查看 ${esc(p.name)}">
          ${U.frame(p.cover, p.name, { label: p.name, fit: 'cover', eager: index <= 2 })}
        </a>
        <div class="project-copy">
          <span class="project-index">${String(index).padStart(2, '0')}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.scene)}</p>
          ${p.result ? `<p class="project-result">${esc(p.result)}</p>` : ''}
          <a class="text-link" href="project.html?id=${p.id}">查看项目详情 ${ARROW}</a>
        </div>
      </article>`;
  }

  function projects() {
    const all = U.orderedProjects();
    return `
      <section class="section projects-section" id="work">
        <div class="container">
          <div class="section-head section-head-editorial reveal">
            <div><span class="section-kicker">真实项目 · 真实交付</span><h2 class="section-title">代表项目 <span class="signature-slash">/</span></h2><p class="section-head-copy">用真实项目展示 AI 产品从需求拆解、方案设计到交付落地的能力。</p></div>
            <a class="text-link" href="index.html#work">查看全部项目 ${ARROW}</a>
          </div>
          <div class="project-peer-grid">${all.map((p, i) => projectCard(p, i + 1)).join('')}</div>
        </div>
      </section>`;
  }

  function darkSignature() {
    const evidence = [
      ['业务问题拆解', '从用户痛点、业务损失与机会窗口切入，定义可量化的 AI 产品目标。'],
      ['AI 能力设计', '将 Prompt、Skills、Agent 与 Workflow 组合成可控的产品方案，补齐状态、权限与异常闭环。'],
      ['协同交付与验收', '输出 PRD、原型与测试用例，结合 Vibe Coding 制作可交互界面，推进研发、算法与业务协同落地。'],
    ];
    return `
      <section class="dark-signature">
        <div class="container dark-signature-inner">
          <div class="dark-signature-copy reveal"><p class="section-kicker">产品判断 · 交付方法</p><h2>从判断到<br>交付验收 <span class="signature-slash">/</span></h2><p>围绕业务目标、能力设计和协同交付，推进真实业务中的 AI 产品落地。</p><a class="text-link" href="methodology.html">查看实践方法 ${ARROW}</a></div>
          <div class="dark-evidence reveal">${evidence.map(([t, d], i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div>
        </div>
      </section>`;
  }

  function aboutPreview() {
    const skills = data.skills || {};
    return `
      <section class="section about-band" id="about-preview">
        <div class="container about-band-inner">
          <div class="editorial-heading reveal"><span class="section-kicker">关于我</span><h2>让 AI 能力<br>进入真实业务</h2></div>
          <div class="about-band-copy reveal"><p>${esc(data.profile.intro)}</p><ul>${(data.profile.highlights || []).map((h) => `<li>${esc(h)}</li>`).join('')}</ul><div class="skill-index">${[['产品能力',skills.product],['AI 能力',skills.ai],['协作能力',skills.collaboration]].map(([t,list]) => `<div><strong>${esc(t)}</strong><span>${(list || []).map(esc).join(' · ')}</span></div>`).join('')}</div><a class="text-link" href="about.html">了解更多 ${ARROW}</a></div>
        </div>
      </section>`;
  }

  function render() {
    return U.topbar('home') + `<main id="main-content">${hero()}${valueStrip()}${projects()}${darkSignature()}${aboutPreview()}</main>` + U.footer();
  }

  return { render };
})();
