/**
 * CareerSphere - Student Projects Portfolio View
 * Student project portfolio showcase with category filters, tech stack tags,
 * GitHub repository links, and Live Demo triggers.
 */

import { store } from '../store.js';
import { openModal, showToast, escapeHtml } from '../utils.js';

export function renderProjectsView(container) {
  const allProjects = store.getProjects();
  container.innerHTML = `
    <div class="view-header projects-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Student Projects</span>
        </div>
        <h1 class="page-title">Featured Projects & Student Portfolios</h1>
        <p class="page-desc">
          Inspiring hands-on projects designed to showcase full-stack mastery, database architecture, and machine learning skills on your resume.
        </p>
      </div>
    </div>

    <div class="section-container">
      <!-- Category Filter Pills -->
      <div class="category-pills-scroll" id="projects-cat-pills">
        <button class="pill-btn active" data-cat="All">All Projects (${allProjects.length})</button>
        <button class="pill-btn" data-cat="Full Stack">Full Stack</button>
        <button class="pill-btn" data-cat="Web Development">Web Development</button>
        <button class="pill-btn" data-cat="Python / ML">Python / AI & ML</button>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid" id="projects-cards-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const pills = container.querySelectorAll('#projects-cat-pills .pill-btn');
  const cardsContainer = container.querySelector('#projects-cards-container');

  const renderCards = (selectedCategory = 'All') => {
    const filtered = selectedCategory === 'All'
      ? allProjects
      : allProjects.filter(p => p.category === selectedCategory);

    cardsContainer.innerHTML = filtered.map(proj => {
      const difficultyClass = proj.difficulty === 'Beginner' ? 'badge-info' : (proj.difficulty === 'Intermediate' ? 'badge-primary' : 'badge-purple');
      return `
        <div class="project-card card" data-id="${proj.id}">
          <div class="project-card-header">
            <div class="project-tags">
              <span class="badge ${difficultyClass}">${proj.difficulty}</span>
              <span class="badge badge-outline">${proj.category}</span>
            </div>
            ${proj.badge ? `<span class="project-flag">${proj.badge}</span>` : ''}
          </div>

          <h3 class="project-title">${escapeHtml(proj.name)}</h3>
          <p class="project-summary">${escapeHtml(proj.summary)}</p>

          <!-- Key Features -->
          <div class="project-features-box">
            <strong>Key Highlights:</strong>
            <ul class="bullet-list-sm">
              ${proj.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
            </ul>
          </div>

          <!-- Technologies -->
          <div class="project-tech-tags">
            ${proj.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
          </div>

          <!-- Actions -->
          <div class="project-actions">
            <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm btn-icon-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub Repo
            </a>
            <button class="btn btn-primary btn-sm btn-icon-text project-demo-btn" data-id="${proj.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Live Demo
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach demo listener
    cardsContainer.querySelectorAll('.project-demo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const p = allProjects.find(item => item.id === id);
        if (p) {
          openModal({
            title: `Live Demo: ${p.name}`,
            size: 'medium',
            contentHtml: `
              <div class="demo-modal-body">
                <div class="demo-placeholder-box">
                  <span class="demo-icon">🚀</span>
                  <h4>Interactive Simulation</h4>
                  <p>In Phase 1, project demonstrations run in local sandboxes. You can review the complete codebase on GitHub or clone the repository to run locally.</p>
                  <div class="tech-stack-row" style="margin-top: 1rem;">
                    ${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                  </div>
                </div>
              </div>
            `,
            footerHtml: `
              <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">View on GitHub</a>
              <button class="btn btn-primary" onclick="window.CareerSphereModalClose()">Close Demo</button>
            `
          });
        }
      });
    });
  };

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderCards(pill.dataset.cat);
    });
  });

  // Initial render
  renderCards('All');
}
