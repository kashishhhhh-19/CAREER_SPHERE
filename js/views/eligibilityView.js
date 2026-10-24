/**
 * CareerSphere - My Eligibility View
 * Form for students to input educational qualification, skills, location, and preferences,
 * with a dynamic intelligent matcher displaying "Opportunities You May Be Eligible For"
 * strictly according to verified requirements in source data.
 */

import { store } from '../store.js';
import { formatDate, getDeadlineBadge, openModal, showToast, escapeHtml } from '../utils.js';

export function renderEligibilityView(container, navigateTo) {
  const criteria = store.getEligibilityProfile();

  container.innerHTML = `
    <div class="view-header eligibility-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">My Eligibility</span>
        </div>
        <div class="header-badge-tag">
          <span>🎯 Smart Opportunity Matcher</span>
        </div>
        <h1 class="page-title">Personalized Eligibility Matcher</h1>
        <p class="page-desc">
          Enter your academic degree, skills, and work preferences. CareerSphere automatically analyzes vacancy requirements and reveals opportunities you are qualified to apply for.
        </p>
        <div class="character-chamber-badge">
          <img src="assets/realm/character_royal_strategist.jpg" alt="Master Tyrion the Keen" class="character-portrait-avatar" />
          <div class="character-badge-text">
            <span class="role-title">Chief Strategist of the Royal High Council</span>
            <h4>Master Tyrion the Keen</h4>
            <p>&ldquo;A sharp mind pierces through every decree and requirement. Find the gate forged for your intellect.&rdquo;</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- ELIGIBILITY FORM CONTAINER -->
      <div class="card eligibility-form-card">
        <div class="eligibility-form-header">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
              <span class="profile-sync-badge">✓ Synced with Central Profile</span>
              <a href="#profile" style="font-size:0.82rem; color:var(--electric-blue); text-decoration:underline;">Edit in Profile</a>
            </div>
            <h3>Your Academic & Career Profile</h3>
            <p class="text-muted">Populated automatically from your Central Profile. Matches update automatically when your profile changes.</p>
          </div>
          <button class="btn btn-primary" id="calculate-eligibility-btn">
            🔍 Check & Save Eligibility
          </button>
        </div>

        <form id="eligibility-criteria-form" class="eligibility-form-grid">
          <!-- 1. Highest Qualification -->
          <div class="form-group">
            <label class="form-label" for="elig-qualification">Highest Qualification</label>
            <select id="elig-qualification" class="form-select">
              <option value="Graduate (Bachelor's)" ${criteria.highestQualification?.includes('Graduate') ? 'selected' : ''}>Graduate (Bachelor's Degree)</option>
              <option value="10th / 12th Pass" ${criteria.highestQualification?.includes('10th') || criteria.highestQualification?.includes('12th') ? 'selected' : ''}>10th / 12th Pass</option>
              <option value="Diploma" ${criteria.highestQualification?.includes('Diploma') ? 'selected' : ''}>Diploma / Polytechnic</option>
              <option value="Post Graduate (Master's)" ${criteria.highestQualification?.includes('Post') ? 'selected' : ''}>Post Graduate (Master's / MCA / M.Tech)</option>
            </select>
          </div>

          <!-- 2. Degree / Specialization -->
          <div class="form-group">
            <label class="form-label" for="elig-degree">Degree / Major</label>
            <input 
              type="text" 
              id="elig-degree" 
              class="form-control" 
              placeholder="e.g. BCA, B.Tech CS, B.Sc Computer Science" 
              value="${escapeHtml(criteria.degree || '')}" 
              required
            />
          </div>

          <!-- 3. Graduation Status -->
          <div class="form-group">
            <label class="form-label" for="elig-grad-status">Graduation Status</label>
            <select id="elig-grad-status" class="form-select">
              <option value="Pursuing (Final Year)" ${criteria.graduationStatus?.includes('Final') ? 'selected' : ''}>Pursuing (Final Year)</option>
              <option value="Pursuing (Pre-Final Year)" ${criteria.graduationStatus?.includes('Pre-Final') ? 'selected' : ''}>Pursuing (Pre-Final Year)</option>
              <option value="Graduated (Passout)" ${criteria.graduationStatus?.includes('Graduated') ? 'selected' : ''}>Graduated (Passout)</option>
            </select>
          </div>

          <!-- 4. Graduation Year -->
          <div class="form-group">
            <label class="form-label" for="elig-grad-year">Graduation Year</label>
            <select id="elig-grad-year" class="form-select">
              <option value="2024" ${criteria.graduationYear === '2024' ? 'selected' : ''}>2024</option>
              <option value="2025" ${criteria.graduationYear === '2025' ? 'selected' : ''}>2025</option>
              <option value="2026" ${criteria.graduationYear === '2026' ? 'selected' : ''}>2026</option>
              <option value="2027" ${criteria.graduationYear === '2027' ? 'selected' : ''}>2027</option>
            </select>
          </div>

          <!-- 5. Technical Skills -->
          <div class="form-group full-grid-width">
            <label class="form-label" for="elig-skills">Skills (Comma-separated)</label>
            <input 
              type="text" 
              id="elig-skills" 
              class="form-control" 
              placeholder="e.g. Python, React, SQL, Java, Data Structures, Linux" 
              value="${escapeHtml(Array.isArray(criteria.skills) ? criteria.skills.join(', ') : (criteria.skills || ''))}" 
            />
            <small class="text-muted">Skills are matched against job prerequisites in real-time</small>
          </div>

          <!-- 6. Experience Level -->
          <div class="form-group">
            <label class="form-label" for="elig-experience">Experience Level</label>
            <select id="elig-experience" class="form-select">
              <option value="Fresher (0-1 yr)" ${criteria.experience?.includes('Fresher') ? 'selected' : ''}>Fresher (0 - 1 yr)</option>
              <option value="Student / Intern" ${criteria.experience?.includes('Intern') ? 'selected' : ''}>Student / Internship Seeker</option>
              <option value="1-2 Years Experience" ${criteria.experience?.includes('1-2') ? 'selected' : ''}>1 - 2 Years Experience</option>
            </select>
          </div>

          <!-- 7. Preferred Location -->
          <div class="form-group">
            <label class="form-label" for="elig-location">Preferred Location</label>
            <input 
              type="text" 
              id="elig-location" 
              class="form-control" 
              placeholder="e.g. Bangalore, Delhi NCR, Hyderabad, Remote" 
              value="${escapeHtml(criteria.preferredLocation || '')}" 
            />
          </div>

          <!-- 8. Preferred Job Type -->
          <div class="form-group">
            <label class="form-label" for="elig-jobtype">Preferred Job Type</label>
            <select id="elig-jobtype" class="form-select">
              <option value="Full-time / Internship" ${criteria.preferredJobType?.includes('Full-time') ? 'selected' : ''}>Full-time / Internship</option>
              <option value="Full-time Only" ${criteria.preferredJobType === 'Full-time Only' ? 'selected' : ''}>Full-time Only</option>
              <option value="Internship Only" ${criteria.preferredJobType === 'Internship Only' ? 'selected' : ''}>Internship Only</option>
              <option value="Remote / Work From Home" ${criteria.preferredJobType?.includes('Remote') ? 'selected' : ''}>Remote / Work From Home</option>
            </select>
          </div>

          <!-- 9. Sector Preference -->
          <div class="form-group">
            <label class="form-label" for="elig-pref">Sector Orientation</label>
            <select id="elig-pref" class="form-select">
              <option value="Both Corporate & Government" ${criteria.careerPreference?.includes('Both') ? 'selected' : ''}>Both Corporate & Government</option>
              <option value="Corporate Jobs Only" ${criteria.careerPreference?.includes('Corporate') && !criteria.careerPreference?.includes('Both') ? 'selected' : ''}>Corporate Jobs Only</option>
              <option value="Government Exams Only" ${criteria.careerPreference?.includes('Government') && !criteria.careerPreference?.includes('Both') ? 'selected' : ''}>Government Exams Only</option>
            </select>
          </div>

          <!-- Calculate & Save Button -->
          <div class="form-group" style="grid-column: 1 / -1; margin-top: 0.5rem; display: flex; justify-content: flex-end;">
            <button type="button" id="calculate-eligibility-btn" class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-weight: 700;">
              ⚡ Calculate &amp; Save Eligibility
            </button>
          </div>
        </form>
      </div>

      <!-- RESULTS SECTION: OPPORTUNITIES YOU MAY BE ELIGIBLE FOR -->
      <section class="eligible-results-section" style="margin-top: 3rem;">
        <div class="section-header flex-between">
          <div>
            <div class="badge-tag" style="background:#ECFDF5; color:#047857;">🎯 Computed Match Results</div>
            <h2 class="section-title">Personalized Opportunity Recommendations</h2>
            <p class="section-desc">Strictly verified against authentic requirements from official corporate and government portals</p>
          </div>
          <span id="eligible-count-badge" class="badge badge-success" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
            <!-- Count populated dynamically -->
          </span>
        </div>

        <!-- 3-State Filter Tabs -->
        <div class="filter-tabs" id="eligibility-state-tabs" style="margin-top: 1.25rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <button class="tab-btn active" data-tab="eligible">★ Recommended For You (<span id="tab-count-eligible">0</span>)</button>
          <button class="tab-btn" data-tab="possibly_eligible">? Possibly Eligible (<span id="tab-count-possible">0</span>)</button>
          <button class="tab-btn" data-tab="not_eligible">✕ Not Eligible (<span id="tab-count-not">0</span>)</button>
          <button class="tab-btn" data-tab="all">All Evaluated (<span id="tab-count-all">0</span>)</button>
        </div>

        <div class="opportunities-grid" id="eligible-cards-container">
          <!-- Rendered dynamically -->
        </div>
      </section>
    </div>
  `;

  const resultsContainer = container.querySelector('#eligible-cards-container');
  const countBadge = container.querySelector('#eligible-count-badge');
  const calculateBtn = container.querySelector('#calculate-eligibility-btn');
  const tabsContainer = container.querySelector('#eligibility-state-tabs');

  let activeTab = 'eligible';
  let currentMatchData = {
    eligible: [],
    possiblyEligible: [],
    notEligible: [],
    counts: { eligible: 0, possiblyEligible: 0, notEligible: 0, totalMatched: 0 }
  };

  const renderCurrentCards = () => {
    let itemsToDisplay = [];
    if (!document.body.contains(container)) return;

    if (activeTab === 'eligible') {
      itemsToDisplay = currentMatchData.eligible || [];
    } else if (activeTab === 'possibly_eligible') {
      itemsToDisplay = currentMatchData.possiblyEligible || [];
    } else if (activeTab === 'not_eligible') {
      itemsToDisplay = currentMatchData.notEligible || [];
    } else if (activeTab === 'all') {
      itemsToDisplay = [
        ...(currentMatchData.eligible || []),
        ...(currentMatchData.possiblyEligible || []),
        ...(currentMatchData.notEligible || [])
      ];
    }

    // Update counts on tabs
    const counts = currentMatchData.counts || { eligible: 0, possiblyEligible: 0, notEligible: 0, totalMatched: 0 };
    const elAll = container.querySelector('#tab-count-all');
    const elElig = container.querySelector('#tab-count-eligible');
    const elPoss = container.querySelector('#tab-count-possible');
    const elNot = container.querySelector('#tab-count-not');
    if (elAll) elAll.textContent = (counts.eligible + counts.possiblyEligible + counts.notEligible) || 0;
    if (elElig) elElig.textContent = counts.eligible ?? 0;
    if (elPoss) elPoss.textContent = counts.possiblyEligible ?? 0;
    if (elNot) elNot.textContent = counts.notEligible ?? 0;

    // Update header badge
    if (countBadge) {
      countBadge.textContent = `${counts.eligible ?? 0} Recommended For You • ${counts.possiblyEligible ?? 0} Possibly Eligible`;
    }

    if (itemsToDisplay.length === 0) {
      let emptyMsg = 'No verified eligible matches found.';
      let emptyHint = 'Review the "Possibly Eligible" tab to view opportunities requiring portal clarification.';
      if (activeTab === 'eligible') {
        emptyMsg = 'No opportunities currently meet 100% of verified source requirements.';
        emptyHint = 'Explore the "Possibly Eligible" tab to see openings that match your skills but have unstated experience/degree criteria in the source.';
      } else if (activeTab === 'possibly_eligible') {
        emptyMsg = 'No unconfirmed opportunities.';
        emptyHint = 'All evaluated vacancies have complete eligibility requirements.';
      } else if (activeTab === 'not_eligible') {
        emptyMsg = 'No disqualified opportunities.';
        emptyHint = 'All evaluated vacancies currently meet or partially meet your profile criteria.';
      }

      resultsContainer.innerHTML = `
        <div class="empty-state card full-width">
          <div class="empty-icon">🎯</div>
          <h3>${emptyMsg}</h3>
          <p>${emptyHint}</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = itemsToDisplay.map(item => {
      const isGovt = Boolean(item.isGovt || item.recruitingOrganization || item.postName);
      const isIntern = Boolean(item.isInternship || item.category === 'Internships' || (item.title && item.title.toLowerCase().includes('intern')));
      const isSaved = store.isSaved(item.id);
      const rawDeadline = isGovt ? (item.lastDate || item.last_date) : item.deadline;
      const deadlineBadge = getDeadlineBadge(rawDeadline);
      const formattedDeadline = formatDate(rawDeadline);

      let stateBadgeHtml = '';
      if (item.eligibleState === 'eligible') {
        stateBadgeHtml = `<span class="badge" style="background:#ECFDF5; color:#047857; border: 1px solid #A7F3D0; font-weight: 700;">★ Recommended (Eligible)</span>`;
      } else if (item.eligibleState === 'possibly_eligible') {
        stateBadgeHtml = `<span class="badge" style="background:#FFFBEB; color:#B45309; border: 1px solid #FDE68A; font-weight: 700;">? Possibly Eligible</span>`;
      } else {
        stateBadgeHtml = `<span class="badge" style="background:#FEF2F2; color:#B91C1C; border: 1px solid #FECACA; font-weight: 700;">✕ Not Eligible</span>`;
      }

      // Raw eligibility text
      const rawElig = isGovt ? (item.qualificationDetail || item.qualification || item.eligibility) : (item.eligibility || item.qualification);
      const hasRealElig = rawElig && rawElig !== 'Not available' && rawElig !== 'Not Specified' && !String(rawElig).startsWith('Refer to') && String(rawElig).trim().length > 3;

      // Source and links
      const officialUrl = item.officialNotificationUrl || item.officialPdfUrl || item.applyUrl || item.apply_url || '#';
      const isPdf = String(officialUrl).toLowerCase().includes('.pdf');
      const btnLabel = isPdf ? 'Official Notice (PDF) &nearr;' : 'Official Portal &nearr;';
      const sourceName = item.sourceName || (isGovt ? (item.recruitingOrganization || item.organization || 'Official Government Portal') : 'Verified Careers Portal');

      // Explanations Box
      let explanationHtml = '';
      if (item.eligibleState === 'not_eligible') {
        const primaryText = item.primaryExplanation || "Not eligible because requirements are not met.";
        explanationHtml = `
          <div class="match-reasons-box" style="background:#FEF2F2; border:1px solid #FECACA; border-radius:8px; padding:0.85rem 1rem; margin:0.6rem 0;">
            <div style="color:#991B1B; font-weight:700; font-size:0.88rem; display:flex; align-items:flex-start; gap:0.4rem; margin-bottom:${(item.unmetReasons && item.unmetReasons.length > 0) ? '0.45rem' : '0'}; line-height:1.4;">
              <span style="font-size:1rem; line-height:1;">✕</span>
              <span>${escapeHtml(primaryText)}</span>
            </div>
            ${item.unmetReasons && item.unmetReasons.length > 0 ? `
              <ul style="margin:0; padding-left:1.3rem; font-size:0.82rem; color:#B91C1C; line-height:1.45;">
                ${item.unmetReasons.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `;
      } else if (item.eligibleState === 'possibly_eligible') {
        const primaryText = item.primaryExplanation || "Possibly eligible because some details need portal verification.";
        explanationHtml = `
          <div class="match-reasons-box" style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:0.85rem 1rem; margin:0.6rem 0;">
            <div style="color:#92400E; font-weight:700; font-size:0.88rem; display:flex; align-items:flex-start; gap:0.4rem; margin-bottom:0.45rem; line-height:1.4;">
              <span style="font-size:1rem; line-height:1;">ℹ️</span>
              <span>${escapeHtml(primaryText)}</span>
            </div>
            <ul style="margin:0; padding-left:1.3rem; font-size:0.82rem; color:#78350F; line-height:1.45;">
              ${(item.matchReasons || []).map(r => `<li style="color:#047857;">✓ ${escapeHtml(r)}</li>`).join('')}
              ${(item.missingReasons || []).map(r => `<li style="color:#B45309;">⚠ ${escapeHtml(r)}</li>`).join('')}
            </ul>
          </div>
        `;
      } else if (item.eligibleState === 'eligible') {
        const primaryText = item.primaryExplanation || "Eligible because your qualification and skills match requirements.";
        explanationHtml = `
          <div class="match-reasons-box" style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:0.85rem 1rem; margin:0.6rem 0;">
            <div style="color:#065F46; font-weight:700; font-size:0.88rem; display:flex; align-items:flex-start; gap:0.4rem; margin-bottom:0.45rem; line-height:1.4;">
              <span style="font-size:1rem; line-height:1;">✓</span>
              <span>${escapeHtml(primaryText)}</span>
            </div>
            <ul style="margin:0; padding-left:1.3rem; font-size:0.82rem; color:#047857; line-height:1.45;">
              ${(item.matchReasons || ['Qualification and requirements verified by profile matching']).map(r => `<li>${escapeHtml(r)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      return `
        <div class="opp-card ${isGovt ? 'govt-card-theme' : 'corp-card-theme'} card">
          <div class="opp-card-header">
            <div class="org-avatar ${isGovt ? 'govt-avatar' : 'corp-avatar'}">
              ${isGovt ? '🏛️' : (item.logo || '🏢')}
            </div>
            <div class="opp-card-titles">
              <div class="badge-wrapper">
                <span class="badge ${isGovt ? 'badge-success' : 'badge-primary'}">${escapeHtml(item.category || (isGovt ? 'Government' : 'Corporate'))}</span>
                ${stateBadgeHtml}
                <span class="badge ${deadlineBadge.colorClass}">${deadlineBadge.text}</span>
              </div>
              <h3 class="opp-title">${isGovt ? escapeHtml(item.postName || item.post_name || item.title) : escapeHtml(item.title)}</h3>
              <p class="opp-org">${isGovt ? escapeHtml(item.recruitingOrganization || item.organization) : escapeHtml(item.company)}</p>
            </div>
          </div>

          ${explanationHtml}

          <div class="opp-details-grid">
            <div class="detail-row">
              <span class="detail-label">🎓 Eligibility:</span>
              <span class="detail-value text-clamp-1 ${hasRealElig ? '' : 'text-muted'}">
                ${hasRealElig ? escapeHtml(rawElig) : 'Eligibility: Not specified in posting'}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${escapeHtml(item.location || 'Pan India')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">${isGovt ? '💰 Pay Scale:' : (isIntern ? '💰 Stipend:' : '💰 Package:')}</span>
              <span class="detail-value text-success font-bold">${isGovt ? (item.salaryPayScale || 'As per 7th CPC') : (item.salary || item.stipend || 'Best in Industry')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Deadline:</span>
              <span class="detail-value ${deadlineBadge.colorClass === 'badge-danger' ? 'text-danger font-semibold' : ''}">${formattedDeadline}</span>
            </div>
          </div>

          <div class="opp-card-actions">
            <button class="btn btn-outline view-eligible-details" data-id="${item.id}" data-govt="${isGovt}">
              View Details
            </button>
            <a href="${officialUrl && officialUrl !== '#' ? escapeHtml(officialUrl) : '#'}" ${officialUrl && officialUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-success apply-opp-btn" title="Open original vacancy on ${escapeHtml(sourceName)}">
              ${btnLabel}
            </a>
            <button class="btn btn-icon save-toggle-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}" data-type="${isGovt ? 'govt' : 'corp'}" title="${isSaved ? 'Saved' : 'Save opportunity'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachEligibleActions(resultsContainer);
  };

  const attachEligibleActions = (elem) => {
    elem.querySelectorAll('.view-eligible-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const isGovt = btn.dataset.govt === 'true';
        const allList = [...currentMatchData.eligible, ...currentMatchData.possiblyEligible, ...currentMatchData.notEligible];
        const item = allList.find(x => x.id === id) || store.getOpportunityById(id);
        if (!item) return;

        const isIntern = item.isInternship || item.category === 'Internships';
        const rawDeadline = isGovt ? (item.lastDate || item.last_date) : item.deadline;
        const formattedDeadline = formatDate(rawDeadline);
        const sourceName = item.sourceName || (isGovt ? 'Union Public Service Commission (UPSC)' : 'Verified Careers Portal');
        const applyUrl = item.applyUrl || item.apply_url || '#';

        let reasonsBlock = '';
        if (item.eligibleState === 'not_eligible') {
          reasonsBlock = `
            <div class="match-reasons-box" style="margin-bottom: 1.25rem; background:#FEF2F2; border-color:#FECACA;">
              <span class="match-box-title" style="color:#991B1B;">Why you are not eligible:</span>
              <div class="match-reasons-tags">
                ${(item.unmetReasons || []).map(r => `<span class="match-reason-pill" style="background:#FEE2E2; color:#991B1B; border:1px solid #FCA5A5;">✕ ${escapeHtml(r)}</span>`).join('')}
              </div>
            </div>
          `;
        } else if (item.matchReasons && item.matchReasons.length > 0) {
          reasonsBlock = `
            <div class="match-reasons-box" style="margin-bottom: 1.25rem;">
              <span class="match-box-title">${item.eligibleState === 'possibly_eligible' ? 'Matched criteria:' : "Why you're eligible:"}</span>
              <div class="match-reasons-tags">
                ${item.matchReasons.map(r => `<span class="match-reason-pill">✓ ${escapeHtml(r)}</span>`).join('')}
              </div>
            </div>
          `;
        }

        const rawElig = isGovt ? (item.qualificationDetail || item.qualification || item.eligibility) : (item.eligibility || item.qualification);

        if (isGovt) {
          openModal({
            title: item.postName || item.post_name || 'Government Recruitment',
            size: 'large',
            contentHtml: `
              <div class="modal-job-header">
                <div class="modal-org-box">
                  <span class="modal-org-logo">🏛️</span>
                  <div>
                    <h4>${escapeHtml(item.organization || 'UPSC')}</h4>
                    <p class="text-muted">Category: ${escapeHtml(item.category || 'Government')} • Vacancies: ${escapeHtml(item.vacancies || 'Not available')}</p>
                    <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.25rem;">📡 Official Source: <strong>${escapeHtml(sourceName)}</strong></p>
                  </div>
                </div>
              </div>
              ${reasonsBlock}
              <p>${escapeHtml(item.description || '')}</p>
              <div class="modal-meta-grid" style="margin-top: 1rem;">
                <div class="meta-card"><strong>Qualification:</strong> ${escapeHtml(rawElig || 'Not available')}</div>
                <div class="meta-card"><strong>Age Limit:</strong> ${escapeHtml(item.ageLimit || item.age_limit || 'As per UPSC norms')}</div>
                <div class="meta-card"><strong>Pay Scale:</strong> ${escapeHtml(item.salaryPayScale || '7th CPC')}</div>
                <div class="meta-card"><strong>Deadline:</strong> ${formattedDeadline}</div>
              </div>
            `,
            footerHtml: `
              ${item.officialPdfUrl ? `
                <a href="${escapeHtml(item.officialPdfUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                  Official Document (PDF) &nearr;
                </a>
              ` : ''}
              <a href="${escapeHtml(applyUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-success">
                Official Application Portal &nearr;
              </a>
              <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">Close</button>
            `
          });
        } else {
          openModal({
            title: item.title || 'Corporate Opportunity',
            size: 'large',
            contentHtml: `
              <div class="modal-job-header">
                <div class="modal-org-box">
                  <span class="modal-org-logo">${item.logo || '🏢'}</span>
                  <div>
                    <h4>${escapeHtml(item.company || 'Enterprise Employer')}</h4>
                    <p class="text-muted">${escapeHtml(item.location || 'Pan India')} • ${escapeHtml(item.workType || item.work_type || 'Full-time')}</p>
                    <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.25rem;">📡 Verified Source: <strong>${escapeHtml(sourceName)}</strong></p>
                  </div>
                </div>
              </div>
              ${item.eligibleState === 'possibly_eligible' ? `
                <div style="background:#FFFBEB; border-left:3px solid #F59E0B; padding:0.5rem 0.75rem; border-radius:4px; margin-bottom:1rem; font-size:0.85rem; color:#92400E;">
                  <strong>Eligibility: Not enough information</strong> — Review official portal listing to confirm qualifications.
                </div>
              ` : ''}
              ${reasonsBlock}
              <p>${escapeHtml(item.description || '')}</p>
              <div class="modal-meta-grid" style="margin-top: 1rem;">
                <div class="meta-card"><strong>${isIntern ? 'Stipend:' : 'CTC / Package:'}</strong> <span class="text-success font-bold">${escapeHtml(item.salary || item.stipend || 'Best in Industry')}</span></div>
                <div class="meta-card"><strong>Eligibility:</strong> ${escapeHtml(rawElig || 'Eligibility: Not enough information')}</div>
                <div class="meta-card"><strong>Experience:</strong> ${escapeHtml(item.experience || (isIntern ? 'Student / Intern' : 'Not specified'))}</div>
                <div class="meta-card"><strong>Deadline:</strong> ${formattedDeadline}</div>
              </div>
            `,
            footerHtml: `
              <a href="${applyUrl && applyUrl !== '#' ? escapeHtml(applyUrl) : '#'}" ${applyUrl && applyUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn btn-primary">
                Apply on Official Portal &nearr;
              </a>
              <button class="btn btn-outline" onclick="window.CareerSphereModalClose()">Close</button>
            `
          });
        }
      });
    });

    // Save toggle
    elem.querySelectorAll('.save-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const allList = [...currentMatchData.eligible, ...currentMatchData.possiblyEligible, ...currentMatchData.notEligible];
        const opp = allList.find(x => x.id === id) || store.getOpportunityById(id);
        const nowSaved = store.toggleSave(opp || { id, postName: btn.dataset.type === 'govt' ? 'Govt Post' : undefined });
        btn.classList.toggle('saved', nowSaved);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', nowSaved ? 'currentColor' : 'none');
        showToast(nowSaved ? 'Saved to Bookmarks!' : 'Removed from Saved', nowSaved ? 'success' : 'info');
      });
    });
  };

  // Tab switching
  tabsContainer.querySelectorAll('.tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      activeTab = tabBtn.dataset.tab;
      renderCurrentCards();
    });
  });

  const computeAndRenderEligible = async (customCriteria = null) => {
    const current = customCriteria || store.getEligibilityProfile();

    // 1. Immediate local compute
    currentMatchData = store.calculateEligibility(current);
    renderCurrentCards();

    // 2. Fetch from backend API for comprehensive SQLite matches
    try {
      const apiResult = await store.matchEligibilityAPI(current);
      if (apiResult && apiResult.counts) {
        currentMatchData = apiResult;
        renderCurrentCards();
      }
    } catch (err) {
      console.warn('Backend match sync note:', err);
    }
  };

  // Calculate & Save Eligibility Button
  calculateBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const skillsStr = container.querySelector('#elig-skills').value;
    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

    const updatedCriteria = {
      highestQualification: container.querySelector('#elig-qualification').value,
      degree: container.querySelector('#elig-degree').value.trim() || 'Bachelor of Computer Applications (BCA)',
      graduationStatus: container.querySelector('#elig-grad-status').value,
      graduationYear: container.querySelector('#elig-grad-year').value,
      skills: skillsArray,
      experience: container.querySelector('#elig-experience').value,
      preferredLocation: container.querySelector('#elig-location').value.trim() || 'All India',
      preferredJobType: container.querySelector('#elig-jobtype').value,
      careerPreference: container.querySelector('#elig-pref').value
    };

    store.saveEligibilityProfile(updatedCriteria);
    computeAndRenderEligible(updatedCriteria);
    showToast('Eligibility criteria verified! Matches updated.', 'success');

    container.querySelector('.eligible-results-section').scrollIntoView({ behavior: 'smooth' });
  });

  // Initial computation
  computeAndRenderEligible();

  // Auto-sync when central profile changes
  const unsubscribe = store.subscribe((event) => {
    if (event === 'profile_changed') {
      if (document.body.contains(container)) {
        const fresh = store.getEligibilityProfile();
        const elQual = container.querySelector('#elig-qualification');
        const elDeg = container.querySelector('#elig-degree');
        const elGradStat = container.querySelector('#elig-grad-status');
        const elGradYr = container.querySelector('#elig-grad-year');
        const elSkills = container.querySelector('#elig-skills');
        const elExp = container.querySelector('#elig-experience');
        const elLoc = container.querySelector('#elig-location');
        const elJobType = container.querySelector('#elig-jobtype');
        const elPref = container.querySelector('#elig-pref');

        if (elQual && fresh.highestQualification) elQual.value = fresh.highestQualification;
        if (elDeg && fresh.degree) elDeg.value = fresh.degree;
        if (elGradStat && fresh.graduationStatus) elGradStat.value = fresh.graduationStatus;
        if (elGradYr && fresh.graduationYear) elGradYr.value = fresh.graduationYear;
        if (elSkills && fresh.skills) elSkills.value = Array.isArray(fresh.skills) ? fresh.skills.join(', ') : fresh.skills;
        if (elExp && fresh.experience) elExp.value = fresh.experience;
        if (elLoc && fresh.preferredLocation) elLoc.value = fresh.preferredLocation;
        if (elJobType && fresh.preferredJobType) elJobType.value = fresh.preferredJobType;
        if (elPref && fresh.careerPreference) elPref.value = fresh.careerPreference;

        computeAndRenderEligible(fresh);
      }
    }
  });
}
