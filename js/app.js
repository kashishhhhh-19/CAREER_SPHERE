/**
 * CareerSphere - Main Application Controller & Single-Page Router
 * Navigation handler, mobile drawer toggle, global search modal,
 * and live store event synchronization.
 */

import { store } from './store.js';
import { OverlayManager } from './overlayManager.js';
import { openModal, closeModal, showToast, escapeHtml, debounce } from './utils.js';
import { MOCK_GOVT_JOBS, MOCK_PREPARATION_TRACKS, MOCK_PROJECTS } from './mockData.js';

// Import Views
import { renderHomeView } from './views/homeView.js';
import { renderCorporateView } from './views/corporateView.js';
import { renderInternshipsView } from './views/internshipsView.js';
import { renderGovtView } from './views/govtView.js';
import { renderPrepView } from './views/prepView.js';
import { renderNotesView } from './views/notesView.js';
import { renderResumeView } from './views/resumeView.js';
import { renderSavedView } from './views/savedView.js';
import { renderNotificationsView } from './views/notificationsView.js';
import { renderEligibilityView } from './views/eligibilityView.js';
import { renderProfileView } from './views/profileView.js';
import { renderAdminView } from './views/adminView.js';

// Expose closeModal & OverlayManager globally for inline click handlers and debugging
window.CareerSphereModalClose = closeModal;
window.OverlayManager = OverlayManager;
window.store = store;

class App {
  constructor() {
    this.appContainer = document.getElementById('app-view-container');
    this.currentRoute = 'home';
    this._isNavigating = false;
    this._isInitialRender = true;
    this.routes = {
      home: renderHomeView,
      corporate: renderCorporateView,
      'corporate-jobs': renderCorporateView,
      internships: renderInternshipsView,
      internship: renderInternshipsView,
      intern: renderInternshipsView,
      government: renderGovtView,
      'govt-jobs': renderGovtView,
      preparation: renderPrepView,
      notes: renderNotesView,
      resume: renderResumeView,
      projects: renderResumeView, // Graceful fallback: projects managed in resume
      saved: renderSavedView,
      notifications: renderNotificationsView,
      eligibility: renderEligibilityView,
      profile: renderProfileView,
      admin: renderAdminView
    };
  }

