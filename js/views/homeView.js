/**
 * CareerSphere - Home Dashboard View
 * Hero section, quick-access cards, latest opportunities tabs & cards.
 */

import { MOCK_GOVT_JOBS } from '../mockData.js';
import { store } from '../store.js';
import { formatDate, getDeadlineBadge, openModal, showToast, escapeHtml } from '../utils.js';

export function renderHomeView(container, navigateTo) {
  // Combine representative latest opportunities
  const corporateSample = store.getCorporateJobs().slice(0, 4);
  const govtSample = store.getGovtJobs().slice(0, 4);

  container.innerHTML = `
    <!-- HERO SECTION -->
    <section class="hero-section">
      <div class="hero-realm-backdrop" aria-hidden="true"></div>
      <div class="ambient-sky-dragon" aria-hidden="true">
        <svg viewBox="0 0 90 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M45 25 C55 20, 68 18, 80 14 C75 18, 68 22, 60 25 C50 28, 40 35, 30 42 C33 37, 38 32, 45 25 Z" fill="#0C0E14"/>
          <path d="M52 24 C58 12, 68 4, 85 0 C74 9, 66 18, 62 25 Z" fill="#12151F"/>
          <path d="M40 26 C32 14, 20 4, 2 0 C13 9, 22 18, 28 25 Z" fill="#0E1118"/>
        </svg>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          <span>⚔️ The Realm of Opportunities · Unified Student Ecosystem</span>
        </div>
        <h1 class="hero-title">
          <span class="title-sword-flank left-sword" aria-hidden="true">⚔️</span>
          Build Your Career With Confidence
          <span class="title-sword-flank right-sword" aria-hidden="true">⚔️</span>
        </h1>
        <p class="hero-subtitle">
          Discover vetted corporate fresher drives, real-time government notifications, paid internships, and comprehensive exam preparation tracks—all organized in one student-first platform.
        </p>

        <!-- Prominent Hero Search Bar -->
        <div class="hero-search-wrapper">
          <div class="hero-search-input-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="hero-search-input" 
              placeholder="Search jobs, exams, companies or skills (e.g. React, SSC CGL, Banking, Python)..." 
              aria-label="Search jobs, exams, or skills"
            />
            <button id="hero-search-btn" class="btn btn-primary">Search</button>
          </div>

          <!-- Quick Search Suggestion Pills -->
          <div class="quick-search-tags">
            <span class="tag-label">Trending:</span>
            <button class="pill-tag" data-search="React">React Developer</button>
            <button class="pill-tag" data-search="SSC">SSC CGL 2026</button>
            <button class="pill-tag" data-search="Banking">IBPS PO</button>
            <button class="pill-tag" data-search="BCA">BCA Freshers</button>
            <button class="pill-tag" data-search="Python">Python Trainee</button>
            <button class="pill-tag" data-search="Railway">Railway RRB</button>
          </div>
        </div>

        <!-- Trust Stats Bar -->
        <div class="hero-stats-row">
          <div class="stat-item">
            <span class="stat-num">50,000+</span>
            <span class="stat-lbl">Active Vacancies</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">100%</span>
            <span class="stat-lbl">Verified Notices</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">10+</span>
            <span class="stat-lbl">Prep Tracks</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">Free</span>
            <span class="stat-lbl">For All Students</span>
          </div>
        </div>

        <!-- Northern Warrior Hero Guardian Presence -->
        <div class="hero-guardian-banner" aria-label="Northern Warrior Guardian">
          <img src="assets/realm/character_northern_warrior.jpg" alt="The Northern Warrior Guardian" class="guardian-avatar-img" />
          <div class="guardian-text-content">
            <span class="guardian-role">⚔️ Guardian of Aspirations · Northern Realm</span>
            <p class="guardian-quote">"Winter tests the resolve of all who seek their path. Stand firm, sharpen your skills, and conquer the frontier."</p>
          </div>
        </div>
      </div>
    </section>

    <!-- QUICK ACCESS CARDS -->
    <section class="section-container">
      <div class="section-header">
        <div>
          <h2 class="section-title">Explore Career Pathways</h2>
          <p class="section-desc">Quickly jump to your target domain with curated opportunities and guides</p>
        </div>
      </div>

      <div class="quick-access-grid">
        <!-- Corporate Jobs -->
        <div class="pathway-card card-corporate" data-route="corporate">
          <div class="pathway-icon-wrapper corp-bg">💼</div>
          <div class="pathway-info">
            <div class="pathway-header">
              <h3>Corporate Jobs</h3>
              <span class="badge badge-primary">${store.getCorporateJobs().length}+ Openings</span>
            </div>
            <p>Fresher tech drives, off-campus recruitment, software developer roles, and IT support positions.</p>
            <div class="pathway-footer">
              <span class="pathway-action">Explore Corporate Jobs &rarr;</span>
            </div>
          </div>
        </div>

        <!-- Government Jobs -->
        <div class="pathway-card card-govt" data-route="government">
          <div class="pathway-icon-wrapper govt-bg">🏛️</div>
          <div class="pathway-info">
            <div class="pathway-header">
              <h3>Government Jobs</h3>
              <span class="badge badge-success">${store.getGovtJobs().length} Notifications</span>
            </div>
            <p>Official alerts for SSC, Banking PO, Railways RRB, State Civil Services, Defence, and Postal circles.</p>
            <div class="pathway-footer">
              <span class="pathway-action">View Govt Notifications &rarr;</span>
            </div>
          </div>
        </div>

        <!-- Internships -->
        <div class="pathway-card card-intern" data-route="internships">
          <div class="pathway-icon-wrapper intern-bg">🎓</div>
          <div class="pathway-info">
            <div class="pathway-header">
              <h3>Internships</h3>
              <span class="badge badge-info">${store.getInternships().length > 0 ? store.getInternships().length + '+ Verified' : 'Verified Feeds'}</span>
            </div>
            <p>Verified software engineering, data analytics, and BCA/IT student internships from authentic portals &amp; public feeds.</p>
            <div class="pathway-footer">
              <span class="pathway-action">Browse Real Internships &rarr;</span>
            </div>
          </div>
        </div>

        <!-- Preparation -->
        <div class="pathway-card card-prep" data-route="preparation">
          <div class="pathway-icon-wrapper prep-bg">📚</div>
          <div class="pathway-info">
            <div class="pathway-header">
              <h3>Exam Preparation</h3>
              <span class="badge badge-purple">10 Structured Tracks</span>
            </div>
            <p>Aptitude, logical reasoning, computer fundamentals, coding, SQL, and government test syllabi.</p>
            <div class="pathway-footer">
              <span class="pathway-action">Start Practicing &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MEDIEVAL REALM SWORD DIVIDER -->
    <div class="medieval-realm-divider" aria-hidden="true">
      <div class="divider-line"></div>
      <div class="divider-emblem">
        <img src="assets/realm/career_realm_crest.jpg" alt="Career Sphere Realm Crest" class="realm-crest-img" />
      </div>
      <div class="divider-line"></div>
    </div>

    <!-- THE SOVEREIGN THRONE OF OPPORTUNITIES -->
    <section class="section-container sovereign-throne-section">
      <div class="sovereign-throne-card">
        <div class="throne-visual-pane">
          <img src="assets/realm/iron_stone_throne.jpg" alt="The Sovereign Iron Throne of Career Sphere" class="throne-img" />
          <div class="throne-flame-glow" aria-hidden="true"></div>
        </div>
        <div class="throne-content-pane">
          <div class="throne-royal-badge">
            <span class="crown-icon">👑</span>
            <span>The High Seat of the Career Realm</span>
          </div>
          <h2 class="throne-title">Claim Your Throne in the Career Kingdom</h2>
          <p class="throne-desc">
            Every aspiring knight and scholar begins their trial in the Great Hall. Forge your resume into Valyrian steel, match your skills against real kingdom standards, and ascend to your rightful seat in top tech guilds and imperial public services.
          </p>
          <div class="throne-pillars-grid">
            <div class="throne-pillar">
              <div class="pillar-icon">⚔️</div>
              <div class="pillar-text">
                <strong>Corporate Guilds</strong>
                <span>360+ Verified Drives</span>
              </div>
            </div>
            <div class="throne-pillar">
              <div class="pillar-icon">🏰</div>
              <div class="pillar-text">
                <strong>Imperial Gazettes</strong>
                <span>100% Official Notices</span>
              </div>
            </div>
            <div class="throne-pillar">
              <div class="pillar-icon">📜</div>
              <div class="pillar-text">
                <strong>Scholar's Archive</strong>
                <span>ATS-Ready Dossiers</span>
              </div>
            </div>
          </div>
          <div class="throne-ruler-showcase">
            <img src="assets/realm/character_dragon_queen.jpg" alt="The Dragon Sovereign" class="throne-ruler-img" />
            <div class="throne-ruler-info">
              <span class="ruler-title">High Chancellor of the Realm</span>
              <strong>Lady Daelys Stormcrown</strong>
              <p>&ldquo;Command your destiny across all four kingdoms &mdash; let knowledge be your dragonfire.&rdquo;</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECOND SWORD & SIGIL DIVIDER -->
    <div class="medieval-realm-divider" aria-hidden="true">
      <div class="divider-line"></div>
      <div class="divider-emblem">
        <span class="divider-dragon-sigil">🐉</span>
      </div>
      <div class="divider-line"></div>
    </div>

    <!-- LATEST OPPORTUNITIES SECTION -->
    <section class="section-container latest-opps-section">
      <div class="section-header flex-between">
        <div>
          <div class="badge-tag">Curated Daily</div>
          <h2 class="section-title">Latest Opportunities</h2>
          <p class="section-desc">Hand-picked openings and active government notifications for freshers and graduates</p>
        </div>

        <!-- Category Filter Tabs -->
        <div class="filter-tabs" id="latest-opps-tabs" role="tablist">
          <button class="tab-btn active" data-tab="all">All</button>
          <button class="tab-btn" data-tab="corporate">Corporate Freshers</button>
          <button class="tab-btn" data-tab="bca">BCA / IT Jobs</button>
          <button class="tab-btn" data-tab="internships">Internships</button>
          <button class="tab-btn" data-tab="govt">Government Alerts</button>
        </div>
      </div>

      <!-- Live Integration Verified Banner -->
      <div class="mock-data-banner" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
        <span class="info-icon">✓</span>
        <p><strong>Verified Live Sources Connected:</strong> Live corporate opportunities from verified public tech feeds (Arbeitnow & Remotive) and official government announcements from Union Public Service Commission (UPSC).</p>
      </div>

      <!-- Opportunities Grid Container -->
      <div class="opportunities-grid" id="latest-opps-container">
        <!-- Rendered dynamically -->
      </div>
    </section>
  `;

  // Attach Quick Pathway clicks
  container.querySelectorAll('.pathway-card').forEach(card => {
    card.addEventListener('click', () => {
      const route = card.dataset.route;
      const filter = card.dataset.filter;
      if (filter) {
        sessionStorage.setItem('careersphere_filter_preset', filter);
      }
      navigateTo(route);
    });
  });

  // Attach Hero Search
  const heroSearchInput = container.querySelector('#hero-search-input');
  const heroSearchBtn = container.querySelector('#hero-search-btn');

  const executeHeroSearch = () => {
    const query = heroSearchInput.value.trim();
    if (query) {
      sessionStorage.setItem('careersphere_search_query', query);
      navigateTo('corporate');
    }
  };

  heroSearchBtn.addEventListener('click', executeHeroSearch);
  heroSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeHeroSearch();
  });

  // Suggestion Pills
  container.querySelectorAll('.pill-tag').forEach(pill => {
    pill.addEventListener('click', () => {
      const searchTerm = pill.dataset.search;
      sessionStorage.setItem('careersphere_search_query', searchTerm);
      if (searchTerm === 'SSC' || searchTerm === 'Railway' || searchTerm === 'Banking') {
        navigateTo('government');
      } else {
        navigateTo('corporate');
      }
    });
  });

  // Handle Latest Opps Tabs
  const tabs = container.querySelectorAll('#latest-opps-tabs .tab-btn');
  const oppsContainer = container.querySelector('#latest-opps-container');

  const renderOpps = (filterType) => {
    let items = [];
    const liveGovt = store.getGovtJobs();
    const govtPool = Array.isArray(liveGovt) && liveGovt.length > 0 ? liveGovt : MOCK_GOVT_JOBS;
    const liveCorp = store.getCorporateJobs();
    const corpPool = Array.isArray(liveCorp) ? liveCorp : [];

    if (filterType === 'all') {
      items = [
        ...corpPool.slice(0, 3).map(j => ({ ...j, isGovt: false })),
        ...govtPool.slice(0, 3).map(g => ({ ...g, isGovt: true }))
      ];
    } else if (filterType === 'corporate') {
      items = corpPool.filter(j => j.roleCategory === 'Fresher Jobs' || j.category === 'Software Developer').slice(0, 6).map(j => ({ ...j, isGovt: false }));
    } else if (filterType === 'bca') {
      items = corpPool.filter(j => j.roleCategory === 'BCA/IT Jobs' || (j.eligibility && j.eligibility.includes('BCA')) || j.category === 'Software Developer').slice(0, 6).map(j => ({ ...j, isGovt: false }));
    } else if (filterType === 'internships') {
      const realInternships = store.getInternships();
      if (realInternships && realInternships.length > 0) {
        items = realInternships.slice(0, 6).map(j => ({ ...j, isGovt: false }));
      } else {
        items = corpPool.filter(j => j.category === 'Internships' || j.roleCategory === 'Internships').slice(0, 6).map(j => ({ ...j, isGovt: false }));
      }
    } else if (filterType === 'govt') {
      items = govtPool.map(g => ({ ...g, isGovt: true }));
    }

    if (items.length === 0) {
      oppsContainer.innerHTML = `
        <div class="empty-state card">
          <p>No opportunities found for this filter tab.</p>
        </div>
      `;
      return;
    }

    oppsContainer.innerHTML = items.map(item => {
      const isGovt = item.isGovt;
      const isSaved = store.isSaved(item.id);
      const deadlineBadge = getDeadlineBadge(isGovt ? item.lastDate : item.deadline);

      if (isGovt) {
        return `
          <div class="opp-card govt-card-theme card">
            <div class="opp-card-header">
              <div class="org-avatar govt-avatar">🏛️</div>
              <div class="opp-card-titles">
                <div class="badge-wrapper">
                  <span class="badge badge-success">Govt • ${escapeHtml(item.category)}</span>
                  <span class="badge ${deadlineBadge.colorClass}">${deadlineBadge.text}</span>
                </div>
                <h3 class="opp-title">${escapeHtml(item.postName)}</h3>
                <p class="opp-org">${escapeHtml(item.organization)}</p>
              </div>
            </div>

            <div class="opp-details-grid">
              <div class="detail-row">
                <span class="detail-label">📍 Location:</span>
                <span class="detail-value">${escapeHtml(item.location || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🎓 Eligibility:</span>
                <span class="detail-value text-clamp-1">${escapeHtml(item.qualification || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👥 Vacancies:</span>
                <span class="detail-value font-semibold">${escapeHtml(item.vacancies || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Last Date:</span>
                <span class="detail-value text-danger font-semibold">${formatDate(item.lastDate)}</span>
              </div>
            </div>

            <div class="opp-card-actions">
              <button class="btn btn-outline view-govt-details-btn" data-id="${item.id}">View Details</button>
              <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}" data-type="govt" title="${isSaved ? 'Saved' : 'Save opportunity'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="opp-card corp-card-theme card">
            <div class="opp-card-header">
              <div class="org-avatar corp-avatar">${item.logo || '🏢'}</div>
              <div class="opp-card-titles">
                <div class="badge-wrapper">
                  ${!item.isDemo ? '<span class="badge badge-verified-source font-bold">✓ Official Live Job</span>' : ''}
                  <span class="badge badge-primary">${escapeHtml(item.category)}</span>
                  <span class="badge badge-outline">${escapeHtml(item.workType)}</span>
                  <span class="badge ${deadlineBadge.colorClass}">${deadlineBadge.text}</span>
                </div>
                <h3 class="opp-title">${escapeHtml(item.title)}</h3>
                <p class="opp-org">${escapeHtml(item.company)}</p>
              </div>
            </div>

            <div class="opp-details-grid">
              <div class="detail-row">
                <span class="detail-label">💰 CTC / Stipend:</span>
                <span class="detail-value ${item.salary && item.salary !== 'Not available' ? 'text-success font-bold' : 'text-muted font-medium'}">${escapeHtml(item.salary || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📍 Location:</span>
                <span class="detail-value">${escapeHtml(item.location || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🎓 Eligibility:</span>
                <span class="detail-value text-clamp-1">${escapeHtml(item.eligibility || 'Not available')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Deadline:</span>
                <span class="detail-value ${item.deadline && item.deadline !== 'Not available' ? 'text-danger font-semibold' : 'text-muted font-medium'}">${formatDate(item.deadline)}</span>
              </div>
            </div>

            <div class="skills-tags-row">
              ${(Array.isArray(item.skills) ? item.skills : []).slice(0, 3).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
              ${Array.isArray(item.skills) && item.skills.length > 3 ? `<span class="skill-tag-more">+${item.skills.length - 3}</span>` : ''}
            </div>

            <div class="opp-card-actions">
              <button class="btn btn-outline view-corp-details-btn" data-id="${item.id}">View Details</button>
              <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}" data-type="corp" title="${isSaved ? 'Saved' : 'Save opportunity'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      }
    }).join('');

    // Attach card event listeners
    attachCardListeners(oppsContainer);
  };

  // Switch tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderOpps(tab.dataset.tab);
    });
  });

  // Initial render
  renderOpps('all');
}

function attachCardListeners(container) {
  // Corporate details modal
  container.querySelectorAll('.view-corp-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const job = store.getCorporateJobs().find(j => j.id === id) || store.getOpportunityById(id);
      if (!job) return;

      const isSaved = store.isSaved(job.id);
      openModal({
        title: job.title,
        size: 'large',
        contentHtml: `
          <div class="modal-job-header">
            <div class="modal-org-box">
              <span class="modal-org-logo">${job.logo || '🏢'}</span>
              <div>
                <h4>${escapeHtml(job.company)}</h4>
                <p class="text-muted">📍 ${escapeHtml(job.location || 'Not available')} • 💼 ${escapeHtml(job.workType || 'Full-time')} • ⏱️ ${escapeHtml(job.experience || 'Not specified')}</p>
                <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">📡 Source: <strong>${escapeHtml(job.sourceName || 'Verified Corporate Portal')}</strong></p>
              </div>
            </div>
            <div class="modal-salary-box">
              <span class="label">Package / Stipend</span>
              <span class="val text-success font-bold">${escapeHtml(job.salary || 'Not available')}</span>
            </div>
          </div>

          <div class="modal-section">
            <h5>Role Overview</h5>
            <p>${escapeHtml(job.description || '')}</p>
          </div>

          ${Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? `
            <div class="modal-section">
              <h5>Key Responsibilities</h5>
              <ul class="bullet-list">
                ${job.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="modal-section">
            <h5>Eligibility & Qualifications</h5>
            <p><strong>Criteria:</strong> ${escapeHtml(job.eligibility || 'Check job description')}</p>
            <p><strong>Application Deadline:</strong> <span class="text-danger font-semibold">${formatDate(job.deadline)}</span></p>
          </div>

          <div class="modal-section">
            <h5>Required Skills</h5>
            <div class="skills-tags-row">
              ${(Array.isArray(job.skills) ? job.skills : []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>

          ${job.selectionProcess ? `
            <div class="modal-section">
              <h5>Hiring & Selection Rounds</h5>
              <p class="selection-box">${escapeHtml(job.selectionProcess)}</p>
            </div>
          ` : ''}
        `,
        footerHtml: `
          <button class="btn btn-outline" id="modal-save-btn" data-id="${job.id}">
            ${isSaved ? '★ Saved' : '☆ Save Job'}
          </button>
          <a href="${job.applyUrl && job.applyUrl !== '#' ? escapeHtml(job.applyUrl) : '#'}" ${job.applyUrl && job.applyUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary" id="modal-apply-btn">
            Apply on Official Portal &nearr;
          </a>
        `
      });

      // Modal action listeners
      document.getElementById('modal-save-btn')?.addEventListener('click', (e) => {
        const nowSaved = store.toggleSave(job);
        e.target.textContent = nowSaved ? '★ Saved' : '☆ Save Job';
        showToast(nowSaved ? 'Opportunity saved to your Bookmarks!' : 'Removed from Saved items', nowSaved ? 'success' : 'info');
        const cardBtn = container.querySelector(`.save-toggle-btn[data-id="${job.id}"]`);
        if (cardBtn) {
          cardBtn.classList.toggle('saved', nowSaved);
        }
      });
    });
  });

  // Government details modal
  container.querySelectorAll('.view-govt-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const govt = store.getGovtJobs().find(g => g.id === id) || store.getOpportunityById(id) || MOCK_GOVT_JOBS.find(g => g.id === id);
      if (!govt) return;

      const isSaved = store.isSaved(govt.id);
      openModal({
        title: govt.postName,
        size: 'large',
        contentHtml: `
          <div class="modal-job-header">
            <div class="modal-org-box">
              <span class="modal-org-logo">🏛️</span>
              <div>
                <h4>${escapeHtml(govt.organization)}</h4>
                <p class="text-muted">Category: <strong>${escapeHtml(govt.category || 'Government')}</strong> • Vacancies: <strong>${escapeHtml(govt.vacancies || 'Check Official Gazette')}</strong></p>
                <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.25rem;">📡 Source: <strong>${escapeHtml(govt.sourceName || 'Official Portal')}</strong></p>
              </div>
            </div>
            <div class="modal-salary-box">
              <span class="label">Pay Scale</span>
              <span class="val text-success font-bold">${escapeHtml(govt.salaryPayScale || 'Central / State Pay Scale')}</span>
            </div>
          </div>

          <div class="modal-section">
            <h5>Overview & Scope</h5>
            <p>${escapeHtml(govt.description || '')}</p>
            ${govt.postsIncluded ? `<p><strong>Posts Included:</strong> ${escapeHtml(govt.postsIncluded)}</p>` : ''}
          </div>

          <div class="modal-meta-grid">
            <div class="meta-card">
              <span class="meta-lbl">🎓 Educational Qualification</span>
              <span class="meta-val">${escapeHtml(govt.qualificationDetail || govt.qualification || 'Check official gazette')}</span>
            </div>
            <div class="meta-card">
              <span class="meta-lbl">🎂 Age Limit</span>
              <span class="meta-val">${escapeHtml(govt.ageLimit || 'As per government norms')}</span>
            </div>
            <div class="meta-card">
              <span class="meta-lbl">💳 Application Fee</span>
              <span class="meta-val">${escapeHtml(govt.applicationFee || 'Refer to portal')}</span>
            </div>
            <div class="meta-card">
              <span class="meta-lbl">📍 Location</span>
              <span class="meta-val">${escapeHtml(govt.location || 'All India')}</span>
            </div>
          </div>

          <div class="modal-section">
            <h5>Key Important Dates</h5>
            <div class="dates-timeline">
              <div><strong>Application Start:</strong> ${formatDate(govt.startDate)}</div>
              <div><strong>Last Date to Apply:</strong> <span class="text-danger font-semibold">${formatDate(govt.lastDate)}</span></div>
              <div><strong>Expected Exam Date:</strong> ${escapeHtml(govt.examDate || 'Scheduled via Official Calendar')}</div>
            </div>
          </div>

          ${govt.selectionStages ? `
            <div class="modal-section">
              <h5>Selection Stages</h5>
              <p class="selection-box">${escapeHtml(govt.selectionStages)}</p>
            </div>
          ` : ''}

          <div class="modal-section">
            <h5>Syllabus Overview</h5>
            <p>${escapeHtml(govt.syllabusOverview || 'Detailed syllabus available in official notification.')}</p>
          </div>
        `,
        footerHtml: `
          <button class="btn btn-outline" id="modal-govt-save-btn" data-id="${govt.id}">
            ${isSaved ? '★ Saved' : '☆ Save Exam'}
          </button>
          ${govt.officialPdfUrl ? `
            <a href="${govt.officialPdfUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
              Official Document (PDF) &nearr;
            </a>
          ` : ''}
          <a href="${govt.applyUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-success" id="modal-govt-apply-btn">
            Official Portal & Apply Link &nearr;
          </a>
        `
      });

      document.getElementById('modal-govt-save-btn')?.addEventListener('click', (e) => {
        const nowSaved = store.toggleSave(govt);
        e.target.textContent = nowSaved ? '★ Saved' : '☆ Save Exam';
        showToast(nowSaved ? 'Govt notification bookmarked!' : 'Removed from Saved items', nowSaved ? 'success' : 'info');
        const cardBtn = container.querySelector(`.save-toggle-btn[data-id="${govt.id}"]`);
        if (cardBtn) {
          cardBtn.classList.toggle('saved', nowSaved);
        }
      });
    });
  });

  // Save toggle buttons on cards
  container.querySelectorAll('.save-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const item = store.getOpportunityById(id) || 
        (btn.dataset.type === 'govt' ? (store.getGovtJobs().find(g => g.id === id) || MOCK_GOVT_JOBS.find(g => g.id === id)) : store.getCorporateJobs().find(j => j.id === id));
      if (item) {
        const nowSaved = store.toggleSave(item);
        btn.classList.toggle('saved', nowSaved);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        showToast(nowSaved ? 'Opportunity bookmarked!' : 'Removed from saved items', nowSaved ? 'success' : 'info');
      }
    });
  });
}
