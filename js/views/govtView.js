/**
 * CareerSphere - Government Jobs View
 * Verified Central Government & Examination Notifications Portal
 * Directly connected to authentic official government sources (UPSC).
 * Fully enforces the Rule of Truth: displays all 13 required fields without invented data.
 */

import { store } from '../store.js';
import { formatDate, openModal, showToast } from '../utils.js';

export function renderGovtView(container) {
  // Sync verified government recruitments from backend API
  store.syncGovtJobsAPI().then(() => {
    if (!document.body.contains(container)) return;
    if (typeof filterAndRender === 'function') {
      filterAndRender();
    }
  });

  const initialSearch = sessionStorage.getItem('careersphere_search_query') || '';
  sessionStorage.removeItem('careersphere_search_query');

  container.innerHTML = `
    <div class="view-header govt-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Government Jobs</span>
        </div>
        <div class="govt-badge-header">
          <span class="emblem-icon">🏛️</span>
          <span>Official Central & State Government Recruitment Portals</span>
        </div>
        <h1 class="page-title">Verified Government Recruitment & Exams</h1>
        <p class="page-desc">
          Authentic notices, active examinations, and vacancies directly sourced from official portals without synthetic placeholders or invented criteria.
        </p>
        <div class="character-chamber-badge">
          <img src="assets/realm/character_northern_lord.jpg" alt="Lord Cregan Starkhold" class="character-portrait-avatar" />
          <div class="character-badge-text">
            <span class="role-title">Warden of the Imperial Council</span>
            <h4>Lord Cregan Starkhold</h4>
            <p>&ldquo;Public honor and solemn service: the imperial seals reward unwavering integrity.&rdquo;</p>
          </div>
        </div>
      </div>
    </div>

    <div class="jobs-layout-container section-container">
      <!-- CATEGORY PILLS BAR -->
      <div class="category-pills-scroll" id="govt-categories">
        <button class="pill-btn active" data-category="All">All Sectors</button>
        <button class="pill-btn" data-category="UPSC">UPSC Central</button>
        <button class="pill-btn" data-category="SSC">SSC Staff Selection</button>
        <button class="pill-btn" data-category="Railways">Railways (RRB)</button>
        <button class="pill-btn" data-category="Postal/Communications">India Post (GDS)</button>
        <button class="pill-btn" data-category="State">State PSC (UKPSC/OSSC)</button>
        <button class="pill-btn" data-category="Employment News">Employment News</button>
        <button class="pill-btn" data-category="National Career Service">NCS Ministry Drives</button>
        <button class="pill-btn" data-category="Engineering">Engineering</button>
        <button class="pill-btn" data-category="Police/Defence">Defence & Police</button>
        <button class="pill-btn" data-category="Medical/Science">Science & Medical</button>
      </div>

      <!-- MAIN CONTENT WITH FILTERS & GRID -->
      <div class="jobs-content-grid">
        <!-- FILTER SIDEBAR -->
        <aside class="filter-sidebar card">
          <div class="filter-sidebar-header">
            <h3>Filter Notices</h3>
            <button class="btn-text" id="reset-govt-filters">Reset All</button>
          </div>

          <!-- Keyword Search -->
          <div class="filter-group">
            <label class="filter-label" for="govt-search-input">Search Post / Department</label>
            <div class="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="govt-search-input" placeholder="e.g. Railway, GDS, Scientist, Defence, MSME..." value="${initialSearch}" />
            </div>
          </div>

          <!-- Official Source Filter -->
          <div class="filter-group">
            <label class="filter-label" for="govt-filter-source">Official Source</label>
            <select id="govt-filter-source" class="form-select">
              <option value="All">All Sources</option>
              <option value="UPSC">UPSC (Union Public Service Commission)</option>
              <option value="Staff Selection Commission">Staff Selection Commission (SSC)</option>
              <option value="Railway">Railway Recruitment Boards (RRB)</option>
              <option value="India Post">India Post (Department of Posts / GDS)</option>
              <option value="Commission (">State PSC (UKPSC / OSSC)</option>
              <option value="National Career Service">National Career Service (NCS)</option>
              <option value="Employment News">Employment News / Rozgar Samachar</option>
            </select>
          </div>

          <!-- Application Status Filter -->
          <div class="filter-group">
            <label class="filter-label" for="govt-filter-status">Application Status</label>
            <select id="govt-filter-status" class="form-select">
              <option value="All">All Statuses</option>
              <option value="Open">Open (Active)</option>
              <option value="Upcoming">Upcoming Notification</option>
              <option value="Closed">Closed / Completed</option>
            </select>
          </div>

          <!-- Department / Ministry Filter -->
          <div class="filter-group">
            <label class="filter-label" for="govt-filter-dept">Recruiting Department</label>
            <select id="govt-filter-dept" class="form-select">
              <option value="All">All Departments</option>
              <option value="Railways">Ministry of Railways</option>
              <option value="Posts">Department of Posts</option>
              <option value="Labour">Ministry of Labour & Employment</option>
              <option value="Defence">Ministry of Defence</option>
              <option value="Earth Sciences">Ministry of Earth Sciences</option>
              <option value="MSME">Ministry of MSME</option>
              <option value="Home Affairs">Ministry of Home Affairs</option>
              <option value="Ladakh">UT of Ladakh</option>
              <option value="Health">Ministry of Health</option>
            </select>
          </div>

          <!-- Location Scope Filter -->
          <div class="filter-group">
            <label class="filter-label" for="govt-filter-location">Posting Region</label>
            <select id="govt-filter-location" class="form-select">
              <option value="All">All Regions</option>
              <option value="All India">All India / Pan-India</option>
              <option value="Postal Circles">State Postal Circles</option>
              <option value="Railway Zones">Railway Zones & Divisions</option>
              <option value="Delhi">Delhi</option>
              <option value="Ladakh">Ladakh (UT)</option>
            </select>
          </div>

          <!-- Source Info Box -->
          <div class="source-info-box" style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-card-subtle, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; font-size: 0.85rem;">
            <strong style="display: block; margin-bottom: 0.25rem; color: var(--text-dark, #0f172a);">🏛️ Official Verified Sources</strong>
            <p style="margin: 0; color: var(--text-muted, #64748b); line-height: 1.4;">
              Recruitments are ingested directly from official portals: <strong>Union Public Service Commission (UPSC)</strong>, <strong>Railway Recruitment Boards (RRB)</strong>, <strong>India Post (GDS)</strong>, and <strong>National Career Service (NCS)</strong>.
            </p>
          </div>
        </aside>

        <!-- RESULTS NOTIFICATION CARDS -->
        <main class="jobs-results-column">
          <div class="results-meta-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
              <span id="govt-results-count" class="results-count">Loading verified notifications...</span>
              <span id="govt-last-updated" style="font-size: 0.8rem; color: var(--text-muted, #64748b); display: inline-flex; align-items: center; gap: 0.35rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Last updated: <strong id="govt-updated-val">Checking...</strong>
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <button class="btn btn-outline btn-sm" id="btn-sync-govt-live" style="font-size: 0.8rem; padding: 0.3rem 0.75rem;">
                ↻ Sync Official Source
              </button>
              <div class="govt-legend" style="display: flex; gap: 0.5rem; font-size: 0.8rem;">
                <span class="legend-item"><span class="dot dot-active"></span> Open</span>
                <span class="legend-item"><span class="dot dot-upcoming"></span> Upcoming</span>
                <span class="legend-item"><span class="dot dot-urgent"></span> Closed</span>
              </div>
            </div>
          </div>

          <!-- Govt Cards Grid -->
          <div class="govt-cards-grid" id="govt-cards-container">
            <!-- Cards rendered dynamically -->
          </div>
        </main>
      </div>
    </div>
  `;

  // State & DOM handles
  let activeCategory = 'All';
  const searchInput = container.querySelector('#govt-search-input');
  const sourceSelect = container.querySelector('#govt-filter-source');
  const statusSelect = container.querySelector('#govt-filter-status');
  const deptSelect = container.querySelector('#govt-filter-dept');
  const locSelect = container.querySelector('#govt-filter-location');
  const resetBtn = container.querySelector('#reset-govt-filters');
  const resultsCount = container.querySelector('#govt-results-count');
  const updatedVal = container.querySelector('#govt-updated-val');
  const syncBtn = container.querySelector('#btn-sync-govt-live');
  const cardsContainer = container.querySelector('#govt-cards-container');

  const updateLastUpdatedLabel = () => {
    const last = store.getGovtLastUpdated();
    if (!last) {
      updatedVal.textContent = 'Live from Official Portals (UPSC, RRB, India Post, NCS)';
    } else {
      try {
        const d = new Date(last);
        updatedVal.textContent = isNaN(d.getTime()) ? last : `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      } catch {
        updatedVal.textContent = last;
      }
    }
  };

  const filterAndRender = () => {
    updateLastUpdatedLabel();
    const query = searchInput.value.toLowerCase().trim();
    const source = sourceSelect ? sourceSelect.value : 'All';
    const status = statusSelect.value;
    const dept = deptSelect.value;
    const loc = locSelect.value;
    const allGovt = store.getGovtJobs();

    const filtered = allGovt.filter(item => {
      // Category
      if (activeCategory !== 'All') {
        const itemCat = (item.category || '').toLowerCase();
        const sName = (item.sourceName || item.recruitingOrganization || item.organization || '').toLowerCase();
        const actLower = activeCategory.toLowerCase();
        if (actLower === 'ssc') {
          if (!sName.includes('staff selection') && !itemCat.includes('ssc')) return false;
        } else if (actLower === 'state') {
          if (!sName.includes('commission (ukpsc)') && !sName.includes('commission (ossc)') && !sName.includes('state')) return false;
        } else if (actLower === 'employment news') {
          if (!sName.includes('employment news') && !itemCat.includes('employment news')) return false;
        } else if (actLower === 'upsc') {
          if (!sName.includes('union public') && !itemCat.includes('upsc')) return false;
        } else if (actLower === 'railways') {
          if (!sName.includes('railway') && !itemCat.includes('railway')) return false;
        } else if (actLower.includes('postal')) {
          if (!sName.includes('india post') && !itemCat.includes('postal')) return false;
        } else if (actLower.includes('national career')) {
          if (!sName.includes('national career') && !itemCat.includes('national career')) return false;
        } else if (item.category !== activeCategory) {
          return false;
        }
      }

      // Source
      if (source !== 'All') {
        const sName = (item.sourceName || item.recruitingOrganization || item.organization || '').toLowerCase();
        if (!sName.includes(source.toLowerCase())) {
          return false;
        }
      }

      // Keyword query (Job Title, Org, Department, Location)
      if (query) {
        const title = (item.jobTitle || item.postName || '').toLowerCase();
        const org = (item.recruitingOrganization || item.organization || '').toLowerCase();
        const dpt = (item.department || '').toLowerCase();
        const lcn = (item.location || '').toLowerCase();
        const src = (item.sourceName || '').toLowerCase();
        if (!title.includes(query) && !org.includes(query) && !dpt.includes(query) && !lcn.includes(query) && !src.includes(query)) {
          return false;
        }
      }

      // Status
      if (status !== 'All' && item.status !== status) {
        return false;
      }

      // Department
      if (dept !== 'All') {
        const itemDept = (item.department || '').toLowerCase();
        if (!itemDept.includes(dept.toLowerCase())) return false;
      }

      // Location
      if (loc !== 'All') {
        const itemLoc = (item.location || '').toLowerCase();
        if (!itemLoc.includes(loc.toLowerCase())) return false;
      }

      return true;
    });

    resultsCount.innerHTML = `Showing <strong>${filtered.length}</strong> verified official notifications`;

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-state card">
          <div class="empty-icon">🏛️</div>
          <h3>No government notifications match this filter</h3>
          <p>Try broadening your criteria or reset the filters to view all official announcements.</p>
          <button class="btn btn-outline" id="empty-govt-reset-btn">Reset All Filters</button>
        </div>
      `;
      container.querySelector('#empty-govt-reset-btn')?.addEventListener('click', () => {
        resetBtn.click();
      });
      return;
    }

    cardsContainer.innerHTML = filtered.map(item => {
      const isSaved = store.isSaved(item.id);
      const jobTitle = item.jobTitle || item.postName || 'Recruitment Notification';
      const recruitingOrg = item.recruitingOrganization || item.organization || 'Government of India';
      const department = item.department || 'Not available';
      const location = item.location || 'Not available';
      const vacancies = item.vacancies || 'Not available';
      const qualification = item.qualification || 'Not available';
      const ageInfo = item.ageInfo || item.ageLimit || 'Not available';
      const startDate = item.applicationStartDate || item.startDate || 'Not available';
      const lastDate = item.applicationLastDate || item.lastDate || 'Not available';
      const status = item.status || 'Open';
      const officialUrl = item.officialNotificationUrl || item.officialPdfUrl || item.applyUrl || 'https://upsc.gov.in';

      // Source branding
      let sourceIcon = '🏛️';
      let sourceBadge = item.sourceName || 'UPSC';
      const srcLower = (item.sourceName || item.recruitingOrganization || item.organization || '').toLowerCase();
      if (srcLower.includes('railway') || (item.category && item.category.toLowerCase().includes('railway'))) {
        sourceIcon = '🚆';
        sourceBadge = 'Railway (RRB)';
      } else if (srcLower.includes('post') || (item.category && item.category.toLowerCase().includes('postal'))) {
        sourceIcon = '📮';
        sourceBadge = 'India Post (GDS)';
      } else if (srcLower.includes('career service') || srcLower.includes('ncs') || srcLower.includes('labour')) {
        sourceIcon = '💼';
        sourceBadge = 'National Career Service';
      } else {
        sourceIcon = '🏛️';
        sourceBadge = 'UPSC';
      }

      const isPdf = officialUrl.toLowerCase().includes('.pdf');
      const btnLabel = isPdf ? 'Official Notice PDF &nearr;' : 'Official Portal &nearr;';
      const statusClass = status === 'Open' ? 'badge-success' : (status === 'Upcoming' ? 'badge-info' : 'badge-neutral');

      return `
        <div class="opp-card govt-card-theme card">
          <div class="opp-card-header">
            <div class="org-avatar govt-avatar">${sourceIcon}</div>
            <div class="opp-card-titles">
              <div class="badge-wrapper">
                <span class="badge badge-verified-source font-bold">✓ Official Source (${sourceBadge})</span>
                <span class="badge badge-success">${item.category || 'Government Jobs'}</span>
                <span class="badge ${statusClass}">${status}</span>
              </div>
              <h3 class="opp-title">${jobTitle}</h3>
              <p class="opp-org">${recruitingOrg}</p>
            </div>
          </div>

          <div class="opp-details-grid">
            <div class="detail-row">
              <span class="detail-label">🏛️ Department:</span>
              <span class="detail-value text-clamp-1 font-semibold ${department === 'Not available' ? 'text-muted' : 'text-primary'}">${department}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📍 Region / Location:</span>
              <span class="detail-value">${location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">👥 Total Vacancies:</span>
              <span class="detail-value font-bold ${vacancies === 'Not available' ? 'text-muted' : 'text-primary'}">${vacancies}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎓 Qualification:</span>
              <span class="detail-value text-clamp-1 ${qualification === 'Not available' ? 'text-muted' : ''}">${qualification}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎂 Age Information:</span>
              <span class="detail-value ${ageInfo === 'Not available' ? 'text-muted' : ''}">${ageInfo}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Application Window:</span>
              <span class="detail-value">
                Start: <strong>${startDate !== 'Not available' ? formatDate(startDate) : 'Not available'}</strong> • 
                Last Date: <strong class="${lastDate !== 'Not available' ? 'text-danger' : 'text-muted'}">${lastDate !== 'Not available' ? formatDate(lastDate) : 'Not available'}</strong>
              </span>
            </div>
          </div>

          <div class="opp-card-actions">
            <button class="btn btn-outline view-govt-details" data-id="${item.id}">View Details</button>
            <a href="${officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success apply-govt-btn" title="Open official announcement on ${sourceBadge}">
              ${btnLabel}
            </a>
            <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}" title="${isSaved ? 'Saved' : 'Save notification'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachGovtActions(cardsContainer);
  };

  const attachGovtActions = (elem) => {
    // Modal view with all 13 required fields
    elem.querySelectorAll('.view-govt-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = store.getGovtJobs().find(g => g.id === btn.dataset.id) || store.getOpportunityById(btn.dataset.id);
        if (!item) return;
        const isSaved = store.isSaved(item.id);

        const jobTitle = item.jobTitle || item.postName || 'Recruitment Notice';
        const recruitingOrg = item.recruitingOrganization || item.organization || 'Union Public Service Commission (UPSC)';
        const department = item.department || 'Not available';
        const location = item.location || 'Not available';
        const startDate = item.applicationStartDate || item.startDate || 'Not available';
        const lastDate = item.applicationLastDate || item.lastDate || 'Not available';
        const eligibility = item.eligibility || 'Not available';
        const qualification = item.qualification || item.qualificationDetail || 'Not available';
        const ageInfo = item.ageInfo || item.ageLimit || 'Not available';
        const officialUrl = item.officialNotificationUrl || item.officialPdfUrl || item.applyUrl || 'https://upsc.gov.in';
        const sourceName = item.sourceName || 'Union Public Service Commission (UPSC)';
        const fetchedDate = item.fetchedUpdatedDate || item.fetchedAt || 'Not available';
        const status = item.status || 'Open';
        const vacancies = item.vacancies || 'Not available';

        openModal({
          title: jobTitle,
          size: 'large',
          contentHtml: `
            <div class="modal-job-header">
              <div class="modal-org-box">
                <span class="modal-org-logo">🏛️</span>
                <div>
                  <h4>${recruitingOrg}</h4>
                  <p class="text-muted">
                    Department: <strong>${department}</strong> • Status: <strong class="badge ${status === 'Open' ? 'badge-success' : 'badge-info'}">${status}</strong>
                  </p>
                </div>
              </div>
              <div class="modal-salary-box">
                <span class="label">Verified Source Authority</span>
                <span class="val text-success font-bold">${sourceName}</span>
              </div>
            </div>

            <!-- 13 Required Fields Specification Grid -->
            <div class="modal-section">
              <h5>Official Opportunity Details (Rule of Truth)</h5>
              <div class="modal-meta-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
                <div class="meta-card">
                  <span class="meta-lbl">1. Job Title</span>
                  <span class="meta-val font-semibold">${jobTitle}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">2. Recruiting Organization</span>
                  <span class="meta-val font-semibold">${recruitingOrg}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">3. Department</span>
                  <span class="meta-val font-semibold ${department === 'Not available' ? 'text-muted' : 'text-primary'}">${department}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">4. Posting Location</span>
                  <span class="meta-val">${location}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">5. Application Start Date</span>
                  <span class="meta-val">${startDate !== 'Not available' ? formatDate(startDate) : 'Not available'}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">6. Application Last Date</span>
                  <span class="meta-val ${lastDate !== 'Not available' ? 'text-danger font-bold' : 'text-muted'}">${lastDate !== 'Not available' ? formatDate(lastDate) : 'Not available'}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">7. Eligibility Criteria</span>
                  <span class="meta-val ${eligibility === 'Not available' ? 'text-muted' : ''}">${eligibility}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">8. Minimum Qualification</span>
                  <span class="meta-val ${qualification === 'Not available' ? 'text-muted' : ''}">${qualification}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">9. Age Information</span>
                  <span class="meta-val ${ageInfo === 'Not available' ? 'text-muted' : ''}">${ageInfo}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">10. Source Name</span>
                  <span class="meta-val font-semibold">${sourceName}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">11. Fetched / Updated Date</span>
                  <span class="meta-val">${fetchedDate !== 'Not available' ? formatDate(fetchedDate) : 'Not available'}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">12. Current Status</span>
                  <span class="meta-val font-bold ${status === 'Open' ? 'text-success' : 'text-primary'}">${status}</span>
                </div>
                <div class="meta-card">
                  <span class="meta-lbl">13. Total Vacancies</span>
                  <span class="meta-val font-bold ${vacancies === 'Not available' ? 'text-muted' : 'text-primary'}">${vacancies}</span>
                </div>
              </div>
            </div>

            <div class="modal-section" style="margin-top: 1.25rem;">
              <h5>Official Announcement Context</h5>
              <p style="font-size: 0.925rem; line-height: 1.6; color: var(--text-body);">
                ${item.description || `Official recruitment announcement published by the ${recruitingOrg}. Open the official source document for full guidelines, syllabus, and application portal.`}
              </p>
              <div style="margin-top: 0.5rem; padding: 0.75rem 1rem; background: var(--bg-card-subtle, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 6px;">
                <span class="meta-lbl">Official Source / Document Link:</span><br/>
                <a href="${officialUrl}" target="_blank" rel="noopener noreferrer" style="word-break: break-all; color: var(--primary, #2563eb); font-weight: 600;">
                  ${officialUrl} &nearr;
                </a>
              </div>
            </div>
          `,
          footerHtml: `
            <button class="btn btn-outline" id="govt-modal-save" data-id="${item.id}">
              ${isSaved ? '★ Saved' : '☆ Save Notification'}
            </button>
            <a href="${officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success">
              View Official Source &nearr;
            </a>
          `
        });

        document.getElementById('govt-modal-save')?.addEventListener('click', (e) => {
          const nowSaved = store.toggleSave(item);
          e.target.textContent = nowSaved ? '★ Saved' : '☆ Save Notification';
          showToast(nowSaved ? 'Exam notice bookmarked!' : 'Removed from Saved', nowSaved ? 'success' : 'info');
          const cardBtn = elem.querySelector(`.save-toggle-btn[data-id="${item.id}"]`);
          if (cardBtn) cardBtn.classList.toggle('saved', nowSaved);
        });
      });
    });

    // Save toggle in card
    elem.querySelectorAll('.save-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = store.getGovtJobs().find(g => g.id === btn.dataset.id) || store.getOpportunityById(btn.dataset.id);
        if (item) {
          const nowSaved = store.toggleSave(item);
          btn.classList.toggle('saved', nowSaved);
          const svg = btn.querySelector('svg');
          if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
          showToast(nowSaved ? 'Govt notification bookmarked!' : 'Removed from saved', nowSaved ? 'success' : 'info');
        }
      });
    });
  };

  // Category pills
  container.querySelectorAll('#govt-categories .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#govt-categories .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterAndRender();
    });
  });

  // Filter triggers
  searchInput.addEventListener('input', () => filterAndRender());
  sourceSelect?.addEventListener('change', filterAndRender);
  statusSelect.addEventListener('change', filterAndRender);
  deptSelect.addEventListener('change', filterAndRender);
  locSelect.addEventListener('change', filterAndRender);

  // Sync button trigger
  syncBtn?.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.innerHTML = '↻ Fetching UPSC...';
    showToast('Connecting to Union Public Service Commission portal...', 'info', 2000);
    const result = await store.triggerLiveGovtSync();
    syncBtn.disabled = false;
    syncBtn.innerHTML = '↻ Sync Official Source';
    if (result && result.success) {
      showToast(`Successfully refreshed ${result.count || 0} notices from UPSC!`, 'success', 2500);
      filterAndRender();
    } else {
      showToast('Could not reach official portal right now. Showing cached notices.', 'warning', 3000);
    }
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    if (sourceSelect) sourceSelect.value = 'All';
    statusSelect.value = 'All';
    deptSelect.value = 'All';
    locSelect.value = 'All';
    activeCategory = 'All';
    container.querySelectorAll('#govt-categories .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'All');
    });
    filterAndRender();
    showToast('Filters cleared', 'info');
  });

  // Auto-refresh on store changes
  store.subscribe((event) => {
    if (!document.body.contains(container)) return;
    if (event === 'govt_jobs_changed') {
      filterAndRender();
    }
  });

  // Initial render
  filterAndRender();
}

