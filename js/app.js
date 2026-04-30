/* =====================================

   app.js

   SoDa Outdoor Designs

   Bootstrap + Global Events + Rendering

===================================== */

(function () {

  "use strict";

  /* =====================================

     INTERNALS

  ===================================== */

  let renderTimer = null;

  let booted = false;

  /* =====================================

     SAFE FUNCTION CALLER

  ===================================== */

  function callIfExists(fnName, ...args) {

    try {

      const fn = window[fnName];

      if (typeof fn === "function") {

        return fn(...args);

      }

    } catch (e) {

      console.error(`${fnName}() failed`, e);

    }

  }

  /* =====================================

     REQUEST RENDER

  ===================================== */

  window.requestRender = function requestRender(delay = 120) {

    if (renderTimer) {

      clearTimeout(renderTimer);

    }

    renderTimer = setTimeout(() => {

      renderTimer = null;

      callIfExists("render");

    }, delay);

  };

  /* =====================================

     APP INIT

  ===================================== */

  window.initApp = function initApp() {

    if (booted) return;

    booted = true;

    try {

      callIfExists("syncStateFromUI");

      callIfExists("loadInventory");

      callIfExists("renderHistory");

      callIfExists("renderPipeline");

      callIfExists("renderSchedulePreview");

      callIfExists("render");

    } catch (e) {

      console.error("App init failed:", e);

    }

  };

  /* =====================================

     WINDOW LOAD

  ===================================== */

  window.onload = function () {

    window.initApp();

  };

  /* =====================================

     DOM READY

  ===================================== */

  document.addEventListener("DOMContentLoaded", function () {

    setDefaultDates();

    bindTimelineRadios();

    bindProjectStart();

    bindGlobalInputs();

  });

  /* =====================================

     DEFAULT DATE FIELDS

  ===================================== */

  function setDefaultDates() {

    const quoteInput = document.getElementById("quoteDate");

    if (quoteInput && !quoteInput.value) {

      const today = new Date();

      quoteInput.value = today.toISOString().split("T")[0];

    }

  }

  /* =====================================

     GLOBAL INPUT LISTENER

     Sync state + autosave inventory + rerender

  ===================================== */

  function bindGlobalInputs() {

    document.addEventListener("input", function (e) {

      callIfExists("syncStateFromUI");

      if (

        e.target &&

        e.target.closest &&

        e.target.closest(".material-row")

      ) {

        callIfExists("saveInventory");

      }

      window.requestRender();

    });

    document.addEventListener("change", function () {

      callIfExists("syncStateFromUI");

      window.requestRender();

    });

  }

  /* =====================================

     TIMELINE RADIOS

  ===================================== */

  function bindTimelineRadios() {

    const radios = document.querySelectorAll(

      'input[name="timeline"]'

    );

    radios.forEach((radio) => {

      radio.addEventListener("change", function () {

        if (window.state?.ui) {

          window.state.ui.timeline = radio.value;

        }

        window.requestRender();

      });

    });

  }

  /* =====================================

     PROJECT START DATE

  ===================================== */

  function bindProjectStart() {

    const start = document.getElementById("projectStart");

    if (!start) return;

    start.addEventListener("change", function () {

      window.requestRender();

    });

  }

  /* =====================================

     MAIN RENDER

     Uses your existing core.js functions

  ===================================== */

  window.render = function render() {

    try {

      callIfExists("syncStateFromUI");

      const resultsEl = document.getElementById("results");

      if (!resultsEl) return;

      if (typeof window.calculateJob !== "function") {

        resultsEl.innerHTML =

          '<div class="glass-card">Calculator not loaded.</div>';

        return;

      }

      const r = window.calculateJob();

      const comparison = r.comparison || {};

      const needs = r.needs || {};

      const margin =

        r.price > 0 ? (r.profit / r.price) * 100 : 0;

      let dealScore = 0;

      let insights = [];

      if (typeof window.calculateDealScore === "function") {

        dealScore = window.calculateDealScore(r, comparison);

      }

      if (typeof window.generateAIInsights === "function") {

        insights = window.generateAIInsights(r, comparison) || [];

      }

      let tankHtml = "";

      if (typeof window.calculateTankLoads === "function") {

        const tankData = window.calculateTankLoads(

          r,

          needs,

          window.state?.ui?.tankSize || 500

        );

        tankHtml = `

          <div class="glass-card">

            <h3>Tank Loads</h3>

            <div>Total Loads: ${tankData.loads.toFixed(2)}</div>

            <div>Coverage / Tank: ${tankData.coveragePerTank.toFixed(

              0

            )} sqft</div>

          </div>

        `;

      }

      resultsEl.innerHTML = `

        <div class="glass-card">

          <h3>Job Pricing</h3>

          <div>Total Cost: $${r.cost.toFixed(2)}</div>

          <div>Sell Price: $${r.price.toFixed(2)}</div>

          <div>Profit: $${r.profit.toFixed(2)}</div>

          <div>Margin: ${margin.toFixed(1)}%</div>

        </div>

        <div class="glass-card">

          <h3>Deal Score</h3>

          <div style="

            font-size:42px;

            font-weight:800;

            color:${

              dealScore >= 80

                ? "#4cff9a"

                : dealScore >= 60

                ? "#ffd24d"

                : "#ff4d4d"

            };

          ">

            ${dealScore}/100

          </div>

        </div>

        ${tankHtml}

        <div class="glass-card">

          <h3>Insights</h3>

          ${

            insights.length

              ? insights

                  .map((i) => `<div>• ${i.text}</div>`)

                  .join("")

              : "<div>No issues detected.</div>"

          }

        </div>

      `;

      callIfExists("renderSchedulePreview");

      callIfExists("renderPipeline");

      fireWarnings(r, comparison, margin);

    } catch (e) {

      console.error("Render failed:", e);

      const resultsEl = document.getElementById("results");

      if (resultsEl) {

        resultsEl.innerHTML =

          '<div class="glass-card">Error in calculation</div>';

      }

    }

  };

  /* =====================================

     TOAST WARNINGS

  ===================================== */

  function fireWarnings(r, comparison, margin) {

    const shown = window.shownToasts || new Set();

    const shortage = Object.values(comparison).some(

      (x) => x.status === "short"

    );

    if (shortage && !shown.has("materials")) {

      callIfExists(

        "showToast",

        "📡 Inventory shortage detected",

        "error"

      );

      shown.add("materials");

    }

    if (margin < 25 && !shown.has("pricing")) {

      callIfExists(

        "showToast",

        "📉 Low margin detected",

        "warning"

      );

      shown.add("pricing");

    }

    window.shownToasts = shown;

  }

})();