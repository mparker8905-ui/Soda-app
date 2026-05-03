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

  function val(

    id,

    fallback = ""

  ) {

    const node = el(id);

    return node

      ? node.value

      : fallback;

  }

  function num(

    id,

    fallback = 0

  ) {

    const n = Number(

      val(id, fallback)

    );

    return Number.isFinite(n)

      ? n

      : fallback;

  }

  function html(

    id,

    content

  ) {

    const node = el(id);

    if (node)

      node.innerHTML =

        content;

  }

  function exists(fn) {

    return (

      typeof fn ===

      "function"

    );

  }

  function safe(

    fn,

    label = "run"

  ) {

    try {

      return fn();

    } catch (e) {

      console.error(

        label + " failed:",

        e

      );

    }

  }

  function toast(

    msg,

    type = "info"

  ) {

    try {

      if (

        exists(

          window.showToast

        )

      ) {

        window.showToast(

          msg,

          type

        );

      }

    } catch (e) {}

  }

  /* =====================================

     STATE SYNC

  ===================================== */

  function syncStateFromUI() {

    try {

      const s =

        window.state;

      s.job.sqft =

        num("sqft", 0);

      s.job.houses =

        num(

          "houses",

          1

        );

      s.job.package =

        val(

          "package",

          "standard"

        );

      s.job.pricingMode =

        val(

          "pricingMode",

          "balanced"

        );

      s.job.targetMargin =

        num(

          "targetMargin",

          0

        );

      s.job.pricingStrategy =

        val(

          "pricingStrategy",

          "normal"

        );

      s.job.competitorPrice =

        num(

          "competitorPrice",

          0

        );

      s.job.labor.hourlyRate =

        num(

          "hourlyRate",

          0

        );

      s.job.labor.hoursPerHouse =

        num(

          "hoursPerHouse",

          0

        );

      s.job.labor.crewSize =

        num(

          "crewSize",

          1

        );

      s.job.labor.overhead =

        num(

          "overhead",

          0

        );

      s.ui.tankSize =

        num(

          "tankSize",

          500

        );

      s.job.addons = {

        aeration:

          !!el(

            "aeration"

          )?.checked,

        compost:

          !!el(

            "compost"

          )?.checked,

        biohum:

          !!el(

            "biohum"

          )?.checked,

        biochar:

          !!el(

            "biochar"

          )?.checked,

        humic:

          !!el(

            "humic"

          )?.checked,

        grow:

          !!el(

            "grow"

          )?.checked,

        lime:

          !!el(

            "lime"

          )?.checked,

        sulfur:

          !!el(

            "sulfur"

          )?.checked

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

  let renderTimer =

    null;

  function requestRender() {

    try {

      clearTimeout(

        renderTimer

      );

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

        !exists(

          window.calculateJob

        )

      )

        return;

      syncStateFromUI();

      const r =

        window.calculateJob();

      if (!r) return;

      const margin =

        r.price > 0

          ? (r.profit /

              r.price) *

            100

          : 0;

      const comparison =

        r.comparison ||

        {};

      const dealScore =

        exists(

          window.calculateDealScore

        )

          ? window.calculateDealScore(

              r,

              comparison

            )

          : 75;

      const insights =

        exists(

          window.generateAIInsights

        )

          ? window.generateAIInsights(

              r,

              comparison

            )

          : [];

      const scoreColor =

        dealScore >= 80

          ? "#4cff9a"

          : dealScore >=

            60

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

          : `<div class="muted">No issues detected.</div>`;

      html(

        "results",

        `

        <div class="glass-card">

          <h3>Job Pricing</h3>

          <div>Total Cost: $${Number(

            r.cost

          ).toFixed(2)}</div>

          <div>Sell Price: $${Number(

            r.price

          ).toFixed(2)}</div>

          <div>Profit: $${Number(

            r.profit

          ).toFixed(2)}</div>

          <div>Margin: ${margin.toFixed(

            1

          )}%</div>

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

        exists(

          window.renderPipeline

        )

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

          <div>Unable to calculate job.</div>

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

        el(

          "jobHistory"

        );

      if (!wrap)

        return;

      const jobs =

        JSON.parse(

          localStorage.getItem(

            "jobHistory"

          ) || "[]"

        );

      if (!jobs.length) {

        wrap.innerHTML =

          `<div class="muted">No saved jobs yet.</div>`;

        return;

      }

      wrap.innerHTML =

        jobs

          .map(

            (

              job,

              i

            ) => `

        <div class="history-card">

          <div><strong>${job.sqft || 0} sqft</strong></div>

          <div>$${Number(

            job.price || 0

          ).toFixed(2)}</div>

          <div>${Number(

            job.margin || 0

          ).toFixed(

            1

          )}%</div>

          <div class="row-actions">

            <button onclick="editJob(${i})">Edit</button>

            <button onclick="deleteJob(${i})">Delete</button>

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

        el(

          "schedulePreview"

        );

      if (!wrap)

        return;

      if (

        !exists(

          window.buildSchedule

        )

      ) {

        wrap.innerHTML =

          "";

        return;

      }

      const r =

        window.calculateJob();

      const schedule =

        window.buildSchedule(

          r

        ) || [];

      if (

        !schedule.length

      ) {

        wrap.innerHTML =

          `<div class="muted">No schedule yet.</div>`;

        return;

      }

      wrap.innerHTML =

        schedule

          .map(

            (

              day

            ) => `

        <div class="glass-card">

          <strong>

            Day ${day.day} — ${day.title}

          </strong>

          <div class="muted">

            ${day.date}

          </div>

          <div style="margin-top:8px;">

            ${day.tasks

              .map(

                (

                  t

                ) => `<div>• ${t}</div>`

              )

              .join(

                ""

              )}

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

    } catch (e) {}

  }

  /* =====================================

     EVENTS

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

            exists(

              window.saveInventory

            )

          ) {

            safe(

              window.saveInventory,

              "saveInventory"

            );

          }

        }

        requestRender();

      } catch (err) {

        console.error(

          err

        );

      }

    }

  );

  document.addEventListener(

    "change",

    function () {

      requestRender();

    }

  );

  document.addEventListener(

    "DOMContentLoaded",

    function () {

      try {

        const quote =

          el(

            "quoteDate"

          );

        if (

          quote &&

          !quote.value

        ) {

          const d =

            new Date();

          quote.value =

            d

              .toISOString()

              .split(

                "T"

              )[0];

        }

      } catch (e) {}

    }

  );

  /* =====================================

     INIT

  ===================================== */

  window.onload =

    function () {

      safe(

        syncStateFromUI,

        "syncStateFromUI"

      );

      if (

        exists(

          window.loadInventory

        )

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

        exists(

          window.renderPipeline

        )

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

//=================
//MANUAL REFRESH
//=================

window.manualRefresh = function () {

  try {

    if (typeof loadInventory === "function") loadInventory();

    if (typeof renderPipeline === "function") renderPipeline();

    if (typeof renderHistory === "function") renderHistory();

    if (typeof render === "function") render();

    showToast("Refreshed", "success");

  } catch (e) {

    console.error(e);

  }

};