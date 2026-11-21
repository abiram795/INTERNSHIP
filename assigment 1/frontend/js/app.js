// API C2C Automation Dashboard Frontend Application
// Automatically targets FastAPI on port 8000 even when opened via VS Code Live Server (port 5500)
const API_BASE = (window.location.protocol.startsWith("http") && window.location.port === "8000") 
  ? "" 
  : "http://127.0.0.1:8000";

let isBackendConnected = true;

// Global State
let currentTab = "overview";
let currentCampaignSubtab = "PENDING_APPROVAL";
let currentPostKeyword = "all";
let searchKeywordsList = [];

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
  // Check if opened via Live Server (port 5500) or other port
  const banner = document.getElementById("backend-connection-banner");
  if (banner && window.location.port !== "8000") {
    banner.style.display = "flex";
  }

  initNavigation();
  initEventListeners();
  loadSystemStatus();
  loadDashboardStats();
  loadSearchHistory();
  loadEmailLogsOverview();

  // Handle URL hash if present
  const hash = window.location.hash.replace("#", "");
  if (hash && ["overview", "posts", "recruiters", "campaigns", "settings", "logs"].includes(hash)) {
    switchTab(hash);
  } else {
    switchTab("overview");
  }
});

// ==================== NAVIGATION ====================
function initNavigation() {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute("data-tab");
      switchTab(targetTab);
    });
  });

  // Campaign subnav tabs
  const subnavBtns = document.querySelectorAll(".campaign-subnav .subnav-btn");
  subnavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subnavBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCampaignSubtab = btn.getAttribute("data-subtab");
      loadCampaigns();
    });
  });

  // Modal review tab buttons (Edit HTML vs Rendered Preview)
  const modalTabBtns = document.querySelectorAll(".modal-tabs .modal-tab-btn");
  modalTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modalTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.getAttribute("data-modaltab");
      const codeView = document.getElementById("modal-tab-code-view");
      const previewView = document.getElementById("modal-tab-preview-view");

      if (mode === "preview") {
        codeView.style.display = "none";
        previewView.style.display = "block";
        const bodyContent = document.getElementById("edit-email-body").value;
        const iframe = document.getElementById("edit-preview-iframe");
        iframe.srcdoc = bodyContent;
      } else {
        codeView.style.display = "block";
        previewView.style.display = "none";
      }
    });
  });
}

