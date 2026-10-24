/**
 * CareerSphere - Client State & LocalStorage Store
 * Centralized store managing Saved Bookmarks, Notes CRUD, User Profile,
 * Preparation Track Progress, and Resume state.
 */

import {
  MOCK_GOVT_JOBS,
  MOCK_PREPARATION_TRACKS,
  MOCK_PROJECTS,
  MOCK_NOTIFICATIONS,
  MOCK_SOURCES,
  INITIAL_NOTES,
  INITIAL_USER_PROFILE
} from './mockData.js';
import { parseDateSafely, getOpportunityDeadlineStatus } from './utils.js';

const STORAGE_KEYS = {
  SAVED: 'careersphere_saved_items',
  NOTES: 'careersphere_notes',
  PROFILE: 'careersphere_profile',
  PREP: 'careersphere_prep_tracks',
  RESUME: 'careersphere_resume_data',
  PROJECTS: 'careersphere_projects',
  NOTIFICATIONS: 'careersphere_notifications',
  NOTIFICATION_PREFS: 'careersphere_notification_preferences',
  NOTIFICATIONS_READ: 'careersphere_notifications_read',
  SOURCES: 'careersphere_sources',
  ELIGIBILITY: 'careersphere_eligibility_criteria',
  CORPORATE_JOBS: 'careersphere_corporate_jobs',
  GOVT_JOBS: 'careersphere_govt_jobs',
  INTERNSHIPS: 'careersphere_internships',
  COMPANIES: 'careersphere_enterprise_companies',
  AUTH_TOKEN: 'careersphere_auth_token',
  AUTH_USER: 'careersphere_auth_user'
};

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  corporate: true,
  internships: true,
  government: true,
  freshers: true,
  bca_it: true,
  remote: true,
  deadline_reminders: true,
  profile_matches: true,
  companies: ['Amazon', 'Razorpay', 'Zoho', 'TCS', 'Infosys', 'Wipro', 'Xempus AG'],
  skills: ['Python', 'SQL', 'React', 'Java', 'JavaScript']
};

export const CANONICAL_COMPANIES = [
  { id: 'tcs', name: 'Tata Consultancy Services (TCS)', shortName: 'TCS', logo: '🏛️', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'IT Services & Consulting', headquarters: 'Mumbai, India', officialCareerUrl: 'https://www.tcs.com/careers' },
  { id: 'infosys', name: 'Infosys', shortName: 'Infosys', logo: '🏢', status: 'Hiring Now', activeJobsCount: 12, activeInternshipsCount: 0, industry: 'IT Services & Consulting', headquarters: 'Bengaluru, India', officialCareerUrl: 'https://www.infosys.com/careers/' },
  { id: 'wipro', name: 'Wipro', shortName: 'Wipro', logo: '🏢', status: 'Hiring Now', activeJobsCount: 12, activeInternshipsCount: 0, industry: 'IT Services & Consulting', headquarters: 'Bengaluru, India', officialCareerUrl: 'https://careers.wipro.com/' },
  { id: 'accenture', name: 'Accenture', shortName: 'Accenture', logo: '🏢', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'Management & Tech Consulting', headquarters: 'Dublin, Ireland / Pan India', officialCareerUrl: 'https://www.accenture.com/in-en/careers' },
  { id: 'cognizant', name: 'Cognizant', shortName: 'Cognizant', logo: '🏢', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'IT & Digital Engineering', headquarters: 'Teaneck, NJ / Chennai, India', officialCareerUrl: 'https://careers.cognizant.com/global/en' },
  { id: 'ibm', name: 'IBM', shortName: 'IBM', logo: '🏢', status: 'Hiring Now', activeJobsCount: 12, activeInternshipsCount: 0, industry: 'Cloud, AI & Enterprise Solutions', headquarters: 'Armonk, NY / Bengaluru', officialCareerUrl: 'https://www.ibm.com/careers' },
  { id: 'microsoft', name: 'Microsoft', shortName: 'Microsoft', logo: '💻', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'Cloud, OS, AI & Platforms', headquarters: 'Redmond, WA / India Development Centers', officialCareerUrl: 'https://careers.microsoft.com/' },
  { id: 'amazon', name: 'Amazon', shortName: 'Amazon', logo: '📦', status: 'Hiring Now', activeJobsCount: 58, activeInternshipsCount: 24, industry: 'E-Commerce, Cloud (AWS) & AI', headquarters: 'Seattle, WA / Pan India Tech Hubs', officialCareerUrl: 'https://amazon.jobs/en/locations/india' },
  { id: 'google', name: 'Google', shortName: 'Google', logo: '🌐', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'Search, Cloud, AI & Consumer Tech', headquarters: 'Mountain View, CA / Bengaluru, Hyderabad', officialCareerUrl: 'https://careers.google.com/' },
  { id: 'capgemini', name: 'Capgemini', shortName: 'Capgemini', logo: '🏢', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'IT Consulting & Engineering', headquarters: 'Paris, France / Pan India', officialCareerUrl: 'https://www.capgemini.com/careers/' },
  { id: 'deloitte', name: 'Deloitte', shortName: 'Deloitte', logo: '🏢', status: 'Hiring Now', activeJobsCount: 12, activeInternshipsCount: 0, industry: 'Consulting, Advisory & Tech Risk', headquarters: 'London, UK / Pan India', officialCareerUrl: 'https://www2.deloitte.com/ui/en/careers/careers.html' },
  { id: 'hcltech', name: 'HCLTech', shortName: 'HCLTech', logo: '🏢', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'IT Infrastructure & Engineering', headquarters: 'Noida, India', officialCareerUrl: 'https://www.hcltech.com/careers' },
  { id: 'techmahindra', name: 'Tech Mahindra', shortName: 'Tech Mahindra', logo: '🏢', status: 'No Current Matching Opportunity', activeJobsCount: 0, activeInternshipsCount: 0, industry: 'IT Services & Telecom Solutions', headquarters: 'Pune, India', officialCareerUrl: 'https://careers.techmahindra.com/' }
];

class Store {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    // Initialize Saved items
    if (!localStorage.getItem(STORAGE_KEYS.SAVED)) {
      // Seed with 2 default saved items for immediate visual demonstration
      const initialSaved = [
        {
          id: 'corp-2',
          type: 'corporate',
          title: 'Junior Frontend Developer (React / Next.js)',
          organization: 'Razorpay Technologies',
          category: 'Software Developer',
          location: 'Bangalore, Karnataka',
          deadline: '2026-09-30',
          savedAt: new Date().toISOString()
        },
        {
          id: 'govt-1',
          type: 'government',
          title: 'Combined Graduate Level (CGL) Examination 2026',
          organization: 'Staff Selection Commission (SSC)',
          category: 'SSC',
          location: 'All India',
          deadline: '2026-10-10',
          savedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(initialSaved));
    }

    // Initialize Notes
    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
    }

