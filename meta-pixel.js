/* ---------------------------------------------------------------------------
   Meta Pixel — brunasantanna.com
   ---------------------------------------------------------------------------
   Este arquivo é o ÚNICO lugar onde o pixel é configurado. As 60 páginas do
   site carregam ele com uma linha só no <head>:

       <script src="/meta-pixel.js"></script>

   Para trocar o pixel, mude só a constante PIXEL_ID abaixo. Não precisa
   editar página nenhuma.

   O que ele dispara sozinho, sem precisar mexer no HTML:
     PageView          todas as páginas
     ViewContent       guias, /curso, /sistema, /biblioteca (com nome e valor)
     Lead              qualquer formulário que tenha campo de e-mail
     InitiateCheckout  qualquer clique em link do Kiwify
--------------------------------------------------------------------------- */

(function () {
  'use strict';

  // Pixel da business "Bruna Santanna". Trocar aqui se mudar de pixel.
  var PIXEL_ID = '1341783077164816';

  // Preço dos produtos, usado no valor dos eventos.
  var PRODUTOS = {
    '/curso':    { nome: 'Claude com Profundidade (Virada IA 2.0)', valor: 347.00 },
    '/sistema':  { nome: 'Motor de Conteúdo',                       valor: 169.00 }
  };

  /* --- código base do Meta (padrão da própria Meta) --------------------- */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  /* --- identifica a página --------------------------------------------- */
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  if (path === '' || path === '/index') path = '/';

  var produto = PRODUTOS[path];

  if (produto) {
    // Página de venda: ViewContent com valor, que é o que o Meta usa
    // pra achar quem se parece com quem compra.
    fbq('track', 'ViewContent', {
      content_name: produto.nome,
      content_category: 'produto',
      content_type: 'product',
      value: produto.valor,
      currency: 'BRL'
    });
  } else if (path.indexOf('/guia-') === 0) {
    // Guia: o nome vira o slug, pra dar pra separar público por assunto.
    fbq('track', 'ViewContent', {
      content_name: path.slice(6),
      content_category: 'guia'
    });
  } else if (path === '/biblioteca') {
    fbq('track', 'ViewContent', { content_name: 'biblioteca', content_category: 'biblioteca' });
  } else if (path === '/mentoria') {
    fbq('track', 'ViewContent', { content_name: 'mentoria', content_category: 'servico' });
  }

  /* --- Lead: qualquer formulário com campo de e-mail -------------------- */
  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    if (!form || form.tagName !== 'FORM') return;
    if (!form.querySelector('input[type="email"]')) return;

    fbq('track', 'Lead', {
      content_name: path === '/' ? 'home' : path.slice(1),
      content_category: 'captura-email'
    });
  }, true);

  /* --- InitiateCheckout: qualquer link do Kiwify ------------------------ */
  document.addEventListener('click', function (ev) {
    var link = ev.target && ev.target.closest ? ev.target.closest('a[href*="pay.kiwify"]') : null;
    if (!link) return;

    var dados = { content_category: 'checkout' };
    if (produto) {
      dados.content_name = produto.nome;
      dados.value = produto.valor;
      dados.currency = 'BRL';
    } else {
      dados.content_name = path === '/' ? 'home' : path.slice(1);
    }

    fbq('track', 'InitiateCheckout', dados);
  }, true);

})();