function switchTab(tabName) {
  currentTab = tabName;
  window.location.hash = tabName;

  // Update sidebar active link
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-tab") === tabName);
  });

  // Update tab pane visibility
  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.remove("active");
  });

  const activePane = document.getElementById(`view-${tabName}`);
  if (activePane) {
    activePane.classList.add("active");
  }

  // Update page header title
  const titles = {
    overview: "Overview",
    posts: "LinkedIn Job Posts",
    recruiters: "Recruiters & Talent Leads",
    campaigns: "Email Campaigns & Supervised Approvals",
    settings: "Settings & Email Templates",
    logs: "Audit Logs & Delivery History"
  };
  document.getElementById("current-page-title").innerText = titles[tabName] || "Dashboard";

  // Load relevant data for view
  if (tabName === "overview") {
    loadDashboardStats();
    loadSearchHistory();
    loadEmailLogsOverview();
  } else if (tabName === "posts") {
    loadPosts();
  } else if (tabName === "recruiters") {
    loadRecruiters();
  } else if (tabName === "campaigns") {
    loadCampaigns();
  } else if (tabName === "settings") {
    loadSettings();
  } else if (tabName === "logs") {
    loadAllAuditLogs();
  }
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
  // Global Run Pipeline Now button
  const triggerBtn = document.getElementById("btn-trigger-pipeline");
  triggerBtn.addEventListener("click", () => triggerSearchPipeline());

  // Top refresh button
  document.getElementById("btn-refresh-data").addEventListener("click", () => {
    loadSystemStatus();
    loadDashboardStats();
    switchTab(currentTab);
    showToast("Dashboard data refreshed", "info");
  });

  // Post keyword pills
  document.querySelectorAll("#posts-keyword-filters .pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#posts-keyword-filters .pill-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPostKeyword = btn.getAttribute("data-kw");
      loadPosts();
    });
  });

  // Post filters & search
  document.getElementById("filter-posts-24h").addEventListener("change", () => loadPosts());
  document.getElementById("filter-posts-us").addEventListener("change", () => loadPosts());
  
  let postSearchTimeout;
  document.getElementById("posts-search-input").addEventListener("input", () => {
    clearTimeout(postSearchTimeout);
    postSearchTimeout = setTimeout(() => loadPosts(), 300);
  });

  // Recruiters search & validation filter
  let recruiterSearchTimeout;
  document.getElementById("recruiters-search-input").addEventListener("input", () => {
    clearTimeout(recruiterSearchTimeout);
    recruiterSearchTimeout = setTimeout(() => loadRecruiters(), 300);
  });

  document.getElementById("filter-recruiter-validation").addEventListener("change", () => loadRecruiters());

  // Generate All Drafts button
  document.getElementById("btn-generate-all-drafts").addEventListener("click", () => generateAllDrafts());

  // Add Test Post modal triggers
  document.getElementById("btn-add-test-post").addEventListener("click", () => openAddPostModal());
  document.getElementById("modal-close-add-post").addEventListener("click", () => closeAddPostModal());
  document.getElementById("btn-cancel-add-post").addEventListener("click", () => closeAddPostModal());
  document.getElementById("btn-submit-add-post").addEventListener("click", () => submitAddPost());

  // Review & Edit Email modal buttons
  document.getElementById("modal-close-review").addEventListener("click", () => closeReviewModal());
  document.getElementById("btn-modal-save").addEventListener("click", () => saveEmailEdits());
  document.getElementById("btn-modal-approve").addEventListener("click", () => approveCurrentEmail());
  document.getElementById("btn-modal-send").addEventListener("click", () => sendCurrentEmail());
  document.getElementById("btn-modal-reject").addEventListener("click", () => rejectCurrentEmail());

  // Settings Save button
  document.getElementById("btn-save-settings").addEventListener("click", () => saveSettings());

  // Keyword tags input on Enter
  const kwInput = document.getElementById("setting-new-keyword-input");
  kwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = kwInput.value.trim().replace(",", "");
      if (val && !searchKeywordsList.includes(val)) {
        searchKeywordsList.push(val);
        renderKeywordTags();
        kwInput.value = "";
      }
    }
  });

  // Automation toggle switch label
  const autoSwitch = document.getElementById("setting-automation-enabled");
  autoSwitch.addEventListener("change", () => {
    const lbl = document.getElementById("setting-automation-label");
    lbl.innerText = autoSwitch.checked ? "Automated background searches ACTIVE" : "Automated background searches DISABLED";
  });

  // Refresh logs button
  document.getElementById("btn-refresh-logs").addEventListener("click", () => {
    loadAllAuditLogs();
    showToast("Audit logs updated", "info");
  });
}

