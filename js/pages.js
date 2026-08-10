/* ============================================================
   PAGES — methodology + about
   ============================================================ */

window.MethodologyPage = (function () {
  const U = window.UI;
  const { data, esc, ARROW } = U;

  function render() {
    const all = U.orderedProjects();
    // Each anchor points at a real project already in the data set.
    const anchors = [
      ['业务机会识别', all[0], '从人工搜标、筛选和跟进链路中定位可自动化的高价值环节。'],
      ['AI方案拆解', all[1], '将长文写作拆成大纲、素材检索、分步生成和全文优化。'],
      ['风险与兜底', all[3], '在合规检测场景中设计任务恢复、额度回退和部分成功导出。'],
      ['平台能力沉淀', all[2], '将工具、记忆、RAG 和评估配置化，支撑多业务线复用。'],
    ].filter(([, p]) => p);

    const systems = data.methodSystems || [];

    return (
      U.topbar('methodology') +
      `<main id="main-content">
        <section class="page-hero">
          <div class="page-hero-grid" aria-hidden="true"></div>
          <div class="container">
            <span class="eyebrow reveal">实践方法</span>
            <h1 class="reveal" style="--reveal-delay:60ms">AI 产品交付方法</h1>
            <p class="lead reveal" style="--reveal-delay:110ms">
              围绕真实项目，展示我如何判断业务机会、拆解 AI 方案、推进交付并复盘结果。
            </p>
          </div>
        </section>

        <section class="section-tight section-flush-b">
          <div class="container">
            <div class="method-map">
              ${anchors
                .map(
                  ([title, p, text], i) => `
                    <a class="method-card reveal" style="--reveal-delay:${i * 50}ms"
                       href="project.html?id=${p.id}">
                      <span class="eyebrow">${esc(title)}</span>
                      <h3>${esc(p.name)}</h3>
                      <p>${esc(text)}</p>
                      <span class="link link-accent">查看对应项目 ${ARROW}</span>
                    </a>`,
                )
                .join('')}
            </div>
          </div>
        </section>

        ${
          systems.length
            ? `<section class="section">
                 <div class="container">
                   <div class="section-head reveal">
                     <span class="eyebrow">复用框架</span>
                     <h2 class="section-title">常用判断框架</h2>
                     <p class="section-sub">
                       面向真实交付的判断方式：业务目标先行，AI能力拆分，风险与指标同步设计。
                     </p>
                   </div>
                   <div class="method-map">
                     ${systems
                       .map(
                         (m) => `
                           <div class="method-card reveal">
                             <span class="eyebrow">判断框架</span>
                             <h3>${esc(m.title)}</h3>
                             <p>${esc(m.desc)}</p>
                             ${window.CasePage.spec(m.items, true)}
                           </div>`,
                       )
                       .join('')}
                   </div>
                 </div>
               </section>`
            : ''
        }

        <section class="section">
          <div class="container">
            <div class="section-head reveal">
              <span class="eyebrow">推进节奏</span>
              <h2 class="section-title">从 0 到 1 的推进节奏</h2>
            </div>
            <div class="steps">
              ${(data.methodology || [])
                .map(
                  (s) => `
                    <article class="step reveal">
                      <div class="step-num">${esc(s.step)}</div>
                      <div>
                        <h3>${esc(s.title)}</h3>
                        <p>${esc(s.desc)}</p>
                      </div>
                      <ul class="step-points">
                        ${(s.points || []).map((x) => `<li>${esc(x)}</li>`).join('')}
                      </ul>
                    </article>`,
                )
                .join('')}
            </div>
          </div>
        </section>
      </main>` +
      U.footer()
    );
  }

  return { render };
})();

window.AboutPage = (function () {
  const U = window.UI;
  const { data, esc, ARROW } = U;

  function render() {
    const p = data.profile;
    const c = p.contact || {};
    const s = data.skills || {};

    return (
      U.topbar('about') +
      `<main id="main-content">
        <section class="page-hero about-hero">
          <div class="page-hero-grid" aria-hidden="true"></div>
          <div class="container">
            <span class="eyebrow reveal">个人介绍</span>
            <h1 class="reveal" style="--reveal-delay:60ms">${esc(p.name)}</h1>
            <div class="about-role reveal" style="--reveal-delay:90ms">${esc(p.role)}</div>
            <p class="lead reveal" style="--reveal-delay:110ms">
              ${esc(p.tagline)}
            </p>
            <p class="about-hero-note reveal" style="--reveal-delay:140ms">覆盖需求分析、AI 方案设计、PRD/原型交付和跨团队推进。</p>
          </div>
        </section>

        <section class="section-tight">
          <div class="container about-grid">
            <div class="about-prose reveal">
              <p class="lede">
                我更关注 AI 能力进入业务后的完整产品闭环：谁使用、解决什么问题、模型结果如何被校验、异常如何恢复、指标如何复盘。
              </p>
              <p>${esc(p.intro)}</p>
              <div class="subhead-mono" style="margin-top:40px">职业定位</div>
              <ul class="spec spec-dash" style="margin-top:14px">
                ${(p.highlights || []).map((h) => `<li>${esc(h)}</li>`).join('')}
              </ul>
            </div>

            <aside class="profile-panel reveal" style="--reveal-delay:80ms">
              <div class="aside-block">
                <div class="subhead-mono">联系方式</div>
                <dl class="contact-rows" style="margin-top:14px">
                  <div class="contact-row">
                    <dt>Email</dt>
                    <dd>${
                      c.email
                        ? `<a class="link" href="mailto:${esc(c.email)}">${esc(c.email)} ${ARROW}</a>`
                        : '请补充邮箱'
                    }</dd>
                  </div>
                  <div class="contact-row">
                    <dt>电话</dt>
                    <dd>${
                      c.phone
                        ? `<a class="link" href="tel:${esc(c.phone)}">${esc(c.phone)}</a>`
                        : '请补充电话'
                    }</dd>
                  </div>
                  <div class="contact-row">
                    <dt>简历</dt>
                    <dd>${
                      c.resume
                        ? `<a class="link" href="${U.fileHref(c.resume)}" target="_blank" rel="noopener">点击查看/下载 ${ARROW}</a>`
                        : '请补充简历链接'
                    }</dd>
                  </div>
                </dl>
              </div>

              <div class="aside-block">
                <div class="subhead-mono">能力标签</div>
                <div style="margin-top:16px;display:grid;gap:20px">
                  ${[
                    ['产品能力', s.product],
                    ['AI 能力', s.ai],
                    ['协作能力', s.collaboration],
                  ]
                    .filter(([, arr]) => arr && arr.length)
                    .map(
                      ([title, arr]) => `
                        <div>
                          <div class="muted" style="font-size:13px;margin-bottom:9px">${esc(title)}</div>
                          ${U.tags(arr, 12)}
                        </div>`,
                    )
                    .join('')}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>` +
      U.footer()
    );
  }

  return { render };
})();
