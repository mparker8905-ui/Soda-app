/* =====================================

   state.js

   SoDa Outdoor Designs

   Global App State + Safe Helpers

===================================== */

(function () {

  "use strict";

  /* =====================================

     DEFAULT STATE

  ===================================== */

  const DEFAULT_STATE = {

    job: {

      sqft: 0,

      houses: 1,

      package: "standard",

      pricingMode: "balanced",

      targetMargin: 0,

      pricingStrategy: "normal",

      competitorPrice: 0,

      labor: {

        hourlyRate: 0,

        hoursPerHouse: 0,

        crewSize: 1,

        overhead: 0

      },

      addons: {

        aeration: false,

        compost: false,

        biohum: false,

        biochar: false,

        humic: false,

        grow: false,

        lime: false,

        sulfur: false

      }

    },

    ui: {

      tankSize: 500,

      timeline: "standard",

      activePage: "calculator",

      renderQueued: false

    },

    inventory: null,

    proposals: []

  };

  /* =====================================

     CLONE HELPER

  ===================================== */

  function clone(obj) {

    return JSON.parse(JSON.stringify(obj));

  }

  /* =====================================

     GLOBAL STATE

  ===================================== */

  window.state = clone(DEFAULT_STATE);

  /* backward compatibility */

  window.app = window.state;

  /* cache buckets used by other files */

  window.inventoryCache = null;

  window.activeProposalId = null;

  window.currentProposalId = null;

  window.shownToasts = new Set();

  /* =====================================

     RESETTERS

  ===================================== */

  window.resetState = function resetState() {

    window.state = clone(DEFAULT_STATE);

    window.app = window.state;

    return window.state;

  };

  window.resetToasts = function resetToasts() {

    if (window.shownToasts && typeof window.shownToasts.clear === "function") {

      window.shownToasts.clear();

    } else {

      window.shownToasts = new Set();

    }

  };

  /* =====================================

     SAFE STORAGE HELPERS

  ===================================== */

  window.readStorage = function readStorage(key, fallback = null) {

    try {

      const raw = localStorage.getItem(key);

      return raw ? JSON.parse(raw) : fallback;

    } catch (e) {

      console.warn("Storage read failed:", key, e);

      return fallback;

    }

  };

  window.writeStorage = function writeStorage(key, value) {

    try {

      localStorage.setItem(key, JSON.stringify(value));

      return true;

    } catch (e) {

      console.warn("Storage write failed:", key, e);

      return false;

    }

  };

  /* =====================================

     DOM HELPERS

  ===================================== */

  window.$id = function $id(id) {

    return document.getElementById(id);

  };

  window.$num = function $num(id, fallback = 0) {

    const el = document.getElementById(id);

    if (!el) return fallback;

    const n = Number(el.value);

    return Number.isFinite(n) ? n : fallback;

  };

  window.$val = function $val(id, fallback = "") {

    const el = document.getElementById(id);

    if (!el) return fallback;

    return el.value != null ? el.value : fallback;

  };

  window.$checked = function $checked(id, fallback = false) {

    const el = document.getElementById(id);

    if (!el) return fallback;

    return !!el.checked;

  };

  /* =====================================

     STATE SETTERS

  ===================================== */

  window.setAddonState = function setAddonState(name, value) {

    if (!window.state.job.addons.hasOwnProperty(name)) return;

    window.state.job.addons[name] = !!value;

  };

  window.setTimelineState = function setTimelineState(value) {

    window.state.ui.timeline = value || "standard";

  };

  window.setTankSizeState = function setTankSizeState(value) {

    const size = Number(value) || 500;

    window.state.ui.tankSize = size;

  };

  /* =====================================

     UI → STATE SYNC

     Reads DOM safely without crashing

  ===================================== */

  window.syncStateFromUI = function syncStateFromUI() {

    const s = window.state;

    s.job.sqft = $num("sqft", s.job.sqft);

    s.job.houses = $num("houses", s.job.houses);

    s.job.package = $val("package", s.job.package);

    s.job.pricingMode = $val("pricingMode", s.job.pricingMode);

    s.job.targetMargin = $num("targetMargin", s.job.targetMargin);

    s.job.pricingStrategy = $val(

      "pricingStrategy",

      s.job.pricingStrategy

    );

    s.job.competitorPrice = $num(

      "competitorPrice",

      s.job.competitorPrice

    );

    s.job.labor.hourlyRate = $num(

      "hourlyRate",

      s.job.labor.hourlyRate

    );

    s.job.labor.hoursPerHouse = $num(

      "hoursPerHouse",

      s.job.labor.hoursPerHouse

    );

    s.job.labor.crewSize = $num(

      "crewSize",

      s.job.labor.crewSize

    );

    s.job.labor.overhead = $num(

      "overhead",

      s.job.labor.overhead

    );

    s.ui.tankSize = $num("tankSize", s.ui.tankSize);

    /* addon checkboxes */

    Object.keys(s.job.addons).forEach((key) => {

      const el = document.getElementById(key);

      if (el && el.type === "checkbox") {

        s.job.addons[key] = !!el.checked;

      }

    });

    /* timeline radios */

    const checkedTimeline = document.querySelector(

      'input[name="timeline"]:checked'

    );

    if (checkedTimeline) {

      s.ui.timeline = checkedTimeline.value;

    }

    return s;

  };

  /* =====================================

     STATE → UI HYDRATE

  ===================================== */

  window.applyStateToUI = function applyStateToUI() {

    const s = window.state;

    function setValue(id, value) {

      const el = document.getElementById(id);

      if (el) el.value = value;

    }

    setValue("sqft", s.job.sqft);

    setValue("houses", s.job.houses);

    setValue("package", s.job.package);

    setValue("pricingMode", s.job.pricingMode);

    setValue("targetMargin", s.job.targetMargin);

    setValue("pricingStrategy", s.job.pricingStrategy);

    setValue("competitorPrice", s.job.competitorPrice);

    setValue("hourlyRate", s.job.labor.hourlyRate);

    setValue("hoursPerHouse", s.job.labor.hoursPerHouse);

    setValue("crewSize", s.job.labor.crewSize);

    setValue("overhead", s.job.labor.overhead);

    setValue("tankSize", s.ui.tankSize);

    Object.keys(s.job.addons).forEach((key) => {

      const el = document.getElementById(key);

      if (el && el.type === "checkbox") {

        el.checked = !!s.job.addons[key];

      }

    });

    const radio = document.querySelector(

      `input[name="timeline"][value="${s.ui.timeline}"]`

    );

    if (radio) radio.checked = true;

  };

  /* =====================================

     DEBUG HELPERS

  ===================================== */

  window.getStateSnapshot = function getStateSnapshot() {

    return clone(window.state);

  };

})();

window.state = state;

window.app = state;