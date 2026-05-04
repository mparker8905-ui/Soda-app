(function(){

"use strict";

window.calculateBuilderUI = function(){

  try{

    const sqft =
      Number(document.getElementById("builderSqft")?.value) || 0;

    const houses =
      Number(document.getElementById("builderHouses")?.value) || 1;

    const start =
      document.getElementById("builderStart")?.value;

    const pkg =
      document.getElementById("builderPackage")?.value;

    const pricingMode =
      document.getElementById("builderPricingMode")?.value;

    const competitor =
      Number(document.getElementById("builderCompetitor")?.value) || 0;

    const totalSqft = sqft * houses;

    const result =
      window.calculateJobCore({
        job:{
          sqft,
          houses,
          package:pkg,
          pricingMode,
          competitorPrice:competitor,
          addons:{}
        }
      });

    const builderMult =
      window.getBuilderMultiplier(houses);

    const builderPrice =
      result.price * builderMult;

    const profit =
      builderPrice - result.cost;

    const margin =
      (profit / builderPrice) * 100;

    document.getElementById("builderResults").innerHTML = `

      <div class="glass-card">
        <h3>Builder Summary</h3>
        <div>Total Sqft: ${totalSqft.toLocaleString()}</div>
        <div>Houses: ${houses}</div>
      </div>

      <div class="glass-card">
        <h3>Financials</h3>
        <div>Total Cost: $${result.cost.toFixed(2)}</div>
        <div>Builder Price: $${builderPrice.toFixed(2)}</div>
        <div>Profit: $${profit.toFixed(2)}</div>
        <div>Margin: ${margin.toFixed(1)}%</div>
      </div>

    `;

    renderBuilderSchedule(start, houses);

    showToast("Builder project calculated","success");

  }catch(e){
    console.error(e);
    showToast("Builder calculation failed","error");
  }

};

window.renderBuilderSchedule = function(startDate, houses){

  try{

    if(!startDate){
      document.getElementById("builderSchedule").innerHTML =
        `<div class="muted">Select a start date</div>`;
      return;
    }

    const start = new Date(startDate);

    function addDays(d, days){
      const x = new Date(d);
      x.setDate(x.getDate() + days);
      return x;
    }

    function fmt(d){
      return d.toLocaleDateString(undefined,{
        month:"short",
        day:"numeric"
      });
    }

    const hydroDays =
      houses > 10 ? 3 :
      houses > 5 ? 2 : 1;

    const html = [];

    html.push(`
      <div class="glass-card">
        <strong>Soil Prep Phase</strong>
        <div>${fmt(start)}</div>
      </div>
    `);

    for(let i=0;i<hydroDays;i++){
      html.push(`
        <div class="glass-card">
          <strong>Hydroseed Phase</strong>
          <div>${fmt(addDays(start,3+i))}</div>
        </div>
      `);
    }

    html.push(`
      <div class="glass-card">
        <strong>Final Inspection</strong>
        <div>${fmt(addDays(start,24))}</div>
      </div>
    `);

    document.getElementById("builderSchedule").innerHTML =
      html.join("");

  }catch(e){
    console.error(e);
  }

};

})();

//=======================
//SAVE BUILDER TO CRM
//=======================

window.saveBuilderToCRM = function(){

  try{

    const customer = prompt("Builder / Project Name:");

    if(!customer) return;

    const address = prompt("Project Location:");

    

    const sqft =

      Number(document.getElementById("builderSqft")?.value) || 0;

    const houses =

      Number(document.getElementById("builderHouses")?.value) || 1;

    const pkg =

      document.getElementById("builderPackage")?.value || "standard";

    const result =

      window.calculateJobCore({

        job:{

          sqft,

          houses,

          package:pkg,

          addons:{}

        }

      });

    const builderMult =

      window.getBuilderMultiplier(houses);

    const price =

      result.price * builderMult;

    const proposal = {

      id: Date.now(),

      type: "builder", // 🔥 IMPORTANT FLAG

      customer,

      address,

      sqft: sqft * houses,

      houses,

      packageType: pkg,

      total: price,

      cost: result.cost,

      status: "Proposal Sent",

      stage: "proposal",

      createdAt: Date.now()

    };

    let list =

      JSON.parse(localStorage.getItem("soda_proposals") || "[]");

    list.push(proposal);

    localStorage.setItem(

      "soda_proposals",

      JSON.stringify(list)

    );

    if(window.renderPipeline){

      window.renderPipeline();

    }

    showToast("Builder project added to CRM","success");

  }catch(e){

    console.error(e);

  }

};