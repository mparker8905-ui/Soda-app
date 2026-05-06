/* =====================================

   inventory.js

   SoDa Outdoor Designs

   Inventory Management + Local Storage

===================================== */

(function () {

  "use strict";

  /* =====================================

     CONSTANTS

  ===================================== */

  const STORAGE_KEY = "inventory_full";

  const EMPTY_DATA = {

    standard: [],

    premium: [],

    addons: []

  };

  const MATERIAL_LABELS = {

    seed: "Seed",

    fertilizer: "Fertilizer",

    mulch: "Mulch",

    tackifier: "Tackifier",

    compost: "Compost",

    biochar: "Biochar",

    humic: "Humic Acid",

    biohum: "BioHumus",

    lime: "Lime",

    sulfur: "Sulfur",

    sprinklers: "Sprinklers",

    timers: "Sprinkler Timers"

  };

  window.MATERIAL_LABELS = MATERIAL_LABELS;

  /* =====================================

     HELPERS

  ===================================== */

  function safeNum(v) {

    const n = Number(v);

    return Number.isFinite(n) ? n : 0;

  }

  function toast(msg, type = "info") {

    try {

      if (typeof window.showToast === "function") {

        window.showToast(msg, type);

      }

    } catch (e) {}

  }

  function clone(obj) {

    return JSON.parse(JSON.stringify(obj));

  }

  /* =====================================

     STORAGE

  ===================================== */

  function readInventory() {

    try {

      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {

        return clone(EMPTY_DATA);

      }

      const parsed = JSON.parse(raw);

      return {

        standard: parsed.standard || [],

        premium: parsed.premium || [],

        addons: parsed.addons || []

      };

    } catch (e) {

      console.error("Inventory read failed:", e);

      return clone(EMPTY_DATA);

    }

  }

  function writeInventory(data) {

    try {

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

      );

      window.inventoryCache = null;

    } catch (e) {

      console.error("Inventory save failed:", e);

    }

  }

  /* =====================================

     DOM HELPERS

  ===================================== */

  function getContainer(type) {

    if (type === "standard") {

      return document.getElementById(

        "standardMaterials"

      );

    }

    if (type === "premium") {

      return document.getElementById(

        "premiumMaterials"

      );

    }

    return document.getElementById(

      "addonMaterials"

    );

  }

  function getMaterialOptions(selected) {

    return Object.keys(MATERIAL_LABELS)

      .map((key) => {

        return `

          <option value="${key}"

            ${key === selected ? "selected" : ""}>

            ${MATERIAL_LABELS[key]}

          </option>

        `;

      })

      .join("");

  }

  /* =====================================

     ROW BUILDER

  ===================================== */

  function buildRow(item = {}) {

    try {

      const type = item.type || "seed";

      const unit =

        window.MATERIAL_RATES?.[type]?.unit ||

        "units";

      const row = document.createElement("div");

      row.className = "material-row";

      row.innerHTML = `

        <div class="row-top">

          <select class="mat-select"

            onchange="updateUnitLabel(this)">

            ${getMaterialOptions(type)}

          </select>

          <button

            class="delete-btn"

            onclick="deleteRow(this)">

            ✕

          </button>

        </div>

        <label class="mat-label">

          Material Name

        </label>

        <input

          class="mat-input"

          value="${item.name || ""}"

          placeholder="Material Name">

        <label class="mat-label">

          Cost per Unit ($)

        </label>

        <input

          class="mat-input"

          type="number"

          step="0.01"

          value="${safeNum(item.cost)}">

        <label class="mat-label unit-label">

          Quantity Available (${unit})

        </label>

        <input

          class="mat-input"

          type="number"

          step="0.01"

          value="${safeNum(item.qty)}">

      `;

      return row;

    } catch (e) {

      console.error(e);

      return document.createElement("div");

    }

  }

  /* =====================================

     PARSE SECTION

  ===================================== */

  function parseSection(id) {

    try {

      const container =

        document.getElementById(id);

      if (!container) return [];

      const rows =

        container.querySelectorAll(

          ".material-row"

        );

      const items = [];

      rows.forEach((row) => {

        const select =

          row.querySelector("select");

        const inputs =

          row.querySelectorAll("input");

        items.push({

          type: select?.value || "seed",

          name: inputs[0]?.value || "",

          cost: safeNum(inputs[1]?.value),

          qty: safeNum(inputs[2]?.value)

        });

      });

      return items;

    } catch (e) {

      console.error(e);

      return [];

    }

  }

  /* =====================================

     RENDER SECTION

  ===================================== */

  function renderSection(id, items) {

    try {

      const container =

        document.getElementById(id);

      if (!container) return;

      container.innerHTML = "";

      items.forEach((item) => {

        container.appendChild(

          buildRow(item)

        );

      });

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     LOAD INVENTORY

  ===================================== */

  function loadInventory() {

    try {

      const data = readInventory();

      renderSection(

        "standardMaterials",

        data.standard

      );

      renderSection(

        "premiumMaterials",

        data.premium

      );

      renderSection(

        "addonMaterials",

        data.addons

      );

      renderInventory();

    } catch (e) {

      console.error(e);

      toast(

        "Load inventory failed",

        "error"

      );

    }

  }

  /* =====================================

     SAVE INVENTORY

  ===================================== */

  function saveInventory() {

    try {

      const data = {

        standard: parseSection(

          "standardMaterials"

        ),

        premium: parseSection(

          "premiumMaterials"

        ),

        addons: parseSection(

          "addonMaterials"

        )

      };

      writeInventory(data);

      renderInventory();

    } catch (e) {

      console.error(e);

      toast(

        "Save inventory failed",

        "error"

      );

    }

  }

  /* =====================================

     CACHE

  ===================================== */

  function getInventoryCache(

    forceRefresh = false

  ) {

    try {

      if (

        forceRefresh ||

        !window.inventoryCache

      ) {

        window.inventoryCache =

          readInventory();

      }

      return window.inventoryCache;

    } catch (e) {

      console.error(e);

      return readInventory();

    }

  }

  /* =====================================

     TOTALS

  ===================================== */

  function getInventoryTotals() {

    try {

      const data = readInventory();

      const totals = {};

      Object.values(data).forEach(

        (section) => {

          section.forEach((item) => {

            totals[item.type] =

              (totals[item.type] || 0) +

              safeNum(item.qty);

          });

        }

      );

      return totals;

    } catch (e) {

      console.error(e);

      return {};

    }

  }

  /* =====================================

     COST SUMMARY

  ===================================== */

  function getInventoryCost() {

    try {

      const data = readInventory();

      function sum(section) {

        let total = 0;

        (section || []).forEach(

          (item) => {

            total +=

              safeNum(item.cost) *

              safeNum(item.qty);

          }

        );

        return total;

      }

      const standard = sum(

        data.standard

      );

      const premium = sum(

        data.premium

      );

      const addons = sum(

        data.addons

      );

      return {

        standard,

        premium,

        addons,

        total:

          standard +

          premium +

          addons

      };

    } catch (e) {

      console.error(e);

      return {

        standard: 0,

        premium: 0,

        addons: 0,

        total: 0

      };

    }

  }

  /* =====================================

     RENDER DASHBOARD

  ===================================== */

  function renderInventory() {

    try {

      const totals =

        getInventoryCost();

      const setText = (id, val) => {

        const el =

          document.getElementById(id);

        if (el) {

          el.textContent = val;

        }

      };

      /* calculator page */

      setText(

        "standardValue",

        "$" +

        totals.standard.toFixed(0)

      );

      setText(

        "premiumValue",

        "$" +

        totals.premium.toFixed(0)

      );

      setText(

        "addonValue",

        "$" +

        totals.addons.toFixed(0)

      );

      setText(

        "totalInventoryValue",

        "$" +

        totals.total.toFixed(0)

      );

      /* inventory page */

      setText(

        "invStandardValue",

        "$" +

        totals.standard.toFixed(0)

      );

      setText(

        "invPremiumValue",

        "$" +

        totals.premium.toFixed(0)

      );

      setText(

        "invAddonValue",

        "$" +

        totals.addons.toFixed(0)

      );

      setText(

        "invTotalValue",

        "$" +

        totals.total.toFixed(0)

      );

      /* live totals */

      const totalsWrap =

        document.getElementById(

          "inventoryTotals"

        );

      if (totalsWrap) {

        const qtyTotals =

          getInventoryTotals();

        const rows =

          Object.keys(qtyTotals)

            .map(key => {

              const qty =

                safeNum(

                  qtyTotals[key]

                );

              const unit =

                window.MATERIAL_RATES?.[

                  key

                ]?.unit || "units";

              return `

                <div class="metric">

                  <div class="metric-label">

                    ${key.toUpperCase()}

                  </div>

                  <div class="metric-value">

                    ${qty.toFixed(1)} ${unit}

                  </div>

                </div>

              `;

            })

            .join("");

        totalsWrap.innerHTML =

          rows ||

          `<div class="muted">

            No inventory saved.

          </div>`;

      }

    } catch (e) {

      console.error(

        "renderInventory failed:",

        e

      );

    }

  }

  /* =====================================

     COMPARE INVENTORY

  ===================================== */

  function compareInventory(

    needs = {},

    inventory = {}

  ) {

    try {

      const results = {};

      Object.keys(needs).forEach(

        (key) => {

          const required =

            safeNum(needs[key]);

          const available =

            safeNum(inventory[key]);

          const shortage =

            required - available;

          results[key] = {

            required,

            available,

            shortage:

              shortage > 0

                ? shortage

                : 0,

            status:

              shortage > 0

                ? "short"

                : "ok"

          };

        }

      );

      return results;

    } catch (e) {

      console.error(e);

      return {};

    }

  }

  /* =====================================

     ADD ROW

  ===================================== */

  function addInventoryRow(

    type = "standard"

  ) {

    try {

      const container =

        getContainer(type);

      if (!container) return;

      const row = buildRow({

        type: "seed"

      });

      container.appendChild(row);

      toast(

        "Material row added",

        "success"

      );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     DELETE ROW

  ===================================== */

  function deleteRow(btn) {

    try {

      const row =

        btn.closest(

          ".material-row"

        );

      if (row) {

        row.remove();

      }

      saveInventory();

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     UPDATE UNIT LABEL

  ===================================== */

  function updateUnitLabel(select) {

    try {

      const row =

        select.closest(

          ".material-row"

        );

      if (!row) return;

      const label =

        row.querySelector(

          ".unit-label"

        );

      const type = select.value;

      const unit =

        window.MATERIAL_RATES?.[

          type

        ]?.unit || "units";

      if (label) {

        label.textContent =

          `Quantity Available (${unit})`;

      }

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     CLEAR INVENTORY

  ===================================== */

  function clearInventory() {

    try {

      if (

        !confirm(

          "Clear all inventory?"

        )

      ) {

        return;

      }

      writeInventory(

        clone(EMPTY_DATA)

      );

      loadInventory();

      toast(

        "Inventory cleared",

        "success"

      );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     EXPORT INVENTORY

  ===================================== */

  function exportInventory() {

    try {

      const data = readInventory();

      const blob = new Blob(

        [

          JSON.stringify(

            data,

            null,

            2

          )

        ],

        {

          type: "application/json"

        }

      );

      const url =

        URL.createObjectURL(blob);

      const a =

        document.createElement("a");

      a.href = url;

      a.download =

        "soda-inventory.json";

      a.click();

      URL.revokeObjectURL(url);

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     PAGE REFRESH

  ===================================== */

  window.refreshInventoryPage = function () {

    try {

      loadInventory();

      renderInventory();

      toast(

        "Inventory refreshed",

        "success"

      );

    } catch (e) {

      console.error(e);

    }

  };

  /* =====================================

     AUTO SAVE

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

          saveInventory();

        }

      } catch (err) {

        console.error(err);

      }

    }

  );

  /* =====================================

     GLOBAL EXPORTS

  ===================================== */

  window.loadInventory =

    loadInventory;

  window.saveInventory =

    saveInventory;

  window.renderInventory =

    renderInventory;

  window.addInventoryRow =

    addInventoryRow;

  window.addMaterialRow =

    addInventoryRow;

  window.deleteRow =

    deleteRow;

  window.updateUnitLabel =

    updateUnitLabel;

  window.clearInventory =

    clearInventory;

  window.exportInventory =

    exportInventory;

  window.getInventoryTotals =

    getInventoryTotals;

  window.getInventoryCost =

    getInventoryCost;

  window.getInventoryCache =

    getInventoryCache;

  window.compareInventory =

    compareInventory;

})();