/* ---------------------------------------------------------------------------
   Rastreio de origem no checkout — brunasantanna.com
   ---------------------------------------------------------------------------
   Faz a origem da visita chegar na Kiwify, que filtra venda por src e utm_.

   1. Se a pessoa chegou com utm_source, utm_medium, utm_campaign,
      utm_content, utm_term ou src na URL, guarda na sessionStorage.
      Assim a origem sobrevive se ela passear por outras páginas antes
      de comprar.
   2. Todo link para pay.kiwify.com.br ganha esses parâmetros. Sem src de
      entrada, vai um src padrão da página: site-sistema, site-curso,
      site-comece, site-biblioteca, site-guia-{slug}, site-home...
   3. Parâmetro que o link já tiver não é trocado, e a query string que já
      existir no link é mantida.

   Os links criados depois (ex.: o botão do /diagnostico) também recebem,
   porque o clique é conferido na hora.

   Uma linha no <head>:  <script src="/rastreio-checkout.js" defer></script>
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  var CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src'];
  var STORAGE = 'rastreio_origem';

  /* Lê os parâmetros de rastreio de uma query string ("?a=1&b=2"). */
  function lerParametros(search) {
    var achados = {};
    var partes = String(search || '').replace(/^\?/, '').split('&');
    for (var i = 0; i < partes.length; i++) {
      if (!partes[i]) continue;
      var kv = partes[i].split('=');
      var k, v;
      try {
        k = decodeURIComponent(kv[0].replace(/\+/g, ' '));
        v = decodeURIComponent((kv.slice(1).join('=') || '').replace(/\+/g, ' '));
      } catch (e) { continue; }
      if (CHAVES.indexOf(k) !== -1 && v) achados[k] = v;
    }
    return achados;
  }

  /* src padrão pelo caminho: /sistema -> site-sistema, / -> site-home. */
  function srcPadrao(pathname) {
    var slug = String(pathname || '/').replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
    if (slug === '' || slug === 'index') slug = 'home';
    return 'site-' + slug.replace(/\//g, '-');
  }

  /* Monta a URL do checkout: acrescenta só os parâmetros que o link ainda
     não tem, preservando query string e #hash que já existirem. */
  function montarUrlCheckout(href, params) {
    var hash = '';
    var h = href.indexOf('#');
    if (h !== -1) { hash = href.slice(h); href = href.slice(0, h); }
    var q = href.indexOf('?');
    var base = q === -1 ? href : href.slice(0, q);
    var query = q === -1 ? '' : href.slice(q + 1);
    var existentes = {};
    query.split('&').forEach(function (p) {
      if (!p) return;
      var nome = p.split('=')[0];
      try { nome = decodeURIComponent(nome); } catch (e) {}
      existentes[nome] = true;
    });
    var novos = [];
    for (var i = 0; i < CHAVES.length; i++) {
      var k = CHAVES[i];
      if (params[k] && !existentes[k]) novos.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    }
    if (!novos.length) return base + (query ? '?' + query : '') + hash;
    return base + '?' + (query ? query + '&' : '') + novos.join('&') + hash;
  }

  /* Junta: o que veio na URL agora > o que ficou guardado > src padrão. */
  function origem(search, guardado, pathname) {
    var p = {};
    var k;
    for (k in guardado) if (Object.prototype.hasOwnProperty.call(guardado, k)) p[k] = guardado[k];
    var agora = lerParametros(search);
    for (k in agora) if (Object.prototype.hasOwnProperty.call(agora, k)) p[k] = agora[k];
    if (!p.src) p.src = srcPadrao(pathname);
    return p;
  }

  // Exposto para teste no node; no navegador não faz nada.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { lerParametros: lerParametros, srcPadrao: srcPadrao, montarUrlCheckout: montarUrlCheckout, origem: origem };
  }
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  /* --- navegador --------------------------------------------------------- */
  var guardado = {};
  try { guardado = JSON.parse(window.sessionStorage.getItem(STORAGE) || '{}') || {}; } catch (e) { guardado = {}; }

  var chegou = lerParametros(window.location.search);
  var temAlgo = false;
  for (var c in chegou) if (Object.prototype.hasOwnProperty.call(chegou, c)) { temAlgo = true; break; }
  if (temAlgo) {
    // Chegada nova com origem: substitui a anterior inteira.
    guardado = chegou;
    try { window.sessionStorage.setItem(STORAGE, JSON.stringify(guardado)); } catch (e) {}
  }

  var params = origem('', guardado, window.location.pathname);

  function decorar(a) {
    try {
      var href = a.getAttribute('href');
      if (!href || href.indexOf('pay.kiwify.com.br') === -1) return;
      var novo = montarUrlCheckout(href, params);
      if (novo !== href) a.setAttribute('href', novo);
    } catch (e) {}
  }

  function decorarTodos() {
    var links = document.querySelectorAll('a[href*="pay.kiwify.com.br"]');
    for (var i = 0; i < links.length; i++) decorar(links[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorarTodos);
  else decorarTodos();

  // Links criados depois do carregamento: confere no clique, antes de navegar.
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href*="pay.kiwify.com.br"]') : null;
    if (a) decorar(a);
  }, true);
})();
