/* =========================================================
   AgriMind Design Prototype — navigation
   Switches between mobile screens and admin screens.
   ========================================================= */

(function () {
  "use strict";

  // Mobile screens present in the phone canvas
  var mobileScreens = [
    "login", "forgot", "register", "profile", "password", "home", "farms", "farm-detail", "trash",
    "crops", "crop-detail", "records", "weather", "ai", "history", "alerts",
    "alert-detail", "alert-history"
  ];

  // Admin screens present in the admin canvas
  var adminScreens = ["admin-login", "admin-dash", "admin-users", "admin-user-detail", "admin-kb", "admin-announce", "admin-audit"];

  /** Show a mobile screen by name; hide the rest. */
  function showMobileScreen(name) {
    mobileScreens.forEach(function (s) {
      var el = document.querySelector('[data-screen="' + s + '"]');
      if (el) el.classList.toggle("is-active", s === name);
    });
    updateQuicklaunch(name);
    updateTabbar(name);
    updateBrandHeader(name);
  }

  /** Show an admin screen by name; hide the rest. */
  function showAdminScreen(name) {
    adminScreens.forEach(function (s) {
      var el = document.querySelector('[data-screen="' + s + '"]');
      if (el) el.classList.toggle("is-active", s === name);
    });
    // The sign-in screen owns the whole canvas, so the command strip hides.
    var canvas = document.querySelector(".admin-canvas");
    if (canvas) canvas.classList.toggle("is-login", name === "admin-login");
    setQuicklaunch(false);
  }

  // ---- Quick action hub (docked above the tab bar) ----
  // Screens where the farmer benefits from one-thumb quick actions.
  var farmerScreens = [
    "home", "farms", "farm-detail", "trash", "crops", "crop-detail", "records",
    "weather", "ai", "history", "alerts", "alert-detail", "alert-history",
    "profile", "password"
  ];
  var quicklaunch = document.querySelector("[data-qa-root]");

  function setQuicklaunch(open) {
    if (!quicklaunch) return;
    quicklaunch.classList.toggle("is-open", open);
    var btn = quicklaunch.querySelector("[data-qa-toggle]");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function updateQuicklaunch(name) {
    if (!quicklaunch) return;
    var on = farmerScreens.indexOf(name) !== -1;
    quicklaunch.classList.toggle("is-visible", on);
    if (!on) setQuicklaunch(false);
  }

  // ---- Brand header ----
  // The header carries the Online chip and the signed-in avatar, so every
  // signed-out screen hides it; everything after sign-in keeps it.
  var brandHeader = document.querySelector(".ph-brand");
  var signedOutScreens = ["login", "forgot", "register"];

  function updateBrandHeader(name) {
    if (!brandHeader) return;
    brandHeader.classList.toggle("is-hidden", signedOutScreens.indexOf(name) !== -1);
  }

  // ---- Bottom tab bar ----
  // One persistent nav for the whole app. Each screen maps to the tab that
  // owns its section, so a drill-down (e.g. Crop Details) keeps its parent tab
  // lit instead of clearing the nav — the farmer never loses their place.
  var tabbar = document.querySelector("[data-tabbar]");
  var tabForScreen = {
    home: "home",
    farms: "farms", "farm-detail": "farms", trash: "farms",
    crops: "farms", "crop-detail": "farms", records: "farms",
    weather: "weather",
    ai: "ai", history: "ai",
    alerts: "alerts", "alert-detail": "alerts", "alert-history": "alerts"
    // profile + password are reached from the brand avatar, not a tab, so they
    // show the bar with nothing highlighted rather than lying about location.
  };
  // Screens where the bar is shown at all — signed out, there is nowhere to go.
  var tabbarScreens = farmerScreens;

  function updateTabbar(name) {
    if (!tabbar) return;
    tabbar.classList.toggle("is-visible", tabbarScreens.indexOf(name) !== -1);
    var active = tabForScreen[name] || null;
    tabbar.querySelectorAll("[data-tab]").forEach(function (tab) {
      var isActive = tab.getAttribute("data-tab") === active;
      tab.classList.toggle("is-active", isActive);
      // aria-current tells a screen reader which tab is the current page.
      if (isActive) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
  }

  /** Open a modal overlay by id. */
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("is-open");
  }

  /** Fill the shared delete-confirmation modal with context. */
  function setDeleteConfirm(title, name, message) {
    var t = document.getElementById("deleteTitle");
    var n = document.getElementById("deleteName");
    var m = document.getElementById("deleteMessage");
    if (t) t.textContent = title;
    if (n) n.textContent = name;
    if (m) m.innerHTML = "Deleting <b>" + name + "</b> " + message;
  }

  // ---- Farm record sheet (Module 7) ----
  // The stored activity_type never reaches the screen: each chip carries the enum
  // in data-record-type and shows a display verb. The date defaults to today, so
  // logging the common case is "tap a verb, tap Save".
  function setRecordType(type) {
    document.querySelectorAll(".rec-chip[data-record-type]").forEach(function (chip) {
      var on = chip.getAttribute("data-record-type") === type;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  // Local date parts, not toISOString(): a UTC offset would shift the day.
  function isoFromDate(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function todayISO() { return isoFromDate(new Date()); }

  function openRecordModal(sourceRow) {
    var title = document.getElementById("recordModalTitle");
    if (title) title.textContent = sourceRow ? "Edit Record" : "Add Record";
    setRecordType(sourceRow ? (sourceRow.getAttribute("data-record-type") || "Planting") : "Planting");
    // Editing carries the row's own date, amount and unit across; adding starts
    // from today, so the common case is still "tap a verb, tap Save".
    var date = document.querySelector("[data-record-date]");
    var qty = document.querySelector("[data-record-qty]");
    var amount = "";
    var unit = "kg";
    if (sourceRow) {
      var stamp = sourceRow.querySelector("small");
      var parsed = stamp ? new Date(stamp.textContent.trim()) : null;
      if (date) date.value = parsed && !isNaN(parsed.getTime()) ? isoFromDate(parsed) : todayISO();
      var detail = sourceRow.querySelector(".rec-body > span");
      var text = detail ? detail.textContent.trim() : "";
      var num = /^\s*([\d.]+)/.exec(text);
      amount = num ? num[1] : "";
      if (/sacks/i.test(text)) unit = "sacks";
      else if (/\bL\b/.test(text)) unit = "L";
    } else if (date) {
      date.value = todayISO();
    }
    if (qty) qty.value = amount;
    document.querySelectorAll(".unit-chip[data-unit]").forEach(function (u) {
      var on = u.getAttribute("data-unit") === unit;
      u.classList.toggle("is-active", on);
      u.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var noteField = document.querySelector("[data-note-field]");
    var noteToggle = document.querySelector("[data-note-toggle]");
    if (noteField) noteField.classList.add("is-hidden");
    if (noteToggle) {
      noteToggle.setAttribute("aria-expanded", "false");
      noteToggle.textContent = "+ Add a note";
    }
    openModal("recordModal");
  }

  /** Close all modal overlays. */
  function closeModals() {
    document.querySelectorAll(".modal-overlay").forEach(function (m) {
      m.classList.remove("is-open");
    });
  }

  // ---- Leaflet OSM maps (Add Farm modal + Farm Details pin) ----
  var farmMaps = {};    // containerId -> Leaflet map instance

  // Open the Add Farm modal with a location-pin map (2.1 · GPS/map location).
  function openFarmModal() {
    openModal("farmModal");
    setTimeout(function () {
      initPinMap("farmMap", [9.94, 124.27], "📍 Farm location", 9);
    }, 250);
  }

  // Plain OSM pin map — Farm Details (2.6) location map.
  function initPinMap(containerId, center, label, zoom) {
    var el = document.getElementById(containerId);
    if (!el || typeof L === "undefined") return;
    if (farmMaps[containerId]) {
      setTimeout(function () { farmMaps[containerId].invalidateSize(); }, 300);
      return;
    }
    var mapInstance = L.map(el).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(mapInstance);
    L.marker(center).addTo(mapInstance).bindPopup(label).openPopup();
    farmMaps[containerId] = mapInstance;
  }

  /** Handle any element with a data-nav attribute. */
  function navigate(target, el) {
    if (!target) return;
    setQuicklaunch(false);

    if (target === "farms-add" || target === "farm-edit") { openFarmModal(); return; }
    if (target === "crops-add" || target === "crop-edit") { openModal("cropModal"); return; }
    if (target === "farm-delete") {
      setDeleteConfirm("Delete Farm?", "North Farm", "Deleting this farm will also soft-delete all its crops. You can restore it later from the Trash.");
      openModal("deleteModal"); return;
    }
    if (target === "crop-delete") {
      setDeleteConfirm("Delete Crop?", "Rice", "This crop will be soft-deleted and hidden from the active list. You can restore it later from the Trash.");
      openModal("deleteModal"); return;
    }
    if (target === "record-add" || target === "record-edit") {
      var row = target === "record-edit" && el ? el.closest(".rec-item") : null;
      openRecordModal(row);
      return;
    }
    if (target === "record-delete") { showMobileScreen("records"); return; }
    if (target === "restore") { showMobileScreen("farms"); return; }

    // User Management (9.7 / 9.8 / 9.9): create/edit user modal + delete confirmation.
    if (target === "user-add" || target === "user-edit") {
      var isAdd = (target === "user-add");
      document.getElementById("userModalTitle").textContent = isAdd ? "Create User" : "Edit User";
      var pwLabel = document.getElementById("userPwLabel");
      if (pwLabel) pwLabel.textContent = isAdd ? "Password" : "Reset Password";
      var uSave = document.getElementById("userModalSave");
      if (uSave) uSave.textContent = isAdd ? "Save User" : "Save Changes";
      openModal("userModal"); return;
    }
    if (target === "user-delete") {
      var uName = document.getElementById("userDeleteName");
      if (uName) uName.textContent = (el && el.getAttribute("data-farmer")) || "this account";
      openModal("userDeleteModal"); return;
    }

    // Knowledge Base (10.x): add/edit article modal + delete confirmation.
    if (target === "kb-add") {
      document.getElementById("kbModalTitle").textContent = "New Article";
      resetArticleForm();
      openModal("kbModal"); return;
    }
    if (target === "kb-edit") {
      document.getElementById("kbModalTitle").textContent = "Edit Article";
      fillArticleForm(el ? el.closest("[data-kb-card]") : null);
      openModal("kbModal"); return;
    }
    if (target === "kb-delete") {
      var kbName = document.getElementById("kbDeleteName");
      if (kbName) kbName.textContent = (el && el.getAttribute("data-article")) || "this article";
      openModal("kbDeleteModal"); return;
    }

    // Crop Types (admin-managed master lookup, lives in Knowledge Base).
    if (target === "croptype-manage") { openModal("croptypeModal"); return; }
    if (target === "croptype-edit") {
      var ctTitle = document.getElementById("croptypeEditTitle");
      if (ctTitle) ctTitle.textContent = (el && el.getAttribute("data-croptype")) ? "Edit Crop Type" : "New Crop Type";
      openModal("croptypeEditModal"); return;
    }
    if (target === "croptype-delete") { openModal("croptypeDeleteModal"); return; }

    // Announcements (11.x): add/edit bulletin modal + delete confirmation.
    if (target === "announce-add" || target === "announce-edit") {
      document.getElementById("announceModalTitle").textContent = (target === "announce-add") ? "New Announcement" : "Edit Announcement";
      openModal("announceModal"); return;
    }
    if (target === "announce-delete") {
      var aName = document.getElementById("announceDeleteName");
      if (aName) aName.textContent = (el && el.getAttribute("data-announce")) || "this bulletin";
      openModal("announceDeleteModal"); return;
    }

    // Profile view ↔ edit toggle (1.5): show the edit form, hide the view card.
    if (target === "profile-edit") {
      var pv = document.getElementById("profileView");
      var pe = document.getElementById("profileEdit");
      if (pv) pv.hidden = true;
      if (pe) pe.hidden = false;
      return;
    }
    // Saving the profile returns to the read-only view.
    if (target === "profile-save") {
      var pv2 = document.getElementById("profileView");
      var pe2 = document.getElementById("profileEdit");
      if (pv2) pv2.hidden = false;
      if (pe2) pe2.hidden = true;
      return;
    }

    // Logout returns to the login screen (1.3). Inside the admin canvas that is
    // the Admin sign-in screen; on the phone it is the farmer login.
    if (target === "logout") {
      if (el && el.closest(".admin-canvas")) showAdminScreen("admin-login");
      else showMobileScreen("login");
      return;
    }

    // Farmer record detail (9.3): carry the clicked farmer's name into the screen.
    if (target === "admin-user-detail") {
      var fname = document.querySelector("[data-farmer-name]");
      if (fname && el) fname.textContent = el.getAttribute("data-farmer") || "Farmer";
      showAdminScreen("admin-user-detail");
      return;
    }

    if (mobileScreens.indexOf(target) !== -1) {
      showMobileScreen(target);
      if (target === "farm-detail") {
        // Each farm has its own crops; switch context to the tapped farm (2.x).
        var fm = el ? el.getAttribute("data-farm") : "north";
        switchFarm(fm === "south" ? "south" : "north");
        var farmPins = {
          north: [9.94, 124.27, "📍 North Farm"],
          south: [10.02, 124.05, "📍 South Farm"]
        };
        var pin = farmPins[fm] || farmPins.north;
        initPinMap("farmDetailMap", [pin[0], pin[1]], pin[2], 11); // 2.6 pin map
      }
    } else if (adminScreens.indexOf(target) !== -1) {
      showAdminScreen(target);
    }
  }

  /** Switch the Weather screen between farms (4.8 Farm Weather Selector). */
  function switchFarm(farm) {
    // Show only that farm's weather panels (class-based — works with display:grid).
    document.querySelectorAll("[data-farm-panel]").forEach(function (panel) {
      panel.classList.toggle("is-hidden", panel.getAttribute("data-farm-panel") !== farm);
    });
    // Keep every farm switcher in sync with the selected farm.
    document.querySelectorAll("[data-farm-select]").forEach(function (sel) {
      sel.value = farm;
    });
    // Keep any on-screen farm labels in sync with the selected farm.
    var farmNames = { north: "📍 North Farm", south: "📍 South Farm" };
    if (farmNames[farm]) {
      document.querySelectorAll("[data-farm-name]").forEach(function (el) {
        el.textContent = farmNames[farm];
      });
    }
    // Keep screen kickers (e.g. the Crops screen) in sync too.
    var kickerNames = { north: "North Farm", south: "South Farm" };
    if (kickerNames[farm]) {
      document.querySelectorAll("[data-farm-kicker]").forEach(function (el) {
        el.textContent = kickerNames[farm];
      });
    }
    // Farm detail screen: title + location caption follow the selected farm.
    var farmTitles = { north: "North Farm", south: "South Farm" };
    var farmLocs = { north: "Bien Unido, Bohol", south: "Ubay, Bohol" };
    if (farmTitles[farm]) {
      document.querySelectorAll("[data-farm-title]").forEach(function (el) {
        el.textContent = farmTitles[farm];
      });
      document.querySelectorAll("[data-farm-loc]").forEach(function (el) {
        el.textContent = farmLocs[farm];
      });
    }
    // Home screen: alert count + CTA subtext describe the selected farm.
    syncHomeSummary(farm);
    // AI screen: rebuild the crop list + advice for the selected farm.
    syncAICropSelect(farm);
    // Crops list: switching farm re-shows all cards, so reset the risk filter to "All".
    document.querySelectorAll("[data-crop-filter]").forEach(function (b) {
      var isAll = b.getAttribute("data-crop-filter") === "all";
      b.classList.toggle("is-active", isAll);
      b.setAttribute("aria-selected", isAll ? "true" : "false");
    });
    var cropEmpty = document.querySelector("[data-crop-empty]");
    if (cropEmpty) cropEmpty.classList.add("is-hidden");
  }

  // ---- Home overview summary (per farm) ----
  // The alert count must describe the farm currently in scope, otherwise the
  // badge contradicts the alerts summary and the cards below it.
  var homeSummary = window.AGRIMIND_DATA.homeSummary;

  function syncHomeSummary(farm) {
    var s = homeSummary[farm];
    if (!s) return;
    document.querySelectorAll("[data-alert-count]").forEach(function (el) {
      el.textContent = s.alerts;
    });
    // The tab-bar badge counts the same alerts, so it follows the same farm.
    document.querySelectorAll("[data-tab-badge]").forEach(function (el) {
      el.textContent = s.alerts;
      el.classList.toggle("is-hidden", !s.alerts);
    });
    // Keep the Alerts tab's accessible name in sync (badge is aria-hidden, so
    // the count would otherwise be invisible to screen readers).
    var alertsTab = document.querySelector("[data-tab-alerts]");
    if (alertsTab) {
      alertsTab.setAttribute("aria-label", s.alerts
        ? "Alerts, " + s.alerts + " unread"
        : "Alerts");
    }
  }

  // ---- AI advice per farm & crop (recommendations are generated per crop) ----
  // Six recommendation types per crop: Planting, Irrigation, Fertilizer,
  // Harvest, Weather Risk, General Advice — the six types in docs/modules-and-features.md Module 5 · 5.2.
  var AI_TYPES = [
    { key: "planting",   ico: "🌱", label: "PLANTING" },
    { key: "irrigation", ico: "💧", label: "IRRIGATION" },
    { key: "fertilizer", ico: "🌿", label: "FERTILIZER" },
    { key: "harvest",    ico: "🌾", label: "HARVEST" },
    { key: "weather",    ico: "⚠️", label: "WEATHER RISK" },
    { key: "general",    ico: "💡", label: "GENERAL ADVICE" }
  ];

  // Display rank for the advice stack: the hazard leads, then water, planting,
  // nutrients, harvest and general. Deterministic, so the same weather always
  // puts the same recommendation on top; the other five collapse to one line.
  var AI_RANK = ["weather", "irrigation", "planting", "fertilizer", "harvest", "general"];
  // Shared forecast per farm (weather is farm-wide per project overview).
  var weatherContext = window.AGRIMIND_DATA.weatherContext;
  var aiCrops = window.AGRIMIND_DATA.aiCrops;
  var aiData = window.AGRIMIND_DATA.aiData;

  function syncAICropSelect(farm) {
    var sel = document.querySelector("[data-crop-select]");
    if (!sel || !aiCrops[farm]) return;
    var previous = sel.value;
    sel.innerHTML = "";
    aiCrops[farm].forEach(function (crop) {
      var opt = document.createElement("option");
      opt.value = crop;
      opt.textContent = crop;
      sel.appendChild(opt);
    });
    if (aiCrops[farm].indexOf(previous) !== -1) sel.value = previous;
    renderAI(farm, sel.value);
  }

  /** Escape text before it reaches the Why? panel. */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /**
   * Farmer-facing "Why this advice" (docs 5.11): the same facts the rule layer
   * used, under plain labels — the weather it saw, the crop context, the facts
   * that matched, and the knowledge-base source when the row carries one.
   */
  function renderWhy(card, ctx) {
    var host = card.querySelector("[data-ai-why]");
    if (!host) return;
    var facts = String(ctx.rec.reason || "")
      .split(" · ")
      .filter(function (f) { return f.trim(); });
    var factsHtml = facts.length
      ? facts.map(function (f) { return "• " + esc(f); }).join("<br>")
      : "General agronomy — no specific guideline matched.";
    var rows = [
      ["Weather", esc(weatherContext[ctx.farm] || "—")],
      ["Your crop", esc(ctx.crop + " · " + ctx.d.stage + " · " + ctx.d.riskText + " risk")],
      ["What we matched", factsHtml]
    ];
    if (ctx.rec.source) rows.push(["Source", esc(ctx.rec.source)]);
    host.innerHTML = rows.map(function (row) {
      return '<div class="ai-why-row"><span class="ai-why-k">' + row[0] +
             '</span><span class="ai-why-v">' + row[1] + "</span></div>";
    }).join("");
  }

  function renderAI(farm, crop) {
    var d = aiData[farm] && aiData[farm][crop];
    if (!d) return;
    var set = function (sel, val) { var el = document.querySelector(sel); if (el) el.textContent = val; };

    set("[data-ai-emoji]", d.emoji);
    set("[data-ai-crop]", d.emoji + " " + crop + " · " + d.stage);
    var risk = document.querySelector("[data-ai-risk]");
    if (risk) {
      risk.className = "risk-tag risk-" + d.risk;
      risk.textContent = d.riskText + " risk";
    }
    var health = document.querySelector("[data-ai-health]");
    if (health) {
      var hClass = d.health === "ok" ? "risk-low" : d.health === "warn" ? "risk-moderate" : "risk-high";
      health.className = "risk-tag " + hClass;
      health.textContent = d.healthText || "Healthy";
    }

    // Farm-wide weather context line + six per-type recommendation cards.
    // One leads (AI_RANK); the others render as collapsed summary rows that
    // open in place, so every recommendation on the crop stays reachable.
    set("[data-ai-weather]", weatherContext[farm] || "");
    var primaryKey = AI_RANK.filter(function (k) { return d.recs[k]; })[0];
    AI_TYPES.forEach(function (t) {
      var card = document.querySelector('[data-ai-card="' + t.key + '"]');
      var rec = d.recs[t.key];
      if (!card || !rec) return;
      var isPrimary = t.key === primaryKey;
      card.style.order = String(AI_RANK.indexOf(t.key));
      card.classList.toggle("is-primary", isPrimary);
      card.classList.toggle("is-secondary", !isPrimary);
      card.classList.remove("is-expanded");
      card.classList.remove("is-open");
      var head = card.querySelector("[data-ai-expand]");
      if (head) {
        head.disabled = isPrimary;
        head.setAttribute("aria-expanded", isPrimary ? "true" : "false");
      }
      var q = card.querySelector("[data-ai-label]");
      if (q) q.textContent = "🤖 " + t.ico + " " + t.label;
      var tx = card.querySelector("[data-ai-text]");
      if (tx) tx.textContent = rec.text;
      var c = card.querySelector("[data-ai-conf]");
      if (c) c.textContent = rec.conf + "%";
      var tm = card.querySelector("[data-ai-time]");
      if (tm) tm.textContent = rec.time;
      renderWhy(card, { farm: farm, crop: crop, d: d, rec: rec });
      // Doc 5.3: the bar tracks the score, and the "Limited data" notice + amber card
      // treatment appear only below 60% — so both must follow the crop being shown.
      var bar = card.querySelector(".conf-bar i");
      if (bar) bar.style.setProperty("--c", rec.conf + "%");
      card.classList.toggle("is-low", rec.conf < 60);
      var disc = card.querySelector("[data-ai-disc]");
      if (disc) disc.hidden = rec.conf >= 60;
    });

    // Harvest & yield prediction (Module 3.12 / 5.12).
    set("[data-ai-harvest-emoji]", d.emoji);
    set("[data-ai-harvest-date]", d.harvest.date);
    set("[data-ai-harvest-note]", d.harvest.note);
    // Grain and bulb crops are sold by the 50 kg sack, so give the number a
    // unit a farmer actually trades in (docs 5.12 keeps t/ha as the estimate).
    set("[data-ai-harvest-yield]", d.harvest.yield + (d.harvest.sacks ? " · " + d.harvest.sacks : ""));
  }

  // Global click handler (event delegation) for data-nav elements.
  document.addEventListener("click", function (e) {
    var close = e.target.closest("[data-close]");
    if (close) { closeModals(); return; }

    // Sign in with Google (Module 1 · 1.9). The prototype has no OAuth round-trip, so the
    // button lands on the signed-in home screen, exactly like a successful password sign-in.
    // A real build hands the account chooser to Google and returns a JWT pair.
    var googleBtn = e.target.closest("[data-google-signin]");
    if (googleBtn) { showMobileScreen("home"); return; }

    // Sign up with Google (Module 1 · 1.9). Same OAuth round-trip in a real build; on the
    // register screen a first sign-in *creates* the account, so it also lands on the home
    // screen, exactly like a completed Create Account.
    var googleSignup = e.target.closest("[data-google-signup]");
    if (googleSignup) { showMobileScreen("home"); return; }

    // Auth: show/hide password (login + register).
    var pwToggle = e.target.closest("[data-pw-toggle]");
    if (pwToggle) {
      var wrap = pwToggle.closest(".fi-wrap");
      var input = wrap && wrap.querySelector("[data-pw]");
      if (input) {
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        pwToggle.textContent = show ? "🙈" : "👁️";
        pwToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
      }
      return;
    }

    // Auth: segmented language picker (register).
    var langOpt = e.target.closest(".lang-opt");
    if (langOpt) {
      var group = langOpt.closest(".lang-choice");
      if (group) {
        group.querySelectorAll(".lang-opt").forEach(function (o) {
          var on = o === langOpt;
          o.classList.toggle("is-active", on);
          o.setAttribute("aria-checked", on ? "true" : "false");
        });
      }
      return;
    }

    // Audit log export (12.7): show a brief toast.
    var exportBtn = e.target.closest("[data-export-audit]");
    if (exportBtn) {
      var toast = document.getElementById("auditToast");
      if (toast) {
        toast.classList.add("is-open");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () { toast.classList.remove("is-open"); }, 2400);
      }
      return;
    }

    // Farm record sheet — activity verb, unit, and the optional note row.
    var recChip = e.target.closest(".rec-chip[data-record-type]");
    if (recChip) { setRecordType(recChip.getAttribute("data-record-type")); return; }
    var unitChip = e.target.closest(".unit-chip[data-unit]");
    if (unitChip) {
      document.querySelectorAll(".unit-chip[data-unit]").forEach(function (u) {
        var on = u === unitChip;
        u.classList.toggle("is-active", on);
        u.setAttribute("aria-pressed", on ? "true" : "false");
      });
      return;
    }
    var noteToggle = e.target.closest("[data-note-toggle]");
    if (noteToggle) {
      var noteField = document.querySelector("[data-note-field]");
      var show = noteField && noteField.classList.contains("is-hidden");
      if (noteField) noteField.classList.toggle("is-hidden", !show);
      noteToggle.setAttribute("aria-expanded", show ? "true" : "false");
      noteToggle.textContent = show ? "Hide note" : "+ Add a note";
      return;
    }

    // AI advice row — expand a collapsed secondary recommendation in place.
    // The primary card is always open, and a collapsed row is tappable anywhere
    // (not just its 20px title), which matters one-handed in the field.
    var aiHead = e.target.closest("[data-ai-expand]");
    var aiCard = aiHead ? aiHead.closest(".ai-recommend")
                        : e.target.closest(".ai-recommend.is-secondary:not(.is-expanded)");
    if (aiCard && aiCard.classList.contains("is-secondary")) {
      aiHead = aiHead || aiCard.querySelector("[data-ai-expand]");
      var expanded = !aiCard.classList.contains("is-expanded");
      aiCard.classList.toggle("is-expanded", expanded);
      if (!expanded) aiCard.classList.remove("is-open");
      if (aiHead) aiHead.setAttribute("aria-expanded", expanded ? "true" : "false");
      return;
    }

    // AI "Why?" — expand/collapse the reasoning trace on a recommendation card.
    var whyBtn = e.target.closest("[data-toggle-reason]");
    if (whyBtn) {
      var card = whyBtn.closest(".ai-recommend");
      if (card) card.classList.toggle("is-open");
      return;
    }

    // Weather: manual refresh (4.6) — spin the icon and stamp a fresh sync time.
    var wxRefresh = e.target.closest("[data-wx-refresh]");
    if (wxRefresh) {
      wxRefresh.classList.add("is-spinning");
      setTimeout(function () { wxRefresh.classList.remove("is-spinning"); }, 800);
      var now = new Date();
      var hh = now.getHours(), mm = now.getMinutes();
      var ampm = hh >= 12 ? "PM" : "AM";
      var h12 = ((hh + 11) % 12) + 1;
      var t = h12 + ":" + (mm < 10 ? "0" + mm : mm) + " " + ampm;
      var exp12 = ((hh + 12) % 12) + 1; // +1 hour cache expiry
      var expAmpm = (hh + 1) >= 12 && (hh + 1) < 24 ? "PM" : "AM";
      var expT = exp12 + ":" + (mm < 10 ? "0" + mm : mm) + " " + expAmpm;
      document.querySelectorAll("[data-wx-synced]").forEach(function (el) {
        el.textContent = "Last synced " + t + " · Cache expires " + expT;
      });
      return;
    }

    // Mark an alert as read (6.10): add a "read" state to the card.
    var readBtn = e.target.closest(".alert-read");
    if (readBtn) {
      var card = readBtn.closest(".alert-card");
      if (card) {
        card.classList.add("is-read");
        readBtn.setAttribute("data-read", "true");
      }
      return;
    }

    // Activate / Deactivate a farmer (9.4): toggle the row's status badge + switch.
    var userToggle = e.target.closest("[data-user-toggle]");
    if (userToggle) {
      var row = userToggle.closest("tr");
      var badge = row && row.querySelector("[data-status-badge]");
      if (badge) {
        var active = badge.classList.contains("badge-green");
        if (active) {
          badge.classList.remove("badge-green");
          badge.classList.add("badge-gray");
          badge.textContent = "Inactive";
          userToggle.classList.add("is-off");
          userToggle.title = "Activate";
        } else {
          badge.classList.remove("badge-gray");
          badge.classList.add("badge-green");
          badge.textContent = "Active";
          userToggle.classList.remove("is-off");
          userToggle.title = "Deactivate";
        }
      }
      return;
    }

    // Role Visibility (9.6): switch between the farmers and admins tables.
    var roleTab = e.target.closest("[data-role-view]");
    if (roleTab) {
      document.querySelectorAll("[data-role-view]").forEach(function (t) {
        t.classList.toggle("is-active", t === roleTab);
      });
      var view = roleTab.getAttribute("data-role-view");
      var fv = document.querySelector("[data-farmers-view]");
      var av = document.querySelector("[data-admins-view]");
      if (fv) fv.classList.toggle("is-hidden", view !== "farmers");
      if (av) av.classList.toggle("is-hidden", view !== "admins");
      return;
    }

    // Crops list: filter cards by risk level (All / Low / Moderate / High).
    var cropFilter = e.target.closest("[data-crop-filter]");
    if (cropFilter) {
      var group = cropFilter.parentElement;
      group.querySelectorAll("[data-crop-filter]").forEach(function (b) {
        var on = b === cropFilter;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      var risk = cropFilter.getAttribute("data-crop-filter");
      var activeFarm = document.querySelector("[data-farm-select]");
      var farm = activeFarm ? activeFarm.value : "north";
      var shown = 0;
      document.querySelectorAll(".crop-card[data-crop-risk]").forEach(function (card) {
        var sameFarm = card.getAttribute("data-farm-panel") === farm;
        var riskMatch = risk === "all" || card.getAttribute("data-crop-risk") === risk;
        var visible = sameFarm && riskMatch;
        card.classList.toggle("is-hidden", !visible);
        if (visible) shown++;
      });
      // A risk level with no crops on this farm must say so rather than show a blank list.
      var empty = document.querySelector("[data-crop-empty]");
      if (empty) empty.classList.toggle("is-hidden", shown > 0);
      return;
    }

    // Farmer record status toggle (9.4 on the detail screen).
    var fdToggle = e.target.closest("[data-fd-toggle]");
    if (fdToggle) {
      var fdStatus = document.querySelector("[data-fd-status]");
      if (fdStatus) {
        var fdActive = fdStatus.classList.contains("badge-green");
        if (fdActive) {
          fdStatus.classList.remove("badge-green");
          fdStatus.classList.add("badge-gray");
          fdStatus.textContent = "Inactive";
          fdToggle.textContent = "Activate";
        } else {
          fdStatus.classList.remove("badge-gray");
          fdStatus.classList.add("badge-green");
          fdStatus.textContent = "Active";
          fdToggle.textContent = "Deactivate";
        }
      }
      return;
    }

    var el = e.target.closest("[data-nav]");
    if (el) {
      e.preventDefault();
      navigate(el.getAttribute("data-nav"), el);
    }

    // Knowledge Base rule editor (10.9 – 10.13).
    if (handleRuleEditorClick(e)) return;

    // Knowledge Base filter pills (10.4): crop-type chips.
    var pill = e.target.closest(".kb-pill[data-kb-crop]");
    if (pill) {
      document.querySelectorAll(".kb-pill[data-kb-crop]").forEach(function (p) {
        p.classList.toggle("is-active", p === pill);
      });
      filterKB();
      return;
    }

    // Gazette filter pills (11.4): announcement categories.
    var announcePill = e.target.closest("[data-announce-pill]");
    if (announcePill) {
      document.querySelectorAll("[data-announce-pill]").forEach(function (p) {
        p.classList.toggle("is-active", p === announcePill);
      });
      filterGazette();
      return;
    }

    // Bottom tab bar: tapping a tab navigates to its screen.
    var tab = e.target.closest("[data-tab]");
    if (tab) {
      navigate(tab.getAttribute("data-tab"));
    }
  });

  // ---- Knowledge Base rule editor (docs/modules-and-features.md Module 10) ----
  // action_key → template_key → category, verbatim from the documented catalog.
  // The template is derived from the action, never typed (10.10), and an action
  // only appears for its own category (kb_action_matches_category).
  var ACTIONS = [
    { key: "SKIP_IRRIGATION", template: "irrigation.skip_rain", category: "Irrigation" },
    { key: "IRRIGATE_NOW", template: "irrigation.dry_spell", category: "Irrigation" },
    { key: "DRAIN_FIELD", template: "irrigation.drain_waterlog", category: "Irrigation" },
    { key: "DELAY_FERTILIZER", template: "fertilizer.delay_rain", category: "Fertilizer" },
    { key: "RESUME_FERTILIZER", template: "fertilizer.resume_favorable", category: "Fertilizer" },
    { key: "DELAY_PLANTING", template: "planting.delay_rain", category: "Planting" },
    { key: "PLANT_NOW", template: "planting.favorable_window", category: "Planting" },
    { key: "HARVEST_EARLY", template: "harvest.early_storm", category: "Harvest" },
    { key: "DELAY_HARVEST", template: "harvest.delay_rain", category: "Harvest" },
    { key: "SHADE_OR_MIST", template: "general.heat_stress", category: "General" },
    { key: "STAKE_OR_SUPPORT", template: "general.wind_support", category: "General" },
    { key: "MONITOR_AND_INSPECT", template: "general.monitor", category: "General" }
  ];

  // Growth stages are crop-type-specific (database-design.md §4). Rice and Tomato
  // sequences are documented; the remaining crop types keep the prototype's
  // generic list until GrowthStages rows exist for them.
  var STAGES = {
    Rice: ["Germination", "Seedling", "Vegetative", "Reproductive", "Mature"],
    Tomato: ["Seedling", "Vegetative", "Flowering", "Fruiting", "Mature"]
  };
  var DEFAULT_STAGES = ["Germination", "Seedling", "Vegetative", "Reproductive", "Mature"];

  // The five fixed categories are the rule-engine resolution key (10.3), so the
  // taxonomy count comes from the enum, not from whichever rows exist.
  var KB_CATEGORIES = ["Planting", "Irrigation", "Fertilizer", "Harvest", "General"];

  function isNum(v) { return typeof v === "number" && isFinite(v); }

  function stagesFor(crop) { return STAGES[crop] || DEFAULT_STAGES; }

  /** Stage scope options follow the chosen crop type (10.11 & 3.8). */
  function syncStageOptions() {
    var cropEl = document.querySelector("[data-kb-crop]");
    var stageEl = document.querySelector("[data-kb-stage]");
    if (!cropEl || !stageEl) return;
    var kept = stageEl.value;
    var stages = stagesFor(cropEl.value);
    stageEl.innerHTML = "";
    var all = document.createElement("option");
    all.value = "";
    all.textContent = "All stages";
    stageEl.appendChild(all);
    stages.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      stageEl.appendChild(opt);
    });
    stageEl.value = stages.indexOf(kept) !== -1 ? kept : "";
  }

  /** Mobile Add/Edit Crop modal stage dropdown follows the chosen crop type (3.8). */
  function syncModalCropStages() {
    var cropEl = document.querySelector("[data-modal-crop-type]");
    var stageEl = document.querySelector("[data-modal-crop-stage]");
    if (!cropEl || !stageEl) return;
    var kept = stageEl.value;
    var stages = stagesFor(cropEl.value);
    stageEl.innerHTML = "";
    stages.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      stageEl.appendChild(opt);
    });
    if (stages.indexOf(kept) !== -1) stageEl.value = kept;
  }

  // ---- Rule editor groups: one fieldset = one AND-group, OR-ed between (10.9) ----
  function ruleGroupEls() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-rule-groups] [data-rule-group]"));
  }

  /** Build one OR-group, seeded with a single condition row. */
  function makeRuleGroup() {
    var fs = document.createElement("fieldset");
    fs.className = "kb-rule-group";
    fs.setAttribute("data-rule-group", "");
    fs.innerHTML =
      "<legend>OR group · all of</legend>" +
      '<div class="kb-cond-list" data-cond-list></div>' +
      '<div class="kb-rule-group-foot">' +
        '<button class="btn btn-secondary btn-sm" type="button" data-cond-add>+ Add condition</button>' +
        '<button class="btn btn-secondary btn-sm kb-group-remove" type="button" data-group-remove>Remove group</button>' +
      "</div>";
    fs.querySelector("[data-cond-list]").appendChild(makeCondRow());
    return fs;
  }

  /** Legends stay accurate; a single remaining group cannot be removed. */
  function syncRuleGroups() {
    var groups = ruleGroupEls();
    groups.forEach(function (g, i) {
      var legend = g.querySelector("legend");
      if (legend) legend.textContent = i === 0 ? "Conditions · all of" : "OR group " + i + " · all of";
      var remove = g.querySelector("[data-group-remove]");
      if (remove) remove.hidden = groups.length < 2;
    });
  }

  function addRuleGroup() {
    var wrap = document.querySelector("[data-rule-groups]");
    if (!wrap) return;
    wrap.appendChild(makeRuleGroup());
    syncRuleGroups();
    syncSaveState();
  }

  function removeRuleGroup(group) {
    if (!group || ruleGroupEls().length < 2) return;
    group.parentNode.removeChild(group);
    syncRuleGroups();
    syncSaveState();
  }

  /** Rows → DNF (`[[...],[...]]`), the exact shape stored in KnowledgeBase.conditions. */
  function readRuleGroups() {
    return ruleGroupEls().map(function (g) {
      return Array.prototype.map.call(g.querySelectorAll("[data-cond-row]"), function (row) {
        var value = parseFloat(row.querySelector("[data-cond-value]").value);
        var cond = {
          metric: row.querySelector("[data-cond-metric]").value,
          operator: row.querySelector("[data-cond-op]").value,
          value: isFinite(value) ? value : null
        };
        if (cond.operator === "between") {
          var max = parseFloat(row.querySelector("[data-cond-max]").value);
          cond.value_max = isFinite(max) ? max : null;
        }
        return cond;
      });
    });
  }

  function ruleMetric(weather, metric) {
    if (metric === "rain_probability") return weather.rain;
    if (metric === "wind_speed") return weather.wind;
    if (metric === "temperature") return weather.temp;
    return weather.humidity;
  }

  function condMatches(cond, weather) {
    if (!isNum(cond.value)) return false;
    if (cond.operator === "between" && !isNum(cond.value_max)) return false;
    var actual = ruleMetric(weather, cond.metric);
    if (!isNum(actual)) return false;
    if (cond.operator === "gte") return actual >= cond.value;
    if (cond.operator === "lte") return actual <= cond.value;
    if (cond.operator === "between") return actual >= cond.value && actual <= cond.value_max;
    return false;
  }

  /** OR of ANDs: every row in one group must pass, any passing group matches. */
  function ruleMatches(groups, weather) {
    return groups.some(function (group) {
      return group.length > 0 && group.every(function (c) { return condMatches(c, weather); });
    });
  }

  function rowsComplete() {
    var rows = [].concat.apply([], readRuleGroups());
    if (!rows.length) return false;
    return rows.every(function (c) {
      if (!isNum(c.value)) return false;
      return c.operator !== "between" || isNum(c.value_max);
    });
  }

  /** kb_rule_complete: title + content required; a rule needs rows and an action_key. */
  function syncSaveState() {
    var save = document.querySelector("[data-kb-save]");
    if (!save) return;
    var title = document.querySelector("[data-kb-title]");
    var content = document.querySelector("[data-kb-content]");
    var body = document.querySelector(".kb-rule-body");
    var action = document.querySelector("[data-kb-action]");
    var open = body ? !body.hidden : false;
    var ok = !!(title && title.value.trim() && content && content.value.trim());
    if (open) ok = ok && !!(action && action.value) && rowsComplete();
    save.disabled = !ok;
  }

  /** Rule Preview / Test (10.13): evaluate the editor's DNF against sample weather. */
  function runRuleTest() {
    var out = document.querySelector("[data-preview-out]");
    if (!out) return;
    var action = document.querySelector("[data-kb-action]");
    var groups = readRuleGroups();
    var rows = [].concat.apply([], groups);
    if (!action || !action.value) {
      out.className = "kb-preview-out is-miss";
      out.textContent = "Choose an action first — conditions without an action_key are not a rule.";
      return;
    }
    if (!rows.length || rows.some(function (c) { return !isNum(c.value); })) {
      out.className = "kb-preview-out is-miss";
      out.textContent = "Every condition row needs a numeric value before it can be tested.";
      return;
    }
    var read = function (sel, fallback) {
      var el = document.querySelector(sel);
      var v = el ? parseFloat(el.value) : NaN;
      return isFinite(v) ? v : fallback;
    };
    var weather = {
      rain: read("[data-preview-rain]", 0),
      wind: read("[data-preview-wind]", 0),
      temp: read("[data-preview-temp]", 0),
      humidity: read("[data-preview-hum]", 0)
    };
    var hit = ruleMatches(groups, weather);
    var priority = document.querySelector("[data-kb-priority]");
    var stage = document.querySelector("[data-kb-stage]");
    var status = document.querySelector("[data-kb-status]");
    var parts = [action.value];
    if (priority && priority.value) parts.push("priority " + priority.value);
    if (stage && stage.value) parts.push(stage.value);
    var draft = status && status.value !== "Published" ? " Not evaluated until the row is Published." : "";
    out.className = "kb-preview-out " + (hit ? "is-match" : "is-miss");
    out.textContent = hit
      ? "Matches — " + parts.join(" · ") + " wins this sample weather." + draft
      : "No match — the lookup continues to the next Published rule by priority, then falls back to the 60% cap.";
  }

  /** Strip a leading icon so card text can seed a form field. */
  function plainText(el) {
    return el ? el.textContent.replace(/^[^A-Za-z0-9]+/, "").trim() : "";
  }

  function resetRuleEditor() {
    var wrap = document.querySelector("[data-rule-groups]");
    if (wrap) {
      ruleGroupEls().forEach(function (g, i) { if (i > 0) wrap.removeChild(g); });
      var list = wrap.querySelector("[data-cond-list]");
      if (list) {
        list.innerHTML = "";
        list.appendChild(makeCondRow());
      }
    }
    ["[data-kb-action]", "[data-kb-stage]", "[data-kb-template]"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.value = "";
    });
    var priority = document.querySelector("[data-kb-priority]");
    if (priority) priority.value = "100";
    var status = document.querySelector("[data-kb-status]");
    if (status) status.value = "Draft";
    var out = document.querySelector("[data-preview-out]");
    if (out) {
      out.className = "kb-preview-out";
      out.textContent = "Run the rule against sample weather before publishing.";
    }
    syncRuleGroups();
    syncSaveState();
  }

  function resetArticleForm() {
    ["[data-kb-title]", "[data-kb-content]", "[data-kb-ref]"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) el.value = "";
    });
    var crop = document.querySelector("[data-kb-crop]");
    if (crop) crop.value = "Rice";
    var cat = document.querySelector("[data-kb-category]");
    if (cat) cat.value = "Planting";
    syncStageOptions();
    syncRuleAction(cat ? cat.value : "Planting");
    resetRuleEditor();
    setRuleOpen(false);
  }

  /** Edit prefills the whole row — article fields and its stored DNF rule (10.5). */
  function fillArticleForm(card) {
    resetArticleForm();
    if (!card) return;
    var cropEl = document.querySelector("[data-kb-crop]");
    var catEl = document.querySelector("[data-kb-category]");
    var cropName = plainText(card.querySelector(".kb-crop"));
    if (cropEl && cropName) cropEl.value = cropName;
    if (catEl && card.getAttribute("data-kb-cat")) catEl.value = card.getAttribute("data-kb-cat");
    syncStageOptions();
    syncRuleAction(catEl ? catEl.value : "Planting");

    var title = document.querySelector("[data-kb-title]");
    if (title) title.value = (card.querySelector(".kb-card-title") || { textContent: "" }).textContent;
    var content = document.querySelector("[data-kb-content]");
    if (content) content.value = (card.querySelector(".kb-card-excerpt") || { textContent: "" }).textContent;
    var ref = document.querySelector("[data-kb-ref]");
    if (ref) ref.value = plainText(card.querySelector(".kb-card-ref"));
    var status = document.querySelector("[data-kb-status]");
    var badge = card.querySelector(".kb-status");
    if (status && badge) {
      status.value = badge.classList.contains("is-archived") ? "Archived"
        : badge.classList.contains("is-draft") ? "Draft" : "Published";
    }

    var rule = null;
    try { rule = JSON.parse(card.getAttribute("data-rule") || "null"); } catch (err) { rule = null; }
    if (!Array.isArray(rule) || !rule.length) { syncSaveState(); return; }

    var wrap = document.querySelector("[data-rule-groups]");
    if (!wrap) return;
    var firstList = wrap.querySelector("[data-cond-list]");
    firstList.innerHTML = "";
    (rule[0] || []).forEach(function () { firstList.appendChild(makeCondRow()); });
    rule.slice(1).forEach(function (group) {
      var fs = makeRuleGroup();
      var list = fs.querySelector("[data-cond-list]");
      list.innerHTML = "";
      group.forEach(function () { list.appendChild(makeCondRow()); });
      wrap.appendChild(fs);
    });

    var flat = [].concat.apply([], rule);
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-cond-row]"), function (row, i) {
      var c = flat[i];
      if (!c) return;
      row.querySelector("[data-cond-metric]").value = c.metric;
      row.querySelector("[data-cond-op]").value = c.operator;
      row.querySelector("[data-cond-value]").value = c.value;
      if (c.operator === "between") row.querySelector("[data-cond-max]").value = c.value_max;
      syncCondRow(row);
    });

    var action = document.querySelector("[data-kb-action]");
    if (action) action.value = card.getAttribute("data-rule-action") || "";
    var priority = document.querySelector("[data-kb-priority]");
    if (priority) priority.value = card.getAttribute("data-rule-priority") || "100";
    var stage = document.querySelector("[data-kb-stage]");
    if (stage) stage.value = card.getAttribute("data-rule-stage") || "";
    syncRuleTemplate();
    syncRuleGroups();
    setRuleOpen(true);
    syncSaveState();
  }

  /** KB figures are derived from the rendered rows, never typed twice. */
  function syncKBStats() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-kb-card]"));
    var withRule = cards.filter(function (c) { return c.hasAttribute("data-rule"); });
    var published = cards.filter(function (c) {
      var badge = c.querySelector(".kb-status");
      return !!badge && badge.classList.contains("is-published");
    });
    var crops = {};
    cards.forEach(function (c) { crops[c.getAttribute("data-kb-crop")] = true; });
    var set = function (sel, value) {
      var el = document.querySelector(sel);
      if (el) el.textContent = value;
    };
    set('[data-kb-stat="articles"]', cards.length);
    set('[data-kb-stat="crops"]', Object.keys(crops).length);
    set('[data-kb-stat="categories"]', KB_CATEGORIES.length);
    set('[data-kb-stat="published"]', published.length);
    set("[data-kb-rule-count]", withRule.length);
  }

  /** Build one condition row (metric × operator × value), matching the static row. */
  function makeCondRow() {
    var row = document.createElement("div");
    row.className = "kb-cond-row";
    row.setAttribute("data-cond-row", "");
    row.innerHTML =
      '<select data-cond-metric aria-label="Metric">' +
        '<option value="rain_probability">rain probability</option>' +
        '<option value="wind_speed">wind speed</option>' +
        '<option value="temperature">temperature</option>' +
        '<option value="humidity">humidity</option>' +
      '</select>' +
      '<select data-cond-op aria-label="Operator">' +
        '<option value="gte">\u2265</option>' +
        '<option value="lte">\u2264</option>' +
        '<option value="between">range</option>' +
      '</select>' +
      '<input type="number" data-cond-value placeholder="60" aria-label="Value" />' +
      '<input type="number" data-cond-max placeholder="max" aria-label="Maximum value" hidden />' +
      '<button class="btn-icon" type="button" data-cond-remove aria-label="Remove condition">\u2715</button>';
    return row;
  }

  /** Populate the action select for a category, and mirror the derived template. */
  function syncRuleAction(category) {
    var body = document.querySelector(".kb-rule-body");
    if (!body) return;
    var select = body.querySelector("[data-kb-action]");
    var template = body.querySelector("[data-kb-template]");
    if (!select) return;
    var kept = select.value;
    select.innerHTML = '<option value="">Choose an action\u2026</option>';
    ACTIONS.filter(function (a) { return a.category === category; }).forEach(function (a) {
      var opt = document.createElement("option");
      opt.value = a.key;
      opt.textContent = a.key;
      select.appendChild(opt);
    });
    // An action from another category must not survive a category change.
    var stillValid = Array.prototype.some.call(select.options, function (o) { return o.value === kept; });
    select.value = stillValid ? kept : "";
    syncRuleTemplate();
  }

  /** The template follows the chosen action and is never editable (10.10). */
  function syncRuleTemplate() {
    var body = document.querySelector(".kb-rule-body");
    if (!body) return;
    var select = body.querySelector("[data-kb-action]");
    var template = body.querySelector("[data-kb-template]");
    if (!select || !template) return;
    var hit = ACTIONS.filter(function (a) { return a.key === select.value; })[0];
    template.value = hit ? hit.template : "";
  }

  /** Show the max-value input only for the range operator. */
  function syncCondRow(row) {
    var op = row.querySelector("[data-cond-op]");
    var max = row.querySelector("[data-cond-max]");
    if (op && max) max.hidden = op.value !== "between";
  }

  /** Open/close the rule body; "+ Add Rule" carries the rule, clearing it removes it. */
  function setRuleOpen(open) {
    var body = document.querySelector(".kb-rule-body");
    var toggle = document.querySelector("[data-rule-toggle]");
    if (!body || !toggle) return;
    body.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Remove Rule" : "+ Add Rule";
    syncSaveState();
  }

  /** Rule editor interactions: gates the toggle only; changes keep working while open. */
  function handleRuleEditorClick(e) {
    var toggle = e.target.closest("[data-rule-toggle]");
    if (toggle) {
      var body = document.querySelector(".kb-rule-body");
      setRuleOpen(body ? body.hidden : true);
      return true;
    }
    if (e.target.closest("[data-group-add]")) {
      addRuleGroup();
      return true;
    }
    var groupRemove = e.target.closest("[data-group-remove]");
    if (groupRemove) {
      removeRuleGroup(groupRemove.closest("[data-rule-group]"));
      return true;
    }
    if (e.target.closest("[data-rule-test]")) {
      runRuleTest();
      return true;
    }
    var add = e.target.closest("[data-cond-add]");
    if (add) {
      var list = add.closest("fieldset").querySelector("[data-cond-list]");
      if (list) list.appendChild(makeCondRow());
      return true;
    }
    var remove = e.target.closest("[data-cond-remove]");
    if (remove) {
      var row = remove.closest("[data-cond-row]");
      var parent = row && row.parentNode;
      // A rule always keeps at least one condition row.
      if (parent && parent.querySelectorAll("[data-cond-row]").length > 1) parent.removeChild(row);
      return true;
    }
    return false;
  }

  // Category / operator changes inside the rule editor + mobile crop modal.
  document.addEventListener("change", function (e) {
    var modalCropSel = e.target.closest("[data-modal-crop-type]");
    if (modalCropSel) { syncModalCropStages(); return; }
    var cropSel = e.target.closest("[data-kb-crop]");
    if (cropSel) { syncStageOptions(); return; }
    var cat = e.target.closest("[data-kb-category]");
    if (cat) { syncRuleAction(cat.value); return; }
    var op = e.target.closest("[data-cond-op]");
    if (op) { syncCondRow(op.closest("[data-cond-row]")); return; }
    var action = e.target.closest("[data-kb-action]");
    if (action) { syncRuleTemplate(); syncSaveState(); return; }
    if (e.target.closest("[data-kb-priority]") || e.target.closest("[data-kb-status]")) syncSaveState();
  });

  // Knowledge Base (10.4/10.7): filter cards by crop, category, and search text.
  function filterKB() {
    var activePill = document.querySelector(".kb-pill[data-kb-crop].is-active");
    var crop = activePill ? activePill.getAttribute("data-kb-crop") : "all";
    var catSel = document.querySelector("[data-kb-cat]");
    var cat = catSel ? catSel.value : "all";
    var searchEl = document.querySelector("[data-kb-search]");
    var q = searchEl ? searchEl.value.trim().toLowerCase() : "";
    var visible = 0;

    document.querySelectorAll("[data-kb-card]").forEach(function (card) {
      var c = card.getAttribute("data-kb-crop");
      var k = card.getAttribute("data-kb-cat");
      var text = (card.textContent || "").toLowerCase();
      var show = (crop === "all" || c === crop) && (cat === "all" || k === cat) && (!q || text.indexOf(q) !== -1);
      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });

    var empty = document.querySelector("[data-kb-empty]");
    if (empty) empty.classList.toggle("is-hidden", visible > 0);
    var count = document.querySelector("[data-kb-count] b");
    if (count) count.textContent = visible;
  }

  // Announcements (11.3): derive airing status from the schedule window.
  function gazetteStatus(card) {
    var start = card.getAttribute("data-start") || "";
    var end = card.getAttribute("data-end") || "";
    var today = "2026-08-13";
    if (end && end < today) return "ended";
    if (start && start > today) return "scheduled";
    return "live";
  }

  // Gazette filters (11.4): category pill + status select + search-as-you-type.
  function filterGazette() {
    var activePill = document.querySelector("[data-announce-pill].is-active");
    var cat = activePill ? activePill.getAttribute("data-announce-pill") : "all";
    var statusEl = document.getElementById("announceStatus");
    var status = statusEl ? statusEl.value : "all";
    var searchEl = document.getElementById("announceSearch");
    var q = searchEl ? searchEl.value.trim().toLowerCase() : "";
    var visible = 0;

    document.querySelectorAll(".notice-card").forEach(function (card) {
      var text = (card.textContent || "").toLowerCase();
      var show = (cat === "all" || card.getAttribute("data-cat") === cat) &&
                 (status === "all" || gazetteStatus(card) === status) &&
                 (!q || text.indexOf(q) !== -1);
      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });

    var empty = document.getElementById("gazetteEmpty");
    if (empty) empty.classList.toggle("is-hidden", visible > 0);
    var count = document.querySelector("[data-gazette-count] b");
    if (count) count.textContent = visible;
  }

  // Audit Logs (12.2–12.5): filter rows by date range, admin, event type, and search.
  function filterAudit() {
    var q = (document.getElementById("auditSearch").value || "").trim().toLowerCase();
    var range = document.getElementById("auditRange").value;   // all | 7 | 30
    var admin = document.getElementById("auditAdmin").value;
    var ev = document.getElementById("auditEvent").value;
    var cutoff = range === "7" ? "2026-08-06" : range === "30" ? "2026-07-14" : "";
    var visible = 0;

    document.querySelectorAll(".audit-table tbody tr").forEach(function (row) {
      var text = (row.textContent || "").toLowerCase();
      var okQ = !q || text.indexOf(q) !== -1;
      var okRange = !cutoff || (row.getAttribute("data-date") || "") >= cutoff;
      var okAdmin = admin === "all" || row.getAttribute("data-admin") === admin;
      var okEv = ev === "all" || row.getAttribute("data-event") === ev;
      var show = okQ && okRange && okAdmin && okEv;
      row.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });

    var empty = document.getElementById("auditEmpty");
    if (empty) empty.classList.toggle("is-hidden", visible > 0);
    var count = document.getElementById("auditCount");
    if (count) count.textContent = "Showing " + visible + " of 1,248 entries";
  }

  // Farm weather selector (4.8): dropdown changes the active farm's weather.
  document.addEventListener("change", function (e) {
    var sel = e.target.closest("[data-farm-select]");
    if (sel) { switchFarm(sel.value); return; }
    var cropSel = e.target.closest("[data-crop-select]");
    if (cropSel) {
      var farmSel = document.querySelector("[data-farm-select]");
      renderAI(farmSel ? farmSel.value : "north", cropSel.value);
      return;
    }
    if (e.target.closest("[data-kb-cat]")) { filterKB(); return; }
    if (e.target.closest("#announceStatus")) { filterGazette(); return; }
    if (e.target.closest("#auditRange") || e.target.closest("#auditAdmin") || e.target.closest("#auditEvent")) { filterAudit(); return; }
  });

  // Card-shaped controls (role="button" on a div) are focusable but browsers
  // give them no default activation, so Enter/Space are translated by hand.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
    var el = e.target.closest('[data-nav][role="button"]');
    if (!el) return;
    e.preventDefault(); // stop Space from scrolling the screen
    navigate(el.getAttribute("data-nav"), el);
  });

  // Quick action hub: open/close, scrim, outside tap, and Escape.
  var qaToggle = document.querySelector("[data-qa-toggle]");
  if (qaToggle) {
    qaToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setQuicklaunch(!quicklaunch.classList.contains("is-open"));
    });
  }
  var qaScrim = document.querySelector("[data-qa-close]");
  if (qaScrim) {
    qaScrim.addEventListener("click", function () { setQuicklaunch(false); });
  }
  document.addEventListener("click", function (e) {
    if (quicklaunch && quicklaunch.classList.contains("is-open") && !e.target.closest("[data-qa-root]")) {
      setQuicklaunch(false);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setQuicklaunch(false);
      setAnBell(false);
      setAnProfile(false);
    }
  });

  // ---- Admin navbar · Field Office strip ----
  // Notification bell: dropdown toggle, outside-click + Escape close.
  var bellWrap = document.querySelector(".an-bell-wrap");
  var bellBtn = document.querySelector("[data-an-bell]");
  function setAnBell(open) {
    if (!bellWrap) return;
    bellWrap.classList.toggle("is-open", open);
    if (bellBtn) bellBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (bellBtn) {
    bellBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setAnBell(!bellWrap.classList.contains("is-open"));
    });
  }
  document.addEventListener("click", function (e) {
    if (bellWrap && bellWrap.classList.contains("is-open") && !e.target.closest(".an-bell-wrap")) {
      setAnBell(false);
    }
    if (e.target.closest(".an-notif") || e.target.closest(".an-notif-more")) setAnBell(false);
  });

  // Profile avatar: dropdown with account actions (logout etc.).
  var userWrap = document.querySelector(".an-user-wrap");
  var userBtn = document.querySelector("[data-an-profile]");
  function setAnProfile(open) {
    if (!userWrap) return;
    userWrap.classList.toggle("is-open", open);
    if (userBtn) userBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) setAnBell(false);   // only one menu open at a time
  }
  if (userBtn) {
    userBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setAnProfile(!userWrap.classList.contains("is-open"));
    });
  }
  document.addEventListener("click", function (e) {
    if (userWrap && userWrap.classList.contains("is-open") && !e.target.closest(".an-user-wrap")) {
      setAnProfile(false);
    }
    // Close the profile menu when any of its actions is chosen.
    if (e.target.closest(".an-menu-item")) setAnProfile(false);
    // "View mobile app": jump the phone to Home for a quick preview.
    if (e.target.closest("[data-view-mobile]")) showMobileScreen("home");
  });

  // Knowledge Base search-as-you-type (10.7) + Gazette (11.4) + Audit (12.5).
  document.addEventListener("input", function (e) {
    if (e.target.closest("[data-kb-search]")) filterKB();
    if (e.target.closest("#announceSearch")) filterGazette();
    if (e.target.closest("#auditSearch")) filterAudit();
    if (e.target.closest("[data-farm-search]")) filterFarms(e.target.value);
    if (e.target.closest("[data-user-search]")) filterUsers(e.target.value);
    if (e.target.closest("[data-kb-title]") || e.target.closest("[data-kb-content]")) syncSaveState();
    if (e.target.closest("[data-cond-value]") || e.target.closest("[data-cond-max]")) syncSaveState();
  });

  // User Management search-as-you-type (9.2) — match name/email, update count + empty state.
  function filterUsers(query) {
    var q = (query || "").trim().toLowerCase();
    var rows = document.querySelectorAll("[data-user-row]");
    var visible = 0;
    rows.forEach(function (row) {
      var hay = (row.getAttribute("data-user-text") || "").toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      row.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    var count = document.querySelector("[data-user-count] b");
    if (count) count.textContent = visible;
    var empty = document.querySelector("[data-user-empty]");
    if (empty) empty.classList.toggle("is-hidden", visible !== 0);
  }

  // My Farms search-as-you-type (2.2) — match name/location, toggle empty state.
  function filterFarms(query) {
    var q = (query || "").trim().toLowerCase();
    var items = document.querySelectorAll("[data-farm-item]");
    var visible = 0;
    items.forEach(function (card) {
      var hay = (card.getAttribute("data-farm-text") || "").toLowerCase();
      var match = !q || hay.indexOf(q) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    var empty = document.querySelector("[data-farms-empty]");
    if (empty) empty.classList.toggle("is-hidden", visible !== 0);
  }

  // Rule editor starts closed and article-only (kb_rule_complete: conditions and
  // action_key are both null, or both set).
  setRuleOpen(false);
  document.querySelectorAll("[data-cond-row]").forEach(syncCondRow);
  syncRuleAction(document.querySelector("[data-kb-category]") ? document.querySelector("[data-kb-category]").value : "Planting");
  syncKBStats();
  syncStageOptions();
  syncRuleGroups();
  syncSaveState();

  // Ensure the initial screen is shown. Both canvases open on their sign-in
  // screen (Module 1): the farmer app on the phone, the Admin on the web.
  showMobileScreen("login");
  showAdminScreen("admin-login");

  // Init the farm weather selector to North by default.
  switchFarm("north");
})();
