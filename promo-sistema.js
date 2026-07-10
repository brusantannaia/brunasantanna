/* Promo site-wide: Aula ao vivo do Sistema (21/07/2026) → /sistema
   Banner de topo + popup. Desliga sozinho quando a aula começa. */
(function () {
    var path = location.pathname.replace(/\/+$/, '').toLowerCase();
    if (path.indexOf('sistema') !== -1 || path.indexOf('obrigada') !== -1) return;

    var EVENTO = new Date('2026-07-21T20:00:00-03:00');
    var SOBE_PRECO = new Date('2026-07-11T23:59:59-03:00');
    var agora = new Date();
    if (agora >= EVENTO) return;

    var precoVale = agora < SOBE_PRECO;
    var alvo = precoVale ? SOBE_PRECO : EVENTO;

    var TERRA = '#C17A5A', TERRA_D = '#B06E4A', INK = '#14373C', CREAM = '#F3EEE3';

    var css = document.createElement('style');
    css.textContent =
        /* header alinhado: o CTA novo é mais largo que o antigo — sem quebra de linha nos itens do menu, e nav compacto na faixa em que fica apertado */
        '.main-nav a{white-space:nowrap;}' +
        '@media(min-width:821px) and (max-width:1220px){.main-nav{gap:9px;}.main-nav a{font-size:.8rem;}.main-nav a.nav-cta{padding:9px 13px;font-size:.72rem !important;}}' +
        '#psBar{background:' + INK + ';color:#fff;font-family:"Hanken Grotesk","Outfit",sans-serif;padding:9px 14px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;text-align:center;position:relative;z-index:60;font-size:.85rem;line-height:1.35;}' +
        '#psBar b{color:#F0C9B4;font-weight:800;}' +
        '#psBar .ps-count{font-variant-numeric:tabular-nums;font-weight:700;background:rgba(255,255,255,.12);padding:2px 9px;border-radius:100px;font-size:.78rem;white-space:nowrap;}' +
        '#psBar a{background:' + TERRA + ';color:#fff;font-weight:800;text-decoration:none;padding:6px 15px;border-radius:100px;font-size:.78rem;letter-spacing:.03em;text-transform:uppercase;white-space:nowrap;transition:background .2s;}' +
        '#psBar a:hover{background:' + TERRA_D + ';}' +
        '#psBar .ps-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.55);font-size:1.05rem;cursor:pointer;padding:4px 8px;line-height:1;}' +
        '@media(max-width:640px){#psBar{font-size:.78rem;padding:8px 34px 8px 10px;gap:7px;}#psBar .ps-hide-m{display:none;}}' +
        '#psOverlay{position:fixed;inset:0;background:rgba(20,55,60,.55);backdrop-filter:blur(3px);z-index:9998;opacity:0;transition:opacity .25s;}' +
        '#psOverlay.on{opacity:1;}' +
        '#psPop{position:fixed;left:50%;top:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;transition:transform .28s,opacity .28s;z-index:9999;width:min(440px,calc(100vw - 36px));background:' + CREAM + ';border:2px solid ' + INK + ';border-radius:18px;box-shadow:8px 8px 0 ' + INK + ';padding:30px 26px 26px;font-family:"Hanken Grotesk","Outfit",sans-serif;color:' + INK + ';text-align:center;}' +
        '#psPop.on{transform:translate(-50%,-50%) scale(1);opacity:1;}' +
        '#psPop .ps-kick{display:inline-flex;align-items:center;gap:7px;font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#fff;background:' + TERRA + ';padding:6px 14px;border-radius:100px;margin-bottom:16px;}' +
        '#psPop .ps-kick .dot{width:7px;height:7px;border-radius:50%;background:#fff;animation:psPulse 1.2s infinite;}' +
        '@keyframes psPulse{0%,100%{opacity:1}50%{opacity:.3}}' +
        '#psPop h3{font-size:1.32rem;line-height:1.22;font-weight:800;margin:0 0 10px;}' +
        '#psPop p{font-size:.9rem;line-height:1.5;color:rgba(20,55,60,.8);margin:0 0 16px;}' +
        '#psPop .ps-preco{font-size:.8rem;font-weight:700;margin-bottom:6px;}' +
        '#psPop .ps-preco b{color:' + TERRA_D + ';}' +
        '#psPop .ps-timer{font-variant-numeric:tabular-nums;font-weight:800;font-size:1.05rem;letter-spacing:.04em;margin-bottom:16px;}' +
        '#psPop .ps-cta{display:block;background:' + TERRA + ';color:#fff;font-weight:800;text-decoration:none;padding:15px 20px;border-radius:100px;font-size:.9rem;letter-spacing:.04em;text-transform:uppercase;transition:background .2s,transform .15s;}' +
        '#psPop .ps-cta:hover{background:' + TERRA_D + ';transform:translateY(-1px);}' +
        '#psPop .ps-nao{display:inline-block;margin-top:12px;background:none;border:none;font-size:.78rem;color:rgba(20,55,60,.55);cursor:pointer;text-decoration:underline;font-family:inherit;}' +
        '#psPop .ps-close{position:absolute;right:12px;top:10px;background:none;border:none;font-size:1.3rem;color:rgba(20,55,60,.5);cursor:pointer;line-height:1;padding:4px;}';
    document.head.appendChild(css);

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function restante(ate) {
        var ms = ate - new Date();
        if (ms < 0) ms = 0;
        var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
        return (d > 0 ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    }
    function ga(nome) { if (window.gtag) try { gtag('event', nome, { promo: 'sistema-2107' }); } catch (e) { } }

    /* ---- BANNER ---- */
    if (!sessionStorage.getItem('psBarOff')) {
        var bar = document.createElement('div');
        bar.id = 'psBar';
        bar.innerHTML =
            '<span><b>AULA AO VIVO · TER 21/07 · 20h</b><span class="ps-hide-m"> — o sistema de IA que cria e posta conteúdo por você</span></span>' +
            '<span class="ps-count" id="psBarCount"></span>' +
            '<a href="/sistema" id="psBarCta">' + (precoVale ? 'Garantir por R$149' : 'Garantir vaga') + ' →</a>' +
            '<button class="ps-x" id="psBarX" aria-label="Fechar aviso">✕</button>';
        document.body.insertBefore(bar, document.body.firstChild);
        var barCount = document.getElementById('psBarCount');
        function tickBar() { barCount.textContent = (precoVale ? 'R$149 acaba em ' : 'faltam ') + restante(alvo); }
        tickBar(); setInterval(tickBar, 1000);
        document.getElementById('psBarX').onclick = function () { sessionStorage.setItem('psBarOff', '1'); bar.remove(); };
        document.getElementById('psBarCta').onclick = function () { ga('promo_banner_click'); };
    }

    /* ---- POPUP (1x por 24h) ---- */
    var ultimo = +(localStorage.getItem('psPopLast') || 0);
    if (Date.now() - ultimo < 864e5) return;

    var mostrado = false;
    function abrirPopup() {
        if (mostrado) return; mostrado = true;
        localStorage.setItem('psPopLast', '' + Date.now());
        var ov = document.createElement('div'); ov.id = 'psOverlay';
        var pop = document.createElement('div'); pop.id = 'psPop';
        pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true');
        pop.innerHTML =
            '<button class="ps-close" id="psClose" aria-label="Fechar">✕</button>' +
            '<span class="ps-kick"><span class="dot"></span>Aula ao vivo · Ter 21/07 · 20h</span>' +
            '<h3>Um sistema de IA que cria e posta o seu conteúdo. Eu mostro como montar o seu.</h3>' +
            '<p>É o sistema por trás dos meus Reels de +100 mil visualizações e dos +10 mil seguidores por mês. Em uma noite você vê o processo inteiro — sem precisar programar.</p>' +
            (precoVale
                ? '<div class="ps-preco">Ingresso <b>R$149 só até sábado (11/07)</b> — depois o preço sobe</div><div class="ps-timer" id="psPopCount"></div>'
                : '<div class="ps-preco">A aula é <b>terça, dia 21</b> — depois dela, acabou</div><div class="ps-timer" id="psPopCount"></div>') +
            '<a href="/sistema" class="ps-cta" id="psPopCta">Quero montar o meu →</a>' +
            '<button class="ps-nao" id="psNao">Agora não</button>';
        document.body.appendChild(ov); document.body.appendChild(pop);
        setTimeout(function () { ov.classList.add('on'); pop.classList.add('on'); }, 30);
        var popCount = document.getElementById('psPopCount');
        function tickPop() { if (popCount) popCount.textContent = restante(alvo); }
        tickPop(); var iv = setInterval(tickPop, 1000);
        function fechar() { clearInterval(iv); ov.classList.remove('on'); pop.classList.remove('on'); setTimeout(function () { ov.remove(); pop.remove(); }, 280); }
        document.getElementById('psClose').onclick = fechar;
        document.getElementById('psNao').onclick = fechar;
        ov.onclick = fechar;
        document.getElementById('psPopCta').onclick = function () { ga('promo_popup_click'); };
        document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', esc); } });
        ga('promo_popup_view');
    }

    setTimeout(abrirPopup, 14000);
    var scrollGatilho = function () {
        var st = window.scrollY || document.documentElement.scrollTop;
        var alt = document.documentElement.scrollHeight - window.innerHeight;
        if (alt > 0 && st / alt > 0.45) { abrirPopup(); window.removeEventListener('scroll', scrollGatilho); }
    };
    window.addEventListener('scroll', scrollGatilho, { passive: true });
    document.addEventListener('mouseout', function exit(e) {
        if (!e.relatedTarget && e.clientY <= 0) { abrirPopup(); document.removeEventListener('mouseout', exit); }
    });
})();
