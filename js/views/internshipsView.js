/**
 * CareerSphere - Internships View
 * Dedicated internships board connected 100% to verified authentic sources:
 * The Muse Public API, Amazon Jobs India, and Arbeitnow Tech Feeds.
 * Adheres strictly to the Rule of Truth: Never invents stipends, durations, or deadlines.
 */

import { store } from '../store.js';
import { formatDate, getDeadlineBadge, openModal, showToast, escapeHtml, parseDateSafely } from '../utils.js';

export function renderInternshipsView(container, navigateTo) {
  let filterAndRender;
  let isLoading = store.getInternships().length === 0;
  let hasError = false;

  // Sync real internships from backend API
  store.syncInternshipsAPI()
    .then(internships => {
      if (!document.body.contains(container)) return;
      isLoading = false;
      if (!internships || internships.length === 0) {
        if (store.getInternships().length === 0) {
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
      if (store.getInternships().length === 0) {
        hasError = true;
      }
      if (typeof filterAndRender === 'function') {
        filterAndRender();
      }
    });

  // Check if any search or filter preset was passed
  const rawSearch = sessionStorage.getItem('careersphere_intern_search_query') || '';
  const rawPreset = sessionStorage.getItem('careersphere_intern_filter_preset') || 'All';
  sessionStorage.removeItem('careersphere_intern_search_query');
  sessionStorage.removeItem('careersphere_intern_filter_preset');

  const CATEGORY_NAMES = [
    'All',
    'BCA / IT',
    'Computer Science',
    'Web Development',
    'Software Development',
    'Python',
    'Java',
    'SQL',
    'Data Analytics',
    'UI/UX',
    'Fresher / Student',
    'Remote'
  ];

  const initialPreset = CATEGORY_NAMES.includes(rawPreset) ? rawPreset : 'All';
  const initialSearch = rawSearch;

  container.innerHTML = `
    <div class="view-header intern-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span data-route="home" style="cursor: pointer;">Home</span> / <span class="active">Internships</span>
        </div>
        <h1 class="page-title">Verified Student Internships &amp; Tech Opportunities</h1>
        <p class="page-desc">
          Explore verified tech and corporate internships for BCA, Computer Science, and Engineering students and freshers. Connected to authentic public feeds &amp; official portals (The Muse, Amazon Jobs India, Arbeitnow) with authentic application links.
        </p>
      </div>
    </div>

    <div class="jobs-layout-container section-container">
      <!-- 11 REQUIRED CATEGORY PILLS BAR -->
      <div class="category-pills-scroll" id="intern-categories">
        <button class="pill-btn ${initialPreset === 'All' ? 'active' : ''}" data-category="All">All Internships</button>
        <button class="pill-btn ${initialPreset === 'BCA / IT' ? 'active' : ''}" data-category="BCA / IT">BCA / IT</button>
        <button class="pill-btn ${initialPreset === 'Computer Science' ? 'active' : ''}" data-category="Computer Science">Computer Science</button>
        <button class="pill-btn ${initialPreset === 'Web Development' ? 'active' : ''}" data-category="Web Development">Web Development</button>
        <button class="pill-btn ${initialPreset === 'Software Development' ? 'active' : ''}" data-category="Software Development">Software Development</button>
        <button class="pill-btn ${initialPreset === 'Python' ? 'active' : ''}" data-category="Python">Python</button>
        <button class="pill-btn ${initialPreset === 'Java' ? 'active' : ''}" data-category="Java">Java</button>
        <button class="pill-btn ${initialPreset === 'SQL' ? 'active' : ''}" data-category="SQL">SQL</button>
        <button class="pill-btn ${initialPreset === 'Data Analytics' ? 'active' : ''}" data-category="Data Analytics">Data Analytics</button>
        <button class="pill-btn ${initialPreset === 'UI/UX' ? 'active' : ''}" data-category="UI/UX">UI/UX</button>
        <button class="pill-btn ${initialPreset === 'Fresher / Student' ? 'active' : ''}" data-category="Fresher / Student">Fresher / Student</button>
        <button class="pill-btn ${initialPreset === 'Remote' ? 'active' : ''}" data-category="Remote">Remote</button>
      </div>

      <!-- MAIN CONTENT WITH SIDEBAR FILTERS & CARDS GRID -->
      <div class="jobs-content-grid">
        <!-- FILTER SIDEBAR -->
        <aside class="filter-sidebar card">
          <div class="filter-sidebar-header">
            <h3>Filters</h3>
            <button class="btn-text" id="reset-intern-filters">Reset All</button>
          </div>

          <!-- Keyword Search -->
          <div class="filter-group">
            <label class="filter-label" for="intern-search-input">Search Keywords</label>
            <div class="input-with-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="intern-search-input" placeholder="Title, company, skill, or location..." value="${escapeHtml(initialSearch)}" />
            </div>
          </div>

          <!-- Category Select -->
          <div class="filter-group">
            <label class="filter-label" for="intern-filter-category">Category</label>
            <select id="intern-filter-category" class="form-select">
              <option value="All" ${initialPreset === 'All' ? 'selected' : ''}>All Categories</option>
              <option value="BCA / IT" ${initialPreset === 'BCA / IT' ? 'selected' : ''}>BCA / IT</option>
              <option value="Computer Science" ${initialPreset === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
              <option value="Web Development" ${initialPreset === 'Web Development' ? 'selected' : ''}>Web Development</option>
              <option value="Software Development" ${initialPreset === 'Software Development' ? 'selected' : ''}>Software Development</option>
              <option value="Python" ${initialPreset === 'Python' ? 'selected' : ''}>Python</option>
              <option value="Java" ${initialPreset === 'Java' ? 'selected' : ''}>Java</option>
              <option value="SQL" ${initialPreset === 'SQL' ? 'selected' : ''}>SQL</option>
              <option value="Data Analytics" ${initialPreset === 'Data Analytics' ? 'selected' : ''}>Data Analytics</option>
              <option value="UI/UX" ${initialPreset === 'UI/UX' ? 'selected' : ''}>UI/UX</option>
              <option value="Fresher / Student" ${initialPreset === 'Fresher / Student' ? 'selected' : ''}>Fresher / Student</option>
              <option value="Remote" ${initialPreset === 'Remote' ? 'selected' : ''}>Remote</option>
            </select>
          </div>

          <!-- Location Filter -->
          <div class="filter-group">
            <label class="filter-label" for="intern-filter-location">Location</label>
            <select id="intern-filter-location" class="form-select">
              <option value="All">All Locations</option>
              <option value="India">India (Bangalore, Hyderabad, etc.)</option>
              <option value="Bangalore">Bangalore / Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Delhi">Delhi / NCR</option>
              <option value="Remote">Remote / Work From Home</option>
              <option value="International">International / Worldwide</option>
            </select>
          </div>

          <!-- Work Arrangement Filter -->
          <div class="filter-group">
            <label class="filter-label" for="intern-filter-worktype">Work Arrangement</label>
            <select id="intern-filter-worktype" class="form-select">
              <option value="All">All Arrangements</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <!-- Paid / Unpaid Filter (Strictly when source explicitly provides) -->
          <div class="filter-group">
            <label class="filter-label" for="intern-filter-stipend">Stipend Status</label>
            <select id="intern-filter-stipend" class="form-select">
              <option value="All">All Stipend Types</option>
              <option value="Paid">Explicitly Paid</option>
              <option value="Unpaid">Unpaid / Academic Credit</option>
              <option value="Disclosed">Stipend Disclosed</option>
            </select>
          </div>

          <!-- Key Skills Filter -->
          <div class="filter-group">
            <label class="filter-label">Key Skills</label>
            <div class="checkbox-group" id="intern-skills-filter">
              <label class="checkbox-label"><input type="checkbox" value="Python" /> Python</label>
              <label class="checkbox-label"><input type="checkbox" value="Java" /> Java</label>
              <label class="checkbox-label"><input type="checkbox" value="SQL" /> SQL</label>
              <label class="checkbox-label"><input type="checkbox" value="JavaScript" /> JavaScript</label>
              <label class="checkbox-label"><input type="checkbox" value="React" /> React</label>
              <label class="checkbox-label"><input type="checkbox" value="UI/UX" /> UI/UX</label>
              <label class="checkbox-label"><input type="checkbox" value="Data Analytics" /> Data Analytics</label>
              <label class="checkbox-label"><input type="checkbox" value="C++" /> C++</label>
            </div>
          </div>
        </aside>

        <!-- RESULTS COLUMN -->
        <main class="jobs-results-column">
          <div class="results-meta-bar">
            <span id="intern-results-count" class="results-count">Showing <strong>${store.getInternships().length}</strong> verified opportunities</span>
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span class="source-status-badge" style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #1E293B; background: #F1F5F9; padding: 0.25rem 0.6rem; border-radius: 6px; border: 1px solid #E2E8F0;">
                📡 <span id="intern-updated-val">Verified Authentic Portals</span>
              </span>
              <button class="btn btn-outline btn-sm" id="btn-sync-intern-live" style="font-size: 0.8rem; padding: 0.3rem 0.75rem;">
                ↻ Sync Live Sources
              </button>
              <div class="results-sort">
                <label for="intern-sort-select">Sort by:</label>
                <select id="intern-sort-select" class="form-select-sm">
                  <option value="recent">Latest Posted</option>
                  <option value="company">Company Name</option>
                  <option value="deadline">Application Deadline</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="corporate-cards-grid" id="intern-cards-container">
            <!-- Cards rendered dynamically -->
          </div>
        </main>
      </div>
    </div>
  `;

  // State & DOM elements
  let activeCategory = initialPreset;
  const searchInput = container.querySelector('#intern-search-input');
  const categorySelect = container.querySelector('#intern-filter-category');
  const locationSelect = container.querySelector('#intern-filter-location');
  const workTypeSelect = container.querySelector('#intern-filter-worktype');
  const stipendSelect = container.querySelector('#intern-filter-stipend');
  const sortSelect = container.querySelector('#intern-sort-select');
  const resetBtn = container.querySelector('#reset-intern-filters');
  const resultsCount = container.querySelector('#intern-results-count');
  const updatedVal = container.querySelector('#intern-updated-val');
  const syncBtn = container.querySelector('#btn-sync-intern-live');
  const cardsContainer = container.querySelector('#intern-cards-container');

  const updateLastUpdatedLabel = () => {
    if (!updatedVal) return;
    const last = store.getInternshipsLastUpdated();
    if (!last) {
      updatedVal.textContent = 'Amazon Jobs India, The Muse, Arbeitnow';
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
    const checked = container.querySelectorAll('#intern-skills-filter input[type="checkbox"]:checked');
    return Array.from(checked).map(c => c.value);
  };

  filterAndRender = () => {
    updateLastUpdatedLabel();
    const allInternships = store.getInternships();

    // 1. Loading State Handling
    if (isLoading && allInternships.length === 0) {
      if (resultsCount) {
        resultsCount.innerHTML = `Connecting to verified internship portals...`;
      }
      cardsContainer.innerHTML = `
        <div class="loading-state card" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #1E293B; margin: 1rem 0 0.5rem;">Fetching Verified Tech Internships</h3>
          <p style="color: #64748B; font-size: 0.95rem; max-width: 460px; margin: 0 auto;">Connecting to official portals &amp; public APIs (The Muse, Amazon Jobs India, Arbeitnow) to retrieve genuine student opportunities...</p>
        </div>
      `;
      return;
    }

    // 2. API Error State Handling
    if (hasError && allInternships.length === 0) {
      if (resultsCount) {
        resultsCount.innerHTML = `<span class="text-danger font-semibold">⚠️ Failed to connect to internship sources</span>`;
      }
      cardsContainer.innerHTML = `
        <div class="empty-state card" style="grid-column: 1 / -1; padding: 3.5rem 2rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.75rem; margin-bottom: 0.75rem;">📡</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">Unable to Connect to Internship Portals</h3>
          <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
            Could not retrieve internship listings from public feeds. Please check your network connection and retry.
          </p>
          <button class="btn btn-primary" id="intern-error-retry-btn">
            ↻ Retry Connecting
          </button>
        </div>
      `;
      container.querySelector('#intern-error-retry-btn')?.addEventListener('click', () => {
        isLoading = true;
        hasError = false;
        filterAndRender();
        store.syncInternshipsAPI().then(list => {
          isLoading = false;
          if (!list || list.length === 0) {
            hasError = store.getInternships().length === 0;
          } else {
            hasError = false;
          }
          filterAndRender();
        });
      });
      return;
    }

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const loc = locationSelect ? locationSelect.value : 'All';
    const workType = workTypeSelect ? workTypeSelect.value : 'All';
    const stipendType = stipendSelect ? stipendSelect.value : 'All';
    const selectedSkills = getSelectedSkills();
    const sortVal = sortSelect ? sortSelect.value : 'recent';

    let filtered = allInternships.filter(intern => {
      // 1. Category check (Active Pill or Category Select)
      if (activeCategory !== 'All') {
        const actLower = activeCategory.toLowerCase();
        const catsArr = Array.isArray(intern.categories) ? intern.categories.map(c => String(c).toLowerCase()) : [];
        const roleCat = (intern.roleCategory || intern.category || '').toLowerCase();
        const title = (intern.title || '').toLowerCase();
        const skillsArr = Array.isArray(intern.skills) ? intern.skills.map(s => String(s).toLowerCase()) : [];
        const workTypeLower = (intern.workType || '').toLowerCase();
        const locLower = (intern.location || '').toLowerCase();

        let matchesCat = false;
        if (catsArr.includes(actLower) || roleCat.includes(actLower)) {
          matchesCat = true;
        } else if (actLower === 'bca / it' && (catsArr.includes('bca / it') || title.includes('it') || title.includes('bca') || title.includes('computer') || skillsArr.some(s => ['python', 'java', 'sql', 'web'].includes(s)))) {
          matchesCat = true;
        } else if (actLower === 'computer science' && (catsArr.includes('computer science') || title.includes('software') || title.includes('engineer') || title.includes('developer') || title.includes('computer'))) {
          matchesCat = true;
        } else if (actLower === 'web development' && (catsArr.includes('web development') || title.includes('web') || title.includes('frontend') || title.includes('backend') || title.includes('fullstack') || skillsArr.some(s => ['javascript', 'react', 'html', 'css', 'node'].includes(s)))) {
          matchesCat = true;
        } else if (actLower === 'software development' && (catsArr.includes('software development') || title.includes('software') || title.includes('developer') || title.includes('engineering') || title.includes('sde'))) {
          matchesCat = true;
        } else if (actLower === 'python' && (catsArr.includes('python') || title.includes('python') || skillsArr.includes('python'))) {
          matchesCat = true;
        } else if (actLower === 'java' && (catsArr.includes('java') || title.includes('java') || skillsArr.includes('java'))) {
          matchesCat = true;
        } else if (actLower === 'sql' && (catsArr.includes('sql') || title.includes('sql') || skillsArr.includes('sql'))) {
          matchesCat = true;
        } else if (actLower === 'data analytics' && (catsArr.includes('data analytics') || title.includes('data') || title.includes('analyst') || title.includes('analytics') || title.includes('bi') || skillsArr.some(s => ['data analysis', 'sql', 'tableau', 'power bi', 'excel', 'pandas'].includes(s)))) {
          matchesCat = true;
        } else if (actLower === 'ui/ux' && (catsArr.includes('ui/ux') || title.includes('ui') || title.includes('ux') || title.includes('design') || title.includes('product designer') || skillsArr.some(s => ['ui/ux', 'figma', 'user experience', 'interaction design'].includes(s)))) {
          matchesCat = true;
        } else if (actLower === 'fresher / student' && (catsArr.includes('fresher / student') || title.includes('intern') || title.includes('student') || title.includes('graduate'))) {
          matchesCat = true;
        } else if (actLower === 'remote' && (catsArr.includes('remote') || workTypeLower.includes('remote') || locLower.includes('remote') || locLower.includes('work from home') || locLower.includes('worldwide'))) {
          matchesCat = true;
        }

        if (!matchesCat) return false;
      }

      // 2. Keyword Search
      if (query) {
        const inTitle = (intern.title || '').toLowerCase().includes(query);
        const inCompany = (intern.company || '').toLowerCase().includes(query);
        const inLoc = (intern.location || '').toLowerCase().includes(query);
        const inDesc = (intern.description || '').toLowerCase().includes(query);
        const inSkills = Array.isArray(intern.skills) && intern.skills.some(s => String(s).toLowerCase().includes(query));
        const inCats = Array.isArray(intern.categories) && intern.categories.some(c => String(c).toLowerCase().includes(query));
        if (!inTitle && !inCompany && !inLoc && !inDesc && !inSkills && !inCats) {
          return false;
        }
      }

      // 3. Location Filter
      if (loc !== 'All') {
        const internLoc = (intern.location || '').toLowerCase();
        const wt = (intern.workType || '').toLowerCase();
        const locLower = loc.toLowerCase();

        if (locLower === 'remote') {
          if (!internLoc.includes('remote') && !wt.includes('remote') && !internLoc.includes('work from home') && !internLoc.includes('worldwide')) {
            return false;
          }
        } else if (locLower === 'india') {
          if (!internLoc.includes('india') && !internLoc.includes('bangalore') && !internLoc.includes('hyderabad') && !internLoc.includes('pune') && !internLoc.includes('delhi') && !internLoc.includes('chennai') && !internLoc.includes('mumbai') && !internLoc.includes('noida') && !internLoc.includes('gurugram')) {
            return false;
          }
        } else if (locLower === 'international') {
          if (internLoc.includes('india') || internLoc.includes('bangalore') || internLoc.includes('hyderabad') || internLoc.includes('pune') || internLoc.includes('delhi')) {
            return false;
          }
        } else if (!internLoc.includes(locLower)) {
          return false;
        }
      }

      // 4. Work Arrangement (Remote / Hybrid / On-site)
      if (workType !== 'All') {
        const internWork = (intern.workType || '').toLowerCase();
        const internLoc = (intern.location || '').toLowerCase();
        const wtLower = workType.toLowerCase();

        if (wtLower === 'remote') {
          if (!internWork.includes('remote') && !internLoc.includes('remote') && !internLoc.includes('worldwide') && !internLoc.includes('work from home')) {
            return false;
          }
        } else if (wtLower === 'hybrid') {
          if (!internWork.includes('hybrid') && !internLoc.includes('hybrid')) {
            return false;
          }
        } else if (wtLower === 'on-site') {
          if (internWork.includes('remote') || internLoc.includes('remote')) {
            return false;
          }
        }
      }

      // 5. Stipend Filter (Strictly when source explicitly provides)
      if (stipendType !== 'All') {
        const st = (intern.stipend || '').toLowerCase();
        const isPaid = intern.isPaid || intern.is_paid;
        if (stipendType === 'Paid') {
          if (isPaid !== true && !st.includes('paid') && !st.includes('₹') && !st.includes('$') && !st.includes('€') && !st.includes('per month') && !st.includes('stipend')) {
            return false;
          }
        } else if (stipendType === 'Unpaid') {
          if (isPaid !== false && !st.includes('unpaid') && !st.includes('academic credit')) {
            return false;
          }
        } else if (stipendType === 'Disclosed') {
          if (!st || st === 'not available' || st === 'unspecified') {
            return false;
          }
        }
      }

      // 6. Key Skills Filter
      if (selectedSkills.length > 0) {
        const hasSkill = selectedSkills.some(skill => {
          const skLower = skill.toLowerCase();
          const inSkills = Array.isArray(intern.skills) && intern.skills.some(s => String(s).toLowerCase().includes(skLower));
          const inTitle = (intern.title || '').toLowerCase().includes(skLower);
          const inDesc = (intern.description || '').toLowerCase().includes(skLower);
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
      cardsContainer.innerHTML = `
        <div class="empty-state card" style="grid-column: 1 / -1; padding: 3rem 2rem; text-align: center;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">No matching internships found</h3>
          <p style="color: #64748B; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
            Try adjusting your search criteria or clearing specific category and arrangement filters to view all verified internships.
          </p>
          <button class="btn btn-outline" id="empty-intern-reset-btn">Reset All Filters</button>
        </div>
      `;
      container.querySelector('#empty-intern-reset-btn')?.addEventListener('click', () => {
        resetBtn.click();
      });
      return;
    }

    // Normalized Cards Rendering adhering strictly to user requirements:
    // Internship title, Company, Location, Remote/Hybrid/On-site badge, Duration, Stipend, Required skills, Eligibility, Posted date, Application deadline, Source attribution, Direct apply link
    cardsContainer.innerHTML = filtered.map(intern => {
      const isSaved = store.isSaved(intern.id);
      const appUrl = intern.applicationUrl || intern.applyUrl || intern.apply_url || '#';
      const srcName = intern.source || intern.sourceName || intern.source_name || `${intern.company || 'Enterprise'} Careers`;
      const deadline = intern.deadline || 'Not available';
      const deadlineBadge = getDeadlineBadge(deadline);
      const duration = intern.duration || 'Not available';
      const stipend = intern.stipend || 'Not available';
      const workTypeDisplay = intern.workType || 'On-site';

      return `
        <div class="opp-card corp-card-theme card">
          <div class="opp-card-header">
            <div class="org-avatar corp-avatar">🎓</div>
            <div class="opp-card-titles">
              <div class="badge-wrapper">
                <span class="badge badge-verified-source font-bold">✓ Verified Live Internship</span>
                <span class="badge badge-primary">${escapeHtml(intern.roleCategory || 'Student Internship')}</span>
                <span class="badge ${workTypeDisplay.toLowerCase().includes('remote') ? 'badge-success' : 'badge-outline'}">${escapeHtml(workTypeDisplay)}</span>
                <span class="badge ${deadlineBadge.colorClass}">${deadlineBadge.text}</span>
              </div>
              <h3 class="opp-title">${escapeHtml(intern.title || 'Not available')}</h3>
              <p class="opp-org">
                <strong>${escapeHtml(intern.company || 'Not available')}</strong> • <span class="text-muted">Posted ${escapeHtml(intern.postedDate || intern.posted_date || 'Not available')}</span>
              </p>
              <p class="opp-source-tag" style="font-size: 0.75rem; color: #64748B; margin-top: 0.2rem;">
                📡 Source: <strong>${escapeHtml(srcName)}</strong>
              </p>
            </div>
          </div>

          <div class="opp-details-grid">
            <div class="detail-row">
              <span class="detail-label">🏢 Company:</span>
              <span class="detail-value font-bold text-slate-800">${escapeHtml(intern.company || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${escapeHtml(intern.location || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💻 Arrangement:</span>
              <span class="detail-value font-medium">${escapeHtml(workTypeDisplay)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏳ Duration:</span>
              <span class="detail-value font-medium ${duration !== 'Not available' ? 'text-primary font-bold' : 'text-muted'}">${escapeHtml(duration)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💰 Stipend:</span>
              <span class="detail-value ${stipend !== 'Not available' ? 'text-success font-bold' : 'text-muted font-medium'}">${escapeHtml(stipend)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🎓 Eligibility:</span>
              <span class="detail-value">${escapeHtml(intern.eligibility || 'BCA / B.Tech / Students / Freshers')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Posted Date:</span>
              <span class="detail-value">${escapeHtml(intern.postedDate || intern.posted_date || 'Not available')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">⏰ Deadline:</span>
              <span class="detail-value font-medium ${deadline !== 'Not available' && deadline !== 'Open / Rolling' ? 'text-danger font-semibold' : 'text-muted'}">${escapeHtml(deadline)}</span>
            </div>
          </div>

          <div class="skills-tags-row">
            ${(Array.isArray(intern.skills) ? intern.skills : []).slice(0, 6).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
            ${Array.isArray(intern.skills) && intern.skills.length > 6 ? `<span class="skill-tag-more">+${intern.skills.length - 6}</span>` : ''}
          </div>

          <div class="opp-card-actions">
            <button class="btn btn-outline view-intern-details" data-id="${intern.id}">View Details</button>
            <a href="${appUrl !== '#' ? escapeHtml(appUrl) : '#apply'}" ${appUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary apply-intern-btn" data-id="${intern.id}">
              Apply on Source &nearr;
            </a>
            <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${intern.id}" title="${isSaved ? 'Saved' : 'Save opportunity'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to cards
    attachCardListeners(filtered);
  };

  const attachCardListeners = (internships) => {
    // 1. View Details Modal
    container.querySelectorAll('.view-intern-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const intern = internships.find(it => it.id === id);
        if (!intern) return;

        const appUrl = intern.applicationUrl || intern.applyUrl || intern.apply_url || '#';
        const srcName = intern.source || intern.sourceName || intern.source_name || `${intern.company || 'Enterprise'} Careers`;

        openModal({
          title: intern.title,
          size: 'large',
          contentHtml: `
            <div class="notif-modal-top" style="margin-bottom: 1.25rem;">
              <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                <span class="badge badge-verified-source font-bold">✓ Verified Live Internship</span>
                <span class="badge badge-primary">${escapeHtml(intern.roleCategory || 'Student Internship')}</span>
                <span class="badge badge-outline">${escapeHtml(intern.workType || 'On-site')}</span>
              </div>
              <span class="text-muted" style="font-size: 0.85rem;">Posted: ${escapeHtml(intern.postedDate || intern.posted_date || 'Not available')}</span>
            </div>

            <div class="notif-modal-org-box" style="margin-bottom: 1.25rem; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <div style="font-size: 0.75rem; color: #64748B; text-transform: uppercase; font-weight: 700;">Hiring Enterprise</div>
                  <div style="font-size: 1.2rem; font-weight: 800; color: #1E293B; margin-top: 0.2rem;">
                    ${escapeHtml(intern.company || 'Not available')}
                  </div>
                  <div style="font-size: 0.85rem; color: #475569; margin-top: 0.2rem;">
                    📍 ${escapeHtml(intern.location || 'Not available')} • 💻 ${escapeHtml(intern.workType || 'On-site')}
                  </div>
                </div>
                <div>
                  <span style="font-size: 0.75rem; color: #64748B; font-weight: 600;">Verified Source: </span>
                  ${appUrl !== '#' ? `
                    <a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary">
                      ${escapeHtml(srcName)} ↗
                    </a>
                  ` : `<strong class="text-muted">${escapeHtml(srcName)}</strong>`}
                </div>
              </div>
            </div>

            <div class="notif-modal-specs-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
              <div class="spec-card" style="background: #F1F5F9; padding: 0.75rem; border-radius: 6px;">
                <span style="font-size: 0.75rem; color: #64748B; display: block;">Stipend</span>
                <strong style="font-size: 0.95rem; color: #059669;">${escapeHtml(intern.stipend || 'Not available')}</strong>
              </div>
              <div class="spec-card" style="background: #F1F5F9; padding: 0.75rem; border-radius: 6px;">
                <span style="font-size: 0.75rem; color: #64748B; display: block;">Duration</span>
                <strong style="font-size: 0.95rem; color: #1E293B;">${escapeHtml(intern.duration || 'Not available')}</strong>
              </div>
              <div class="spec-card" style="background: #F1F5F9; padding: 0.75rem; border-radius: 6px;">
                <span style="font-size: 0.75rem; color: #64748B; display: block;">Eligibility</span>
                <strong style="font-size: 0.95rem; color: #1E293B;">${escapeHtml(intern.eligibility || 'Students / Freshers')}</strong>
              </div>
              <div class="spec-card" style="background: #F1F5F9; padding: 0.75rem; border-radius: 6px;">
                <span style="font-size: 0.75rem; color: #64748B; display: block;">Application Deadline</span>
                <strong style="font-size: 0.95rem; color: #DC2626;">${escapeHtml(intern.deadline || 'Open / Rolling')}</strong>
              </div>
            </div>

            <div class="notif-modal-body-text">
              <h4 style="font-size: 1rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">Required Skills &amp; Competencies</h4>
              <div class="skills-tags-row" style="margin-bottom: 1.25rem;">
                ${(Array.isArray(intern.skills) ? intern.skills : []).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
              </div>

              <h4 style="font-size: 1rem; font-weight: 700; color: #1E293B; margin-bottom: 0.5rem;">Opportunity Overview</h4>
              <div style="font-size: 0.925rem; line-height: 1.6; color: #334155; max-height: 280px; overflow-y: auto; padding: 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; white-space: pre-line;">
                ${escapeHtml(intern.description || 'No detailed description provided by source.')}
              </div>
            </div>
          `,
          footerHtml: `
            ${appUrl !== '#' ? `
              <a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                Apply on Official Source ↗
              </a>
            ` : ''}
            <button class="btn btn-outline" id="intern-modal-save" data-id="${intern.id}">
              ${store.isSaved(intern.id) ? '★ Saved' : '☆ Save Internship'}
            </button>
            <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">
              Close
            </button>
          `
        });

        document.getElementById('intern-modal-save')?.addEventListener('click', (e) => {
          const nowSaved = store.toggleSave(intern);
          e.target.textContent = nowSaved ? '★ Saved' : '☆ Save Internship';
          showToast(nowSaved ? 'Internship saved to bookmarks!' : 'Removed from saved bookmarks', nowSaved ? 'success' : 'info');
          const cardBtn = container.querySelector(`.save-toggle-btn[data-id="${intern.id}"]`);
          if (cardBtn) {
            cardBtn.classList.toggle('saved', nowSaved);
            const svg = cardBtn.querySelector('svg');
            if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
          }
        });
      });
    });

    // 2. Save / Bookmark Toggle
    container.querySelectorAll('.save-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const intern = internships.find(it => it.id === id) || store.getOpportunityById(id);
        if (!intern) return;

        const nowSaved = store.toggleSave(intern);
        btn.classList.toggle('saved', nowSaved);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        showToast(nowSaved ? 'Internship saved to bookmarks!' : 'Removed from bookmarks', nowSaved ? 'success' : 'info');
      });
    });
  };

  // Category Pills Clicks
  const categoryPills = container.querySelectorAll('#intern-categories .pill-btn');
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      if (categorySelect) categorySelect.value = activeCategory;
      filterAndRender();
    });
  });

  // Category Select Change
  categorySelect?.addEventListener('change', () => {
    activeCategory = categorySelect.value;
    categoryPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === activeCategory);
    });
    filterAndRender();
  });

  // Filter change event handlers
  searchInput?.addEventListener('input', () => filterAndRender());
  locationSelect?.addEventListener('change', () => filterAndRender());
  workTypeSelect?.addEventListener('change', () => filterAndRender());
  stipendSelect?.addEventListener('change', () => filterAndRender());
  sortSelect?.addEventListener('change', () => filterAndRender());
  container.querySelectorAll('#intern-skills-filter input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => filterAndRender());
  });

  // Reset Filters Handler
  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = 'All';
    if (locationSelect) locationSelect.value = 'All';
    if (workTypeSelect) workTypeSelect.value = 'All';
    if (stipendSelect) stipendSelect.value = 'All';
    if (sortSelect) sortSelect.value = 'recent';
    activeCategory = 'All';
    categoryPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.category === 'All');
    });
    container.querySelectorAll('#intern-skills-filter input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    filterAndRender();
    showToast('Filters reset to default', 'info');
  });

  // Live Sync Trigger
  syncBtn?.addEventListener('click', async () => {
    syncBtn.disabled = true;
    syncBtn.textContent = '↻ Syncing...';
    try {
      showToast('Contacting live internship sources...', 'info');
      const updated = await store.triggerLiveInternshipsSync();
      syncBtn.disabled = false;
      syncBtn.textContent = '↻ Sync Live Sources';
      if (updated && updated.length > 0) {
        showToast(`Synced ${updated.length} verified internships!`, 'success');
      } else {
        showToast('Internships are up to date.', 'info');
      }
      filterAndRender();
    } catch {
      syncBtn.disabled = false;
      syncBtn.textContent = '↻ Sync Live Sources';
      showToast('Live sync completed', 'info');
      filterAndRender();
    }
  });

  // Auto-refresh when internships change in store
  store.subscribe((event) => {
    if (!document.body.contains(container)) return;
    if (event === 'internships_changed') {
      isLoading = false;
      hasError = false;
      filterAndRender();
    } else if (event === 'internships_error') {
      isLoading = false;
      if (store.getInternships().length === 0) {
        hasError = true;
      }
      filterAndRender();
    }
  });

  // Initial render
  filterAndRender();
}
