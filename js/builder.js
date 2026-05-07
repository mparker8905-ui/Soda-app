/* =====================================

   builder.js

   SoDa Outdoor Designs

   Builder Production Pricing Engine UI

===================================== */

(function(){

"use strict";

/* =====================================

   CALCULATE BUILDER UI

===================================== */

window.calculateBuilderUI = function(){

  try{

    const sqft =

      Number(

        document.getElementById("builderSqft")?.value

      ) || 0;

    const houses =

      Number(

        document.getElementById("builderHouses")?.value

      ) || 1;

    const start =

      document.getElementById("builderStart")?.value;

    const pkg =

      document.getElementById("builderPackage")?.value ||

      "standard";

    const pricingMode =

      document.getElementById("builderPricingMode")?.value ||

      "balanced";

    const competitor =

      Number(

        document.getElementById("builderCompetitor")?.value

      ) || 0;

    /* =========================

       BUILDER ENGINE

    ========================= */

    const result =

      window.calculateBuilderProject({

        sqft,

        houses,

        package: pkg,

        pricingMode,

        competitorPrice: competitor

      });

    if(!result){

      showToast(

        "Builder calculation failed",

        "error"

      );

      return;

    }

    /* =========================

       RENDER RESULTS

    ========================= */

    document.getElementById(

      "builderResults"

    ).innerHTML = `

      <div class="glass-card">

        <h3>Builder Summary</h3>

        <div>Houses: ${result.houses}</div>

        <div>Total Sqft: ${result.totalSqft.toLocaleString()}</div>

        <div>Estimated Spray Days: ${result.sprayDays}</div>

        <div>Package: ${result.packageType}</div>

      </div>

      <div class="glass-card">

        <h3>Financials</h3>

        <div>Total Cost: $${result.totalCost.toFixed(2)}</div>

        <div>Builder Price: $${result.price.toFixed(2)}</div>

        <div>Profit: $${result.profit.toFixed(2)}</div>

        <div>Margin: ${result.margin.toFixed(1)}%</div>

      </div>

      <div class="glass-card">

        <h3>Production Metrics</h3>

        <div>Labor Cost: $${result.laborCost.toFixed(2)}</div>

        <div>Material Cost: $${result.materialCost.toFixed(2)}</div>

        <div>Mobilization: $${result.mobilization.toFixed(2)}</div>

        <div>Overhead: $${result.overhead.toFixed(2)}</div>

      </div>

      <div class="glass-card">

        <h3>Builder Metrics</h3>

        <div>Price Per House: $${result.pricePerHouse.toFixed(2)}</div>

        <div>Price Per Sqft: $${result.pricePerSqft.toFixed(2)}</div>

        <div>Builder Discount: ${result.builderDiscount.toFixed(1)}%</div>

      </div>

    `;

    /* =========================

       SCHEDULE

    ========================= */

    renderBuilderSchedule(

      start,

      houses

    );

    /* =========================

       SUCCESS

    ========================= */

    showToast(

      "Builder project calculated",

      "success"

    );

  } catch(e){

    console.error(e);

    showToast(

      "Builder calculation failed",

      "error"

    );

  }

};

/* =====================================

   BUILDER SCHEDULE

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

          Select a project start date

        </div>

      `;

      return;

    }

    const start =

      new Date(startDate);

    function addDays(d, days){

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

          day:"numeric",

          year:"numeric"

        }

      );

    }

    /* =========================

       SPRAY DAYS

    ========================= */

    const hydroDays =

      houses >= 50 ? 7 :

      houses >= 25 ? 5 :

      houses >= 10 ? 3 :

      houses >= 5 ? 2 : 1;

    const html = [];

    /* =========================

       SOIL PREP

    ========================= */

    html.push(`

      <div class="glass-card">

        <strong>Soil Prep Phase</strong>

        <div class="muted">

          ${fmt(start)}

        </div>

        <div style="margin-top:8px;">

          • Site prep<br>

          • Grading review<br>

          • Access planning

        </div>

      </div>

    `);

    /* =========================

       HYDROSEED PHASES

    ========================= */

    for(let i = 0; i < hydroDays; i++){

      html.push(`

        <div class="glass-card">

          <strong>

            Hydroseed Production Day ${i + 1}

          </strong>

          <div class="muted">

            ${fmt(addDays(start, 3 + i))}

          </div>

          <div style="margin-top:8px;">

            • Production hydroseeding<br>

            • Crew deployment<br>

            • Material loading

          </div>

        </div>

      `);

    }

    /* =========================

       FINAL INSPECTION

    ========================= */

    html.push(`

      <div class="glass-card">

        <strong>Final Inspection</strong>

        <div class="muted">

          ${fmt(addDays(start, 24))}

        </div>

        <div style="margin-top:8px;">

          • Builder walkthrough<br>

          • Coverage inspection<br>

          • Punch list review

        </div>

      </div>

    `);

    wrap.innerHTML =

      html.join("");

  } catch(e){

    console.error(e);

  }

};

/* =====================================

   SAVE BUILDER TO CRM

===================================== */

window.saveBuilderToCRM = function(){

  try{

    const customer =

      prompt("Builder / Project Name:");

    if(!customer) return;

    const address =

      prompt("Project Location:") || "";

    const sqft =

      Number(

        document.getElementById("builderSqft")?.value

      ) || 0;

    const houses =

      Number(

        document.getElementById("builderHouses")?.value

      ) || 1;

    const pkg =

      document.getElementById("builderPackage")?.value ||

      "standard";

    const pricingMode =

      document.getElementById("builderPricingMode")?.value ||

      "balanced";

    const competitor =

      Number(

        document.getElementById("builderCompetitor")?.value

      ) || 0;

    /* =========================

       BUILDER ENGINE

    ========================= */

    const result =

      window.calculateBuilderProject({

        sqft,

        houses,

        package: pkg,

        pricingMode,

        competitorPrice: competitor

      });

    if(!result){

      showToast(

        "Unable to save project",

        "error"

      );

      return;

    }

    /* =========================

       CRM PROPOSAL

    ========================= */

    const proposal = {

      id: Date.now(),

      type: "builder",

      customer,

      address,

      sqft: result.totalSqft,

      houses,

      packageType: pkg,

      pricingMode,

      total: result.price,

      cost: result.totalCost,

      profit: result.profit,

      margin: result.margin,

      sprayDays: result.sprayDays,

      status: "Proposal Sent",

      stage: "builder",

      createdAt: Date.now()

    };

    /* =========================

       SAVE

    ========================= */

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

    /* =========================

       RERENDER

    ========================= */

    if(window.renderPipeline){

      window.renderPipeline();

    }

    if(window.refreshCRM){

      window.refreshCRM();

    }

    /* =========================

       SUCCESS

    ========================= */

    showToast(

      "Builder project added to CRM",

      "success"

    );

  } catch(e){

    console.error(e);

    showToast(

      "Save failed",

      "error"

    );

  }

};

/* =====================================

   OPTIONAL REFRESH

===================================== */

window.refreshBuilderPage = function(){

  try{

    if(window.calculateBuilderUI){

      calculateBuilderUI();

    }

  } catch(e){

    console.error(e);

  }

};

})();