/**
 * CareerSphere - Notifications & Official Recruitment Alerts View
 * Real-time alert feed for Corporate Tech Jobs, Internships, Government Recruitments,
 * Approaching Deadlines, Profile Matches, and Personalized Opportunity Preferences.
 */

import { store } from '../store.js';
import { openModal, showToast, escapeHtml, getOpportunityDeadlineStatus } from '../utils.js';

export function renderNotificationsView(container, navigateTo) {
  // Trigger background sync with backend if running
  store.syncWithBackendAPI().then(updated => {
    if (updated) renderList();
  }).catch(() => {});

  container.innerHTML = `
    <div class="view-header notifications-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Notifications</span>
        </div>
        <div class="header-action-row">
          <div>
            <div class="header-badge-tag">
              <span class="pulse-dot"></span> Real-Time Verified Recruitment Alerts
            </div>
            <h1 class="page-title">Notifications & Opportunity Alerts 🔔</h1>
            <p class="page-desc">
              Live updates on corporate hiring drives, paid internships, official Sarkari notifications, approaching application deadlines, and profile matches.
            </p>
          </div>
          <div class="header-btns" style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-outline-light" id="notif-prefs-btn" title="Customize notification preferences">
              ⚙️ Preferences
            </button>
            <button class="btn btn-primary" id="mark-all-read-btn" title="Mark all notifications as read">
              ✓ Mark All as Read
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- Search & Controls Card -->
      <div class="notif-controls-card card">
        <div class="notif-search-row">
          <div class="input-with-icon notif-search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="notif-search-input" 
              placeholder="Search by title, organization, skills, location..." 
              autocomplete="off"
            />
            <button id="notif-search-clear" class="btn-input-clear" style="display: none;" title="Clear search">&times;</button>
          </div>

          <div class="notif-filter-dropdowns">
            <!-- Source Filter -->
            <div class="filter-select-wrap">
              <label for="notif-source-filter" class="filter-mini-label">Source:</label>
              <select id="notif-source-filter" class="form-select form-select-sm">
                <option value="All">All Sources</option>
                <option value="Official">Official / Verified Portals</option>
                <option value="UPSC">UPSC Official</option>
                <option value="Amazon">Amazon Jobs</option>
                <option value="Arbeitnow">Arbeitnow</option>
                <option value="Razorpay">Razorpay</option>
                <option value="Zoho">Zoho Careers</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div class="filter-select-wrap">
              <label for="notif-status-filter" class="filter-mini-label">Status:</label>
              <select id="notif-status-filter" class="form-select form-select-sm">
                <option value="All">All Notices</option>
                <option value="unread">Unread Only (NEW)</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            <!-- Sort By -->
            <div class="filter-select-wrap">
              <label for="notif-sort-filter" class="filter-mini-label">Sort:</label>
              <select id="notif-sort-filter" class="form-select form-select-sm">
                <option value="newest">Newest First</option>
                <option value="deadline">Approaching Deadline</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 6 Main Tabs: All, Unread, Corporate, Internships, Government, Deadline Reminders -->
        <div class="category-pills-scroll notif-category-pills" id="notif-cat-pills">
          <button class="pill-btn active" data-cat="All">
            All <span class="tab-badge" id="tab-count-all">0</span>
          </button>
          <button class="pill-btn" data-cat="unread">
            🔔 Unread <span class="tab-badge text-danger font-bold" id="tab-count-unread">0</span>
          </button>
          <button class="pill-btn" data-cat="corporate">
            🏢 Corporate Jobs <span class="tab-badge" id="tab-count-corp">0</span>
          </button>
          <button class="pill-btn" data-cat="internships">
            🎓 Internships <span class="tab-badge" id="tab-count-intern">0</span>
          </button>
          <button class="pill-btn" data-cat="government">
            🏛️ Government Jobs <span class="tab-badge" id="tab-count-govt">0</span>
          </button>
          <button class="pill-btn" data-cat="deadline">
            ⏳ Deadline Reminders <span class="tab-badge text-amber font-bold" id="tab-count-deadline">0</span>
          </button>
        </div>
      </div>

      <!-- Results Meta Bar -->
      <div class="notif-meta-bar">
        <span id="notif-results-count" class="notif-results-count">Showing notifications...</span>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="btn-text-sm font-semibold text-primary" id="open-prefs-link">⚙️ Notification Preferences</button>
          <button class="btn-text" id="notif-reset-filters" style="display: none;">Clear all filters</button>
        </div>
      </div>

      <!-- Notifications List Container -->
      <div class="notifications-list-wrapper" id="notifications-list">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // DOM Elements
  const listContainer = container.querySelector('#notifications-list');
  const searchInput = container.querySelector('#notif-search-input');
  const searchClearBtn = container.querySelector('#notif-search-clear');
  const sourceFilter = container.querySelector('#notif-source-filter');
  const statusFilter = container.querySelector('#notif-status-filter');
  const sortFilter = container.querySelector('#notif-sort-filter');
  const pills = container.querySelectorAll('#notif-cat-pills .pill-btn');
  const markAllBtn = container.querySelector('#mark-all-read-btn');
  const notifPrefsBtn = container.querySelector('#notif-prefs-btn');
  const openPrefsLink = container.querySelector('#open-prefs-link');
  const resultsCount = container.querySelector('#notif-results-count');
  const resetFiltersBtn = container.querySelector('#notif-reset-filters');

  // Filter state
  let currentCategory = 'All';
  let currentSource = 'All';
  let currentStatus = 'All';
  let currentSort = 'newest';
  let currentSearch = '';

  const getTypeBadge = (item) => {
    if (item.isDeadlineReminder) {
      return `<span class="badge badge-danger">⏳ Deadline Reminder</span>`;
    }
    if (item.isNewlyEligible) {
      return `<span class="badge" style="background:#ECFDF5; color:#047857; border: 1px solid #A7F3D0; font-weight:700;">🎯 Newly Eligible</span>`;
    }
    if (item.isProfileMatch) {
      return `<span class="badge badge-purple">🎯 Profile Match</span>`;
    }
    const t = (item.type || '').toLowerCase();
    if (t === 'government') {
      return `<span class="badge badge-success">🏛️ Government</span>`;
    }
    if (t === 'internship') {
      return `<span class="badge badge-info">🎓 Internship</span>`;
    }
    return `<span class="badge badge-primary">🏢 Corporate</span>`;
  };

  const updateTabCounts = () => {
    const allItems = store.getNotifications({ applyPreferences: true });
    const countAll = allItems.length;
    const countUnread = allItems.filter(n => !n.isRead && !n.read).length;
    const countCorp = allItems.filter(n => n.type === 'corporate' || n.category === 'Corporate Jobs' || n.category === 'Private Jobs').length;
    const countIntern = allItems.filter(n => n.type === 'internship' || n.category === 'Internships').length;
    const countGovt = allItems.filter(n => n.type === 'government' || n.category === 'Government Jobs' || n.category === 'Exams' || n.category === 'Recruitment Forms').length;
    const countDeadline = allItems.filter(n => n.isDeadlineReminder || n.category === 'Deadline Reminders' || n.status === 'Closing Soon' || n.status === 'Closing Today').length;

    const elAll = container.querySelector('#tab-count-all');
    const elUnread = container.querySelector('#tab-count-unread');
    const elCorp = container.querySelector('#tab-count-corp');
    const elIntern = container.querySelector('#tab-count-intern');
    const elGovt = container.querySelector('#tab-count-govt');
    const elDeadline = container.querySelector('#tab-count-deadline');

    if (elAll) elAll.textContent = countAll;
    if (elUnread) elUnread.textContent = countUnread;
    if (elCorp) elCorp.textContent = countCorp;
    if (elIntern) elIntern.textContent = countIntern;
    if (elGovt) elGovt.textContent = countGovt;
    if (elDeadline) elDeadline.textContent = countDeadline;
  };

  const renderList = () => {
    updateTabCounts();

    const items = store.filterNotifications({
      search: currentSearch,
      category: currentCategory,
      source: currentSource,
      status: currentStatus,
      sortBy: currentSort
    });

    const unreadTotal = store.getUnreadNotificationsCount();

    // Toggle reset filters visibility
    const isFiltered = currentSearch || currentCategory !== 'All' || currentSource !== 'All' || currentStatus !== 'All' || currentSort !== 'newest';
    resetFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';
    searchClearBtn.style.display = currentSearch ? 'inline-block' : 'none';

    resultsCount.innerHTML = `Showing <strong>${items.length}</strong> ${items.length === 1 ? 'notification' : 'notifications'} ${unreadTotal > 0 ? `• <span class="text-danger font-semibold">${unreadTotal} unread</span>` : '• <span class="text-success font-semibold">All caught up</span>'}`;

    if (items.length === 0) {
      let emptyTitle = 'No notifications match the selected filter';
      let emptyMsg = 'Try switching tabs, clearing filters, or customizing your notification preferences.';
      if (currentCategory === 'unread') {
        emptyTitle = '🎉 You are all caught up!';
        emptyMsg = 'No unread notifications right now. Check back soon for new hiring drives.';
      } else if (currentCategory === 'deadline') {
        emptyTitle = '⏳ No upcoming deadline alerts';
        emptyMsg = 'Save opportunities with verified deadlines to automatically receive reminders when applications are closing.';
      } else if (currentCategory === 'corporate') {
        emptyTitle = 'No corporate tech job notifications matching this criteria';
      } else if (currentCategory === 'internships') {
        emptyTitle = 'No internship notifications matching this criteria';
      } else if (currentCategory === 'government') {
        emptyTitle = 'No government notifications matching this criteria';
      }

      listContainer.innerHTML = `
        <div class="empty-state card full-width" style="padding: 3rem 2rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 1rem;">🔔</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--navy-dark); margin-bottom: 0.5rem;">${emptyTitle}</h3>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem;">${emptyMsg}</p>
          <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-outline" id="empty-state-reset-btn">
              Show All Notifications
            </button>
            <button class="btn btn-primary" id="empty-state-prefs-btn">
              ⚙️ Customize Preferences
            </button>
          </div>
        </div>
      `;
      container.querySelector('#empty-state-reset-btn')?.addEventListener('click', resetFilters);
      container.querySelector('#empty-state-prefs-btn')?.addEventListener('click', openPreferencesModal);
      return;
    }

    listContainer.innerHTML = items.map(item => {
      const typeBadge = getTypeBadge(item);
      const isUnread = !item.isRead && !item.read;
      const dlStatus = getOpportunityDeadlineStatus(item.deadline);

      return `
        <article class="notification-card card ${isUnread ? 'is-unread' : 'is-read'}" data-id="${item.id}">
          <div class="notif-indicator-col">
            <span class="notif-dot ${isUnread ? 'unread' : 'read'}" title="${isUnread ? 'Unread notification' : 'Read notification'}"></span>
          </div>

          <div class="notif-main-col">
            <!-- Header Badges Row -->
            <div class="notif-header-row">
              <div class="notif-badges-group">
                ${isUnread ? '<span class="badge badge-rose font-bold notif-new-badge">🔔 NEW</span>' : ''}
                ${typeBadge}
                ${item.organization ? `<span class="badge-subtle font-semibold">🏢 ${escapeHtml(item.organization)}</span>` : ''}
                ${item.location && item.location !== 'Not available' ? `<span class="badge-subtle">📍 ${escapeHtml(item.location)}</span>` : ''}
                ${dlStatus.status === 'Closing Soon' ? `<span class="badge badge-danger">⏳ ${escapeHtml(dlStatus.badgeText)}</span>` : (dlStatus.status === 'Expired' ? `<span class="badge badge-neutral">⚠️ Expired</span>` : '')}
              </div>
              <span class="notif-date text-muted">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 3px;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${escapeHtml(item.notificationDate || item.date || 'Today')}
              </span>
            </div>

            <!-- Title -->
            <h3 class="notif-title">${escapeHtml(item.title)}</h3>

            <!-- Organization & Source Row -->
            <div class="notif-org-source-row" style="margin-bottom: 0.5rem; font-size: 0.85rem; display: flex; gap: 1.5rem; flex-wrap: wrap;">
              <div>
                <span class="text-muted">Authority/Company:</span>
                <strong style="color: var(--navy-dark);">${escapeHtml(item.organization || 'Verified Organization')}</strong>
              </div>
              <div>
                <span class="text-muted">Source:</span>
                ${item.sourceUrl && item.sourceUrl !== '#' ? `
                  <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary">
                    ${escapeHtml(item.sourceName || 'Official Source')} ↗
                  </a>
                  <span class="badge-source-verified" style="font-size: 0.75rem; margin-left: 4px; color: var(--color-success); font-weight: 600;">✓ Verified</span>
                ` : `
                  <span class="text-muted font-semibold">${escapeHtml(item.sourceName || 'Verified Portal')}</span>
                `}
              </div>
            </div>

            <!-- Short Description -->
            <p class="notif-desc">${escapeHtml(item.description)}</p>

            <!-- Application Dates & Specs Meta Grid -->
            <div class="notif-dates-meta">
              <div class="notif-date-item">
                <span class="notif-date-label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Application Deadline:
                </span>
                <span class="notif-date-value font-semibold ${dlStatus.status === 'Closing Soon' ? 'text-danger' : ''}">
                  ${escapeHtml(item.deadline || item.applicationLastDate || 'Not available')}
                  ${dlStatus.diffDays !== null && dlStatus.diffDays >= 0 ? ` (${dlStatus.diffDays === 0 ? 'Closes Today!' : `${dlStatus.diffDays}d remaining`})` : ''}
                </span>
              </div>

              ${item.qualification && item.qualification !== 'Not available' ? `
                <div class="notif-date-item">
                  <span class="notif-date-label">🎓 Eligibility:</span>
                  <span class="notif-date-value">${escapeHtml(item.qualification)}</span>
                </div>
              ` : ''}

              ${item.vacancies && item.vacancies !== 'Not Specified' ? `
                <div class="notif-date-item">
                  <span class="notif-date-label">👥 Vacancies:</span>
                  <span class="notif-date-value font-semibold">${escapeHtml(item.vacancies)}</span>
                </div>
              ` : ''}
            </div>

            <!-- Action Buttons Footer -->
            <div class="notif-footer-row" style="margin-top: 0.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-outline-primary btn-sm view-notif-details" data-id="${item.id}">
                  View Opportunity Details &rarr;
                </button>

                ${item.applyUrl && item.applyUrl !== '#' ? `
                  <a href="${escapeHtml(item.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm notif-apply-btn">
                    Apply on Official Portal ↗
                  </a>
                ` : ''}

                ${item.officialNotificationUrl && item.officialNotificationUrl !== '#' ? `
                  <a href="${escapeHtml(item.officialNotificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm notif-pdf-btn">
                    Official Notice ↗
                  </a>
                ` : ''}
              </div>

              <div>
                <button class="btn-text toggle-read-btn" data-id="${item.id}" style="font-size: 0.85rem;">
                  ${isUnread ? 'Mark as Read' : 'Mark as Unread'}
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachNotificationEvents(listContainer);
  };

  const attachNotificationEvents = (elem) => {
    // View details button
    elem.querySelectorAll('.view-notif-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = store.getNotifications({ applyPreferences: false }).find(n => n.id === id);
        if (!item) return;

        // Mark as read immediately on viewing
        if (!item.isRead && !item.read) {
          store.markNotificationAsRead(id);
          renderList();
        }

        const dlStatus = getOpportunityDeadlineStatus(item.deadline);

        openModal({
          title: item.title,
          size: 'large',
          contentHtml: `
            <div class="notif-modal-top">
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                ${getTypeBadge(item)}
                <span class="badge badge-success">✓ SOURCED FROM OFFICIAL PORTAL</span>
                ${dlStatus.status === 'Closing Soon' ? '<span class="badge badge-danger">⏳ Closing Soon</span>' : ''}
              </div>
              <span class="text-muted" style="font-size: 0.85rem;">Published: ${escapeHtml(item.notificationDate || 'Available Now')}</span>
            </div>

            <!-- Organization Box -->
            <div class="notif-modal-org-box" style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--electric-blue); margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Hiring Authority / Company</div>
                  <div style="font-size: 1.15rem; font-weight: 700; color: var(--navy-dark); margin-top: 0.2rem;">
                    ${escapeHtml(item.organization || 'Verified Employer')}
                  </div>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Official Source: </span>
                  ${item.sourceUrl && item.sourceUrl !== '#' ? `
                    <a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary">
                      ${escapeHtml(item.sourceName || 'Official Website')} ↗
                    </a>
                  ` : `
                    <strong class="text-muted">${escapeHtml(item.sourceName || 'Verified Portal')}</strong>
                  `}
                </div>
              </div>
            </div>

            <!-- Important Specs Grid -->
            <div class="notif-modal-specs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
              <div class="modal-spec-card" style="padding: 0.75rem; background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md);">
                <span class="spec-card-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Location</span>
                <strong style="color: var(--navy-dark); font-size: 0.95rem;">${escapeHtml(item.location || 'India')}</strong>
              </div>
              <div class="modal-spec-card" style="padding: 0.75rem; background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md);">
                <span class="spec-card-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Qualification / Criteria</span>
                <strong style="color: var(--navy-dark); font-size: 0.95rem;">${escapeHtml(item.qualification || 'Check guidelines')}</strong>
              </div>
              <div class="modal-spec-card" style="padding: 0.75rem; background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md);">
                <span class="spec-card-label" style="font-size: 0.75rem; color: var(--text-muted); display: block;">Application Deadline</span>
                <strong style="color: ${dlStatus.status === 'Closing Soon' ? 'var(--color-danger)' : 'var(--navy-dark)'}; font-size: 0.95rem;">
                  ${escapeHtml(item.deadline || item.applicationLastDate || 'Not available')}
                </strong>
              </div>
            </div>

            <!-- Full Details & Description -->
            <div class="notif-modal-body-text" style="line-height: 1.6; color: var(--text-body);">
              <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--navy-dark); font-weight: 700;">Opportunity Overview</h4>
              <p style="margin-bottom: 1rem;">${escapeHtml(item.description)}</p>
              ${item.eligibility && item.eligibility !== item.description ? `
                <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--navy-dark); font-weight: 700;">Eligibility Guidelines</h4>
                <p style="margin-bottom: 1rem;">${escapeHtml(item.eligibility)}</p>
              ` : ''}
            </div>
          `,
          footerHtml: `
            ${item.applyUrl && item.applyUrl !== '#' ? `
              <a href="${escapeHtml(item.applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" id="modal-apply-btn">
                Apply on Official Portal ↗
              </a>
            ` : ''}
            ${item.officialNotificationUrl && item.officialNotificationUrl !== '#' ? `
              <a href="${escapeHtml(item.officialNotificationUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                Official Notice Document ↗
              </a>
            ` : ''}
            <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">
              Close
            </button>
          `
        });
      });
    });

    // Toggle read/unread button
    elem.querySelectorAll('.toggle-read-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = store.getNotifications({ applyPreferences: false }).find(n => n.id === id);
        if (!item) return;

        if (item.isRead || item.read) {
          store.markNotificationAsUnread(id);
          showToast('Marked as unread', 'info', 1600);
        } else {
          store.markNotificationAsRead(id);
          showToast('Marked as read', 'success', 1600);
        }
        renderList();
      });
    });
  };

  const openPreferencesModal = () => {
    const prefs = store.getNotificationPreferences();

    openModal({
      title: '⚙️ Notification Preferences & Alert Settings',
      size: 'medium',
      contentHtml: `
        <div class="notif-prefs-modal-content" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <p style="font-size: 0.925rem; color: var(--text-muted); margin-bottom: 0.25rem;">
            Choose the specific opportunity tracks and alert types you want to receive notifications for. All changes reflect immediately in your feed.
          </p>

          <!-- Tracks Group -->
          <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <strong style="font-size: 0.95rem; color: var(--navy-dark); display: block; margin-bottom: 0.75rem;">Career Tracks & Sectors</strong>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-corp" ${prefs.corporate ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🏢 Corporate Tech Jobs</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-intern" ${prefs.internships ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🎓 Internships & Trainees</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-govt" ${prefs.government ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🏛️ Government Recruitments</span>
              </label>
            </div>
          </div>

          <!-- Alert Types Group -->
          <div style="background: var(--bg-main); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <strong style="font-size: 0.95rem; color: var(--navy-dark); display: block; margin-bottom: 0.75rem;">Smart Alerts & Reminders</strong>
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-deadline" ${prefs.deadline_reminders ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>⏳ <strong>Approaching Deadline Reminders</strong> (Notifies when saved deadlines are within 7 days)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-match" ${prefs.profile_matches ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🎯 <strong>Profile & Eligibility Matches</strong> (Matches your qualifications and skills)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-freshers" ${prefs.freshers ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🌱 <strong>Fresher-Friendly Opportunities</strong></span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-bca" ${prefs.bca_it ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>💻 <strong>BCA / CS / IT Specific Hiring</strong></span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer;">
                <input type="checkbox" id="pref-remote" ${prefs.remote ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <span>🌐 <strong>Remote / Work From Home Openings</strong></span>
              </label>
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-primary" id="save-notif-prefs-btn">
          Save Preferences
        </button>
        <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">
          Cancel
        </button>
      `
    });

    document.getElementById('save-notif-prefs-btn')?.addEventListener('click', () => {
      const updatedPrefs = {
        corporate: document.getElementById('pref-corp')?.checked ?? true,
        internships: document.getElementById('pref-intern')?.checked ?? true,
        government: document.getElementById('pref-govt')?.checked ?? true,
        deadline_reminders: document.getElementById('pref-deadline')?.checked ?? true,
        profile_matches: document.getElementById('pref-match')?.checked ?? true,
        freshers: document.getElementById('pref-freshers')?.checked ?? true,
        bca_it: document.getElementById('pref-bca')?.checked ?? true,
        remote: document.getElementById('pref-remote')?.checked ?? true
      };

      store.saveNotificationPreferences(updatedPrefs);
      window.CareerSphereModalClose();
      showToast('Notification preferences updated!', 'success', 2000);
      renderList();
    });
  };

  const resetFilters = () => {
    currentCategory = 'All';
    currentSource = 'All';
    currentStatus = 'All';
    currentSort = 'newest';
    currentSearch = '';

    searchInput.value = '';
    sourceFilter.value = 'All';
    statusFilter.value = 'All';
    sortFilter.value = 'newest';

    pills.forEach(p => {
      p.classList.toggle('active', p.dataset.cat === 'All');
    });

    renderList();
  };

  // Search input handler
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderList();
  });

  searchClearBtn.addEventListener('click', () => {
    currentSearch = '';
    searchInput.value = '';
    searchInput.focus();
    renderList();
  });

  // Source filter handler
  sourceFilter.addEventListener('change', (e) => {
    currentSource = e.target.value;
    renderList();
  });

  // Status filter handler
  statusFilter.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    renderList();
  });

  // Sort filter handler
  sortFilter.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderList();
  });

  // Category pills handler (6 main tabs)
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.cat;
      renderList();
    });
  });

  // Mark all as read button
  markAllBtn.addEventListener('click', () => {
    store.markAllNotificationsAsRead();
    showToast('All notifications marked as read!', 'success');
    renderList();
  });

  // Preferences modal buttons
  notifPrefsBtn.addEventListener('click', openPreferencesModal);
  openPrefsLink.addEventListener('click', openPreferencesModal);

  // Reset filters button
  resetFiltersBtn.addEventListener('click', resetFilters);

  // Subscribe to store state updates
  store.subscribe((event) => {
    if (event === 'notifications_changed' || event === 'saved_changed' || event === 'notification_prefs_changed') {
      renderList();
    }
  });

  // Initial render
  renderList();
}
