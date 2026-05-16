/* ===================================

   SoDa Outdoor Designs Error Shield

   Production Safe Runtime Guard

=================================== */

(function () {

  "use strict";

  /* ===================================

     DEBUG MODE

  =================================== */

  window.APP_DEBUG =

    window.APP_DEBUG ?? true;

  /* ===================================

     GLOBAL JS ERRORS

  =================================== */

  window.onerror = function (

    message,

    source,

    line,

    col,

    error

  ) {

    try {

   console.groupCollapsed(

  "🚨 JS ERROR"

);

console.error(message);

console.error(

  "Source:",

  source

);

console.error(

  "Line:",

  line,

  "Col:",

  col

);

console.error(error);

console.groupEnd();

   if (window.APP_DEBUG) {

  console.error(error);

  showSafeToast(

    "Application error detected",

    "error"

  );

}

    } catch (e) {}

    return false;

  };

  /* ===================================

     PROMISE ERRORS

  =================================== */

  window.addEventListener(

    "unhandledrejection",

    function (e) {

      try {

        console.error(

          "Promise Error:",

          e.reason

        );

  if (window.APP_DEBUG) {

  console.error(error);

  showSafeToast(

    "Application error detected",

    "error"

  );

}

      } catch (err) {}

    }

  );

  /* ===================================

     SAFE DOM HELPERS

  =================================== */

  function $id(id) {

    try {

      return document.getElementById(

        id

      );

    } catch (e) {

      console.error(

        "$id failed:",

        e

      );

      return null;

    }

  }

  function safeHTML(

    id,

    html

  ) {

    try {

      const el =

        document.getElementById(

          id

        );

      if (el)

        el.innerHTML =

          html;

    } catch (e) {

      console.error(

        "safeHTML failed:",

        e

      );

    }

  }

  function safeText(

    id,

    text

  ) {

    try {

      const el =

        document.getElementById(

          id

        );

      if (el)

        el.textContent =

          text;

    } catch (e) {

      console.error(

        "safeText failed:",

        e

      );

    }

  }

  /* ===================================

     SAFE CALL WRAPPER

  =================================== */

  function safeRun(

    fn,

    name = "Function"

  ) {

    try {

      if (

        typeof fn ===

        "function"

      ) {

        return fn();

      }

      console.warn(

        name +

          " is not a function"

      );

    } catch (e) {

      console.error(

        name +

          " failed:",

        e

      );

    }

    return null;

  }

  /* ===================================

     SAFE QUERY HELPERS

  =================================== */

  function safeQS(sel) {

    try {

      return document.querySelector(

        sel

      );

    } catch (e) {

      return null;

    }

  }

  function safeQSA(sel) {

    try {

      return document.querySelectorAll(

        sel

      );

    } catch (e) {

      return [];

    }

  }

  /* ===================================

     SAFE STORAGE HELPERS

  =================================== */

  function safeRead(

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

      console.error(

        "safeRead failed:",

        e

      );

      return fallback;

    }

  }

  function safeWrite(

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

      console.error(

        "safeWrite failed:",

        e

      );

      return false;

    }

  }

  /* ===================================

     SAFE NUMBER

  =================================== */

  function safeNum(

    value,

    fallback = 0

  ) {

    const n =

      Number(value);

    return Number.isFinite(

      n

    )

      ? n

      : fallback;

  }

  /* ===================================

     SAFE TOAST

  =================================== */

  function showSafeToast(

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

      } else {

        console.log(

          "[" + type + "]",

          msg

        );

      }

    } catch (e) {

      console.error(

        "Toast failed:",

        e

      );

    }

  }

  /* ===================================

     SAFE DATE

  =================================== */

  function safeDate(value) {

    try {

      const d = new Date(value);

      if (isNaN(d)) {

        return new Date();

      }

      return d;

    } catch (e) {

      return new Date();

    }

  }

  /* ===================================

     SAFE ARRAY

  =================================== */

  function safeArray(v) {

    return Array.isArray(v)

      ? v

      : [];

  }

/* ===================================

   SAFE JSON

=================================== */

function safeJSONParse(

  value,

  fallback = null

) {

  try {

    return JSON.parse(

      value

    );

  } catch (e) {

    return fallback;

  }

}

/* ===================================

   SAFE CLONE

=================================== */

function safeClone(obj) {

  try {

    return JSON.parse(

      JSON.stringify(obj)

    );

  } catch (e) {

    return null;

  }

}


  /* ===================================

     EXPORTS

  =================================== */

  window.$id = $id;

  window.safeHTML =

    safeHTML;

  window.safeText =

    safeText;

  window.safeRun =

    safeRun;

  window.safeQS =

    safeQS;

  window.safeQSA =

    safeQSA;

  window.safeRead =

    safeRead;

  window.safeWrite =

    safeWrite;

  window.safeNum =

    safeNum;

  window.showSafeToast =

    showSafeToast;

  window.safeDate =

    safeDate;

  window.safeArray =

    safeArray;

  window.safeJSONParse =

    safeJSONParse;

  window.safeClone =

    safeClone;

})();

