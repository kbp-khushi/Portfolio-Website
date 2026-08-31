// Review mode — annotate the live/local portfolio site and export your marks as a file.
//
// How to use:
//   1. Open the site (local preview or the deployed one) in your browser.
//   2. Open DevTools (F12) -> Console tab.
//   3. Paste this entire file's contents and hit Enter.
//   4. A small toolbar appears at the bottom of the screen.
//        - "Pin" mode: click anywhere to drop a numbered note.
//        - "Draw" mode: click and drag to mark up the page in red ink.
//   5. Click "Export" when done. It downloads a single self-contained HTML
//      file with your marks baked in — hand that file back in chat.
//   6. Click "Exit" (or press Escape) to remove review mode and browse normally.
//
// Note: this site's project pages (Caesura, Woven Edge, etc.) are fixed-position
// overlays that scroll internally, separate from normal page scroll. Review mode
// detects whichever container you actually clicked inside and keeps your pins/
// drawings glued to that container's own content, so marks stay put as you scroll.
//
(function () {
  if (window.__reviewModeActive) {
    console.log('Review mode is already active.');
    return;
  }
  window.__reviewModeActive = true;

  const STROKE_COLOR = '#ff2d2d';
  const pins = [];
  const strokes = [];
  const actions = []; // unified undo stack: {type:'pin'|'stroke', containerId, ref, el}
  let mode = 'pin'; // 'pin' | 'draw'
  let pinCounter = 0;
  let drawing = false;
  let currentStroke = null;
  let currentDrawContainerId = null;
  let containerIdSeq = 0;

  function docWidth() {
    return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  }
  function docHeight() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  // --- capture layer: always-present, viewport-fixed, receives all input ---
  const captureLayer = document.createElement('div');
  captureLayer.id = 'review-mode-capture';
  captureLayer.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483000;cursor:crosshair;background:transparent;';
  document.body.appendChild(captureLayer);

  // --- toolbar ---
  const toolbar = document.createElement('div');
  toolbar.id = 'review-mode-toolbar';
  toolbar.style.cssText =
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483001;' +
    'background:#111;color:#fff;font:13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;' +
    'border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:center;' +
    'box-shadow:0 4px 20px rgba(0,0,0,.35);';
  document.body.appendChild(toolbar);

  function btn(label, onClick, active) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `background:${active ? '#fff' : '#333'};color:${active ? '#111' : '#fff'};border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font:inherit;`;
    b.onclick = onClick;
    return b;
  }

  function refreshToolbar() {
    toolbar.innerHTML = '';
    toolbar.appendChild(btn('Pin', () => { mode = 'pin'; refreshToolbar(); }, mode === 'pin'));
    toolbar.appendChild(btn('Draw', () => { mode = 'draw'; refreshToolbar(); }, mode === 'draw'));
    toolbar.appendChild(btn('Undo', undoLast));
    toolbar.appendChild(btn('Clear', clearAll));
    toolbar.appendChild(btn(`Export (${pins.length + strokes.length})`, exportReview));
    toolbar.appendChild(btn('Exit', exitReview));
    const hint = document.createElement('span');
    hint.style.cssText = 'opacity:.65;margin-left:2px;white-space:nowrap;';
    hint.textContent = mode === 'pin' ? 'click to drop a note' : 'click + drag to draw';
    toolbar.appendChild(hint);
  }

  // --- figure out what's actually beneath the click ---
  // Closed .project-page overlays stay display:block/pointer-events:auto (just
  // opacity:0, for their open/close transition), so they still intercept
  // elementFromPoint even when invisible. Neutralize them while probing.
  function realElementAt(clientX, clientY) {
    captureLayer.style.display = 'none';
    const closedPages = Array.from(document.querySelectorAll('.project-page:not(.open)'));
    closedPages.forEach((p) => { p.dataset.reviewPrevPointerEvents = p.style.pointerEvents; p.style.pointerEvents = 'none'; });
    const el = document.elementFromPoint(clientX, clientY);
    closedPages.forEach((p) => { p.style.pointerEvents = p.dataset.reviewPrevPointerEvents || ''; delete p.dataset.reviewPrevPointerEvents; });
    captureLayer.style.display = '';
    return el;
  }

  // Walk up from the real clicked element to find the nearest ancestor that
  // scrolls its own content independently (e.g. an open .project-page overlay).
  // Returns null if the click belongs to normal document-level scroll.
  function findScrollContainer(el) {
    let node = el;
    while (node && node !== document.body && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 2) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function ensureContainerId(container) {
    if (!container.id) container.id = 'review-anon-container-' + ++containerIdSeq;
    return container.id;
  }

  // --- ink layers: one lazily-created visual layer per container, living
  // inside that container so it naturally scrolls/hides/shows with it ---
  const inkLayers = new Map(); // containerId (or null) -> {canvas, ctx, pinLayer, container, w, h}

  function getInkLayer(containerId, container) {
    if (inkLayers.has(containerId)) return inkLayers.get(containerId);

    const parent = container || document.body;
    const w = container ? container.scrollWidth : docWidth();
    const h = container ? container.scrollHeight : docHeight();

    const wrap = document.createElement('div');
    wrap.className = 'review-ink-wrap';
    wrap.setAttribute('data-review-container', containerId === null ? 'document' : containerId);
    wrap.style.cssText = `position:absolute;top:0;left:0;width:${w}px;height:${h}px;pointer-events:none;`;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.cssText = 'position:absolute;top:0;left:0;';
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pinLayer = document.createElement('div');
    pinLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    wrap.appendChild(pinLayer);

    parent.appendChild(wrap);
    const layer = { wrap, canvas, ctx, pinLayer, container: container || null, w, h };
    inkLayers.set(containerId, layer);
    return layer;
  }

  function redrawLayer(layer, containerId) {
    layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    strokes
      .filter((s) => s.containerId === containerId)
      .forEach((s) => {
        layer.ctx.beginPath();
        s.points.forEach((p, i) => (i === 0 ? layer.ctx.moveTo(p[0], p[1]) : layer.ctx.lineTo(p[0], p[1])));
        layer.ctx.stroke();
      });
  }

  // keep every known ink layer sized to its container's current content size
  function resyncAllLayers() {
    inkLayers.forEach((layer, containerId) => {
      const w = layer.container ? layer.container.scrollWidth : docWidth();
      const h = layer.container ? layer.container.scrollHeight : docHeight();
      if (w !== layer.canvas.width || h !== layer.canvas.height) {
        layer.canvas.width = w;
        layer.canvas.height = h;
        layer.wrap.style.width = w + 'px';
        layer.wrap.style.height = h + 'px';
        redrawLayer(layer, containerId);
      }
    });
  }
  const sizeInterval = setInterval(resyncAllLayers, 700);

  // --- context capture for notes ---
  function pageContext(el) {
    if (!el) return null;
    const pp = el.closest && el.closest('.project-page');
    if (pp) {
      const t = pp.querySelector('.pp-title');
      return t ? t.textContent.trim() : pp.id;
    }
    const view = el.closest && el.closest('.view');
    if (view) return view.id.replace('view-', '');
    return null;
  }

  function isRendered(el) {
    if (el.offsetParent === null) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  }

  // targetY is in the same coordinate space as resolvePoint()'s x/y: page-relative
  // when container is null, container-content-relative otherwise.
  function nearestHeading(targetY, container) {
    const scope = container || document;
    const headings = Array.from(scope.querySelectorAll('.ds-title,.pp-title,.group-label,h1,h2,h3')).filter(isRendered);
    const containerRect = container ? container.getBoundingClientRect() : null;
    let best = null;
    let bestDist = Infinity;
    headings.forEach((h) => {
      const rectTop = h.getBoundingClientRect().top;
      const localTop = container ? rectTop - containerRect.top + container.scrollTop : rectTop + window.scrollY;
      if (localTop <= targetY) {
        const dist = targetY - localTop;
        if (dist < bestDist) { bestDist = dist; best = h; }
      }
    });
    return best ? best.textContent.trim() : null;
  }

  function snippetNear(el) {
    let node = el;
    let text = '';
    for (let i = 0; i < 4 && node && !text; i++) {
      text = (node.textContent || '').trim();
      node = node.parentElement;
    }
    return text.slice(0, 90);
  }

  // --- resolve a client-space event to {containerId, container, x, y} ---
  function resolvePoint(clientX, clientY) {
    const real = realElementAt(clientX, clientY);
    const container = findScrollContainer(real);
    if (!container) {
      return { containerId: null, container: null, x: clientX + window.scrollX, y: clientY + window.scrollY, real };
    }
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left + container.scrollLeft;
    const y = clientY - rect.top + container.scrollTop;
    return { containerId: ensureContainerId(container), container, x, y, real };
  }

  // --- pins ---
  function createPinEl(pin) {
    const el = document.createElement('div');
    el.className = 'review-pin';
    el.style.cssText = `position:absolute;left:${pin.x - 11}px;top:${pin.y - 11}px;width:22px;height:22px;border-radius:50%;background:${STROKE_COLOR};color:#fff;font:bold 12px/22px -apple-system,sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.4);cursor:pointer;pointer-events:auto;`;
    el.textContent = pin.num;
    el.title = pin.note;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      editPin(pin, el);
    });
    return el;
  }

  function editPin(pin, el) {
    const note = window.prompt('Edit note (leave blank + OK to delete):', pin.note);
    if (note === null) return;
    if (note.trim() === '') {
      const i = pins.indexOf(pin);
      if (i > -1) pins.splice(i, 1);
      el.remove();
      refreshToolbar();
      return;
    }
    pin.note = note.trim();
    el.title = pin.note;
  }

  function addPin(clientX, clientY) {
    const point = resolvePoint(clientX, clientY);
    const note = window.prompt('Note for this spot:');
    if (note === null || note.trim() === '') return;
    pinCounter += 1;
    const pin = {
      num: pinCounter,
      containerId: point.containerId,
      x: point.x,
      y: point.y,
      note: note.trim(),
      page: pageContext(point.real),
      heading: nearestHeading(point.y, point.container),
      snippet: snippetNear(point.real),
    };
    pins.push(pin);
    const layer = getInkLayer(point.containerId, point.container);
    const el = createPinEl(pin);
    layer.pinLayer.appendChild(el);
    actions.push({ type: 'pin', ref: pin, el });
    refreshToolbar();
  }

  // --- drawing ---
  function startStroke(clientX, clientY) {
    const point = resolvePoint(clientX, clientY);
    drawing = true;
    currentDrawContainerId = point.containerId;
    currentStroke = { containerId: point.containerId, points: [[point.x, point.y]] };
    strokes.push(currentStroke);
    actions.push({ type: 'stroke', ref: currentStroke });
    const layer = getInkLayer(point.containerId, point.container);
    layer.ctx.beginPath();
    layer.ctx.moveTo(point.x, point.y);
  }
  function extendStroke(clientX, clientY) {
    if (!drawing) return;
    // re-resolve against the SAME container the stroke started in, so a fast
    // drag that crosses container boundaries doesn't corrupt the stroke
    const layer = inkLayers.get(currentDrawContainerId);
    if (!layer) return;
    let x, y;
    if (currentDrawContainerId === null) {
      x = clientX + window.scrollX;
      y = clientY + window.scrollY;
    } else {
      const rect = layer.container.getBoundingClientRect();
      x = clientX - rect.left + layer.container.scrollLeft;
      y = clientY - rect.top + layer.container.scrollTop;
    }
    currentStroke.points.push([x, y]);
    layer.ctx.lineTo(x, y);
    layer.ctx.stroke();
  }
  function endStroke() {
    drawing = false;
    currentStroke = null;
    currentDrawContainerId = null;
  }

  // --- events (all on captureLayer, which always covers the viewport) ---
  captureLayer.addEventListener('mousedown', (e) => {
    if (e.target.closest && e.target.closest('.review-pin')) return;
    resyncAllLayers();
    if (mode === 'pin') addPin(e.clientX, e.clientY);
    else startStroke(e.clientX, e.clientY);
  });
  captureLayer.addEventListener('mousemove', (e) => {
    if (mode === 'draw' && drawing) extendStroke(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', endStroke);

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      exitReview();
      document.removeEventListener('keydown', escHandler);
    }
  });

  function undoLast() {
    const last = actions.pop();
    if (!last) return;
    if (last.type === 'pin') {
      const i = pins.indexOf(last.ref);
      if (i > -1) pins.splice(i, 1);
      last.el.remove();
    } else {
      const i = strokes.indexOf(last.ref);
      if (i > -1) strokes.splice(i, 1);
      const layer = inkLayers.get(last.ref.containerId);
      if (layer) redrawLayer(layer, last.ref.containerId);
    }
    refreshToolbar();
  }

  function clearAll() {
    if (!window.confirm('Clear all pins and drawings?')) return;
    pins.length = 0;
    strokes.length = 0;
    actions.length = 0;
    pinCounter = 0;
    inkLayers.forEach((layer, containerId) => {
      layer.pinLayer.innerHTML = '';
      redrawLayer(layer, containerId);
    });
    refreshToolbar();
  }

  function exitReview() {
    clearInterval(sizeInterval);
    captureLayer.remove();
    toolbar.remove();
    inkLayers.forEach((layer) => layer.wrap.remove());
    window.__reviewModeActive = false;
  }

  // --- export ---
  function buildExportHtml() {
    const clone = document.documentElement.cloneNode(true);
    const cc = clone.querySelector('#review-mode-capture');
    if (cc) cc.remove();
    const ct = clone.querySelector('#review-mode-toolbar');
    if (ct) ct.remove();
    clone.querySelectorAll('.review-ink-wrap').forEach((n) => n.remove());

    const svgNS = 'http://www.w3.org/2000/svg';

    function buildStaticOverlay(containerId, w, h) {
      const wrap = clone.ownerDocument.createElement('div');
      wrap.setAttribute('style', `position:absolute;top:0;left:0;width:${w}px;height:${h}px;pointer-events:none;z-index:999999;`);

      const svg = clone.ownerDocument.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      svg.setAttribute('style', 'position:absolute;top:0;left:0;');
      strokes.filter((s) => s.containerId === containerId).forEach((s) => {
        const path = clone.ownerDocument.createElementNS(svgNS, 'polyline');
        path.setAttribute('points', s.points.map((p) => p.join(',')).join(' '));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', STROKE_COLOR);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
      });
      wrap.appendChild(svg);

      pins.filter((p) => p.containerId === containerId).forEach((pin) => {
        const d = clone.ownerDocument.createElement('div');
        d.setAttribute('style', `position:absolute;left:${pin.x - 11}px;top:${pin.y - 11}px;width:22px;height:22px;border-radius:50%;background:${STROKE_COLOR};color:#fff;font:bold 12px/22px -apple-system,sans-serif;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.4);`);
        d.textContent = String(pin.num);
        wrap.appendChild(d);

        const note = clone.ownerDocument.createElement('div');
        note.setAttribute('style', `position:absolute;left:${pin.x + 14}px;top:${pin.y - 6}px;max-width:260px;background:#fff9db;border:1px solid #e6d98a;border-radius:4px;padding:4px 7px;font:12px/1.4 -apple-system,sans-serif;color:#111;box-shadow:0 2px 8px rgba(0,0,0,.15);`);
        note.textContent = `${pin.num}. ${pin.note}`;
        wrap.appendChild(note);
      });

      return wrap;
    }

    inkLayers.forEach((layer, containerId) => {
      const w = layer.container ? layer.container.scrollWidth : docWidth();
      const h = layer.container ? layer.container.scrollHeight : docHeight();
      const overlay = buildStaticOverlay(containerId, w, h);
      if (containerId === null) {
        clone.querySelector('body').appendChild(overlay);
      } else {
        const target = clone.querySelector('#' + containerId);
        if (target) target.appendChild(overlay);
        else clone.querySelector('body').appendChild(overlay); // fallback, shouldn't happen
      }
    });

    const data = {
      exportedAt: new Date().toISOString(),
      pins: pins.map((p) => ({
        num: p.num,
        note: p.note,
        page: p.page,
        heading: p.heading,
        snippet: p.snippet,
        containerId: p.containerId,
        x: p.x,
        y: p.y,
      })),
      strokeCount: strokes.length,
    };
    const dataScript = clone.ownerDocument.createElement('script');
    dataScript.type = 'application/json';
    dataScript.id = 'review-data';
    dataScript.textContent = JSON.stringify(data, null, 2);
    clone.querySelector('body').appendChild(dataScript);

    return '<!DOCTYPE html>\n' + clone.outerHTML;
  }

  function exportReview() {
    if (!pins.length && !strokes.length) {
      window.alert('Nothing to export yet — drop a pin or draw something first.');
      return;
    }
    const html = buildExportHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `review-${ts}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // debug/test hooks — harmless to leave in, never shipped to the live site
  window.__reviewMode = { pins, strokes, buildExportHtml, exitReview, inkLayers };

  refreshToolbar();
  console.log(
    '%cReview mode active.',
    'font-weight:bold;color:#ff2d2d;',
    'Click = drop a note pin. Switch to Draw to mark up the page. Export when done. Escape to exit.'
  );
})();