// ==================== SYSTEM & STATS ====================
async function loadSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/system/status`);
    if (!res.ok) throw new Error("Status API returned " + res.status);
    const data = await res.json();

    document.getElementById("sidebar-provider-label").innerText = `Provider: ${data.linkedin_mode}`;
    document.getElementById("top-linkedin-pill").innerText = `LinkedIn: ${data.linkedin_mode.includes("Mock") ? "Mock Mode" : "Official API"}`;
    document.getElementById("top-gmail-pill").innerText = data.gmail_mode.includes("OAuth") ? "Gmail: OAuth 2.0" : "Gmail: Sandbox Mode";

    const descLi = document.getElementById("setting-linkedin-desc");
    if (descLi) descLi.innerText = `${data.linkedin_mode} (Authorized C2C Search Provider)`;

    const descGmail = document.getElementById("setting-gmail-desc");
    if (descGmail) descGmail.innerText = `${data.gmail_mode}`;

    const banner = document.getElementById("backend-connection-banner");
    if (banner && window.location.port !== "8000") {
      banner.style.display = "flex";
      banner.innerHTML = `
        <span>✓ <strong>Live Server Connected to Backend:</strong> Communicating with FastAPI on <a href="http://127.0.0.1:8000" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">http://127.0.0.1:8000</a>.</span>
        <a href="http://127.0.0.1:8000" target="_blank" class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 11px;">Open Port 8000 ↗</a>
      `;
    }
  } catch (err) {
    console.error("Error loading system status:", err);
    const banner = document.getElementById("backend-connection-banner");
    if (banner) {
      banner.style.display = "flex";
      banner.style.background = "#fff3cd";
      banner.style.color = "#856404";
      banner.style.borderBottom = "1px solid #ffeeba";
      banner.innerHTML = `
        <span>⚠️ <strong>Backend Not Detected:</strong> Please run <code>python run.py</code> in your project directory to start the FastAPI server, then open <strong><a href="http://127.0.0.1:8000" style="color: #533f03; text-decoration: underline;">http://127.0.0.1:8000</a></strong>!</span>
      `;
    }
  }
}

async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`);
    if (!res.ok) return;
    const stats = await res.json();

    document.getElementById("stat-total-posts").innerText = stats.total_posts;
    document.getElementById("stat-posts-24h").innerText = stats.posts_24h;
    document.getElementById("stat-us-posts").innerText = stats.us_posts;
    document.getElementById("stat-total-recruiters").innerText = stats.total_recruiters;
    document.getElementById("stat-valid-emails").innerText = stats.valid_emails;
    document.getElementById("stat-pending-approval").innerText = stats.pending_approval;
    document.getElementById("stat-sent-emails").innerText = stats.sent_emails;

    // Badges
    document.getElementById("sidebar-pending-badge").innerText = stats.pending_approval;
    document.getElementById("count-sub-pending").innerText = stats.pending_approval;
  } catch (err) {
    console.error("Error loading dashboard stats:", err);
  }
}

// ==================== PIPELINE EXECUTION ====================
async function triggerSearchPipeline() {
  const btn = document.getElementById("btn-trigger-pipeline");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Running Pipeline...`;
  btn.disabled = true;

  try {
    showToast("Starting LinkedIn search across all target keywords...", "info");
    const res = await fetch(`${API_BASE}/api/search/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error("Pipeline run failed on backend.");
    }

    const data = await res.json();
    const summary = data.search_summary;
    const drafts = data.drafts_summary;

    showToast(
      `Pipeline Finished: ${summary.total_posts_saved} new posts saved, ${summary.total_recruiters_found} recruiters found, ${drafts.drafts_created} drafts created!`,
      "success"
    );

    // Refresh views
    loadDashboardStats();
    loadSearchHistory();
    loadEmailLogsOverview();
    if (currentTab === "posts") loadPosts();
    if (currentTab === "recruiters") loadRecruiters();
    if (currentTab === "campaigns") loadCampaigns();
  } catch (err) {
    console.error("Error triggering search pipeline:", err);
    showToast(`Error running pipeline: ${err.message}`, "error");
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// ==================== OVERVIEW HISTORY & LOGS ====================
async function loadSearchHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/search/history?limit=6`);
    if (!res.ok) return;
    const history = await res.json();
    const tbody = document.getElementById("overview-search-history-tbody");

    if (!history || history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No search history yet. Click "Run Pipeline Now".</td></tr>`;
      return;
    }

    tbody.innerHTML = history.map(item => `
      <tr>
        <td><strong>${escapeHtml(item.keyword)}</strong></td>
        <td><span class="badge badge-info">${item.posts_found}</span></td>
        <td><span class="badge badge-success">${item.posts_saved}</span></td>
        <td><span class="badge badge-purple">${item.recruiters_found}</span></td>
        <td class="text-muted">${formatRelativeTime(item.search_timestamp)}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error loading search history:", err);
  }
}

async function loadEmailLogsOverview() {
  try {
    const res = await fetch(`${API_BASE}/api/emails/logs?limit=5`);
    if (!res.ok) return;
    const logs = await res.json();
    const feed = document.getElementById("overview-email-logs-feed");

    if (!logs || logs.length === 0) {
      feed.innerHTML = `<div class="text-muted text-center py-4">No recent email logs recorded.</div>`;
      return;
    }

    feed.innerHTML = logs.map(l => `
      <div class="feed-item ${l.action}">
        <div class="feed-content">
          <div class="feed-title">
            <span class="badge ${getLogBadgeClass(l.action)}">${l.action}</span>
            ${escapeHtml(l.recipient_email)}
          </div>
          <div class="text-muted mt-1">${escapeHtml(l.details)}</div>
          <div class="feed-time mt-1">${formatRelativeTime(l.timestamp)}</div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading email logs feed:", err);
  }
}

