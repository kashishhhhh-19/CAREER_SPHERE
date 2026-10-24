/**
 * CareerSphere - Notes View
 * Student study notes manager with Add Note, Search, Category filters, Edit, and Delete.
 * Persistent in LocalStorage via store.js.
 */

import { store } from '../store.js';
import { formatDate, openModal, closeModal, showToast, escapeHtml } from '../utils.js';

export function renderNotesView(container) {
  container.innerHTML = `
    <div class="view-header notes-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <span>Home</span> / <span class="active">Study Notes</span>
        </div>
        <div class="header-action-row">
          <div>
            <h1 class="page-title">Personal Study & Interview Notes</h1>
            <p class="page-desc">
              Organize formulas, coding algorithms, interview cheat sheets, and exam strategies. Saved securely in your browser.
            </p>
          </div>
          <button class="btn btn-primary" id="add-note-btn">
            + Add New Note
          </button>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- Notes Controls Bar -->
      <div class="notes-controls-bar card">
        <div class="notes-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="notes-search-input" placeholder="Search notes by title or keywords..." />
        </div>

        <div class="notes-category-chips" id="notes-category-chips">
          <button class="chip-btn active" data-category="All">All Notes</button>
          <button class="chip-btn" data-category="Aptitude">Aptitude</button>
          <button class="chip-btn" data-category="Tech/Coding">Tech/Coding</button>
          <button class="chip-btn" data-category="Govt Exams">Govt Exams</button>
          <button class="chip-btn" data-category="Interview Prep">Interview Prep</button>
        </div>
      </div>

      <!-- Notes Grid -->
      <div class="notes-grid" id="notes-cards-container">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  let activeCategory = 'All';
  const searchInput = container.querySelector('#notes-search-input');
  const cardsContainer = container.querySelector('#notes-cards-container');
  const addNoteBtn = container.querySelector('#add-note-btn');

  const renderNotesList = () => {
    const query = searchInput.value.toLowerCase().trim();
    const notes = store.getNotes();

    const filtered = notes.filter(n => {
      if (activeCategory !== 'All' && n.category !== activeCategory) return false;
      if (query) {
        const inTitle = n.title.toLowerCase().includes(query);
        const inContent = n.content.toLowerCase().includes(query);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div class="empty-state card full-width">
          <div class="empty-icon">📝</div>
          <h3>No study notes found</h3>
          <p>You haven't added any notes matching this filter yet.</p>
          <button class="btn btn-primary" id="empty-add-note-btn">+ Create Your First Note</button>
        </div>
      `;
      container.querySelector('#empty-add-note-btn')?.addEventListener('click', () => openNoteEditorModal());
      return;
    }

    cardsContainer.innerHTML = filtered.map(note => {
      return `
        <div class="note-card card" data-id="${note.id}">
          <div class="note-card-header">
            <span class="badge badge-primary">${escapeHtml(note.category)}</span>
            <span class="note-date text-muted">${formatDate(note.date)}</span>
          </div>

          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <div class="note-content-preview">
            <pre class="note-pre">${escapeHtml(note.content)}</pre>
          </div>

          <div class="note-card-footer">
            <button class="btn-text edit-note-btn" data-id="${note.id}">✏️ Edit</button>
            <button class="btn-text text-danger delete-note-btn" data-id="${note.id}">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');

    attachNotesEvents(cardsContainer);
  };

  const openNoteEditorModal = (existingNote = null) => {
    const isEdit = !!existingNote;
    openModal({
      title: isEdit ? 'Edit Note' : 'Create New Study Note',
      size: 'medium',
      contentHtml: `
        <form id="note-form" class="modal-form">
          <div class="form-group">
            <label for="modal-note-title" class="form-label">Note Title</label>
            <input 
              type="text" 
              id="modal-note-title" 
              class="form-control" 
              placeholder="e.g. Time & Work Formulas, Binary Search Checklist" 
              value="${existingNote ? escapeHtml(existingNote.title) : ''}" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="modal-note-cat" class="form-label">Category</label>
            <select id="modal-note-cat" class="form-select">
              <option value="Aptitude" ${existingNote?.category === 'Aptitude' ? 'selected' : ''}>Aptitude</option>
              <option value="Tech/Coding" ${existingNote?.category === 'Tech/Coding' ? 'selected' : ''}>Tech/Coding</option>
              <option value="Govt Exams" ${existingNote?.category === 'Govt Exams' ? 'selected' : ''}>Govt Exams</option>
              <option value="Interview Prep" ${existingNote?.category === 'Interview Prep' ? 'selected' : ''}>Interview Prep</option>
              <option value="General" ${existingNote?.category === 'General' ? 'selected' : ''}>General</option>
            </select>
          </div>

          <div class="form-group">
            <label for="modal-note-content" class="form-label">Note Content</label>
            <textarea 
              id="modal-note-content" 
              class="form-control" 
              rows="7" 
              placeholder="Write formulas, revision bullet points, query snippets..." 
              required
            >${existingNote ? escapeHtml(existingNote.content) : ''}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" id="modal-cancel-note">Cancel</button>
        <button class="btn btn-primary" id="modal-save-note">
          ${isEdit ? 'Save Changes' : 'Create Note'}
        </button>
      `
    });

    document.getElementById('modal-cancel-note')?.addEventListener('click', closeModal);

    document.getElementById('modal-save-note')?.addEventListener('click', () => {
      const title = document.getElementById('modal-note-title').value.trim();
      const category = document.getElementById('modal-note-cat').value;
      const content = document.getElementById('modal-note-content').value.trim();

      if (!title || !content) {
        showToast('Please provide both a title and content for your note', 'warning');
        return;
      }

      if (isEdit) {
        store.updateNote(existingNote.id, { title, category, content });
        showToast('Note updated successfully!', 'success');
      } else {
        store.addNote({ title, category, content });
        showToast('New note added!', 'success');
      }

      closeModal();
      renderNotesList();
    });
  };

  const attachNotesEvents = (elem) => {
    // Edit
    elem.querySelectorAll('.edit-note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const note = store.getNotes().find(n => n.id === id);
        if (note) openNoteEditorModal(note);
      });
    });

    // Delete
    elem.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this note?')) {
          store.deleteNote(id);
          showToast('Note deleted', 'info');
          renderNotesList();
        }
      });
    });
  };

  // Add Note button
  addNoteBtn.addEventListener('click', () => openNoteEditorModal());

  // Search input
  searchInput.addEventListener('input', renderNotesList);

  // Category chips
  container.querySelectorAll('#notes-category-chips .chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('#notes-category-chips .chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderNotesList();
    });
  });

  // Initial render
  renderNotesList();
}
