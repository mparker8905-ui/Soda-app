/* =====================================

   builder.js

   SoDa Outdoor Designs

   Builder Estimator + CRM + Materials

===================================== */

(function(){

"use strict";

/* =====================================

   HELPERS

===================================== */

function n(v,d=0){

  const x = Number(v);

  return Number.isFinite(x)

    ? x

    : d;

}

function money(v){

  return "$" + n(v).toFixed(2);

}

/* =====================================

   MAIN CALCULATOR

===================================== */

window.calculateBuilderUI = function(){

  try{

    /* =====================================

       BASIC INPUTS

    ===================================== */

    const sqft =

      n(

        document.getElementById("builderSqft")?.value,

        0

      );

    const houses =

      n(

        document.getElementById("builderHouses")?.value,

        1

      );

    const addons = {

  aeration:

    !!document.getElementById(

      "builderAddon_aeration"

    )?.checked,

  compost:

    !!document.getElementById(

      "builderAddon_compost"

    )?.checked,

  biohum:

    !!document.getElementById(

      "builderAddon_biohum"

    )?.checked,

  biochar:

    !!document.getElementById(

      "builderAddon_biochar"

    )?.checked,

  humic:

    !!document.getElementById(

      "builderAddon_humic"

    )?.checked,

  grow:

    !!document.getElementById(

      "builderAddon_grow"

    )?.checked,

  lime:

    !!document.getElementById(

      "builderAddon_lime"

    )?.checked,

  sulfur:

    !!document.getElementById(

      "builderAddon_sulfur"

    )?.checked

};
    const start =

      document.getElementById("builderStart")?.value || "";

    const pkg =

      document.getElementById("builderPackage")?.value ||

      "standard";

    const pricingMode =

      document.getElementById("builderPricingMode")?.value ||

      "balanced";

    const competitor =

      n(

        document.getElementById("builderCompetitor")?.value,

        0

      );

    /* =====================================

       LABOR INPUTS

    ===================================== */

  

    const hourlyRate =

      n(

        document.getElementById("hourlyRate")?.value,

        25

      );

    const productionRate =

      n(

        document.getElementById("productionRate")?.value,

        10000

      );

    const hoursPerDay =

      n(

        document.getElementById("hoursPerDay")?.value,

        8

      );



    /* =====================================

       TOTAL SQFT

    ===================================== */

    const totalSqft =

      Math.max(

        1,

        sqft * houses

      );



   

    /* =====================================

       CORE CALC

    ===================================== */

const tankSize =

  Number(

    document.getElementById(

      "builderTankSize"

    )?.value

  ) || 300;

const result =

  window.calculateBuilderProject({

    sqft,

    houses,

    package: pkg,

    pricingMode,

    competitorPrice:

      competitor,

    hourlyRate,

    hoursPerDay,

    tankSize,

    refillMinutes:

      Number(

        document.getElementById(

          "builderRefillMinutes"

        )?.value

      ) || 0,

    addons

  });

const sprayDays =

  result.sprayDays || 0;

const totalLaborHours =

  result.laborHours || 0;

const laborCost =

  result.laborCost || 0;

const overheadCost =

  result.overhead || 0;

const totalCost =

  result.totalCost || 0;

const builderPrice =

  result.price || 0;

const profit =

  result.profit || 0;

const margin =

  result.margin || 0;

const pricePerHouse =

  result.pricePerHouse || 0;

const pricePerSqft =

  result.pricePerSqft || 0;

    /* =====================================

       MATERIAL COST

    ===================================== */

    const materialCost =

      n(result.materialCost);

  

  

    /* =====================================

       METRICS

    ===================================== */

    const builderDiscount =

      (

        1 -

        window.getBuilderMultiplier(houses)

      ) * 100;

    /* =====================================

       MATERIALS

    ===================================== */

    const materialsHTML =

      Object.entries(result.needs || {})

        .map(([key,val]) => {

          const unit =

            window.MATERIAL_RATES?.[key]?.unit ||

            "";

          return `

            <div class="metric">

              <div class="metric-label">

                ${key.toUpperCase()}

              </div>

              <div class="metric-value">

                ${Number(val).toFixed(1)} ${unit}

              </div>

            </div>

          `;

        })

        .join("");

    /* =====================================

       INVENTORY SHORTAGES

    ===================================== */

 const shortages =

  result.comparison || {};

const dealScore =

  window.calculateDealScore(

    result,

    result.comparison

  );

const insights =

  window.generateAIInsights(

    result,

    result.comparison

  );

    const shortageHTML =

      Object.entries(shortages)

        .filter(([_,v]) => v.shortage > 0)

        .map(([key,v]) => `

          <div class="metric">

            <div class="metric-label">

              ${key.toUpperCase()}

            </div>

            <div class="metric-value bad">

              Short ${v.shortage.toFixed(1)}

            </div>

          </div>

        `)

        .join("");

    /* =====================================

       RENDER

    ===================================== */

const addonTotal =

  Object.values(

    result.addonCosts || {}

  ).reduce(

    (a,b) => a + b,

    0

  );

const addonHTML =

  Object.entries(

    result.addonCosts || {}

  )

  .map(([key,val]) => `

    <div>

      Add-on (${key}):

      ${money(val)}

    </div>

  `)

  .join("");

    document.getElementById(

      "builderResults"

    ).innerHTML = `

      <div class="glass-card">

        <h3>Builder Summary</h3>

        <div>Houses: ${houses}</div>

        <div>

          Total Sqft:

          ${totalSqft.toLocaleString()}

        </div>

        <div>

          Estimated Spray Days:

          ${sprayDays}

        </div>

        <div>

          Package:

          ${pkg}

        </div>

      </div>

      <div class="glass-card">

        <h3>Financials</h3>

        <div>

          Total Cost:

          ${money(totalCost)}

        </div>
        
        <div>

  Equipment:

  ${money(result.equipmentCost)}

</div>

<div>

  Mobilization:

  ${money(result.mobilization)}

</div>

<div>

  Overhead:

  ${money(result.overhead)}

</div>

<div>

  Add-ons:

  ${money(addonTotal)}

</div>

        <div>

          Builder Price:

          ${money(builderPrice)}

        </div>

        <div>

          Profit:

          ${money(profit)}

        </div>

        <div>

          Margin:

          ${margin.toFixed(1)}%

        </div>

      </div>

      <div class="glass-card">

        <h3>Production Metrics</h3>

        <div>

          Spray Days:

          ${sprayDays}

        </div>

        <div>

          Crew Size:

         ${result.crewSize}

        </div>

        <div>

          Production Rate:

          ${productionRate.toLocaleString()} sqft/day

        </div>

        <div>

          Total Labor Hours:

          ${totalLaborHours.toFixed(1)}

        </div>

        <div>

          Labor Cost:

          ${money(laborCost)}

        </div>

        <div>

          Material Cost:
  
          ${money(materialCost)}

        </div>

    ${addonHTML}
     
        <div>
     
         Mobilization:

          ${money(result.mobilization)}

        </div>

        <div>

          Overhead:

          ${money(overheadCost)}

        </div>

      </div>

      <div class="glass-card">

        <h3>Material Usage</h3>

        ${materialsHTML}

      </div>

      <div class="glass-card">

        <h3>Inventory Shortages</h3>

        ${

          shortageHTML ||

          `<div class="good">

            Inventory levels sufficient

          </div>`

        }

      </div>

      <div class="glass-card">

  <h3>Deal Score</h3>

  <div class="deal-score">

    ${dealScore}/100

  </div>

</div>

<div class="glass-card">

  <h3>AI Insights</h3>

  ${

    insights.length

      ? insights.map(item => `

        <div class="insight ${item.type}">

          ${item.text}

        </div>

      `).join("")

      : `

        <div class="insight success">

          No issues detected.

        </div>

      `

  }

</div>

      <div class="glass-card">

        <h3>Builder Metrics</h3>

        <div>

          Price Per House:

          ${money(pricePerHouse)}

        </div>

        <div>

          Price Per Sqft:

          ${money(pricePerSqft)}

        </div>

        <div>

          Builder Discount:

          ${builderDiscount.toFixed(1)}%

        </div>

      </div>

    `;

   

    /* =====================================

       SCHEDULE

    ===================================== */

    renderBuilderSchedule(

      start,

      totalSqft,

      productionRate

    );

    /* =====================================

       SAVE LAST RESULT

    ===================================== */

    window.lastBuilderResult = {

      ...result,

      addonCosts:

      result.addonCosts || {},

      totalSqft,

      builderPrice,

      profit,

      margin,

      houses,

      packageType: pkg,

      rainDays:

  Number(

    document.getElementById(

      "builderRainDays"

    )?.value

  ) || 0,

      sprayDays,

      productionRate,

      totalLaborHours,

      laborCost,

      materialCost,

     mobilization:

      result.mobilization,

      overheadCost,
      
      overhead:

      overheadCost,

      totalCost,

      price:

      builderPrice,

      pricePerSqft,

    };

    showToast(

      "Builder project calculated",

      "success"

    );

  }catch(e){

    console.error(e);

    showToast(

      "Builder calculation failed",

      "error"

    );

  }

};

/* =====================================

   SCHEDULE

===================================== */

window.renderBuilderSchedule = function(

  startDate,

  totalSqft,

  productionRate

){

  try{

    const wrap =

      document.getElementById(

        "builderSchedule"

      );

    if(!wrap) return;

    if(!startDate){

      wrap.innerHTML = `

        <div class="muted">

          Select a start date

        </div>

      `;

      return;

    }

    const start =

      new Date(startDate);
  
    const rainDays =

  Number(

    document.getElementById(

      "builderRainDays"

    )?.value

  ) || 0;

    function addDays(d,days){

      const x = new Date(d);

      x.setDate(

        x.getDate() + days

      );

      return x;

    }

    function fmt(d){

      return d.toLocaleDateString(

        undefined,

        {

          month:"short",

          day:"numeric"

        }

      );

    }

    const hydroDays =

      Math.max(

        1,

        Math.ceil(

          totalSqft / productionRate

        )

      );

    const html = [];

    html.push(`

      <div class="glass-card">

        <strong>

          Soil Prep Phase

        </strong>

        <div>${fmt(start)}</div>

      </div>

    `);

    for(let i=0;i<hydroDays;i++){

      html.push(`

        <div class="glass-card">

          <strong>

            Hydroseed Phase

          </strong>

          <div>

            ${fmt(

  addDays(

    start,

    3 + i + rainDays

  )


)}

          </div>

        </div>

      `);

    }

    html.push(`

      <div class="glass-card">

        <strong>

          Final Inspection

        </strong>

        <div>

          ${fmt(

  addDays(

    start,

    24 + rainDays

  )

)}

        </div>

      </div>

    `);

    wrap.innerHTML =

      html.join("");

  }catch(e){

    console.error(e);

  }

};

})();

