const zoom = document.querySelector('#zoom');
let trigger;

document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-close], [data-zoom]');
  if (!control) return;
  if (control.hasAttribute('data-close')) {
    zoom.close();
    return;
  }
  trigger = control;
  const original = control.querySelector('img');
  const image = zoom.querySelector('img');
  image.src = original.src;
  image.alt = original.alt;
  zoom.showModal();
});
zoom.addEventListener('close', () => trigger?.focus({ preventScroll: true }));

function selectDecision() {
  const state = location.hash.match(/^#case-([1-3])$/)?.[1] || '1';
  for (const panel of document.querySelectorAll('[data-state]')) {
    panel.hidden = panel.dataset.state !== state;
  }
  for (const link of document.querySelectorAll('[data-state-link]')) {
    if (link.dataset.stateLink === state) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('hashchange', selectDecision);
selectDecision();

for (const flow of document.querySelectorAll('[data-flow]')) {
  const view = flow.closest('[data-view]');
  const steps = [...flow.querySelectorAll('[data-flow-step]')];
  const position = flow.querySelector('[data-flow-position]');
  const text = flow.querySelector('[data-flow-text]');
  const jump = flow.querySelector('[data-flow-jump]');
  const figure = flow.querySelector('[data-flow-figure]');
  const number = value => String(value).padStart(2, '0');
  let decision, stateLink;

  function select(step) {
    const index = steps.indexOf(step) + 1;
    const decisionIndex = step.dataset.flowDecision;
    decision = decisionIndex && view.querySelector(`[data-case-decision="${decisionIndex}"]`);
    stateLink = decisionIndex && view.querySelector(`[data-state-link="${decisionIndex}"]`);
    for (const item of steps) item.removeAttribute('aria-current');
    step.setAttribute('aria-current', 'step');
    position.textContent = `${number(index)} / ${number(steps.length)}`;
    text.textContent = step.textContent;
    flow.style.setProperty('--flow-factor', index / steps.length);
    const proof = decision && (decision.querySelector('[data-proof] img') ||
      view.querySelector('[data-shared-decision-proof] [data-proof] img'));
    figure.hidden = !proof;
    if (proof) {
      const image = figure.querySelector('img');
      image.src = proof.src;
      image.alt = proof.alt;
      figure.querySelector('figcaption').textContent = proof.alt;
    }
    jump.hidden = !decision;
    if (decision) jump.textContent = `查看决策 · ${decision.querySelector('h3').textContent}`;
  }

  for (const step of steps) step.addEventListener('click', () => select(step));
  jump.addEventListener('click', () => {
    const heading = decision.querySelector('h3');
    const go = () => {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'center' });
    };
    if (stateLink && stateLink.hash !== window.location.hash) {
      window.addEventListener('hashchange', go, { once: true });
      stateLink.click();
    } else go();
  });
  select(steps[0]);
}
