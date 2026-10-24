/**
 * CareerSphere - Utility Helpers
 * Toast notifications, Modal controllers, Date formatters, and UI helpers.
 */

import { OverlayManager } from './overlayManager.js';

// Toast Notifications
export function showToast(message, type = 'info', duration = 3200) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 250);
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 250);
    }
  }, duration);
}

// Modal Helpers
export function openModal({ title, contentHtml, footerHtml = '', size = 'medium' }) {
  const overlay = document.getElementById('global-modal-overlay');
  const modal = document.getElementById('global-modal');
  const modalTitle = document.getElementById('global-modal-title');
  const modalBody = document.getElementById('global-modal-body');
  const modalFooter = document.getElementById('global-modal-footer');

  if (!overlay || !modal) return;

  modal.className = `modal-dialog modal-${size}`;
  modalTitle.textContent = title;
  modalBody.innerHTML = contentHtml;
  modalFooter.innerHTML = footerHtml;
  modalFooter.style.display = footerHtml ? 'flex' : 'none';

  OverlayManager.open('global-modal');
}

export function closeModal() {
  OverlayManager.close('global-modal');
  OverlayManager.sanitize();
}

// Safe HTML Escaping
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Safe Date Parsing Helper
export function parseDateSafely(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'number') {
    if (isNaN(dateInput) || !isFinite(dateInput)) return null;
    const ms = dateInput < 10000000000 ? dateInput * 1000 : dateInput;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput !== 'string') return null;
  const s = dateInput.trim();
  if (!s || s.toLowerCase() === 'not available' || s.toLowerCase() === 'not specified' || s.toLowerCase() === 'open until filled' || s.toLowerCase().includes('invalid') || s.toLowerCase().includes('nan')) {
    return null;
  }

  // 1. Try standard ISO: YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  // 2. Try DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  // 3. Try standard Date.parse
  const parsedMs = Date.parse(s);
  if (!isNaN(parsedMs)) {
    const dateObj = new Date(parsedMs);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  return null;
}

// Format Dates
export function formatDate(dateString) {
  if (!dateString || dateString === 'Not available' || dateString === 'Not Specified' || dateString === 'Open until filled' || dateString === 'Check Portal' || dateString.startsWith('Refer to')) {
    return 'Open / Rolling Intake';
  }
  const parsed = parseDateSafely(dateString);
  if (parsed) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return parsed.toLocaleDateString('en-IN', options);
  }
  // If approximate text like "October 2026"
  if (typeof dateString === 'string') {
    const clean = dateString.trim();
    if (clean && !clean.toLowerCase().includes('invalid') && !clean.toLowerCase().includes('nan') && clean.length <= 40) {
      return clean;
    }
  }
  return 'Open / Rolling Intake';
}

// Deadline Status & Badge Engine
export function getOpportunityDeadlineStatus(deadlineDateStr) {
  if (!deadlineDateStr || deadlineDateStr === 'Not available' || deadlineDateStr === 'Not Specified' || deadlineDateStr === 'Open until filled' || deadlineDateStr === 'Check Portal' || deadlineDateStr.startsWith('Refer to')) {
    return {
      status: 'Not Available',
      badgeText: 'Open / Rolling Intake',
      colorClass: 'badge-neutral',
      diffDays: null
    };
  }

  const target = parseDateSafely(deadlineDateStr);
  if (!target) {
    if (typeof deadlineDateStr === 'string' && !deadlineDateStr.toLowerCase().includes('invalid')) {
      const clean = deadlineDateStr.trim();
      if (clean.length > 0 && clean.length <= 30) {
        return {
          status: 'Active',
          badgeText: clean,
          colorClass: 'badge-neutral',
          diffDays: null
        };
      }
    }
    return {
      status: 'Not Available',
      badgeText: 'Open / Rolling Intake',
      colorClass: 'badge-neutral',
      diffDays: null
    };
  }

  const now = new Date();
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = targetDay.getTime() - nowDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays)) {
    return {
      status: 'Not Available',
      badgeText: 'Open / Rolling Intake',
      colorClass: 'badge-neutral',
      diffDays: null
    };
  }

  if (diffDays < 0) {
    return {
      status: 'Expired',
      badgeText: 'Application Expired',
      colorClass: 'badge-danger',
      diffDays
    };
  } else if (diffDays === 0) {
    return {
      status: 'Closing Soon',
      badgeText: 'Closes Today!',
      colorClass: 'badge-danger pulse',
      diffDays: 0
    };
  } else if (diffDays === 1) {
    return {
      status: 'Closing Soon',
      badgeText: '1 day left',
      colorClass: 'badge-warning',
      diffDays: 1
    };
  } else if (diffDays <= 5) {
    return {
      status: 'Closing Soon',
      badgeText: `${diffDays} days left`,
      colorClass: 'badge-warning',
      diffDays
    };
  } else {
    return {
      status: 'Active',
      badgeText: `${diffDays} days left`,
      colorClass: 'badge-info',
      diffDays
    };
  }
}

// Compute Days Remaining or Deadline Badge
export function getDeadlineBadge(deadlineDateStr) {
  const result = getOpportunityDeadlineStatus(deadlineDateStr);
  return {
    text: result.badgeText,
    colorClass: result.colorClass,
    status: result.status,
    diffDays: result.diffDays
  };
}

// Quick search debounce helper
export function debounce(func, wait = 250) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
