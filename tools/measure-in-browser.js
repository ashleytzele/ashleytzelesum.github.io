// Paste into DevTools on a served copy of the site, or run via a browser tool.
// Returns a JSON report. Every check here corresponds to a real defect from the
// dual-agent audit, and to a Global Constraint in the plan.
//
// Cache warning: load the page with a fresh query string (?cb=1). A plain
// navigation to an already-visited URL can serve a stale copy and make a fixed
// defect look unfixed.
(async () => {
  const R = {};

  // Contrast. Transitions are killed first: sampling mid-transition reports
  // colours that never actually render.
  const kill = document.createElement('style');
  kill.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}' +
    '.runtime-ready .an,.runtime-ready .dwg .fd,#a001 .part-desc,#a001 .part-ref{opacity:1!important}' +
    '#a001 .part-body::before{transform:none!important}#a001 .part-body::after{clip-path:none!important}' +
    '.detail{display:block!important}';
  document.body.appendChild(kill);

  const lum = c => {
    const p = c.match(/[\d.]+/g).slice(0, 3).map(Number)
      .map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  };
  const ratio = (a, b) => { const s = [lum(a), lum(b)].sort((x, y) => y - x); return (s[0] + 0.05) / (s[1] + 0.05); };
  const bgOf = e => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
    }
    return 'rgb(255,255,255)';
  };
  const scan = () => {
    const fails = [], seen = new Set();
    let combos = 0;
    for (const e of document.querySelectorAll('*')) {
      const txt = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).length;
      if (!txt) continue;
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      if (e.closest('[aria-hidden="true"]')) continue;   // decorative marks are exempt
      const fs = parseFloat(s.fontSize);
      const need = (fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700)) ? 3 : 4.5;
      const fg = s.color, bg = bgOf(e), r = ratio(fg, bg);
      const k = e.tagName + e.className + fg + bg + fs;
      if (seen.has(k)) continue;
      seen.add(k); combos++;
      if (r < need) fails.push({ el: e.tagName + '.' + String(e.className).slice(0, 16), fg, bg, r: r.toFixed(2), need });
    }
    // SVG text uses fill, not color.
    for (const t of document.querySelectorAll('.dwg text')) {
      if (t.closest('[aria-hidden="true"]')) continue;
      const r = ratio(getComputedStyle(t).fill, bgOf(t.parentElement));
      if (r < 4.5) fails.push({ el: 'svg text.' + t.getAttribute('class'), r: r.toFixed(2), need: 4.5 });
    }
    return { combos, fails };
  };
  document.documentElement.setAttribute('data-theme', 'light'); R.light = scan();
  document.documentElement.setAttribute('data-theme', 'dark');  R.dark  = scan();
  document.documentElement.removeAttribute('data-theme');
  kill.remove();

  const revealState = () => ({
    hidden: [...document.querySelectorAll('.an,.dwg .fd,#a001 .part-desc,#a001 .part-ref')]
      .filter(e => getComputedStyle(e).opacity === '0').length,
    undrawn: [...document.querySelectorAll('.dwg .ln')].filter(e => {
      const d = getComputedStyle(e).strokeDashoffset; return d !== '0px' && d !== 'none';
    }).length,
    undrawnOutlines: [...document.querySelectorAll('#a001 .part-body')]
      .filter(e => getComputedStyle(e, '::after').clipPath !== 'none').length,
    collapsedLeaders: [...document.querySelectorAll('#a001 .part-body')]
      .filter(e => !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(e, '::before').transform)).length,
    collapsedAxes: [...document.querySelectorAll('.dwg .axis,#a001 .assembly-axis')]
      .filter(e => !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(e).transform)).length,
  });

  // Removing the earned gate models the static/no-JS CSS state. Include the
  // A-001 parts and construction marks, not only the legacy SVG drawing marks.
  const hadRuntime = document.documentElement.classList.contains('runtime-ready');
  document.documentElement.classList.remove('runtime-ready');
  const staticParts = [...document.querySelectorAll('#a001 .part')];
  R.withoutJS = {
    ...revealState(),
    parts: staticParts.length,
    names: staticParts.map(t => t.querySelector('.part-name').textContent.trim()),
  };
  if (hadRuntime) document.documentElement.classList.add('runtime-ready');

  // This is a real environment measurement, not a forced CSS approximation.
  // Run once with the OS/browser preference set to Reduce Motion to populate
  // `completed`; otherwise null truthfully records that it was not exercised.
  const reducedMatches = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedState = reducedMatches ? revealState() : null;
  R.reducedMotion = {
    matches: reducedMatches,
    completed: reducedState ? Object.values(reducedState).every(value => value === 0) : null,
    state: reducedState,
  };

  // Headings must not change when the page is used.
  const outline = () => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName).join();
  const before = outline();
  document.querySelectorAll('#a001 .part[role=tab]').forEach(t => t.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  R.headingsStable = outline() === before;

  // Keyboard: roving tabindex, arrows, Home/End.
  const tabs = [...document.querySelectorAll('[role=tab]')];
  const key = (el, k) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  tabs[0].focus(); key(tabs[0], 'ArrowDown');
  R.keyboard = {
    rovingTabindex: tabs.filter(t => t.tabIndex === 0).length,        // must be 1
    arrowMovesFocus: document.activeElement === tabs[1],
    panelFollows: document.querySelector('[role=tabpanel]').getAttribute('aria-labelledby') === tabs[1].id,
  };
  key(document.activeElement, 'End');
  R.keyboard.endGoesLast = document.activeElement === tabs[tabs.length - 1];

  // Animation budget.
  window.scrollTo(0, document.body.scrollHeight); window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 2500));
  const anims = document.getAnimations();
  R.anims = {
    total: anims.length,
    infinite: anims.filter(a => { try { return a.effect.getTiming().iterations === Infinity; } catch { return false; } }).length,
    layoutProps: [...new Set(anims.flatMap(a => { try { return a.effect.getKeyframes().flatMap(Object.keys); } catch { return []; } }))]
      .filter(p => /^(width|height|top|left|right|bottom|margin|padding)/.test(p)),
  };

  // Overflow and touch targets, measured in real iframes so media queries fire.
  const at = px => new Promise(res => {
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:-99999px;width:${px}px;height:900px;border:0`;
    f.src = location.pathname + '?cb=' + px;
    f.onload = async () => {
      const d = f.contentDocument;
      const stylesheet = d.querySelector('link[rel="stylesheet"][href*="assets/css/blueprint.css"]');
      await new Promise(done => {
        stylesheet.addEventListener('load', done, { once: true });
        stylesheet.addEventListener('error', done, { once: true });
        const url = new URL(stylesheet.href);
        url.searchParams.set('cb', `${Date.now()}-${px}`);
        stylesheet.href = url.href;
      });
      d.querySelector('#a001').classList.add('drawn');
      await new Promise(r => setTimeout(r, 1800));
      // Open every disclosure panel before measuring. Otherwise every control
      // inside `.detail` is display:none (closed by default) and gets filtered
      // out by the height>0 guard below, so the gate never sees the controls a
      // visitor reaches by clicking "Open detail".
      d.querySelectorAll('.more').forEach(b => b.click());
      const visible = e => {
        const r = e.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return false;
        for (let n = e; n; n = n.parentElement) {
          const style = f.contentWindow.getComputedStyle(n);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        }
        return true;
      };
      const tg = [...d.querySelectorAll('a[href],button,#a001 .part')].filter(visible);
      const small = tg.filter(e => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; });
      const sz = t => { const s = t.ownerSVGElement; return parseFloat(f.contentWindow.getComputedStyle(t).fontSize) * (s.getBoundingClientRect().width / s.viewBox.baseVal.width); };
      const text = [...d.querySelectorAll('.dwg text')].map(sz).sort((a, b) => a - b);
      const assembly = d.querySelector('#a001 .assembly');
      const a001Tabs = [...d.querySelectorAll('#a001 .part')];
      const a001Names = a001Tabs.map(t => t.querySelector('.part-name').textContent.trim());
      const a001VisibleTogether = a001Tabs.every(t => {
        const r = t.getBoundingClientRect();
        const a = assembly.getBoundingClientRect();
        return visible(t) && r.left >= a.left - 1 && r.right <= a.right + 1 &&
          r.top >= a.top - 1 && r.bottom <= a.bottom + 1;
      });
      res({
        px,
        overflow: d.documentElement.scrollWidth > px + 1,
        targets: tg.length,
        under44: small.map(e => e.textContent.trim().slice(0, 14)),
        minDrawnText: +text[0].toFixed(1),
        a001: {
          tabs: a001Tabs.length,
          names: a001Names,
          visibleTogether: a001VisibleTogether,
          assemblyOverflow: assembly.scrollWidth > assembly.clientWidth + 1,
        },
      });
      f.remove();
    };
    document.body.appendChild(f);
  });
  R.responsive = [];
  for (const px of [320, 390, 768, 1024, 1440]) R.responsive.push(await at(px));

  return JSON.stringify(R, null, 1);
})();
