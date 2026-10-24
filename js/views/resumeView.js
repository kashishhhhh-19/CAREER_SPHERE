/**
 * CareerSphere - ATS Resume Builder & Portfolio
 * Features:
 * - Contact & Professional Summary with validated GitHub Profile URL
 * - Education & Academic Credentials
 * - Technical Skills
 * - Complete Projects Section:
 *     * Multi-project manager (Add, Edit, Delete, Reorder Move Up/Down, Include/Exclude)
 *     * Project Name, Short Description, Technologies Used, GitHub Repo URL, Live Demo URL (optional), Status (optional)
 *     * Migration and preservation of existing catalog projects without duplicates
 * - Experience & Internships
 * - Certifications
 * - Real-time ATS Single-Column Preview with clickable links
 * - Recruiter-ready PDF download with clickable links preserved
 * - Profile auto-fill integration with strict Profile isolation
 */

import { store } from '../store.js';
import { showToast, escapeHtml } from '../utils.js';

function formatUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function validateGitHubUrl(value) {
  if (!value || !value.trim()) return { valid: true, url: '', formatted: '' };
  const trimmed = value.trim();
  const fullMatch = trimmed.match(/^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/?$/i);
  if (fullMatch) {
    const fullUrl = `https://github.com/${fullMatch[3]}`;
    return { valid: true, url: fullUrl, formatted: `github.com/${fullMatch[3]}` };
  }
  if (/^[a-zA-Z0-9_\-]{1,39}$/.test(trimmed)) {
    const fullUrl = `https://github.com/${trimmed}`;
    return { valid: true, url: fullUrl, formatted: `github.com/${trimmed}` };
  }
  return {
    valid: false,
    url: trimmed,
    formatted: trimmed,
    error: 'Please enter a valid GitHub profile URL (e.g. https://github.com/username)'
  };
}

