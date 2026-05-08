/* =====================================

   core.js

   SoDa Outdoor Designs

   Pricing Engine + Scheduling + Analytics

===================================== */

(function () {

  "use strict";

  /* =====================================

     CONSTANTS

  ===================================== */

  const COSTS = {

    seed: 3,

    fertilizer: 1.5,

    mulch: 0.35,

    tackifier: 3,

    compost: 60,

    biohum: 25,

    lime: 0.5,

    sulfur: 1,

    biochar: 1.5,

    humic: 2,

    grow: 50

  };

  const MATERIAL_RATES = {

    seed: {

      rate: 5,

      unit: "lbs"

    },

    fertilizer: {

      rate: 4,

      unit: "lbs"

    },

    mulch: {

      rate: 70,

      unit: "lbs"

    },

    tackifier: {

      rate: 3,

      unit: "lbs"

    },

    compost: {

      rate: 0.5,

      unit: "yd3"

    },

    biochar: {

      rate: 10,

      unit: "lbs"

    },

    humic: {

      rate: 1,

      unit: "lbs"

    },

    lime: {

      rate: 4,

      unit: "lbs"

    },

    sulfur: {

      rate: 8,

      unit: "lbs"

    },

    sprinklers: {

      rate: 1,

      unit: "units"

    },

    timers: {

      rate: 1,

      unit: "units"

    }

  };

  window.COSTS = COSTS;

  window.MATERIAL_RATES = MATERIAL_RATES;

  /* =====================================

     HELPERS

  ===================================== */

  function n(v, d = 0) {

    const x = Number(v);

    return Number.isFinite(x)

      ? x

      : d;

  }

  function pct(part, whole) {

    return whole

      ? (part / whole) * 100

      : 0;

  }

  function safeToast(

    msg,

    type = "info"

  ) {

    try {

      if (

        typeof window.showToast ===

        "function"

      ) {

        window.showToast(

          msg,

          type

        );

      }

    } catch (e) {}

  }

  /* =====================================

     BUILDER MULTIPLIER

  ===================================== */

  function getBuilderMultiplier(

    houses

  ) {

    try {

      houses = n(

        houses,

        1

      );

      if (houses <= 1)

        return 1;

      if (houses <= 5)

        return 0.95;

      if (houses <= 10)

        return 0.90;

      if (houses <= 20)

        return 0.85;

      if (houses <= 50)

        return 0.80;

      return 0.75;

    } catch (e) {

      console.error(e);

      return 1;

    }

  }

  /* =====================================

     INVENTORY AVG COST

  ===================================== */

  function getAvgCostFromInventory(

    type,

    inventory

  ) {

    try {

      const items =

        inventory?.[type] || [];

      if (!items.length)

        return COSTS[type] || 0;

      let totalCost = 0;

      let totalQty = 0;

      items.forEach(item => {

        totalCost += n(item.cost);

        totalQty += n(item.qty);

      });

      if (!totalQty)

        return COSTS[type] || 0;

      return totalCost / totalQty;

    } catch (e) {

      console.error(e);

      return COSTS[type] || 0;

    }

  }

  /* =====================================

     MATERIAL NEEDS CORE

  ===================================== */

  function getMaterialNeedsCore(

    input = {},

    packageType = "standard",

    addons = {}

  ) {

    try {

      const sqft =

        n(

          input.totalSqft ||

          input.sqft

        );

      const needs = {

        seed:

          (sqft / 1000) *

          MATERIAL_RATES.seed.rate,

        fertilizer:

          (sqft / 1000) *

          MATERIAL_RATES.fertilizer.rate,

        mulch:

          (sqft / 1000) *

          MATERIAL_RATES.mulch.rate,

        tackifier:

          (sqft / 1000) *

          MATERIAL_RATES.tackifier.rate

      };

      if (

        packageType ===

        "premium"

      ) {

        needs.compost =

          (sqft / 1000) *

          MATERIAL_RATES.compost.rate;

        needs.biochar =

          (sqft / 1000) *

          (

            MATERIAL_RATES.biochar.rate * 0.5

          );

        needs.humic =

          (sqft / 1000) *

          (

            MATERIAL_RATES.humic.rate * 0.5

          );

      }

      if (addons.lime) {

        needs.lime =

          (sqft / 1000) *

          MATERIAL_RATES.lime.rate;

      }

      if (addons.sulfur) {

        needs.sulfur =

          (sqft / 1000) *

          MATERIAL_RATES.sulfur.rate;

      }

      if (addons.biochar) {

        needs.biochar =

          (needs.biochar || 0) +

          (

            (sqft / 1000) *

            MATERIAL_RATES.biochar.rate

          );

      }

      if (addons.humic) {

        needs.humic =

          (needs.humic || 0) +

          (

            (sqft / 1000) *

            MATERIAL_RATES.humic.rate

          );

      }

      return needs;

    } catch (e) {

      console.error(e);

      return {};

    }

  }

  function getMaterialNeeds(

    input = {}

  ) {

    try {

      const s =

        window.state || {};

      return getMaterialNeedsCore(

        input,

        s.job?.package ||

        "standard",

        s.job?.addons || {}

      );

    } catch (e) {

      console.error(e);

      return {};

    }

  }

  /* =====================================

     SMART PRICING

  ===================================== */

  function getSmartPricing(

    totalCost,

    sqft,

    houses,

    pricingMode,

    competitor

  ) {

    try {

      let baseMargin = 0.30;

      if (sqft < 3000)

        baseMargin = 0.40;

      else if (sqft < 8000)

        baseMargin = 0.35;

      else if (sqft < 20000)

        baseMargin = 0.30;

      else

        baseMargin = 0.25;

      if (

        pricingMode === "win"

      ) {

        baseMargin -= 0.10;

      }

      if (houses >= 10)

        baseMargin -= 0.03;

      if (houses >= 20)

        baseMargin -= 0.05;

      if (totalCost > 5000)

        baseMargin += 0.05;

      if (baseMargin < 0.10)

        baseMargin = 0.10;

      if (baseMargin > 0.90)

        baseMargin = 0.90;

      let price =

        totalCost /

        (1 - baseMargin);

      if (competitor > 0) {

        if (competitor > price) {

          price =

            competitor * 0.98;

        } else {

          price = Math.max(

            price,

            competitor * 0.95

          );

        }

      }

      if (

        price <

        totalCost * 1.10

      ) {

        price =

          totalCost * 1.10;

      }

      const profit =

        price - totalCost;

      return {

        price,

        profit,

        margin:

          pct(

            profit,

            price

          )

      };

    } catch (e) {

      console.error(e);

      return {

        price:

          totalCost || 0,

        profit: 0,

        margin: 0

      };

    }

  }

  /* =====================================

     CALCULATE JOB CORE

  ===================================== */

  function calculateJobCore(

    state,

    options = {}

  ) {

    try {

      const inventory =

        state.inventory ||

        (

          window.getInventoryCache?.() || {}

        );

      const sqft =

        n(state.job?.sqft);

      const houses =

        n(

          state.job?.houses,

          1

        );

      const packageType =

        options.packageOverride ||

        state.job?.package ||

        "standard";

      const pricingMode =

        state.job?.pricingMode ||

        "balanced";

      const competitor =

        n(

          state.job?.competitorPrice

        );

      const strategy =

        state.job?.pricingStrategy ||

        "normal";

      const totalSqft =

        sqft * houses;

      const builderMult =

        getBuilderMultiplier(

          houses

        );

     const hourlyRate =

  n(

    state.job?.labor?.hourlyRate,

    50

  );

const crewSize =

  n(

    state.job?.labor?.crewSize,

    2

  );

const overheadPct =

  n(

    state.job?.labor?.overhead,

    12

  );

const productionRate =

  n(

    state.job?.productionRate,

    6000

  );

const hoursPerDay =

  n(

    state.job?.hoursPerDay,

    10

  );

const sprayDays =

  Math.max(

    1,

    Math.ceil(

      (

        totalSqft * 1.08

      ) /

      productionRate

    )

  );

const laborEfficiency =

  1 -

  (

    (1 - builderMult) * 0.5

  );

const totalHours =

  sprayDays *

  hoursPerDay *

  crewSize *

  laborEfficiency;

const laborCost =

  totalHours *

  hourlyRate;

const equipmentCost =

  sprayDays * 250;

      const addons =

        state.job?.addons || {};

      const needs =

        getMaterialNeedsCore(

          {

            totalSqft

          },

          packageType,

          addons

        );

      let materialCost = 0;

      Object.keys(needs)

        .forEach(type => {

          materialCost +=

            needs[type] *

            getAvgCostFromInventory(

              type,

              inventory

            );

        });

      if (materialCost < 500) {

        materialCost = 500;

      }

      if (addons.aeration)

        materialCost += totalSqft * 0.04;

      if (

        addons.compost &&

        packageType !== "premium"

      ) {

        materialCost += totalSqft * 0.10;

      }

      if (addons.biohum)

        materialCost += totalSqft * 0.12;

      if (addons.biochar)

        materialCost += totalSqft * 0.20;

      if (addons.humic)

        materialCost += totalSqft * 0.01;

      if (addons.lime)

        materialCost += totalSqft * 0.004;

      if (addons.sulfur)

        materialCost += totalSqft * 0.008;

      if (addons.grow) {

        const weekly =

          50 * 3 * houses;

        const install =

          packageType === "standard"

            ? houses <= 1

              ? totalSqft * 0.05

              : totalSqft * 0.03

            : 0;

        materialCost +=

          weekly + install;

      }

      const overheadCost =

        (

          materialCost +

          laborCost

        ) *

        (

          overheadPct / 100

        );

 const totalCost =

  materialCost +

  laborCost +

  equipmentCost +

  overheadCost;

      let pricing =

        getSmartPricing(

          totalCost,

          totalSqft,

          houses,

          pricingMode,

          competitor

        );

      let price =

        pricing.price;

      if (

        strategy === "market"

      ) {

        price = Math.max(

          price,

          totalSqft * 0.35

        );

      }

      if (

        strategy === "undercut" &&

        competitor > 0

      ) {

        price =

          competitor * 0.97;

      }

      if (

        strategy === "builder"

      ) {

        price *= 0.92;

      }

      if (

        price <

        totalCost * 1.10

      ) {

        price =

          totalCost * 1.10;

      }

      if (price < 1000) {

        price = 1000;

      }

      const profit =

        price - totalCost;

      const inventoryTotals =

        window.getInventoryTotals?.() || {};

      const comparison =

        window.compareInventory?.(

          needs,

          inventoryTotals

        ) || {};

      return {

        sqft,

        houses,

        totalSqft,

        cost:

          totalCost,

        price,

        profit,

        laborCost,

        overheadCost,
      
        equipmentCost,

        totalHours,
        
        sprayDays,

        productionRate,

        hoursPerDay,
 
        crewSize,

        hourlyRate,

        needs,

        comparison,

        usingFallback: false

      };

    } catch (e) {

      console.error(

        "calculateJobCore failed:",

        e

      );

      return {

        sqft: 0,

        houses: 1,

        totalSqft: 0,

        cost: 0,

        price: 0,

        profit: 0,

        laborCost: 0,

        overheadCost: 0,

        totalHours: 0,

        needs: {},

        comparison: {},

        usingFallback: true

      };

    }

  }

  /* =====================================

     CALCULATE JOB

  ===================================== */

  function calculateJob(

    options = {}

  ) {

    try {

      const s =

        window.state || {};

      return calculateJobCore(

        {

          job:

            s.job || {},

          inventory:

            window.getInventoryCache?.() || {}

        },

        options

      );

    } catch (e) {

      console.error(

        "calculateJob failed:",

        e

      );

      safeToast(

        "Calculation failed",

        "error"

      );

      return {

        sqft: 0,

        houses: 1,

        totalSqft: 0,

        cost: 0,

        price: 0,

        profit: 0,

        laborCost: 0,

        overheadCost: 0,

        totalHours: 0,

        needs: {},

        comparison: {}

      };

    }

  }

  /* =====================================

     BUILD SCHEDULE

  ===================================== */

  window.buildSchedule =

    function (result) {

      try {

        const mode =

          window.state?.ui?.timeline ||

          "standard";

        const addons =

          window.state?.job?.addons || {};

        const sqft =

          result?.totalSqft || 0;

        const houses =

          result?.houses || 1;

        const grow =

          addons.grow === true;

        function getStartDate() {

          const raw =

            document.getElementById(

              "projectStart"

            )?.value;

          if (raw) {

            const d =

              new Date(raw);

            if (!isNaN(d))

              return d;

          }

          return new Date();

        }

        function addDays(

          base,

          days

        ) {

          const d =

            new Date(base);

          d.setDate(

            d.getDate() + days

          );

          return d;

        }

        function fmt(date) {

          return date.toLocaleDateString(

            undefined,

            {

              weekday: "short",

              month: "short",

              day: "numeric",

              year: "numeric"

            }

          );

        }

        const start =

          getStartDate();

        const list = [];

        const soilTasks = [];

        if (addons.aeration)

          soilTasks.push("Aeration");

        if (addons.compost)

          soilTasks.push("Compost");

        if (addons.lime)

          soilTasks.push("Lime Treatment");

        if (addons.sulfur)

          soilTasks.push("Sulfur Treatment");

        if (!soilTasks.length) {

          soilTasks.push(

            "Basic Soil Prep"

          );

        }

        /* FAST */

        if (mode === "fast") {

          list.push({

            day: 1,

            title:

              "Soil Prep Day",

            date:

              fmt(start),

            tasks:

              soilTasks

          });

 const hydroDays =

  result?.sprayDays || 1;

for(let i = 0; i < hydroDays; i++){

  list.push({

    day: i + 2,

    title:

      "Hydroseeding Day",

    date:

      fmt(

        addDays(

          start,

          1 + i

        )

      ),

    tasks: [

      `Production Rate: ${

        (

          result?.productionRate || 6000

        ).toLocaleString()

      } sqft/day`,

      "Hydroseed lawn",

      ...(grow && i === 0

        ? ["Install Grow System"]

        : [])

    ]

  });

}

          list.push({

            day: 3,

            title:

              "Final Lawn Inspection",

            date:

              fmt(

                addDays(

                  start,

                  22

                )

              ),

            tasks: [

              ...(grow

                ? ["Remove Grow System"]

                : []),

              "Final lawn walkthrough"

            ]

          });

          return list;

        }

        /* EXTENDED */

        if (

          mode === "extended"

        ) {

          list.push({

            day: 1,

            title:

              "Soil Prep Day",

            date:

              fmt(start),

            tasks: [

              ...(addons.aeration

                ? ["Aeration"]

                : []),

              ...(addons.lime

                ? ["Lime Treatment"]

                : []),

              ...(addons.sulfur

                ? ["Sulfur Treatment"]

                : [])

            ]

          });

          list.push({

            day: 2,

            title:

              "Compost Day",

            date:

              fmt(

                addDays(

                  start,

                  3

                )

              ),

            tasks: [

              addons.compost

                ? "Apply Compost"

                : "Soil Conditioning"

            ]

          });

const hydroDays =

  result?.sprayDays || 1;

for(let i = 0; i < hydroDays; i++){

  list.push({

    day:

      list.length + 1,

    title:

      "Hydroseeding Day",

    date:

      fmt(

        addDays(

          start,

          6 + i

        )

      ),

    tasks: [

      `Production Rate: ${

        (

          result?.productionRate || 6000

        ).toLocaleString()

      } sqft/day`,

      "Hydroseed lawn",

      ...(grow && i === 0

        ? ["Install Grow System"]

        : [])

    ]

  });

}

          list.push({

            day: 4,

            title:

              "Final Lawn Inspection",

            date:

              fmt(

                addDays(

                  start,

                  34

                )

              ),

            tasks: [

              ...(grow

                ? ["Remove Grow System"]

                : []),

              "Final lawn walkthrough"

            ]

          });

          return list;

        }

        /* STANDARD */

        list.push({

          day: 1,

          title:

            "Soil Prep Day",

          date:

            fmt(start),

          tasks:

            soilTasks

        });

      const productionRate =

  result?.productionRate ||

  6000;

const hydroDays =

  result?.sprayDays || 1;

        for (

          let i = 0;

          i < hydroDays;

          i++

        ) {

          list.push({

            day:

              list.length + 1,

            title:

              "Hydroseeding Day",

            date:

              fmt(

                addDays(

                  start,

                  3 + i

                )

              ),

        tasks: [

  `Production Rate: ${

    (

      result?.productionRate || 6000

    ).toLocaleString()

  } sqft/day`,

  "Hydroseed lawn",

  ...(grow && i === 0

    ? ["Install Grow System"]

    : [])

]

          });

        }

        list.push({

          day:

            list.length + 1,

          title:

            "Final Lawn Inspection",

          date:

            fmt(

              addDays(

                start,

                24

              )

            ),

          tasks: [

            ...(grow

              ? ["Remove Grow System"]

              : []),

            "Final lawn walkthrough"

          ]

        });

        return list;

      } catch (e) {

        console.error(

          "buildSchedule failed:",

          e

        );

        return [];

      }

    };

  /* =====================================

     DEAL SCORE

  ===================================== */

  window.calculateDealScore =

    function (

      result,

      comparison = {}

    ) {

      try {

        let score = 100;

        if (result.margin < 15)

          score -= 25;

        if (result.margin < 10)

          score -= 20;

        Object.values(comparison)

          .forEach(item => {

            if (

              item.status === "short"

            ) {

              score -= 5;

            }

          });

        if (

          result.totalSqft > 20000

        ) {

          score += 5;

        }

        if (

          result.houses > 10

        ) {

          score += 5;

        }

        if (score < 0)

          score = 0;

        if (score > 100)

          score = 100;

        return Math.round(score);

      } catch (e) {

        console.error(e);

        return 75;

      }

    };

  /* =====================================

     AI INSIGHTS

  ===================================== */

  window.generateAIInsights =

    function (

      result,

      comparison = {}

    ) {

      try {

        const insights = [];

        if (result.margin < 15) {

          insights.push({

            type: "warning",

            text:

              "Low projected profit margin."

          });

        }

        if (result.houses > 10) {

          insights.push({

            type: "info",

            text:

              "Large builder project detected."

          });

        }

        Object.keys(comparison)

          .forEach(key => {

            const item =

              comparison[key];

            if (

              item.status === "short"

            ) {

              insights.push({

                type: "warning",

                text:

                  `Inventory shortage: ${key}`

              });

            }

          });

        if (!insights.length) {

          insights.push({

            type: "success",

            text:

              "Project looks profitable."

          });

        }

        return insights;

      } catch (e) {

        console.error(e);

        return [];

      }

    };

/* =====================================

   BUILDER PRICING ENGINE

===================================== */

function calculateBuilderProject(input = {}) {

  try {

    const sqft =

      Number(input.sqft) || 0;

    const houses =

      Number(input.houses) || 1;

    const packageType =

      input.package || "standard";

    const pricingMode =

      input.pricingMode || "balanced";

    const competitor =

      Number(input.competitorPrice) || 0;

    const totalSqft =

      sqft * houses;

    /* =========================

       PRODUCTION RATES

    ========================= */

   const productionRate =

  Number(input.productionRate) ||

  6000;

    const sprayDays =

      Math.max(

        1,

       Math.ceil(

  (

    totalSqft * 1.08

  ) / productionRate

)

      );

    /* =========================

       CREW COSTS

    ========================= */

   const crewSize =

  Number(input.crewSize) || 2;

const hourlyRate =

  Number(input.hourlyRate) || 50;

const hoursPerDay =

  Number(input.hoursPerDay) || 10;

const laborHours =

  sprayDays *

  hoursPerDay *

  crewSize;

const laborCost =

  laborHours *

  hourlyRate;

    /* =========================

       MATERIAL COSTS

    ========================= */

    let materialRate =

      packageType === "premium"

        ? 0.16

        : 0.11;

    /* bulk efficiency */

    if(totalSqft > 50000){

      materialRate *= 0.92;

    }

    if(totalSqft > 100000){

      materialRate *= 0.88;

    }

    const materialCost =

      totalSqft * materialRate;

    /* =========================

       MOBILIZATION

    ========================= */

    let mobilization =

      750;

    if(houses >= 20){

      mobilization = 1500;

    }

    if(houses >= 50){

      mobilization = 2500;

    }

/* =========================

   EQUIPMENT / OVERHEAD

========================= */

const equipmentCost =

  sprayDays * 250;

const overhead =

  (

    laborCost +

    materialCost +

    equipmentCost

  ) * 0.18;

/* =========================

   TOTAL COST

========================= */

const totalCost =

  laborCost +

  materialCost +

  equipmentCost +

  overhead +

  mobilization;

    /* =========================

       TARGET MARGINS

    ========================= */

    let targetMargin = 0.32;

    if(pricingMode === "win"){

      targetMargin = 0.24;

    }

    if(pricingMode === "balanced"){

      targetMargin = 0.30;

    }

    /* =========================

       BUILDER DISCOUNT

    ========================= */

    let builderDiscount = 0;

    if(houses >= 10){

      builderDiscount = 0.03;

    }

    if(houses >= 25){

      builderDiscount = 0.05;

    }

    if(houses >= 50){

      builderDiscount = 0.08;

    }

    /* =========================

       FINAL PRICE

    ========================= */

    let price =

      totalCost / (1 - targetMargin);

    price =

      price * (1 - builderDiscount);

    /* =========================

       COMPETITOR LOGIC

    ========================= */

    if(

      competitor > 0 &&

      competitor < price

    ){

      price = competitor * 0.98;

    }

    /* =========================

       HARD MINIMUMS

    ========================= */

    const minimumMargin = 0.18;

    const minimumPrice =

      totalCost / (1 - minimumMargin);

    if(price < minimumPrice){

      price = minimumPrice;

    }

    if(price < 2500){

      price = 2500;

    }

    /* =========================

       PROFITS

    ========================= */

    const profit =

      price - totalCost;

 const margin =

  price > 0

    ? (profit / price) * 100

    : 0;

    return {

      sqft,

      houses,

      totalSqft,

      sprayDays,

      laborCost,

      materialCost,

      overhead,

      mobilization,

      equipmentCost,

      totalCost,

      price,

      profit,

      margin,
      
      productionRate,

      hoursPerDay,

      laborHours,

      crewSize,
  
      hourlyRate,

     pricePerHouse:

  houses > 0

    ? price / houses

    : 0,

pricePerSqft:

  totalSqft > 0

    ? price / totalSqft

    : 0,

      builderDiscount:

        builderDiscount * 100,

      packageType

    };

  } catch (e) {

    console.error(

      "calculateBuilderProject failed:",

      e

    );

    return null;

  }

}

window.calculateBuilderProject =

  calculateBuilderProject;

  /* =====================================

     GLOBAL EXPORTS

  ===================================== */

  window.calculateJob =

    calculateJob;

  window.calculateJobCore =

    calculateJobCore;

  window.getMaterialNeeds =

    getMaterialNeeds;

  window.getMaterialNeedsCore =

    getMaterialNeedsCore;

  window.getBuilderMultiplier =

    getBuilderMultiplier;

  window.getAvgCostFromInventory =

    getAvgCostFromInventory;

  window.getSmartPricing =

    getSmartPricing;

})();

