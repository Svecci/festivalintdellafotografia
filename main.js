// Fade-in effect for cards and banner
document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.card').forEach(function(card, i) {
        setTimeout(() => card.classList.add('fade-in'), 150 * i);
    });
    document.querySelector('.banner-fade').classList.add('fade-in');
    document.querySelector('.hero-title').classList.add('hero-title');
});

// Hero title scroll effect
window.addEventListener('scroll', function() {
    const heroTitle = document.getElementById('heroTitle');
    if (!heroTitle) return;
    if (window.scrollY > 60) {
        heroTitle.classList.add('hero-title--scrolled');
    } else {
        heroTitle.classList.remove('hero-title--scrolled');
    }
});

document.addEventListener("DOMContentLoaded", function() {
    var btn = document.querySelector('.btn-art-impact');
    if (btn) {
        btn.addEventListener('mouseover', function() {
            btn.style.transform = 'scale(1.08) rotate(-2deg)';
            btn.style.boxShadow = '0 0 24px #ff7e5f, 0 2px 12px #feb47b';
        });
        btn.addEventListener('mouseout', function() {
            btn.style.transform = '';
            btn.style.boxShadow = '0 4px 16px rgba(255,126,95,0.25), 0 1.5px 8px #feb47b';
        });
    }
});

// BARRA DI RICERCA - Versione estesa per tutto il sito (no hide, dropdown results)
(function() {
    // Se non esiste il form (pagina diversa da index), lo inietto nella navbar
    if (!document.getElementById('siteSearchForm')) {
        const navCollapse = document.querySelector('.navbar .navbar-collapse');
        if (navCollapse) {
            const form = document.createElement('form');
            form.className = 'd-flex ms-auto my-2 my-lg-0';
            form.id = 'siteSearchForm';
            form.setAttribute('role', 'search');
            form.innerHTML = `
                <input class="form-control form-control-sm me-2" type="search" placeholder="Cerca..." aria-label="Cerca" id="siteSearchInput">
                <button class="btn btn-outline-light btn-sm" type="submit">
                    <i class="bi bi-search"></i>
                </button>`;
            navCollapse.appendChild(form);
        }
    }

    const form = document.getElementById('siteSearchForm');
    const input = document.getElementById('siteSearchInput');
    if (!form || !input) return;

    // Rendi il form relativo per posizionare la tendina
    form.classList.add('position-relative');

    // Crea container dropdown risultati se non esiste
    let dropdown = document.getElementById('searchDropdownResults');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchDropdownResults';
        dropdown.className = 'search-dropdown shadow border rounded bg-white position-absolute w-100 d-none';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.zIndex = '1050';
        dropdown.style.maxHeight = '320px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.fontSize = '.85rem';
        form.appendChild(dropdown);
    }

    // Se la pagina non ha elementi marcati, li preparo automaticamente
    if (!document.querySelector('.search-block')) {
        const autoTargets = Array.from(document.querySelectorAll(
            'main .card, main section, main .container, main .row, .timeline, table'
        ));
        autoTargets.forEach(el => {
            // Evita wrapping di elementi vuoti / troppo piccoli
            const txt = (el.textContent || '').trim();
            if (txt.length < 25) return;
            el.classList.add('search-block');
            el.setAttribute('data-search', txt.toLowerCase().replace(/\s+/g, ' ').slice(0, 2000));
        });
    }

    const blocks = () => Array.from(document.querySelectorAll('.search-block'));

    function normalize(str) { return (str || '').toLowerCase(); }

    function clearHighlights(root) {
        root.querySelectorAll('mark.__hit').forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
    }

    function highlight(container, term) {
        if (!term) return;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode: n => {
                const p = n.parentElement;
                if (!p) return NodeFilter.FILTER_REJECT;
                if (/^(script|style)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
                if (p.closest('mark.__hit')) return NodeFilter.FILTER_REJECT;
                return n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safe})`, 'ig');
        nodes.forEach(node => {
            if (!regex.test(node.textContent)) return;
            const span = document.createElement('span');
            span.innerHTML = node.textContent.replace(regex, '<mark class="__hit">$1</mark>');
            node.replaceWith(span);
        });
    }

    // INDICE PAGINE (cross-site)
    const PAGE_INDEX = [
        { title: 'Home', url: 'index.html', keywords: 'home festival fotografia benvenuti principale' },
        { title: 'Programma', url: 'programma.html', keywords: 'programma eventi calendario workshops talk' },
        { title: 'Mostre', url: 'mostre.html', keywords: 'mostre esposizioni galleria artisti' },
        { title: 'Contatti', url: 'contattaci.html', keywords: 'contatti email telefono info' },
        { title: 'Storia 2024', url: 'storia-2024.html', keywords: 'storia 2024 edizione passata retrospettiva' },
        { title: 'Storia 2025', url: 'storia-2025.html', keywords: 'storia 2025 edizione futura anticipazioni' }
    ];

    // Rimuove eventuali nascondimenti pre-esistenti (assicurati che il contenuto resti visibile)
    blocks().forEach(b => b.classList.remove('d-none'));

    function snippet(text, term, len = 110) {
        const idx = normalize(text).indexOf(term);
        if (idx === -1) return text.slice(0, len) + (text.length > len ? '…' : '');
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + term.length + 40);
        let s = text.slice(start, end);
        if (start > 0) s = '…' + s;
        if (end < text.length) s += '…';
        return s;
    }

    function buildDropdown(term) {
        if (!term) {
            dropdown.classList.add('d-none');
            dropdown.innerHTML = '';
            return;
        }

        // Pagine
        const pageMatches = PAGE_INDEX.filter(p =>
            normalize(p.title + ' ' + p.keywords).includes(term)
        );

        // Blocchi attuali
        const contentMatches = [];
        blocks().forEach(b => {
            const text = b.textContent.trim().replace(/\s+/g, ' ');
            if (normalize(text).includes(term)) {
                contentMatches.push({ el: b, text });
            }
        });

        if (pageMatches.length === 0 && contentMatches.length === 0) {
            dropdown.innerHTML = `
                <div class="p-2 text-muted small">Nessun risultato per "<strong>${term}</strong>"</div>
            `;
            dropdown.classList.remove('d-none');
            return;
        }

        dropdown.innerHTML = '';

        if (pageMatches.length) {
            const pagesSection = document.createElement('div');
            pagesSection.className = 'p-2 border-bottom';
            pagesSection.innerHTML = `<div class="fw-semibold small mb-1 text-secondary">Pagine</div>`;
            pageMatches.forEach(m => {
                const a = document.createElement('a');
                a.href = m.url;
                a.className = 'd-block text-decoration-none py-1 px-2 rounded small search-result-link';
                a.innerHTML = `<i class="bi bi-file-earmark-text me-1"></i>${m.title}`;
                pagesSection.appendChild(a);
            });
            dropdown.appendChild(pagesSection);
        }

        if (contentMatches.length) {
            const contentSection = document.createElement('div');
            contentSection.className = 'p-2';
            contentSection.innerHTML = `<div class="fw-semibold small mb-1 text-secondary">Contenuto pagina</div>`;
            contentMatches.slice(0, 8).forEach(m => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'w-100 text-start border-0 bg-transparent py-1 px-2 rounded small search-result-link';
                const rawSnippet = snippet(m.text, term);
                const highlighted = rawSnippet.replace(
                    new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'ig'),
                    t => `<mark class="px-0 py-0">${t}</mark>`
                );
                btn.innerHTML = `<i class="bi bi-text-paragraph me-1"></i>${highlighted}`;
                btn.addEventListener('click', () => {
                    dropdown.classList.add('d-none');
                    // Metti focus visivo al blocco
                    m.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    m.el.classList.add('search-focus-pulse');
                    setTimeout(() => m.el.classList.remove('search-focus-pulse'), 2000);
                });
                contentSection.appendChild(btn);
            });
            dropdown.appendChild(contentSection);
        }

        dropdown.classList.remove('d-none');
    }

    function clearAllHighlights() {
        blocks().forEach(el => clearHighlights(el));
    }

    function applyInlineHighlights(term) {
        clearAllHighlights();
        if (!term) return;
        blocks().forEach(el => highlight(el, term));
    }

    function handleSearchInput() {
        const term = normalize(input.value).trim();
        applyInlineHighlights(term);
        buildDropdown(term);
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        handleSearchInput();
    });
    input.addEventListener('input', handleSearchInput);

    // Chiusura dropdown click fuori
    document.addEventListener('click', e => {
        if (!form.contains(e.target)) {
            dropdown.classList.add('d-none');
        }
    });

    // Tastiera
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            input.value = '';
            handleSearchInput();
            input.blur();
        }
    });

    // Stili minimi per risultati (inject se non presenti)
    if (!document.getElementById('search-style-inline')) {
        const style = document.createElement('style');
        style.id = 'search-style-inline';
        style.textContent = `
            .search-dropdown .search-result-link:hover,
            .search-dropdown .search-result-link:focus {
                background: #0d6efd;
                color: #fff;
                outline: none;
            }
            .search-focus-pulse {
                animation: searchPulse 1.2s ease-in-out 2;
                position: relative;
                z-index: 0;
            }
            @keyframes searchPulse {
                0% { box-shadow: 0 0 0 0 rgba(13,110,253,.6); }
                70% { box-shadow: 0 0 0 10px rgba(13,110,253,0); }
                100% { box-shadow: 0 0 0 0 rgba(13,110,253,0); }
            }
            mark { background: #ffe69c; padding:0 2px; }
        `;
        document.head.appendChild(style);
    }
})();
