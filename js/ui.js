/* =====================================

   ui.js

   SoDa Outdoor Designs

   UI / Toasts / Modals / Helpers

===================================== */

(function () {

  "use strict";

  /* =====================================

     DOM READY

  ===================================== */

  document.addEventListener("DOMContentLoaded", initUI);

  function initUI() {

    bindAddonToggles();

    bindNumberFormatting();

    bindModalEscClose();

    bindQuickActions();

    initThemeHelpers();

  }

  /* =====================================

     TOAST SYSTEM

  ===================================== */

  let toastTimer = null;

  window.showToast = function (message, type = "info", duration = 2600) {

    let wrap = document.getElementById("toastWrap");

    if (!wrap) {

      wrap = document.createElement("div");

      wrap.id = "toastWrap";

      wrap.style.position = "fixed";

      wrap.style.right = "18px";

      wrap.style.bottom = "18px";

      wrap.style.zIndex = "9999";

      wrap.style.display = "flex";

      wrap.style.flexDirection = "column";

      wrap.style.gap = "10px";

      document.body.appendChild(wrap);

    }

    const toast = document.createElement("div");

    toast.className = "soda-toast";

    const colors = {

      success: "#18b66a",

      error: "#c43b3b",

      warning: "#cfa11f",

      info: "#333"

    };

    toast.style.minWidth = "240px";

    toast.style.maxWidth = "340px";

    toast.style.padding = "12px 14px";

    toast.style.borderRadius = "10px";

    toast.style.color = "#fff";

    toast.style.fontWeight = "600";

    toast.style.fontSize = "14px";

    toast.style.boxShadow = "0 12px 30px rgba(0,0,0,.25)";

    toast.style.background = colors[type] || colors.info;

    toast.style.opacity = "0";

    toast.style.transform = "translateY(10px)";

    toast.style.transition =

      "opacity .18s ease, transform .18s ease";

    toast.innerText = message;

    wrap.appendChild(toast);

    requestAnimationFrame(() => {

      toast.style.opacity = "1";

      toast.style.transform = "translateY(0)";

    });

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

      toast.style.opacity = "0";

      toast.style.transform = "translateY(8px)";

      setTimeout(() => {

        toast.remove();

      }, 220);

    }, duration);

  };

  /* =====================================

     LOADING OVERLAY

  ===================================== */

  window.showLoader = function (text = "Loading...") {

    let loader =

      document.getElementById("globalLoader");

    if (!loader) {

      loader = document.createElement("div");

      loader.id = "globalLoader";

      loader.style.position = "fixed";

      loader.style.inset = "0";

      loader.style.background =

        "rgba(0,0,0,.65)";

      loader.style.display = "flex";

      loader.style.alignItems = "center";

      loader.style.justifyContent =

        "center";

      loader.style.zIndex = "99999";

      loader.innerHTML = `

        <div style="

          background:#111;

          border:1px solid #333;

          color:#d4af37;

          padding:24px 28px;

          border-radius:12px;

          font-weight:700;

          min-width:220px;

          text-align:center;

        ">

          <div class="spin"

            style="

              width:28px;

              height:28px;

              border:3px solid #333;

              border-top:3px solid #d4af37;

              border-radius:50%;

              margin:0 auto 14px auto;

              animation:sodaSpin 1s linear infinite;

            ">

          </div>

          <div id="loaderText">${text}</div>

        </div>

      `;

      document.body.appendChild(loader);

      injectSpinKeyframes();

    } else {

      loader.style.display = "flex";

      const txt =

        document.getElementById(

          "loaderText"

        );

      if (txt) txt.innerText = text;

    }

  };

  window.hideLoader = function () {

    const loader =

      document.getElementById(

        "globalLoader"

      );

    if (loader) {

      loader.style.display = "none";

    }

  };

  function injectSpinKeyframes() {

    if (

      document.getElementById(

        "spinStyles"

      )

    )

      return;

    const style =

      document.createElement("style");

    style.id = "spinStyles";

    style.innerHTML = `

      @keyframes sodaSpin{

        from{transform:rotate(0deg);}

        to{transform:rotate(360deg);}

      }

    `;

    document.head.appendChild(style);

  }

  /* =====================================

     MODALS

  ===================================== */

  window.openModal = function (id) {

    const modal =

      document.getElementById(id);

    if (!modal) return;

    modal.style.display = "flex";

    document.body.classList.add(

      "modal-open"

    );

  };

  window.closeModal = function (id) {

    const modal =

      document.getElementById(id);

    if (!modal) return;

    modal.style.display = "none";

    document.body.classList.remove(

      "modal-open"

    );

  };

  function bindModalEscClose() {

    document.addEventListener(

      "keydown",

      function (e) {

        if (e.key !== "Escape") return;

        document

          .querySelectorAll(".modal")

          .forEach((m) => {

            m.style.display = "none";

          });

        document.body.classList.remove(

          "modal-open"

        );

      }

    );

  }

  /* =====================================

     ADDON TOGGLES

  ===================================== */

  function bindAddonToggles() {

    document

      .querySelectorAll(

        "[data-addon]"

      )

      .forEach((el) => {

        el.addEventListener(

          "click",

          function () {

            const key =

              this.dataset.addon;

            if (

              !window.state ||

              !window.state.job

            )

              return;

            const addons =

              window.state.job

                .addons;

            addons[key] =

              !addons[key];

            this.classList.toggle(

              "active",

              addons[key]

            );

            if (

              typeof requestRender ===

              "function"

            ) {

              requestRender();

            }

          }

        );

      });

  }

  /* =====================================

     NUMBER FIELD HELPERS

  ===================================== */

  function bindNumberFormatting() {

    document

      .querySelectorAll(

        "input[type='number']"

      )

      .forEach((input) => {

        input.addEventListener(

          "wheel",

          function () {

            this.blur();

          }

        );

      });

  }

  /* =====================================

     COPY TO CLIPBOARD

  ===================================== */

  window.copyText = async function (

    text,

    success = "Copied"

  ) {

    try {

      await navigator.clipboard.writeText(

        text

      );

      showToast(

        success,

        "success"

      );

    } catch (e) {

      showToast(

        "Copy failed",

        "error"

      );

    }

  };

  /* =====================================

     QUICK ACTIONS

  ===================================== */

  function bindQuickActions() {

    document

      .querySelectorAll(

        "[data-click]"

      )

      .forEach((btn) => {

        btn.addEventListener(

          "click",

          function () {

            const fn =

              this.dataset.click;

            if (

              fn &&

              typeof window[

                fn

              ] ===

                "function"

            ) {

              window[fn]();

            }

          }

        );

      });

  }

  /* =====================================

     MONEY FORMATTERS

  ===================================== */

  window.money = function (

    amount

  ) {

    const n =

      Number(amount) || 0;

    return (

      "$" +

      n.toLocaleString(

        undefined,

        {

          minimumFractionDigits: 2,

          maximumFractionDigits: 2

        }

      )

    );

  };

  window.percent = function (

    value

  ) {

    const n =

      Number(value) || 0;

    return `${n.toFixed(1)}%`;

  };

  /* =====================================

     SAFE HTML

  ===================================== */

  window.escapeHTML =

    function (str) {

      return String(

        str ?? ""

      )

        .replace(

          /&/g,

          "&amp;"

        )

        .replace(

          /</g,

          "&lt;"

        )

        .replace(

          />/g,

          "&gt;"

        )

        .replace(

          /"/g,

          "&quot;"

        )

        .replace(

          /'/g,

          "&#039;"

        );

    };

  /* =====================================

     THEME / POLISH

  ===================================== */

  function initThemeHelpers() {

    document

      .querySelectorAll(

        ".card, .glass-card"

      )

      .forEach((card) => {

        card.addEventListener(

          "mouseenter",

          function () {

            this.style.transform =

              "translateY(-2px)";

          }

        );

        card.addEventListener(

          "mouseleave",

          function () {

            this.style.transform =

              "";

          }

        );

      });

  }

  /* =====================================

     CONFIRM WRAPPER

  ===================================== */

  window.confirmAction =

    function (

      message,

      callback

    ) {

      const ok =

        window.confirm(

          message

        );

      if (

        ok &&

        typeof callback ===

          "function"

      ) {

        callback();

      }

    };

  /* =====================================

     RESET UI

  ===================================== */

  window.resetUI =

    function () {

      document

        .querySelectorAll(

          ".active"

        )

        .forEach((el) => {

          el.classList.remove(

            "active"

          );

        });

      document

        .querySelectorAll(

          ".modal"

        )

        .forEach((m) => {

          m.style.display =

            "none";

        });

      document.body.classList.remove(

        "modal-open"

      );

    };

})();

window.showToast = showToast;

window.closeProposalModal = closeProposalModal;

window.editJob = editJob;

window.deleteJob = deleteJob;