/* =====================================

   BUILDER PAGE HELPERS

===================================== */

document.addEventListener("DOMContentLoaded",

  function () {

    refreshBuilderPage();

  }

);

function refreshBuilderPage() {

  try {

    if (

      window.renderBuilderCRMPreview

    ) {

      renderBuilderCRMPreview();

    }

    if (window.showToast) {

      showToast(

        "Builder Page Refreshed",

        "success"

      );

    }

  } catch (e) {

    console.error(

      "refreshBuilderPage failed:",

      e

    );

  }

}

/* =====================================

   BUILDER CRM PREVIEW

===================================== */

function renderBuilderCRMPreview() {

  const wrap =

    document.getElementById(

      "builderCRMPreview"

    );

  if (!wrap) return;

  try {

    const list = JSON.parse(

      localStorage.getItem(

        "soda_proposals"

      ) || "[]"

    );

  const builders = list.filter(

  p => p.type === "builder"

);

    if (!builders.length) {

      wrap.innerHTML = `

        <div class="card-sub">

          No builder projects yet.

        </div>

      `;

      return;

    }

    wrap.innerHTML = builders.map(p => `

      <div class="history-card">

        <div class="history-top">

          <strong>

            ${safeHTML(

              p.customer || "Builder"

            )}

          </strong>

          <span>

            ${p.status || "Proposal"}

          </span>

        </div>

        <div class="history-details">

          ${safeHTML(

            p.address || ""

          )}

        </div>

        <div class="history-date mt-10">

          Houses:

          ${Number(

            p.houses || 0

          )}

        </div>

        <div class="history-date">

          Total:

          $${Number(

            p.total || 0

          ).toFixed(0)}

        </div>

      </div>

    `).join("");

  } catch (e) {

    console.error(e);

  }

}

/* =====================================

   HTML ESCAPE

===================================== */

function safeHTML(str) {

  return String(str || "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}

/* =====================================

   EXPORTS

===================================== */

window.refreshBuilderPage =

  refreshBuilderPage;

window.renderBuilderCRMPreview =

  renderBuilderCRMPreview;