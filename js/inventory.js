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

  function readInventory() {

    try {

      return (

        JSON.parse(localStorage.getItem(STORAGE_KEY)) || {

          standard: [],

          premium: [],

          addons: []

        }

      );

    } catch (e) {

      console.error("Inventory read failed", e);

      return {

        standard: [],

        premium: [],

        addons: []

      };

    }

  }

  function writeInventory(data) {

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(data)

    );

    window.inventoryCache = null;

  }

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

    const keys = Object.keys(MATERIAL_LABELS);

    return keys

      .map((key) => {

        return `

          <option value="${key}"

            ${

              key === selected

                ? "selected"

                : ""

            }>

            ${MATERIAL_LABELS[key]}

          </option>

        `;

      })

      .join("");

  }

  function safeNum(v) {

    const n = Number(v);

    return Number.isFinite(n) ? n : 0;

  }

  /* =====================================

     BUILD ROW HTML

  ===================================== */

  function buildRow(item = {}) {

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

          🗑️

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

        value="${safeNum(item.cost)}">

      <label class="mat-label unit-label">

        Quantity Available (${unit})

      </label>

      <input

        class="mat-input"

        type="number"

        value="${safeNum(item.qty)}">

    `;

    return row;

  }

  /* =====================================

     LOAD INVENTORY

  ===================================== */

  window.loadInventory = function () {

    const data = readInventory();

    renderSection(

      "standardMaterials",

      data.standard || []

    );

    renderSection(

      "premiumMaterials",

      data.premium || []

    );

    renderSection(

      "addonMaterials",

      data.addons || []

    );

  };

  function renderSection(id, items) {

    const container =

      document.getElementById(id);

    if (!container) return;

    container.innerHTML = "";

    items.forEach((item) => {

      const row = buildRow(item);

      container.appendChild(row);

    });

  }

  /* =====================================

     SAVE INVENTORY

  ===================================== */

  window.saveInventory = function () {

    const inventory = {

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

    writeInventory(inventory);

  };

  function parseSection(id) {

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

        type: select?.value || "",

        name: inputs[0]?.value || "",

        cost: safeNum(inputs[1]?.value),

        qty: safeNum(inputs[2]?.value)

      });

    });

    return items;

  }

  /* =====================================

     CACHE

  ===================================== */

  window.getInventoryCache =

    function (forceRefresh = false) {

      if (

        forceRefresh ||

        !window.inventoryCache

      ) {

        window.inventoryCache =

          readInventory();

      }

      return window.inventoryCache;

    };

  /* =====================================

     TOTALS

  ===================================== */

  window.getInventoryTotals =

    function () {

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

    };

  /* =====================================

     COST SUMMARY

  ===================================== */

  window.getInventoryCost =

    function () {

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

    };

  /* =====================================

     COMPARE INVENTORY

  ===================================== */

  window.compareInventory =

    function (needs = {}, inventory = {}) {

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

    };

  /* =====================================

     ADD ROW

  ===================================== */

  window.addMaterialRow =

    function (type = "standard") {

      const container =

        getContainer(type);

      if (!container) return;

      const row = buildRow({

        type: "seed"

      });

      container.appendChild(row);

    };

  /* =====================================

     DELETE ROW

  ===================================== */

  window.deleteRow =

    function (btn) {

      const row =

        btn.closest(

          ".material-row"

        );

      if (row) {

        row.remove();

        window.saveInventory();

      }

    };

  /* =====================================

     UNIT LABEL

  ===================================== */

  window.updateUnitLabel =

    function (select) {

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

        label.innerText =

          `Quantity Available (${unit})`;

      }

    };

  /* =====================================

     QUICK FIX INVENTORY

  ===================================== */

  window.fixInventory =

    function (type, amount) {

      const data = readInventory();

      const qty = Math.ceil(

        safeNum(amount)

      );

      let sectionName = "addons";

      if (

        [

          "seed",

          "fertilizer",

          "mulch",

          "tackifier"

        ].includes(type)

      ) {

        sectionName = "standard";

      }

      if (

        [

          "compost",

          "biochar",

          "humic",

          "biohum"

        ].includes(type)

      ) {

        sectionName = "premium";

      }

      let found = false;

      data[sectionName].forEach(

        (item) => {

          if (item.type === type) {

            item.qty =

              safeNum(item.qty) +

              qty;

            found = true;

          }

        }

      );

      if (!found) {

        data[sectionName].push({

          type,

          name:

            MATERIAL_LABELS[type] ||

            type,

          cost: 0,

          qty

        });

      }

      writeInventory(data);

      if (

        typeof window.loadInventory ===

        "function"

      ) {

        window.loadInventory();

      }

      if (

        typeof window.showToast ===

        "function"

      ) {

        window.showToast(

          `${MATERIAL_LABELS[type]} +${qty} added`,

          "success"

        );

      }

      if (

        typeof window.requestRender ===

        "function"

      ) {

        window.requestRender();

      }

    };

  /* =====================================

     USE INVENTORY FOR JOB

  ===================================== */

  window.useInventoryForJob =

    function () {

      if (

        !confirm(

          "Use inventory for this job?"

        )

      ) {

        return;

      }

      if (

        typeof window.calculateJob !==

        "function"

      ) {

        return;

      }

      const r =

        window.calculateJob();

      const needs =

        r.needs || {};

      const data =

        readInventory();

      Object.values(data).forEach(

        (section) => {

          section.forEach(

            (item) => {

              const key =

                item.type;

              if (

                needs[key] >

                0

              ) {

                const use =

                  Math.min(

                    safeNum(

                      item.qty

                    ),

                    safeNum(

                      needs[

                        key

                      ]

                    )

                  );

                item.qty -= use;

                needs[key] -= use;

              }

            }

          );

        }

      );

      writeInventory(data);

      window.loadInventory();

      if (

        typeof window.showToast ===

        "function"

      ) {

        window.showToast(

          "Inventory applied to job",

          "success"

        );

      }

      if (

        typeof window.requestRender ===

        "function"

      ) {

        window.requestRender();

      }

    };

})();

window.loadInventory = loadInventory;

window.saveInventory = saveInventory;

window.renderInventory = renderInventory;

window.addInventoryRow = addInventoryRow;

window.clearInventory = clearInventory;

window.exportInventory = exportInventory;

window.getInventoryTotals = getInventoryTotals;

window.getInventoryCost = getInventoryCost;

window.getInventoryCache = getInventoryCache;

window.compareInventory = compareInventory;