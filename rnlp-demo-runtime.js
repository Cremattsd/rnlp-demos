(function () {
  'use strict';

  var API_BASE = 'https://api.initial3development.com';
  var SERIAL = 'RNLP-MDLG-001';
  var PER_PAGE = 9;
  var DEBUG = new URLSearchParams(location.search).get('debug') === '1';

  var state = {
    all: [],
    filtered: [],
    page: 1,
    filter: 'all',
    settings: readSettings()
  };

  function log(label, value) {
    if (DEBUG) console.log('[RNLP demo] ' + label, value);
  }

  function warn(label, value) {
    console.warn('[RNLP demo] ' + label, value);
  }

  function readSettings() {
    var params = new URLSearchParams(location.search);
    var layoutMap = {
      grid_map: 'grid_map',
      'grid-map': 'grid_map',
      grid: 'full_grid',
      full_grid: 'full_grid',
      'full-grid': 'full_grid',
      compact: 'full_grid',
      wide: 'full_grid',
      hero_grid: 'hero_grid',
      'hero-grid': 'hero_grid',
      list_view: 'list_view',
      list: 'list_view'
    };
    var fontMap = {
      system: 'system',
      inter: 'inter',
      serif: 'serif',
      modern: 'modern',
      classic: 'serif',
      bold: 'inter'
    };
    var detailMap = {
      popup: 'popup',
      full_page: 'full_page',
      page: 'full_page'
    };

    var rawLayout = params.get('layout') || 'full_grid';
    var rawMode = params.get('mode') || params.get('bg') || 'light';
    var rawDetail = params.get('detailBehavior') || params.get('detail') || 'popup';
    var brandColor = sanitizeHex(params.get('brandColor') || params.get('color') || '#013161');

    return {
      layout: layoutMap[rawLayout] || 'full_grid',
      brandColor: brandColor,
      mode: rawMode === 'dark' ? 'dark' : 'light',
      font: fontMap[params.get('font') || 'system'] || 'system',
      detailBehavior: detailMap[rawDetail] || 'popup'
    };
  }

  function sanitizeHex(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : '#013161';
  }

  function hexToRgb(hex) {
    var clean = sanitizeHex(hex).slice(1);
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function darken(hex, amount) {
    var rgb = hexToRgb(hex);
    var scale = Math.max(0, Math.min(1, 1 - amount));
    return '#' + [rgb.r, rgb.g, rgb.b].map(function (n) {
      return Math.round(n * scale).toString(16).padStart(2, '0');
    }).join('');
  }

  function applyTheme() {
    var s = state.settings;
    var root = document.documentElement;
    var fonts = {
      system: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      inter: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      serif: "Georgia,'Times New Roman',serif",
      modern: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    };
    var dark = s.mode === 'dark';

    root.style.setProperty('--rnx-primary', s.brandColor);
    root.style.setProperty('--rnx-primary-dark', darken(s.brandColor, 0.22));
    root.style.setProperty('--rnx-accent', s.brandColor);
    root.style.setProperty('--rnx-bg', dark ? '#0d1117' : '#f8fafc');
    root.style.setProperty('--rnx-card-bg', dark ? '#161b22' : '#ffffff');
    root.style.setProperty('--rnx-text', dark ? '#e6edf3' : '#1e293b');
    root.style.setProperty('--rnx-muted', dark ? '#94a3b8' : '#64748b');
    root.style.setProperty('--rnx-border', dark ? 'rgba(255,255,255,.10)' : '#e2e8f0');
    root.style.setProperty('--rnx-radius', '12px');
    root.style.setProperty('--rnx-shadow', dark ? '0 14px 36px rgba(0,0,0,.34)' : '0 10px 30px rgba(15,23,42,.10)');
    root.style.setProperty('--rnx-font', fonts[s.font] || fonts.system);

    root.style.setProperty('--rnlp-accent', s.brandColor);
    document.body.classList.toggle('rnlp-dark', dark);
    document.body.classList.toggle('rnx-mode-dark', dark);
    document.body.style.fontFamily = 'var(--rnx-font)';
  }

  function injectStyles() {
    if (document.getElementById('rnlp-demo-runtime-css')) return;
    var style = document.createElement('style');
    style.id = 'rnlp-demo-runtime-css';
    style.textContent = [
      '.listing-grid{font-family:var(--rnx-font)}',
      '.card{background:var(--rnx-card-bg)!important;color:var(--rnx-text)!important;border-color:var(--rnx-border)!important}',
      '.card:hover{box-shadow:var(--rnx-shadow)!important}',
      '.card-name,.card-stat-val{color:var(--rnx-text)!important}',
      '.card-addr,.card-stat-lbl{color:var(--rnx-muted)!important}',
      '.card-pill{background:color-mix(in srgb,var(--rnx-primary) 12%,transparent)!important;color:var(--rnx-primary)!important}',
      '.card-img{aspect-ratio:16/10;height:auto!important;min-height:0!important;background:linear-gradient(135deg,var(--rnx-primary-dark),var(--rnx-primary));overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}',
      '.card-img img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;transition:transform .2s}',
      '.card:hover .card-img img{transform:scale(1.03)}',
      '.rnx-media-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;color:#fff;background:linear-gradient(135deg,var(--rnx-primary-dark),var(--rnx-primary))}',
      '.rnx-media-fallback strong{display:block;font-size:.88rem;line-height:1.25}',
      '.rnx-empty,.rnx-error{grid-column:1/-1;padding:48px 20px;text-align:center;color:var(--rnx-muted);background:var(--rnx-card-bg);border:1px solid var(--rnx-border);border-radius:var(--rnx-radius)}',
      '.rnx-error{color:#ef4444}',
      '#inquireModal.open{z-index:320!important}',
      '#detailModal.open{z-index:260!important}',
      '.rnx-layout-list{display:flex!important;flex-direction:column;gap:10px}',
      '.rnx-layout-list .card{display:grid!important;grid-template-columns:220px 1fr;min-height:140px}',
      '.rnx-layout-list .card-img{height:100%!important;aspect-ratio:auto}',
      '.rnx-layout-list .card-body{padding:16px 18px!important}',
      '.rnx-layout-hero .rnx-hero-card{grid-column:1/-1;display:grid!important;grid-template-columns:minmax(280px,45%) 1fr;min-height:300px}',
      '.rnx-layout-hero .rnx-hero-card .card-img{height:100%!important;aspect-ratio:auto}',
      '.rnx-cta{margin-top:14px;color:var(--rnx-primary);font-weight:700;font-size:.82rem}',
      '.rnx-map-placeholder{grid-column:1/-1;min-height:220px;border:1px dashed var(--rnx-border);border-radius:var(--rnx-radius);display:flex;align-items:center;justify-content:center;color:var(--rnx-muted);background:color-mix(in srgb,var(--rnx-card-bg) 85%,var(--rnx-primary) 15%)}',
      '@media(max-width:760px){.rnx-layout-list .card,.rnx-layout-hero .rnx-hero-card{grid-template-columns:1fr}.rnx-layout-list .card-img,.rnx-layout-hero .rnx-hero-card .card-img{aspect-ratio:16/10;height:auto!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function clean(value) {
    var str = String(value == null ? '' : value).trim();
    return /^(undefined|null|n\/a)$/i.test(str) ? '' : str;
  }

  function first() {
    for (var i = 0; i < arguments.length; i++) {
      var val = clean(arguments[i]);
      if (val) return val;
    }
    return '';
  }

  function fmt(n) {
    var value = Number(n);
    return Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '';
  }

  function photoUrl(att, height) {
    if (!att || !att.FileName) return '';
    return att.FileName + '?h=' + height + '&mode=max&autorotate=true';
  }

  function normalizeListing(raw) {
    raw = raw || {};
    var photos = (raw.Attachments || []).filter(function (att) {
      return (att.AttachmentType || att.attachment_type) === 'photo' && att.FileName;
    });
    var imgUrl = photos[0] && photos[0].FileName ? photos[0].FileName : '';
    var idFromImg = imgUrl.indexOf('/ListingAttachment/') > -1
      ? imgUrl.split('/ListingAttachment/')[1].split('/')[0]
      : '';
    var address = [raw.Street, raw.City, raw.State, raw.Zip].map(clean).filter(Boolean).join(', ');
    var locationFallback = [raw.City, raw.State].map(clean).filter(Boolean).join(', ');
    var title = first(raw.PropertyName, raw.Name, raw.Title, raw.Street, locationFallback, 'Property details available on request.');
    var listingType = clean(raw.ListingType);
    var status = first(raw.Status, listingType);
    var user = (raw.UserList && raw.UserList[0]) || raw.User || {};
    var price = raw.PriceDisclosed && raw.ListPrice ? '$' + fmt(raw.ListPrice) : '';
    var rate = raw.PriceDisclosed && raw.ListPrice && /lease/i.test(listingType)
      ? '$' + fmt(raw.ListPrice) + (raw.PriceUnits ? ' /SF ' + clean(raw.PriceUnits).toUpperCase() : ' /SF')
      : '';

    return {
      id: first(raw.Id, raw.PropertyId, idFromImg),
      title: title,
      address: address || locationFallback || 'Property details available on request.',
      city: clean(raw.City),
      state: clean(raw.State),
      zip: clean(raw.Zip),
      status: status,
      listing_type: listingType,
      property_type: (raw.PropertyTypes || []).map(clean).filter(Boolean).slice(0, 2).join(', '),
      price: price,
      rate: rate,
      size_sf: raw.BuildingSf ? fmt(raw.BuildingSf) + ' SF' : '',
      acreage: raw.LandSize ? clean(raw.LandSize) + ' ' + first(raw.LandSizeType, 'AC') : '',
      description: first(raw.PropertyDescription, 'Contact the listing broker for full property details.'),
      hero_image: photos[0] ? photoUrl(photos[0], 700) : '',
      images: photos.map(function (att) { return photoUrl(att, 900); }),
      brochure_url: first(raw.BrochureUrl, raw.BrochureURL, raw.OMUrl),
      detail_url: 'property-detail.html?serial=' + encodeURIComponent(SERIAL) + '&id=' + encodeURIComponent(first(raw.Id, idFromImg)),
      broker_name: [user.FirstName, user.LastName].map(clean).filter(Boolean).join(' '),
      broker_email: clean(user.Email),
      broker_phone: clean(user.Phone),
      raw: raw
    };
  }

  function extractListings(data) {
    if (Array.isArray(data) && Array.isArray(data[0])) return data[0];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data && data.listings)) return data.listings;
    if (Array.isArray(data && data.data)) return data.data;
    return [];
  }

  function badge(listing) {
    var lt = listing.listing_type.toUpperCase();
    var sold = /SOLD|LEASED/.test(String(listing.status).toUpperCase()) || /SOLD|LEASED/.test(lt);
    if (lt === 'FOR LEASE') return 'For Lease';
    if (lt === 'FOR SALE') return 'For Sale';
    if (sold) return /LEASED/.test(lt) ? 'Leased' : 'Sold';
    return listing.status || 'Available';
  }

  function media(listing, hero) {
    var alt = esc(listing.title + (listing.address ? ' - ' + listing.address : ''));
    if (!listing.hero_image) {
      return '<div class="rnx-media-fallback"><strong>' + esc(listing.title) + '</strong></div>';
    }
    return '<img class="rnx-listing-img" src="' + escAttr(listing.hero_image) + '" alt="' + alt + '" ' +
      (hero ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"') + '>';
  }

  function card(listing, hero) {
    var meta = [listing.property_type, listing.size_sf || listing.acreage].filter(Boolean);
    var price = listing.rate || listing.price;
    return [
      '<article class="card' + (hero ? ' rnx-hero-card' : '') + '" data-rnlp-id="' + escAttr(listing.id) + '">',
      '<div class="card-img">' + media(listing, hero) + '<span class="card-badge">' + esc(badge(listing)) + '</span>' + (price ? '<span class="card-price">' + esc(price) + '</span>' : '') + '</div>',
      '<div class="card-body">',
      '<div class="card-name">' + esc(titleCase(listing.title)) + '</div>',
      '<div class="card-addr">' + esc(listing.address) + '</div>',
      meta.length ? '<div class="card-pills">' + meta.map(function (item) { return '<span class="card-pill">' + esc(item) + '</span>'; }).join('') + '</div>' : '',
      '<div class="card-stats">',
      listing.size_sf ? '<div class="card-stat"><span class="card-stat-lbl">Building</span><span class="card-stat-val">' + esc(listing.size_sf) + '</span></div>' : '',
      listing.acreage ? '<div class="card-stat"><span class="card-stat-lbl">Land</span><span class="card-stat-val">' + esc(listing.acreage) + '</span></div>' : '',
      '</div>',
      '<div class="rnx-cta">View Details</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function renderGrid() {
    var grid = document.getElementById('listingsGrid');
    var results = document.getElementById('resultsCount');
    log('mount element found', Boolean(grid));
    if (!grid) return;

    grid.classList.remove('rnx-layout-list', 'rnx-layout-hero', 'rnx-layout-map');
    if (state.settings.layout === 'list_view') grid.classList.add('rnx-layout-list');
    if (state.settings.layout === 'hero_grid') grid.classList.add('rnx-layout-hero');
    if (state.settings.layout === 'grid_map') grid.classList.add('rnx-layout-map');

    var start = (state.page - 1) * PER_PAGE;
    var slice = state.filtered.slice(start, start + PER_PAGE);
    if (results) results.textContent = state.filtered.length + ' listing' + (state.filtered.length === 1 ? '' : 's');

    if (!state.filtered.length) {
      grid.innerHTML = '<div class="rnx-empty">No listings found. Try adjusting your filters.</div>';
      renderPagination();
      log('render completed', false);
      return;
    }

    var html = '';
    if (state.settings.layout === 'hero_grid') {
      html += card(state.filtered[0], true);
      slice = state.filtered.slice(Math.max(1, start), start + PER_PAGE);
    }
    html += slice.map(function (listing) { return card(listing, false); }).join('');
    if (state.settings.layout === 'grid_map') {
      html += '<div class="rnx-map-placeholder">Map view is ready for listings with location data.</div>';
    }
    grid.innerHTML = html;
    renderPagination();
    log('render completed', true);
  }

  function renderPagination() {
    var el = document.getElementById('pagination');
    if (!el) return;
    var total = Math.ceil(state.filtered.length / PER_PAGE);
    if (total <= 1) {
      el.innerHTML = '';
      return;
    }
    var html = '<button class="page-btn" ' + (state.page === 1 ? 'disabled' : '') + ' data-rnlp-page="' + (state.page - 1) + '">‹</button>';
    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || Math.abs(i - state.page) <= 1) {
        html += '<button class="page-btn ' + (i === state.page ? 'active' : '') + '" data-rnlp-page="' + i + '">' + i + '</button>';
      } else if (Math.abs(i - state.page) === 2) {
        html += '<span class="page-btn" style="pointer-events:none;opacity:.35">...</span>';
      }
    }
    html += '<button class="page-btn" ' + (state.page === total ? 'disabled' : '') + ' data-rnlp-page="' + (state.page + 1) + '">›</button>';
    el.innerHTML = html;
  }

  function renderTeam() {
    var target = document.getElementById('teamGrid');
    if (!target) return;
    var seen = {};
    var brokers = [];
    state.all.forEach(function (listing) {
      var raw = listing.raw || {};
      var users = raw.UserList || (raw.User ? [raw.User] : []);
      users.forEach(function (user) {
        var email = clean(user.Email).toLowerCase();
        if (email && !seen[email]) {
          seen[email] = true;
          brokers.push(user);
        }
      });
    });
    if (!brokers.length) {
      var fallback = [
        { FirstName: 'James', LastName: 'Rourke', title: 'Senior Vice President', Phone: '(702) 555-0141', Email: '' },
        { FirstName: 'Priya', LastName: 'Mehta', title: 'Investment Sales', Phone: '(702) 555-0188', Email: '' },
        { FirstName: 'Derek', LastName: 'Canales', title: 'Leasing Specialist', Phone: '(702) 555-0162', Email: '' }
      ];
      target.innerHTML = fallback.map(function (b) {
        var name = b.FirstName + ' ' + b.LastName;
        var initials = (b.FirstName[0] + b.LastName[0]).toUpperCase();
        return '<div class="team-card"><div class="team-avatar">' + esc(initials) + '</div>' +
          '<div class="team-name">' + esc(name) + '</div>' +
          (b.title ? '<span class="team-email" style="font-style:italic">' + esc(b.title) + '</span>' : '') +
          (b.Phone ? '<a class="team-phone team-contact" href="tel:' + escAttr(b.Phone) + '">' + esc(b.Phone) + '</a>' : '') +
          '</div>';
      }).join('');
      return;
    }
    target.innerHTML = brokers.slice(0, 8).map(function (user) {
      var name = [user.FirstName, user.LastName].map(clean).filter(Boolean).join(' ') || 'Listing Broker';
      var initials = name.split(/\s+/).map(function (part) { return part[0]; }).join('').slice(0, 2).toUpperCase();
      return '<div class="team-card"><div class="team-avatar">' + esc(initials) + '</div><div class="team-name">' + esc(name) + '</div>' +
        (user.Email ? '<a class="team-email team-contact" href="mailto:' + escAttr(user.Email) + '">' + esc(user.Email) + '</a>' : '') +
        (user.Phone ? '<a class="team-phone team-contact" href="tel:' + escAttr(user.Phone) + '">' + esc(user.Phone) + '</a>' : '') +
        '</div>';
    }).join('');
  }

  function applyFilters() {
    var input = document.getElementById('searchInput');
    var q = input ? input.value.toLowerCase() : '';
    state.filtered = state.all.filter(function (listing) {
      var haystack = [listing.title, listing.address, listing.city, listing.state, listing.property_type, listing.status, listing.listing_type].join(' ').toLowerCase();
      var status = (listing.status + ' ' + listing.listing_type).toUpperCase();
      var textMatch = !q || haystack.indexOf(q) !== -1;
      var filterMatch = state.filter === 'all' ||
        (state.filter === 'SOLD' && /SOLD|LEASED/.test(status)) ||
        (state.filter === 'For Lease' && /FOR LEASE/.test(status) && !/SOLD|LEASED/.test(status)) ||
        (state.filter === 'For Sale' && /FOR SALE/.test(status) && !/SOLD|LEASED/.test(status));
      return textMatch && filterMatch;
    });
    state.page = 1;
    renderGrid();
  }

  function bindControls() {
    document.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.filter-chip').forEach(function (item) { item.classList.remove('active'); });
        chip.classList.add('active');
        state.filter = chip.dataset.filter || 'all';
        applyFilters();
      });
    });
    var search = document.getElementById('searchInput');
    if (search) search.addEventListener('input', applyFilters);
    var layout = document.getElementById('layoutSelect');
    if (layout) {
      layout.addEventListener('change', function () {
        var map = { grid: 'full_grid', compact: 'full_grid', wide: 'full_grid', list: 'list_view' };
        state.settings.layout = map[layout.value] || layout.value || 'full_grid';
        log('selected layout', state.settings.layout);
        renderGrid();
      });
    }
    document.addEventListener('click', function (event) {
      var cardEl = event.target.closest('[data-rnlp-id]');
      if (cardEl) showDetail(cardEl.dataset.rnlpId);
      var inquireEl = event.target.closest('[data-rnlp-inquire]');
      if (inquireEl) openInquire(inquireEl.dataset.rnlpTitle || '', inquireEl.dataset.rnlpInquire || '', inquireEl.dataset.rnlpAddress || '', inquireEl.dataset.rnlpBrokerEmail || '');
      var pageEl = event.target.closest('[data-rnlp-page]');
      if (pageEl) {
        state.page = Math.max(1, Number(pageEl.dataset.rnlpPage) || 1);
        renderGrid();
        var section = document.getElementById('listings');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeModal('detailModal');
        closeModal('inquireModal');
      }
    });
    document.addEventListener('error', function (event) {
      var img = event.target;
      if (!img || !img.classList || !img.classList.contains('rnx-listing-img')) return;
      var fallback = document.createElement('div');
      fallback.className = 'rnx-media-fallback';
      fallback.innerHTML = '<strong>Property image unavailable</strong>';
      img.replaceWith(fallback);
    }, true);
  }

  async function loadListings() {
    applyTheme();
    injectStyles();
    bindControls();
    log('selected layout', state.settings.layout);
    log('selected template', document.title);

    var grid = document.getElementById('listingsGrid');
    if (!grid) {
      warn('listingsGrid mount not found', null);
      return;
    }

    try {
      var response = await fetch(API_BASE + '/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial: SERIAL,
          filters: { startIndex: 0, NoOfRecords: 500, SortBy: 'updated', SortHow: 'desc', SearchType: '' }
        })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var data = await response.json();
      console.log('[RNLP Demo] listings response:', data);
      var rawListings = extractListings(data);
      log('listings fetched count', rawListings.length);
      log('first listing sample', redact(rawListings[0]));
      state.all = rawListings.map(normalizeListing).filter(function (listing) { return listing.id; });
      state.filtered = state.all.slice();
      renderGrid();
      renderTeam();
    } catch (error) {
      console.error('[RNLP demo] render pipeline failed', error);
      grid.innerHTML = '<div class="rnx-error">Listings are temporarily unavailable.</div>';
    }
  }

  async function showDetail(id) {
    if (!id) return;
    if (state.settings.detailBehavior === 'full_page') {
      location.href = 'property-detail.html?serial=' + encodeURIComponent(SERIAL) + '&id=' + encodeURIComponent(id);
      return;
    }
    var content = document.getElementById('detailContent');
    if (!content) {
      location.href = 'property-detail.html?serial=' + encodeURIComponent(SERIAL) + '&id=' + encodeURIComponent(id);
      return;
    }
    content.innerHTML = '<div class="loading" style="padding:80px"><div class="spinner"></div><p>Loading property...</p></div>';
    openModal('detailModal');
    try {
      var response = await fetch(API_BASE + '/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serial: SERIAL, property_id: parseInt(id, 10) })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var data = await response.json();
      var listing = normalizeListing(data.property || data);
      renderDetail(listing, data.demographics || null, data.neighborhood || null);
    } catch (error) {
      console.error('[RNLP demo] property detail failed', error);
      content.innerHTML = '<div class="rnx-error">Could not load property details.</div>';
    }
  }

  function renderDetail(listing, demographics, neighborhood) {
    var content = document.getElementById('detailContent');
    if (!content) return;
    var price = listing.rate || listing.price;
    content.innerHTML = [
      '<div class="detail-hero rnx-detail-hero"><div class="card-img" style="height:100%;aspect-ratio:auto">' + media(listing, true) + '</div>',
      '<div class="detail-hero-overlay"></div><span class="detail-hero-badge">' + esc(badge(listing)) + '</span>',
      price ? '<span class="detail-hero-price">' + esc(price) + '</span>' : '',
      '<div class="detail-hero-text"><h2>' + esc(titleCase(listing.title)) + '</h2><p>' + esc(listing.address) + '</p></div></div>',
      '<div class="detail-body"><div class="detail-desc"><h3>Description</h3><p>' + esc(listing.description) + '</p>',
      '<div class="detail-facts" style="padding:16px 0;border:0">' +
        fact('Type', listing.property_type) + fact('Size', listing.size_sf) + fact('Land', listing.acreage) + fact('Location', [listing.city, listing.state].filter(Boolean).join(', ')) +
      '</div>',
      demographics ? '<div class="detail-demo"><strong>Area demographics</strong><p>Population ' + esc(fmt(demographics.population)) + (demographics.median_income ? ' - Median income $' + esc(fmt(demographics.median_income)) : '') + '</p></div>' : '',
      neighborhood && neighborhood.display ? '<div class="detail-demo"><strong>Location context</strong><p>' + esc(neighborhood.display) + '</p></div>' : '',
      '</div><div class="detail-sidebar">',
      listing.broker_name ? '<div class="detail-broker"><div class="detail-broker-name">' + esc(listing.broker_name) + '</div>' + (listing.broker_email ? '<a href="mailto:' + escAttr(listing.broker_email) + '">' + esc(listing.broker_email) + '</a>' : '') + '</div>' : '',
      '<button class="detail-btn detail-btn-primary" data-rnlp-inquire="' + escAttr(listing.id) + '" data-rnlp-title="' + escAttr(listing.title) + '" data-rnlp-address="' + escAttr(listing.address) + '" data-rnlp-broker-email="' + escAttr(listing.broker_email) + '">Inquire About This Property</button>',
      listing.brochure_url ? '<a class="detail-btn detail-btn-outline" href="' + escAttr(listing.brochure_url) + '" target="_blank" rel="noopener">Download Brochure</a>' : '',
      '<button class="detail-btn detail-btn-outline" onclick="navigator.clipboard&&navigator.clipboard.writeText(location.href)">Share Property</button>',
      '</div></div>'
    ].join('');
  }

  function fact(label, value) {
    return value ? '<div class="detail-fact"><div class="detail-fact-lbl">' + esc(label) + '</div><div class="detail-fact-val">' + esc(value) + '</div></div>' : '';
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openInquire(name, id, address, brokerEmail) {
    window.currentPropName = name || '';
    window.currentPropId = id || '';
    window.currentPropAddress = address || '';
    window.currentBrokerEmail = brokerEmail || '';
    var label = document.getElementById('inquirePropertyName');
    if (label) label.textContent = name || '';
    openModal('inquireModal');
  }

  async function submitInquiry(event) {
    event.preventDefault();
    var form = event.target;
    var button = form.querySelector('[type=submit]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }
    try {
      var response = await fetch(API_BASE + '/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial: SERIAL,
          name: value('inq-name'),
          email: value('inq-email'),
          phone: value('inq-phone'),
          message: value('inq-msg'),
          property_id: window.currentPropId || '',
          property_name: window.currentPropName || '',
          address: window.currentPropAddress || '',
          broker_email: window.currentBrokerEmail || '',
          page_url: location.href,
          source_website: location.origin
        })
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok || !data.success) throw new Error(data.message || 'Inquiry failed');
      alert(data.message || 'Thanks. Your inquiry was sent to the listing team.');
      form.reset();
      closeModal('inquireModal');
    } catch (error) {
      if (DEBUG) console.error('[RNLP demo] inquiry failed', error);
      alert('We could not send your inquiry right now. Please try again or contact the listing team directly.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = 'Send Inquiry';
      }
    }
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function handleContact(event) {
    event.preventDefault();
    alert('Message received. A broker will be in touch soon.');
    event.target.reset();
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
    });
  }

  function escAttr(value) {
    return esc(value).replace(/`/g, '&#096;');
  }

  function escJs(value) {
    return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function titleCase(value) {
    var str = String(value || '');
    return str === str.toUpperCase() ? str.toLowerCase().replace(/\b\w/g, function (char) { return char.toUpperCase(); }) : str;
  }

  function redact(raw) {
    if (!raw) return null;
    return {
      Id: raw.Id,
      PropertyName: raw.PropertyName,
      ListingType: raw.ListingType,
      Status: raw.Status,
      City: raw.City,
      State: raw.State,
      Attachments: Array.isArray(raw.Attachments) ? raw.Attachments.length : 0
    };
  }

  window.showDetail = showDetail;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openInquire = openInquire;
  window.submitInquiry = submitInquiry;
  window.handleContact = handleContact;
  window.RNLP_DEMO_SETTINGS = state.settings;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadListings);
  } else {
    loadListings();
  }
})();