  resolveRoute(name) {
    if (!name) return 'home';
    const clean = String(name).replace(/^#/, '').trim().toLowerCase();
    const aliases = {
      'internship': 'internships',
      'internships': 'internships',
      'intern': 'internships',
      'interns': 'internships',
      'corporate': 'corporate',
      'corporate-jobs': 'corporate',
      'corporatejobs': 'corporate',
      'jobs': 'corporate',
      'government': 'government',
      'govt': 'government',
      'govt-jobs': 'government',
      'preparation': 'preparation',
      'prep': 'preparation',
      'notes': 'notes',
      'resume': 'resume',
      'projects': 'resume',
      'project': 'resume',
      'saved': 'saved',
      'notifications': 'notifications',
      'notif': 'notifications',
      'alerts': 'notifications',
      'eligibility': 'eligibility',
      'profile': 'profile',
      'admin': 'admin'
    };
    return aliases[clean] || (this.routes[clean] ? clean : 'home');
  }

  init() {
    // 1. Initialize central OverlayManager service
    OverlayManager.init();

    // 2. Setup navigation click listener & hash router synchronously/immediately
    this.setupNavigation();
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();

    // 3. Setup interactive controls and modal listeners
    this.setupMobileMenu();
    this.setupGlobalSearch();
    this.setupSavedBadgeListener();
    this.setupNotificationBadgeListener();
    this.setupNotificationDropdown();
    this.setupModalDismiss();
    this.setupAuthHandlers();
    this.setupCardDragScroll();
    this.setupSnowfall();
    this.setupOpeningIntro();
    this.updateSavedBadge();
    this.updateNotificationBadge();
    this.updateNavbarAuthState();

    // 4. Listen for auth state changes
    store.subscribe('auth_changed', () => {
      this.updateNavbarAuthState();
    });

    // 5. Detached, non-blocking background synchronization for real official feeds
    Promise.resolve().then(() => {
      store.checkAuthStatus().catch(() => {});
      store.syncCorporateJobsAPI().catch(err => console.warn('Corporate jobs sync error:', err));
      store.syncInternshipsAPI().catch(err => console.warn('Internships sync error:', err));
      store.syncGovtJobsAPI().catch(err => console.warn('Govt jobs sync error:', err));
      store.syncWithBackendAPI().catch(err => console.warn('Backend API sync error:', err));
    });
  }

  // Routing Handler
  handleRouting() {
    if (this._isNavigating) return;
    const rawHash = window.location.hash.replace(/^#/, '').trim();
    const route = this.resolveRoute(rawHash);
    this.navigateTo(route, false);
  }

  navigateTo(routeName, updateHash = true) {
    const targetRoute = this.resolveRoute(routeName);
    this.currentRoute = targetRoute;

    if (updateHash) {
      const currentHash = window.location.hash.replace(/^#/, '').trim().toLowerCase();
      if (currentHash !== targetRoute) {
        this._isNavigating = true;
        window.location.hash = targetRoute;
        setTimeout(() => { this._isNavigating = false; }, 80);
      }
    }

    // Always dismiss all overlays, modals, drawers, and dropdowns
    OverlayManager.closeAll();

    const container = this.appContainer || document.getElementById('app-view-container');
    if (!container) return;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav links across desktop and mobile
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
      const linkRoute = this.resolveRoute(link.dataset.route || (link.getAttribute('href') || '').replace(/^#/, ''));
      link.classList.toggle('active', linkRoute === targetRoute);
    });

    // Render corresponding view with cinematic page transition
    const viewFn = this.routes[targetRoute] || this.routes['home'];
    if (typeof viewFn === 'function') {
      const renderView = () => {
        container.innerHTML = '';
        try {
          viewFn(container, (nextRoute) => this.navigateTo(nextRoute));
        } catch (err) {
          console.error(`[Router] Error rendering view for route "${targetRoute}":`, err);
          container.innerHTML = `
            <div class="card error-boundary-card section-container" style="text-align: center; padding: 3rem 1.5rem; margin: 2rem auto; max-width: 600px;">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚠️</div>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--navy-dark); margin-bottom: 0.5rem;">Section Loading Notice</h2>
              <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
                We encountered a minor issue loading this view. You can reload it or return safely to Home.
              </p>
              <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-outline" id="err-boundary-retry">↻ Reload View</button>
                <button class="btn btn-primary" id="err-boundary-home">🏠 Return to Home</button>
              </div>
            </div>
          `;
          container.querySelector('#err-boundary-retry')?.addEventListener('click', () => this.navigateTo(targetRoute, false));
          container.querySelector('#err-boundary-home')?.addEventListener('click', () => this.navigateTo('home', true));
        } finally {
          OverlayManager.closeAll();
          OverlayManager.sanitize();
          setTimeout(() => { this._isNavigating = false; }, 50);
        }
      };

      if (this._isInitialRender) {
        this._isInitialRender = false;
        renderView();
      } else {
        this.triggerPageTransition(renderView);
      }
    }
  }

  // Desktop & Mobile Navigation Links
  setupNavigation() {
    if (this._navigationInitialized) return;
    this._navigationInitialized = true;

    document.addEventListener('click', (e) => {
      // Find closest link or element with data-route
      const link = e.target.closest('.nav-link, .mobile-nav-link, .brand-link, .pathway-card, [data-route]');
      if (!link) return;

      // Do NOT intercept if click originated inside a form control or modal button
      if (e.target.closest('input, select, textarea, .modal-dialog, #global-modal')) {
        return;
      }

      const href = link.getAttribute('href');
      const rawTarget = link.dataset.route || (href && href.startsWith('#') ? href.slice(1) : '');
      if (!rawTarget) return;

      const targetRoute = this.resolveRoute(rawTarget);
      if (!targetRoute) return;

      e.preventDefault();

      const filterPreset = link.dataset.filter;
      if (filterPreset) {
        if (targetRoute === 'internships') {
          sessionStorage.setItem('careersphere_intern_filter_preset', filterPreset);
        } else {
          sessionStorage.setItem('careersphere_filter_preset', filterPreset);
        }
      }

      this.navigateTo(targetRoute, true);
    });
  }

  // Mobile Hamburger Menu
  setupMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-toggle-btn');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    const toggleDrawer = () => {
      if (OverlayManager.isOpen('mobile-menu')) {
        OverlayManager.close('mobile-menu');
      } else {
        OverlayManager.open('mobile-menu');
      }
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => OverlayManager.close('mobile-menu'));
  }

  closeMobileMenu() {
    OverlayManager.close('mobile-menu');
  }

  closeSearchOverlay() {
    OverlayManager.close('global-search');
  }

  // Saved Badge Counter
  updateSavedBadge() {
    const count = store.getSavedCount();
    document.querySelectorAll('.saved-badge-counter').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }

  setupSavedBadgeListener() {
    window.addEventListener('careersphere:statechange', (e) => {
      if (e.detail?.event === 'saved_changed') {
        this.updateSavedBadge();
      }
    });
  }

  // Notification Badge Counter & Listener
  updateNotificationBadge() {
    const unreadCount = store.getUnreadNotificationsCount();
    document.querySelectorAll('.notification-badge-counter').forEach(el => {
      el.textContent = unreadCount;
      el.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    });
  }

  setupNotificationBadgeListener() {
    window.addEventListener('careersphere:statechange', (e) => {
      if (e.detail?.event === 'notifications_changed' || e.detail?.event === 'notification_prefs_changed' || e.detail?.event === 'saved_changed') {
        this.updateNotificationBadge();
        if (typeof this.renderNotificationDropdown === 'function') {
          const dropdown = document.getElementById('notification-dropdown');
          if (dropdown && dropdown.classList.contains('active')) {
            this.renderNotificationDropdown();
          }
        }
      }
    });
  }

  // Header Notification Bell Dropdown Controller
  setupNotificationDropdown() {
    const bellBtn = document.getElementById('nav-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const bellWrapper = document.getElementById('nav-bell-wrapper');
    const notifsList = document.getElementById('dropdown-notifs-list');
    const unreadTag = document.getElementById('dropdown-unread-tag');
    const markAllBtn = document.getElementById('dropdown-mark-all-btn');
    const viewAllBtn = document.getElementById('dropdown-view-all-btn');

    if (!bellBtn || !dropdown) return;

    const renderDropdownItems = () => {
      const allNotifs = store.getNotifications({ applyPreferences: true });
      const unreadCount = store.getUnreadNotificationsCount();
      const latest = allNotifs.slice(0, 5); // Latest 3–5 notifications

      if (unreadTag) {
        unreadTag.textContent = unreadCount > 0 ? `${unreadCount} New` : 'All Read';
        unreadTag.className = unreadCount > 0 ? 'dropdown-unread-tag' : 'dropdown-unread-tag all-read';
      }

      if (!notifsList) return;

      if (latest.length === 0) {
        notifsList.innerHTML = `
          <div class="dropdown-empty">
            <div class="dropdown-empty-icon">🔔</div>
            <p>No notifications available</p>
          </div>
        `;
        return;
      }

      notifsList.innerHTML = latest.map(item => {
        const isUnread = !item.isRead && !item.read;
        return `
          <div class="dropdown-item ${isUnread ? 'is-unread' : 'is-read'}" data-id="${item.id}">
            <div class="dropdown-item-header">
              <span class="dropdown-item-cat">${escapeHtml(item.category)}</span>
              <span class="dropdown-item-date">${escapeHtml(item.notificationDate || item.date || '')}</span>
            </div>
            <div class="dropdown-item-title-row">
              ${isUnread ? '<span class="dropdown-new-badge">NEW</span>' : ''}
              <h4 class="dropdown-item-title">${escapeHtml(item.title)}</h4>
            </div>
            <div class="dropdown-item-org text-muted">${escapeHtml(item.organization || '')}</div>
          </div>
        `;
      }).join('');

      notifsList.querySelectorAll('.dropdown-item').forEach(itemEl => {
        itemEl.addEventListener('click', () => {
          const id = itemEl.dataset.id;
          const found = allNotifs.find(n => n.id === id);
          this.closeNotificationDropdown();
          if (found) {
            this.openNotificationDetailModal(found);
          }
        });
      });
    };

    // Toggle dropdown
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = OverlayManager.isOpen('notification-dropdown');
      if (isOpen) {
        OverlayManager.close('notification-dropdown');
        bellBtn.setAttribute('aria-expanded', 'false');
      } else {
        OverlayManager.open('notification-dropdown');
        bellBtn.setAttribute('aria-expanded', 'true');
        renderDropdownItems();
      }
    });

    // Mark all as read from dropdown
    if (markAllBtn) {
      markAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.markAllNotificationsAsRead();
        showToast('All notifications marked as read!', 'success');
        renderDropdownItems();
      });
    }

    // View all notifications button in dropdown footer
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeNotificationDropdown();
        this.navigateTo('notifications');
      });
    }

    this.renderNotificationDropdown = renderDropdownItems;
  }

  closeNotificationDropdown() {
    OverlayManager.close('notification-dropdown');
    const bellBtn = document.getElementById('nav-bell-btn');
    if (bellBtn) bellBtn.setAttribute('aria-expanded', 'false');
  }

  openNotificationDetailModal(item) {
    if (!item) return;
    if (!item.isRead && !item.read) {
      store.markNotificationAsRead(item.id);
    }
    const categoryBadges = {
      'Government Jobs': 'badge-success',
      'Private Jobs': 'badge-primary',
      'Internships': 'badge-info',
      'Exams': 'badge-purple',
      'Recruitment Forms': 'badge-amber',
      'Results': 'badge-emerald',
      'Admit Cards': 'badge-indigo'
    };
    const badgeClass = categoryBadges[item.category] || 'badge-neutral';
    const isDemo = Boolean(item.isDemo);

    openModal({
      title: item.title,
      size: 'large',
      contentHtml: `
        <div class="notif-modal-top">
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
            ${isDemo ? '<span class="badge badge-demo font-bold">DEMO DATA</span>' : '<span class="badge badge-verified-source font-bold">✓ Verified Official Source</span>'}
            <span class="badge ${badgeClass}">${escapeHtml(item.category)}</span>
            ${item.status ? `<span class="badge badge-neutral">${escapeHtml(item.status)}</span>` : ''}
          </div>
          <span class="text-muted" style="font-size: 0.85rem;">Published: ${escapeHtml(item.notificationDate || item.date || 'Recent')}</span>
        </div>

        ${isDemo ? `
          <div class="demo-data-banner" style="margin-bottom: 1.25rem;">
            ⚠️ <strong>DEMO DATA — NOT A LIVE RECRUITMENT NOTICE</strong><br />
            This is placeholder mock data created for development testing.
          </div>
        ` : ''}

        <div class="notif-modal-org-box">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Recruiting Authority</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--navy-dark); margin-top: 0.2rem;">
                ${escapeHtml(item.organization || 'Official Portal')}
              </div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Official Source: </span>
              ${item.sourceUrl && item.sourceUrl !== '#' ? `
                <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary">
                  ${escapeHtml(item.sourceName || 'Official Website')} ↗
                </a>
              ` : `
                <strong class="text-muted">${escapeHtml(item.sourceName || 'Demo')}</strong>
              `}
            </div>
          </div>
        </div>

        <div class="notif-modal-specs-grid">
          <div class="modal-spec-card">
            <span class="spec-card-label">Minimum Qualification</span>
            <strong class="spec-card-val">${escapeHtml(item.qualification || 'Graduate / 12th Pass')}</strong>
          </div>
          <div class="modal-spec-card">
            <span class="spec-card-label">Location / Scope</span>
            <strong class="spec-card-val">${escapeHtml(item.location || 'All India')}</strong>
          </div>
          <div class="modal-spec-card">
            <span class="spec-card-label">Total Vacancies</span>
            <strong class="spec-card-val">${escapeHtml(item.vacancies || 'Not Specified')}</strong>
          </div>
          <div class="modal-spec-card">
            <span class="spec-card-label">Application Status</span>
            <strong class="spec-card-val ${item.status === 'Closing Soon' ? 'text-danger' : 'text-success'}">${escapeHtml(item.status || 'Active')}</strong>
          </div>
        </div>

        <div class="notif-modal-dates-grid">
          <div class="modal-date-box">
            <span class="modal-date-label">Application Start Date</span>
            <strong class="modal-date-val">${escapeHtml(item.applicationStartDate || item.startDate || 'Available Now')}</strong>
          </div>
          <div class="modal-date-box ${item.status === 'Closing Soon' ? 'urgent' : ''}">
            <span class="modal-date-label">Last Date to Apply</span>
            <strong class="modal-date-val ${item.status === 'Closing Soon' ? 'text-danger' : ''}">${escapeHtml(item.applicationLastDate || item.lastDate || 'Check portal')}</strong>
          </div>
        </div>

        <div class="notif-modal-body-text">
          <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--navy-dark);">Notification Summary</h4>
          <p style="font-size: 0.925rem; line-height: 1.6; color: var(--text-body); margin-bottom: 1.25rem;">
            ${escapeHtml(item.description)}
          </p>
          
          <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--navy-dark);">Eligibility & Detailed Terms</h4>
          <p style="font-size: 0.925rem; line-height: 1.6; color: var(--text-body);">
            ${escapeHtml(item.eligibility || item.details || item.description)}
          </p>
        </div>
      `,
      footerHtml: `
        ${item.applyUrl && item.applyUrl !== '#' ? `
          <a href="${escapeHtml(item.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="modal-apply-btn">
            Apply on Official Portal ↗
          </a>
        ` : ''}
        ${item.officialNotificationUrl && item.officialNotificationUrl !== '#' ? `
          <a href="${escapeHtml(item.officialNotificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" id="modal-official-doc-btn">
            Official Document (PDF) ↗
          </a>
        ` : ''}
        <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">
          Close
        </button>
      `
    });
  }

  // Global Search Modal Overlay
  setupGlobalSearch() {
    const searchTriggers = document.querySelectorAll('.trigger-global-search');
    const searchModalOverlay = document.getElementById('global-search-overlay');
    const searchInput = document.getElementById('global-modal-search-input');
    const searchResults = document.getElementById('global-search-results');
    const closeSearchBtn = document.getElementById('close-search-overlay-btn');

    const openSearch = () => {
      OverlayManager.open('global-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      performSearch('');
    };

    const closeSearch = () => {
      OverlayManager.close('global-search');
    };

    searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

    // Keyboard shortcut: Ctrl+K or Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
        closeModal();
      }
    });

    const performSearch = (query) => {
      const q = query.toLowerCase().trim();

      if (!q) {
        searchResults.innerHTML = `
          <div class="search-empty-prompt">
            <p class="text-muted">Type anything to instantly search corporate jobs, government exams, projects, and preparation tracks.</p>
            <div class="quick-keywords">
              <span>Popular searches:</span>
              <button class="pill-tag-sm" data-term="React">React</button>
              <button class="pill-tag-sm" data-term="SSC">SSC CGL</button>
              <button class="pill-tag-sm" data-term="Python">Python</button>
              <button class="pill-tag-sm" data-term="BCA">BCA Freshers</button>
              <button class="pill-tag-sm" data-term="Banking">Bank PO</button>
            </div>
          </div>
        `;

        searchResults.querySelectorAll('.pill-tag-sm').forEach(tag => {
          tag.addEventListener('click', () => {
            searchInput.value = tag.dataset.term;
            performSearch(tag.dataset.term);
          });
        });
        return;
      }

      // Search live corporate opportunities from store
      const liveCorp = store.getCorporateJobs();
      const matchedCorp = liveCorp.filter(j => 
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.company && j.company.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (Array.isArray(j.skills) && j.skills.some(s => String(s).toLowerCase().includes(q)))
      );

      // Search live verified internships from store
      const liveIntern = store.getInternships();
      const matchedIntern = liveIntern.filter(it =>
        (it.title && it.title.toLowerCase().includes(q)) ||
        (it.company && it.company.toLowerCase().includes(q)) ||
        (it.location && it.location.toLowerCase().includes(q)) ||
        (Array.isArray(it.skills) && it.skills.some(s => String(s).toLowerCase().includes(q))) ||
        (Array.isArray(it.categories) && it.categories.some(c => String(c).toLowerCase().includes(q)))
      );

      // Search live government notices & exams from store
      const liveGovt = store.getGovtJobs();
      const matchedGovt = liveGovt.filter(g =>
        (g.postName && g.postName.toLowerCase().includes(q)) ||
        (g.organization && g.organization.toLowerCase().includes(q)) ||
        (g.qualificationDetail && g.qualificationDetail.toLowerCase().includes(q)) ||
        (g.location && g.location.toLowerCase().includes(q))
      );

      // Search prep
      const matchedPrep = MOCK_PREPARATION_TRACKS.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );

      // Search projects
      const matchedProj = store.getProjects().filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.technologies.some(t => t.toLowerCase().includes(q))
      );

      const totalMatches = matchedCorp.length + matchedIntern.length + matchedGovt.length + matchedPrep.length + matchedProj.length;

      if (totalMatches === 0) {
        searchResults.innerHTML = `
          <div class="search-no-results">
            <p>No results found for "<strong>${escapeHtml(query)}</strong>". Try searching for skills like <em>Python</em>, <em>React</em>, or organizations like <em>SSC</em> or <em>UPSC</em>.</p>
          </div>
        `;
        return;
      }

      let html = `<div class="search-results-list">`;

      if (matchedCorp.length > 0) {
        html += `
          <div class="search-category-group">
            <h4 class="search-group-title">💼 Corporate Opportunities (${matchedCorp.length})</h4>
            ${matchedCorp.map(c => `
              <div class="search-result-item" data-action="corp" data-id="${c.id}">
                <div class="item-title">${escapeHtml(c.title)}</div>
                <div class="item-sub text-muted">${escapeHtml(c.company)} • ${escapeHtml(c.location || 'Pan India')} • <span class="text-success font-semibold">${escapeHtml(c.salary || 'Best in Industry')}</span></div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (matchedIntern.length > 0) {
        html += `
          <div class="search-category-group">
            <h4 class="search-group-title">🎓 Student Internships (${matchedIntern.length})</h4>
            ${matchedIntern.map(it => `
              <div class="search-result-item" data-action="internships" data-id="${it.id}">
                <div class="item-title">${escapeHtml(it.title)}</div>
                <div class="item-sub text-muted">${escapeHtml(it.company)} • ${escapeHtml(it.location || 'Pan India')} • <span class="text-primary font-semibold">${escapeHtml(it.stipend || 'Stipend: Not available')}</span></div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (matchedGovt.length > 0) {
        html += `
          <div class="search-category-group">
            <h4 class="search-group-title">🏛️ Government Exams & Notices (${matchedGovt.length})</h4>
            ${matchedGovt.map(g => `
              <div class="search-result-item" data-action="govt" data-id="${g.id}">
                <div class="item-title">${escapeHtml(g.postName)}</div>
                <div class="item-sub text-muted">${escapeHtml(g.organization)} • ${escapeHtml(g.vacancies || 'Check Official Gazette')}</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (matchedPrep.length > 0) {
        html += `
          <div class="search-category-group">
            <h4 class="search-group-title">📚 Preparation Tracks (${matchedPrep.length})</h4>
            ${matchedPrep.map(t => `
              <div class="search-result-item" data-action="prep" data-id="${t.id}">
                <div class="item-title">${t.icon} ${escapeHtml(t.title)}</div>
                <div class="item-sub text-muted">${t.modulesCount} modules • Progress: ${t.progress}%</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (matchedProj.length > 0) {
        html += `
          <div class="search-category-group">
            <h4 class="search-group-title">🚀 Student Projects (${matchedProj.length})</h4>
            ${matchedProj.map(p => `
              <div class="search-result-item" data-action="projects" data-id="${p.id}">
                <div class="item-title">${escapeHtml(p.name)}</div>
                <div class="item-sub text-muted">${p.technologies.join(', ')}</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      html += `</div>`;
      searchResults.innerHTML = html;

      // Attach click events on search results
      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          closeSearch();
          if (action === 'corp') {
            this.navigateTo('corporate');
          } else if (action === 'internships') {
            this.navigateTo('internships');
          } else if (action === 'govt') {
            this.navigateTo('government');
          } else if (action === 'prep') {
            this.navigateTo('preparation');
          } else if (action === 'projects') {
            this.navigateTo('projects');
          }
        });
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value);
      }, 200));
    }
  }

  // Modal & Overlay Dismiss Button Bindings
  setupModalDismiss() {
    const modalCloseBtn = document.getElementById('close-global-modal-btn');
    const searchCloseBtn = document.getElementById('close-search-overlay-btn');

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => OverlayManager.close('global-modal'));
    }

    if (searchCloseBtn) {
      searchCloseBtn.addEventListener('click', () => OverlayManager.close('global-search'));
    }
  }

  // Update navbar & mobile drawer authentication state
  updateNavbarAuthState() {
    const isAuth = store.isAuthenticated();
    const user = store.getCurrentUser();

    const authOpenBtn = document.getElementById('btn-auth-open');
    const userMenu = document.getElementById('nav-user-menu');
    const drawerGuest = document.getElementById('drawer-guest-card');
    const drawerUser = document.getElementById('drawer-user-card');

    if (isAuth && user) {
      if (authOpenBtn) authOpenBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';

      const displayName = user.fullName || (user.email ? user.email.split('@')[0] : 'Candidate');
      const avatar = user.avatar || '👤';

      const navName = document.getElementById('nav-user-name');
      const navAvatar = document.getElementById('nav-user-avatar');
      const dropAvatar = document.getElementById('dropdown-user-avatar');
      const dropName = document.getElementById('dropdown-user-name');
      const dropEmail = document.getElementById('dropdown-user-email');

      if (navName) navName.textContent = displayName;
      if (navAvatar) navAvatar.textContent = avatar;
      if (dropAvatar) dropAvatar.textContent = avatar;
      if (dropName) dropName.textContent = displayName;
      if (dropEmail) dropEmail.textContent = user.email || '';

      if (drawerGuest) drawerGuest.style.display = 'none';
      if (drawerUser) drawerUser.style.display = 'flex';

      const drawerAvatar = document.getElementById('drawer-avatar-display');
      const drawerName = document.getElementById('drawer-user-name');
      const drawerEmail = document.getElementById('drawer-user-email');
      if (drawerAvatar) drawerAvatar.textContent = avatar;
      if (drawerName) drawerName.textContent = displayName;
      if (drawerEmail) drawerEmail.textContent = user.email || '';
    } else {
      if (authOpenBtn) authOpenBtn.style.display = 'inline-flex';
      if (userMenu) userMenu.style.display = 'none';
      if (drawerGuest) drawerGuest.style.display = 'block';
      if (drawerUser) drawerUser.style.display = 'none';
    }
  }

  // Setup Authentication Modal, Dropdowns, and Form Listeners
  setupAuthHandlers() {
    const authOpenBtn = document.getElementById('btn-auth-open');
    const drawerAuthOpenBtn = document.getElementById('drawer-btn-auth-open');
    const authModalCloseBtn = document.getElementById('auth-modal-close');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const authErrorBanner = document.getElementById('auth-error-banner');
    const authErrorText = document.getElementById('auth-error-text');

    const showError = (msg) => {
      if (authErrorBanner && authErrorText) {
        authErrorText.textContent = msg;
        authErrorBanner.style.display = 'flex';
      }
    };

    const hideError = () => {
      if (authErrorBanner) {
        authErrorBanner.style.display = 'none';
      }
    };

    const switchAuthTab = (tab) => {
      hideError();
      if (tab === 'register') {
        if (tabLoginBtn) {
          tabLoginBtn.classList.remove('active');
          tabLoginBtn.setAttribute('aria-selected', 'false');
        }
        if (tabRegisterBtn) {
          tabRegisterBtn.classList.add('active');
          tabRegisterBtn.setAttribute('aria-selected', 'true');
        }
        if (formLogin) formLogin.style.display = 'none';
        if (formRegister) {
          formRegister.style.display = 'block';
          const regName = document.getElementById('reg-fullname');
          if (regName) regName.focus();
        }
      } else {
        if (tabRegisterBtn) {
          tabRegisterBtn.classList.remove('active');
          tabRegisterBtn.setAttribute('aria-selected', 'false');
        }
        if (tabLoginBtn) {
          tabLoginBtn.classList.add('active');
          tabLoginBtn.setAttribute('aria-selected', 'true');
        }
        if (formRegister) formRegister.style.display = 'none';
        if (formLogin) {
          formLogin.style.display = 'block';
          const loginEmail = document.getElementById('login-email');
          if (loginEmail) loginEmail.focus();
        }
      }
    };

    const openAuthModal = (defaultTab = 'login') => {
      if (OverlayManager.isOpen('mobile-menu')) {
        OverlayManager.close('mobile-menu');
      }
      switchAuthTab(defaultTab);
      OverlayManager.open('auth-modal');
    };

    if (authOpenBtn) {
      authOpenBtn.addEventListener('click', () => openAuthModal('login'));
    }

    if (drawerAuthOpenBtn) {
      drawerAuthOpenBtn.addEventListener('click', () => openAuthModal('login'));
    }

    if (authModalCloseBtn) {
      authModalCloseBtn.addEventListener('click', () => OverlayManager.close('auth-modal'));
    }

    if (tabLoginBtn) {
      tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    }

    if (tabRegisterBtn) {
      tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
    }

    // Login Form Submit
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const submitBtn = document.getElementById('btn-login-submit');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!email || !password) {
          showError('Please provide both your royal seal (email) and password.');
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Entering Realm...</span>';
        }

        try {
          const res = await store.loginUser(email, password);
          OverlayManager.close('auth-modal');
          const name = res.user?.fullName || email.split('@')[0];
          showToast(`Welcome back to Career Sphere, ${name}!`, 'success');
          formLogin.reset();
        } catch (err) {
          showError(err.message || 'Failed to authenticate. Please verify your credentials.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });
    }

    // Register Form Submit
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const fullNameInput = document.getElementById('reg-fullname');
        const emailInput = document.getElementById('reg-email');
        const qualInput = document.getElementById('reg-qualification');
        const degreeInput = document.getElementById('reg-degree');
        const passInput = document.getElementById('reg-password');
        const submitBtn = document.getElementById('btn-register-submit');

        const fullName = fullNameInput ? fullNameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const qualification = qualInput ? qualInput.value : '';
        const degree = degreeInput ? degreeInput.value.trim() : '';
        const password = passInput ? passInput.value : '';

        if (!fullName || !email || !password) {
          showError('Please fill in all required registration fields.');
          return;
        }

        if (password.length < 8) {
          showError('Password must contain at least 8 characters with both letters and numbers.');
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳ Pledging Allegiance...</span>';
        }

        try {
          await store.registerUser({ fullName, email, qualification, degree, password });
          OverlayManager.close('auth-modal');
          showToast(`Your oath is sworn! Welcome to the realm, ${fullName}.`, 'success');
          formRegister.reset();
        } catch (err) {
          showError(err.message || 'Registration failed. Please check your details.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });
    }

    // User Account Dropdown
    const userBtn = document.getElementById('nav-user-btn');
    const userDropdown = document.getElementById('nav-user-dropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = userDropdown.style.display === 'none' || !userDropdown.classList.contains('active');
        if (isHidden) {
          userDropdown.style.display = 'block';
          userDropdown.classList.add('active');
          userDropdown.setAttribute('aria-hidden', 'false');
          userBtn.setAttribute('aria-expanded', 'true');
        } else {
          userDropdown.style.display = 'none';
          userDropdown.classList.remove('active');
          userDropdown.setAttribute('aria-hidden', 'true');
          userBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
          userDropdown.style.display = 'none';
          userDropdown.classList.remove('active');
          userDropdown.setAttribute('aria-hidden', 'true');
          userBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Sign Out Handlers
    const signOutBtn = document.getElementById('btn-sign-out');
    const drawerSignOutBtn = document.getElementById('drawer-btn-sign-out');

    const handleSignOut = async () => {
      if (userDropdown) {
        userDropdown.style.display = 'none';
        userDropdown.classList.remove('active');
      }
      await store.logoutUser();
      showToast('You have safely departed the realm. Until next time!', 'info');
    };

    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);
    if (drawerSignOutBtn) drawerSignOutBtn.addEventListener('click', handleSignOut);
  }

  // Card Grid Drag-to-Scroll Support (Mouse + Touch)
  setupCardDragScroll() {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let activeContainer = null;

    // Mouse Drag Handling
    document.addEventListener('mousedown', (e) => {
      const container = e.target.closest('.corporate-cards-grid, .govt-cards-grid, .opportunities-grid, .saved-grid');
      if (!container) return;
      if (e.target.closest('button, a, input, select, textarea, label, [role="button"]')) return;
      if (container.scrollWidth <= container.clientWidth) return;

      isDown = true;
      activeContainer = container;
      startX = e.pageX - container.getBoundingClientRect().left;
      scrollLeft = container.scrollLeft;
      container.style.cursor = 'grab';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown || !activeContainer) return;
      e.preventDefault();
      activeContainer.style.cursor = 'grabbing';
      const x = e.pageX - activeContainer.getBoundingClientRect().left;
      const walk = (x - startX) * 1.5;
      activeContainer.scrollLeft = scrollLeft - walk;
    });

    const endMouseDrag = () => {
      if (isDown && activeContainer) {
        activeContainer.style.cursor = '';
      }
      isDown = false;
      activeContainer = null;
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };

    window.addEventListener('mouseup', endMouseDrag);
    window.addEventListener('mouseleave', endMouseDrag);

    // Touch Swipe Handling for Mobile & Touchscreens
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let touchActiveContainer = null;
    let isHorizontalGesture = false;

    document.addEventListener('touchstart', (e) => {
      const container = e.target.closest('.corporate-cards-grid, .govt-cards-grid, .opportunities-grid, .saved-grid');
      if (!container) return;
      if (e.target.closest('button, a, input, select, textarea, label, [role="button"]')) return;
      if (container.scrollWidth <= container.clientWidth) return;

      touchActiveContainer = container;
      touchStartX = e.touches[0].pageX;
      touchStartY = e.touches[0].pageY;
      touchStartScrollLeft = container.scrollLeft;
      isHorizontalGesture = false;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!touchActiveContainer) return;
      const currentX = e.touches[0].pageX;
      const currentY = e.touches[0].pageY;
      const diffX = currentX - touchStartX;
      const diffY = currentY - touchStartY;

      if (!isHorizontalGesture) {
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
          isHorizontalGesture = true;
        }
      }

      if (isHorizontalGesture) {
        touchActiveContainer.scrollLeft = touchStartScrollLeft - diffX;
      }
    }, { passive: true });

    const endTouchSwipe = () => {
      touchActiveContainer = null;
      isHorizontalGesture = false;
    };

    document.addEventListener('touchend', endTouchSwipe, { passive: true });
    document.addEventListener('touchcancel', endTouchSwipe, { passive: true });

    // Mouse Wheel / Trackpad Horizontal Scroll Support
    document.addEventListener('wheel', (e) => {
      const container = e.target.closest('.corporate-cards-grid, .govt-cards-grid, .opportunities-grid, .saved-grid');
      if (!container) return;
      if (container.scrollWidth <= container.clientWidth) return;

      // Allow native trackpad 2-finger horizontal swipe or Shift+Wheel
      if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
        return;
      }

      // Translate standard vertical wheel to horizontal container scroll
      if (e.deltaY !== 0) {
        const atLeftEdge = container.scrollLeft <= 0;
        const atRightEdge = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 1);

        if ((e.deltaY > 0 && !atRightEdge) || (e.deltaY < 0 && !atLeftEdge)) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      }
    }, { passive: false });
  }

  setupSnowfall() {
    const canvas = document.getElementById('realm-snow-canvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize, { passive: true });

    // Lightweight particle pool (50 snowflakes)
    const flakeCount = Math.min(55, Math.floor(width / 24));
    const flakes = [];
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.8,
        speedY: Math.random() * 0.7 + 0.35,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.45 + 0.25,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.swing += f.swingSpeed;
        f.y += f.speedY;
        f.x += f.speedX + Math.sin(f.swing) * 0.3;

        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) f.x = -5;
        else if (f.x < -5) f.x = width + 5;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 245, ${f.opacity})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 3;
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  }

  setupOpeningIntro() {
    const overlay = document.getElementById('realm-intro-overlay');
    if (!overlay) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('careersphere_intro_played')) {
      overlay.style.display = 'none';
      overlay.remove();
      return;
    }

    overlay.style.display = 'flex';

    let dismissed = false;
    const endIntro = () => {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.add('intro-fading');
      sessionStorage.setItem('careersphere_intro_played', 'true');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.remove();
      }, 700);
    };

    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', endIntro);
    }

    // Auto finish after 2.7s
    setTimeout(endIntro, 2700);
  }

  triggerPageTransition(renderAction) {
    const overlay = document.getElementById('realm-transition-overlay');
    if (!overlay || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderAction();
      return;
    }

    const transitions = [
      'transition-snow-mist',
      'transition-dragon-pass',
      'transition-dragon-fire',
      'transition-fog-reveal'
    ];

    const chosen = transitions[Math.floor(Math.random() * transitions.length)];
    overlay.className = `realm-transition-overlay active ${chosen}`;

    let rendered = false;
    const doRender = () => {
      if (!rendered) {
        rendered = true;
        renderAction();
      }
    };

    // Render underlying page content mid-transition
    setTimeout(doRender, 270);

    // Fade out and clean up transition overlay
    setTimeout(() => {
      overlay.className = 'realm-transition-overlay';
      overlay.style.display = 'none';
      setTimeout(() => { overlay.style.display = ''; }, 40);
    }, 660);

    // Fail-safe cleanup
    setTimeout(() => {
      doRender();
      if (overlay.classList.contains('active')) {
        overlay.className = 'realm-transition-overlay';
      }
    }, 850);
  }
}

// Bootstrap application safely
const bootstrap = () => {
  if (window.careersphereApp) return;
  const app = new App();
  app.init();
  window.careersphereApp = app;
  window.OverlayManager = OverlayManager;
  window.openModal = openModal;
  window.closeModal = closeModal;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
