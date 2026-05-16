/* =====================================

   state.js

   SoDa Outdoor Designs

   Global App State + Safe Helpers

===================================== */

(function () {

  "use strict";

  /* =====================================

     DEFAULT STATE

  ===================================== */

  const DEFAULT_STATE = {

    job: {

      sqft: 0,

      houses: 1,

      package: "standard",

      pricingMode: "balanced",

      targetMargin: 0,

      pricingStrategy: "normal",

      competitorPrice: 0,

      rainDays: 0,

      hoursPerDay: 10,

      refillMinutes: 20,

      fuelCostPerLoad: 12,

      sprayMinutesPerLoad: 20,

      tankSize: 500,

      labor: {

        hourlyRate: 0,

        hoursPerHouse: 0,

        crewSize: 1,

        overhead: 0

      },

      addons: {

        aeration: false,

        compost: false,

        biohum: false,

        biochar: false,

        humic: false,

        grow: false,

        lime: false,

        sulfur: false

      }

    },

    ui: {

      timeline: "standard",

      activePage: "calculator"

    },

    inventory: null,

    proposals: []

  };

  /* =====================================

     CLONE

  ===================================== */

  function clone(obj) {

    try {

      return JSON.parse(

        JSON.stringify(obj)

      );

    } catch (e) {

      console.error(

        "Clone failed:",

        e

      );

      return {};

    }

  }

  /* =====================================

     INITIALIZE GLOBALS

  ===================================== */

  if (!window.state) {

    window.state =

      clone(

        DEFAULT_STATE

      );

  }

  window.app =

    window.state;

  window.inventoryCache =

    window.inventoryCache ||

    null;

  window.activeProposalId =

    window.activeProposalId ||

    null;

  window.currentProposalId =

    window.currentProposalId ||

    null;

  window.shownToasts =

    window.shownToasts ||

    new Set();

  /* =====================================

     STORAGE HELPERS

  ===================================== */

  function readStorage(

    key,

    fallback = null

  ) {

    try {

      const raw =

        localStorage.getItem(

          key

        );

      return raw

        ? JSON.parse(raw)

        : fallback;

    } catch (e) {

      console.warn(

        "Storage read failed:",

        key,

        e

      );

      return fallback;

    }

  }

  function writeStorage(

    key,

    value

  ) {

    try {

      localStorage.setItem(

        key,

        JSON.stringify(

          value

        )

      );

      return true;

    } catch (e) {

      console.warn(

        "Storage write failed:",

        key,

        e

      );

      return false;

    }

  }

/* =====================================

   AUTO SAVE STATE

===================================== */

function persistState() {

  writeStorage(

    "soda_state",

    window.state

  );

}

const savedState =

  readStorage(

    "soda_state"

  );

if (savedState) {

  window.state =

    savedState;

}

  /* =====================================

     DOM HELPERS

  ===================================== */

  function $id(id) {

    return document.getElementById(

      id

    );

  }

  function $val(

    id,

    fallback = ""

  ) {

    try {

      const el =

        $id(id);

      if (!el)

        return fallback;

      return el.value ??

        fallback;

    } catch (e) {

      return fallback;

    }

  }

  function $num(

    id,

    fallback = 0

  ) {

    try {

      const n =

        Number(

          $val(

            id,

            fallback

          )

        );

      return Number.isFinite(

        n

      )

        ? n

        : fallback;

    } catch (e) {

      return fallback;

    }

  }

  function $checked(

    id,

    fallback = false

  ) {

    try {

      const el =

        $id(id);

      if (!el)

        return fallback;

      return !!el.checked;

    } catch (e) {

      return fallback;

    }

  }

  /* =====================================

     RESETTERS

  ===================================== */

  function resetState() {

    try {

      window.state =

        clone(

          DEFAULT_STATE

        );

      window.app =

        window.state;

      return window.state;

    } catch (e) {

      console.error(

        e

      );

    }

  }

  function resetToasts() {

    try {

      if (

        window.shownToasts &&

        typeof window

          .shownToasts

          .clear ===

          "function"

      ) {

        window.shownToasts.clear();

      } else {

        window.shownToasts =

          new Set();

      }

    } catch (e) {}

  }

  /* =====================================

     SETTERS

  ===================================== */

  function setAddonState(

    name,

    value

  ) {

    try {

      if (

        Object.prototype.hasOwnProperty.call(

          window.state.job

            .addons,

          name

        )

      ) {

        window.state.job.addons[

          name

        ] = !!value;

      }

    } catch (e) {}

  }

  function setTimelineState(

    value

  ) {

    try {

      window.state.ui.timeline =

        value ||

        "standard";

      applyStateToUI();

    } catch (e) {}

  }

  function setTankSizeState(

    value

  ) {

    try {

     window.state.job.tankSize =

        Number(

          value

        ) || 500;

    } catch (e) {}

  }

  /* =====================================

     UI -> STATE

  ===================================== */

  function syncStateFromUI() {

    try {

      const s =

        window.state;

      s.job.sqft =

        $num(

          "sqft",

          s.job.sqft

        );

      s.job.houses =

        $num(

          "houses",

          s.job.houses

        );

      s.job.package =

        $val(

          "package",

          s.job.package

        );

      s.job.pricingMode =

        $val(

          "pricingMode",

          s.job

            .pricingMode

        );

      s.job.targetMargin =

        $num(

          "targetMargin",

          s.job

            .targetMargin

        );

      s.job.pricingStrategy =

        $val(

          "pricingStrategy",

          s.job

            .pricingStrategy

        );

      s.job.competitorPrice =

        $num(

          "competitorPrice",

          s.job

            .competitorPrice

        );

      s.job.labor.hourlyRate =

        $num(

          "residentialHourlyRate",

          s.job.labor

            .hourlyRate

        );

      s.job.labor.hoursPerHouse =

        $num(

          "residentialHoursPerHouse",

          s.job.labor

            .hoursPerHouse

        );

      s.job.labor.crewSize =

        $num(

          "crewSize",

          s.job.labor

            .crewSize

        );

      s.job.labor.overhead =

        $num(

          "overhead",

          s.job.labor

            .overhead

        );

     s.job.rainDays =

  $num(

    "rainDays",

    s.job.rainDays

  );

s.job.hoursPerDay =

  $num(

    "hoursPerDay",

    s.job.hoursPerDay

  );

s.job.refillMinutes =

  $num(

    "refillMinutes",

    s.job.refillMinutes

  );

s.job.fuelCostPerLoad =

  $num(

    "fuelCostPerLoad",

    s.job.fuelCostPerLoad

  );

s.job.sprayMinutesPerLoad =

  $num(

    "sprayMinutesPerLoad",

    s.job.sprayMinutesPerLoad

  );

      s.job.tankSize =

        $num(

          "tankSize",

         s.job.tankSize

        );


      /* ================================

         ADDONS

      ================================= */

      Object.keys(

        s.job.addons

      ).forEach(

        (key) => {

          s.job.addons[key] =

  $checked(

    `addon_${key}`,

              s.job

                .addons[

                key

              ]

            );

        }

      );

      /* ================================

         TIMELINE BUTTONS

      ================================= */

      const activeTimeline =

        document.querySelector(

          "[data-timeline].active"

        );

      if (activeTimeline) {

        s.ui.timeline =

          activeTimeline.dataset.timeline;

      }

      persistState();

      return s;

    } catch (e) {

      console.error(

        "syncStateFromUI:",

        e

      );

      return window.state;

    }

  }

  /* =====================================

     STATE -> UI

  ===================================== */

  function applyStateToUI() {

    try {

      const s =

        window.state;

      function setValue(

        id,

        value

      ) {

        const el =

          $id(id);

        if (el)

          el.value =

            value;

      }

      setValue(

        "sqft",

        s.job.sqft

      );

      setValue(

        "houses",

        s.job.houses

      );

      setValue(

        "package",

        s.job.package

      );

      setValue(

        "pricingMode",

        s.job

          .pricingMode

      );

      setValue(

        "targetMargin",

        s.job

          .targetMargin

      );

      setValue(

        "pricingStrategy",

        s.job

          .pricingStrategy

      );

      setValue(

        "competitorPrice",

        s.job

          .competitorPrice

      );

      setValue(

        "residentialHourlyRate",

        s.job.labor

          .hourlyRate

      );

      setValue(

        "residentialHoursPerHouse",

        s.job.labor

          .hoursPerHouse

      );

      setValue(

        "crewSize",

        s.job.labor

          .crewSize

      );

      setValue(

        "overhead",

        s.job.labor

          .overhead

      );

      setValue(

        "tankSize",

       s.job.tankSize

      );

      setValue(

  "rainDays",

  s.job.rainDays

);

setValue(

  "hoursPerDay",

  s.job.hoursPerDay

);

setValue(

  "refillMinutes",

  s.job.refillMinutes

);

setValue(

  "fuelCostPerLoad",

  s.job.fuelCostPerLoad

);

setValue(

  "sprayMinutesPerLoad",

  s.job.sprayMinutesPerLoad

);

      /* ================================

         ADDON CHECKBOXES

      ================================= */

      Object.keys(

        s.job.addons

      ).forEach(

        (key) => {

const box =

  $id(`addon_${key}`);

          if (

            box &&

            box.type ===

              "checkbox"

          ) {

            box.checked =

              !!s.job

                .addons[

                key

              ];

          }

        }

      );

      /* ================================

         TIMELINE BUTTONS

      ================================= */

      document

        .querySelectorAll(

          "[data-timeline]"

        )

        .forEach(btn => {

          btn.classList.remove(

            "active"

          );

          if (

            btn.dataset.timeline ===

            s.ui.timeline

          ) {

            btn.classList.add(

              "active"

            );

          }

        });

    } catch (e) {

      console.error(

        "applyStateToUI:",

        e

      );

    }

  }

  /* =====================================

     SNAPSHOT

  ===================================== */

  function getStateSnapshot() {

    return clone(

      window.state

    );

  }

  /* =====================================

     EXPORTS

  ===================================== */

  window.readStorage =

    readStorage;

  window.writeStorage =

    writeStorage;

  window.$id = $id;

  window.$val = $val;

  window.$num = $num;

  window.$checked =

    $checked;

  window.resetState =

    resetState;

  window.resetToasts =

    resetToasts;

  window.setAddonState =

    setAddonState;

  window.setTimelineState =

    setTimelineState;

  window.setTankSizeState =

    setTankSizeState;

  window.syncStateFromUI =

    syncStateFromUI;

  window.applyStateToUI =

    applyStateToUI;

  window.getStateSnapshot =

    getStateSnapshot;

})();