// ==================== POSTS VIEW ====================
async function loadPosts() {
  const container = document.getElementById("posts-container");
  container.innerHTML = `<div class="loading-spinner-box">Loading LinkedIn posts...</div>`;

  const kw = currentPostKeyword;
  const is24h = document.getElementById("filter-posts-24h").checked;
  const isUS = document.getElementById("filter-posts-us").checked;
  const search = document.getElementById("posts-search-input").value.trim();

  let url = `${API_BASE}/api/posts?limit=100`;
  if (kw && kw !== "all") url += `&keyword=${encodeURIComponent(kw)}`;
  if (is24h) url += `&is_within_24h=true`;
  if (isUS) url += `&is_us_based=true`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load posts.");
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="loading-spinner-box">
          <p>No LinkedIn posts matched your selected filter criteria.</p>
          <button class="btn btn-primary btn-sm mt-3" onclick="triggerSearchPipeline()">Run LinkedIn Pipeline</button>
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="post-card">
        <div class="post-card-header">
          <div class="post-author-box">
            <div class="author-avatar">${getInitials(post.author_name)}</div>
            <div>
              <div class="author-name">${escapeHtml(post.author_name)}</div>
              <div class="author-company">${escapeHtml(post.company_name || "Verified LinkedIn Post")}</div>
            </div>
          </div>
          <div class="post-meta-badges">
            <span class="badge badge-purple">${escapeHtml(post.keyword)}</span>
            ${post.is_within_24h ? `<span class="badge badge-success">✓ Published <24h</span>` : `<span class="badge badge-warning">Older (>24h)</span>`}
            ${post.is_us_based ? `<span class="badge badge-info">🇺🇸 ${escapeHtml(post.detected_location || "US Based")}</span>` : `<span class="badge badge-danger">Non-US Location</span>`}
          </div>
        </div>

        <div class="post-content-body">${escapeHtml(post.content)}</div>

        <div class="post-card-footer">
          <div>
            <strong>Published:</strong> ${new Date(post.publication_date).toLocaleString()} 
            <span class="text-muted">(${formatRelativeTime(post.publication_date)})</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="${post.post_url}" target="_blank" class="btn btn-outline btn-sm">
              View on LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading posts:", err);
    container.innerHTML = `<div class="loading-spinner-box text-muted">Failed to load posts: ${err.message}</div>`;
  }
}

// ==================== RECRUITERS VIEW ====================
async function loadRecruiters() {
  const tbody = document.getElementById("recruiters-tbody");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading recruiters...</td></tr>`;

  const search = document.getElementById("recruiters-search-input").value.trim();
  const validationStatus = document.getElementById("filter-recruiter-validation").value;

  let url = `${API_BASE}/api/recruiters?limit=100`;
  if (validationStatus && validationStatus !== "ALL") url += `&validation_status=${validationStatus}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load recruiters");
    const recruiters = await res.json();

    if (!recruiters || recruiters.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No recruiters found matching query. Click "Run Pipeline Now".</td></tr>`;
      return;
    }

    tbody.innerHTML = recruiters.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.name)}</strong></td>
        <td>
          <a href="mailto:${r.email}" style="color: var(--primary); text-decoration: none;">
            ${escapeHtml(r.email)}
          </a>
        </td>
        <td>${escapeHtml(r.company || "N/A")}</td>
        <td>${escapeHtml(r.job_title || "IT Specialist")}</td>
        <td>${escapeHtml(r.location || "USA")}</td>
        <td><span class="badge badge-outline">${escapeHtml(r.job_type)}</span></td>
        <td>
          <span class="badge ${getValidationBadgeClass(r.email_validation_status)}">
            ${r.email_validation_status}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="generateDraftForRecruiter(${r.id})">
            Draft Email
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error loading recruiters:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Error: ${err.message}</td></tr>`;
  }
}

