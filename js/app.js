/* ==========================================

   app.js

   SoDa Outdoor Designs

   Production Safe Bootstrap + Render Engine

========================================== */

(function () {

  "use strict";

  /* =====================================

     GLOBAL STATE

  ===================================== */

  window.state =

    window.state || {

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

        timeline: "standard"

      }

    };

  window.app = window.state;

  window.shownToasts =

    window.shownToasts || new Set();

  /* =====================================

     HELPERS

  ===================================== */

  function el(id) {

    return document.getElementById(id);

  }

  function val(id, fallback = "") {

    const node = el(id);

    return node

      ? node.value

      : fallback;

  }

  function num(id, fallback = 0) {

    const n = Number(

      val(id, fallback)

    );

    return Number.isFinite(n)

      ? n

      : fallback;

  }

  function html(id, content) {

    const node = el(id);

    if (node) {

      node.innerHTML = content;

    }

  }

  function exists(fn) {

    return typeof fn === "function";

  }

  function safe(fn, label = "run") {

    try {

      return fn();

    } catch (e) {

      console.error(

        label + " failed:",

        e

      );

    }

  }

  function toast(msg, type = "info") {

    try {

      if (exists(window.showToast)) {

        window.showToast(

          msg,

          type

        );

      }

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     STATE SYNC

  ===================================== */

  function syncStateFromUI() {

    try {

      const s = window.state;

      s.job.sqft =

        num("sqft", 0);

      s.job.houses =

        num("houses", 1);

      s.job.package =

        val("package", "standard");

      s.job.pricingMode =

        val("pricingMode", "balanced");

      s.job.targetMargin =

        num("targetMargin", 0);

      s.job.pricingStrategy =

        val("pricingStrategy", "normal");

      s.job.competitorPrice =

        num("competitorPrice", 0);

      s.job.labor.hourlyRate =

        num("hourlyRate", 0);

      s.job.labor.hoursPerHouse =

        num("hoursPerHouse", 0);

      s.job.labor.crewSize =

        num("crewSize", 1);

      s.job.labor.overhead =

        num("overhead", 0);

      s.ui.tankSize =

        num("tankSize", 500);

      s.job.addons = {

    aeration: !!el("addon_aeration")?.checked,

compost: !!el("addon_compost")?.checked,

biohum: !!el("addon_biohum")?.checked,

biochar: !!el("addon_biochar")?.checked,

humic: !!el("addon_humic")?.checked,

grow: !!el("addon_grow")?.checked,

lime: !!el("addon_lime")?.checked,

sulfur: !!el("addon_sulfur")?.checked

      };

    } catch (e) {

      console.error(

        "syncStateFromUI:",

        e

      );

    }

  }

  /* =====================================

     RENDER DEBOUNCE

  ===================================== */

  let renderTimer = null;

  function requestRender() {

    try {

      clearTimeout(renderTimer);

      renderTimer =

        setTimeout(

          render,

          120

        );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     MAIN RENDER

  ===================================== */

  function render() {

    try {

      if (

        !exists(window.calculateJob)

      ) return;

      syncStateFromUI();

      const r =

        window.calculateJob();

      if (!r) return;

      const margin =

        r.price > 0

          ? (r.profit / r.price) * 100

          : 0;

      const comparison =

        r.comparison || {};

      const dealScore =

        exists(window.calculateDealScore)

          ? window.calculateDealScore(

              r,

              comparison

            )

          : 75;

      const insights =

        exists(window.generateAIInsights)

          ? window.generateAIInsights(

              r,

              comparison

            )

          : [];

      const scoreColor =

        dealScore >= 80

          ? "#4cff9a"

          : dealScore >= 60

          ? "#ffd24d"

          : "#ff4d4d";

      const insightsHTML =

        insights.length

          ? insights

              .map(

                (i) => `

                <div class="insight-row">

                  ${i.text}

                </div>

              `

              )

              .join("")

          : `

            <div class="muted">

              No issues detected.

            </div>

          `;

      html(

        "results",

        `

        <div class="glass-card">

          <h3>Job Pricing</h3>

          <div>

            Total Cost:

            $${Number(r.cost).toFixed(2)}

          </div>

          <div>

            Sell Price:

            $${Number(r.price).toFixed(2)}

          </div>

          <div>

            Profit:

            $${Number(r.profit).toFixed(2)}

          </div>

          <div>

            Margin:

            ${margin.toFixed(1)}%

          </div>

        </div>

        <div class="glass-card">

          <h3>Deal Score</h3>

          <div style="

            font-size:58px;

            font-weight:800;

            color:${scoreColor};

          ">

            ${dealScore}/100

          </div>

        </div>

        <div class="glass-card">

          <h3>Insights</h3>

          ${insightsHTML}

        </div>

      `

      );

      safe(

        renderSchedulePreview,

        "renderSchedulePreview"

      );

      safe(

        renderHistory,

        "renderHistory"

      );

      if (

        exists(window.renderPipeline)

      ) {

        safe(

          window.renderPipeline,

          "renderPipeline"

        );

      }

    } catch (e) {

      console.error(

        "render failed:",

        e

      );

      html(

        "results",

        `

        <div class="glass-card">

          <h3>Error</h3>

          <div>

            Unable to calculate job.

          </div>

        </div>

      `

      );

    }

  }

  /* =====================================

     HISTORY

  ===================================== */

  function renderHistory() {

    try {

      const wrap =

        el("jobHistory");

      if (!wrap) return;

      const jobs =

        JSON.parse(

          localStorage.getItem(

            "jobHistory"

          ) || "[]"

        );

      if (!jobs.length) {

        wrap.innerHTML =

          `<div class="muted">

            No saved jobs yet.

          </div>`;

        return;

      }

      wrap.innerHTML =

        jobs

          .map(

            (job, i) => `

          <div class="history-card">

            <div>

              <strong>

                ${job.sqft || 0} sqft

              </strong>

            </div>

            <div>

              $${Number(

                job.price || 0

              ).toFixed(2)}

            </div>

            <div>

              ${Number(

                job.margin || 0

              ).toFixed(1)}%

            </div>

            <div class="row-actions">

              <button

                data-action="editJob"

                data-id="${i}"

              >

                Edit

              </button>

              <button

                data-action="deleteJob"

                data-id="${i}"

              >

                Delete

              </button>

            </div>

          </div>

        `

          )

          .join("");

    } catch (e) {

      console.error(

        "renderHistory:",

        e

      );

    }

  }

  /* =====================================

     SCHEDULE

  ===================================== */

  function renderSchedulePreview() {

    try {

      const wrap =

        el("schedulePreview");

      if (!wrap) return;

      if (

        !exists(window.buildSchedule)

      ) {

        wrap.innerHTML = "";

        return;

      }

      const r =

        window.calculateJob();

      const schedule =

        window.buildSchedule(r) || [];

      if (!schedule.length) {

        wrap.innerHTML =

          `<div class="muted">

            No schedule yet.

          </div>`;

        return;

      }

      wrap.innerHTML =

        schedule

          .map(

            (day) => `

          <div class="glass-card">

            <strong>

              Day ${day.day}

              — ${day.title}

            </strong>

            <div class="muted">

              ${day.date}

            </div>

            <div style="margin-top:8px;">

              ${day.tasks

                .map(

                  (t) => `

                    <div>• ${t}</div>

                  `

                )

                .join("")}

            </div>

          </div>

        `

          )

          .join("");

    } catch (e) {

      console.error(

        "renderSchedulePreview:",

        e

      );

    }

  }

  /* =====================================

     RESET TOASTS

  ===================================== */

  function resetToasts() {

    try {

      window.shownToasts.clear();

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     INPUT EVENTS

  ===================================== */

  document.addEventListener(

    "input",

    function (e) {

      try {

        syncStateFromUI();

        if (

          e.target.closest(

            ".material-row"

          )

        ) {

          if (

            exists(window.saveInventory)

          ) {

            safe(

              window.saveInventory,

              "saveInventory"

            );

          }

        }

        requestRender();

      } catch (err) {

        console.error(err);

      }

    }

  );

  document.addEventListener(

    "change",

    function () {

      requestRender();

    }

  );

  /* =====================================

     INIT

  ===================================== */

  document.addEventListener(

    "DOMContentLoaded",

    function () {

      try {

        const quote =

          el("quoteDate");

        if (

          quote &&

          !quote.value

        ) {

          const d =

            new Date();

          quote.value =

            d.toISOString().split("T")[0];

        }

        const active =

          window.state?.ui?.timeline ||

          "standard";

        const btn =

          document.querySelector(

            `[data-timeline="${active}"]`

          );

        if (btn) {

          btn.classList.add(

            "active"

          );

        }

      } catch (e) {

        console.error(e);

      }

    }

  );

  /* =====================================

     WINDOW LOAD

  ===================================== */

  window.onload = function () {

    safe(

      syncStateFromUI,

      "syncStateFromUI"

    );

    if (

      exists(window.loadInventory)

    ) {

      safe(

        window.loadInventory,

        "loadInventory"

      );

    }

    safe(

      renderHistory,

      "renderHistory"

    );

    if (

      exists(window.renderPipeline)

    ) {

      safe(

        window.renderPipeline,

        "renderPipeline"

      );

    }

    safe(

      render,

      "render"

    );

  };

  /* =====================================

     EXPORTS

  ===================================== */

  window.syncStateFromUI =

    syncStateFromUI;

  window.requestRender =

    requestRender;

  window.render =

    render;

  window.renderHistory =

    renderHistory;

  window.renderSchedulePreview =

    renderSchedulePreview;

  window.resetToasts =

    resetToasts;

})();

/* =====================================

   MANUAL REFRESH

===================================== */

window.manualRefresh = function () {

  try {

    if (

      typeof loadInventory === "function"

    ) {

      loadInventory();

    }

    if (

      typeof renderPipeline === "function"

    ) {

      renderPipeline();

    }

    if (

      typeof renderHistory === "function"

    ) {

      renderHistory();

    }

    if (

      typeof render === "function"

    ) {

      render();

    }

    showToast(

      "Refreshed",

      "success"

    );

  } catch (e) {

    console.error(e);

  }

};

/* =====================================

   GLOBAL EVENT SYSTEM

===================================== */

document.addEventListener(

  "click",

  function (e) {

    const btn =

      e.target.closest("[data-action]");

    if (!btn) return;

    const action =

      btn.dataset.action;

    try {

      switch (action) {

        case "refresh":

          if (window.manualRefresh) {

            manualRefresh();

          }

          break;

        case "calculateJob":

          requestRender();

          break;

        case "createLead":

          if (window.createLead) {

            createLead();

          }

          break;

        case "sendProposal":

          if (window.sendProposal) {

            sendProposal();

          }

          break;

        case "acceptProposal":

          if (

            window.setProposalStatus

          ) {

            setProposalStatus(

              "Accepted"

            );

          }

          break;

        case "pendingProposal":

          if (

            window.setProposalStatus

          ) {

            setProposalStatus(

              "Pending"

            );

          }

          break;

        case "loseProposal":

          if (

            window.setProposalStatus

          ) {

            setProposalStatus(

              "Not Accepted"

            );

          }

          break;

        case "closeModal":

          if (

            window.closeProposalModal

          ) {

            closeProposalModal();

          }

          break;

        case "refreshCRM":

          if (window.refreshCRM) {

            refreshCRM();

          }

          break;

        case "deleteProposal":

          if (

            window.deleteProposalById &&

            window.activeProposalId

          ) {

            deleteProposalById(

              activeProposalId

            );

          }

          break;

        case "refreshInventory":

          refreshInventoryPage();

          break;

        case "addStandardMaterial":

          addMaterialRow(

            "standard"

          );

          break;

        case "addPremiumMaterial":

          addMaterialRow(

            "premium"

          );

          break;

        case "addAddonMaterial":

          addMaterialRow(

            "addons"

          );

          break;

        case "reloadInventory":

          loadInventory();

          renderInventoryTotals();

          break;

        case "exportInventory":

          exportInventoryJSON();

          break;

        case "clearInventory":

          clearInventoryData();

          break;

        case "refreshBuilder":

          refreshBuilderPage();

          break;

        case "calculateBuilder":

          if (

            window.calculateBuilderUI

          ) {

            calculateBuilderUI();

          }

          break;

        case "saveBuilderCRM":

          if (

            window.saveBuilderToCRM

          ) {

            saveBuilderToCRM();

          }

          break;

        case "editJob":

          if (window.editJob) {

            const id =

              Number(

                btn.dataset.id

              );

            editJob(id);

          }

          break;

        case "deleteJob":

          if (window.deleteJob) {

            const id =

              Number(

                btn.dataset.id

              );

            deleteJob(id);

          }

          break;

        default:

          console.warn(

            "Unknown action:",

            action

          );

      }

    } catch (err) {

      console.error(

        "Action failed:",

        action,

        err

      );

    }

  }

);

/* =====================================

   TIMELINE EVENT SYSTEM

===================================== */

document.addEventListener(

  "click",

  function (e) {

    const btn =

      e.target.closest("[data-timeline]");

    if (!btn) return;

    try {

      const value =

        btn.dataset.timeline;

      document

        .querySelectorAll(

          "[data-timeline]"

        )

        .forEach((b) =>

          b.classList.remove(

            "active"

          )

        );

      btn.classList.add(

        "active"

      );

      if (window.state?.ui) {

        window.state.ui.timeline =

          value;

      }

      if (

        typeof requestRender ===

        "function"

      ) {

        requestRender();

      }

      if (

        typeof showToast ===

        "function"

      ) {

        showToast(

          "Timeline: " + value,

          "success"

        );

      }

    } catch (err) {

      console.error(

        "Timeline failed:",

        err

      );

    }

  }

);