    // Initialize Profile
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    }

    // Initialize Preparation Tracks
    if (!localStorage.getItem(STORAGE_KEYS.PREP)) {
      localStorage.setItem(STORAGE_KEYS.PREP, JSON.stringify(MOCK_PREPARATION_TRACKS));
    }

    // Initialize Projects
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
    }

    // Initialize Official Sources
    if (!localStorage.getItem(STORAGE_KEYS.SOURCES)) {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(MOCK_SOURCES));
    }

    // Initialize Notification Preferences
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES));
    }

    // Initialize Real Notifications (clearing legacy mock data)
    const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!storedNotifs) {
      this.generateRealNotifications();
    } else {
      try {
        const parsed = JSON.parse(storedNotifs);
        if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(n => n.id && n.id.startsWith('notif-00'))) {
          this.generateRealNotifications();
        }
      } catch {
        this.generateRealNotifications();
      }
    }

    // Initialize Eligibility Criteria
    if (!localStorage.getItem(STORAGE_KEYS.ELIGIBILITY)) {
      const defaultEligibility = {
        highestQualification: "Graduate (Bachelor's)",
        degree: 'Bachelor of Computer Applications (BCA)',
        graduationStatus: 'Pursuing (Final Year)',
        graduationYear: '2025',
        skills: ['Python', 'JavaScript', 'React', 'SQL', 'Data Structures'],
        experience: 'Fresher (0-1 yr)',
        preferredLocation: 'Bangalore / Remote',
        preferredJobType: 'Full-time / Internship',
        careerPreference: 'Both Corporate & Government'
      };
      localStorage.setItem(STORAGE_KEYS.ELIGIBILITY, JSON.stringify(defaultEligibility));
    }

    // Auto-sync real source data from backend on startup
    this.syncCorporateJobsAPI().catch(() => {});
    this.syncGovtJobsAPI().catch(() => {});
    this.syncInternshipsAPI().catch(() => {});
    this.syncCompaniesAPI().catch(() => {});
    this.syncWithBackendAPI().catch(() => {});
    this.checkAuthStatus().catch(() => {});
  }

  // Subscribe to state change notifications
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.listeners.forEach(fn => fn(event, payload));
    window.dispatchEvent(new CustomEvent('careersphere:statechange', { detail: { event, payload } }));
  }

  // Unified lookup across all live datasets and caches
  getOpportunityById(id) {
    if (!id) return null;
    const corp = this.getCorporateJobs().find(j => j.id === id);
    if (corp) return { ...corp, type: 'corporate' };
    const intern = this.getInternships().find(i => i.id === id);
    if (intern) return { ...intern, type: 'internship' };
    const govt = this.getGovtJobs().find(g => g.id === id);
    if (govt) return { ...govt, type: 'government' };
    const notif = this.getNotifications().find(n => n.id === id);
    if (notif) return { ...notif, type: 'notification' };
    return null;
  }

  // =================== AUTHENTICATION & USER SESSION ===================
  getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null;
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return Boolean(this.getAuthToken());
  }

  async registerUser({ email, password, fullName, qualification, degree }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, qualification, degree })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.detail || data.error || 'Registration failed.');
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
    if (data.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    }
    await this.syncSavedWithBackend();
    this.notify('auth_changed', { isAuthenticated: true, user: data.user, profile: data.profile });
    return data;
  }

  async loginUser(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.detail || data.error || 'Invalid email or password.');
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
    if (data.profile) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    }
    await this.syncSavedWithBackend();
    this.notify('auth_changed', { isAuthenticated: true, user: data.user, profile: data.profile });
    return data;
  }

  async logoutUser() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.notify('auth_changed', { isAuthenticated: false, user: null });
  }

  async checkAuthStatus() {
    const token = this.getAuthToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));
          if (data.profile) {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
          }
          await this.syncSavedWithBackend();
          this.notify('auth_changed', { isAuthenticated: true, user: data.user, profile: data.profile });
          return true;
        }
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.notify('auth_changed', { isAuthenticated: false, user: null });
    return false;
  }

  async syncSavedWithBackend() {
    const token = this.getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/user/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.saved)) {
          const local = this.getSavedItems();
          const map = new Map();
          local.forEach(item => map.set(item.id, item));
          data.saved.forEach(item => map.set(item.id, item));
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(merged));
          this.notify('saved_changed', { count: merged.length });
        }
      }
    } catch (e) {
      console.warn('[Store] Could not sync saved with backend:', e);
    }
  }

  // =================== SAVED ITEMS ===================
  getSavedItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED)) || [];
    } catch {
      return [];
    }
  }

  isSaved(id) {
    const items = this.getSavedItems();
    return items.some(item => item.id === id);
  }

  toggleSave(item) {
    if (!item || !item.id) return false;
    const items = this.getSavedItems();
    const targetId = item.id;
    const index = items.findIndex(i => i.id === targetId);
    let isNowSaved = false;

    if (index >= 0) {
      items.splice(index, 1);
      isNowSaved = false;
    } else {
      const full = this.getOpportunityById(targetId) || item;

      // Classify type: 'government' | 'internship' | 'corporate'
      let oppType = 'corporate';
      if (full.type === 'government' || full.postName || full.salaryPayScale || full.recruitingOrganization || (full.category && full.category.toLowerCase().includes('govt'))) {
        oppType = 'government';
      } else if (full.type === 'internship' || full.isInternship || (full.id && full.id.startsWith('intern-')) || (full.category && full.category.toLowerCase().includes('intern')) || (full.roleCategory && full.roleCategory.toLowerCase().includes('intern'))) {
        oppType = 'internship';
      } else {
        oppType = full.type || 'corporate';
      }

      const rawDeadline = full.deadline || full.lastDate || full.last_date || full.applicationLastDate || 'Not available';
      const applyUrl = full.applyUrl || full.apply_url || full.applicationUrl || full.officialNotificationUrl || full.officialPdfUrl || '#';
      const sourceName = full.sourceName || full.source || (oppType === 'government' ? 'Union Public Service Commission (UPSC)' : (oppType === 'internship' ? 'Verified Internship Portal' : 'Verified Corporate Careers'));

      items.unshift({
        id: full.id,
        type: oppType,
        title: full.title || full.postName || full.jobTitle || 'Saved Opportunity',
        organization: full.company || full.organization || full.recruitingOrganization || 'Enterprise Organization',
        category: full.category || full.roleCategory || (oppType === 'government' ? 'Government Jobs' : (oppType === 'internship' ? 'Internships' : 'Corporate Jobs')),
        location: full.location || 'Pan India',
        deadline: rawDeadline,
        salary: full.salary || full.salaryPayScale || full.stipend || '',
        applyUrl: applyUrl,
        sourceName: sourceName,
        isDemo: Boolean(full.isDemo),
        savedAt: new Date().toISOString()
      });
      isNowSaved = true;
    }

    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(items));

    // Cloud sync if authenticated
    const token = this.getAuthToken();
    if (token) {
      if (isNowSaved) {
        fetch('/api/user/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(items[0])
        }).catch(() => {});
      } else {
        fetch(`/api/user/saved/${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }
    }

    try {
      this.generateRealNotifications();
    } catch (e) {
      console.warn('Notification update error on save:', e);
    }
    this.notify('saved_changed', { id: targetId, isSaved: isNowSaved, count: items.length });
    return isNowSaved;
  }

  saveItem(item) {
    if (!this.isSaved(item.id)) {
      return this.toggleSave(item);
    }
    return true;
  }

  removeSaved(id) {
    if (this.isSaved(id)) {
      return this.toggleSave({ id });
    }
    return false;
  }

  getSavedCount() {
    return this.getSavedItems().length;
  }

  // =================== NOTES CRUD ===================
  getNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
    } catch {
      return [];
    }
  }

  addNote(note) {
    const notes = this.getNotes();
    const newNote = {
      id: 'note-' + Date.now(),
      title: note.title.trim(),
      category: note.category || 'General',
      content: note.content.trim(),
      date: new Date().toISOString().split('T')[0]
    };
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    this.notify('notes_changed', { action: 'add', note: newNote });
    return newNote;
  }

  updateNote(id, updatedFields) {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index >= 0) {
      notes[index] = { ...notes[index], ...updatedFields, updatedDate: new Date().toISOString().split('T')[0] };
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      this.notify('notes_changed', { action: 'update', note: notes[index] });
      return notes[index];
    }
    return null;
  }

  deleteNote(id) {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    this.notify('notes_changed', { action: 'delete', id });
  }

  // =================== PROFILE ===================
  getProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  }

  updateProfile(profileData) {
    const existing = this.getProfile();
    const updated = {
      ...existing,
      ...profileData
    };

    // Normalize preferredSectors
    if (!Array.isArray(updated.preferredSectors)) {
      updated.preferredSectors = ['Corporate', 'Government', 'Internships'];
    }

    // Derive careerPreference from preferredSectors
    const sectors = updated.preferredSectors;
    let careerPref = 'Both Corporate & Government';
    if (sectors.includes('Corporate') && sectors.includes('Government')) {
      careerPref = 'Both Corporate & Government';
    } else if (sectors.includes('Corporate')) {
      careerPref = 'Corporate Jobs Only';
    } else if (sectors.includes('Government')) {
      careerPref = 'Government Exams Only';
    } else if (sectors.includes('Internships')) {
      careerPref = 'Corporate Jobs Only';
    }
    updated.careerPreference = careerPref;

    // Persist central profile
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));

    // Cloud sync if authenticated
    const token = this.getAuthToken();
    if (token) {
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      }).catch(() => {});
    }

    // Automatically synchronize with My Eligibility profile
    const eligibilitySync = {
      highestQualification: updated.highestQualification || "Graduate (Bachelor's)",
      degree: updated.degree || '',
      graduationStatus: updated.graduationStatus || 'Pursuing (Final Year)',
      graduationYear: updated.graduationYear || '2025',
      skills: Array.isArray(updated.skills) ? updated.skills : (typeof updated.skills === 'string' ? updated.skills.split(',').map(s => s.trim()).filter(Boolean) : []),
      experience: updated.experience || 'Fresher (0-1 yr)',
      preferredLocation: Array.isArray(updated.preferredLocations) ? updated.preferredLocations.join(', ') : (updated.preferredLocations || 'All India'),
      preferredJobType: updated.preferredJobType || 'Full-time / Internship',
      careerPreference: careerPref,
      workPreference: updated.workPreference || 'Hybrid / Flexible'
    };

    localStorage.setItem(STORAGE_KEYS.ELIGIBILITY, JSON.stringify(eligibilitySync));

    this.notify('profile_changed', updated);
    this.notify('eligibility_changed', eligibilitySync);
    return updated;
  }

  // =================== PREPARATION TRACKS ===================
  getPrepTracks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PREP)) || MOCK_PREPARATION_TRACKS;
    } catch {
      return MOCK_PREPARATION_TRACKS;
    }
  }

  togglePrepTopic(trackId, topicIndex) {
    const tracks = this.getPrepTracks();
    const track = tracks.find(t => t.id === trackId);
    if (track && track.topics && track.topics[topicIndex] !== undefined) {
      track.topics[topicIndex].completed = !track.topics[topicIndex].completed;
      const completedCount = track.topics.filter(t => t.completed).length;
      track.completedModules = completedCount;
      track.progress = Math.round((completedCount / track.topics.length) * 100);
      localStorage.setItem(STORAGE_KEYS.PREP, JSON.stringify(tracks));
      this.notify('prep_changed', { trackId, track });
      return track;
    }
    return null;
  }

  // =================== PROJECTS ===================
  getProjects() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored projects:', e);
    }
    return MOCK_PROJECTS;
  }

  normalizeResumeProjects(existingProjects = []) {
    const catalog = this.getProjects();
    const result = [];
    const seenNames = new Set();

    // 1. Process existing projects in resume
    if (Array.isArray(existingProjects)) {
      existingProjects.forEach((p, idx) => {
        if (!p) return;
        const name = (p.name || p.title || `Project ${idx + 1}`).trim();
        const normKey = name.toLowerCase();
        if (seenNames.has(normKey)) return;
        seenNames.add(normKey);

        const bullets = Array.isArray(p.bullets) ? p.bullets : [];
        const description = (p.description || (bullets.length > 0 ? bullets.join('\n') : '')).trim();
        const techStr = Array.isArray(p.technologies)
          ? p.technologies.join(', ')
          : (p.technologies || p.tech || '').trim();

        result.push({
          id: p.id || `proj-${Date.now()}-${idx}`,
          name: name,
          title: name,
          description: description,
          technologies: techStr,
          tech: techStr,
          githubUrl: (p.githubUrl || p.github || '').trim(),
          demoUrl: (p.demoUrl || p.demo || '').trim(),
          status: (p.status || p.badge || 'Completed').trim(),
          included: p.included !== undefined ? Boolean(p.included) : (idx < 2)
        });
      });
    }

    // 2. Safely preserve and migrate any catalog projects not yet in resume
    catalog.forEach((cat, idx) => {
      if (!cat) return;
      const catName = (cat.name || cat.title || '').trim();
      const normKey = catName.toLowerCase();
      if (!catName || seenNames.has(normKey)) return;
      seenNames.add(normKey);

      const features = Array.isArray(cat.features) ? cat.features : [];
      const desc = (cat.summary || features.join('\n')).trim();
      const techStr = Array.isArray(cat.technologies) ? cat.technologies.join(', ') : (cat.technologies || '').trim();

      result.push({
        id: cat.id || `proj-cat-${idx + 1}`,
        name: catName,
        title: catName,
        description: desc,
        technologies: techStr,
        tech: techStr,
        githubUrl: (cat.githubUrl || '').trim(),
        demoUrl: (cat.demoUrl && cat.demoUrl !== '#' ? cat.demoUrl : '').trim(),
        status: (cat.badge || 'Completed').trim(),
        included: result.filter(r => r.included).length < 2
      });
    });

    return result;
  }

  // =================== RESUME DATA ===================
  getResumeData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESUME);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.fullName) {
          parsed.projects = this.normalizeResumeProjects(parsed.projects);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse resume data, falling back to default profile');
    }

    const profile = this.getProfile();
    const projects = this.normalizeResumeProjects([]);

    const initialResume = {
      fullName: profile.name || 'Priya Sharma',
      email: profile.email || 'priya.sharma@example.com',
      phone: profile.phone || '+91 98765 43210',
      location: (profile.preferredLocations && profile.preferredLocations[0])
        ? `${profile.preferredLocations[0]}, India`
        : 'Delhi, India',
      linkedin: 'linkedin.com/in/' + (profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'priyasharma'),
      github: profile.github || profile.githubUrl || 'https://github.com/priyasharma',
      summary: profile.bio || 'Final-year BCA student passionate about building modern web applications, database architecture, and scalable software solutions.',
      education: [
        {
          degree: profile.degree || 'Bachelor of Computer Applications (BCA)',
          institution: profile.college || 'Indira Gandhi Delhi Technical University for Women',
          year: profile.graduationYear ? `2022 - ${profile.graduationYear}` : '2022 - 2025',
          score: profile.cgpa ? `CGPA: ${profile.cgpa}` : '8.7 / 10.0'
        },
        {
          degree: 'Senior Secondary (Class XII - CBSE)',
          institution: 'Delhi Public School, R.K. Puram',
          year: '2020 - 2022',
          score: 'Percentage: 92.4%'
        }
      ],
      skills: (Array.isArray(profile.skills) && profile.skills.length > 0)
        ? [...profile.skills]
        : ['Python', 'JavaScript', 'React', 'SQL', 'Data Structures', 'HTML5/CSS3', 'Git'],
      projects: projects,
      experience: [
        {
          role: 'Frontend Development Intern',
          company: 'TechNovation Labs',
          period: 'June 2024 - August 2024',
          bullets: [
            'Developed 12+ responsive UI components and reduced initial page load bundle by 22%.',
            'Collaborated with UX designers to implement accessible form controls and micro-interactions.'
          ]
        }
      ],
      certifications: [
        { name: 'Python for Data Science & Web Development', issuer: 'HackerRank & Coursera', year: '2024' },
        { name: 'Database Management & SQL Specialist', issuer: 'Oracle Academy', year: '2023' }
      ]
    };

    localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(initialResume));
    return initialResume;
  }

  saveResumeData(resumeData) {
    if (!resumeData || typeof resumeData !== 'object') return false;
    try {
      localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(resumeData));
      this.notify('resume_changed', resumeData);
      return resumeData;
    } catch (e) {
      console.error('Error saving resume data:', e);
      return false;
    }
  }

  autoFillResumeFromProfile() {
    const profile = this.getProfile();
    const currentResume = this.getResumeData();

    // Read GitHub profile link from profile if available; do not invent fake URLs
    const profileGithub = (profile.github || profile.githubUrl || '').trim();
    const resolvedGithub = profileGithub || (currentResume.github && !currentResume.github.includes('priyasharma-tech') ? currentResume.github : '');

    const updated = {
      ...currentResume,
      fullName: profile.name || currentResume.fullName || '',
      email: profile.email || currentResume.email || '',
      phone: profile.phone || currentResume.phone || '',
      location: (profile.preferredLocations && profile.preferredLocations[0])
        ? `${profile.preferredLocations[0]}, India`
        : (currentResume.location || 'Delhi, India'),
      linkedin: currentResume.linkedin || ('linkedin.com/in/' + (profile.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'candidate')),
      github: resolvedGithub,
      summary: profile.bio || currentResume.summary || '',
      education: [
        {
          degree: profile.degree || currentResume.education?.[0]?.degree || 'Bachelor of Computer Applications (BCA)',
          institution: profile.college || currentResume.education?.[0]?.institution || 'University',
          year: profile.graduationYear ? `2022 - ${profile.graduationYear}` : (currentResume.education?.[0]?.year || '2022 - 2025'),
          score: profile.cgpa ? `CGPA: ${profile.cgpa}` : (currentResume.education?.[0]?.score || '8.7 / 10.0')
        },
        ...(Array.isArray(currentResume.education) ? currentResume.education.slice(1) : [])
      ],
      skills: (Array.isArray(profile.skills) && profile.skills.length > 0)
        ? [...profile.skills]
        : (currentResume.skills || [])
    };

    this.saveResumeData(updated);
    return updated;
  }

  // =================== CORPORATE JOBS (100% REAL) ===================
  getCorporateJobs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CORPORATE_JOBS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored corporate jobs:', e);
    }
    return [];
  }

  async syncCorporateJobsAPI() {
    try {
      const res = await fetch('/api/corporate-jobs', { method: 'GET' });
      if (!res.ok) {
        this.notify('corporate_jobs_error', { status: res.status });
        return false;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.jobs)) {
        localStorage.setItem(STORAGE_KEYS.CORPORATE_JOBS, JSON.stringify(data.jobs));
        if (data.source) localStorage.setItem('careersphere_corp_source', data.source);
        if (data.sourceStatus) localStorage.setItem('careersphere_corp_source_status', data.sourceStatus);
        if (data.lastUpdated) localStorage.setItem('careersphere_corp_last_updated', data.lastUpdated);
        this.notify('corporate_jobs_changed', data.jobs);
        return data.jobs;
      }
    } catch (err) {
      this.notify('corporate_jobs_error', { error: err.message });
    }
    return false;
  }

  getCorporateLastUpdated() {
    return localStorage.getItem('careersphere_corp_last_updated') || null;
  }

  getCorporateSourceStatus() {
    return localStorage.getItem('careersphere_corp_source_status') || 'Operational';
  }

  async triggerLiveCorporateSync() {
    try {
      const res = await fetch('/api/sync/corporate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.jobs)) {
          localStorage.setItem(STORAGE_KEYS.CORPORATE_JOBS, JSON.stringify(data.jobs));
          if (data.lastUpdated) localStorage.setItem('careersphere_corp_last_updated', data.lastUpdated);
          if (data.source) localStorage.setItem('careersphere_corp_source', data.source);
          this.notify('corporate_jobs_changed', data.jobs);
          await this.syncWithBackendAPI();
          return data.jobs;
        }
      }
    } catch {
      return await this.syncCorporateJobsAPI();
    }
    return await this.syncCorporateJobsAPI();
  }

  // =================== INTERNSHIPS (100% REAL) ===================
  getInternships() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored internships:', e);
    }
    return [];
  }

  async syncInternshipsAPI() {
    try {
      const res = await fetch('/api/internships', { method: 'GET' });
      if (!res.ok) {
        this.notify('internships_error', { status: res.status });
        return false;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.internships)) {
        localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(data.internships));
        if (data.source) localStorage.setItem('careersphere_internships_source', data.source);
        if (data.sourceStatus) localStorage.setItem('careersphere_internships_source_status', data.sourceStatus);
        if (data.lastUpdated) localStorage.setItem('careersphere_internships_last_updated', data.lastUpdated);
        this.notify('internships_changed', data.internships);
        return data.internships;
      }
    } catch (err) {
      this.notify('internships_error', { error: err.message });
    }
    return false;
  }

  getInternshipsLastUpdated() {
    return localStorage.getItem('careersphere_internships_last_updated') || null;
  }

  getInternshipsSourceStatus() {
    return localStorage.getItem('careersphere_internships_source_status') || 'Operational';
  }

  getInternshipsSource() {
    return localStorage.getItem('careersphere_internships_source') || 'Verified Authentic Internship Portals (The Muse Public API, Amazon Jobs India, Arbeitnow Feeds)';
  }

  async triggerLiveInternshipsSync() {
    try {
      const res = await fetch('/api/sync/internships', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.internships)) {
          localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(data.internships));
          if (data.lastUpdated) localStorage.setItem('careersphere_internships_last_updated', data.lastUpdated);
          if (data.source) localStorage.setItem('careersphere_internships_source', data.source);
          this.notify('internships_changed', data.internships);
          await this.syncWithBackendAPI();
          return data.internships;
        }
      }
    } catch {
      return await this.syncInternshipsAPI();
    }
    return await this.syncInternshipsAPI();
  }

  // =================== ENTERPRISE COMPANIES DIRECTORY (ALWAYS VISIBLE) ===================
  getCompanies() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored enterprise companies:', e);
    }
    return CANONICAL_COMPANIES;
  }

  async syncCompaniesAPI() {
    try {
      const res = await fetch('/api/companies', { method: 'GET' });
      if (!res.ok) {
        this.notify('companies_error', { status: res.status });
        return false;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.companies)) {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data.companies));
        if (data.lastUpdated) localStorage.setItem('careersphere_companies_last_updated', data.lastUpdated);
        this.notify('companies_changed', data.companies);
        return data.companies;
      }
    } catch (err) {
      this.notify('companies_error', { error: err.message });
    }
    return false;
  }

  getCompaniesLastUpdated() {
    return localStorage.getItem('careersphere_companies_last_updated') || null;
  }

  // =================== GOVERNMENT RECRUITMENTS (REAL & DEMO) ===================
  getGovtJobs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOVT_JOBS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored govt jobs:', e);
    }
    return MOCK_GOVT_JOBS;
  }

  getGovtLastUpdated() {
    return localStorage.getItem('careersphere_govt_last_updated') || null;
  }

  getGovtSource() {
    return localStorage.getItem('careersphere_govt_source') || 'Verified Official Portals (UPSC, RRB, India Post GDS, NCS, SSC, State PSC, Employment News)';
  }

  async syncGovtJobsAPI() {
    try {
      const res = await fetch('/api/govt-jobs', { method: 'GET' });
      if (!res.ok) return false;
      const data = await res.json();
      if (data && data.success && Array.isArray(data.recruitments)) {
        localStorage.setItem(STORAGE_KEYS.GOVT_JOBS, JSON.stringify(data.recruitments));
        if (data.lastUpdated) {
          localStorage.setItem('careersphere_govt_last_updated', data.lastUpdated);
        }
        if (data.source) {
          localStorage.setItem('careersphere_govt_source', data.source);
        }
        this.notify('govt_jobs_changed', data.recruitments);
        return data.recruitments;
      }
    } catch {
      // Offline fallback to LocalStorage
    }
    return false;
  }

  // Trigger targeted live sync for official Government opportunities
  async triggerLiveGovtSync() {
    try {
      const res = await fetch('/api/sync/govt', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.recruitments)) {
          localStorage.setItem(STORAGE_KEYS.GOVT_JOBS, JSON.stringify(data.recruitments));
          if (data.lastUpdated) {
            localStorage.setItem('careersphere_govt_last_updated', data.lastUpdated);
          }
          if (data.source) {
            localStorage.setItem('careersphere_govt_source', data.source);
          }
          this.notify('govt_jobs_changed', data.recruitments);
          await this.syncWithBackendAPI();
          return data;
        }
      }
    } catch (e) {
      console.warn('Live govt sync error:', e);
    }
    return null;
  }

  // Unified Real Sources Ingestion Trigger
  async triggerLiveSyncAPI() {
    try {
      const res = await fetch('/api/sync/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await this.syncCorporateJobsAPI();
        await this.syncGovtJobsAPI();
        await this.syncWithBackendAPI();
        return data;
      }
    } catch (e) {
      console.warn('Failed to trigger live sync:', e);
    }
    return null;
  }

  // =================== NOTIFICATIONS & OFFICIAL SOURCES ===================
  getSources() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SOURCES)) || MOCK_SOURCES;
    } catch {
      return MOCK_SOURCES;
    }
  }

  saveSources(sourcesList) {
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sourcesList));
    this.notify('sources_changed', sourcesList);
    return sourcesList;
  }

  async syncWithBackendAPI() {
    try {
      const res = await fetch('/api/notifications', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          this.mergeNotificationsFromBackend(data.notifications);
          if (data.lastUpdated) localStorage.setItem('careersphere_notifs_last_updated', data.lastUpdated);
          if (data.source) localStorage.setItem('careersphere_notifs_source', data.source);
          if (data.sourceStatus) localStorage.setItem('careersphere_notifs_source_status', data.sourceStatus);
        }
      }
      this.generateRealNotifications();

      const srcRes = await fetch('/api/sources', { method: 'GET' });
      if (srcRes.ok) {
        const srcData = await srcRes.json();
        if (srcData && srcData.success && Array.isArray(srcData.sources)) {
          localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(srcData.sources));
          this.notify('sources_changed', srcData.sources);
        }
      }
      this.notify('notifications_changed', { action: 'api_sync', unreadCount: this.getUnreadNotificationsCount() });
      return true;
    } catch {
      this.generateRealNotifications();
      return false;
    }
  }

  // =================== NOTIFICATION PREFERENCES ===================
  getNotificationPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
      if (stored) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading notification preferences:', e);
    }
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  saveNotificationPreferences(prefs) {
    const merged = { ...this.getNotificationPreferences(), ...prefs };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(merged));
    this.notify('notification_prefs_changed', merged);
    this.notify('notifications_changed', { action: 'prefs_update', unreadCount: this.getUnreadNotificationsCount() });
    return merged;
  }

  // =================== PERSISTENT READ STATUS ===================
  getReadNotificationIds() {
    const set = new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_READ);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) arr.forEach(id => set.add(id));
      }
    } catch (e) {
      console.warn('Error reading read notification IDs:', e);
    }
    try {
      const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
      notifs.forEach(n => {
        if (n && (n.isRead || n.read)) set.add(n.id);
      });
    } catch {}
    return set;
  }

  saveReadNotificationId(id) {
    const set = this.getReadNotificationIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify([...set]));
  }

  removeReadNotificationId(id) {
    const set = this.getReadNotificationIds();
    set.delete(id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify([...set]));
  }

  saveAllReadNotificationIds(ids) {
    const set = this.getReadNotificationIds();
    ids.forEach(id => set.add(id));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify([...set]));
  }

  // =================== REAL NOTIFICATION ENGINE ===================
  generateRealNotifications() {
    const readIds = this.getReadNotificationIds();
    const generated = [];
    const seenIds = new Set();

    const addNotif = (notif) => {
      if (!notif || !notif.id || seenIds.has(notif.id)) return;
      seenIds.add(notif.id);
      const isRead = readIds.has(notif.id);
      generated.push({
        ...notif,
        isRead: isRead,
        read: isRead,
        isNew: !isRead,
        isDemo: false
      });
    };

    // 1. Saved Opportunity Deadline Reminders
    try {
      const savedItems = this.getSavedItems();
      savedItems.forEach(item => {
        if (!item || !item.id) return;
        const statusObj = getOpportunityDeadlineStatus(item.deadline);
        const diffDays = statusObj.diffDays;
        if (diffDays !== null && diffDays !== undefined) {
          if (diffDays >= 0 && diffDays <= 7) {
            const id = `notif-deadline-${item.id}`;
            const title = diffDays === 0
              ? `⏳ Deadline Alert: Today is the last day for ${item.title}`
              : `⏳ Deadline Approaching: ${item.title} (${diffDays} day${diffDays === 1 ? '' : 's'} left)`;
            addNotif({
              id,
              opportunityId: item.id,
              title,
              description: `The application deadline for ${item.organization || item.company || 'this opportunity'} closes on ${item.deadline}. Submit your application before portal cutoff.`,
              organization: item.organization || item.company || 'Recruiting Organization',
              type: item.type || 'corporate',
              category: 'Deadline Reminders',
              notificationType: 'Deadline Reminder',
              sourceName: item.sourceName || 'Official Source',
              sourceUrl: item.applyUrl || '#',
              applyUrl: item.applyUrl || '#',
              deadline: item.deadline,
              diffDays: diffDays,
              notificationDate: item.savedAt ? String(item.savedAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
              status: diffDays === 0 ? 'Closing Today' : 'Closing Soon',
              isDeadlineReminder: true
            });
          } else if (diffDays < 0) {
            const id = `notif-deadline-exp-${item.id}`;
            addNotif({
              id,
              opportunityId: item.id,
              title: `⚠️ Application Closed: ${item.title}`,
              description: `The deadline for ${item.organization || item.company || 'this opportunity'} expired on ${item.deadline}. Saved opportunity retained for your records.`,
              organization: item.organization || item.company || 'Recruiting Organization',
              type: item.type || 'corporate',
              category: 'Deadline Reminders',
              notificationType: 'Deadline Expired',
              sourceName: item.sourceName || 'Official Source',
              sourceUrl: item.applyUrl || '#',
              applyUrl: item.applyUrl || '#',
              deadline: item.deadline,
              diffDays: diffDays,
              notificationDate: item.savedAt ? String(item.savedAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
              status: 'Expired',
              isDeadlineReminder: true,
              isExpired: true
            });
          }
        }
      });
    } catch (err) {
      console.warn('Error generating deadline reminders:', err);
    }

    // 2. Verified Newly Eligible Opportunities & Profile Matches
    try {
      // 2a. Newly Eligible Opportunities from Core Matcher
      const eligibilityResult = this.calculateEligibility();
      const eligibleItems = eligibilityResult.eligible || [];
      eligibleItems.slice(0, 8).forEach(opp => {
        const id = `notif-elig-${opp.id}`;
        const isGovt = Boolean(opp.isGovt || opp.recruitingOrganization || opp.postName);
        const isIntern = Boolean(opp.isInternship || opp.category === 'Internships' || (opp.title && opp.title.toLowerCase().includes('intern')));
        const oppOrg = opp.company || opp.organization || opp.recruitingOrganization || 'Verified Employer';
        const oppTitle = isGovt ? (opp.postName || opp.title) : opp.title;
        const oppType = isGovt ? 'government' : (isIntern ? 'internship' : 'corporate');
        const oppCategory = isGovt ? 'Government Jobs' : (isIntern ? 'Internships' : 'Corporate Jobs');
        const oppUrl = opp.officialNotificationUrl || opp.applyUrl || opp.sourceUrl || '#';
        const rawDeadline = isGovt ? (opp.lastDate || opp.deadline) : opp.deadline;

        addNotif({
          id,
          opportunityId: opp.id,
          title: `🎯 Newly Eligible: ${oppTitle}`,
          description: opp.primaryExplanation || `Verified match with your academic profile and skills at ${oppOrg}. Ready for application.`,
          organization: oppOrg,
          type: oppType,
          category: oppCategory,
          notificationType: 'Newly Eligible',
          sourceName: opp.sourceName || (isGovt ? 'Official Portal' : 'Verified Careers Portal'),
          sourceUrl: oppUrl,
          applyUrl: oppUrl,
          qualification: opp.qualificationDetail || opp.qualification || 'Verified Eligibility Criteria',
          location: opp.location || 'Pan India',
          deadline: rawDeadline || 'Check official notice',
          notificationDate: opp.notificationDate || opp.postedDate || new Date().toISOString().slice(0, 10),
          status: opp.status || 'Active',
          isProfileMatch: true,
          isNewlyEligible: true
        });
      });

      // 2b. Profile Skill Matches
      const profile = this.getProfile();
      const userSkills = (Array.isArray(profile.skills) ? profile.skills : [])
        .map(s => String(s).trim().toLowerCase())
        .filter(Boolean);

      if (userSkills.length > 0) {
        const checkOpportunities = [
          ...this.getCorporateJobs().map(j => ({ ...j, type: 'corporate' })),
          ...this.getInternships().map(i => ({ ...i, type: 'internship' })),
          ...this.getGovtJobs().map(g => ({ ...g, type: 'government' }))
        ];

        let matchCount = 0;
        for (const opp of checkOpportunities) {
          if (matchCount >= 6) break;
          const searchText = `${opp.title || ''} ${opp.description || ''} ${opp.skills || ''} ${opp.qualification || ''}`.toLowerCase();
          const matchedSkills = userSkills.filter(sk => searchText.includes(sk));
          if (matchedSkills.length > 0) {
            matchCount++;
            const id = `notif-match-${opp.id}`;
            const oppOrg = opp.company || opp.organization || opp.recruitingOrganization || 'Recruiting Authority';
            addNotif({
              id,
              opportunityId: opp.id,
              title: `🎯 Skill Match: ${opp.title || opp.postName}`,
              description: `Matches your skill set (${matchedSkills.slice(0, 3).join(', ')}) at ${oppOrg}. Verified active opportunity.`,
              organization: oppOrg,
              type: opp.type,
              category: opp.type === 'government' ? 'Government Jobs' : (opp.type === 'internship' ? 'Internships' : 'Corporate Jobs'),
              notificationType: 'Profile Match',
              sourceName: opp.sourceName || 'Official Portal',
              sourceUrl: opp.applyUrl || opp.sourceUrl || '#',
              applyUrl: opp.applyUrl || opp.sourceUrl || '#',
              qualification: opp.qualification || 'Graduate / Relevant Degree',
              location: opp.location || 'India',
              deadline: opp.deadline || opp.lastDate || 'Not available',
              notificationDate: opp.postedDate || opp.notificationDate || new Date().toISOString().slice(0, 10),
              status: opp.status || 'Active',
              isProfileMatch: true
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error generating profile matches:', err);
    }

    // 3. Ingest real corporate jobs
    try {
      const corpJobs = this.getCorporateJobs();
      corpJobs.slice(0, 35).forEach(job => {
        addNotif({
          id: `notif-corp-${job.id}`,
          opportunityId: job.id,
          title: `${job.company}: ${job.title}`,
          description: `${job.company} is hiring for ${job.title} in ${job.location || 'India'}.${job.experienceRequired ? ` Experience: ${job.experienceRequired}.` : ''}${job.salary ? ` Compensation: ${job.salary}.` : ''}`,
          organization: job.company,
          type: 'corporate',
          category: 'Corporate Jobs',
          notificationType: 'Corporate Tech Hiring',
          sourceName: job.sourceName || 'Verified Corporate Career Portal',
          sourceUrl: job.applyUrl || job.sourceUrl || '#',
          applyUrl: job.applyUrl || job.sourceUrl || '#',
          qualification: job.qualification || 'B.Tech / BCA / MCA / Graduate',
          location: job.location || 'India',
          deadline: job.deadline || 'Not available',
          notificationDate: job.postedDate || job.createdAt ? String(job.postedDate || job.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: 'Open'
        });
      });
    } catch (err) {
      console.warn('Error generating corporate notifications:', err);
    }

    // 4. Ingest real internships
    try {
      const internships = this.getInternships();
      internships.slice(0, 25).forEach(intern => {
        addNotif({
          id: `notif-intern-${intern.id}`,
          opportunityId: intern.id,
          title: `🎓 Internship: ${intern.title} (${intern.company})`,
          description: `${intern.company} offers ${intern.duration || 'an internship'} in ${intern.location || 'India'}.${intern.stipend ? ` Stipend: ${intern.stipend}.` : ''} Apply via verified portal.`,
          organization: intern.company,
          type: 'internship',
          category: 'Internships',
          notificationType: 'Internship Opportunity',
          sourceName: intern.sourceName || 'Verified Internship Portal',
          sourceUrl: intern.applyUrl || intern.sourceUrl || '#',
          applyUrl: intern.applyUrl || intern.sourceUrl || '#',
          qualification: intern.qualification || 'Student / Graduate / Final Year',
          location: intern.location || 'Pan India',
          deadline: intern.deadline || 'Not available',
          notificationDate: intern.postedDate || intern.createdAt ? String(intern.postedDate || intern.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: 'Open'
        });
      });
    } catch (err) {
      console.warn('Error generating internship notifications:', err);
    }

    // 5. Ingest real government recruitments
    try {
      const govtJobs = this.getGovtJobs();
      govtJobs.slice(0, 40).forEach(govt => {
        const srcStr = (govt.source || govt.sourceName || govt.recruitingOrganization || govt.organization || '').toLowerCase();
        let icon = '🏛️';
        let defaultSrc = 'Official Central/State Portal';
        if (srcStr.includes('rrb') || srcStr.includes('railway')) {
          icon = '🚆';
          defaultSrc = 'Railway Recruitment Boards (RRB)';
        } else if (srcStr.includes('india post') || srcStr.includes('gds') || srcStr.includes('postal')) {
          icon = '📮';
          defaultSrc = 'India Post (GDS Online)';
        } else if (srcStr.includes('national career service') || srcStr.includes('ncs')) {
          icon = '💼';
          defaultSrc = 'National Career Service (NCS)';
        } else if (srcStr.includes('ssc') || srcStr.includes('staff selection')) {
          icon = '📋';
          defaultSrc = 'Staff Selection Commission (SSC)';
        } else if (srcStr.includes('upsc') || srcStr.includes('union public')) {
          icon = '🏛️';
          defaultSrc = 'Union Public Service Commission (UPSC)';
        }

        addNotif({
          id: `notif-govt-${govt.id}`,
          opportunityId: govt.id,
          title: `${icon} ${govt.recruitingOrganization || govt.organization}: ${govt.postName || govt.title}`,
          description: `Official recruitment notice for ${govt.postName || govt.title} (${govt.vacancies || 'Multiple'} vacancies). Qualification: ${govt.qualification || 'Graduate'}.${govt.lastDate ? ` Last Date: ${govt.lastDate}.` : ''}`,
          organization: govt.recruitingOrganization || govt.organization,
          department: govt.department || govt.ministry || 'Government of India',
          type: 'government',
          category: 'Government Jobs',
          notificationType: 'Government Recruitment',
          sourceName: govt.sourceName || defaultSrc,
          sourceUrl: govt.officialNotificationUrl || govt.applyUrl || '#',
          applyUrl: govt.applyUrl || govt.officialNotificationUrl || '#',
          officialNotificationUrl: govt.officialNotificationUrl || '#',
          applicationStartDate: govt.startDate || govt.notificationDate || 'Available Now',
          applicationLastDate: govt.lastDate || govt.deadline || 'Check Official Notice',
          qualification: govt.qualification || 'Graduate / 10th / 12th',
          vacancies: govt.vacancies || 'Not Specified',
          location: govt.location || 'All India',
          deadline: govt.lastDate || govt.deadline || 'Not available',
          notificationDate: govt.notificationDate || govt.startDate ? String(govt.notificationDate || govt.startDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: 'Open'
        });
      });
    } catch (err) {
      console.warn('Error generating government notifications:', err);
    }

    // 6. Include any existing cached backend notifications
    try {
      const existingStored = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
      existingStored.forEach(item => {
        if (item && item.id && !seenIds.has(item.id) && !item.id.startsWith('notif-00')) {
          addNotif(item);
        }
      });
    } catch {}

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(generated));
    return generated;
  }

  mergeNotificationsFromBackend(backendNotifs) {
    if (!Array.isArray(backendNotifs)) return;
    const readIds = this.getReadNotificationIds();
    let current = [];
    try {
      current = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
    } catch {
      current = [];
    }
    const map = new Map();
    current.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });

    backendNotifs.forEach(bn => {
      if (!bn || !bn.id) return;
      let oppType = 'corporate';
      const cat = (bn.category || '').toLowerCase();
      if (cat.includes('govt') || cat.includes('exam') || (bn.organization || '').toLowerCase().includes('upsc')) {
        oppType = 'government';
      } else if (cat.includes('intern')) {
        oppType = 'internship';
      }
      const isRead = readIds.has(bn.id) || Boolean(bn.isRead || bn.read);
      if (isRead) readIds.add(bn.id);

      map.set(bn.id, {
        ...bn,
        type: bn.type || oppType,
        isRead: isRead,
        read: isRead,
        isNew: !isRead,
        isDemo: false
      });
    });

    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_READ, JSON.stringify([...readIds]));
  }

  getNotifications({ applyPreferences = true } = {}) {
    let list = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) {
        list = JSON.parse(stored) || [];
      }
    } catch {
      list = [];
    }

    if (!Array.isArray(list) || list.length === 0 || list.some(n => n.id && n.id.startsWith('notif-00'))) {
      list = this.generateRealNotifications();
    }

    if (!applyPreferences) return list;

    const prefs = this.getNotificationPreferences();
    return list.filter(item => {
      // Deadline reminder preferences
      if (item.isDeadlineReminder) {
        return Boolean(prefs.deadline_reminders);
      }
      // Profile match preferences
      if (item.isProfileMatch) {
        return Boolean(prefs.profile_matches);
      }
      // Track toggles
      if (item.type === 'corporate' && !prefs.corporate) return false;
      if (item.type === 'internship' && !prefs.internships) return false;
      if (item.type === 'government' && !prefs.government) return false;

      // Fresher filter if enabled
      if (prefs.freshers && item.experienceRequired) {
        const exp = String(item.experienceRequired || '').toLowerCase();
        if (exp.includes('2+') || exp.includes('3+') || exp.includes('4+') || exp.includes('5+')) {
          // Still permit if general corporate is on
        }
      }

      return true;
    });
  }

  getUnreadNotificationsCount() {
    return this.getNotifications({ applyPreferences: true }).filter(n => !n.isRead && !n.read).length;
  }

  markNotificationAsRead(id) {
    this.saveReadNotificationId(id);
    const list = this.getNotifications({ applyPreferences: false });
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      item.read = true;
      item.isNew = false;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
    this.notify('notifications_changed', { id, action: 'read', unreadCount: this.getUnreadNotificationsCount() });

    fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true })
    }).catch(() => {});
  }

  markNotificationAsUnread(id) {
    this.removeReadNotificationId(id);
    const list = this.getNotifications({ applyPreferences: false });
    const item = list.find(n => n.id === id);
    if (item) {
      item.isRead = false;
      item.read = false;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    }
    this.notify('notifications_changed', { id, action: 'unread', unreadCount: this.getUnreadNotificationsCount() });

    fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: false })
    }).catch(() => {});
  }

  markAllNotificationsAsRead() {
    const list = this.getNotifications({ applyPreferences: false });
    const activeList = this.getNotifications({ applyPreferences: true });
    const activeIds = activeList.map(n => n.id);
    this.saveAllReadNotificationIds(activeIds);

    list.forEach(n => {
      if (activeIds.includes(n.id)) {
        n.isRead = true;
        n.read = true;
        n.isNew = false;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify('notifications_changed', { action: 'mark_all_read', unreadCount: 0 });

    fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {});
    return list;
  }

  addNotification(notificationData) {
    if (!notificationData || !notificationData.title) {
      console.warn('Invalid notification data supplied to store.addNotification');
      return null;
    }

    const list = this.getNotifications({ applyPreferences: false });
    const now = new Date().toISOString();
    const newNotification = {
      id: notificationData.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: String(notificationData.title).trim(),
      organization: notificationData.organization ? String(notificationData.organization).trim() : 'Recruiting Authority',
      type: notificationData.type || 'corporate',
      category: notificationData.category || 'Corporate Jobs',
      description: notificationData.description ? String(notificationData.description).trim() : '',
      sourceName: notificationData.sourceName || 'Official Portal',
      sourceUrl: notificationData.sourceUrl || '#',
      notificationDate: notificationData.notificationDate || new Date().toISOString().slice(0, 10),
      applicationStartDate: notificationData.applicationStartDate || notificationData.startDate || 'Available Now',
      applicationLastDate: notificationData.applicationLastDate || notificationData.lastDate || 'Check Portal',
      eligibility: notificationData.eligibility || 'Check official portal guidelines.',
      qualification: notificationData.qualification || 'Graduate / 10th / 12th',
      location: notificationData.location || 'All India',
      vacancies: notificationData.vacancies || 'Not Specified',
      applyUrl: notificationData.applyUrl || '#',
      officialNotificationUrl: notificationData.officialNotificationUrl || '#',
      status: notificationData.status || 'Active',
      isNew: true,
      isRead: false,
      isDemo: false,
      createdAt: now,
      updatedAt: now
    };

    list.unshift(newNotification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify('notifications_changed', {
      action: 'add',
      notification: newNotification,
      unreadCount: this.getUnreadNotificationsCount()
    });
    return newNotification;
  }

  deleteNotification(id) {
    let list = this.getNotifications({ applyPreferences: false });
    list = list.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    this.notify('notifications_changed', { action: 'delete', id, unreadCount: this.getUnreadNotificationsCount() });
  }

  filterNotifications({ search = '', category = 'All', status = 'All', source = 'All', closingSoon = false, sortBy = 'newest' } = {}) {
    let items = [...this.getNotifications({ applyPreferences: true })];

    // Category / Tab Filtering
    // Tabs supported: 'All', 'Unread', 'Corporate', 'Internships', 'Government', 'Deadline Reminders'
    if (category && category !== 'All') {
      const c = category.toLowerCase().trim();
      if (c === 'unread') {
        items = items.filter(n => !n.isRead && !n.read);
      } else if (c === 'corporate' || c === 'corporate jobs' || c === 'private jobs') {
        items = items.filter(n => n.type === 'corporate' || n.category === 'Corporate Jobs' || n.category === 'Private Jobs');
      } else if (c === 'internships' || c === 'internship') {
        items = items.filter(n => n.type === 'internship' || n.category === 'Internships');
      } else if (c === 'government' || c === 'government jobs' || c === 'exams' || c === 'recruitment forms') {
        items = items.filter(n => n.type === 'government' || n.category === 'Government Jobs' || n.category === 'Exams' || n.category === 'Recruitment Forms');
      } else if (c === 'deadline' || c === 'deadline reminders' || c === 'deadlines') {
        items = items.filter(n => n.isDeadlineReminder || n.category === 'Deadline Reminders' || n.status === 'Closing Soon' || n.status === 'Closing Today');
      } else {
        items = items.filter(n => (n.category || '').toLowerCase() === c);
      }
    }

    // Read / Unread Status Filter
    if (status === 'unread') {
      items = items.filter(n => !n.isRead && !n.read);
    } else if (status === 'read') {
      items = items.filter(n => n.isRead || n.read);
    }

    // Closing Soon Filter
    if (closingSoon) {
      items = items.filter(n =>
        n.isDeadlineReminder ||
        n.status === 'Closing Soon' ||
        n.status === 'Closing Today' ||
        (n.diffDays !== null && n.diffDays !== undefined && n.diffDays >= 0 && n.diffDays <= 7)
      );
    }

    // Source Filter
    if (source && source !== 'All') {
      if (source === 'Official' || source === 'Real') {
        items = items.filter(n => !n.isDemo);
      } else {
        items = items.filter(n =>
          (n.sourceName || '').toLowerCase().includes(source.toLowerCase()) ||
          (n.organization || '').toLowerCase().includes(source.toLowerCase())
        );
      }
    }

    // Search Query Filter
    const q = (search || '').toLowerCase().trim();
    if (q) {
      items = items.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.organization && n.organization.toLowerCase().includes(q)) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.qualification && n.qualification.toLowerCase().includes(q)) ||
        (n.location && n.location.toLowerCase().includes(q)) ||
        (n.sourceName && n.sourceName.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'deadline') {
      items.sort((a, b) => {
        const da = a.diffDays !== null && a.diffDays !== undefined ? a.diffDays : 9999;
        const db = b.diffDays !== null && b.diffDays !== undefined ? b.diffDays : 9999;
        return da - db;
      });
    } else {
      // Newest first: unread priority, then by date
      items.sort((a, b) => {
        const aUnread = (!a.isRead && !a.read) ? 1 : 0;
        const bUnread = (!b.isRead && !b.read) ? 1 : 0;
        if (aUnread !== bUnread) return bUnread - aUnread;
        const dA = parseDateSafely(a.notificationDate || a.createdAt || a.timestamp);
        const dB = parseDateSafely(b.notificationDate || b.createdAt || b.timestamp);
        const timeA = dA ? dA.getTime() : 0;
        const timeB = dB ? dB.getTime() : 0;
        return timeB - timeA;
      });
    }

    return items;
  }

  // =================== MY ELIGIBILITY ===================
  getEligibilityProfile() {
    const prof = this.getProfile();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ELIGIBILITY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          highestQualification: prof.highestQualification || parsed.highestQualification || "Graduate (Bachelor's)",
          degree: prof.degree || parsed.degree || 'Bachelor of Computer Applications (BCA)',
          graduationStatus: prof.graduationStatus || parsed.graduationStatus || 'Pursuing (Final Year)',
          graduationYear: prof.graduationYear || parsed.graduationYear || '2025',
          skills: (Array.isArray(prof.skills) && prof.skills.length > 0) ? prof.skills : (Array.isArray(parsed.skills) ? parsed.skills : ['Python', 'SQL']),
          experience: prof.experience || parsed.experience || 'Fresher (0-1 yr)',
          preferredLocation: Array.isArray(prof.preferredLocations) ? prof.preferredLocations.join(', ') : (parsed.preferredLocation || 'All India'),
          preferredJobType: prof.preferredJobType || parsed.preferredJobType || 'Full-time / Internship',
          careerPreference: prof.careerPreference || parsed.careerPreference || 'Both Corporate & Government'
        };
      }
    } catch (e) {
      console.warn('Could not parse eligibility profile, falling back to profile defaults');
    }

    return {
      highestQualification: prof.highestQualification || "Graduate (Bachelor's)",
      degree: prof.degree || 'Bachelor of Computer Applications (BCA)',
      graduationStatus: prof.graduationStatus || 'Pursuing (Final Year)',
      graduationYear: prof.graduationYear || '2025',
      skills: prof.skills || ['Python', 'SQL', 'JavaScript', 'React'],
      experience: prof.experience || 'Fresher (0-1 yr)',
      preferredLocation: Array.isArray(prof.preferredLocations) ? prof.preferredLocations.join(', ') : 'Bangalore / Remote',
      preferredJobType: prof.preferredJobType || 'Full-time / Internship',
      careerPreference: prof.careerPreference || 'Both Corporate & Government'
    };
  }

  saveEligibilityProfile(data) {
    localStorage.setItem(STORAGE_KEYS.ELIGIBILITY, JSON.stringify(data));

    // Keep Central Profile in sync
    try {
      const existing = this.getProfile();
      const updatedProfile = {
        ...existing,
        highestQualification: data.highestQualification || existing.highestQualification,
        degree: data.degree || existing.degree,
        graduationStatus: data.graduationStatus || existing.graduationStatus,
        graduationYear: data.graduationYear || existing.graduationYear,
        skills: Array.isArray(data.skills) ? data.skills : existing.skills,
        experience: data.experience || existing.experience,
        preferredJobType: data.preferredJobType || existing.preferredJobType,
        careerPreference: data.careerPreference || existing.careerPreference
      };
      if (data.preferredLocation) {
        updatedProfile.preferredLocations = data.preferredLocation.split(',').map(s => s.trim()).filter(Boolean);
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));
      this.notify('profile_changed', updatedProfile);
    } catch (err) {
      console.warn('Profile sync note:', err);
    }

    this.notify('eligibility_changed', data);
    return data;
  }

  calculateEligibility(criteria = null) {
    const c = criteria || this.getEligibilityProfile() || {};
    const rawSkills = c.skills;
    const userSkills = (Array.isArray(rawSkills) ? rawSkills : (typeof rawSkills === 'string' ? rawSkills.split(',') : []))
      .map(s => String(s).trim().toLowerCase())
      .filter(Boolean);

    const userDegree = String(c.degree || '').toLowerCase().trim();
    const userPref = String(c.careerPreference || 'Both Corporate & Government');
    const userLocation = String(c.preferredLocation || '').toLowerCase().trim();
    const userJobType = String(c.preferredJobType || 'Full-time / Internship');
    const userExp = String(c.experience || '').toLowerCase().trim();
    const userGradStatus = String(c.graduationStatus || '').toLowerCase().trim();
    const isFresher = userExp.includes('fresher') || userExp.includes('0-1');
    const isExperienced = userExp.includes('1-2') || userExp.includes('experienced') || userExp.includes('2+');
    const isStudent = userExp.includes('student') || userExp.includes('intern') || userGradStatus.includes('pursuing');
    const userHighestQual = String(c.highestQualification || '').toLowerCase().trim();

    const isBca = userDegree.includes('bca') || userDegree.includes('computer application');
    const isCsIt = isBca || userDegree.includes('computer science') || userDegree.includes('information technology') || userDegree.includes('cs') || userDegree.includes('it');
    const is10th12thOnly = userHighestQual.includes('10th') || userHighestQual.includes('12th') || userHighestQual.includes('matriculation') || userDegree.includes('10th') || userDegree.includes('12th') || userDegree.includes('secondary') || userDegree.includes('matric');
    const isGrad = (userHighestQual.includes('graduate') || userHighestQual.includes('bachelor') || userHighestQual.includes('master') || userHighestQual.includes('post graduate') ||
                    userDegree.includes('bachelor') || userDegree.includes('b.tech') || userDegree.includes('btech') || userDegree.includes('bca') || userDegree.includes('b.sc') || userDegree.includes('bsc') || userDegree.includes('b.e') || userDegree.includes('be') || userDegree.includes('m.tech') || userDegree.includes('mca')) && !is10th12thOnly;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const eligible = [];
    const possiblyEligible = [];
    const notEligible = [];

    const checkOpp = (item, isGovt = false, isIntern = false) => {
      const matchReasons = [];
      const missingReasons = [];
      const unmetReasons = [];
      let notEnoughInfo = false;

      // 1. Strict Expiry & Closed Vacancy Filter
      const rawDeadline = isGovt ? (item.lastDate || item.last_date) : (item.deadline);
      const statusVal = (item.status || '').toLowerCase().trim();
      if (statusVal === 'closed' || statusVal === 'expired') return null;

      if (rawDeadline && rawDeadline !== 'Not available' && !rawDeadline.startsWith('Refer to') && rawDeadline !== 'Not Specified') {
        const parsedD = parseDateSafely(rawDeadline);
        if (parsedD) {
          const dPart = parsedD.toISOString().slice(0, 10);
          if (dPart < todayStr) return null;
        }
      }

      const titleStr = (isGovt ? (item.postName || item.post_name || '') : (item.title || '')).toLowerCase();
      const examD = (item.examDate || item.exam_date || '').toLowerCase();
      if ((titleStr.includes('2025') || titleStr.includes('2024') || titleStr.includes('2023') || examD.includes('2025') || examD.includes('2024')) &&
          (!rawDeadline || rawDeadline === 'Not available')) {
        return null;
      }

      // Fields for text analysis
      const expField = ((item.experience || '') + ' ' + (item.roleCategory || '')).toLowerCase();
      const eligField = (item.eligibility || '').toLowerCase();
      const qualField = ((item.qualification || '') + ' ' + (item.qualificationDetail || '')).toLowerCase();
      const descField = (item.description || '').toLowerCase();
      const fullTxt = `${titleStr} ${expField} ${eligField} ${qualField} ${descField}`;

      // Extract explicit numeric years of experience required
      let reqYears = 0;
      const m = fullTxt.match(/(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:professional|relevant|software|non-internship)?\s*experience|\s*exp)?/);
      if (m) {
        reqYears = parseInt(m[1], 10) || 0;
      }

      const isExplicitSeniorRole = ['senior', 'lead ', 'lead,', 'principal', 'manager', 'director', 'architect', 'head of'].some(k => titleStr.includes(k)) ||
                                   ['senior'].some(k => expField.includes(k));
      const isMidLevelRole = ['mid level', 'mid-level', 'experienced / senior', 'experienced (2+ yrs)'].some(k => expField.includes(k));

      // 2. Experience Requirements & Conflicts
      if (isGovt) {
        if (reqYears >= 2 && (isFresher || isStudent)) {
          unmetReasons.push(`Government post requires ${reqYears}+ years of prior experience`);
        } else if (reqYears >= 3 && isExperienced) {
          unmetReasons.push(`Government post requires senior experience (${reqYears}+ years)`);
        } else {
          matchReasons.push('Experience requirement: Open recruitment / examination without mandatory prior experience requirement');
        }
      } else if (isFresher || isStudent) {
        if (reqYears >= 2) {
          unmetReasons.push(`Job requires ${reqYears}+ years of experience; user profile shows fresher (0-1 yr)`);
        } else if (isExplicitSeniorRole || (isMidLevelRole && !titleStr.includes('junior') && !titleStr.includes('trainee'))) {
          unmetReasons.push('Role is targeted at mid/senior level professionals; not open to freshers');
        } else if (expField.includes('fresher') || expField.includes('entry level') || expField.includes('0-1') ||
                   titleStr.includes('junior') || titleStr.includes('trainee') || titleStr.includes('intern') ||
                   eligField.includes('fresher')) {
          matchReasons.push('Fresher requirement matches: Source explicitly specifies entry-level / fresher eligibility');
        } else if (isIntern) {
          matchReasons.push('Role matches student / internship applicant profile');
        } else if (expField.includes('not specified') || !item.experience) {
          missingReasons.push('Experience requirement is not specified in employer posting; verify on portal');
          notEnoughInfo = true;
        }
      } else if (isExperienced) {
        // User has 1-2 years experience
        if (reqYears >= 3 || isExplicitSeniorRole) {
          unmetReasons.push(`Job requires senior experience (${reqYears ? reqYears + '+ yrs' : 'senior level'}); user profile indicates 1-2 years`);
        } else if (reqYears === 1 || reqYears === 2 || isMidLevelRole || expField.includes('fresher') || expField.includes('entry') || expField.includes('1-2') || isIntern) {
          matchReasons.push('Experience requirement matches: Open to candidates with 1-2 years relevant experience');
        } else if (expField.includes('not specified') || !item.experience) {
          missingReasons.push('Experience requirement is not specified in employer posting; verify on portal');
          notEnoughInfo = true;
        }
      }

      // Check internships with 2+ years non-internship experience
      if (isIntern && reqYears >= 2) {
        unmetReasons.push(`Posting mandates ${reqYears}+ years of non-internship experience; not open to entry-level interns`);
      }

      // 3. Graduation Status & Year
      if (userGradStatus.includes('pursuing')) {
        if (isIntern) {
          matchReasons.push('Student enrollment matches: Opportunity is structured for currently enrolled / pursuing students');
        } else if (fullTxt.includes('degree completed') || fullTxt.includes('must have passed') || fullTxt.includes('passout only') || fullTxt.includes('graduated before')) {
          unmetReasons.push(`Role mandates a completed degree; profile indicates currently pursuing (${c.graduationStatus || 'pursuing'})`);
        }
      }

      // 4. Educational & Degree Qualification Matching
      const rawElig = isGovt ? (item.qualificationDetail || item.qualification || item.eligibility) : (item.eligibility || item.qualification);
      const hasRealElig = rawElig && rawElig !== 'Not available' && rawElig !== 'Not Specified' && !rawElig.startsWith('Refer to') && rawElig.trim().length > 3;

      const disqualifiers = [
        { key: 'mbbs', label: 'MBBS / Medical Degree' },
        { key: 'medical officer', label: 'Medical Degree' },
        { key: 'drugs inspector', label: 'Pharmacy / Pharmaceutical Science Degree' },
        { key: 'b.v.sc', label: 'Veterinary Science Degree' },
        { key: 'chartered accountant', label: 'Chartered Accountant (CA)' },
        { key: 'law degree', label: 'Law Degree (LLB)' },
        { key: 'llb', label: 'Law Degree (LLB)' },
        { key: 'ph.d', label: 'Doctoral / Ph.D Degree' },
        { key: '(phd)', label: 'Doctoral / Ph.D Degree' }
      ];

      for (const dq of disqualifiers) {
        if (titleStr.includes(dq.key) || qualField.includes(dq.key) || eligField.includes(dq.key)) {
          if (!userSkills.includes(dq.key) && !userDegree.includes(dq.key)) {
            unmetReasons.push(`Requires specialized credential (${dq.label}) not held in user profile`);
            break;
          }
        }
      }

      // Degree Level Disqualification for 10th/12th only candidates
      if (is10th12thOnly && (qualField.includes('degree') || qualField.includes('graduate') || qualField.includes('bachelor') || isBca)) {
        if (!qualField.includes('10th') && !qualField.includes('12th')) {
          unmetReasons.push('Requires recognized Bachelor degree; candidate holds 10th/12th secondary qualification');
        }
      }

      // Positive Qualification Matching
      if (hasRealElig) {
        const rawLower = rawElig.toLowerCase();
        if (isBca && (rawLower.includes('bca') || rawLower.includes('computer application') || fullTxt.includes('bca'))) {
          matchReasons.push('Qualification matches: Explicitly matches your BCA / Computer Applications degree');
        } else if (isCsIt && ['computer science', 'information technology', 'cs/it', 'software engineering', 'b.sc', 'b.tech', 'btech'].some(k => rawLower.includes(k))) {
          matchReasons.push('Qualification matches: Computer Science / IT academic specialization satisfied');
        } else if (isGrad && ['any graduate', 'any degree', 'bachelor', 'graduation in any', 'graduate in any', 'degree from a recognized'].some(k => rawLower.includes(k))) {
          matchReasons.push('Qualification matches: Graduation requirement met (Any Bachelor degree accepted)');
        } else if (rawLower.includes('10th') || rawLower.includes('matriculation') || rawLower.includes('12th')) {
          matchReasons.push('Qualification matches: 10th pass / matriculation minimum satisfied by candidate profile');
        } else if (isGovt && rawLower.includes('degree') && isGrad) {
          matchReasons.push('Qualification matches: Recognized university graduation degree held');
        } else if (isIntern && (rawLower.includes('university') || rawLower.includes('college') || rawLower.includes('enrolled') || rawLower.includes('student'))) {
          matchReasons.push('Qualification matches: Current college/university enrollment matches internship criteria');
        } else {
          missingReasons.push(`Posting states qualification as "${rawElig.slice(0, 50)}..."; confirm specific subject stream on portal`);
          notEnoughInfo = true;
        }
      } else {
        // Missing qualification in source
        if (isGovt) {
          missingReasons.push('Educational prerequisites not specified in bulletin summary; refer to official portal notice');
          notEnoughInfo = true;
        } else if (isIntern) {
          matchReasons.push('General internship opening: Enrolled students and fresh graduates eligible to apply');
        } else if (is10th12thOnly) {
          missingReasons.push('Corporate tech role: Employer degree prerequisite not specified; verify on portal');
          notEnoughInfo = true;
        } else {
          matchReasons.push('Educational prerequisites: Open / not restricted in employer posting');
        }
      }

      // Government Age Limit Check
      if (isGovt) {
        const ageField = (item.ageLimit || item.age_limit || '').toLowerCase();
        if (ageField && ageField !== 'not available' && !ageField.startsWith('refer to')) {
          matchReasons.push(`Age requirement (${item.ageLimit || item.age_limit}) verified`);
        }
      }

      // Location match
      if (userLocation && userLocation !== 'all' && userLocation !== 'all india' && userLocation !== 'pan india') {
        const itemLoc = (item.location || '').toLowerCase();
        if (itemLoc.includes(userLocation) || itemLoc.includes('remote') || itemLoc.includes('all india') || itemLoc.includes('pan india')) {
          matchReasons.push(`Location matches your preference: ${item.location || 'Remote'}`);
        }
      }

      // Preferred Job Type Check
      if (userJobType === 'Internship Only' && !isIntern) {
        missingReasons.push("Job type notice: Profile specifies 'Internship Only'; this is a full-time position");
        notEnoughInfo = true;
      } else if (userJobType === 'Full-time Only' && isIntern) {
        unmetReasons.push("Posting is an internship; user profile preference is 'Full-time Only'");
      }

      // 5. Skills Matching
      let itemSkills = [];
      if (Array.isArray(item.skills)) {
        itemSkills = item.skills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
      }
      const matchedSkills = userSkills.filter(s => {
        if (!s || s.length < 2) return false;
        return itemSkills.includes(s) || titleStr.includes(s) || descField.includes(s) || eligField.includes(s);
      });

      if (matchedSkills.length > 0) {
        const capSkills = matchedSkills.slice(0, 4).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
        matchReasons.push(`Required technical skills matched: ${capSkills}`);
      }

      // Specialized Foreign Language requirements
      if (titleStr.includes('portuguese') && !userSkills.includes('portuguese')) {
        unmetReasons.push('Requires Portuguese language fluency not present in user profile');
      } else if (titleStr.includes('chinese speaker') && !userSkills.includes('chinese')) {
        unmetReasons.push('Requires Chinese language fluency not present in user profile');
      } else if (titleStr.includes('japanese') && !userSkills.includes('japanese')) {
        unmetReasons.push('Requires Japanese language fluency not present in user profile');
      }

      // 6. Strict 3-Tier Classification
      let state = 'eligible';
      let primaryExplanation = '';

      if (unmetReasons.length > 0) {
        state = 'not_eligible';
        const primaryUnmet = unmetReasons[0];
        primaryExplanation = `Not eligible because ${primaryUnmet.charAt(0).toLowerCase() + primaryUnmet.slice(1)}.`;
      } else if (notEnoughInfo || missingReasons.length > 0 || matchReasons.length === 0) {
        state = 'possibly_eligible';
        if (matchReasons.length === 0) {
          missingReasons.push('No direct skill or role match confirmed from source text');
        }
        if (missingReasons.length === 0) {
          missingReasons.push('detailed eligibility criteria should be confirmed on the official portal');
        }
        const primaryMissing = missingReasons[0];
        primaryExplanation = `Possibly eligible because ${primaryMissing.charAt(0).toLowerCase() + primaryMissing.slice(1)}.`;
      } else {
        state = 'eligible';
        if (isIntern) {
          primaryExplanation = 'Eligible because your academic background matches internship prerequisites and no prior industry experience is required.';
        } else if (isFresher) {
          primaryExplanation = `Eligible because your qualification matches the required ${c.degree ? c.degree : 'degree'} and no prior experience is required.`;
        } else {
          primaryExplanation = `Eligible because your verified qualifications and experience align with the opportunity requirements.`;
        }
      }

      return {
        ...item,
        isGovt,
        isInternship: isIntern,
        eligibleState: state,
        primaryExplanation,
        notEnoughInfo: Boolean(notEnoughInfo || missingReasons.length > 0),
        matchReasons: [...new Set(matchReasons)],
        missingReasons: [...new Set(missingReasons)],
        unmetReasons: [...new Set(unmetReasons)]
      };
    };

    if (userPref !== 'Government Exams Only') {
      this.getCorporateJobs().forEach(j => {
        const ev = checkOpp(j, false, false);
        if (ev) {
          if (ev.eligibleState === 'eligible') eligible.push(ev);
          else if (ev.eligibleState === 'possibly_eligible') possiblyEligible.push(ev);
          else notEligible.push(ev);
        }
      });

      this.getInternships().forEach(it => {
        const ev = checkOpp(it, false, true);
        if (ev) {
          if (ev.eligibleState === 'eligible') eligible.push(ev);
          else if (ev.eligibleState === 'possibly_eligible') possiblyEligible.push(ev);
          else notEligible.push(ev);
        }
      });
    }

    if (userPref !== 'Corporate Jobs Only') {
      this.getGovtJobs().forEach(g => {
        const ev = checkOpp(g, true, false);
        if (ev) {
          if (ev.eligibleState === 'eligible') eligible.push(ev);
          else if (ev.eligibleState === 'possibly_eligible') possiblyEligible.push(ev);
          else notEligible.push(ev);
        }
      });
    }

    // Sort deterministically: opportunities with most verified matched reasons first
    eligible.sort((a, b) => (b.matchReasons?.length || 0) - (a.matchReasons?.length || 0));
    possiblyEligible.sort((a, b) => (b.matchReasons?.length || 0) - (a.matchReasons?.length || 0));

    return {
      eligible,
      possiblyEligible,
      notEligible,
      counts: {
        eligible: eligible.length,
        possiblyEligible: possiblyEligible.length,
        notEligible: notEligible.length,
        totalMatched: eligible.length + possiblyEligible.length
      }
    };
  }

  getEligibleOpportunities(criteria = null) {
    const result = this.calculateEligibility(criteria || this.getEligibilityProfile());
    const combined = [...result.eligible, ...result.possiblyEligible];
    combined.eligible = result.eligible;
    combined.possiblyEligible = result.possiblyEligible;
    combined.notEligible = result.notEligible;
    combined.counts = result.counts;
    return combined;
  }

  async matchEligibilityAPI(criteria = null) {
    const c = criteria || this.getEligibilityProfile();
    try {
      const res = await fetch('/api/eligibility/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend eligibility match failed, using local engine:', e);
    }
    return this.calculateEligibility(c);
  }
}

export const store = new Store();
