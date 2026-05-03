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

    seed: { rate: 5, unit: "lbs" },

    fertilizer: { rate: 4, unit: "lbs" },

    mulch: { rate: 70, unit: "lbs" },

    tackifier: { rate: 3, unit: "lbs" },

    compost: { rate: 0.5, unit: "yd3" },

    biochar: { rate: 10, unit: "lbs" },

    humic: { rate: 1, unit: "lbs" },

    lime: { rate: 4, unit: "lbs" },

    sulfur: { rate: 8, unit: "lbs" },

    sprinklers: { rate: 1, unit: "units" },

    timers: { rate: 1, unit: "units" }

  };

  window.COSTS = COSTS;

  window.MATERIAL_RATES = MATERIAL_RATES;

  /* =====================================

     HELPERS

  ===================================== */

  function n(v, d = 0) {

    const x = Number(v);

    return Number.isFinite(x) ? x : d;

  }

  function pct(part, whole) {

    return whole ? (part / whole) * 100 : 0;

  }

  function safeToast(msg, type = "info") {

    try {

      if (typeof window.showToast === "function") {

        window.showToast(msg, type);

      }

    } catch (e) {}

  }

  /* =====================================

     BUILDER MULTIPLIER

  ===================================== */

  function getBuilderMultiplier(houses) {

    try {

      houses = n(houses, 1);

      if (houses <= 1) return 1;

      if (houses <= 5) return 0.95;

      if (houses <= 10) return 0.9;

      if (houses <= 20) return 0.85;

      if (houses <= 50) return 0.8;

      return 0.75;

    } catch (e) {

      console.error(e);

      return 1;

    }

  }

  /* =====================================

     INVENTORY AVG COST

  ===================================== */

  function getAvgCostFromInventory(type, inventory) {

    try {

      const items = inventory?.[type] || [];

      if (!items.length) return COSTS[type] || 0;

      let totalCost = 0;

      let totalQty = 0;

      items.forEach(item => {

        totalCost += n(item.cost);

        totalQty += n(item.qty);

      });

      if (!totalQty) return COSTS[type] || 0;

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

      const sqft = n(input.totalSqft || input.sqft);

      const needs = {

        seed: (sqft / 1000) * MATERIAL_RATES.seed.rate,

        fertilizer: (sqft / 1000) * MATERIAL_RATES.fertilizer.rate,

        mulch: (sqft / 1000) * MATERIAL_RATES.mulch.rate,

        tackifier: (sqft / 1000) * MATERIAL_RATES.tackifier.rate

      };

      if (packageType === "premium") {

        needs.compost =

          (sqft / 1000) * MATERIAL_RATES.compost.rate;

        needs.biochar =

          (sqft / 1000) *

          (MATERIAL_RATES.biochar.rate * 0.5);

        needs.humic =

          (sqft / 1000) *

          (MATERIAL_RATES.humic.rate * 0.5);

      }

      if (addons.lime) {

        needs.lime =

          (sqft / 1000) * MATERIAL_RATES.lime.rate;

      }

      if (addons.sulfur) {

        needs.sulfur =

          (sqft / 1000) * MATERIAL_RATES.sulfur.rate;

      }

      if (addons.biochar) {

        needs.biochar =

          (needs.biochar || 0) +

          (sqft / 1000) * MATERIAL_RATES.biochar.rate;

      }

      if (addons.humic) {

        needs.humic =

          (needs.humic || 0) +

          (sqft / 1000) * MATERIAL_RATES.humic.rate;

      }

      return needs;

    } catch (e) {

      console.error(e);

      return {};

    }

  }

  function getMaterialNeeds(input = {}) {

    try {

      const s = window.state || {};

      return getMaterialNeedsCore(

        input,

        s.job?.package || "standard",

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

      let baseMargin = 0.3;

      if (sqft < 3000) baseMargin = 0.4;

      else if (sqft < 8000) baseMargin = 0.35;

      else if (sqft < 20000) baseMargin = 0.3;

      else baseMargin = 0.25;

      if (pricingMode === "win") baseMargin -= 0.1;

      if (houses >= 10) baseMargin -= 0.03;

      if (houses >= 20) baseMargin -= 0.05;

      if (totalCost > 5000) baseMargin += 0.05;

      if (baseMargin < 0.1) baseMargin = 0.1;

      if (baseMargin > 0.9) baseMargin = 0.9;

      let price = totalCost / (1 - baseMargin);

      if (competitor > 0) {

        if (competitor > price) {

          price = competitor * 0.98;

        } else {

          price = Math.max(price, competitor * 0.95);

        }

      }

      if (price < totalCost * 1.1) {

        price = totalCost * 1.1;

      }

      const profit = price - totalCost;

      return {

        price,

        profit,

        margin: pct(profit, price)

      };

    } catch (e) {

      console.error(e);

      return {

        price: totalCost || 0,

        profit: 0,

        margin: 0

      };

    }

  }

  /* =====================================

     CALCULATE JOB CORE

  ===================================== */

  function calculateJobCore(state, options = {}) {

    try {

      const inventory =

        state.inventory ||

        (window.getInventoryCache?.() || {});

      const sqft = n(state.job?.sqft);

      const houses = n(state.job?.houses, 1);

      const packageType =

        options.packageOverride ||

        state.job?.package ||

        "standard";

      const pricingMode =

        state.job?.pricingMode || "balanced";

      const competitor =

        n(state.job?.competitorPrice);

      const strategy =

        state.job?.pricingStrategy || "normal";

      const totalSqft = sqft * houses;

      const builderMult =

        getBuilderMultiplier(houses);

      const hourlyRate =

        n(state.job?.labor?.hourlyRate);

      const hoursPerHouse =

        n(state.job?.labor?.hoursPerHouse);

      const crewSize =

        n(state.job?.labor?.crewSize, 1);

      const overheadPct =

        n(state.job?.labor?.overhead);

      const laborEfficiency =

        1 - (1 - builderMult) * 0.5;

      const totalHours =

        hoursPerHouse *

        houses *

        laborEfficiency;

      const laborCost =

        totalHours *

        hourlyRate *

        crewSize;

      const addons =

        state.job?.addons || {};

      const needs =

        getMaterialNeedsCore(

          { totalSqft },

          packageType,

          addons

        );

      let materialCost = 0;

      Object.keys(needs).forEach(type => {

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

      if (addons.aeration) materialCost += totalSqft * 0.04;

      if (addons.compost && packageType !== "premium") materialCost += totalSqft * 0.10;

      if (addons.biohum) materialCost += totalSqft * 0.12;

      if (addons.biochar) materialCost += totalSqft * 0.20;

      if (addons.humic) materialCost += totalSqft * 0.01;

      if (addons.lime) materialCost += totalSqft * 0.004;

      if (addons.sulfur) materialCost += totalSqft * 0.008;

      if (addons.grow) {

        const weekly = 50 * 3 * houses;

        const install =

          packageType === "standard"

            ? houses <= 1

              ? totalSqft * 0.05

              : totalSqft * 0.03

            : 0;

        materialCost += weekly + install;

      }

      const overheadCost =

        (materialCost + laborCost) *

        (overheadPct / 100);

      const totalCost =

        materialCost +

        laborCost +

        overheadCost;

      let pricing =

        getSmartPricing(

          totalCost,

          totalSqft,

          houses,

          pricingMode,

          competitor

        );

      let price = pricing.price;

      if (strategy === "market") {

        price = Math.max(price, totalSqft * 0.35);

      }

      if (

        strategy === "undercut" &&

        competitor > 0

      ) {

        price = competitor * 0.97;

      }

      if (strategy === "builder") {

        price *= 0.92;

      }

      if (price < totalCost * 1.1) {

        price = totalCost * 1.1;

      }

      if (price < 1000) {

        price = 1000;

      }

      const profit = price - totalCost;

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

        cost: totalCost,

        price,

        profit,

        laborCost,

        overheadCost,

        totalHours,

        needs,

        comparison,

        usingFallback: false

      };

    } catch (e) {

      console.error("calculateJobCore failed:", e);

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

  function calculateJob(options = {}) {

    try {

      const s = window.state || {};

      const result = calculateJobCore(

        {

          job: s.job || {},

          inventory:

            window.getInventoryCache?.() || {}

        },

        options

      );

      return result;

    } catch (e) {

      console.error("calculateJob failed:", e);

      safeToast("Calculation failed", "error");

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

     GLOBAL EXPORTS

  ===================================== */

  window.calculateJob = calculateJob;

  window.calculateJobCore = calculateJobCore;

  window.getMaterialNeeds = getMaterialNeeds;

  window.getMaterialNeedsCore = getMaterialNeedsCore;

  window.getBuilderMultiplier = getBuilderMultiplier;

  window.getAvgCostFromInventory = getAvgCostFromInventory;

  window.getSmartPricing = getSmartPricing;

})();