/* Promo site-wide: os 2 cursos gravados (Monte seu Sistema + Claude com Profundidade 2.0)
   Banner de topo + popup 1x/24h. Evergreen — sem countdown, sem data. */
(function () {
    var path = location.pathname.replace(/\/+$/, '').toLowerCase();
    if (path.indexOf('sistema') !== -1 || path.indexOf('obrigada') !== -1 ||
        path.indexOf('curso') !== -1 || path.indexOf('comece') !== -1 ||
        path.indexOf('links') !== -1 || path.indexOf('profundidade') !== -1) return;

    var TERRA = '#C17A5A', TERRA_D = '#B06E4A', INK = '#14373C', CREAM = '#F3EEE3';

    var css = document.createElement('style');
    css.textContent =
        '.main-nav a{white-space:nowrap;}' +
        '@media(min-width:821px) and (max-width:1220px){.main-nav{gap:9px;}.main-nav a{font-size:.8rem;}.main-nav a.nav-cta{padding:9px 13px;font-size:.72rem !important;}}' +
        '#psBar{background:' + INK + ';color:#fff;font-family:"Hanken Grotesk","Outfit",sans-serif;padding:9px 14px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;text-align:center;position:relative;z-index:60;font-size:.85rem;line-height:1.35;}' +
        '#psBar b{color:#F0C9B4;font-weight:800;}' +
        '#psBar a{background:' + TERRA + ';color:#fff;font-weight:800;text-decoration:none;padding:6px 15px;border-radius:100px;font-size:.78rem;letter-spacing:.03em;text-transform:uppercase;white-space:nowrap;transition:background .2s;}' +
        '#psBar a:hover{background:' + TERRA_D + ';}' +
        '#psBar a.ps-alt{background:transparent;border:1.5px solid rgba(255,255,255,.45);}' +
        '#psBar a.ps-alt:hover{background:rgba(255,255,255,.12);}' +
        '#psBar .ps-x{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.55);font-size:1.05rem;cursor:pointer;padding:4px 8px;line-height:1;}' +
        '@media(max-width:640px){#psBar{font-size:.78rem;padding:8px 34px 8px 10px;gap:7px;}#psBar .ps-hide-m{display:none;}}' +
        '#psOverlay{position:fixed;inset:0;background:rgba(20,55,60,.55);backdrop-filter:blur(3px);z-index:9998;opacity:0;transition:opacity .25s;}' +
        '#psOverlay.on{opacity:1;}' +
        '#psPop{position:fixed;left:50%;top:50%;transform:translate(-50%,-46%) scale(.97);opacity:0;transition:transform .28s,opacity .28s;z-index:9999;width:min(460px,calc(100vw - 36px));background:' + CREAM + ';border:2px solid ' + INK + ';border-radius:18px;box-shadow:8px 8px 0 ' + INK + ';padding:30px 26px 26px;font-family:"Hanken Grotesk","Outfit",sans-serif;color:' + INK + ';text-align:center;}' +
        '#psPop.on{transform:translate(-50%,-50%) scale(1);opacity:1;}' +
        '#psPop .ps-kick{display:inline-flex;align-items:center;gap:7px;font-size:.72rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#fff;background:' + TERRA + ';padding:6px 14px;border-radius:100px;margin-bottom:16px;}' +
        '#psPop h3{font-size:1.32rem;line-height:1.22;font-weight:800;margin:0 0 10px;}' +
        '#psPop p{font-size:.9rem;line-height:1.5;color:rgba(20,55,60,.8);margin:0 0 16px;}' +
        '#psPop .ps-cta{display:block;background:' + TERRA + ';color:#fff;font-weight:800;text-decoration:none;padding:14px 18px;border-radius:100px;font-size:.88rem;letter-spacing:.03em;text-transform:uppercase;transition:background .2s,transform .15s;margin-bottom:10px;}' +
        '#psPop .ps-cta:hover{background:' + TERRA_D + ';transform:translateY(-1px);}' +
        '#psPop .ps-cta small{display:block;font-weight:600;font-size:.7rem;text-transform:none;letter-spacing:0;opacity:.9;margin-top:2px;}' +
        '#psPop .ps-cta.ps-dark{background:' + INK + ';}' +
        '#psPop .ps-cta.ps-dark:hover{background:#0F2A2E;}' +
        '#psPop .ps-nao{display:inline-block;margin-top:8px;background:none;border:none;font-size:.78rem;color:rgba(20,55,60,.55);cursor:pointer;text-decoration:underline;font-family:inherit;}' +
        '#psPop .ps-close{position:absolute;right:12px;top:10px;background:none;border:none;font-size:1.3rem;color:rgba(20,55,60,.5);cursor:pointer;line-height:1;padding:4px;}';
    document.head.appendChild(css);

    function ga(nome, extra) { if (window.gtag) try { gtag('event', nome, Object.assign({ promo: 'cursos-gravados' }, extra || {})); } catch (e) { } }

    /* ---- BANNER ---- */
    if (!sessionStorage.getItem('psBarOff')) {
        var bar = document.createElement('div');
        bar.id = 'psBar';
        bar.innerHTML =
            '<span><b>CURSOS GRAVADOS NO AR</b><span class="ps-hide-m"> — acesso imediato, no seu ritmo</span></span>' +
            '<a href="/curso" data-ga="claude-2.0">Claude 2.0 · 12x R$35,89</a>' +
            '<a href="/sistema" class="ps-alt" data-ga="sistema">Monte seu Sistema · R$169</a>' +
            '<button class="ps-x" id="psBarX" aria-label="Fechar aviso">✕</button>';
        document.body.insertBefore(bar, document.body.firstChild);
        document.getElementById('psBarX').onclick = function () { sessionStorage.setItem('psBarOff', '1'); bar.remove(); };
        bar.querySelectorAll('a[data-ga]').forEach(function (a) {
            a.onclick = function () { ga('promo_banner_click', { curso: a.getAttribute('data-ga') }); };
        });
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
            '<span class="ps-kick">Gravados · acesso imediato</span>' +
            '<h3>Dois cursos para você parar de usar 10% da IA</h3>' +
            '<p>Os dois gravados, atualizados em julho de 2026, para assistir no seu ritmo. Escolhe o seu (ou leva os dois):</p>' +
            '<a href="/curso" class="ps-cta" data-ga="claude-2.0">Claude com Profundidade 2.0 →<small>8 módulos, do zero ao agente · 12x de R$35,89</small></a>' +
            '<a href="/sistema" class="ps-cta ps-dark" data-ga="sistema">Curso Monte seu Sistema →<small>Seu conteúdo em loop, você só grava · R$169</small></a>' +
            '<button class="ps-nao" id="psNao">Agora não</button>';
        document.body.appendChild(ov); document.body.appendChild(pop);
        setTimeout(function () { ov.classList.add('on'); pop.classList.add('on'); }, 30);
        function fechar() { ov.classList.remove('on'); pop.classList.remove('on'); setTimeout(function () { ov.remove(); pop.remove(); }, 280); }
        document.getElementById('psClose').onclick = fechar;
        document.getElementById('psNao').onclick = fechar;
        ov.onclick = fechar;
        pop.querySelectorAll('a[data-ga]').forEach(function (a) {
            a.onclick = function () { ga('promo_popup_click', { curso: a.getAttribute('data-ga') }); };
        });
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
