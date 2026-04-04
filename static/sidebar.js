(function () {
  const body = document.body;
  if (!body) return;
  const SIDEBAR_COMPACT_BREAKPOINT = 1100;

  const page = body.dataset.sidebarPage;
  if (!page || document.getElementById("sidebar")) return;

  const subtitle = escapeHtml(body.dataset.sidebarSubtitle || "Navigation");
  const isDashboard = page === "dashboard";
  const isInterventions = page === "interventions" || page === "detail";
  const isForm = page === "form";
  const isCalendar = page === "calendar";
  const isAdmin = page === "admin";
  const isRapport = page === "rapport";
  const isInterventionGroupActive = isInterventions || isForm;
  // Ouvert uniquement si on est sur une page interventions/form/detail — jamais mémorisé
  const isInterventionGroupOpen = isInterventionGroupActive;

  body.insertAdjacentHTML("afterbegin", `
<button class="sidebar-toggle" onclick="toggleSidebar()" id="sidebarToggle" aria-label="Menu">
  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
</button>
<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
<nav class="sidebar" id="sidebar">
  <div class="sidebar-brand">
    <div class="sidebar-logo">
      <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    </div>
    <div class="sidebar-brand-text">
      <div class="sidebar-brand-title">Suivi Interventions</div>
      <div class="sidebar-brand-sub" id="sidebarPageLabel">${subtitle}</div>
    </div>
  </div>

  <div class="sidebar-nav">

    <!-- ── SECTION : VUE GÉNÉRALE ── -->
    <div class="sidebar-section-label">Vue générale</div>

    <a href="/" class="sidebar-link${isDashboard ? " active" : ""}">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
      </svg>
      Tableau de bord
    </a>

    <a href="/calendar" class="sidebar-link${isCalendar ? " active" : ""}">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      Calendrier
    </a>

    <!-- ── SECTION : INTERVENTIONS ── -->
    <div class="sidebar-section-label" style="margin-top:10px">Interventions</div>

    <div class="sidebar-group${isInterventionGroupActive ? " sidebar-group-active" : ""}${isInterventionGroupOpen ? " is-open" : ""}" data-sidebar-group="interventions">
      <button
        type="button"
        class="sidebar-group-trigger${isInterventionGroupActive ? " active" : ""}"
        aria-expanded="${isInterventionGroupOpen ? "true" : "false"}"
        aria-controls="sidebar-submenu-interventions"
      >
        <span class="sidebar-group-label">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Interventions
        </span>
        <svg class="sidebar-group-chevron" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="sidebar-submenu" id="sidebar-submenu-interventions">
        <a href="/interventions" class="sidebar-sublink${isInterventions ? " active" : ""}">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <rect x="4" y="5" width="16" height="14" rx="2"></rect>
            <line x1="8" y1="9" x2="16" y2="9"></line>
            <line x1="8" y1="13" x2="16" y2="13"></line>
            <line x1="8" y1="17" x2="13" y2="17"></line>
          </svg>
          Voir la liste
        </a>
        <a href="/form" class="sidebar-sublink${isForm ? " active" : ""}">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouvelle intervention
        </a>
      </div>
    </div>

    <!-- ── SECTION : RAPPORTS ── -->
    <div class="sidebar-section-label" style="margin-top:10px">Rapports</div>

    <a href="/rapport-prestataire" class="sidebar-link${isRapport ? " active" : ""}">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      Rapport prestataire
    </a>

    <!-- ── SECTION : COMPTE ── -->
    <div class="sidebar-section-label" style="margin-top:10px">Compte</div>

    ${isAdmin ? `
    <a href="/admin" class="sidebar-link active" id="sidebarAdminLink">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <span id="sidebarAdminLinkText">Administration</span>
    </a>
    ` : `
    <a href="/admin" class="sidebar-link" id="btnAdmin" style="display:none">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      Mon profil
    </a>
    <a href="/admin" class="sidebar-link" id="btnProfil" style="display:none">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"></circle>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>
      </svg>
      Mon profil
    </a>
    `}

    <button class="sidebar-link danger" onclick="seDeconnecter()">
      <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      D&eacute;connexion
    </button>
  </div>

  <div class="sidebar-footer">
    <div class="sidebar-user">
      <div class="sidebar-avatar" id="sidebarAvatar">?</div>
      <div class="sidebar-user-info">
        <div class="sidebar-username" id="sidebarUsername">&mdash;</div>
        <div class="sidebar-role" id="sidebarRole">&mdash;</div>
      </div>
    </div>
  </div>
  </nav>`);

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const toggleButton = document.getElementById("sidebarToggle");
  const isCompactViewport = function () {
    return window.innerWidth <= SIDEBAR_COMPACT_BREAKPOINT;
  };

  const setSidebarOpen = function (isOpen) {
    if (!sidebar || !overlay) return;
    const shouldOpen = Boolean(isOpen) && isCompactViewport();
    sidebar.classList.toggle("open", shouldOpen);
    overlay.classList.toggle("open", shouldOpen);
    body.classList.toggle("sidebar-mobile-open", shouldOpen);
    if (toggleButton) {
      toggleButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      toggleButton.setAttribute("aria-label", shouldOpen ? "Fermer le menu" : "Ouvrir le menu");
    }
  };

  window.toggleSidebar = function (forceState) {
    if (!isCompactViewport()) {
      setSidebarOpen(false);
      return;
    }
    if (typeof forceState === "boolean") {
      setSidebarOpen(forceState);
      return;
    }
    setSidebarOpen(!sidebar.classList.contains("open"));
  };

  // Nettoyer l'ancienne clé de mémorisation si elle existe
  localStorage.removeItem("sidebar_group_interventions_open");

  setSidebarOpen(false);
  let compactViewportActuel = isCompactViewport();
  const synchroniserModeSidebar = function () {
    const compact = isCompactViewport();
    if (compact !== compactViewportActuel || !compact) {
      setSidebarOpen(false);
    }
    compactViewportActuel = compact;
  };

  window.addEventListener("resize", synchroniserModeSidebar, { passive: true });
  window.addEventListener("orientationchange", synchroniserModeSidebar);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setSidebarOpen(false);
  });

  document.querySelectorAll("#sidebar a, #sidebar button.sidebar-link.danger").forEach(function (link) {
    if (link.classList.contains("sidebar-group-trigger")) return;
    link.addEventListener("click", function () {
      setSidebarOpen(false);
    });
  });

  const interventionGroup = document.querySelector('[data-sidebar-group="interventions"]');
  if (interventionGroup) {
    const trigger = interventionGroup.querySelector(".sidebar-group-trigger");

    const setInterventionGroupState = function (isOpen) {
      interventionGroup.classList.toggle("is-open", isOpen);
      if (trigger) trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    // Ouvert seulement si on est sur une page interventions/form/detail
    setInterventionGroupState(isInterventionGroupOpen);

    if (trigger) {
      trigger.addEventListener("click", function () {
        setInterventionGroupState(!interventionGroup.classList.contains("is-open"));
      });
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
})();
