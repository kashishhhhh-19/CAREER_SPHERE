/**
 * CareerSphere - Corporate Jobs View
 * Dedicated corporate jobs board connected 100% to real, verified corporate career sources:
 * Amazon India, Infosys, Wipro, Deloitte, IBM, Capgemini, Arbeitnow, and Remotive.
 * Adheres strictly to the Rule of Truth: Never invents salaries, dates, or degrees.
 */

import { store, CANONICAL_COMPANIES } from '../store.js';
import { formatDate, getDeadlineBadge, openModal, showToast, escapeHtml, parseDateSafely } from '../utils.js';

export function renderCorporateView(container) {
  let filterAndRender;
  let renderCompaniesDirectory;
  let isLoading = store.getCorporateJobs().length === 0;
  let hasError = false;

  // Sync real corporate jobs and enterprise companies directory from backend API
  store.syncCompaniesAPI().then(() => {
    if (!document.body.contains(container)) return;
    if (typeof renderCompaniesDirectory === 'function') renderCompaniesDirectory();
    if (typeof filterAndRender === 'function') filterAndRender();
  }).catch(() => {});

  store.syncCorporateJobsAPI()
    .then(jobs => {
      if (!document.body.contains(container)) return;
      isLoading = false;
      if (!jobs || jobs.length === 0) {
        if (store.getCorporateJobs().length === 0) {
          hasError = true;
        }
      } else {
        hasError = false;
      }
      if (typeof filterAndRender === 'function') {
        filterAndRender();
      }
    })
    .catch(() => {
      if (!document.body.contains(container)) return;
      isLoading = false;
      if (store.getCorporateJobs().length === 0) {
        hasError = true;
      }
      if (typeof filterAndRender === 'function') {
        filterAndRender();
      }
    });

  // Check if any search or filter preset was passed from Home
  const rawSearch = sessionStorage.getItem('careersphere_search_query') || '';
  const rawPreset = sessionStorage.getItem('careersphere_filter_preset') || 'All';
  sessionStorage.removeItem('careersphere_search_query');
  sessionStorage.removeItem('careersphere_filter_preset');

  const CATEGORY_NAMES = [
    'All',
    'Fresher Jobs',
    'BCA / IT Jobs',
    'Software Developer',
    'Data Analyst',
    'Web Developer',
    'Python Jobs',
    'Java Jobs',
    'SQL Jobs',
    'Internships',
    'Work From Home',
    'Entry Level',
    'Experienced'
  ];

  // Map legacy category names if needed
  let normalizedPreset = rawPreset;
  if (rawPreset === 'BCA/IT Jobs') normalizedPreset = 'BCA / IT Jobs';
  const initialPreset = CATEGORY_NAMES.includes(normalizedPreset) ? normalizedPreset : 'All';
  const initialSearch = rawSearch;

  container.innerHTML = `
    <div class="view-header corporate-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Corporate Jobs</span>
        </div>
        <h1 class="page-title">Corporate Tech Opportunities &amp; Careers</h1>
        <p class="page-desc">
          Browse verified software engineering openings, IT graduate roles, freshers hiring drives, data analyst openings, and tech internships from official company career portals (Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini) and verified feeds.
        </p>
        <div class="character-chamber-badge">
          <img src="assets/realm/character_golden_knight.jpg" alt="Ser Aurelius Vance" class="character-portrait-avatar" />
          <div class="character-badge-text">
            <span class="role-title">Commander of the Golden Citadels</span>
            <h4>Ser Aurelius Vance</h4>
            <p>&ldquo;In the corporate towers, merit and relentless precision forge the path to gold.&rdquo;</p>
          </div>
        </div>
      </div>
    </div>

    <div class="jobs-layout-container section-container">
      <!-- 12 CATEGORY PILLS BAR -->
      <div class="category-pills-scroll" id="corp-categories">
        <button class="pill-btn ${initialPreset === 'All' ? 'active' : ''}" data-category="All">All Roles</button>
        <button class="pill-btn ${initialPreset === 'Fresher Jobs' ? 'active' : ''}" data-category="Fresher Jobs">Fresher Jobs</button>
        <button class="pill-btn ${initialPreset === 'BCA / IT Jobs' ? 'active' : ''}" data-category="BCA / IT Jobs">BCA / IT Jobs</button>
        <button class="pill-btn ${initialPreset === 'Software Developer' ? 'active' : ''}" data-category="Software Developer">Software Developer</button>
        <button class="pill-btn ${initialPreset === 'Data Analyst' ? 'active' : ''}" data-category="Data Analyst">Data Analyst</button>
        <button class="pill-btn ${initialPreset === 'Web Developer' ? 'active' : ''}" data-category="Web Developer">Web Developer</button>
        <button class="pill-btn ${initialPreset === 'Python Jobs' ? 'active' : ''}" data-category="Python Jobs">Python Jobs</button>
        <button class="pill-btn ${initialPreset === 'Java Jobs' ? 'active' : ''}" data-category="Java Jobs">Java Jobs</button>
        <button class="pill-btn ${initialPreset === 'SQL Jobs' ? 'active' : ''}" data-category="SQL Jobs">SQL Jobs</button>
        <button class="pill-btn ${initialPreset === 'Internships' ? 'active' : ''}" data-category="Internships">Internships</button>
        <button class="pill-btn ${initialPreset === 'Work From Home' ? 'active' : ''}" data-category="Work From Home">Work From Home</button>
        <button class="pill-btn ${initialPreset === 'Entry Level' ? 'active' : ''}" data-category="Entry Level">Entry Level</button>
        <button class="pill-btn ${initialPreset === 'Experienced' ? 'active' : ''}" data-category="Experienced">Experienced</button>
      </div>

      <!-- 13 ENTERPRISE COMPANIES DIRECTORY SHOWCASE -->
      <section class="card enterprise-directory-card" style="margin-bottom: 2rem; padding: 1.25rem 1.5rem; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; background: #151822; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(212, 175, 55, 0.15);">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 700; color: #F8FAFC; font-family: var(--font-heading); letter-spacing: 0.02em; display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.25rem;">
              🏛️ Corporate Companies Directory <span class="badge badge-primary" style="font-size: 0.75rem; font-weight: 600;">13 Enterprise Employers</span>
            </h2>
            <p style="color: #8492A6; font-size: 0.85rem; margin: 0;">
              All 13 enterprise technology employers remain permanently visible. Live hiring and internship statuses are verified independently from vacancy counts.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="source-status-badge" style="font-size: 0.78rem; background: #0E1017; color: #CBD5E1; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(212, 175, 55, 0.25);">
              Checked every 4h
            </span>
          </div>
        </div>

        <div class="enterprise-directory-grid" id="enterprise-directory-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem;">
          <!-- Dynamically populated with all 13 companies -->
        </div>
      </section>

      <!-- MAIN CONTENT WITH SIDEBAR FILTERS & JOBS GRID -->
      <div class="jobs-content-grid">
        <!-- FILTER SIDEBAR -->
        <aside class="filter-sidebar card">
          <div class="filter-sidebar-header">
            <h3>Filters</h3>
            <button class="btn-text" id="reset-corp-filters">Reset All</button>
          </div>

          <!-- Keyword Search -->
          <div class="filter-group">
            <label class="filter-label" for="corp-search-input">Search Keywords</label>
            <div class="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="corp-search-input" placeholder="Title, company, skill, or location..." value="${escapeHtml(initialSearch)}" />
            </div>
          </div>

          <!-- Company Filter (All 13 Enterprises Always Visible) -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-company">Company</label>
            <select id="corp-filter-company" class="form-select">
              <option value="All">All Companies</option>
              <option value="TCS">Tata Consultancy Services (TCS)</option>
              <option value="Infosys">Infosys</option>
              <option value="Wipro">Wipro</option>
              <option value="Accenture">Accenture</option>
              <option value="Cognizant">Cognizant</option>
              <option value="IBM">IBM</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Amazon">Amazon</option>
              <option value="Google">Google</option>
              <option value="Capgemini">Capgemini</option>
              <option value="Deloitte">Deloitte</option>
              <option value="HCLTech">HCLTech</option>
              <option value="Tech Mahindra">Tech Mahindra</option>
            </select>
          </div>

          <!-- Job Category Filter -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-category">Job Category</label>
            <select id="corp-filter-category" class="form-select">
              <option value="All" ${initialPreset === 'All' ? 'selected' : ''}>All Categories</option>
              <option value="Fresher Jobs" ${initialPreset === 'Fresher Jobs' ? 'selected' : ''}>Fresher Jobs</option>
              <option value="BCA / IT Jobs" ${initialPreset === 'BCA / IT Jobs' ? 'selected' : ''}>BCA / IT Jobs</option>
              <option value="Software Developer" ${initialPreset === 'Software Developer' ? 'selected' : ''}>Software Developer</option>
              <option value="Data Analyst" ${initialPreset === 'Data Analyst' ? 'selected' : ''}>Data Analyst</option>
              <option value="Web Developer" ${initialPreset === 'Web Developer' ? 'selected' : ''}>Web Developer</option>
              <option value="Python Jobs" ${initialPreset === 'Python Jobs' ? 'selected' : ''}>Python Jobs</option>
              <option value="Java Jobs" ${initialPreset === 'Java Jobs' ? 'selected' : ''}>Java Jobs</option>
              <option value="SQL Jobs" ${initialPreset === 'SQL Jobs' ? 'selected' : ''}>SQL Jobs</option>
              <option value="Internships" ${initialPreset === 'Internships' ? 'selected' : ''}>Internships</option>
              <option value="Work From Home" ${initialPreset === 'Work From Home' ? 'selected' : ''}>Work From Home</option>
              <option value="Entry Level" ${initialPreset === 'Entry Level' ? 'selected' : ''}>Entry Level</option>
              <option value="Experienced" ${initialPreset === 'Experienced' ? 'selected' : ''}>Experienced</option>
            </select>
          </div>

          <!-- Experience Level Filter -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-experience">Experience Level</label>
            <select id="corp-filter-experience" class="form-select">
              <option value="All">All Levels</option>
              <option value="Fresher">Fresher (0-1 yr)</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Experienced">Experienced (2+ yrs)</option>
              <option value="Students">Internships & Students</option>
            </select>
          </div>

          <!-- Job Type Filter (Internship / Full-time) -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-jobtype">Job Type</label>
            <select id="corp-filter-jobtype" class="form-select">
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract / Other</option>
            </select>
          </div>

          <!-- Location Filter -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-location">Location</label>
            <select id="corp-filter-location" class="form-select">
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore / Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi / NCR / Noida</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Cochin">Cochin / Kochi</option>
              <option value="Remote">Remote / Work From Home</option>
              <option value="International">International / Worldwide</option>
            </select>
          </div>

          <!-- Work Arrangement (Remote / Hybrid / On-site) -->
          <div class="filter-group">
            <label class="filter-label" for="corp-filter-worktype">Work Arrangement</label>
            <select id="corp-filter-worktype" class="form-select">
              <option value="All">All Arrangements</option>
              <option value="Remote">Remote / Work From Home</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site / In-Office</option>
            </select>
          </div>

          <!-- Skills Filter -->
          <div class="filter-group">
            <label class="filter-label">Key Skills</label>
            <div class="checkbox-group" id="corp-skills-filter">
              <label class="checkbox-label">
                <input type="checkbox" value="Python" /> Python
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="Java" /> Java
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="SQL" /> SQL
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="JavaScript" /> JavaScript
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="React" /> React
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="AWS" /> AWS / Cloud
              </label>
              <label class="checkbox-label">
                <input type="checkbox" value="Data Analysis" /> Data Analysis
              </label>
            </div>
          </div>
        </aside>

        <!-- RESULTS COLUMN -->
        <main class="jobs-results-column">
          <div class="results-meta-bar">
            <span id="corp-results-count" class="results-count">Showing <strong>${store.getCorporateJobs().length}</strong> verified opportunities</span>
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span class="source-status-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #CBD5E1; background: #0E1017; padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid rgba(212, 175, 55, 0.2);">
                📡 <span id="corp-updated-val">Official Company Career Portals</span>
              </span>
              <button class="btn btn-outline btn-sm" id="btn-sync-corp-live" style="font-size: 0.8rem; padding: 0.3rem 0.75rem;">
                ↻ Sync Live Sources
              </button>
              <div class="results-sort">
                <label for="corp-sort-select">Sort by:</label>
                <select id="corp-sort-select" class="form-select-sm">
                  <option value="recent">Latest Posted</option>
                  <option value="deadline">Application Deadline</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="corporate-cards-grid" id="corporate-cards-container">
            <!-- Cards rendered dynamically -->
          </div>
        </main>
      </div>
    </div>
  `;

  // State & DOM elements
  let activeCategory = initialPreset;
  const searchInput = container.querySelector('#corp-search-input');
  const companySelect = container.querySelector('#corp-filter-company');
  const categorySelect = container.querySelector('#corp-filter-category');
  const locationSelect = container.querySelector('#corp-filter-location');
  const experienceSelect = container.querySelector('#corp-filter-experience');
  const jobTypeSelect = container.querySelector('#corp-filter-jobtype');
  const workTypeSelect = container.querySelector('#corp-filter-worktype');
  const sortSelect = container.querySelector('#corp-sort-select');
  const resetBtn = container.querySelector('#reset-corp-filters');
  const resultsCount = container.querySelector('#corp-results-count');
  const updatedVal = container.querySelector('#corp-updated-val');
  const syncBtn = container.querySelector('#btn-sync-corp-live');
  const cardsContainer = container.querySelector('#corporate-cards-container');

  const updateLastUpdatedLabel = () => {
    if (!updatedVal) return;
    const last = store.getCorporateLastUpdated();
    if (!last) {
      updatedVal.textContent = 'Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini';
    } else {
      try {
        const d = new Date(last);
        updatedVal.textContent = isNaN(d.getTime()) ? last : `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      } catch {
        updatedVal.textContent = last;
      }
    }
  };

  const getSelectedSkills = () => {
    const checked = container.querySelectorAll('#corp-skills-filter input[type="checkbox"]:checked');
    return Array.from(checked).map(c => c.value);
  };

  // Render the 13 canonical enterprise companies in directory grid
  const directoryGrid = container.querySelector('#enterprise-directory-grid');

  renderCompaniesDirectory = () => {
    if (!directoryGrid) return;
    const companies = store.getCompanies();

    directoryGrid.innerHTML = companies.map(comp => {
      let statusBadgeHtml = '';
      if (comp.status === 'Hiring Now') {
        statusBadgeHtml = `<span class="badge" style="background:#064E3B; color:#34D399; border:1px solid #059669; font-size:0.68rem; font-weight:700; white-space:nowrap; padding:0.2rem 0.45rem;">● Hiring Now</span>`;
      } else if (comp.status === 'Fresher Hiring') {
        statusBadgeHtml = `<span class="badge" style="background:#451A03; color:#FBBF24; border:1px solid #D97706; font-size:0.68rem; font-weight:700; white-space:nowrap; padding:0.2rem 0.45rem;">● Fresher Hiring</span>`;
      } else if (comp.status === 'Internship Available') {
        statusBadgeHtml = `<span class="badge" style="background:#1E293B; color:#60A5FA; border:1px solid #3B82F6; font-size:0.68rem; font-weight:700; white-space:nowrap; padding:0.2rem 0.45rem;">● Internship Open</span>`;
      } else {
        statusBadgeHtml = `<span class="badge" style="background:#10121A; color:#8492A6; border:1px solid rgba(212, 175, 55, 0.2); font-size:0.68rem; font-weight:600; white-space:nowrap; padding:0.2rem 0.45rem;">○ No Current Match</span>`;
      }

      let lastCheckedFormatted = 'Recently';
      if (comp.lastChecked && comp.lastChecked !== 'Not available') {
        try {
          const d = new Date(comp.lastChecked);
          lastCheckedFormatted = isNaN(d.getTime()) ? comp.lastChecked : `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
        } catch {
          lastCheckedFormatted = comp.lastChecked;
        }
      }

      const activeJobs = comp.activeJobsCount || 0;
      const activeInterns = comp.activeInternshipsCount || 0;

      return `
        <div class="enterprise-company-card card" data-comp-id="${comp.id}" style="padding: 0.95rem; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 10px; background: #10121A; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.5); transition: all 0.2s;">
          <div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                <span style="font-size: 1.35rem; width: 34px; height: 34px; min-width: 34px; background: #0B0C10; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  ${comp.logo || '🏢'}
                </span>
                <div style="overflow: hidden;">
                  <h4 style="font-size: 0.88rem; font-weight: 700; color: #F8FAFC; font-family: var(--font-heading); margin: 0; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" title="${escapeHtml(comp.name)}">
                    ${escapeHtml(comp.shortName || comp.name)}
                  </h4>
                  <span style="font-size: 0.7rem; color: #8492A6; white-space: nowrap; text-overflow: ellipsis; display: block; overflow: hidden;">${escapeHtml(comp.headquarters || 'Pan India')}</span>
                </div>
              </div>
              ${statusBadgeHtml}
            </div>

            <p style="font-size: 0.75rem; color: #CBD5E1; margin: 0 0 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.1rem; line-height: 1.35;">
              ${escapeHtml(comp.description || comp.industry)}
            </p>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; color: #8492A6; margin-bottom: 0.65rem; padding-top: 0.35rem; border-top: 1px dashed rgba(212, 175, 55, 0.18);">
              <span>
                ${activeJobs > 0 ? `<strong style="color: var(--antique-gold);">${activeJobs}</strong> Openings` : '<span class="text-muted">0 Feed Openings</span>'}
                ${activeInterns > 0 ? ` • <strong style="color: #60A5FA;">${activeInterns}</strong> Interns` : ''}
              </span>
              <span title="Last checked timestamp">🕒 ${lastCheckedFormatted}</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.35rem; margin-top: auto;">
            <button class="btn btn-outline btn-xs dir-filter-btn" data-company="${escapeHtml(comp.shortName)}" style="flex: 1; font-size: 0.73rem; padding: 0.28rem 0.4rem; white-space: nowrap;">
              ${activeJobs > 0 ? `View Jobs (${activeJobs})` : 'Check Status'}
            </button>
            <a href="${escapeHtml(comp.officialCareerUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-xs" style="font-size: 0.73rem; padding: 0.28rem 0.5rem; text-decoration: none; white-space: nowrap;" title="Visit Official ${escapeHtml(comp.shortName)} Careers Portal">
              Portal &nearr;
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to directory filter buttons
    directoryGrid.querySelectorAll('.dir-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetComp = btn.dataset.company;
        if (companySelect) {
          companySelect.value = targetComp;
        }
        filterAndRender();
        // Scroll smoothly to results
        cardsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  // Populate dynamic company options if other companies exist
  const populateCompanyDropdown = (jobs) => {
    if (!companySelect) return;
    const currentVal = companySelect.value;
    const canonicalNames = CANONICAL_COMPANIES.map(c => c.shortName.toLowerCase());

    const otherCompanies = new Set();
    jobs.forEach(j => {
      const c = (j.company || '').trim();
      if (c && !canonicalNames.includes(c.toLowerCase()) && !['all'].includes(c.toLowerCase())) {
        otherCompanies.add(c);
      }
    });

    const existingValues = Array.from(companySelect.options).map(o => o.value.toLowerCase());
    otherCompanies.forEach(cName => {
      if (!existingValues.includes(cName.toLowerCase())) {
        const opt = document.createElement('option');
        opt.value = cName;
        opt.textContent = cName;
        companySelect.appendChild(opt);
      }
    });

    companySelect.value = currentVal;
  };

  filterAndRender = () => {
    updateLastUpdatedLabel();
    const allJobs = store.getCorporateJobs();
    populateCompanyDropdown(allJobs);

    // 1. Loading State Handling
    if (isLoading && allJobs.length === 0) {
      if (resultsCount) {
        resultsCount.innerHTML = `Connecting to official corporate career portals...`;
      }
      cardsContainer.innerHTML = `
        <div class="loading-state card" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 1rem 0 0.5rem;">Fetching Verified Corporate Opportunities</h3>
          <p style="color: #64748B; font-size: 0.95rem; max-width: 460px; margin: 0 auto;">Connecting to official company career APIs (Amazon, Infosys, Wipro, Deloitte, IBM, Capgemini) to retrieve genuine current openings...</p>
        </div>
      `;
      return;
    }

    // 2. API Error State Handling
    if (hasError && allJobs.length === 0) {
      if (resultsCount) {
        resultsCount.innerHTML = `<span class="text-danger font-semibold">⚠️ Failed to connect to corporate portals</span>`;
      }
      cardsContainer.innerHTML = `
        <div class="empty-state card" style="grid-column: 1 / -1; padding: 3.5rem 2rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.75rem; margin-bottom: 0.75rem;">📡</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">Unable to Connect to Corporate Portals</h3>
          <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
            Could not retrieve job listings from corporate career APIs. Please check your network connection and retry.
          </p>
          <button class="btn btn-primary" id="corp-error-retry-btn">
            ↻ Retry Connecting
          </button>
        </div>
      `;
      container.querySelector('#corp-error-retry-btn')?.addEventListener('click', () => {
        isLoading = true;
        hasError = false;
        filterAndRender();
        store.syncCorporateJobsAPI().then(jobs => {
          isLoading = false;
          if (!jobs || jobs.length === 0) {
            hasError = store.getCorporateJobs().length === 0;
          } else {
            hasError = false;
          }
          filterAndRender();
        });
      });
      return;
    }

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const compFilter = companySelect ? companySelect.value : 'All';
    const loc = locationSelect ? locationSelect.value : 'All';
    const exp = experienceSelect ? experienceSelect.value : 'All';
    const jobTypeFilter = jobTypeSelect ? jobTypeSelect.value : 'All';
    const workType = workTypeSelect ? workTypeSelect.value : 'All';
    const selectedSkills = getSelectedSkills();
    const sortVal = sortSelect ? sortSelect.value : 'recent';

    let filtered = allJobs.filter(job => {
      // 1. Category check (Active Pill or Category Select)
      if (activeCategory !== 'All') {
        const actLower = activeCategory.toLowerCase();
        const roleCat = (job.roleCategory || job.role_category || '').toLowerCase();
        const cat = (job.category || '').toLowerCase();
        const catsArr = Array.isArray(job.categories) ? job.categories.map(c => String(c).toLowerCase()) : [];
        const jobWork = (job.jobType || job.workType || job.work_type || '').toLowerCase();
        const title = (job.title || '').toLowerCase();
        const jobExp = (job.experience || '').toLowerCase();
        const jobLoc = (job.location || '').toLowerCase();
        const skillsArr = Array.isArray(job.skills) ? job.skills.map(s => String(s).toLowerCase()) : [];
        const desc = (job.description || '').toLowerCase();

        let matchesCategory = catsArr.includes(actLower) || cat === actLower || roleCat === actLower;

        if (!matchesCategory) {
          if (actLower === 'fresher jobs') {
            matchesCategory = jobExp.includes('fresher') || jobExp.includes('entry') || jobExp.includes('0-1') || title.includes('junior') || title.includes('fresher') || title.includes('trainee');
          } else if (actLower === 'bca / it jobs' || actLower === 'bca/it jobs') {
            matchesCategory = title.includes('it') || title.includes('software') || title.includes('developer') || title.includes('engineer') || desc.includes('bca') || desc.includes('information technology');
          } else if (actLower === 'software developer') {
            matchesCategory = title.includes('developer') || title.includes('engineer') || title.includes('software') || cat.includes('software') || roleCat.includes('software');
          } else if (actLower === 'data analyst') {
            matchesCategory = title.includes('data') || title.includes('analyst') || title.includes('analytics') || title.includes('bi ') || desc.includes('data analyst') || desc.includes('business analyst');
          } else if (actLower === 'web developer') {
            matchesCategory = title.includes('web') || title.includes('frontend') || title.includes('react') || title.includes('angular') || skillsArr.includes('javascript') || skillsArr.includes('react') || skillsArr.includes('html');
          } else if (actLower === 'python jobs') {
            matchesCategory = title.includes('python') || skillsArr.includes('python') || desc.includes('python');
          } else if (actLower === 'java jobs') {
            matchesCategory = (title.includes('java') && !title.includes('javascript')) || skillsArr.includes('java') || skillsArr.includes('spring boot');
          } else if (actLower === 'sql jobs') {
            matchesCategory = title.includes('sql') || skillsArr.includes('sql') || skillsArr.includes('mysql') || skillsArr.includes('postgresql');
          } else if (actLower === 'internships') {
            matchesCategory = jobWork.includes('intern') || title.includes('intern') || jobExp.includes('intern') || jobExp.includes('student');
          } else if (actLower === 'work from home') {
            matchesCategory = jobWork.includes('remote') || jobWork.includes('home') || jobLoc.includes('remote') || jobLoc.includes('worldwide');
          } else if (actLower === 'entry level') {
            matchesCategory = jobExp.includes('entry') || jobExp.includes('0-1') || jobExp.includes('fresher') || title.includes('entry') || title.includes('junior') || title.includes('associate');
          } else if (actLower === 'experienced') {
            matchesCategory = jobExp.includes('senior') || jobExp.includes('experienced') || jobExp.includes('lead') || title.includes('senior') || title.includes('lead') || title.includes('manager');
          }
        }
        if (!matchesCategory) return false;
      }

      // 2. Company Filter (Matches by canonical enterprise aliases or raw name)
      if (compFilter !== 'All') {
        const jComp = (job.company || '').toLowerCase();
        const cfLower = compFilter.toLowerCase();
        const matchedComp = CANONICAL_COMPANIES.find(c =>
          c.shortName.toLowerCase() === cfLower ||
          c.name.toLowerCase() === cfLower ||
          c.id.toLowerCase() === cfLower
        );

        if (matchedComp) {
          const compAliases = [
            matchedComp.shortName.toLowerCase(),
            matchedComp.name.toLowerCase(),
            matchedComp.id.toLowerCase()
          ];
          if (matchedComp.id === 'tcs') {
            compAliases.push('tata consultancy', 'tata group');
          }
          const matches = compAliases.some(alias => {
            if (alias.length <= 4) {
              const regex = new RegExp('\\b' + alias + '\\b', 'i');
              return regex.test(jComp);
            }
            return jComp.includes(alias);
          });
          if (!matches) return false;
        } else {
          if (!jComp.includes(cfLower)) return false;
        }
      }

      // 3. Keyword Search
      if (query) {
        const matchTitle = (job.title || '').toLowerCase().includes(query);
        const matchCompany = (job.company || '').toLowerCase().includes(query);
        const matchSkills = Array.isArray(job.skills) && job.skills.some(s => String(s).toLowerCase().includes(query));
        const matchDesc = (job.description || '').toLowerCase().includes(query);
        const matchLoc = (job.location || '').toLowerCase().includes(query);
        const matchRole = (job.roleCategory || job.role_category || job.category || '').toLowerCase().includes(query);
        if (!matchTitle && !matchCompany && !matchSkills && !matchDesc && !matchLoc && !matchRole) return false;
      }

      // 4. Location Filter
      if (loc !== 'All') {
        const jobLoc = (job.location || '').toLowerCase();
        const jobWork = (job.jobType || job.workType || job.work_type || '').toLowerCase();
        const locLower = loc.toLowerCase();

        if (locLower === 'remote') {
          if (!jobWork.includes('remote') && !jobWork.includes('home') && !jobLoc.includes('remote') && !jobLoc.includes('worldwide')) {
            return false;
          }
        } else if (locLower === 'delhi') {
          if (!jobLoc.includes('delhi') && !jobLoc.includes('noida') && !jobLoc.includes('gurgaon') && !jobLoc.includes('ncr')) {
            return false;
          }
        } else if (locLower === 'international') {
          if (jobLoc.includes('india') && !jobLoc.includes('worldwide') && !jobLoc.includes('remote')) {
            return false;
          }
        } else if (!jobLoc.includes(locLower)) {
          return false;
        }
      }

      // 5. Experience Filter
      if (exp !== 'All') {
        const jobExp = (job.experience || '').toLowerCase();
        const jobTitle = (job.title || '').toLowerCase();
        if (exp === 'Fresher') {
          const isFresher = jobExp.includes('fresher') || jobExp.includes('entry') || jobExp.includes('junior') || jobTitle.includes('junior') || jobTitle.includes('fresher') || jobExp.includes('0-1');
          if (!isFresher) return false;
        } else if (exp === 'Entry Level') {
          const isEntry = jobExp.includes('entry') || jobExp.includes('junior') || jobExp.includes('associate') || jobExp.includes('0-1') || jobTitle.includes('associate') || jobTitle.includes('junior');
          if (!isEntry) return false;
        } else if (exp === 'Students') {
          const isStudent = jobExp.includes('student') || jobExp.includes('intern') || jobTitle.includes('intern');
          if (!isStudent) return false;
        } else if (exp === 'Experienced') {
          const isExperienced = jobExp.includes('senior') || jobExp.includes('experienced') || jobExp.includes('lead') || jobTitle.includes('senior') || jobTitle.includes('lead') || jobTitle.includes('manager');
          if (!isExperienced) return false;
        }
      }

      // 6. Job Type Filter (Internship / Full-time / Contract)
      if (jobTypeFilter !== 'All') {
        const jt = (job.jobType || job.workType || job.work_type || '').toLowerCase();
        const title = (job.title || '').toLowerCase();
        const filterLower = jobTypeFilter.toLowerCase();
        if (filterLower === 'internship') {
          if (!jt.includes('intern') && !title.includes('intern')) return false;
        } else if (filterLower === 'full-time') {
          if (jt.includes('intern') || title.includes('intern')) return false;
        } else if (!jt.includes(filterLower)) {
          return false;
        }
      }

      // 7. Work Arrangement Filter (Remote / Hybrid / On-site)
      if (workType !== 'All') {
        const jobWork = (job.jobType || job.workType || job.work_type || '').toLowerCase();
        const jobLoc = (job.location || '').toLowerCase();
        const wtLower = workType.toLowerCase();

        if (wtLower === 'remote') {
          if (!jobWork.includes('remote') && !jobWork.includes('home') && !jobLoc.includes('remote') && !jobLoc.includes('worldwide')) {
            return false;
          }
        } else if (wtLower === 'hybrid') {
          if (!jobWork.includes('hybrid') && !jobLoc.includes('hybrid')) {
            return false;
          }
        } else if (wtLower === 'on-site') {
          if (jobWork.includes('remote') || jobLoc.includes('remote')) {
            return false;
          }
        }
      }

      // 8. Key Skills Filter
      if (selectedSkills.length > 0) {
        const hasSkill = selectedSkills.some(skill => {
          const skLower = skill.toLowerCase();
          const inSkills = Array.isArray(job.skills) && job.skills.some(s => String(s).toLowerCase().includes(skLower));
          const inTitle = (job.title || '').toLowerCase().includes(skLower);
          const inDesc = (job.description || '').toLowerCase().includes(skLower);
          return inSkills || inTitle || inDesc;
        });
        if (!hasSkill) return false;
      }

      return true;
    });

    // Sorting
    if (sortVal === 'company') {
      filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    } else if (sortVal === 'deadline') {
      filtered.sort((a, b) => {
        const dA = parseDateSafely(a.deadline);
        const dB = parseDateSafely(b.deadline);
        const dateA = dA ? dA.getTime() : Infinity;
        const dateB = dB ? dB.getTime() : Infinity;
        return dateA - dateB;
      });
    } else if (sortVal === 'recent') {
      filtered.sort((a, b) => {
        const dA = parseDateSafely(a.postedDate || a.posted_date);
        const dB = parseDateSafely(b.postedDate || b.posted_date);
        const dateA = dA ? dA.getTime() : 0;
        const dateB = dB ? dB.getTime() : 0;
        return dateB - dateA;
      });
    }

    if (resultsCount) {
      resultsCount.innerHTML = `Showing <strong>${filtered.length}</strong> verified opportunities`;
    }

    // 3. Empty State Handling
    if (filtered.length === 0) {
      // Check if user specifically filtered by an enterprise company
      const cfLower = compFilter.toLowerCase();
      const matchedComp = store.getCompanies().find(c =>
        c.shortName.toLowerCase() === cfLower ||
        c.name.toLowerCase() === cfLower ||
        c.id.toLowerCase() === cfLower
      );

      if (compFilter !== 'All' && matchedComp) {
        let lastCheckedStr = 'Recently';
        if (matchedComp.lastChecked && matchedComp.lastChecked !== 'Not available') {
          try {
            const d = new Date(matchedComp.lastChecked);
            lastCheckedStr = isNaN(d.getTime()) ? matchedComp.lastChecked : `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
          } catch {
            lastCheckedStr = matchedComp.lastChecked;
          }
        }

        cardsContainer.innerHTML = `
          <div class="company-zero-state card" style="grid-column: 1 / -1; padding: 2.25rem 2rem; border-left: 4px solid #64748B; background: #FFFFFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="org-avatar corp-avatar" style="width: 54px; height: 54px; font-size: 1.8rem; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                  ${matchedComp.logo || '🏢'}
                </div>
                <div>
                  <h3 style="font-size: 1.35rem; font-weight: 700; color: #0F172A; margin: 0 0 0.25rem;">${escapeHtml(matchedComp.name)}</h3>
                  <p style="color: #64748B; font-size: 0.88rem; margin: 0;">
                    ${escapeHtml(matchedComp.industry || 'Enterprise Technology')} • 📍 ${escapeHtml(matchedComp.headquarters || 'Pan India')}
                  </p>
                </div>
              </div>
              <span class="badge badge-neutral" style="font-size: 0.82rem; padding: 0.4rem 0.8rem; background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; font-weight: 600;">
                ○ No Current Matching Opportunity
              </span>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
              <p style="color: #334155; font-size: 0.95rem; margin-bottom: 0.5rem; line-height: 1.5;">
                There are currently <strong>no matching corporate vacancies or internships</strong> actively ingested for <strong>${escapeHtml(matchedComp.name)}</strong> from connected live feeds.
              </p>
              <p style="color: #64748B; font-size: 0.85rem; margin: 0;">
                🕒 <strong>Last checked:</strong> ${lastCheckedStr} • Official employer career portals are checked and synced on schedule every 4 hours. Status automatically updates to <em>"Hiring Now"</em> or <em>"Fresher Hiring"</em> as soon as authentic listings are ingested.
              </p>
            </div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <a href="${escapeHtml(matchedComp.officialCareerUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.4rem;">
                Visit Official ${escapeHtml(matchedComp.shortName)} Careers Portal &nearr;
              </a>
              <button class="btn btn-outline" id="corp-zero-view-all-btn">
                View All Opportunities (${allJobs.length})
              </button>
            </div>
          </div>
        `;

        container.querySelector('#corp-zero-view-all-btn')?.addEventListener('click', () => {
          if (companySelect) companySelect.value = 'All';
          filterAndRender();
        });
        return;
      }

      cardsContainer.innerHTML = `
        <div class="empty-state card" style="grid-column: 1 / -1; padding: 3rem 2rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">No matching corporate jobs found</h3>
          <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
            Try adjusting your search criteria, clearing company or category filters to view all verified openings.
          </p>
          <button class="btn btn-outline" id="empty-reset-btn">Reset All Filters</button>
        </div>
      `;
      container.querySelector('#empty-reset-btn')?.addEventListener('click', () => {
        resetBtn.click();
      });
      return;
    }

    // Normalized Cards Rendering adhering strictly to user requirements:
    // Company, Job Title, Location, Experience Level, Job Type, Skills, Posted Date, Salary, Source, Apply button.
    cardsContainer.innerHTML = filtered.map(job => {
      const isSaved = store.isSaved(job.id);
      const deadlineBadge = getDeadlineBadge(job.deadline);
      const appUrl = job.applicationUrl || job.applyUrl || job.apply_url || '#';
      const srcName = job.source || job.sourceName || job.source_name || `${job.company || 'Corporate'} Career Portal`;

      return `
        <div class="opp-card corp-card-theme card">
          <div class="opp-card-header">
            <div class="org-avatar corp-avatar">${job.logo || '🏢'}</div>
            <div class="opp-card-titles">
              <div class="badge-wrapper">
                ${!job.isDemo ? '<span class="badge badge-verified-source font-bold">✓ Official Live Job</span>' : '<span class="badge badge-demo">DEMO DATA</span>'}
                <span class="badge badge-primary">${escapeHtml(job.roleCategory || job.role_category || job.category || 'Tech Opportunity')}</span>
                <span class="badge badge-outline">${escapeHtml(job.jobType || job.workType || job.work_type || 'Full-time')}</span>
                <span class="badge ${deadlineBadge.colorClass}">${deadlineBadge.text}</span>
              </div>
              <h3 class="opp-title">${escapeHtml(job.title || 'Not available')}</h3>
              <p class="opp-org">
                <strong>${escapeHtml(job.company || 'Not available')}</strong> • <span class="text-muted">Posted ${escapeHtml(job.postedDate || job.posted_date || 'Not available')}</span>
              </p>
              <p class="opp-source-tag" style="font-size: 0.75rem; color: #64748B; margin-top: 0.2rem;">
                📡 Source: <strong>${escapeHtml(srcName)}</strong>
              </p>
            </div>
          </div>

          <div class="opp-details-grid">
            <div class="detail-row">
              <span class="detail-label">🏢 Company:</span>
              <span class="detail-value font-bold text-slate-800">${escapeHtml(job.company || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${escapeHtml(job.location || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏱️ Experience:</span>
              <span class="detail-value font-medium">${escapeHtml(job.experience || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💼 Job Type:</span>
              <span class="detail-value">${escapeHtml(job.jobType || job.workType || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 CTC / Stipend:</span>
              <span class="detail-value ${job.salary && job.salary !== 'Not available' ? 'text-success font-bold' : 'text-muted font-medium'}">${escapeHtml(job.salary || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Posted Date:</span>
              <span class="detail-value">${escapeHtml(job.postedDate || job.posted_date || 'Not available')}</span>
            </div>
          </div>

          <div class="skills-tags-row">
            ${(Array.isArray(job.skills) ? job.skills : []).slice(0, 6).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
            ${Array.isArray(job.skills) && job.skills.length > 6 ? `<span class="skill-tag-more">+${job.skills.length - 6}</span>` : ''}
          </div>

          <div class="opp-card-actions">
            <button class="btn btn-outline view-corp-details" data-id="${job.id}">View Details</button>
            <a href="${appUrl !== '#' ? escapeHtml(appUrl) : '#apply'}" ${appUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary apply-corp-btn" data-id="${job.id}">
              Apply on Source &nearr;
            </a>
            <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${job.id}" title="${isSaved ? 'Saved' : 'Save opportunity'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Action Listeners
    attachCorporateActions(cardsContainer);
  };

  const attachCorporateActions = (elem) => {
    // Details modal
    elem.querySelectorAll('.view-corp-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const job = store.getCorporateJobs().find(j => j.id === btn.dataset.id) || store.getOpportunityById(btn.dataset.id);
        if (!job) return;
        const isSaved = store.isSaved(job.id);
        const appUrl = job.applicationUrl || job.applyUrl || job.apply_url || '#';
        const srcName = job.source || job.sourceName || job.source_name || `${job.company || 'Corporate'} Career Portal`;

        openModal({
          title: job.title || 'Corporate Opportunity Details',
          size: 'large',
          contentHtml: `
            <div class="modal-job-header">
              <div class="modal-org-box">
                <span class="modal-org-logo">${job.logo || '🏢'}</span>
                <div>
                  <h4>${escapeHtml(job.company || 'Not available')}</h4>
                  <p class="text-muted">📍 ${escapeHtml(job.location || 'Not available')} • 💼 ${escapeHtml(job.jobType || job.workType || 'Not available')} • ⏱️ ${escapeHtml(job.experience || 'Not available')}</p>
                  <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">📡 Source: <strong>${escapeHtml(srcName)}</strong></p>
                </div>
              </div>
              <div class="modal-salary-box">
                <span class="label">Compensation</span>
                <span class="val text-success font-bold">${escapeHtml(job.salary || 'Not available')}</span>
              </div>
            </div>

            <div class="modal-section">
              <h5>Role Overview</h5>
              <p>${escapeHtml(job.description || 'Not available')}</p>
            </div>

            <div class="modal-section">
              <h5>Eligibility &amp; Qualifications</h5>
              <p><strong>Required Qualifications:</strong> ${escapeHtml(job.eligibility || 'Not available')}</p>
              <p><strong>Application Window:</strong> <span class="text-danger font-semibold">${formatDate(job.deadline)}</span></p>
            </div>

            <div class="modal-section">
              <h5>Key Technical Skills</h5>
              <div class="skills-tags-row">
                ${(Array.isArray(job.skills) ? job.skills : []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>

            ${Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? `
              <div class="modal-section">
                <h5>Key Responsibilities</h5>
                <ul class="bullet-list">
                  ${job.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${job.selectionProcess && job.selectionProcess !== 'Not available' ? `
              <div class="modal-section">
                <h5>Hiring &amp; Selection Process</h5>
                <p class="selection-box">${escapeHtml(job.selectionProcess)}</p>
              </div>
            ` : ''}
          `,
          footerHtml: `
            <button class="btn btn-outline" id="corp-modal-save" data-id="${job.id}">
              ${isSaved ? '★ Saved' : '☆ Save Job'}
            </button>
            <a href="${appUrl !== '#' ? escapeHtml(appUrl) : '#'}" ${appUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary" id="corp-modal-apply">
              Apply on Source (${escapeHtml(srcName)}) &nearr;
            </a>
          `
        });

        document.getElementById('corp-modal-save')?.addEventListener('click', (e) => {
          const nowSaved = store.toggleSave(job);
          e.target.textContent = nowSaved ? '★ Saved' : '☆ Save Job';
          showToast(nowSaved ? 'Added to Saved Opportunities' : 'Removed from Saved', nowSaved ? 'success' : 'info');
          const cardBtn = elem.querySelector(`.save-toggle-btn[data-id="${job.id}"]`);
          if (cardBtn) cardBtn.classList.toggle('saved', nowSaved);
        });
      });
    });

    // Save button
    elem.querySelectorAll('.save-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const job = store.getCorporateJobs().find(j => j.id === btn.dataset.id) || store.getOpportunityById(btn.dataset.id);
        if (job) {
          const nowSaved = store.toggleSave(job);
          btn.classList.toggle('saved', nowSaved);
          const svg = btn.querySelector('svg');
          if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
          showToast(nowSaved ? 'Opportunity bookmarked!' : 'Removed from saved', nowSaved ? 'success' : 'info');
        }
      });
    });
  };

  // Category Pills Listeners
  container.querySelectorAll('#corp-categories .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#corp-categories .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      if (categorySelect) categorySelect.value = activeCategory;
      filterAndRender();
    });
  });

  // Category Select Listener (Sync with pills)
  categorySelect?.addEventListener('change', () => {
    activeCategory = categorySelect.value;
    container.querySelectorAll('#corp-categories .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === activeCategory);
    });
    filterAndRender();
  });

  // Filter Listeners
  searchInput?.addEventListener('input', () => filterAndRender());
  companySelect?.addEventListener('change', filterAndRender);
  locationSelect?.addEventListener('change', filterAndRender);
  experienceSelect?.addEventListener('change', filterAndRender);
  jobTypeSelect?.addEventListener('change', filterAndRender);
  workTypeSelect?.addEventListener('change', filterAndRender);
  sortSelect?.addEventListener('change', filterAndRender);
  container.querySelectorAll('#corp-skills-filter input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', filterAndRender);
  });

  // Manual Sync Button
  syncBtn?.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = '↻ Syncing...';
    try {
      showToast('Connecting to official corporate career portals...', 'info', 2000);
      const jobs = await store.triggerLiveCorporateSync();
      await store.syncCompaniesAPI();
      renderCompaniesDirectory();
      if (jobs && jobs.length > 0) {
        showToast(`Synced ${jobs.length} verified live corporate opportunities!`, 'success', 3000);
        filterAndRender();
      } else {
        showToast('Corporate feeds are up to date.', 'info', 2500);
      }
    } catch {
      showToast('Could not reach corporate portals. Showing cached records.', 'warning', 3000);
    } finally {
      syncBtn.disabled = false;
      syncBtn.textContent = '↻ Sync Live Sources';
    }
  });

  // Reset Button
  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (companySelect) companySelect.value = 'All';
    if (categorySelect) categorySelect.value = 'All';
    if (locationSelect) locationSelect.value = 'All';
    if (experienceSelect) experienceSelect.value = 'All';
    if (jobTypeSelect) jobTypeSelect.value = 'All';
    if (workTypeSelect) workTypeSelect.value = 'All';
    if (sortSelect) sortSelect.value = 'recent';
    activeCategory = 'All';
    container.querySelectorAll('#corp-categories .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'All');
    });
    container.querySelectorAll('#corp-skills-filter input[type="checkbox"]').forEach(chk => {
      chk.checked = false;
    });
    filterAndRender();
    showToast('Filters cleared', 'info');
  });

  // Auto-refresh when real jobs or companies sync from backend API or when errors occur
  store.subscribe((event) => {
    if (!document.body.contains(container)) return;
    if (event === 'corporate_jobs_changed' || event === 'companies_changed') {
      isLoading = false;
      hasError = false;
      renderCompaniesDirectory();
      filterAndRender();
    } else if (event === 'corporate_jobs_error') {
      isLoading = false;
      if (store.getCorporateJobs().length === 0) {
        hasError = true;
      }
      filterAndRender();
    }
  });

  // Initial render of directory showcase and filtered cards
  renderCompaniesDirectory();
  filterAndRender();
}
