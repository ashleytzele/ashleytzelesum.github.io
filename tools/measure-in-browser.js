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
    '#a002 .education-route::before,#a002 .education-node::before,#a002 .education-node::after{transform:none!important}' +
    '#a003 .experience-track-list::before,#a003 .experience-role::before{transform:none!important}' +
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
    a002CollapsedDetails: [...document.querySelectorAll('#a002 .education-route,#a002 .education-node')]
      .filter(e => ['::before', '::after'].some(pseudo => {
        const style = getComputedStyle(e, pseudo);
        return !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(style.transform);
      })).length,
    a003CollapsedTracks: [...document.querySelectorAll('#a003 .experience-track-list,#a003 .experience-role')]
      .filter(e => ['::before'].some(pseudo => {
        const style = getComputedStyle(e, pseudo);
        return !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(style.transform);
      })).length,
  });

  const visibleIn = (e, view = window) => {
    if (!e) return false;
    const r = e.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    for (let n = e; n; n = n.parentElement) {
      const style = view.getComputedStyle(n);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    }
    return true;
  };

  // Removing the earned gate models the static/no-JS CSS state. Include the
  // A-001 parts and construction marks, not only the legacy SVG drawing marks.
  const hadRuntime = document.documentElement.classList.contains('runtime-ready');
  document.documentElement.classList.remove('runtime-ready');
  const staticParts = [...document.querySelectorAll('#a001 .part')];
  const staticA002Essentials = [...document.querySelectorAll(
    '#a002 .education-node,#a002 .education-node-meta span,#a002 .education-node h3,#a002 .education-place,#a002 .education-programme,#a002 .education-programme p,#a002 .education-transfer,#a002 .education-transfer strong,#a002 .education-transfer>span,#a002 .education-caption span')];
  const staticA003Roles = [...document.querySelectorAll('#a003 .experience-role')];
  const staticA003Details = [...document.querySelectorAll('#a003 .experience-detail')];
  const staticA003Controls = [...document.querySelectorAll('#a003 .experience-more')];
  R.withoutJS = {
    ...revealState(),
    parts: staticParts.length,
    names: staticParts.map(t => t.querySelector('.part-name').textContent.trim()),
    a002: {
      nodes: document.querySelectorAll('#a002 .education-node').length,
      transfer: document.querySelector('#a002 .education-transfer')?.textContent.trim(),
      essentialVisible: staticA002Essentials.every(e => visibleIn(e)),
    },
    a003: {
      tracks: document.querySelectorAll('#a003 .experience-track').length,
      roles: staticA003Roles.length,
      order: staticA003Roles.map(role => role.dataset.experience),
      detailsVisible: staticA003Details.every(detail => visibleIn(detail)),
      controlsHidden: staticA003Controls.every(control => !visibleIn(control)),
    },
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
    a002Completed: reducedState ? reducedState.a002CollapsedDetails === 0 : null,
    a003Completed: reducedState ? reducedState.a003CollapsedTracks === 0 : null,
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

  const experienceButtons = [...document.querySelectorAll('#a003 .experience-more')];
  const experienceDetails = [...document.querySelectorAll('#a003 .experience-detail')];
  const detailsOwned = experienceButtons.every(button => {
    const role = button.closest('.experience-role');
    const detail = document.getElementById(button.getAttribute('aria-controls'));
    return role && detail && detail.closest('.experience-role') === role;
  });
  function openCollapsedDetails(buttons) {
    buttons.filter(button => button.getAttribute('aria-expanded') !== 'true').forEach(button => button.click());
  }
  // DISCLOSURE_OPEN_END
  openCollapsedDetails(experienceButtons.slice(0, 2));
  R.enhanced = {
    ...(R.enhanced || {}),
    a003: {
      controls: experienceButtons.length,
      detailsOwned,
      twoOpen: experienceDetails.filter(detail => detail.dataset.open === 'true').length >= 2,
      labelsFollowState: experienceButtons.every(button =>
        button.textContent.trim().startsWith(button.getAttribute('aria-expanded') === 'true' ? 'Close details' : 'Open details')),
    },
  };

  function auditAnimations(animations) {
    const frameMetadata = new Set(['offset', 'computedOffset', 'easing', 'composite']);
    const details = animations.map(animation => {
      const timing = animation.effect.getTiming();
      const properties = [...new Set(animation.effect.getKeyframes()
        .flatMap(Object.keys).filter(property => !frameMetadata.has(property)))].sort();
      return {
        name: animation.animationName || '(unnamed)',
        iterations: timing.iterations === Infinity ? 'infinite' : timing.iterations,
        properties,
      };
    });
    const properties = [...new Set(details.flatMap(animation => animation.properties))].sort();
    return {
      total: details.length,
      infinite: details.filter(animation => animation.iterations === 'infinite').length,
      layoutProps: properties.filter(property => /^(width|height|top|left|right|bottom|margin|padding)/.test(property)),
      properties,
      details,
    };
  }
  // ANIMATION_AUDIT_END

  function animationSummary({ total, infinite, layoutProps, properties }) {
    return { total, infinite, layoutProps, properties };
  }
  // ANIMATION_SUMMARY_END

  // Restart the reveal state and sample on the next frame, while A-002's finite
  // animations are observable. Waiting for completion made a zero result vacuous.
  const draws = [...document.querySelectorAll('[data-draw]')];
  draws.forEach(draw => draw.classList.remove('drawn'));
  void document.body.offsetWidth;
  draws.forEach(draw => draw.classList.add('drawn'));
  await new Promise(requestAnimationFrame);
  const anims = document.getAnimations();
  const a002Animations = document.querySelector('#a002').getAnimations({ subtree: true });
  const a003Animations = document.querySelector('#a003').getAnimations({ subtree: true });
  const animationDetails = auditAnimations(anims);
  R.anims = {
    total: animationDetails.total,
    infinite: animationDetails.infinite,
    layoutProps: animationDetails.layoutProps,
    properties: animationDetails.properties,
    details: animationDetails.details,
    a002: auditAnimations(a002Animations),
    a003: auditAnimations(a003Animations),
  };
  // anims.a003 is the dedicated A-003 reveal-animation audit.

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
      d.querySelector('#a002').classList.add('drawn');
      d.querySelector('#a003').classList.add('drawn');
      await new Promise(r => setTimeout(r, 1800));
      // Open every disclosure panel before measuring. Otherwise every control
      // inside `.detail` is display:none (closed by default) and gets filtered
      // out by the height>0 guard below, so the gate never sees the controls a
      // visitor reaches by clicking "Open detail".
      d.querySelectorAll('.more').forEach(b => b.click());
      d.querySelectorAll('#a003 .experience-more').forEach(button => button.click());
      const visible = e => visibleIn(e, f.contentWindow);
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
      const route = d.querySelector('#a002 .education-route');
      const educationNodes = [...d.querySelectorAll('#a002 .education-node')];
      const transfer = d.querySelector('#a002 .education-transfer');
      const routeStyle = f.contentWindow.getComputedStyle(route);
      const educationText = [...d.querySelectorAll(
        '#a002 .education-node-meta,#a002 .education-place,#a002 .education-programme p,#a002 .education-transfer,#a002 .education-caption')];
      const routeDirection = routeStyle.gridTemplateColumns.split(' ').length === 1 ? 'vertical' : 'horizontal';
      const routeOverflow = route.scrollWidth > route.clientWidth + 1;
      const educationTextFloor = Math.min(...educationText.map(e =>
        parseFloat(f.contentWindow.getComputedStyle(e).fontSize)));
      const experienceTracks = [...d.querySelectorAll('#a003 .experience-track')];
      const experienceRoles = [...d.querySelectorAll('#a003 .experience-role')];
      const experienceDetails = [...d.querySelectorAll('#a003 .experience-detail')];
      const experienceGrid = d.querySelector('#a003 .experience-tracks');
      const experienceGridStyle = f.contentWindow.getComputedStyle(experienceGrid);
      const experienceColumns = experienceGridStyle.gridTemplateColumns.split(' ').filter(Boolean).length;
      const experienceText = [...d.querySelectorAll(
        '#a003 .experience-meta,#a003 .experience-org,#a003 .experience-evidence,#a003 .experience-detail-label,#a003 .experience-concurrent,#a003 .experience-caption')];
      const experienceTextFloor = Math.min(...experienceText.map(element =>
        parseFloat(f.contentWindow.getComputedStyle(element).fontSize)));
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
        a002: {
          nodes: educationNodes.length,
          order: educationNodes.map(n => n.dataset.education),
          visible: educationNodes.every(visible) && visible(transfer),
          routeDirection,
          routeOverflow,
          educationTextFloor: +educationTextFloor.toFixed(1),
        },
        a003: {
          tracks: experienceTracks.length,
          trackNames: experienceTracks.map(track => track.querySelector('.experience-track-title').textContent.trim()),
          roles: experienceRoles.length,
          order: experienceRoles.map(role => role.dataset.experience),
          visible: experienceRoles.every(visible) && experienceDetails.every(visible),
          trackLayout: experienceColumns === 1 ? 'stacked' : 'parallel',
          trackOverflow: experienceGrid.scrollWidth > experienceGrid.clientWidth + 1,
          detailsOwned: experienceDetails.every(detail => detail.closest('.experience-role')),
          experienceTextFloor: +experienceTextFloor.toFixed(1),
        },
      });
      f.remove();
    };
    document.body.appendChild(f);
  });
  R.responsive = [];
  for (const px of [320, 390, 768, 1024, 1440]) R.responsive.push(await at(px));

  const serializable = {
    ...R,
    anims: {
      ...animationSummary(R.anims),
      a002: animationSummary(R.anims.a002),
      a003: animationSummary(R.anims.a003),
    },
  };
  const report = JSON.stringify(serializable, null, 1);
  console.log(report);
  return report;
})();
