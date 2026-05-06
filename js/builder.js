/* ==========================================

   builder.js

   SoDa Outdoor Designs

   Builder Project Engine + CRM Integration

========================================== */

(function () {

  "use strict";

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

    const n =

      Number(val(id, fallback));

    return Number.isFinite(n)

      ? n

      : fallback;

  }

  function fmtMoney(v) {

    return Number(v || 0)

      .toLocaleString(

        undefined,

        {

          minimumFractionDigits: 2,

          maximumFractionDigits: 2

        }

      );

  }

  function safeHTML(str) {

    return String(str || "")

      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;");

  }

  function toast(msg, type = "info") {

    try {

      if (window.showToast) {

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

     CALCULATE BUILDER PROJECT

  ===================================== */

  window.calculateBuilderUI =

    function () {

      try {

        const sqft =

          num("builderSqft", 0);

        const houses =

          num("builderHouses", 1);

        const start =

          val("builderStart");

        const pkg =

          val(

            "builderPackage",

            "standard"

          );

        const pricingMode =

          val(

            "builderPricingMode",

            "balanced"

          );

        const competitor =

          num(

            "builderCompetitor",

            0

          );

        const builderName =

          val(

            "builderName",

            "Builder"

          );

        const projectName =

          val(

            "builderProject",

            "Subdivision"

          );

        const totalSqft =

          sqft * houses;

        if (

          !window.calculateJobCore

        ) {

          toast(

            "Pricing engine unavailable",

            "error"

          );

          return;

        }

        const result =

          window.calculateJobCore({

            job: {

              sqft,

              houses,

              package: pkg,

              pricingMode,

              competitorPrice:

                competitor,

              pricingStrategy:

                "builder",

              addons: {}

            }

          });

        const builderMult =

          window.getBuilderMultiplier(

            houses

          );

        const builderPrice =

          result.price *

          builderMult;

        const profit =

          builderPrice -

          result.cost;

        const margin =

          builderPrice > 0

            ? (

                profit /

                builderPrice

              ) * 100

            : 0;

        const pricePerHouse =

          houses > 0

            ? builderPrice / houses

            : 0;

        const pricePerSqft =

          totalSqft > 0

            ? builderPrice / totalSqft

            : 0;

        const hydroDays =

          houses > 20

            ? 4

            : houses > 10

            ? 3

            : houses > 5

            ? 2

            : 1;

        el("builderResults").innerHTML = `

          <div class="glass-card">

            <h3>

              Builder Summary

            </h3>

            <div>

              Builder:

              ${safeHTML(builderName)}

            </div>

            <div>

              Project:

              ${safeHTML(projectName)}

            </div>

            <div>

              Houses:

              ${houses}

            </div>

            <div>

              Total Sqft:

              ${totalSqft.toLocaleString()}

            </div>

            <div>

              Estimated Spray Days:

              ${hydroDays}

            </div>

          </div>

          <div class="glass-card">

            <h3>

              Financials

            </h3>

            <div>

              Total Cost:

              $${fmtMoney(result.cost)}

            </div>

            <div>

              Builder Price:

              $${fmtMoney(builderPrice)}

            </div>

            <div>

              Profit:

              $${fmtMoney(profit)}

            </div>

            <div>

              Margin:

              ${margin.toFixed(1)}%

            </div>

          </div>

          <div class="glass-card">

            <h3>

              Builder Metrics

            </h3>

            <div>

              Price Per House:

              $${fmtMoney(pricePerHouse)}

            </div>

            <div>

              Price Per Sqft:

              $${fmtMoney(pricePerSqft)}

            </div>

            <div>

              Builder Discount:

              ${(

                (1 - builderMult) * 100

              ).toFixed(1)}%

            </div>

          </div>

        `;

        renderBuilderSchedule(

          start,

          houses

        );

        toast(

          "Builder project calculated",

          "success"

        );

      } catch (e) {

        console.error(e);

        toast(

          "Builder calculation failed",

          "error"

        );

      }

    };

  /* =====================================

     BUILDER SCHEDULE

  ===================================== */

  window.renderBuilderSchedule =

    function (

      startDate,

      houses

    ) {

      try {

        const wrap =

          el("builderSchedule");

        if (!wrap) return;

        if (!startDate) {

          wrap.innerHTML = `

            <div class="muted">

              Select a project start date

            </div>

          `;

          return;

        }

        const start =

          new Date(startDate);

        function addDays(d, days) {

          const x =

            new Date(d);

          x.setDate(

            x.getDate() + days

          );

          return x;

        }

        function fmt(d) {

          return d.toLocaleDateString(

            undefined,

            {

              month: "short",

              day: "numeric",

              year: "numeric"

            }

          );

        }

        const hydroDays =

          houses > 20

            ? 4

            : houses > 10

            ? 3

            : houses > 5

            ? 2

            : 1;

        const html = [];

        /* =====================

           SOIL PREP

        ===================== */

        html.push(`

          <div class="glass-card">

            <strong>

              Soil Prep Phase

            </strong>

            <div class="muted">

              ${fmt(start)}

            </div>

            <div style="margin-top:8px;">

              <div>

                • Aeration

              </div>

              <div>

                • Lime / Sulfur

              </div>

              <div>

                • Compost Prep

              </div>

            </div>

          </div>

        `);

        /* =====================

           HYDROSEED PHASE

        ===================== */

        for (

          let i = 0;

          i < hydroDays;

          i++

        ) {

          html.push(`

            <div class="glass-card">

              <strong>

                Hydroseed Phase

              </strong>

              <div class="muted">

                ${fmt(

                  addDays(

                    start,

                    3 + i

                  )

                )}

              </div>

              <div style="margin-top:8px;">

                <div>

                  • Hydroseeding

                </div>

                <div>

                  • Grow System Setup

                </div>

              </div>

            </div>

          `);

        }

        /* =====================

           FINAL INSPECTION

        ===================== */

        html.push(`

          <div class="glass-card">

            <strong>

              Final Inspection

            </strong>

            <div class="muted">

              ${fmt(

                addDays(

                  start,

                  24

                )

              )}

            </div>

            <div style="margin-top:8px;">

              <div>

                • Lawn Inspection

              </div>

              <div>

                • Grow System Removal

              </div>

              <div>

                • Builder Sign-Off

              </div>

            </div>

          </div>

        `);

        wrap.innerHTML =

          html.join("");

      } catch (e) {

        console.error(e);

      }

    };

  /* =====================================

     SAVE BUILDER TO CRM

  ===================================== */

  window.saveBuilderToCRM =

    function () {

      try {

        const customer =

          val(

            "builderName",

            ""

          ).trim();

        if (!customer) {

          toast(

            "Enter builder name",

            "error"

          );

          return;

        }

        const projectName =

          val(

            "builderProject",

            ""

          ).trim();

        const address =

          prompt(

            "Project Location:"

          ) || "";

        const sqft =

          num("builderSqft", 0);

        const houses =

          num(

            "builderHouses",

            1

          );

        const pkg =

          val(

            "builderPackage",

            "standard"

          );

        const pricingMode =

          val(

            "builderPricingMode",

            "balanced"

          );

        const competitor =

          num(

            "builderCompetitor",

            0

          );

        const result =

          window.calculateJobCore({

            job: {

              sqft,

              houses,

              package: pkg,

              pricingMode,

              competitorPrice:

                competitor,

              pricingStrategy:

                "builder",

              addons: {}

            }

          });

        const builderMult =

          window.getBuilderMultiplier(

            houses

          );

        const price =

          result.price *

          builderMult;

        const proposal = {

          id: Date.now(),

          /* IMPORTANT */

          isBuilderProject: true,

          type: "builder",

          customer,

          projectName,

          address,

          sqft:

            sqft * houses,

          houses,

          packageType: pkg,

          total: price,

          cost: result.cost,

          status:

            "Proposal Sent",

          stage:

            "builder",

          createdAt:

            Date.now()

        };

        let list =

          JSON.parse(

            localStorage.getItem(

              "soda_proposals"

            ) || "[]"

          );

        list.push(proposal);

        localStorage.setItem(

          "soda_proposals",

          JSON.stringify(list)

        );

        if (

          window.renderPipeline

        ) {

          window.renderPipeline();

        }

        if (

          window.renderBuilderCRMPreview

        ) {

          window.renderBuilderCRMPreview();

        }

        toast(

          "Builder project added to CRM",

          "success"

        );

      } catch (e) {

        console.error(e);

        toast(

          "Failed to save builder project",

          "error"

        );

      }

    };

})();