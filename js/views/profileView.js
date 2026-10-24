/**
 * CareerSphere - Central Student Career Profile View
 * Central profile repository integrating with My Eligibility, Saved Opportunities,
 * Corporate Jobs, Internships, and Government Examinations.
 */

import { store } from '../store.js';
import { showToast, escapeHtml } from '../utils.js';

export function renderProfileView(container, navigateTo) {
  const profile = store.getProfile();

  // Helper to extract initials
  const getInitials = (fullName) => {
    if (!fullName) return 'ST';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sectors = Array.isArray(profile.preferredSectors) && profile.preferredSectors.length > 0
    ? profile.preferredSectors
    : ['Corporate', 'Government', 'Internships'];

  const skillsList = Array.isArray(profile.skills) ? profile.skills : (typeof profile.skills === 'string' ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
  const locationsStr = Array.isArray(profile.preferredLocations) ? profile.preferredLocations.join(', ') : (profile.preferredLocations || 'Bangalore, Delhi NCR, Remote');

  container.innerHTML = `
    <div class="view-header profile-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Student Profile</span>
        </div>
        <div class="header-action-row">
          <div>
            <div class="header-badge-tag">
              <span class="pulse-dot"></span> Central Career Identity
            </div>
            <h1 class="page-title">Candidate Profile & Portfolio 👤</h1>
            <p class="page-desc">
              Your central career profile. Details saved here automatically synchronize across My Eligibility, 
              Application Trackers, and Job Recommendations.
            </p>
          </div>
          <div class="header-actions-group" style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <button type="button" class="btn btn-outline" id="view-eligibility-top-btn" style="background:#FFFFFF;">
              🎯 View Matching Opportunities
            </button>
            <button type="button" class="btn btn-primary" id="save-profile-top-btn">
              💾 Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container profile-container">
      <!-- DYNAMIC STATUS NOTIFICATION BANNER -->
      <div id="profile-status-banner" class="profile-status-banner">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.25rem;" id="banner-icon">✓</span>
          <span id="banner-text"><strong>Profile synced successfully!</strong> Your eligibility matches have been recalculated.</span>
        </div>
        <button type="button" class="btn btn-sm btn-success" id="banner-action-btn">
          Go to My Eligibility &rarr;
        </button>
      </div>

      <div class="profile-card-layout">
        <!-- TOP HERO OVERVIEW CARD -->
        <div class="card profile-hero-card">
          <div class="profile-photo-column">
            <div class="profile-photo-placeholder" id="profile-photo-box">
              <div class="photo-avatar">
                <span id="display-initials">${getInitials(profile.name)}</span>
              </div>
              <span class="photo-badge">Verified Student</span>
            </div>
          </div>

          <div class="profile-hero-details">
            <div class="profile-hero-top">
              <div>
                <h2 class="profile-name" id="display-name">${escapeHtml(profile.name || 'Candidate Name')}</h2>
                <p class="profile-tagline" id="display-degree-college">
                  ${escapeHtml(profile.degree || 'Degree')} • ${escapeHtml(profile.college || 'Institution')}
                </p>
              </div>
              <span class="badge badge-success" id="display-grad-status">${escapeHtml(profile.graduationStatus || 'Pursuing (Final Year)')}</span>
            </div>

            <p class="profile-bio-text" id="display-bio">
              ${escapeHtml(profile.bio || 'Seeking high-impact roles across corporate tech firms and competitive government examinations.')}
            </p>

            <div class="profile-contact-chips">
              <span class="contact-chip">
                📧 <span id="display-email">${escapeHtml(profile.email || 'No email provided')}</span>
              </span>
              <span class="contact-chip">
                📱 <span id="display-phone">${escapeHtml(profile.phone || '+91 00000 00000')}</span>
              </span>
              <span class="contact-chip">
                🎓 Class of <strong id="display-year">${escapeHtml(profile.graduationYear || '2025')}</strong>
              </span>
              <span class="profile-sync-badge">
                ✓ Synced with My Eligibility
              </span>
            </div>
          </div>
        </div>

        <!-- EDITABLE PROFILE FORM: ALL 13 CORE FIELDS -->
        <form id="career-profile-form" class="profile-form-layout" novalidate>
          
          <!-- SECTION 1: PERSONAL CONTACT DETAILS -->
          <div class="card profile-info-card">
            <div class="info-card-header">
              <h3>👤 1. Personal & Contact Information</h3>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-name">Full Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  id="prof-name" 
                  class="form-control" 
                  placeholder="e.g. Priya Sharma" 
                  value="${escapeHtml(profile.name || '')}" 
                  required 
                />
                <span class="field-error-msg" id="err-prof-name"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-email">Email Address <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  id="prof-email" 
                  class="form-control" 
                  placeholder="e.g. priya.sharma@example.com" 
                  value="${escapeHtml(profile.email || '')}" 
                  required 
                />
                <span class="field-error-msg" id="err-prof-email"></span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-phone">Phone Number <span class="text-danger">*</span></label>
                <input 
                  type="tel" 
                  id="prof-phone" 
                  class="form-control" 
                  placeholder="e.g. +91 98765 43210" 
                  value="${escapeHtml(profile.phone || '')}" 
                  required 
                />
                <span class="field-error-msg" id="err-prof-phone"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-cgpa">Academic Score / CGPA</label>
                <input 
                  type="text" 
                  id="prof-cgpa" 
                  class="form-control" 
                  placeholder="e.g. 8.7 / 10.0 or 85%" 
                  value="${escapeHtml(profile.cgpa || '')}" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-github">GitHub Profile URL (Optional)</label>
                <input 
                  type="url" 
                  id="prof-github" 
                  class="form-control" 
                  placeholder="e.g. https://github.com/priyasharma" 
                  value="${escapeHtml(profile.github || profile.githubUrl || '')}" 
                />
              </div>
            </div>
          </div>

          <!-- SECTION 2: ACADEMIC CREDENTIALS -->
          <div class="card profile-info-card">
            <div class="info-card-header">
              <h3>🎓 2. Academic Credentials & Qualifications</h3>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-highest-qual">Highest Qualification <span class="text-danger">*</span></label>
                <select id="prof-highest-qual" class="form-select">
                  <option value="Graduate (Bachelor's)" ${(profile.highestQualification || '').includes('Graduate') && !(profile.highestQualification || '').includes('Post') ? 'selected' : ''}>Graduate (Bachelor's Degree)</option>
                  <option value="Post Graduate (Master's)" ${(profile.highestQualification || '').includes('Post') ? 'selected' : ''}>Post Graduate (Master's / MCA / M.Tech)</option>
                  <option value="Diploma" ${(profile.highestQualification || '').includes('Diploma') ? 'selected' : ''}>Diploma / Polytechnic</option>
                  <option value="10th / 12th Pass" ${(profile.highestQualification || '').includes('10th') || (profile.highestQualification || '').includes('12th') ? 'selected' : ''}>10th / 12th Pass</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-degree">Degree / Major <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  id="prof-degree" 
                  class="form-control" 
                  placeholder="e.g. Bachelor of Computer Applications (BCA)" 
                  value="${escapeHtml(profile.degree || '')}" 
                  required 
                />
                <span class="field-error-msg" id="err-prof-degree"></span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-college">College / University</label>
                <input 
                  type="text" 
                  id="prof-college" 
                  class="form-control" 
                  placeholder="e.g. Indira Gandhi Delhi Technical University for Women" 
                  value="${escapeHtml(profile.college || '')}" 
                />
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-grad-status">Graduation Status</label>
                <select id="prof-grad-status" class="form-select">
                  <option value="Pursuing (Final Year)" ${(profile.graduationStatus || '').includes('Final') ? 'selected' : ''}>Pursuing (Final Year)</option>
                  <option value="Pursuing (Pre-Final Year)" ${(profile.graduationStatus || '').includes('Pre-Final') ? 'selected' : ''}>Pursuing (Pre-Final Year)</option>
                  <option value="Graduated (Passout)" ${(profile.graduationStatus || '').includes('Graduated') ? 'selected' : ''}>Graduated (Passout)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="prof-grad-year">Graduation Year</label>
                <select id="prof-grad-year" class="form-select">
                  <option value="2024" ${profile.graduationYear === '2024' ? 'selected' : ''}>2024</option>
                  <option value="2025" ${profile.graduationYear === '2025' || !profile.graduationYear ? 'selected' : ''}>2025</option>
                  <option value="2026" ${profile.graduationYear === '2026' ? 'selected' : ''}>2026</option>
                  <option value="2027" ${profile.graduationYear === '2027' ? 'selected' : ''}>2027</option>
                  <option value="2028" ${profile.graduationYear === '2028' ? 'selected' : ''}>2028</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-experience">Experience Level</label>
                <select id="prof-experience" class="form-select">
                  <option value="Fresher (0-1 yr)" ${(profile.experience || '').includes('Fresher') || !profile.experience ? 'selected' : ''}>Fresher (0 - 1 yr)</option>
                  <option value="Student / Intern" ${(profile.experience || '').includes('Intern') ? 'selected' : ''}>Student / Internship Seeker</option>
                  <option value="1-2 Years Experience" ${(profile.experience || '').includes('1-2') ? 'selected' : ''}>1 - 2 Years Experience</option>
                  <option value="2+ Years Experience" ${(profile.experience || '').includes('2+') ? 'selected' : ''}>2+ Years Experience</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 3: SKILLS & COMPETENCIES -->
          <div class="card profile-info-card">
            <div class="info-card-header">
              <h3>⚡ 3. Skills & Competencies</h3>
            </div>
            <div class="form-group">
              <label class="form-label" for="prof-skills">Technical & Domain Skills (Comma-separated) <span class="text-danger">*</span></label>
              <input 
                type="text" 
                id="prof-skills" 
                class="form-control" 
                placeholder="e.g. Python, React, SQL, Java, Data Structures, Git" 
                value="${escapeHtml(skillsList.join(', '))}" 
                required 
              />
              <span class="field-error-msg" id="err-prof-skills"></span>
              <small class="text-muted" style="display:block; margin-top:0.35rem;">
                These skills are used to match corporate vacancies and technical eligibility prerequisites.
              </small>
            </div>
            <div style="margin-top:0.75rem;">
              <span class="info-label" style="display:block; margin-bottom:0.4rem;">Skills Preview:</span>
              <div class="profile-skills-tags" id="skills-live-preview">
                ${skillsList.map(s => `<span class="profile-skill-pill">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- SECTION 4: PREFERENCES & SECTORS -->
          <div class="card profile-info-card">
            <div class="info-card-header">
              <h3>🎯 4. Preferred Sectors & Career Work Preferences</h3>
            </div>

            <!-- Preferred Sectors Checkboxes -->
            <div class="form-group">
              <label class="form-label">Preferred Sectors (Select all that apply) <span class="text-danger">*</span></label>
              <div class="sector-checkbox-group" id="sector-checkbox-group">
                <label class="sector-checkbox-item ${sectors.includes('Corporate') ? 'checked' : ''}">
                  <input type="checkbox" id="sector-corporate" value="Corporate" ${sectors.includes('Corporate') ? 'checked' : ''} />
                  <span>🏢 Corporate Tech & Private Sector</span>
                </label>
                <label class="sector-checkbox-item ${sectors.includes('Government') ? 'checked' : ''}">
                  <input type="checkbox" id="sector-government" value="Government" ${sectors.includes('Government') ? 'checked' : ''} />
                  <span>🏛️ Government Sector & Public Exams</span>
                </label>
                <label class="sector-checkbox-item ${sectors.includes('Internships') ? 'checked' : ''}">
                  <input type="checkbox" id="sector-internships" value="Internships" ${sectors.includes('Internships') ? 'checked' : ''} />
                  <span>🚀 Internships & Traineeships</span>
                </label>
              </div>
              <span class="field-error-msg" id="err-prof-sectors"></span>
            </div>

            <div class="form-row" style="margin-top:1rem;">
              <div class="form-group">
                <label class="form-label" for="prof-work-pref">Work Preference</label>
                <select id="prof-work-pref" class="form-select">
                  <option value="Hybrid / Flexible" ${(profile.workPreference || '').includes('Hybrid') || !profile.workPreference ? 'selected' : ''}>Hybrid / Flexible</option>
                  <option value="Remote / Work From Home" ${(profile.workPreference || '').includes('Remote') ? 'selected' : ''}>Remote / Work From Home</option>
                  <option value="In-Office / On-Site" ${(profile.workPreference || '').includes('Office') || (profile.workPreference || '').includes('Site') ? 'selected' : ''}>In-Office / On-Site</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="prof-job-type">Preferred Job Type</label>
                <select id="prof-job-type" class="form-select">
                  <option value="Full-time / Internship" ${(profile.preferredJobType || '').includes('Full-time') && (profile.preferredJobType || '').includes('Intern') ? 'selected' : ''}>Full-time / Internship</option>
                  <option value="Full-time Only" ${profile.preferredJobType === 'Full-time Only' ? 'selected' : ''}>Full-time Only</option>
                  <option value="Internship Only" ${profile.preferredJobType === 'Internship Only' ? 'selected' : ''}>Internship Only</option>
                  <option value="Remote / Work From Home" ${(profile.preferredJobType || '').includes('Remote') ? 'selected' : ''}>Remote / Work From Home</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top:0.5rem;">
              <label class="form-label" for="prof-locations">Preferred Locations (Comma-separated)</label>
              <input 
                type="text" 
                id="prof-locations" 
                class="form-control" 
                placeholder="e.g. Bangalore, Delhi NCR, Hyderabad, Remote" 
                value="${escapeHtml(locationsStr)}" 
              />
            </div>

            <div class="form-group" style="margin-top:0.5rem;">
              <label class="form-label" for="prof-bio">Short Candidate Bio</label>
              <textarea id="prof-bio" class="form-control" rows="3" placeholder="Tell recruiters and exam evaluators about your background and goals...">${escapeHtml(profile.bio || '')}</textarea>
            </div>
          </div>

          <!-- BOTTOM ACTION BAR -->
          <div class="profile-actions-bar">
            <div style="font-size:0.85rem; color:var(--text-muted);">
              🔒 <em>Changes saved here instantly update your My Eligibility matches and central account.</em>
            </div>
            <div class="action-buttons">
              <button type="button" class="btn btn-outline" id="view-eligibility-bottom-btn">
                🎯 View Matching Opportunities
              </button>
              <button type="submit" class="btn btn-primary btn-lg" id="save-profile-bottom-btn">
                💾 Save Profile
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  `;

  // Grab Elements
  const form = container.querySelector('#career-profile-form');
  const saveTopBtn = container.querySelector('#save-profile-top-btn');
  const viewTopBtn = container.querySelector('#view-eligibility-top-btn');
  const viewBottomBtn = container.querySelector('#view-eligibility-bottom-btn');
  const statusBanner = container.querySelector('#profile-status-banner');
  const bannerActionBtn = container.querySelector('#banner-action-btn');
  const skillsInput = container.querySelector('#prof-skills');
  const skillsPreview = container.querySelector('#skills-live-preview');

  // Live Sector Checkbox UI syncing
  container.querySelectorAll('.sector-checkbox-item').forEach(label => {
    const cb = label.querySelector('input[type="checkbox"]');
    if (cb) {
      cb.addEventListener('change', () => {
        label.classList.toggle('checked', cb.checked);
        clearFieldError('err-prof-sectors');
      });
    }
  });

  // Live Skills Preview
  skillsInput.addEventListener('input', () => {
    const raw = skillsInput.value;
    const list = raw.split(',').map(s => s.trim()).filter(Boolean);
    skillsPreview.innerHTML = list.length > 0
      ? list.map(s => `<span class="profile-skill-pill">${escapeHtml(s)}</span>`).join('')
      : '<span class="text-muted" style="font-size:0.8rem;">No skills entered yet</span>';
    clearFieldError('err-prof-skills');
  });

  // Field validation helpers
  const showFieldError = (errorElemId, inputId, message) => {
    const errElem = container.querySelector(`#${errorElemId}`);
    const inputElem = container.querySelector(`#${inputId}`);
    if (errElem) {
      errElem.textContent = message;
      errElem.classList.add('visible');
    }
    if (inputElem) {
      inputElem.classList.add('is-invalid');
    }
  };

  const clearFieldError = (errorElemId, inputId = null) => {
    const errElem = container.querySelector(`#${errorElemId}`);
    if (errElem) {
      errElem.textContent = '';
      errElem.classList.remove('visible');
    }
    if (inputId) {
      const inputElem = container.querySelector(`#${inputId}`);
      if (inputElem) inputElem.classList.remove('is-invalid');
    }
  };

  // Clear errors on user input
  ['prof-name', 'prof-email', 'prof-phone', 'prof-degree'].forEach(id => {
    const el = container.querySelector(`#${id}`);
    if (el) {
      el.addEventListener('input', () => clearFieldError(`err-${id}`, id));
    }
  });

  // Validation function
  const validateForm = () => {
    let isValid = true;
    let firstInvalidInput = null;

    // 1. Name
    const nameVal = container.querySelector('#prof-name').value.trim();
    if (!nameVal || nameVal.length < 2) {
      showFieldError('err-prof-name', 'prof-name', 'Please enter your full name (at least 2 characters).');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = container.querySelector('#prof-name');
    } else {
      clearFieldError('err-prof-name', 'prof-name');
    }

    // 2. Email
    const emailVal = container.querySelector('#prof-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      showFieldError('err-prof-email', 'prof-email', 'Please enter a valid email address.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = container.querySelector('#prof-email');
    } else {
      clearFieldError('err-prof-email', 'prof-email');
    }

    // 3. Phone
    const phoneVal = container.querySelector('#prof-phone').value.trim();
    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (!phoneVal || digitsOnly.length < 10) {
      showFieldError('err-prof-phone', 'prof-phone', 'Please enter a valid phone number (at least 10 digits).');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = container.querySelector('#prof-phone');
    } else {
      clearFieldError('err-prof-phone', 'prof-phone');
    }

    // 4. Degree
    const degreeVal = container.querySelector('#prof-degree').value.trim();
    if (!degreeVal || degreeVal.length < 2) {
      showFieldError('err-prof-degree', 'prof-degree', 'Degree / Major is required for opportunity and exam matching.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = container.querySelector('#prof-degree');
    } else {
      clearFieldError('err-prof-degree', 'prof-degree');
    }

    // 5. Skills
    const skillsVal = container.querySelector('#prof-skills').value.trim();
    const skillsParsed = skillsVal.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsParsed.length === 0) {
      showFieldError('err-prof-skills', 'prof-skills', 'Please provide at least one technical or professional skill.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = container.querySelector('#prof-skills');
    } else {
      clearFieldError('err-prof-skills', 'prof-skills');
    }

    // 6. Preferred Sectors
    const selectedSectors = [];
    if (container.querySelector('#sector-corporate').checked) selectedSectors.push('Corporate');
    if (container.querySelector('#sector-government').checked) selectedSectors.push('Government');
    if (container.querySelector('#sector-internships').checked) selectedSectors.push('Internships');

    if (selectedSectors.length === 0) {
      showFieldError('err-prof-sectors', null, 'Please select at least one preferred sector.');
      isValid = false;
    } else {
      clearFieldError('err-prof-sectors');
    }

    if (!isValid && firstInvalidInput) {
      firstInvalidInput.focus();
      showToast('Please correct the highlighted fields before saving.', 'warning');
    }

    return isValid;
  };

  // Perform Save Action
  const handleSaveProfile = () => {
    if (!validateForm()) return false;

    const name = container.querySelector('#prof-name').value.trim();
    const email = container.querySelector('#prof-email').value.trim();
    const phone = container.querySelector('#prof-phone').value.trim();
    const cgpa = container.querySelector('#prof-cgpa').value.trim();
    const highestQualification = container.querySelector('#prof-highest-qual').value;
    const degree = container.querySelector('#prof-degree').value.trim();
    const college = container.querySelector('#prof-college').value.trim();
    const graduationStatus = container.querySelector('#prof-grad-status').value;
    const graduationYear = container.querySelector('#prof-grad-year').value;
    const experience = container.querySelector('#prof-experience').value;
    const skills = container.querySelector('#prof-skills').value.split(',').map(s => s.trim()).filter(Boolean);

    const preferredSectors = [];
    if (container.querySelector('#sector-corporate').checked) preferredSectors.push('Corporate');
    if (container.querySelector('#sector-government').checked) preferredSectors.push('Government');
    if (container.querySelector('#sector-internships').checked) preferredSectors.push('Internships');

    const workPreference = container.querySelector('#prof-work-pref').value;
    const preferredJobType = container.querySelector('#prof-job-type').value;
    const locationsArr = container.querySelector('#prof-locations').value.split(',').map(s => s.trim()).filter(Boolean);
    const bio = container.querySelector('#prof-bio').value.trim();

    const updatedProfile = {
      name,
      email,
      phone,
      cgpa,
      highestQualification,
      degree,
      college,
      graduationStatus,
      graduationYear,
      experience,
      skills,
      github: container.querySelector('#prof-github') ? container.querySelector('#prof-github').value.trim() : '',
      preferredSectors,
      workPreference,
      preferredJobType,
      preferredLocations: locationsArr.length > 0 ? locationsArr : ['All India'],
      bio
    };

    // Persist and synchronize
    store.updateProfile(updatedProfile);

    // Live update hero header card
    const heroInitials = container.querySelector('#display-initials');
    const heroName = container.querySelector('#display-name');
    const heroDegreeCollege = container.querySelector('#display-degree-college');
    const heroGradStatus = container.querySelector('#display-grad-status');
    const heroBio = container.querySelector('#display-bio');
    const heroEmail = container.querySelector('#display-email');
    const heroPhone = container.querySelector('#display-phone');
    const heroYear = container.querySelector('#display-year');

    if (heroInitials) heroInitials.textContent = getInitials(name);
    if (heroName) heroName.textContent = name;
    if (heroDegreeCollege) heroDegreeCollege.textContent = `${degree} • ${college || 'Institution'}`;
    if (heroGradStatus) heroGradStatus.textContent = graduationStatus;
    if (heroBio) heroBio.textContent = bio || 'Candidate profile updated.';
    if (heroEmail) heroEmail.textContent = email;
    if (heroPhone) heroPhone.textContent = phone;
    if (heroYear) heroYear.textContent = graduationYear;

    // Calculate match summary
    const matches = store.calculateEligibility();
    const totalMatches = (matches.counts?.eligible || 0) + (matches.counts?.possiblyEligible || 0);

    // Show status banner
    statusBanner.className = 'profile-status-banner success';
    const bannerText = container.querySelector('#banner-text');
    if (bannerText) {
      bannerText.innerHTML = `<strong>Profile saved successfully!</strong> Synced with My Eligibility &mdash; <strong>${matches.counts?.eligible || 0}</strong> Verified Eligible, <strong>${matches.counts?.possiblyEligible || 0}</strong> Possibly Eligible.`;
    }
    statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    showToast('Profile updated & synchronized with My Eligibility!', 'success');
    return true;
  };

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveProfile();
  });

  // Top save button handler
  saveTopBtn.addEventListener('click', () => {
    handleSaveProfile();
  });

  // Navigate to My Eligibility handlers
  const goToEligibility = () => {
    if (typeof navigateTo === 'function') {
      navigateTo('eligibility');
    } else {
      window.location.hash = '#eligibility';
    }
  };

  viewTopBtn.addEventListener('click', goToEligibility);
  viewBottomBtn.addEventListener('click', goToEligibility);
  bannerActionBtn.addEventListener('click', goToEligibility);
}