async function generateAllDrafts() {
  try {
    showToast("Generating email drafts for all eligible recruiters...", "info");
    const res = await fetch(`${API_BASE}/api/emails/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!res.ok) throw new Error("Failed to generate drafts.");
    const data = await res.json();
    showToast(data.message, "success");
    loadDashboardStats();
  } catch (err) {
    console.error("Error generating drafts:", err);
    showToast(`Error: ${err.message}`, "error");
  }
}

async function generateDraftForRecruiter(recruiterId) {
  try {
    const res = await fetch(`${API_BASE}/api/emails/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recruiter_id: recruiterId })
    });
    if (!res.ok) throw new Error("Could not draft email");
    const data = await res.json();
    showToast(data.message, "success");
    loadDashboardStats();
    if (data.campaign_id) {
      switchTab("campaigns");
    }
  } catch (err) {
    console.error("Error drafting email:", err);
    showToast(`Error: ${err.message}`, "error");
  }
}

// ==================== CAMPAIGNS & APPROVALS ====================
async function loadCampaigns() {
  const container = document.getElementById("campaigns-container");
  container.innerHTML = `<div class="loading-spinner-box">Loading email campaigns...</div>`;

  let url = `${API_BASE}/api/emails/campaigns?limit=100`;
  if (currentCampaignSubtab && currentCampaignSubtab !== "ALL") {
    url += `&status=${currentCampaignSubtab}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load campaigns.");
    const campaigns = await res.json();

    // Update counts
    loadDashboardStats();

    if (!campaigns || campaigns.length === 0) {
      container.innerHTML = `
        <div class="loading-spinner-box">
          <p>No email campaigns in <strong>${currentCampaignSubtab.replace("_", " ")}</strong> state.</p>
          <button class="btn btn-outline btn-sm mt-3" onclick="generateAllDrafts()">Generate New Drafts</button>
        </div>
      `;
      return;
    }

    container.innerHTML = campaigns.map(c => `
      <div class="campaign-card">
        <div class="campaign-card-header">
          <div>
            <div class="campaign-recipient-title">To: ${escapeHtml(c.recipient_name)} &lt;${escapeHtml(c.recipient_email)}&gt;</div>
            <div class="campaign-subject-line">Subject: ${escapeHtml(c.subject)}</div>
          </div>
          <div>
            <span class="badge ${getCampaignBadgeClass(c.status)}">${c.status.replace("_", " ")}</span>
          </div>
        </div>

        <div style="font-size: 12px; color: var(--text-muted);">
          Generated: ${new Date(c.generated_at).toLocaleString()}
          ${c.approved_at ? ` | Approved: ${new Date(c.approved_at).toLocaleString()}` : ""}
          ${c.sent_at ? ` | Sent: ${new Date(c.sent_at).toLocaleString()}` : ""}
        </div>

        <div class="campaign-actions-row">
          <button class="btn btn-outline btn-sm" onclick="openReviewModal(${c.id})">
            🔍 Review & Edit
          </button>

          <div style="display: flex; gap: 8px;">
            ${c.status === "PENDING_APPROVAL" ? `
              <button class="btn btn-success btn-sm" onclick="approveCampaign(${c.id})">
                ✓ Approve
              </button>
              <button class="btn btn-primary btn-sm" onclick="sendCampaign(${c.id})">
                🚀 Approve & Send
              </button>
            ` : ""}

            ${c.status === "APPROVED" ? `
              <button class="btn btn-primary btn-sm" onclick="sendCampaign(${c.id})">
                🚀 Send Email Now
              </button>
            ` : ""}

            ${c.status === "SENT" ? `
              <span class="badge badge-success">✓ Sent via Gmail</span>
            ` : ""}
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading campaigns:", err);
    container.innerHTML = `<div class="loading-spinner-box text-muted">Error: ${err.message}</div>`;
  }
}

