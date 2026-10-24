/**
 * CareerSphere - Saved Opportunities View
 * Bookmarked corporate jobs, internships, and government recruitments with
 * multi-track categorization, live search, deadline status tracking, and details modals.
 */

import { store } from '../store.js';
import { formatDate, getOpportunityDeadlineStatus, openModal, showToast, escapeHtml } from '../utils.js';

export function renderSavedView(container, navigateTo) {
  let currentCategory = 'all';
  let searchQuery = '';
  let statusFilter = 'all';
  let sortOrder = 'newest';

  container.innerHTML = `
    <div class="view-header saved-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Saved Opportunities</span>
        </div>
        <div class="header-action-row">
          <div>
            <div class="header-badge-tag">
              <span class="pulse-dot"></span> Bookmarked Tracker
            </div>
            <h1 class="page-title">Saved Opportunities & Deadlines ⭐</h1>
            <p class="page-desc">
              Track your bookmarked corporate vacancies, internships, and government exam dates in one centralized workspace.
            </p>
          </div>
          <span class="saved-total-badge" id="saved-total-badge">
            <span id="saved-badge-count">0</span> Items Saved
          </span>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- 4 Category Tabs -->
      <div class="filter-tabs" id="saved-category-tabs" style="margin-bottom: 1rem; flex-wrap: wrap;">
        <button class="tab-btn active" data-category="all">
          All Bookmarks (<span id="count-tab-all">0</span>)
        </button>
        <button class="tab-btn" data-category="corporate">
          🏢 Corporate Jobs (<span id="count-tab-corp">0</span>)
        </button>
        <button class="tab-btn" data-category="internship">
          🎓 Internships (<span id="count-tab-intern">0</span>)
        </button>
        <button class="tab-btn" data-category="government">
          🏛️ Government Jobs (<span id="count-tab-govt">0</span>)
        </button>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="saved-toolbar">
        <div class="saved-toolbar-search">
          <input 
            type="text" 
            id="saved-search-input" 
            class="form-control" 
            placeholder="🔍 Search saved by title, company, location, or source..." 
          />
        </div>
        <div class="saved-toolbar-filters">
          <select id="saved-status-filter" class="form-select" style="min-width: 160px;">
            <option value="all">All Statuses</option>
            <option value="active">Active Deadlines</option>
            <option value="closing_soon">Closing Soon (&le; 5 days)</option>
            <option value="expired">Expired</option>
            <option value="not_available">Deadline: Not Available</option>
          </select>
          <select id="saved-sort-filter" class="form-select" style="min-width: 170px;">
            <option value="newest">Saved: Newest First</option>
            <option value="oldest">Saved: Oldest First</option>
            <option value="deadline">Deadline: Closest First</option>
            <option value="alpha">Company: A to Z</option>
          </select>
        </div>
      </div>

      <!-- Saved Opportunities Cards Grid -->
      <div class="saved-grid" id="saved-cards-container">
        <!-- Injected dynamically -->
      </div>
    </div>
  `;

  const tabsContainer = container.querySelector('#saved-category-tabs');
  const cardsContainer = container.querySelector('#saved-cards-container');
  const badgeCount = container.querySelector('#saved-badge-count');
  const searchInput = container.querySelector('#saved-search-input');
  const statusSelect = container.querySelector('#saved-status-filter');
  const sortSelect = container.querySelector('#saved-sort-filter');

  const countTabAll = container.querySelector('#count-tab-all');
  const countTabCorp = container.querySelector('#count-tab-corp');
  const countTabIntern = container.querySelector('#count-tab-intern');
  const countTabGovt = container.querySelector('#count-tab-govt');

  const renderSavedList = () => {
    const allItems = store.getSavedItems();

    // Compute dynamic category counts
    const corpCount = allItems.filter(i => i.type === 'corporate').length;
    const internCount = allItems.filter(i => i.type === 'internship').length;
    const govtCount = allItems.filter(i => i.type === 'government').length;

    if (badgeCount) badgeCount.textContent = allItems.length;
    if (countTabAll) countTabAll.textContent = allItems.length;
    if (countTabCorp) countTabCorp.textContent = corpCount;
    if (countTabIntern) countTabIntern.textContent = internCount;
    if (countTabGovt) countTabGovt.textContent = govtCount;

    // 1. Filter by Category
    let filtered = allItems;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(i => i.type === currentCategory);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(i => {
        const title = (i.title || i.postName || '').toLowerCase();
        const org = (i.organization || i.company || '').toLowerCase();
        const loc = (i.location || '').toLowerCase();
        const cat = (i.category || '').toLowerCase();
        const src = (i.sourceName || '').toLowerCase();
        return title.includes(q) || org.includes(q) || loc.includes(q) || cat.includes(q) || src.includes(q);
      });
    }

    // 3. Filter by Deadline Status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => {
        const dStatus = getOpportunityDeadlineStatus(i.deadline);
        if (statusFilter === 'active') return dStatus.status === 'Active';
        if (statusFilter === 'closing_soon') return dStatus.status === 'Closing Soon';
        if (statusFilter === 'expired') return dStatus.status === 'Expired';
        if (statusFilter === 'not_available') return dStatus.status === 'Not Available';
        return true;
      });
    }

    // 4. Sort Items
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.savedAt || 0) - new Date(a.savedAt || 0);
      }
      if (sortOrder === 'oldest') {
        return new Date(a.savedAt || 0) - new Date(b.savedAt || 0);
      }
      if (sortOrder === 'deadline') {
        const da = getOpportunityDeadlineStatus(a.deadline).diffDays ?? 9999;
        const db = getOpportunityDeadlineStatus(b.deadline).diffDays ?? 9999;
        return da - db;
      }
      if (sortOrder === 'alpha') {
        const nameA = (a.organization || a.company || a.title || '').toLowerCase();
        const nameB = (b.organization || b.company || b.title || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    // Handle Empty State
    if (filtered.length === 0) {
      let emptyMsg = 'No saved opportunities found.';
      let emptyHint = 'Bookmark corporate jobs, internships, and government recruitments to track them here.';

      if (allItems.length > 0) {
        emptyMsg = 'No matches found for your active filters.';
        emptyHint = 'Try adjusting your search keywords, status filter, or switching category tabs.';
      } else if (currentCategory === 'corporate') {
        emptyMsg = 'No saved Corporate Jobs.';
        emptyHint = 'Browse verified openings from Amazon, TCS, Infosys, and more.';
      } else if (currentCategory === 'internship') {
        emptyMsg = 'No saved Internships.';
        emptyHint = 'Browse active software, analyst, and cloud student internships.';
      } else if (currentCategory === 'government') {
        emptyMsg = 'No saved Government Jobs.';
        emptyHint = 'Browse official recruitment announcements from UPSC and central portals.';
      }

      cardsContainer.innerHTML = `
        <div class="empty-state card full-width" style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 0.75rem;">⭐</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${emptyMsg}</h3>
          <p class="text-muted" style="max-width: 480px; margin: 0 auto 1.5rem auto;">${emptyHint}</p>
          <div class="empty-action-btns" style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="explore-corp-btn">Explore Corporate Jobs</button>
            <button class="btn btn-outline" id="explore-intern-btn">Explore Internships</button>
            <button class="btn btn-outline" id="explore-govt-btn">View Govt Recruitments</button>
          </div>
        </div>
      `;

      cardsContainer.querySelector('#explore-corp-btn')?.addEventListener('click', () => {
        if (typeof navigateTo === 'function') navigateTo('corporate');
        else window.location.hash = '#corporate';
      });
      cardsContainer.querySelector('#explore-intern-btn')?.addEventListener('click', () => {
        if (typeof navigateTo === 'function') navigateTo('internships');
        else window.location.hash = '#internships';
      });
      cardsContainer.querySelector('#explore-govt-btn')?.addEventListener('click', () => {
        if (typeof navigateTo === 'function') navigateTo('government');
        else window.location.hash = '#government';
      });
      return;
    }

    // Render Cards
    cardsContainer.innerHTML = filtered.map(item => {
      const isGovt = item.type === 'government';
      const isIntern = item.type === 'internship';
      const oppType = isGovt ? 'government' : (isIntern ? 'internship' : 'corporate');

      const title = escapeHtml(item.title || item.postName || item.jobTitle || 'Opportunity');
      const org = escapeHtml(item.organization || item.company || 'Organization');
      const location = escapeHtml(item.location || 'Pan India');
      const sourceName = escapeHtml(item.sourceName || (isGovt ? 'UPSC Official Portal' : 'Verified Portal'));
      const rawDeadline = item.deadline;
      const dStatus = getOpportunityDeadlineStatus(rawDeadline);
      const formattedDeadline = formatDate(rawDeadline);

      let icon = '🏢';
      let typeLabel = 'Corporate Jobs';
      let typeBadgeClass = 'saved-type-badge-corporate';

      if (isGovt) {
        icon = '🏛️';
        typeLabel = 'Government Jobs';
        typeBadgeClass = 'saved-type-badge-government';
      } else if (isIntern) {
        icon = '🎓';
        typeLabel = 'Internships';
        typeBadgeClass = 'saved-type-badge-internship';
      }

      const applyUrl = item.applyUrl && item.applyUrl !== '#' ? escapeHtml(item.applyUrl) : '#';
      const savedDateFormatted = item.savedAt ? formatDate(item.savedAt) : 'Recently';

      return `
        <div class="opp-card ${isGovt ? 'govt-card-theme' : (isIntern ? 'intern-card-theme' : 'corp-card-theme')} card" data-id="${escapeHtml(item.id)}">
          <div class="opp-card-header">
            <div class="org-avatar ${isGovt ? 'govt-avatar' : (isIntern ? 'intern-avatar' : 'corp-avatar')}">
              ${icon}
            </div>
            <div class="opp-card-titles">
              <div class="badge-wrapper">
                <span class="badge ${typeBadgeClass}">${typeLabel}</span>
                <span class="badge ${dStatus.colorClass}">${dStatus.badgeText}</span>
              </div>
              <h3 class="opp-title">${title}</h3>
              <p class="opp-org">${org}</p>
            </div>
          </div>

          <!-- If Expired, Show Notice Banner according to Rule 9 -->
          ${dStatus.status === 'Expired' ? `
            <div style="background: #FEF2F2; border-left: 3px solid #EF4444; padding: 0.45rem 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.82rem; color: #991B1B;">
              <strong>Application Expired</strong> &mdash; The deadline has passed. This item is preserved in your bookmarks for reference.
            </div>
          ` : ''}

          <div class="opp-details-grid" style="margin: 0.75rem 0;">
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${location}</span>
            </div>
            ${item.salary ? `
              <div class="detail-row">
                <span class="detail-label">${isGovt ? '💰 Pay Scale:' : (isIntern ? '💰 Stipend:' : '💰 CTC / Package:')}</span>
                <span class="detail-value text-success font-bold">${escapeHtml(item.salary)}</span>
              </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">📅 Deadline:</span>
              <span class="detail-value ${dStatus.status === 'Expired' ? 'text-danger font-bold' : (dStatus.status === 'Closing Soon' ? 'text-warning font-semibold' : '')}">${formattedDeadline}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📡 Source:</span>
              <span class="detail-value text-clamp-1" title="${sourceName}">${sourceName}</span>
            </div>
          </div>

          <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 1rem;">
            ⏱️ <em>Saved on ${savedDateFormatted}</em>
          </div>

          <div class="opp-card-actions">
            <button class="btn btn-outline view-saved-details" data-id="${escapeHtml(item.id)}" data-type="${oppType}">
              View Details
            </button>
            <a 
              href="${applyUrl}" 
              ${applyUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} 
              class="btn btn-primary apply-saved-btn"
              title="Open verified source link"
            >
              Apply on Source &nearr;
            </a>
            <button class="btn btn-text text-danger remove-saved-btn" data-id="${escapeHtml(item.id)}" title="Remove from bookmarks">
              🗑️ Remove
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachSavedCardEvents(cardsContainer);
  };

  const attachSavedCardEvents = (elem) => {
    // 1. Remove bookmark
    elem.querySelectorAll('.remove-saved-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        store.removeSaved(id);
        showToast('Removed from saved opportunities', 'info');
        renderSavedList();
      });
    });

    // 2. View Details Modal
    elem.querySelectorAll('.view-saved-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;
        const fullItem = store.getOpportunityById(id) || store.getSavedItems().find(s => s.id === id);
        if (!fullItem) return;

        const isGovt = type === 'government' || Boolean(fullItem.postName);
        const isIntern = type === 'internship' || Boolean(fullItem.isInternship);
        const rawDeadline = fullItem.deadline || fullItem.lastDate;
        const dStatus = getOpportunityDeadlineStatus(rawDeadline);
        const formattedDeadline = formatDate(rawDeadline);
        const applyUrl = fullItem.applyUrl || fullItem.apply_url || fullItem.applicationUrl || fullItem.officialNotificationUrl || fullItem.officialPdfUrl || '#';
        const sourceName = fullItem.sourceName || (isGovt ? 'Union Public Service Commission (UPSC)' : 'Verified Careers Portal');

        openModal({
          title: fullItem.title || fullItem.postName || 'Opportunity Details',
          size: 'large',
          contentHtml: `
            <div class="modal-job-header">
              <div class="modal-org-box">
                <span class="modal-org-logo">${isGovt ? '🏛️' : (isIntern ? '🎓' : (fullItem.logo || '🏢'))}</span>
                <div>
                  <h4>${escapeHtml(fullItem.company || fullItem.organization || 'Organization')}</h4>
                  <p class="text-muted">
                    Category: ${escapeHtml(fullItem.category || (isGovt ? 'Government Jobs' : (isIntern ? 'Internships' : 'Corporate Jobs')))}
                    • Location: ${escapeHtml(fullItem.location || 'Pan India')}
                  </p>
                  <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.25rem;">
                    📡 Official Source: <strong>${escapeHtml(sourceName)}</strong>
                  </p>
                </div>
              </div>
            </div>

            <!-- Status Banner in Modal -->
            <div style="display:flex; align-items:center; gap:0.5rem; margin:1rem 0;">
              <span class="badge ${dStatus.colorClass}" style="font-size:0.85rem; padding:0.4rem 0.8rem;">
                ${dStatus.badgeText}
              </span>
              ${dStatus.status === 'Expired' ? `
                <span class="text-danger font-semibold" style="font-size:0.85rem;">
                  (Notice: This application deadline has closed)
                </span>
              ` : ''}
            </div>

            <p style="line-height:1.6; color:var(--navy-dark);">${escapeHtml(fullItem.description || 'Verified recruitment notification from official source.')}</p>

            <div class="modal-meta-grid" style="margin-top: 1rem;">
              <div class="meta-card"><strong>Location:</strong> ${escapeHtml(fullItem.location || 'Pan India')}</div>
              <div class="meta-card"><strong>${isGovt ? 'Pay Scale:' : (isIntern ? 'Stipend:' : 'CTC / Package:')}</strong> <span class="text-success font-bold">${escapeHtml(fullItem.salary || fullItem.salaryPayScale || fullItem.stipend || 'Best in Industry')}</span></div>
              <div class="meta-card"><strong>Application Deadline:</strong> <span class="${dStatus.status === 'Expired' ? 'text-danger font-bold' : ''}">${formattedDeadline}</span></div>
              <div class="meta-card"><strong>Eligibility:</strong> ${escapeHtml(fullItem.qualificationDetail || fullItem.qualification || fullItem.eligibility || 'Check official portal')}</div>
            </div>
          `,
          footerHtml: `
            ${fullItem.officialPdfUrl ? `
              <a href="${escapeHtml(fullItem.officialPdfUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                Official PDF &nearr;
              </a>
            ` : ''}
            ${applyUrl !== '#' ? `
              <a href="${escapeHtml(applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                Open Official Portal &nearr;
              </a>
            ` : ''}
            <button class="btn btn-outline modal-remove-bookmark-btn" data-id="${escapeHtml(fullItem.id)}">
              🗑️ Remove Bookmark
            </button>
            <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">
              Close
            </button>
          `
        });

        // Listen for remove click inside modal
        document.querySelector('.modal-remove-bookmark-btn')?.addEventListener('click', (e) => {
          const remId = e.target.dataset.id;
          store.removeSaved(remId);
          window.CareerSphereModalClose();
          showToast('Removed from saved opportunities', 'info');
          renderSavedList();
        });
      });
    });
  };

  // Category Tabs Click
  tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderSavedList();
    });
  });

  // Search input live filtering
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderSavedList();
  });

  // Status select filtering
  statusSelect.addEventListener('change', () => {
    statusFilter = statusSelect.value;
    renderSavedList();
  });

  // Sort select
  sortSelect.addEventListener('change', () => {
    sortOrder = sortSelect.value;
    renderSavedList();
  });

  // Subscribe to store changes to auto-update
  const unsubscribe = store.subscribe((event) => {
    if (event === 'saved_changed' && document.body.contains(container)) {
      renderSavedList();
    }
  });

  // Initial render
  renderSavedList();
}
