/* CAMADA LEVE — par do /leve.css
   1. Troca, nas folhas de estilo da página, toda sombra dura
      ("6px 6px 0 cor") por sombra difusa, inclusive as de :hover.
   2. Marca com .lv-dark os botões que estão em fundo escuro, pra
      o leve.css pintar o botão de creme em vez de petróleo. */
(function () {
    var SOFT = '0 1px 2px rgba(20,55,60,.05), 0 14px 34px -16px rgba(20,55,60,.22)';
    var HARD = /(^|,)\s*-?\d+(\.\d+)?px\s+-?\d+(\.\d+)?px\s+0(px)?\s+[^,]+/;

    function isHard(v) {
        if (!v || v.indexOf('inset') > -1) return false;
        var m = v.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+0(?:px)?(?:\s|$)/);
        return !!(m && (Math.abs(+m[1]) >= 3 || Math.abs(+m[2]) >= 3) && HARD.test(v));
    }

    function suavizar(rules) {
        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            if (r.cssRules && !r.style) { suavizar(r.cssRules); continue; }   // @media
            if (!r.style) continue;
            if (isHard(r.style.boxShadow)) {
                r.style.setProperty('box-shadow', SOFT, r.style.getPropertyPriority('box-shadow'));
                var bw = parseFloat(r.style.borderWidth || r.style.borderTopWidth);
                if (bw >= 1.5 && !/btn|button|input|field|header/i.test(r.selectorText || '')) {
                    r.style.setProperty('border-width', '1px');
                    r.style.setProperty('border-color', 'rgba(20,55,60,.09)');
                }
            }
        }
    }

    function lum(c) {
        var m = c && c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        var p = m[1].split(',').map(parseFloat);
        if (p.length > 3 && p[3] < 0.35) return null;
        return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
    }
    function fundoEscuro(el) {
        for (var x = el.parentElement; x && x !== document.documentElement; x = x.parentElement) {
            var cs = getComputedStyle(x);
            var l = lum(cs.backgroundColor);
            if (l === null && cs.backgroundImage.indexOf('gradient') > -1) l = lum(cs.backgroundImage);
            if (l !== null) return l < 110;
        }
        return false;
    }
    function marcarBotoes() {
        var bs = document.querySelectorAll('.btn, .btn-form, .ps-cta, .btn-copy');
        for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('lv-dark', fundoEscuro(bs[i]));
    }

    function rodar() {
        for (var s = 0; s < document.styleSheets.length; s++) {
            try { suavizar(document.styleSheets[s].cssRules); } catch (e) { /* folha externa (fontes) */ }
        }
        marcarBotoes();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rodar); else rodar();
    window.addEventListener('load', function () { rodar(); setTimeout(rodar, 900); });   // promo e cards montados por JS
})();
