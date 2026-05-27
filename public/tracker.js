/**
 * tracker.js — Script de tracking pour Comparateur API IA
 *
 * INSTALLATION :
 *  1. Copiez ce fichier dans public/tracker.js de votre projet Next.js
 *  2. Ajoutez dans app/layout.js :
 *       <Script src="/tracker.js" strategy="afterInteractive" />
 *
 * CONFIGURATION ABLY (site en ligne) :
 *  Remplacez ABLY_KEY par votre clé Ably (https://ably.com — gratuit)
 *  Format : "xxxxx.yyyyy:zzzzzz"
 *
 * ÉVÉNEMENTS TRACKÉS :
 *  - pageview  : chaque changement de route
 *  - click     : clics sur liens / boutons
 *  - tool      : clic vers /api-ia/[slug]
 *  - compare   : clic vers /comparatif/[slug]
 *  - contact   : clic vers /contact
 *  - search    : saisie dans les champs de recherche (debounce 600ms)
 *  - filter    : interaction avec les filtres de catégorie
 *  - error     : erreurs JavaScript globales
 *
 * API PUBLIQUE :
 *  window.cmpTrack(event) — envoie un événement custom
 */

(function () {
  'use strict';

  // ─── CONFIG — modifiez uniquement ces deux lignes ──────────────────────────
  var ABLY_KEY = '02BEnQ.b-Wvrw:A-fVTOnloi1LoV0b6Q_XDcmlPsJKulxAcsinf-sUioo';   // ex: "xVLRyA.aBcDeF:1234567890abcdef"
  var CHANNEL  = 'cmp_ai_tracker';   // doit être identique dans le dashboard
  // ──────────────────────────────────────────────────────────────────────────

  var KEY = CHANNEL;
  var MAX = 200;

  // ─── Détection mode ────────────────────────────────────────────────────────
  var isOnline = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
  var ablyReady = ABLY_KEY !== 'VOTRE_CLE_ABLY' && ABLY_KEY.length > 10;

  // ─── Session ID ────────────────────────────────────────────────────────────
  function getSessionId() {
    var k = KEY + '_sid';
    var id = sessionStorage.getItem(k);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      sessionStorage.setItem(k, id);
    }
    return id;
  }

  // ─── Ably REST publish ─────────────────────────────────────────────────────
  function sendToAbly(ev) {
    if (!ablyReady) return;
    try {
      fetch('https://rest.ably.io/channels/' + encodeURIComponent(CHANNEL) + '/messages', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(ABLY_KEY),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: ev.type, data: ev })
      }).catch(function () {});
    } catch (e) {}
  }

  // ─── Send ───────────────────────────────────────────────────────────────────
  function send(ev) {
    if (!ev || typeof ev !== 'object') return;
    ev._ts       = Date.now();
    ev._id       = Math.random().toString(36).slice(2);
    ev.sessionId = ev.sessionId || getSessionId();
    ev.url       = location.href;
    ev.page      = ev.page || location.pathname + location.search;

    // 1. Ably (site en ligne → dashboard distant)
    if (isOnline || ablyReady) sendToAbly(ev);

    // 2. localStorage queue (polling dashboard local)
    try {
      var raw   = localStorage.getItem(KEY + '_events') || '[]';
      var queue = JSON.parse(raw);
      queue.push(ev);
      if (queue.length > MAX) queue = queue.slice(-MAX);
      localStorage.setItem(KEY + '_events', JSON.stringify(queue));
    } catch (e) {}

    // 3. BroadcastChannel (même navigateur, local)
    try { new BroadcastChannel(KEY).postMessage(ev); } catch (e) {}

    // 4. window.opener (si le dashboard a ouvert le site)
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ __tracker: KEY, event: ev }, '*');
      }
    } catch (e) {}

    // 5. parent frame
    try {
      if (window.parent !== window) {
        window.parent.postMessage({ __tracker: KEY, event: ev }, '*');
      }
    } catch (e) {}

    // Debug
    if (localStorage.getItem(KEY + '_debug') === '1') {
      console.log('[tracker]', ev.type, ev);
    }
  }

  // ─── Page views ─────────────────────────────────────────────────────────────
  function trackPage() {
    send({
      type:  'pageview',
      page:  location.pathname + location.search,
      label: document.title
    });
  }

  trackPage();

  var _pushState    = history.pushState.bind(history);
  var _replaceState = history.replaceState.bind(history);
  history.pushState    = function () { _pushState.apply(this, arguments);    setTimeout(trackPage, 120); };
  history.replaceState = function () { _replaceState.apply(this, arguments); setTimeout(trackPage, 120); };
  window.addEventListener('popstate', function () { setTimeout(trackPage, 120); });

  // ─── Clicks ─────────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest('a[href], button, [data-track]');
    if (!el) return;
    var href  = el.getAttribute('href') || '';
    var label = (el.innerText || '').trim().slice(0, 80) || el.getAttribute('aria-label') || '';
    var type  = 'click';
    if (/\/api-ia\//.test(href))      type = 'tool';
    else if (/\/comparatif\//.test(href)) type = 'compare';
    else if (/\/contact/.test(href))  type = 'contact';
    send({ type: type, label: label, meta: href });
  }, true);

  // ─── Search ─────────────────────────────────────────────────────────────────
  var searchTimers = new WeakMap();
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'INPUT') return;
    var isSearch = el.type === 'search'
      || (el.name  || '').toLowerCase().indexOf('q') === 0
      || (el.placeholder || '').toLowerCase().indexOf('recherch') >= 0
      || (el.placeholder || '').toLowerCase().indexOf('search')   >= 0
      || el.getAttribute('data-search') != null;
    if (!isSearch) return;
    if (searchTimers.has(el)) clearTimeout(searchTimers.get(el));
    searchTimers.set(el, setTimeout(function () {
      var val = (el.value || '').trim();
      if (val.length < 2) return;
      send({ type: 'search', query: val, label: '"' + val + '"', value: val });
    }, 600));
  }, true);

  // ─── Filters ────────────────────────────────────────────────────────────────
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el) return;
    if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio') {
      var label = el.getAttribute('aria-label') || el.name || el.id || 'filtre';
      var val   = el.value || (el.checked ? 'on' : 'off');
      send({ type: 'filter', label: label, value: val });
    }
  }, true);

  // ─── Errors ─────────────────────────────────────────────────────────────────
  window.addEventListener('error', function (e) {
    send({
      type:  'error',
      label: (e.message || 'Erreur inconnue').slice(0, 120),
      meta:  (e.filename || '') + ':' + (e.lineno || 0)
    });
  });

  window.addEventListener('unhandledrejection', function (e) {
    send({
      type:  'error',
      label: 'UnhandledRejection: ' + String(e.reason).slice(0, 100),
      meta:  location.pathname
    });
  });

  // ─── Public API ─────────────────────────────────────────────────────────────
  window.cmpTrack = send;

  var mode = ablyReady ? 'Ably (online)' : 'local (BroadcastChannel)';
  console.log('[tracker] Comparateur API IA actif — mode:', mode, '— clé:', KEY);
})();