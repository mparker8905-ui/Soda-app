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

    const totalSqft =

      Math.max(1, sqft * houses);

    /* =====================================

       INVENTORY

    ===================================== */

    const inventory =

      window.getInventoryCache?.(true) || {};

    /* =====================================

       CORE CALC

    ===================================== */

    const result =

      window.calculateJobCore({

        inventory,

        job:{

          sqft,

          houses,

          package: pkg,

          pricingMode,

          competitorPrice: competitor,

          labor:{

            hourlyRate: 75,

            hoursPerHouse: 3,

            crewSize: 2,

            overhead: 12

          },

          addons:{}

        }

      });

    /* =====================================

       BUILDER PRICE

    ===================================== */

    const targetMargin = 0.30;

    const builderPrice =

      result.cost / (1 - targetMargin);

    const profit =

      builderPrice - result.cost;

    const margin =

      builderPrice > 0

        ? (profit / builderPrice) * 100

        : 0;

    const pricePerHouse =

      houses > 0

        ? builderPrice / houses

        : 0;

    const pricePerSqft =

      totalSqft > 0

        ? builderPrice / totalSqft

        : 0;

    const builderDiscount =

      (1 -

        window.getBuilderMultiplier(houses)

      ) * 100;

    const sprayDays =

      houses > 10

        ? 3

        : houses > 5

        ? 2

        : 1;

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

    const inventoryTotals =

      window.getInventoryTotals?.() || {};

    const shortages =

      window.compareInventory?.(

        result.needs,

        inventoryTotals

      ) || {};

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

          ${money(result.cost)}

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

          Labor Cost:

          ${money(result.laborCost)}

        </div>

        <div>

          Material Cost:

          ${money(

            result.cost -

            result.laborCost -

            result.overheadCost

          )}

        </div>

        <div>

          Mobilization:

          $750.00

        </div>

        <div>

          Overhead:

          ${money(result.overheadCost)}

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

    renderBuilderSchedule(

      start,

      houses

    );

    window.lastBuilderResult = {

      ...result,

      totalSqft,

      builderPrice,

      profit,

      margin,

      houses,

      packageType: pkg

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

  houses

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

      houses > 10

        ? 3

        : houses > 5

        ? 2

        : 1;

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

            ${fmt(addDays(start,3+i))}

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

          ${fmt(addDays(start,24))}

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

   SAVE BUILDER TO CRM

===================================== */

window.saveBuilderToCRM = function(){

  try{

    if(!window.lastBuilderResult){

      showToast(

        "Calculate builder project first",

        "warning"

      );

      return;

    }

    const customer =

      prompt("Builder / Project Name:");

    if(!customer) return;

    const address =

      prompt("Project Location:");

    const result =

      window.lastBuilderResult;

    const proposal = {

      id: Date.now(),

      type: "builder",

      customer,

      address,

      sqft: result.totalSqft,

      houses: result.houses,

      packageType:

        result.packageType,

      total:

        result.builderPrice,

      cost:

        result.cost,

      needs:

        result.needs,

      status:

        "Proposal Sent",

      stage:

        "proposal",

      createdAt:

        Date.now()

    };

    let list = JSON.parse(

      localStorage.getItem(

        "soda_proposals"

      ) || "[]"

    );

    list.push(proposal);

    localStorage.setItem(

      "soda_proposals",

      JSON.stringify(list)

    );

    if(window.renderPipeline){

      window.renderPipeline();

    }

    showToast(

      "Builder project added to CRM",

      "success"

    );

  }catch(e){

    console.error(e);

  }

};