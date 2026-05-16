/* =====================================

   ui.js

   SoDa Outdoor Designs

   UI / Toasts / Modals / Helpers

===================================== */

(function () {

  "use strict";

  /* =====================================

     INIT

  ===================================== */

  document.addEventListener(

    "DOMContentLoaded",

    initUI

  );

  function initUI() {

    try {

      bindAddonToggles();

      bindNumberFormatting();

      bindModalEscClose();

      bindQuickActions();

      setInitialTimelineState();

    } catch (e) {

      console.error(

        "UI init failed:",

        e

      );

    }

  }

  /* =====================================

     TOAST SYSTEM

  ===================================== */

  function showToast(

    message,

    type = "info",

    duration = 2600

  ) {

    try {

      let wrap =

        document.getElementById(

          "toastWrap"

        );

      if (!wrap) {

        wrap =

          document.createElement(

            "div"

          );

        wrap.id = "toastWrap";

        Object.assign(

          wrap.style,

          {

            position: "fixed",

            right: "18px",

            bottom: "18px",

            zIndex: "99999",

            display: "flex",

            flexDirection: "column",

            gap: "10px"

          }

        );

        document.body.appendChild(

          wrap

        );

      }

      const toast =

        document.createElement(

          "div"

        );

      toast.className =

        "soda-toast";

      const colors = {

        success: "#18b66a",

        error: "#c43b3b",

        warning: "#cfa11f",

        info: "#222"

      };

      Object.assign(

        toast.style,

        {

          minWidth: "240px",

          maxWidth: "340px",

          padding: "12px 14px",

          borderRadius: "10px",

          color: "#fff",

          fontWeight: "600",

          fontSize: "14px",

          background:

            colors[type] ||

            colors.info,

          boxShadow:

            "0 12px 30px rgba(0,0,0,.25)",

          opacity: "0",

          transform:

            "translateY(10px)",

          transition:

            "opacity .18s ease, transform .18s ease"

        }

      );

      toast.innerText =

        message;

      wrap.appendChild(

        toast

      );

      requestAnimationFrame(

        () => {

          toast.style.opacity =

            "1";

          toast.style.transform =

            "translateY(0)";

        }

      );

   

        setTimeout(

          () => {

            toast.style.opacity =

              "0";

            toast.style.transform =

              "translateY(8px)";

            setTimeout(

              () => {

                toast.remove();

              },

              220

            );

          },

          duration

        );

    } catch (e) {

      console.error(

        "Toast failed:",

        e

      );

    }

  }

  /* =====================================

     LOADER

  ===================================== */

  function showLoader(

    text = "Loading..."

  ) {

    try {

      let loader =

        document.getElementById(

          "globalLoader"

        );

      if (!loader) {

        loader =

          document.createElement(

            "div"

          );

        loader.id =

          "globalLoader";

        loader.innerHTML = `

          <div class="loader-box">

            <div class="loader-spin"></div>

            <div id="loaderText">${text}</div>

          </div>

        `;

        Object.assign(

          loader.style,

          {

            position: "fixed",

            inset: "0",

            background:

              "rgba(0,0,0,.65)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: "999999"

          }

        );

        document.body.appendChild(

          loader

        );

        injectLoaderCSS();

      } else {

        loader.style.display =

          "flex";

        const txt =

          document.getElementById(

            "loaderText"

          );

        if (txt) {

          txt.innerText =

            text;

        }

      }

    } catch (e) {

      console.error(e);

    }

  }

  function hideLoader() {

    try {

      const loader =

        document.getElementById(

          "globalLoader"

        );

      if (loader) {

        loader.style.display =

          "none";

      }

    } catch (e) {

      console.error(e);

    }

  }

  function injectLoaderCSS() {

    try {

      if (

        document.getElementById(

          "loaderCSS"

        )

      ) return;

      const style =

        document.createElement(

          "style"

        );

      style.id =

        "loaderCSS";

      style.innerHTML = `

        .loader-box{

          background:#111;

          color:#d4af37;

          border:1px solid #333;

          padding:24px 28px;

          border-radius:12px;

          min-width:220px;

          text-align:center;

          font-weight:700;

        }

        .loader-spin{

          width:28px;

          height:28px;

          border:3px solid #333;

          border-top:3px solid #d4af37;

          border-radius:50%;

          margin:0 auto 14px auto;

          animation:sodaSpin 1s linear infinite;

        }

        @keyframes sodaSpin{

          from{transform:rotate(0deg);}

          to{transform:rotate(360deg);}

        }

      `;

      document.head.appendChild(

        style

      );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     MODALS

  ===================================== */

  function openModal(id) {

    try {

      const modal =

        document.getElementById(

          id

        );

      if (!modal) return;

      modal.style.display =

        "flex";

      document.body.classList.add(

        "modal-open"

      );

    } catch (e) {

      console.error(e);

    }

  }

  function closeModal(id) {

    try {

      const modal =

        document.getElementById(

          id

        );

      if (!modal) return;

      modal.style.display =

        "none";

      document.body.classList.remove(

        "modal-open"

      );

    } catch (e) {

      console.error(e);

    }

  }

  function closeProposalModal() {

    try {

      closeModal(

        "proposalModal"

      );

    } catch (e) {

      console.error(e);

    }

  }

  function bindModalEscClose() {

    document.addEventListener(

      "keydown",

      function (e) {

        try {

          if (

            e.key !==

            "Escape"

          ) return;

          document

            .querySelectorAll(

              ".modal"

            )

            .forEach(

              (m) => {

                m.style.display =

                  "none";

              }

            );

          document.body.classList.remove(

            "modal-open"

          );

        } catch (err) {}

      }

    );

  }

 
  /* =====================================

     ADDON TOGGLES

  ===================================== */

function bindAddonToggles() {

  try {

    Object.keys(

      window.state?.job?.addons || {}

    ).forEach((key) => {

      const box =

        document.getElementById(

          `addon_${key}`

        );

      if (!box) return;

      box.addEventListener(

        "change",

        function () {

          try {

            window.state.job.addons[key] =

              !!this.checked;

            if (

              typeof window.requestRender ===

              "function"

            ) {

              window.requestRender();

            }

          } catch (e) {

            console.error(e);

          }

        }

      );

    });

  } catch (e) {

    console.error(e);

  }

}

  /* =====================================

     INPUT HELPERS

  ===================================== */

  function bindNumberFormatting() {

    try {

      document

        .querySelectorAll(

          "input[type='number']"

        )

        .forEach(

          (input) => {

            input.addEventListener(

              "wheel",

              function () {

                this.blur();

              }

            );

          }

        );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     QUICK ACTIONS

  ===================================== */

  function bindQuickActions() {

    try {

      document

        .querySelectorAll(

          "[data-click]"

        )

        .forEach(

          (btn) => {

            btn.addEventListener(

              "click",

              function () {

                try {

                  const fn =

                    this

                      .dataset

                      .click;

                  if (

                    fn &&

                    typeof window[

                      fn

                    ] ===

                      "function"

                  ) {

                    window[

                      fn

                    ]();

                  }

                } catch (e) {

                  console.error(

                    e

                  );

                }

              }

            );

          }

        );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     FORMATTERS

  ===================================== */

  function money(

    amount

  ) {

    try {

      const n =

        Number(amount) ||

        0;

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

    } catch (e) {

      return "$0.00";

    }

  }

  function percent(

    value

  ) {

    try {

      const n =

        Number(value) ||

        0;

      return `${n.toFixed(

        1

      )}%`;

    } catch (e) {

      return "0.0%";

    }

  }

  /* =====================================

     HTML ESCAPE

  ===================================== */

  function escapeHTML(

    str

  ) {

    try {

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

    } catch (e) {

      return "";

    }

  }

 
  /* =====================================

     CONFIRM WRAPPER

  ===================================== */

  function confirmAction(

    message,

    callback

  ) {

    try {

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

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     RESET UI

  ===================================== */

  function resetUI() {

    try {

      document

        .querySelectorAll(

          ".active"

        )

        .forEach((el) =>

          el.classList.remove(

            "active"

          )

        );

      document

        .querySelectorAll(

          ".modal"

        )

        .forEach(

          (m) =>

            (m.style.display =

              "none")

        );

      document.body.classList.remove(

        "modal-open"

      );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     OPTIONAL LEGACY FUNCTIONS

  ===================================== */

  function editJob() {}

  function deleteJob() {}

  /* =====================================

     EXPORTS

  ===================================== */

  window.showToast =

    showToast;

  window.showLoader =

    showLoader;

  window.hideLoader =

    hideLoader;

  window.openModal =

    openModal;

  window.closeModal =

    closeModal;

  window.closeProposalModal =

    closeProposalModal;

  window.money =

    money;

  window.percent =

    percent;

  window.escapeHTML =

    escapeHTML;

  window.confirmAction =

    confirmAction;

  window.resetUI =

    resetUI;

  window.editJob =

    editJob;

  window.deleteJob =

    deleteJob;

})();