async function approveCampaign(id) {
  try {
    const res = await fetch(`${API_BASE}/api/emails/${id}/approve`, { method: "POST" });
    if (!res.ok) throw new Error("Approval failed");
    showToast(`Campaign #${id} approved successfully!`, "success");
    loadCampaigns();
    loadDashboardStats();
  } catch (err) {
    showToast(`Error approving email: ${err.message}`, "error");
  }
}

async function sendCampaign(id) {
  try {
    showToast(`Transmitting email #${id} via Gmail integration...`, "info");
    const res = await fetch(`${API_BASE}/api/emails/${id}/send`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Email transmission failed");
    }

    showToast(`Email #${id} sent successfully! [Mode: ${data.mode}]`, "success");
    loadCampaigns();
    loadDashboardStats();
    loadEmailLogsOverview();
  } catch (err) {
    showToast(`Delivery Error: ${err.message}`, "error");
  }
}

// ==================== REVIEW & EDIT MODAL ====================
let activeEditingCampaign = null;

async function openReviewModal(campaignId) {
  try {
    const res = await fetch(`${API_BASE}/api/emails/${campaignId}`);
    if (!res.ok) throw new Error("Could not retrieve campaign details");
    const campaign = await res.json();
    activeEditingCampaign = campaign;

    document.getElementById("edit-campaign-id").value = campaign.id;
    document.getElementById("edit-recipient-name").value = campaign.recipient_name;
    document.getElementById("edit-recipient-email").value = campaign.recipient_email;
    document.getElementById("edit-subject").value = campaign.subject;
    document.getElementById("edit-email-body").value = campaign.body;

    // Reset modal tabs to code view
    document.querySelectorAll(".modal-tabs .modal-tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('.modal-tabs .modal-tab-btn[data-modaltab="code"]').classList.add("active");
    document.getElementById("modal-tab-code-view").style.display = "block";
    document.getElementById("modal-tab-preview-view").style.display = "none";

    document.getElementById("modal-review-email").classList.add("active");
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

function closeReviewModal() {
  document.getElementById("modal-review-email").classList.remove("active");
  activeEditingCampaign = null;
}

async function saveEmailEdits() {
  if (!activeEditingCampaign) return;
  const id = activeEditingCampaign.id;

  const payload = {
    recipient_name: document.getElementById("edit-recipient-name").value.trim(),
    recipient_email: document.getElementById("edit-recipient-email").value.trim(),
    subject: document.getElementById("edit-subject").value.trim(),
    body: document.getElementById("edit-email-body").value
  };

  try {
    const res = await fetch(`${API_BASE}/api/emails/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save changes");
    showToast("Email draft changes saved successfully", "success");
    closeReviewModal();
    loadCampaigns();
  } catch (err) {
    showToast(`Error saving edits: ${err.message}`, "error");
  }
}

async function approveCurrentEmail() {
  if (!activeEditingCampaign) return;
  await saveEmailEdits();
  await approveCampaign(activeEditingCampaign.id);
  closeReviewModal();
}

async function sendCurrentEmail() {
  if (!activeEditingCampaign) return;
  await saveEmailEdits();
  await sendCampaign(activeEditingCampaign.id);
  closeReviewModal();
}

async function rejectCurrentEmail() {
  if (!activeEditingCampaign) return;
  const id = activeEditingCampaign.id;
  try {
    const res = await fetch(`${API_BASE}/api/emails/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Rejected via admin review modal" })
    });
    if (!res.ok) throw new Error("Failed to reject draft");
    showToast(`Draft #${id} rejected and cancelled.`, "info");
    closeReviewModal();
    loadCampaigns();
    loadDashboardStats();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// ==================== ADD TEST POST MODAL ====================
function openAddPostModal() {
  document.getElementById("new-post-url").value = `https://www.linkedin.com/feed/update/urn:li:share:${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  document.getElementById("new-post-author").value = "Sarah Connor";
  document.getElementById("new-post-company").value = "Apex Global Staffing";
  document.getElementById("new-post-location").value = "Dallas, TX, USA";
  document.getElementById("new-post-content").value = 
`🚀 Hot C2C Opening! We are hiring a Senior Java Developer with Spring Boot and AWS in Dallas, TX. 
Duration: 12 months. Rate: $85/hr on C2C. 
Please reach out with resume to sarah.connor@apexglobalstaffing.com. 
Thanks & Regards,
Sarah Connor`;
  document.getElementById("modal-add-post").classList.add("active");
}

function closeAddPostModal() {
  document.getElementById("modal-add-post").classList.remove("active");
}

async function submitAddPost() {
  const url = document.getElementById("new-post-url").value.trim();
  const author = document.getElementById("new-post-author").value.trim();
  const company = document.getElementById("new-post-company").value.trim();
  const keyword = document.getElementById("new-post-keyword").value;
  const location = document.getElementById("new-post-location").value.trim();
  const timing = document.getElementById("new-post-timing").value;
  const content = document.getElementById("new-post-content").value.trim();

  if (!url || !author || !content) {
    showToast("Please fill in Post URL, Author Name, and Post Content.", "error");
    return;
  }

  // Calculate publication date
  const now = new Date();
  if (timing === "5h") {
    now.setHours(now.getHours() - 5);
  } else if (timing === "30h") {
    now.setHours(now.getHours() - 30);
  }

  const payload = {
    post_url: url,
    author_name: author,
    company_name: company,
    keyword: keyword,
    detected_location: location,
    publication_date: now.toISOString(),
    content: content
  };

  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Failed to create post");
    }

    const post = await res.json();
    showToast(`Test Post added! 24h: ${post.is_within_24h}, US: ${post.is_us_based}`, "success");
    closeAddPostModal();
    loadDashboardStats();
    loadPosts();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// ==================== SETTINGS & TEMPLATES ====================
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) return;
    const settings = await res.json();

    // Automation toggle
    const autoEnabled = String(settings.automation_enabled).toLowerCase() === "true";
    const autoSwitch = document.getElementById("setting-automation-enabled");
    autoSwitch.checked = autoEnabled;
    document.getElementById("setting-automation-label").innerText = autoEnabled 
      ? "Automated background searches ACTIVE" 
      : "Automated background searches DISABLED";

    // Frequency
    if (settings.search_frequency_minutes) {
      document.getElementById("setting-search-frequency").value = settings.search_frequency_minutes;
    }

    // Keywords
    if (settings.search_keywords) {
      searchKeywordsList = Array.isArray(settings.search_keywords) 
        ? settings.search_keywords 
        : JSON.parse(settings.search_keywords);
      renderKeywordTags();
    }

    // Profile
    if (settings.company_name) document.getElementById("setting-company-name").value = settings.company_name;
    if (settings.sender_name) document.getElementById("setting-sender-name").value = settings.sender_name;
    if (settings.sender_title) document.getElementById("setting-sender-title").value = settings.sender_title;
    if (settings.sender_email) document.getElementById("setting-sender-email").value = settings.sender_email;
    if (settings.sender_phone) document.getElementById("setting-sender-phone").value = settings.sender_phone;
    if (settings.email_subject_template) document.getElementById("setting-email-subject").value = settings.email_subject_template;

    // Load template preview in iframe
    renderLiveTemplatePreview();
  } catch (err) {
    console.error("Error loading settings:", err);
  }
}

function renderKeywordTags() {
  const container = document.getElementById("keywords-tags-container");
  container.innerHTML = searchKeywordsList.map((kw, idx) => `
    <span class="tag-item">
      ${escapeHtml(kw)}
      <span class="tag-remove" onclick="removeKeywordTag(${idx})">&times;</span>
    </span>
  `).join("");
}

function removeKeywordTag(idx) {
  searchKeywordsList.splice(idx, 1);
  renderKeywordTags();
}

async function renderLiveTemplatePreview() {
  const senderCompany = document.getElementById("setting-company-name").value;
  const senderName = document.getElementById("setting-sender-name").value;
  const senderTitle = document.getElementById("setting-sender-title").value;
  const senderEmail = document.getElementById("setting-sender-email").value;
  const senderPhone = document.getElementById("setting-sender-phone").value;

  // Render a sample email in iframe
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #334155; }
        .card { background: #fff; max-width: 580px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .hdr { background: #0f172a; color: #fff; padding: 20px 24px; }
        .body { padding: 24px; font-size: 14px; line-height: 1.6; }
        .highlight { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; }
        .cta { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; margin-top: 10px; }
        .ftr { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="hdr">
          <h2 style="margin: 0; font-size: 18px;">Candidate Availability & Bench Partnership</h2>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Reference: Senior Java Developer (C2C)</div>
        </div>
        <div class="body">
          <p>Hi Sarah,</p>
          <p>I came across your recent LinkedIn update regarding the opening for <strong>Senior Java Developer</strong> at <strong>Apex Systems</strong>.</p>
          <div class="highlight">
            <div><strong>Position:</strong> Senior Java Developer</div>
            <div><strong>Engagement:</strong> C2C / Corp-to-Corp</div>
            <div><strong>Availability:</strong> Immediate client interview</div>
          </div>
          <p>At <strong>${escapeHtml(senderCompany)}</strong>, we have pre-vetted consultants on our bench ready for immediate deployment.</p>
          <a class="cta" href="mailto:${escapeHtml(senderEmail)}">Reply to Request Profiles</a>
        </div>
        <div class="ftr">
          <strong>${escapeHtml(senderName)}</strong> | ${escapeHtml(senderTitle)}<br>
          ${escapeHtml(senderCompany)} | Email: ${escapeHtml(senderEmail)} | Phone: ${escapeHtml(senderPhone)}
        </div>
      </div>
    </body>
    </html>
  `;
  document.getElementById("template-preview-iframe").srcdoc = sampleHtml;
}

async function saveSettings() {
  const payload = {
    automation_enabled: document.getElementById("setting-automation-enabled").checked ? "true" : "false",
    search_frequency_minutes: document.getElementById("setting-search-frequency").value,
    search_keywords: searchKeywordsList,
    company_name: document.getElementById("setting-company-name").value.trim(),
    sender_name: document.getElementById("setting-sender-name").value.trim(),
    sender_title: document.getElementById("setting-sender-title").value.trim(),
    sender_email: document.getElementById("setting-sender-email").value.trim(),
    sender_phone: document.getElementById("setting-sender-phone").value.trim(),
    email_subject_template: document.getElementById("setting-email-subject").value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save settings");
    showToast("Application settings updated successfully!", "success");
    renderLiveTemplatePreview();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// ==================== AUDIT LOGS VIEW ====================
async function loadAllAuditLogs() {
  const tbody = document.getElementById("logs-tbody");
  tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Loading audit trail...</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/api/emails/logs?limit=100`);
    if (!res.ok) throw new Error("Failed to load logs");
    const logs = await res.json();

    if (!logs || logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No audit logs found.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td class="text-muted">${new Date(l.timestamp).toLocaleString()}</td>
        <td><strong>${escapeHtml(l.recipient_email)}</strong></td>
        <td><span class="badge ${getLogBadgeClass(l.action)}">${l.action}</span></td>
        <td><span class="badge ${l.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}">${l.status}</span></td>
        <td>${escapeHtml(l.details)}</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Error: ${err.message}</td></tr>`;
  }
}

// ==================== HELPER FUNCTIONS ====================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name) {
  if (!name) return "TA";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function getValidationBadgeClass(status) {
  if (status === "VALID") return "badge-success";
  if (status === "RISKY") return "badge-warning";
  return "badge-danger";
}

function getCampaignBadgeClass(status) {
  if (status === "APPROVED") return "badge-primary";
  if (status === "SENT") return "badge-success";
  if (status === "PENDING_APPROVAL") return "badge-warning";
  if (status === "FAILED") return "badge-danger";
  return "badge-outline";
}

function getLogBadgeClass(action) {
  if (action === "SENT") return "badge-success";
  if (action === "APPROVED") return "badge-primary";
  if (action === "GENERATED") return "badge-info";
  if (action === "SEND_FAILED") return "badge-danger";
  return "badge-outline";
}

