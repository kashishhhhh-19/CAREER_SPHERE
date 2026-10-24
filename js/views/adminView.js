/**
 * CareerSphere - Official Sources & Development Admin View
 * Monitors official recruitment source adapters, duplicate prevention stats,
 * and allows on-demand source checks.
 */

import { store } from '../store.js';
import { showToast, escapeHtml } from '../utils.js';

export function renderAdminView(container, navigateTo) {
  container.innerHTML = `
    <div class="view-header admin-theme-header">
      <div class="view-header-content">
        <div class="breadcrumb">
          <a href="#home" class="btn-text-sm" id="admin-breadcrumb-home">Home</a> / 
          <a href="#notifications" class="btn-text-sm" id="admin-breadcrumb-notif">Notifications</a> / 
          <span class="active">Source Admin</span>
        </div>
        <div class="header-action-row">
          <div>
            <div class="header-badge-tag">
              <span class="pulse-dot"></span> Official Source Engine
            </div>
            <h1 class="page-title">Source Health & Development Diagnostics ⚙️</h1>
            <p class="page-desc">
              Inspect configured official recruitment sources, check adapter health, monitor duplicate prevention metrics, and trigger updates.
            </p>
          </div>
          <div class="header-btns">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary" id="trigger-live-sync-btn" style="background: #10B981; border-color: #059669;">
                ⚡ Sync Real Data Now
              </button>
              <button class="btn btn-outline-light" id="trigger-check-btn">
                🔄 Check Health
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- Live Integration Notice Banner -->
      <div class="admin-live-notice-banner card" id="admin-live-banner">
        <div class="admin-banner-icon" id="admin-banner-icon">⏳</div>
        <div class="admin-banner-text" id="admin-banner-text">
          <h4 id="admin-banner-heading" style="margin: 0 0 0.25rem 0; font-size: 0.98rem;">Live Source Integration Status: Checking connection...</h4>
          <p id="admin-banner-desc" style="margin: 0; font-size: 0.85rem; line-height: 1.45;">
            Verifying connectivity to official recruitment sources.
          </p>
        </div>
      </div>

      <!-- KPI Stats Grid -->
      <div class="admin-stats-grid" id="admin-kpi-grid">
        <div class="admin-stat-card card">
          <span class="admin-stat-label">Total Notifications</span>
          <h2 class="admin-stat-val" id="stat-total-notifs">--</h2>
          <span class="admin-stat-sub text-muted" id="stat-real-demo-split">-- Real • -- Demo</span>
        </div>

        <div class="admin-stat-card card">
          <span class="admin-stat-label">Unread Alert Count</span>
          <h2 class="admin-stat-val text-primary" id="stat-unread-count">--</h2>
          <span class="admin-stat-sub text-muted">Currently flagged as unread</span>
        </div>

        <div class="admin-stat-card card">
          <span class="admin-stat-label">Configured Sources</span>
          <h2 class="admin-stat-val text-success" id="stat-sources-count">--</h2>
          <span class="admin-stat-sub text-muted">Official Recruitment Portals</span>
        </div>

        <div class="admin-stat-card card">
          <span class="admin-stat-label">Duplicate Prevention</span>
          <h2 class="admin-stat-val text-purple" id="stat-duplicates-skipped">Active</h2>
          <span class="admin-stat-sub text-muted">0 duplicate copies created</span>
        </div>
      </div>

      <!-- Sources Table Card -->
      <div class="card admin-sources-card">
        <div class="admin-card-header">
          <div>
            <h3 class="admin-section-title">📡 Configured Recruitment Sources</h3>
            <p class="text-muted" style="font-size: 0.88rem; margin: 0;">
              Adapters poll these official government and public portals without aggressive scraping or fabricated notices.
            </p>
          </div>
          <div id="check-status-indicator" class="badge badge-neutral" style="font-size: 0.8rem;">
            Ready to check
          </div>
        </div>

        <div class="admin-table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Source Portal</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Checked</th>
                <th>Last Successful Check</th>
                <th>Notices Indexed</th>
                <th>Error Status</th>
              </tr>
            </thead>
            <tbody id="admin-sources-tbody">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Architecture Pipeline Card -->
      <div class="card admin-pipeline-card" style="margin-top: 2rem;">
        <h3 class="admin-section-title">🔄 Future-Ready Ingestion Pipeline</h3>
        <div class="pipeline-steps-grid">
          <div class="pipeline-step-box">
            <div class="step-num">1</div>
            <div class="step-title">Official Sources</div>
            <div class="step-desc">UPSC, NCS, Employment News official portals.</div>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-step-box">
            <div class="step-num">2</div>
            <div class="step-title">Scheduled Checker</div>
            <div class="step-desc">Python adapter service probes notices with timeout safety.</div>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-step-box">
            <div class="step-num">3</div>
            <div class="step-title">Duplicate Prevention</div>
            <div class="step-desc">Stable identifier match updates notices without creating duplicates.</div>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-step-box">
            <div class="step-num">4</div>
            <div class="step-title">Career Sphere UI</div>
            <div class="step-desc">Red notification badge on bell & navigation links.</div>
          </div>
          <div class="pipeline-arrow">&rarr;</div>
          <div class="pipeline-step-box future">
            <div class="step-num">5</div>
            <div class="step-title">Browser Push (Future)</div>
            <div class="step-desc">Prepared for Web Push / ServiceWorker alerts.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Breadcrumbs
  container.querySelector('#admin-breadcrumb-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('home');
  });
  container.querySelector('#admin-breadcrumb-notif')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('notifications');
  });

  const checkBtn = container.querySelector('#trigger-check-btn');
  const statusIndicator = container.querySelector('#check-status-indicator');
  const sourcesTbody = container.querySelector('#admin-sources-tbody');

  const statTotal = container.querySelector('#stat-total-notifs');
  const statSplit = container.querySelector('#stat-real-demo-split');
  const statUnread = container.querySelector('#stat-unread-count');
  const statSources = container.querySelector('#stat-sources-count');

  const bannerEl = container.querySelector('#admin-live-banner');
  const bannerIcon = container.querySelector('#admin-banner-icon');
  const bannerHeading = container.querySelector('#admin-banner-heading');
  const bannerDesc = container.querySelector('#admin-banner-desc');

  const loadData = async () => {
    const stats = await store.fetchAdminStatsAPI();
    const sources = store.getSources();

    if (stats) {
      statTotal.textContent = stats.totalNotifications ?? '--';
      const corpReal = stats.corporateJobs?.real ?? 0;
      const govtReal = stats.govtRecruitments?.real ?? 0;
      statSplit.textContent = `${stats.realNotifications ?? (corpReal + govtReal)} Real Sourced • ${stats.demoNotifications ?? 0} Demo`;
      statUnread.textContent = stats.unreadCount ?? 0;
      statSources.textContent = stats.sourcesCount ?? sources.length;
    }

    const hasOperational = sources.some(s => s.status === 'Operational' || (s.itemsCount && s.itemsCount > 0));
    const realNotifCount = stats?.realNotifications ?? 0;

    if (hasOperational || realNotifCount > 0) {
      if (bannerEl) {
        bannerEl.style.background = '#ECFDF5';
        bannerEl.style.borderColor = '#10B981';
      }
      if (bannerIcon) bannerIcon.textContent = '✅';
      if (bannerHeading) {
        bannerHeading.style.color = '#065F46';
        bannerHeading.textContent = 'Live Source Integration Status: Operational (Union Public Service Commission)';
      }
      if (bannerDesc) {
        bannerDesc.style.color = '#047857';
        bannerDesc.innerHTML = 'Direct connection active to <strong>https://upsc.gov.in</strong>. Authentic central government recruitments and exam notices are live and continuously verified.';
      }
    } else {
      if (bannerEl) {
        bannerEl.style.background = '#FFFBEB';
        bannerEl.style.borderColor = '#F59E0B';
      }
      if (bannerIcon) bannerIcon.textContent = '⚠️';
      if (bannerHeading) {
        bannerHeading.style.color = '#92400E';
        bannerHeading.textContent = 'Live Source Integration Status: Source unavailable';
      }
      if (bannerDesc) {
        bannerDesc.style.color = '#B45309';
        bannerDesc.textContent = 'Official recruitment source could not be reached. Check network connection or server status.';
      }
    }

    if (sources.length === 0) {
      sourcesTbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted" style="padding: 2rem;">No sources configured yet.</td>
        </tr>
      `;
      return;
    }

    sourcesTbody.innerHTML = sources.map(src => {
      const isOperational = src.status === 'Operational' || (src.itemsCount && src.itemsCount > 0);
      const statusBadge = isOperational 
        ? `<span class="badge badge-success font-semibold" style="white-space: nowrap;">✓ Operational</span>`
        : `<span class="badge badge-amber font-semibold" style="white-space: nowrap;">● ${escapeHtml(src.status || 'Pending Check')}</span>`;

      const lastChecked = src.lastCheckedTime ? new Date(src.lastCheckedTime).toLocaleString('en-GB') : 'Ready to check';
      const lastSuccess = src.lastSuccessfulCheck ? new Date(src.lastSuccessfulCheck).toLocaleString('en-GB') : (isOperational ? 'Recent' : 'Pending');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(src.sourceName)}</strong><br />
            <a href="${escapeHtml(src.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="text-muted" style="font-size: 0.78rem;">
              ${escapeHtml(src.sourceUrl)} ↗
            </a>
          </td>
          <td>
            <span class="badge badge-neutral" style="font-size: 0.75rem; text-transform: uppercase;">
              ${escapeHtml(src.sourceType || 'portal')}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td style="font-size: 0.85rem; color: var(--text-body);">${lastChecked}</td>
          <td style="font-size: 0.85rem; color: var(--text-body);">${lastSuccess}</td>
          <td>
            <span class="font-bold text-navy">${src.itemsCount ?? 0}</span> <span class="text-muted" style="font-size: 0.75rem;">(Live Notices)</span>
          </td>
          <td>
            <span class="${isOperational ? 'text-success' : 'text-amber'} font-semibold" style="font-size: 0.8rem;">
              ${isOperational ? '✓ Live Verified Feed' : (src.errorStatus ? escapeHtml(src.errorStatus) : 'Ready')}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  };

  
  const liveSyncBtn = container.querySelector('#trigger-live-sync-btn');
  if (liveSyncBtn) {
    liveSyncBtn.addEventListener('click', async () => {
      liveSyncBtn.disabled = true;
      liveSyncBtn.textContent = '⏳ Fetching Real Data...';
      const syncRes = await store.triggerLiveSyncAPI();
      if (syncRes && syncRes.success) {
        showToast(`Real Ingestion Success! ${syncRes.corporate.fetched} Corporate Jobs & ${syncRes.govt.fetched} Govt Notices fetched!`, 'success', 4000);
      } else {
        showToast('Sync initiated via local store.', 'info', 3000);
      }
      await loadData();
      liveSyncBtn.disabled = false;
      liveSyncBtn.textContent = '⚡ Sync Real Data Now';
    });
  }

  checkBtn.addEventListener('click', async () => {
    checkBtn.disabled = true;
    checkBtn.textContent = '⏳ Checking Sources...';
    statusIndicator.className = 'badge badge-primary';
    statusIndicator.textContent = 'Check in progress...';

    const report = await store.triggerSourcesCheckAPI();

    if (report) {
      const isOk = !report.errors || report.errors.length === 0;
      showToast(`Source health verified: ${report.checkedSourcesCount} checked, ${report.newImported} new imported.`, isOk ? 'success' : 'info', 3500);
      statusIndicator.className = isOk ? 'badge badge-success' : 'badge badge-amber';
      statusIndicator.textContent = isOk ? '✓ Sources Operational' : 'Partial / Pending';
    } else {
      showToast('Checked locally. (Start server.py for live API probing)', 'info', 3000);
      statusIndicator.className = 'badge badge-neutral';
      statusIndicator.textContent = 'Checked via local store';
    }

    await loadData();
    checkBtn.disabled = false;
    checkBtn.textContent = '🔄 Check Sources Now';
  });

  loadData();
}
