/**
 * CareerSphere - Exam & Interview Preparation View
 * Progress cards for Aptitude, Reasoning, English, Tech fundamentals,
 * Python, SQL, Web Dev, Interview, and Government GK with interactive syllabus checklist.
 */

import { store } from '../store.js';
import { openModal, showToast } from '../utils.js';

export function renderPrepView(container) {
  const tracks = store.getPrepTracks();

  // Compute overall progress summary
  const totalCompleted = tracks.reduce((acc, t) => acc + (t.completedModules || 0), 0);
  const totalModules = tracks.reduce((acc, t) => acc + (t.modulesCount || 0), 0);
  const overallAvg = Math.round((totalCompleted / totalModules) * 100);

  container.innerHTML = `
    <div class="view-header prep-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Preparation</span>
        </div>
        <h1 class="page-title">Placement & Competitive Exam Preparation</h1>
        <p class="page-desc">
          Structured learning modules and interactive checklists for campus placement drives, technical tests, and government recruitment exams.
        </p>

        <!-- Preparation Stats Banner -->
        <div class="prep-stats-banner">
          <div class="prep-stat-col">
            <span class="stat-big-val">${overallAvg}%</span>
            <span class="stat-sub">Overall Readiness</span>
          </div>
          <div class="prep-stat-divider"></div>
          <div class="prep-stat-col">
            <span class="stat-big-val">${totalCompleted} / ${totalModules}</span>
            <span class="stat-sub">Modules Completed</span>
          </div>
          <div class="prep-stat-divider"></div>
          <div class="prep-stat-col">
            <span class="stat-big-val">10 Tracks</span>
            <span class="stat-sub">Covering CS & Govt</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- Filter Tabs -->
      <div class="filter-tabs" id="prep-category-tabs">
        <button class="tab-btn active" data-cat="All">All Tracks (10)</button>
        <button class="tab-btn" data-cat="General">Aptitude & Verbal</button>
        <button class="tab-btn" data-cat="Technical">Technical & Coding</button>
        <button class="tab-btn" data-cat="Government">Govt GK & Exams</button>
        <button class="tab-btn" data-cat="Career">Interview Prep</button>
      </div>

      <!-- Tracks Grid -->
      <div class="prep-tracks-grid" id="prep-tracks-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const tabs = container.querySelectorAll('#prep-category-tabs .tab-btn');
  const tracksContainer = container.querySelector('#prep-tracks-container');

  const renderTracks = (category = 'All') => {
    const currentTracks = store.getPrepTracks();
    const filtered = category === 'All' 
      ? currentTracks 
      : currentTracks.filter(t => t.category === category);

    tracksContainer.innerHTML = filtered.map(track => {
      const isCompleted = track.progress === 100;
      return `
        <div class="prep-card card" data-id="${track.id}">
          <div class="prep-card-top">
            <div class="prep-icon-box">${track.icon}</div>
            <div class="prep-meta">
              <span class="badge badge-outline">${track.difficulty}</span>
              <span class="badge badge-neutral">⏱️ ${track.estimatedHours}</span>
            </div>
          </div>

          <h3 class="prep-title">${track.title}</h3>
          <p class="prep-desc">${track.description}</p>

          <!-- Progress Bar -->
          <div class="prep-progress-wrapper">
            <div class="progress-info">
              <span class="progress-text"><strong>${track.completedModules}</strong> of ${track.modulesCount} modules</span>
              <span class="progress-percentage ${track.progress > 75 ? 'text-success' : 'text-primary'} font-bold">${track.progress}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${track.progress}%"></div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="prep-card-footer">
            <button class="btn btn-outline-primary btn-sm view-syllabus-btn" data-id="${track.id}">
              Study Plan & Checklist
            </button>
            <button class="btn btn-primary btn-sm practice-btn" data-id="${track.id}">
              ${isCompleted ? 'Review' : 'Continue'} &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachPrepEvents(tracksContainer);
  };

  const openTrackChecklistModal = (trackId) => {
    const currentTracks = store.getPrepTracks();
    const track = currentTracks.find(t => t.id === trackId);
    if (!track) return;

    openModal({
      title: `${track.icon} ${track.title} - Study Checklist`,
      size: 'medium',
      contentHtml: `
        <div class="prep-modal-header">
          <p class="text-muted">${track.description}</p>
          <div class="prep-modal-progress">
            <span id="modal-track-progress-lbl" class="font-bold text-primary">${track.progress}% Completed (${track.completedModules}/${track.modulesCount} Modules)</span>
          </div>
        </div>

        <div class="prep-checklist-container">
          <h5 class="checklist-title">Core Learning Modules & Topics:</h5>
          <div class="checklist-items" id="modal-checklist-items">
            ${track.topics.map((topic, idx) => `
              <label class="topic-item ${topic.completed ? 'checked' : ''}">
                <input type="checkbox" data-track="${track.id}" data-idx="${idx}" ${topic.completed ? 'checked' : ''} />
                <span class="topic-name">${topic.name}</span>
                <span class="topic-badge">${topic.completed ? '✓ Mastered' : 'Pending'}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-primary" onclick="window.CareerSphereModalClose()">
          Done & Close
        </button>
      `
    });

    // Handle topic toggle inside modal
    const modalChecklist = document.getElementById('modal-checklist-items');
    if (modalChecklist) {
      modalChecklist.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const tId = e.target.dataset.track;
          const idx = parseInt(e.target.dataset.idx, 10);
          const updatedTrack = store.togglePrepTopic(tId, idx);
          if (updatedTrack) {
            e.target.closest('.topic-item').classList.toggle('checked', e.target.checked);
            const badge = e.target.closest('.topic-item').querySelector('.topic-badge');
            if (badge) {
              badge.textContent = e.target.checked ? '✓ Mastered' : 'Pending';
            }
            const lbl = document.getElementById('modal-track-progress-lbl');
            if (lbl) {
              lbl.textContent = `${updatedTrack.progress}% Completed (${updatedTrack.completedModules}/${updatedTrack.modulesCount} Modules)`;
            }
            // Re-render tracks in background
            const activeTab = container.querySelector('#prep-category-tabs .tab-btn.active').dataset.cat;
            renderTracks(activeTab);
            showToast(`Progress updated: ${updatedTrack.progress}%`, 'success', 2000);
          }
        });
      });
    }
  };

  const attachPrepEvents = (elem) => {
    elem.querySelectorAll('.view-syllabus-btn, .practice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openTrackChecklistModal(btn.dataset.id);
      });
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTracks(tab.dataset.cat);
    });
  });

  // Initial render
  renderTracks('All');
}
