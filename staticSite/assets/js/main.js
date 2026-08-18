(function(){
  "use strict";

  /* ---------------------------------------------------------- language switch */
  var body = document.body;
  var savedLang = localStorage.getItem('enerqa-lang');
  if (savedLang === 'en' || savedLang === 'ar') body.setAttribute('data-lang', savedLang);

  document.querySelectorAll('[data-set-lang]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var lang = btn.getAttribute('data-set-lang');
      body.setAttribute('data-lang', lang);
      localStorage.setItem('enerqa-lang', lang);
    });
  });

  /* ---------------------------------------------------------- header scroll state */
  var header = document.querySelector('header.site');
  var footer = document.querySelector('footer.site');
  if (header){
    var onScroll = function(){
      var scrollY = window.scrollY;
      
      // Toggle solid background style
      if (scrollY > 12) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      
      // Hide header when reaching the footer
      if (footer) {
        var footerTop = footer.getBoundingClientRect().top;
        // If the top of the footer has entered the viewport (adjusted slightly for UX spacing)
        if (footerTop < window.innerHeight + 10) {
          header.classList.add('hidden-footer');
        } else {
          header.classList.remove('hidden-footer');
        }
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
  }

  /* ---------------------------------------------------------- hero parallax & text fade zoom (EcoFusion style) */
  var parallaxBg = document.getElementById('hi-parallax');
  var heroCenter = document.querySelector('.hi-center');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 760px)').matches;

  if (!prefersReducedMotion && !isMobile) {
    var ticking = false;
    var heroSection = document.querySelector('.hero-immersive');

    window.addEventListener('scroll', function(){
      if (!ticking) {
        window.requestAnimationFrame(function(){
          var scrollY = window.scrollY;
          var heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

          if (scrollY < heroHeight * 1.5) {
            var progress = Math.min(scrollY / heroHeight, 1);

            // 1. Zoom in the background image smoothly on scroll
            if (parallaxBg) {
              var bgScale = 1 + (progress * 0.15); // Zooms in from 1.0 to 1.15
              var bgTranslate = scrollY * 0.35; // Parallax drift
              parallaxBg.style.transform = 'translate3d(0, ' + bgTranslate + 'px, 0) scale(' + bgScale + ')';
            }

            // 2. Fade out and slightly shrink the text container exactly like EcoFusion
            if (heroCenter) {
              var textOpacity = Math.max(1 - (progress * 1.5), 0); // Fades out completely by 66% scroll
              var textScale = 1 - (progress * 0.08); // Shrinks slightly
              heroCenter.style.opacity = textOpacity;
              heroCenter.style.transform = 'translate(-50%, -54%) scale(' + textScale + ')';
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive:true });
  }

  /* ---------------------------------------------------------- mobile nav */
  var mnToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  var mnClose = document.querySelector('.mn-close');
  function openMN(){ mobileNav && mobileNav.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  function closeMN(){ mobileNav && mobileNav.classList.remove('open'); document.documentElement.style.overflow = ''; }
  if (mnToggle) mnToggle.addEventListener('click', openMN);
  if (mnClose) mnClose.addEventListener('click', closeMN);
  if (mobileNav){
    mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMN); });
  }

  /* ---------------------------------------------------------- search overlay */
  var searchOverlay = document.querySelector('.search-overlay');
  var openSearchBtn = document.querySelector('[data-open-search]');
  var closeSearchBtn = document.querySelector('.close-search');
  var searchInput = searchOverlay ? searchOverlay.querySelector('input') : null;
  var searchResults = searchOverlay ? searchOverlay.querySelector('.search-results') : null;

  // lightweight in-page index of navigable destinations
  var SITE_INDEX = [
    { title:'Home', url:'index.html' },
    { title:'About', url:'about.html' },
    { title:'Domains & Services', url:'services.html' },
    { title:'Climate Finance', url:'services.html#climate-finance' },
    { title:'Climate Action', url:'services.html#climate-action' },
    { title:'Transparency & Reporting', url:'services.html#transparency' },
    { title:'ESG Reporting', url:'services.html#esg' },
    { title:'Environmental Assessments', url:'services.html#assessments' },
    { title:'Energy Management', url:'services.html#energy-mgmt' },
    { title:'Renewable Energy Projects', url:'services.html#renewables' },
    { title:'Green Credit Lines', url:'services.html#credit-lines' },
    { title:'Supporting Studies & M&E', url:'services.html#studies' },
    { title:'Projects', url:'projects.html' },
    { title:'Knowledge Hub', url:'knowledge-hub.html' },
    { title:'Tools Overview', url:'knowledge-hub.html#tools' },
    { title:'Insights', url:'insights.html' },
    { title:'Team', url:'team.html' },
    { title:'Contact', url:'contact.html' },
    { title:'Careers', url:'contact.html#careers' }
  ];

  function renderResults(query){
    if (!searchResults) return;
    searchResults.innerHTML = '';
    var q = query.trim().toLowerCase();
    var matches = q ? SITE_INDEX.filter(function(i){ return i.title.toLowerCase().indexOf(q) !== -1; }) : SITE_INDEX;
    if (!matches.length){
      var empty = document.createElement('div');
      empty.className = 'sr-empty';
      empty.textContent = 'No matches — try a different term.';
      searchResults.appendChild(empty);
      return;
    }
    matches.slice(0, 10).forEach(function(m){
      var a = document.createElement('a');
      a.href = m.url;
      a.textContent = m.title;
      searchResults.appendChild(a);
    });
  }

  function openSearch(){
    if (!searchOverlay) return;
    searchOverlay.classList.add('open');
    renderResults('');
    setTimeout(function(){ searchInput && searchInput.focus(); }, 150);
  }
  function closeSearch(){ searchOverlay && searchOverlay.classList.remove('open'); }

  if (openSearchBtn) openSearchBtn.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
  if (searchOverlay){
    searchOverlay.addEventListener('click', function(e){
      if (e.target === searchOverlay) closeSearch();
    });
  }
  if (searchInput){
    searchInput.addEventListener('input', function(){ renderResults(searchInput.value); });
  }
  document.addEventListener('keydown', function(e){
    var isMeta = e.metaKey || e.ctrlKey;
    if (isMeta && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      searchOverlay && searchOverlay.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape'){ closeSearch(); closeMN(); }
  });

  /* ---------------------------------------------------------- scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:.16, rootMargin:'0px 0px -8% 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------------------------------------------------------- knowledge hub filters */
  window.enerqaFilterPubs = function(){
    var searchBox = document.getElementById('kh-search');
    var checked = Array.prototype.slice.call(document.querySelectorAll('.kh-domain:checked')).map(function(c){ return c.value; });
    var q = searchBox ? searchBox.value.trim().toLowerCase() : '';
    var rows = document.querySelectorAll('.pub-row');
    rows.forEach(function(row){
      var domain = row.getAttribute('data-domain') || '';
      var haystack = (row.getAttribute('data-search') || row.textContent || '').toLowerCase();
      var domainOK = !checked.length || checked.indexOf(domain) !== -1;
      var textOK = !q || haystack.indexOf(q) !== -1;
      row.classList.toggle('is-hidden', !(domainOK && textOK));
    });
  };

})();
