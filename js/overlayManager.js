/**
 * CareerSphere - Centralized Overlay & Layout Manager (OverlayManager)
 * 
 * ARCHITECTURAL RESPONSIBILITY:
 * 1. Single source of truth for all full-screen overlays, modals, drawers,
 *    dropdowns, and temporary blocking elements.
 * 2. Guarantees that inactive overlays NEVER intercept pointer events or clicks.
 * 3. Enforces clean scroll locking (document.body.style.overflow) so the page
 *    can never remain permanently locked.
 * 4. Automatically dismisses all active overlays upon client-side route navigation.
 * 5. Provides universal Escape key handling and backdrop click dismissal.
 */

class OverlayManagerService {
  constructor() {
    this.overlays = new Map(); // id -> { id, element, type, isBlocking, onOpen, onClose }
    this.activeStack = [];     // Array of active overlay IDs in z-order
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Auto-discover existing static overlays from DOM
    this.discoverStaticOverlays();

    // Universal Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscape();
      }
    });

    // Global click listener for backdrop dismissals
    document.addEventListener('click', (e) => {
      this.handleGlobalBackdropClick(e);
    });

    // Ensure sanity on window resize or route transitions
    window.addEventListener('resize', () => this.sanitize());
    window.addEventListener('popstate', () => this.closeAll());
    window.addEventListener('hashchange', () => this.closeAll());

    // Expose globally for inline event handlers and debugging
    window.CareerSphereOverlayManager = this;
  }

  discoverStaticOverlays() {
    // 1. Global Details Modal
    const globalModal = document.getElementById('global-modal-overlay');
    if (globalModal) {
      this.register('global-modal', globalModal, { isBlocking: true });
    }

    // 2. Global Search Overlay
    const searchOverlay = document.getElementById('global-search-overlay');
    if (searchOverlay) {
      this.register('global-search', searchOverlay, { isBlocking: true });
    }

    // 3. Mobile Navigation Drawer & Backdrop
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileOverlay = document.getElementById('mobile-drawer-overlay');
    if (mobileDrawer || mobileOverlay) {
      this.register('mobile-menu', mobileDrawer, {
        isBlocking: true,
        backdrop: mobileOverlay
      });
    }

    // 4. Notification Bell Dropdown
    const notifDropdown = document.getElementById('notification-dropdown');
    if (notifDropdown) {
      this.register('notification-dropdown', notifDropdown, { isBlocking: false });
    }

    // 5. Scan any elements with data-overlay attribute
    document.querySelectorAll('[data-overlay]').forEach(el => {
      const id = el.id || el.dataset.overlay;
      if (id && !this.overlays.has(id)) {
        this.register(id, el, { isBlocking: el.classList.contains('modal-overlay') });
      }
    });
  }

  register(id, element, options = {}) {
    if (!id || !element) return;
    this.overlays.set(id, {
      id,
      element,
      type: options.type || 'overlay',
      isBlocking: options.isBlocking !== false,
      backdrop: options.backdrop || null,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null
    });

    // Enforce inactive state on registration
    if (!element.classList.contains('active')) {
      this.setInactiveVisualState(element);
      if (options.backdrop) {
        this.setInactiveVisualState(options.backdrop);
      }
    }
  }

  open(id, customOptions = {}) {
    const item = this.overlays.get(id);
    if (!item || !item.element) {
      // Attempt dynamic discovery
      const fallbackEl = document.getElementById(id);
      if (fallbackEl) {
        this.register(id, fallbackEl, customOptions);
        return this.open(id, customOptions);
      }
      return false;
    }

    // If already open, ignore
    if (this.activeStack.includes(id)) return true;

    // If opening a modal or search overlay, dismiss lower non-blocking overlays like dropdowns
    if (item.isBlocking) {
      this.close('notification-dropdown');
      this.close('mobile-menu');
    }

    // Activate primary element
    this.setActiveVisualState(item.element);

    // Activate paired backdrop if configured
    if (item.backdrop) {
      this.setActiveVisualState(item.backdrop);
    }

    this.activeStack.push(id);
    this.updateBodyScrollLock();

    if (typeof item.onOpen === 'function') {
      try { item.onOpen(); } catch (err) { console.warn(`[OverlayManager] onOpen error for ${id}:`, err); }
    }

    return true;
  }

  close(id) {
    const item = this.overlays.get(id);
    if (!item || !item.element) return false;

    // Deactivate primary element
    this.setInactiveVisualState(item.element);

    // Deactivate paired backdrop if configured
    if (item.backdrop) {
      this.setInactiveVisualState(item.backdrop);
    }

    // Remove from active stack
    this.activeStack = this.activeStack.filter(activeId => activeId !== id);
    this.updateBodyScrollLock();

    if (typeof item.onClose === 'function') {
      try { item.onClose(); } catch (err) { console.warn(`[OverlayManager] onClose error for ${id}:`, err); }
    }

    return true;
  }

  closeAll() {
    // Clone stack to avoid iteration mutation
    const ids = [...this.activeStack];
    ids.forEach(id => this.close(id));

    // Force deactivate any lingering overlays in DOM
    this.overlays.forEach(item => {
      this.setInactiveVisualState(item.element);
      if (item.backdrop) {
        this.setInactiveVisualState(item.backdrop);
      }
    });

    // Extra sweep: find any element with .modal-overlay, .mobile-drawer-overlay, or [data-overlay]
    document.querySelectorAll('.modal-overlay.active, .mobile-drawer-overlay.active, .mobile-nav-drawer.active, .notification-dropdown.active, [data-overlay].active').forEach(el => {
      this.setInactiveVisualState(el);
    });

    this.activeStack = [];
    this.unlockBodyScroll();
  }

  isOpen(id) {
    return this.activeStack.includes(id);
  }

  getActiveOverlays() {
    return [...this.activeStack];
  }

  handleEscape() {
    if (this.activeStack.length === 0) return;
    // Dismiss topmost active overlay
    const topmostId = this.activeStack[this.activeStack.length - 1];
    this.close(topmostId);
  }

  handleGlobalBackdropClick(e) {
    // Check if clicked directly on a registered backdrop/overlay container
    this.overlays.forEach(item => {
      if (item.element && e.target === item.element && item.isBlocking) {
        this.close(item.id);
      } else if (item.backdrop && e.target === item.backdrop) {
        this.close(item.id);
      }
    });

    // Close notification dropdown when clicking outside bell wrapper
    if (this.isOpen('notification-dropdown')) {
      const bellWrapper = document.getElementById('nav-bell-wrapper');
      if (bellWrapper && !bellWrapper.contains(e.target)) {
        this.close('notification-dropdown');
      }
    }
  }

  updateBodyScrollLock() {
    const hasBlockingOverlay = this.activeStack.some(id => {
      const item = this.overlays.get(id);
      return item && item.isBlocking;
    });

    if (hasBlockingOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      this.unlockBodyScroll();
    }
  }

  unlockBodyScroll() {
    document.body.style.overflow = '';
    // Clear inline overflow on html as well if set
    document.documentElement.style.overflow = '';
  }

  setActiveVisualState(el) {
    if (!el) return;
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    const isFlex = el.classList.contains('modal-overlay') || el.id === 'global-modal-overlay' || el.id === 'global-search-overlay';
    const displayVal = isFlex ? 'flex' : 'block';
    el.style.setProperty('display', displayVal, 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
  }

  setInactiveVisualState(el) {
    if (!el) return;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
  }

  sanitize() {
    // Clean up any stale active classes or scroll lock
    const activeBlocking = this.activeStack.filter(id => this.overlays.get(id)?.isBlocking);
    if (activeBlocking.length === 0) {
      this.unlockBodyScroll();
    }
    // Verify registered elements match their active stack state
    this.overlays.forEach(item => {
      const shouldBeActive = this.activeStack.includes(item.id);
      if (!shouldBeActive) {
        this.setInactiveVisualState(item.element);
        if (item.backdrop) this.setInactiveVisualState(item.backdrop);
      }
    });
  }
}

export const OverlayManager = new OverlayManagerService();
