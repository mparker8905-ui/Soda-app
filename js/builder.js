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

    const crewSize =

      n(

        document.getElementById("crewSize")?.value,

        3

      );

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

    const overheadPct =

      n(

        document.getElementById("overhead")?.value,

        12

      );

    const mobilization =

      n(

        document.getElementById("mobilization")?.value,

        750

      );

    const targetMargin =

      n(

        document.getElementById("targetMargin")?.value,

        30

      ) / 100;

    /* =====================================

       TOTAL SQFT

    ===================================== */

    const totalSqft =

      Math.max(

        1,

        sqft * houses

      );

    /* =====================================

       SPRAY DAYS

    ===================================== */

    const sprayDays =

      Math.max(

        1,

        Math.ceil(

          totalSqft / productionRate

        )

      );

    /* =====================================

       LABOR HOURS

    ===================================== */

    const totalLaborHours =

      sprayDays *

      hoursPerDay *

      crewSize;

    const laborCost =

      totalLaborHours *

      hourlyRate;

    /* =====================================

       INVENTORY

    ===================================== */

   const inventory =

  window.getInventoryCache?.() || {};

    /* =====================================

       CORE CALC

    ===================================== */

   const result =

  window.calculateBuilderProject({

    sqft,

    houses,

    package: pkg,

    pricingMode,

    competitorPrice:

      competitor,

    productionRate,

    crewSize,

    hourlyRate,

    hoursPerDay,

    addons

  });

    /* =====================================

       MATERIAL COST

    ===================================== */

    const materialCost =

      n(result.materialCost);

    /* =====================================

       OVERHEAD

    ===================================== */

    const overheadCost =

      (

        laborCost +

        materialCost +

        mobilization

      ) *

      (overheadPct / 100);

    /* =====================================

       TOTAL COST

    ===================================== */

    const totalCost =

      laborCost +

      materialCost +

      mobilization +

      overheadCost;

    /* =====================================

       BUILDER PRICE

    ===================================== */

    const builderPrice =

      totalCost /

      (1 - targetMargin);

    const profit =

      builderPrice - totalCost;

    const margin =

      builderPrice > 0

        ? (profit / builderPrice) * 100

        : 0;

    /* =====================================

       METRICS

    ===================================== */

    const pricePerHouse =

      houses > 0

        ? builderPrice / houses

        : 0;

    const pricePerSqft =

      totalSqft > 0

        ? builderPrice / totalSqft

        : 0;

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

  ${money(

    Object.values(

      result.addonCosts || {}

    ).reduce((a,b)=>a+b,0)

  )}

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

          ${crewSize}

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
          ${money(materialCost)}

        </div>

    ${addonHTML}
     
          Mobilization:

          ${money(mobilization)}

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

      sprayDays,

      productionRate,

      totalLaborHours,

      laborCost,

      materialCost,

      mobilization,

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