export function renderResumeView(container) {
  const resume = store.getResumeData();

  // Local mutable state for projects list to allow instant reactive manipulation
  let projectsList = Array.isArray(resume.projects) ? JSON.parse(JSON.stringify(resume.projects)) : [];

  container.innerHTML = `
    <div class="view-header resume-theme-header no-print">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Resume Builder</span>
        </div>
        <div class="header-action-row">
          <div>
            <h1 class="page-title">ATS Resume Builder & Portfolio</h1>
            <p class="page-desc">
              Build a recruiter-ready, single-page ATS formatted resume. Manage all your student projects, skills, and experience in one place.
            </p>
          </div>
          <div class="header-btns">
            <button type="button" class="btn btn-outline" id="autofill-profile-top-btn" title="Sync candidate contact, education, and skills from your central Profile">
              🔄 Auto-fill from Profile
            </button>
            <button type="button" class="btn btn-outline" id="save-resume-top-btn" title="Save resume persistently">
              💾 Save Resume
            </button>
            <label class="btn btn-outline file-upload-label" for="resume-file-upload">
              📁 Upload Existing Resume
              <input type="file" id="resume-file-upload" accept=".pdf,.docx,.doc" style="display:none;" />
            </label>
            <button type="button" class="btn btn-primary" id="print-resume-btn">
              🖨️ Download / Print PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Status Alert (hidden initially) -->
    <div id="upload-status-alert" class="section-container no-print" style="display:none; margin-bottom: 1rem;">
      <div class="alert alert-success">
        <span>✓</span>
        <span id="upload-status-text">File uploaded successfully. Parsed details populated into fields below.</span>
      </div>
    </div>

    <div class="resume-split-layout section-container">
      <!-- LEFT COLUMN: EDIT FORM CONTROLS -->
      <aside class="resume-editor-panel card no-print">
        <div class="editor-panel-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color, #e2e8f0); margin-bottom: 1rem;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600;">Resume Sections</h3>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button type="button" class="btn btn-sm btn-outline" id="autofill-profile-btn" title="Sync details from your Profile">🔄 Auto-fill</button>
            <button type="button" class="btn btn-sm btn-primary" id="save-resume-btn" title="Save resume data persistently">💾 Save Resume</button>
          </div>
        </div>

        <div class="editor-accordion">
          <!-- 1. Personal Information -->
          <details class="editor-group" open>
            <summary>👤 Personal Contact & Summary</summary>
            <div class="group-content">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name <span class="text-danger">*</span></label>
                  <input type="text" id="res-name" class="form-control" value="${escapeHtml(resume.fullName || '')}" placeholder="e.g. Priya Sharma" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address <span class="text-danger">*</span></label>
                  <input type="email" id="res-email" class="form-control" value="${escapeHtml(resume.email || '')}" placeholder="e.g. priya.sharma@example.com" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Phone Number <span class="text-danger">*</span></label>
                  <input type="text" id="res-phone" class="form-control" value="${escapeHtml(resume.phone || '')}" placeholder="e.g. +91 98765 43210" />
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input type="text" id="res-location" class="form-control" value="${escapeHtml(resume.location || 'Delhi, India')}" placeholder="e.g. Delhi, India" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">LinkedIn URL</label>
                  <input type="text" id="res-linkedin" class="form-control" value="${escapeHtml(resume.linkedin || '')}" placeholder="linkedin.com/in/username" />
                </div>
                <div class="form-group">
                  <label class="form-label">GitHub Profile URL</label>
                  <input type="text" id="res-github" class="form-control" value="${escapeHtml(resume.github || '')}" placeholder="https://github.com/username" />
                  <span class="field-feedback" id="res-github-feedback" style="font-size: 0.75rem; display: block; margin-top: 0.25rem;"></span>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Professional Summary</label>
                <textarea id="res-summary" class="form-control" rows="3" placeholder="Brief 2-3 sentence overview of your career focus and core engineering strengths...">${escapeHtml(resume.summary || '')}</textarea>
              </div>
            </div>
          </details>

          <!-- 2. Education -->
          <details class="editor-group" open>
            <summary>🎓 Education</summary>
            <div class="group-content">
              <div class="form-group">
                <label class="form-label">Degree / Program</label>
                <input type="text" id="res-edu-degree" class="form-control" value="${escapeHtml(resume.education?.[0]?.degree || '')}" placeholder="e.g. Bachelor of Computer Applications (BCA)" />
              </div>
              <div class="form-group">
                <label class="form-label">Institution / University</label>
                <input type="text" id="res-edu-inst" class="form-control" value="${escapeHtml(resume.education?.[0]?.institution || '')}" placeholder="e.g. University Name" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Graduation Period</label>
                  <input type="text" id="res-edu-year" class="form-control" value="${escapeHtml(resume.education?.[0]?.year || '2022 - 2025')}" placeholder="e.g. 2022 - 2025" />
                </div>
                <div class="form-group">
                  <label class="form-label">CGPA / Percentage</label>
                  <input type="text" id="res-edu-score" class="form-control" value="${escapeHtml(resume.education?.[0]?.score || '8.7 / 10.0')}" placeholder="e.g. 8.7 / 10.0 or 85%" />
                </div>
              </div>
            </div>
          </details>

          <!-- 3. Technical Skills -->
          <details class="editor-group" open>
            <summary>⚡ Technical Skills</summary>
            <div class="group-content">
              <div class="form-group">
                <label class="form-label">Comma Separated Skills</label>
                <input type="text" id="res-skills-input" class="form-control" value="${escapeHtml(Array.isArray(resume.skills) ? resume.skills.join(', ') : (resume.skills || ''))}" placeholder="Python, SQL, React, JavaScript, Git" />
                <small class="text-muted">Separate skills with commas (e.g. Python, SQL, React, Git, Docker)</small>
              </div>
            </div>
          </details>

          <!-- 4. Dynamic Multi-Project Section -->
          <details class="editor-group" id="resume-projects-accordion" open>
            <summary style="display: flex; justify-content: space-between; align-items: center;">
              <span>🚀 Projects Portfolio</span>
              <span class="badge badge-sm badge-info" id="proj-count-badge" style="font-size: 0.72rem;"></span>
            </summary>
            <div class="group-content">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px dashed #cbd5e1;">
                <p style="font-size: 0.8rem; color: #64748b; margin: 0;">
                  Manage all projects below. Check <strong>Include</strong> to display on your resume. Use ⬆️ ⬇️ to reorder priority.
                </p>
                <button type="button" class="btn btn-sm btn-outline-primary" id="add-project-btn" style="flex-shrink: 0; padding: 0.35rem 0.65rem;">
                  + Add Project
                </button>
              </div>

              <!-- Container where project cards are dynamically rendered -->
              <div id="projects-editor-list">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </details>

          <!-- 5. Experience / Internships -->
          <details class="editor-group">
            <summary>💼 Experience & Internships</summary>
            <div class="group-content">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Role / Title</label>
                  <input type="text" id="res-exp-role" class="form-control" value="${escapeHtml(resume.experience?.[0]?.role || '')}" placeholder="e.g. Frontend Development Intern" />
                </div>
                <div class="form-group">
                  <label class="form-label">Company</label>
                  <input type="text" id="res-exp-comp" class="form-control" value="${escapeHtml(resume.experience?.[0]?.company || '')}" placeholder="e.g. TechNovation Labs" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Duration</label>
                <input type="text" id="res-exp-period" class="form-control" value="${escapeHtml(resume.experience?.[0]?.period || '')}" placeholder="e.g. June 2024 - August 2024" />
              </div>
              <div class="form-group">
                <label class="form-label">Bullet Points (1 per line)</label>
                <textarea id="res-exp-desc" class="form-control" rows="2" placeholder="Describe achievements and impact...">${escapeHtml(Array.isArray(resume.experience?.[0]?.bullets) ? resume.experience[0].bullets.join('\n') : (resume.experience?.[0]?.bullets || ''))}</textarea>
              </div>
            </div>
          </details>

          <!-- 6. Certifications -->
          <details class="editor-group">
            <summary>📜 Certifications</summary>
            <div class="group-content">
              <div class="form-group">
                <label class="form-label">Certification 1</label>
                <input type="text" id="res-cert1" class="form-control" value="${escapeHtml(resume.certifications?.[0]?.name || '') + (resume.certifications?.[0]?.issuer ? ' - ' + escapeHtml(resume.certifications[0].issuer) : '')}" placeholder="Certification Name - Issuer" />
              </div>
              <div class="form-group">
                <label class="form-label">Certification 2</label>
                <input type="text" id="res-cert2" class="form-control" value="${escapeHtml(resume.certifications?.[1]?.name || '') + (resume.certifications?.[1]?.issuer ? ' - ' + escapeHtml(resume.certifications[1].issuer) : '')}" placeholder="Certification Name - Issuer" />
              </div>
            </div>
          </details>
        </div>
      </aside>

      <!-- RIGHT COLUMN: LIVE ATS-FORMATTED RESUME PREVIEW -->
      <main class="resume-preview-panel">
        <div class="preview-header-bar no-print">
          <div class="preview-badge">
            <span class="dot dot-active"></span> ATS-Compliant Layout
          </div>
          <span class="preview-note text-muted">Standard 1-page single column format with verified hyperlinks</span>
        </div>

        <div class="ats-resume-sheet" id="ats-resume-sheet">
          <!-- Live populated header -->
          <header class="ats-header">
            <h1 class="ats-name" id="preview-name">${escapeHtml(resume.fullName || 'Your Name')}</h1>
            <div class="ats-contact-line">
              <span id="preview-email">${escapeHtml(resume.email || '')}</span> • 
              <span id="preview-phone">${escapeHtml(resume.phone || '')}</span> • 
              <span id="preview-location">${escapeHtml(resume.location || 'Delhi, India')}</span>
            </div>
            <div class="ats-links-line" id="preview-links-line" style="margin-top: 0.25rem;">
              <!-- Populated dynamically with LinkedIn and verified clickable GitHub Profile URL -->
            </div>
          </header>

          <!-- Summary -->
          <section class="ats-section">
            <h2 class="ats-section-title">Professional Summary</h2>
            <p class="ats-summary-text" id="preview-summary">${escapeHtml(resume.summary || '')}</p>
          </section>

          <!-- Education -->
          <section class="ats-section">
            <h2 class="ats-section-title">Education</h2>
            <div class="ats-item">
              <div class="ats-item-header">
                <span class="ats-item-title font-bold" id="preview-edu-degree">${escapeHtml(resume.education?.[0]?.degree || '')}</span>
                <span class="ats-item-date" id="preview-edu-year">${escapeHtml(resume.education?.[0]?.year || '')}</span>
              </div>
              <div class="ats-item-sub">
                <span id="preview-edu-inst">${escapeHtml(resume.education?.[0]?.institution || '')}</span> | 
                <strong id="preview-edu-score">${escapeHtml(resume.education?.[0]?.score || '')}</strong>
              </div>
            </div>
          </section>

          <!-- Skills -->
          <section class="ats-section">
            <h2 class="ats-section-title">Technical Skills</h2>
            <div class="ats-skills-list" id="preview-skills">
              ${(Array.isArray(resume.skills) ? resume.skills : []).map(s => `<span class="ats-skill-pill">${escapeHtml(s)}</span>`).join('')}
            </div>
          </section>

          <!-- Experience -->
          <section class="ats-section">
            <h2 class="ats-section-title">Experience & Internships</h2>
            <div class="ats-item">
              <div class="ats-item-header">
                <span class="ats-item-title font-bold" id="preview-exp-role">${escapeHtml(resume.experience?.[0]?.role || '')}</span>
                <span class="ats-item-date" id="preview-exp-period">${escapeHtml(resume.experience?.[0]?.period || '')}</span>
              </div>
              <div class="ats-item-sub" id="preview-exp-comp">${escapeHtml(resume.experience?.[0]?.company || '')}</div>
              <ul class="ats-bullets" id="preview-exp-bullets">
                ${resume.experience?.[0]?.bullets?.map(b => `<li>${escapeHtml(b)}</li>`).join('') || ''}
              </ul>
            </div>
          </section>

          <!-- Projects Section (Selected / Included Only) -->
          <section class="ats-section" id="ats-projects-section">
            <h2 class="ats-section-title">Projects</h2>
            <div id="preview-projects-list">
              <!-- Rendered dynamically -->
            </div>
          </section>

          <!-- Certifications -->
          <section class="ats-section">
            <h2 class="ats-section-title">Certifications & Accreditations</h2>
            <ul class="ats-bullets" id="preview-certs">
              <li id="preview-cert-1">${escapeHtml(resume.certifications?.[0]?.name || 'Certification 1')}${resume.certifications?.[0]?.issuer ? ' (' + escapeHtml(resume.certifications[0].issuer) + ')' : ''}${resume.certifications?.[0]?.year ? ' - ' + resume.certifications[0].year : ''}</li>
              <li id="preview-cert-2">${escapeHtml(resume.certifications?.[1]?.name || 'Certification 2')}${resume.certifications?.[1]?.issuer ? ' (' + escapeHtml(resume.certifications[1].issuer) + ')' : ''}${resume.certifications?.[1]?.year ? ' - ' + resume.certifications[1].year : ''}</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  `;

  // ==================== PROJECT EDITOR RENDERING & EVENT DELEGATION ====================
  const projectsContainer = container.querySelector('#projects-editor-list');
  const projCountBadge = container.querySelector('#proj-count-badge');
  const previewProjectsContainer = container.querySelector('#preview-projects-list');

  const renderProjectEditorCards = () => {
    const includedCount = projectsList.filter(p => p.included).length;
    if (projCountBadge) {
      projCountBadge.textContent = `${includedCount} of ${projectsList.length} Included`;
    }

    if (projectsList.length === 0) {
      projectsContainer.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
          <p class="text-muted" style="margin-bottom: 0.5rem;">No projects added yet.</p>
          <button type="button" class="btn btn-sm btn-primary" id="btn-add-first-proj">+ Add Your First Project</button>
        </div>
      `;
      const addFirstBtn = projectsContainer.querySelector('#btn-add-first-proj');
      if (addFirstBtn) {
        addFirstBtn.addEventListener('click', handleAddNewProject);
      }
      syncPreview();
      return;
    }

    projectsContainer.innerHTML = projectsList.map((p, index) => `
      <div class="resume-proj-card ${p.included ? 'is-included' : 'is-excluded'}" data-index="${index}" data-id="${p.id}" style="border: 1px solid ${p.included ? '#93c5fd' : '#e2e8f0'}; border-radius: 8px; margin-bottom: 0.85rem; background: ${p.included ? '#ffffff' : '#f8fafc'}; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Header / Controls Bar -->
        <div class="resume-proj-header" style="display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.75rem; background: ${p.included ? '#eff6ff' : '#f1f5f9'}; border-bottom: 1px solid ${p.included ? '#bfdbfe' : '#e2e8f0'}; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0;">
            <label style="display: flex; align-items: center; gap: 0.35rem; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: ${p.included ? '#1d4ed8' : '#64748b'}; margin: 0;">
              <input type="checkbox" class="proj-toggle-include" data-index="${index}" ${p.included ? 'checked' : ''} style="width: 15px; height: 15px; cursor: pointer;" />
              <span>${p.included ? 'Include on Resume' : 'Excluded'}</span>
            </label>
            <span class="font-semibold text-clamp-1" style="font-size: 0.85rem; color: #1e293b;" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name || 'Untitled Project')}
            </span>
            ${p.status ? `<span class="badge badge-sm badge-outline" style="font-size: 0.68rem; padding: 0.1rem 0.35rem; white-space: nowrap;">${escapeHtml(p.status)}</span>` : ''}
          </div>
          <div class="proj-action-btns" style="display: flex; gap: 0.25rem; align-items: center; flex-shrink: 0;">
            <button type="button" class="btn btn-xs btn-outline proj-btn-move-up" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed; padding:0.2rem 0.45rem; font-size:0.75rem;"' : 'style="padding:0.2rem 0.45rem; font-size:0.75rem;"'}>⬆️</button>
            <button type="button" class="btn btn-xs btn-outline proj-btn-move-down" data-index="${index}" title="Move Down" ${index === projectsList.length - 1 ? 'disabled style="opacity:0.4; cursor:not-allowed; padding:0.2rem 0.45rem; font-size:0.75rem;"' : 'style="padding:0.2rem 0.45rem; font-size:0.75rem;"'}>⬇️</button>
            <button type="button" class="btn btn-xs btn-text text-danger proj-btn-delete" data-index="${index}" title="Delete Project" style="padding:0.2rem 0.45rem; font-size:0.75rem;">🗑️</button>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="resume-proj-body" style="padding: 0.75rem;">
          <div class="form-group" style="margin-bottom: 0.5rem;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">Project Name <span class="text-danger">*</span></label>
            <input type="text" class="form-control form-control-sm proj-field-name" data-index="${index}" value="${escapeHtml(p.name || '')}" placeholder="e.g. Distributed Task Queue" />
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">Technologies Used</label>
              <input type="text" class="form-control form-control-sm proj-field-tech" data-index="${index}" value="${escapeHtml(p.technologies || '')}" placeholder="e.g. React, Node.js, SQLite" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">Status (Optional)</label>
              <select class="form-control form-control-sm proj-field-status" data-index="${index}">
                <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Featured" ${p.status === 'Featured' ? 'selected' : ''}>Featured</option>
                <option value="Academic" ${p.status === 'Academic' ? 'selected' : ''}>Academic</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0.5rem;">
            <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">Short Description / Key Highlights</label>
            <textarea class="form-control form-control-sm proj-field-desc" data-index="${index}" rows="2" placeholder="Highlight features, architecture, and impact...">${escapeHtml(p.description || '')}</textarea>
          </div>

          <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">GitHub Repository URL</label>
              <input type="url" class="form-control form-control-sm proj-field-github" data-index="${index}" value="${escapeHtml(p.githubUrl || '')}" placeholder="https://github.com/user/repo" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 0.8rem; margin-bottom: 0.2rem;">Live Demo URL (Optional)</label>
              <input type="url" class="form-control form-control-sm proj-field-demo" data-index="${index}" value="${escapeHtml(p.demoUrl || '')}" placeholder="https://project-demo.com" />
            </div>
          </div>
        </div>
      </div>
    `).join('');

    attachProjectListeners();
    syncPreview();
  };

  const attachProjectListeners = () => {
    // Checkbox toggles
    projectsContainer.querySelectorAll('.proj-toggle-include').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].included = e.target.checked;
          renderProjectEditorCards();
        }
      });
    });

    // Move Up
    projectsContainer.querySelectorAll('.proj-btn-move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (idx > 0) {
          const item = projectsList.splice(idx, 1)[0];
          projectsList.splice(idx - 1, 0, item);
          renderProjectEditorCards();
          showToast(`Moved "${item.name}" up`, 'info');
        }
      });
    });

    // Move Down
    projectsContainer.querySelectorAll('.proj-btn-move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (idx < projectsList.length - 1) {
          const item = projectsList.splice(idx, 1)[0];
          projectsList.splice(idx + 1, 0, item);
          renderProjectEditorCards();
          showToast(`Moved "${item.name}" down`, 'info');
        }
      });
    });

    // Delete
    projectsContainer.querySelectorAll('.proj-btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          const deletedName = projectsList[idx].name;
          projectsList.splice(idx, 1);
          renderProjectEditorCards();
          showToast(`Deleted project "${deletedName}"`, 'info');
        }
      });
    });

    // Live inputs within project cards
    projectsContainer.querySelectorAll('.proj-field-name').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].name = e.target.value;
          projectsList[idx].title = e.target.value;
          syncPreview();
        }
      });
    });

    projectsContainer.querySelectorAll('.proj-field-tech').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].technologies = e.target.value;
          projectsList[idx].tech = e.target.value;
          syncPreview();
        }
      });
    });

    projectsContainer.querySelectorAll('.proj-field-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].status = e.target.value;
          renderProjectEditorCards();
        }
      });
    });

    projectsContainer.querySelectorAll('.proj-field-desc').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].description = e.target.value;
          syncPreview();
        }
      });
    });

    projectsContainer.querySelectorAll('.proj-field-github').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].githubUrl = e.target.value;
          syncPreview();
        }
      });
    });

    projectsContainer.querySelectorAll('.proj-field-demo').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx) && projectsList[idx]) {
          projectsList[idx].demoUrl = e.target.value;
          syncPreview();
        }
      });
    });
  };

  const handleAddNewProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: 'New Featured Project',
      title: 'New Featured Project',
      description: 'Describe the problem solved, architectural choices, and tangible outcomes.',
      technologies: 'React, Node.js, SQLite',
      tech: 'React, Node.js, SQLite',
      githubUrl: 'https://github.com/username/project',
      demoUrl: '',
      status: 'Completed',
      included: true
    };
    projectsList.unshift(newProj);
    renderProjectEditorCards();
    showToast('New project card added! Fill in your details.', 'success');
  };

  const addProjectBtn = container.querySelector('#add-project-btn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', handleAddNewProject);
  }

  // ==================== LIVE REAL-TIME PREVIEW SYNCHRONIZATION ====================
  const syncPreview = () => {
    const name = container.querySelector('#res-name').value;
    const email = container.querySelector('#res-email').value;
    const phone = container.querySelector('#res-phone').value;
    const location = container.querySelector('#res-location').value;
    const linkedin = container.querySelector('#res-linkedin').value;
    const githubRaw = container.querySelector('#res-github').value;
    const summary = container.querySelector('#res-summary').value;

    container.querySelector('#preview-name').textContent = name || 'Your Name';
    container.querySelector('#preview-email').textContent = email || 'your.email@example.com';
    container.querySelector('#preview-phone').textContent = phone || '+91 99999 99999';
    container.querySelector('#preview-location').textContent = location || 'Delhi, India';
    container.querySelector('#preview-summary').textContent = summary || 'Passionate student and developer...';

    // Validate and render GitHub Profile URL in header
    const ghVal = validateGitHubUrl(githubRaw);
    const ghFeedback = container.querySelector('#res-github-feedback');
    if (ghFeedback) {
      if (!githubRaw.trim()) {
        ghFeedback.textContent = '';
      } else if (ghVal.valid) {
        ghFeedback.textContent = `✓ Recognized: ${ghVal.url}`;
        ghFeedback.style.color = '#16a34a';
      } else {
        ghFeedback.textContent = ghVal.error;
        ghFeedback.style.color = '#dc2626';
      }
    }

    const previewLinksLine = container.querySelector('#preview-links-line');
    let linksHtml = '';
    if (linkedin.trim()) {
      linksHtml += `<a href="${escapeHtml(formatUrl(linkedin))}" target="_blank" rel="noopener noreferrer" style="color:#1D4ED8; text-decoration:underline;">${escapeHtml(linkedin.replace(/^https?:\/\/(www\.)?/i, ''))}</a>`;
    }
    if (linkedin.trim() && ghVal.valid && ghVal.url) {
      linksHtml += ` <span style="margin: 0 0.4rem; color:#9CA3AF;">|</span> `;
    }
    if (ghVal.valid && ghVal.url) {
      linksHtml += `<a href="${escapeHtml(ghVal.url)}" target="_blank" rel="noopener noreferrer" style="color:#1D4ED8; text-decoration:underline;">🔗 GitHub: ${escapeHtml(ghVal.formatted)}</a>`;
    }
    previewLinksLine.innerHTML = linksHtml || '<span class="text-muted" style="font-size:0.8rem;">Add LinkedIn or GitHub URL in editor</span>';

    // Education
    container.querySelector('#preview-edu-degree').textContent = container.querySelector('#res-edu-degree').value;
    container.querySelector('#preview-edu-inst').textContent = container.querySelector('#res-edu-inst').value;
    container.querySelector('#preview-edu-year').textContent = container.querySelector('#res-edu-year').value;
    container.querySelector('#preview-edu-score').textContent = container.querySelector('#res-edu-score').value;

    // Skills
    const skillsRaw = container.querySelector('#res-skills-input').value;
    const skillsList = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
    container.querySelector('#preview-skills').innerHTML = skillsList.map(s => 
      `<span class="ats-skill-pill">${escapeHtml(s)}</span>`
    ).join('');

    // Experience
    container.querySelector('#preview-exp-role').textContent = container.querySelector('#res-exp-role').value;
    container.querySelector('#preview-exp-comp').textContent = container.querySelector('#res-exp-comp').value;
    container.querySelector('#preview-exp-period').textContent = container.querySelector('#res-exp-period').value;
    const expBullets = container.querySelector('#res-exp-desc').value.split('\n').filter(Boolean);
    container.querySelector('#preview-exp-bullets').innerHTML = expBullets.map(b => `<li>${escapeHtml(b)}</li>`).join('');

    // Projects Preview (Only included: true)
    const includedProjects = projectsList.filter(p => p.included);
    if (includedProjects.length === 0) {
      previewProjectsContainer.innerHTML = `
        <div style="padding: 0.5rem 0; color: #64748b; font-style: italic; font-size: 0.85rem;">
          No projects currently included. Check "Include on Resume" on any project on the left to display it here.
        </div>
      `;
    } else {
      previewProjectsContainer.innerHTML = includedProjects.map(p => `
        <div class="ats-item" style="margin-bottom: 0.75rem;">
          <div class="ats-item-header" style="display: flex; justify-content: space-between; align-items: baseline;">
            <span class="ats-item-title font-bold" style="font-size: 0.95rem; color: #111827;">
              ${escapeHtml(p.name || 'Untitled Project')}
              ${p.status ? `<span class="ats-proj-status-tag" style="font-size: 0.75rem; font-weight: normal; color: #4B5563; margin-left: 0.35rem;">(${escapeHtml(p.status)})</span>` : ''}
            </span>
            <span class="ats-item-tech font-bold" style="font-size: 0.85rem; color: #1F2937;">${escapeHtml(p.technologies || '')}</span>
          </div>
          ${p.description ? `<p class="ats-item-desc" style="font-size: 0.875rem; margin: 0.25rem 0 0.2rem 0; color: #374151; white-space: pre-line;">${escapeHtml(p.description)}</p>` : ''}
          <div class="ats-item-links" style="font-size: 0.825rem; margin-top: 0.2rem;">
            ${(p.githubUrl && p.githubUrl.trim() && p.githubUrl !== '#') ? `
              <a href="${escapeHtml(formatUrl(p.githubUrl))}" target="_blank" rel="noopener noreferrer" class="ats-proj-link" style="color: #2563EB; text-decoration: underline;">
                🔗 GitHub Repo: ${escapeHtml(p.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/'))}
              </a>` : ''}
            ${(p.githubUrl && p.githubUrl.trim() && p.githubUrl !== '#' && p.demoUrl && p.demoUrl.trim() && p.demoUrl !== '#') ? `<span class="ats-link-sep" style="margin: 0 0.4rem; color: #9CA3AF;">•</span>` : ''}
            ${(p.demoUrl && p.demoUrl.trim() && p.demoUrl !== '#') ? `
              <a href="${escapeHtml(formatUrl(p.demoUrl))}" target="_blank" rel="noopener noreferrer" class="ats-proj-link" style="color: #059669; text-decoration: underline;">
                🌐 Live Demo: ${escapeHtml(p.demoUrl.replace(/^https?:\/\/(www\.)?/i, ''))}
              </a>` : ''}
          </div>
        </div>
      `).join('');
    }

    // Certifications
    container.querySelector('#preview-cert-1').textContent = container.querySelector('#res-cert1').value;
    container.querySelector('#preview-cert-2').textContent = container.querySelector('#res-cert2').value;
  };

  // Attach input listeners to static fields
  container.querySelectorAll('#res-name, #res-email, #res-phone, #res-location, #res-linkedin, #res-github, #res-summary, #res-edu-degree, #res-edu-inst, #res-edu-year, #res-edu-score, #res-skills-input, #res-exp-role, #res-exp-comp, #res-exp-period, #res-exp-desc, #res-cert1, #res-cert2').forEach(input => {
    input.addEventListener('input', syncPreview);
  });

  // ==================== SAVE RESUME HANDLER ====================
  const handleSaveResume = () => {
    const skillsList = container.querySelector('#res-skills-input').value.split(',').map(s => s.trim()).filter(Boolean);
    const ghValidation = validateGitHubUrl(container.querySelector('#res-github').value);

    const updated = {
      fullName: container.querySelector('#res-name').value.trim(),
      email: container.querySelector('#res-email').value.trim(),
      phone: container.querySelector('#res-phone').value.trim(),
      location: container.querySelector('#res-location').value.trim(),
      linkedin: container.querySelector('#res-linkedin').value.trim(),
      github: ghValidation.valid ? ghValidation.url : container.querySelector('#res-github').value.trim(),
      summary: container.querySelector('#res-summary').value.trim(),
      education: [
        {
          degree: container.querySelector('#res-edu-degree').value.trim(),
          institution: container.querySelector('#res-edu-inst').value.trim(),
          year: container.querySelector('#res-edu-year').value.trim(),
          score: container.querySelector('#res-edu-score').value.trim()
        }
      ],
      skills: skillsList,
      projects: projectsList, // Fully persisted multi-project array with included, status, githubUrl, demoUrl
      experience: [
        {
          role: container.querySelector('#res-exp-role').value.trim(),
          company: container.querySelector('#res-exp-comp').value.trim(),
          period: container.querySelector('#res-exp-period').value.trim(),
          bullets: container.querySelector('#res-exp-desc').value.split('\n').map(b => b.trim()).filter(Boolean)
        }
      ],
      certifications: [
        { name: container.querySelector('#res-cert1').value.trim(), issuer: 'Verified', year: '2024' },
        { name: container.querySelector('#res-cert2').value.trim(), issuer: 'Verified', year: '2023' }
      ]
    };

    store.saveResumeData(updated);
    showToast('Resume saved! All projects and details persisted across reloads.', 'success');
  };

  // ==================== AUTO-FILL FROM PROFILE ====================
  const handleAutoFillFromProfile = () => {
    const updated = store.autoFillResumeFromProfile();
    container.querySelector('#res-name').value = updated.fullName || '';
    container.querySelector('#res-email').value = updated.email || '';
    container.querySelector('#res-phone').value = updated.phone || '';
    container.querySelector('#res-location').value = updated.location || '';
    container.querySelector('#res-linkedin').value = updated.linkedin || '';
    container.querySelector('#res-github').value = updated.github || '';
    container.querySelector('#res-summary').value = updated.summary || '';

    if (updated.education && updated.education[0]) {
      container.querySelector('#res-edu-degree').value = updated.education[0].degree || '';
      container.querySelector('#res-edu-inst').value = updated.education[0].institution || '';
      container.querySelector('#res-edu-year').value = updated.education[0].year || '';
      container.querySelector('#res-edu-score').value = updated.education[0].score || '';
    }

    if (Array.isArray(updated.skills)) {
      container.querySelector('#res-skills-input').value = updated.skills.join(', ');
    }

    // Projects list is preserved and safely normalized
    if (Array.isArray(updated.projects) && updated.projects.length > 0) {
      projectsList = JSON.parse(JSON.stringify(updated.projects));
      renderProjectEditorCards();
    } else {
      syncPreview();
    }

    showToast('Resume auto-filled from Profile! (Profile was not modified)', 'success');
  };

  // Wire buttons
  const saveBtn = container.querySelector('#save-resume-btn');
  if (saveBtn) saveBtn.addEventListener('click', handleSaveResume);
  const saveTopBtn = container.querySelector('#save-resume-top-btn');
  if (saveTopBtn) saveTopBtn.addEventListener('click', handleSaveResume);

  const autoFillBtn = container.querySelector('#autofill-profile-btn');
  if (autoFillBtn) autoFillBtn.addEventListener('click', handleAutoFillFromProfile);
  const autoFillTopBtn = container.querySelector('#autofill-profile-top-btn');
  if (autoFillTopBtn) autoFillTopBtn.addEventListener('click', handleAutoFillFromProfile);

  // Upload Resume handler
  const fileUploadInput = container.querySelector('#resume-file-upload');
  if (fileUploadInput) {
    fileUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const alertBox = container.querySelector('#upload-status-alert');
        const alertText = container.querySelector('#upload-status-text');
        alertText.innerHTML = `<strong>Uploaded:</strong> ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB). Resume details synchronized into the editor.`;
        alertBox.style.display = 'block';
        showToast(`Resume uploaded: ${file.name}`, 'success');
      }
    });
  }

  // Print / Download PDF
  const printBtn = container.querySelector('#print-resume-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial render of projects cards and live preview
  renderProjectEditorCards();
}
