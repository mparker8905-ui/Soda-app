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
   
        rainDays: 0,
      
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

     window.syncStateFromUI?.();

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

    ${window.renderFinancialCard(r)}

    ${window.renderProductionCard(r)}

    ${window.renderDealScoreCard(

      dealScore,

      scoreColor

    )}

    ${window.renderInsightsCard(

      insights

    )}

  `

);

      safe(

        () => renderSchedulePreview(r),

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

  function renderSchedulePreview(r) {

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

window.addEventListener(

  "load",

  function () {

    safe(

      () => window.syncStateFromUI?.(),

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

  }

);

/* =====================================

   SHARED CARD RENDERERS

===================================== */

function renderFinancialCard(r) {

  return `

    <div class="glass-card">

      <h3>Financial Breakdown</h3>

      <div>

        Total Cost:

        $${Number(r.cost || r.totalCost || 0).toFixed(2)}

      </div>

      <div>

        Sell Price:

        $${Number(r.price || 0).toFixed(2)}

      </div>

      <div>

        Profit:

        $${Number(r.profit || 0).toFixed(2)}

      </div>

      <div>

        Margin:

        ${Number(r.margin || 0).toFixed(1)}%

      </div>

      <hr>

      <div>

        Labor:

        $${Number(r.laborCost || 0).toFixed(2)}

      </div>

      <div>

        Material:

        $${Number(r.materialCost || 0).toFixed(2)}

      </div>

      <div>

        Equipment:

        $${Number(r.equipmentCost || 0).toFixed(2)}

      </div>

      <div>

        Mobilization:

        $${Number(r.mobilization || 0).toFixed(2)}

      </div>

      <div>

        Overhead:

        $${Number(

          r.overheadCost ||

          r.overhead ||

          0

        ).toFixed(2)}

      </div>

      <hr>

      <div>

        Regular Hours:

        ${Number(

          r.regularHours || 0

        ).toFixed(1)}

      </div>

      <div>

        Overtime Hours:

        ${Number(

          r.overtimeHours || 0

        ).toFixed(1)}

      </div>

      <div>

        Overtime Pay:

        $${Number(

          r.overtimePay || 0

        ).toFixed(2)}

      </div>

    </div>

  `;

}

function renderProductionCard(r) {

  return `

    <div class="glass-card">

      <h3>Production Metrics</h3>

      <div>

        Spray Days:

        ${r.sprayDays || 0}

      </div>

      <div>

        Production Rate:

        ${Number(

          r.productionRate || 0

        ).toLocaleString()} sqft/day

      </div>

      <div>

        Crew Size:

        ${r.crewSize || 0}

      </div>

      <div>

        Tank Size:

        ${r.tankSize || 0} gal

      </div>

      <div>

        Loads/Day:

        ${Number(

          r.loadsPerDay || 0

        ).toFixed(1)}

      </div>

      <div>

        Refill Time:

        ${r.refillMinutes || 0} min

      </div>

    </div>

  `;

}

function renderDealScoreCard(

  score,

  color

) {

  return `

    <div class="glass-card">

      <h3>Deal Score</h3>

      <div style="

        font-size:58px;

        font-weight:800;

        color:${color};

      ">

        ${score}/100

      </div>

    </div>

  `;

}

function renderInsightsCard(

  insights = []

) {

  return `

    <div class="glass-card">

      <h3>Insights</h3>

      ${

        insights.length

          ? insights.map(i => `

              <div class="insight-row">

                ${i.text}

              </div>

            `).join("")

          : `

            <div class="muted">

              No issues detected.

            </div>

          `

      }

    </div>

  `;

}

  /* =====================================

     EXPORTS

  ===================================== */

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

  window.renderFinancialCard =

  renderFinancialCard;

window.renderProductionCard =

  renderProductionCard;

window.renderDealScoreCard =

  renderDealScoreCard;

window.renderInsightsCard =

  renderInsightsCard;

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
         
          case "generateProposal": {

  const result =

    window.calculateJob();

  if (!result) {

    alert(

      "Calculate project first."

    );

    return;

  }

  const data =

    window.generateResidentialProposalData(

      result

    );

  const html =

    window.generateProposalHTML(

      data

    );

  const win =

    window.open();

  if (!win) {

    alert(

      "Please allow popups."

    );

    return;

  }

  win.document.open();

  win.document.write(html);

  win.document.close();

break;

}

case "generateBuilderProposal": {

  const result =

    window.lastBuilderResult;

  if (!result) {

    alert(

      "Calculate builder project first."

    );

    return;

  }

  const data =

    window.generateBuilderProposalData(

      result

    );

  const html =

    window.generateProposalHTML(

      data

    );

  const win =

    window.open();

  if (!win) {

    alert(

      "Enable popups for proposals."

    );

    return;

  }

  win.document.open();

  win.document.write(html);

  win.document.close();

break;

}

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

         renderInventory();

          break;

        case "exportInventory":

         exportInventory();

          break;

        case "clearInventory":

         clearInventory();

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
