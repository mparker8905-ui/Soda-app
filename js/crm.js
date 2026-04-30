/* =====================================

   crm.js

   SoDa Outdoor Designs

   CRM + Leads + Proposals + Pipeline

===================================== */

(function () {

  "use strict";

  /* =====================================

     CONSTANTS

  ===================================== */

  const STORAGE_KEY = "soda_proposals";

  const PIPELINE_STAGES = [

    { key: "lead", label: "Leads" },

    { key: "proposal", label: "Proposals" },

    { key: "pending", label: "Pending" },

    { key: "won", label: "Won" },

    { key: "lost", label: "Lost" }

  ];

  window.PIPELINE_STAGES = PIPELINE_STAGES;

  /* =====================================

     HELPERS

  ===================================== */

  function readCRM() {

    try {

      return JSON.parse(

        localStorage.getItem(STORAGE_KEY)

      ) || [];

    } catch (e) {

      console.error("CRM read failed", e);

      return [];

    }

  }

  function writeCRM(list) {

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify(list)

    );

  }

  function val(id, fallback = "") {

    const el =

      document.getElementById(id);

    return el ? el.value : fallback;

  }

  function num(v) {

    const n = Number(v);

    return Number.isFinite(n)

      ? n

      : 0;

  }

  function toast(msg, type) {

    if (

      typeof window.showToast ===

      "function"

    ) {

      window.showToast(

        msg,

        type

      );

    }

  }

  function rerender() {

    if (

      typeof window.renderPipeline ===

      "function"

    ) {

      window.renderPipeline();

    }

    if (

      typeof window.render ===

      "function"

    ) {

      window.render();

    }

  }

  /* =====================================

     PUBLIC GETTER

  ===================================== */

  window.getSavedProposals =

    function () {

      return readCRM();

    };

  /* =====================================

     CREATE LEAD

  ===================================== */

  window.createLead =

    function () {

      const customer = val(

        "customer"

      ).trim();

      const address = val(

        "address"

      ).trim();

      if (!customer) {

        alert(

          "Enter customer name"

        );

        return;

      }

      const lead = {

        id: Date.now(),

        customer,

        address,

        stage: "lead",

        status: "New Lead",

        total: 0,

        sqft: 0,

        createdAt:

          Date.now()

      };

      const list = readCRM();

      list.push(lead);

      writeCRM(list);

      rerender();

      toast(

        "Lead created",

        "success"

      );

    };

  /* =====================================

     SEND PROPOSAL

  ===================================== */

  window.sendProposal =

    function () {

      try {

        if (

          typeof window.calculateJob !==

          "function"

        ) {

          alert(

            "Calculator unavailable"

          );

          return;

        }

        const r =

          window.calculateJob();

        const customer =

          val(

            "customer",

            "Client"

          );

        const address =

          val("address");

        const quoteDate =

          val("quoteDate");

        const quoteDateFormatted =

          quoteDate

            ? new Date(

                quoteDate

              ).toLocaleDateString()

            : new Date().toLocaleDateString();

        const packageType =

          val(

            "package",

            "standard"

          );

        const proposal = {

          id: Date.now(),

          customer,

          address,

          packageType,

          quoteDate:

            quoteDateFormatted,

          total: r.price,

          sqft: r.totalSqft,

          stage: "proposal",

          status:

            "Proposal Sent",

          createdAt:

            Date.now(),

          snapshot: {

            sqft: val("sqft"),

            houses:

              val(

                "houses"

              ),

            package:

              packageType,

            addons:

              window.state

                ?.job

                ?.addons || {}

          }

        };

        const list =

          readCRM();

        const exists =

          list.find(

            (p) =>

              p.customer ===

                proposal.customer &&

              p.address ===

                proposal.address &&

              p.quoteDate ===

                proposal.quoteDate

          );

        if (!exists) {

          list.push(

            proposal

          );

          writeCRM(

            list

          );

        }

        rerender();

        openProposalWindow(

          proposal,

          r

        );

      } catch (e) {

        console.error(e);

        alert(

          "Proposal error"

        );

      }

    };

  /* =====================================

     PROPOSAL WINDOW

  ===================================== */

  function openProposalWindow(

    proposal,

    r

  ) {

    const win =

      window.open(

        "",

        "_blank"

      );

    if (!win) {

      alert(

        "Popup blocked"

      );

      return;

    }

    const pricePerSqft =

      r.totalSqft

        ? r.price /

          r.totalSqft

        : 0;

    const html = `

<html>

<head>

<title>Proposal</title>

<style>

body{

font-family:Arial;

padding:40px;

background:#000;

color:#d4af37;

max-width:720px;

margin:auto;

}

.section{

margin-top:20px;

}

.line{

display:flex;

justify-content:space-between;

margin:6px 0;

}

.total{

font-size:34px;

font-weight:800;

text-align:right;

margin-top:10px;

}

button{

width:100%;

padding:14px;

margin-top:12px;

font-weight:bold;

border:none;

cursor:pointer;

}

.primary{

background:#d4af37;

color:#000;

}

.reject{

background:#550000;

color:#fff;

}

</style>

</head>

<body>

<h1>SoDa Outdoor Designs</h1>

<div>We build lawns from the soil up</div>

<div class="section">

<b>Client</b><br>

${proposal.customer}<br>

${proposal.address}

</div>

<div class="section">

<b>Proposal Date</b><br>

${proposal.quoteDate}

</div>

<div class="section">

<b>Package</b><br>

${proposal.packageType.toUpperCase()}

</div>

<div class="section">

<div class="line">

<span>Total Sqft</span>

<span>${r.totalSqft.toFixed(

      0

    )}</span>

</div>

<div class="line">

<span>Price / Sqft</span>

<span>$${pricePerSqft.toFixed(

      2

    )}</span>

</div>

<div class="line">

<span>Labor</span>

<span>$${r.laborCost.toFixed(

      2

    )}</span>

</div>

</div>

<div class="section">

<b>Total Investment</b>

<div class="total">

$${r.price.toFixed(

      2

    )}

</div>

</div>

<button class="primary"

onclick="approveProposal()">

Approve Proposal

</button>

<button class="reject"

onclick="markRejected()">

Mark Not Accepted

</button>

</body>

</html>

`;

    win.document.open();

    win.document.write(

      html

    );

    win.document.close();

    win.proposalId =

      proposal.id;

    win.approveProposal =

      function () {

        setStatusById(

          win.proposalId,

          "Accepted"

        );

        win.print();

      };

    win.markRejected =

      function () {

        setStatusById(

          win.proposalId,

          "Not Accepted"

        );

        alert(

          "Marked as Not Accepted"

        );

      };

    setTimeout(() => {

      try {

        win.focus();

        win.print();

      } catch (e) {}

    }, 500);

  }

  /* =====================================

     PIPELINE RENDER

  ===================================== */

  window.renderPipeline =

    function () {

      const container =

        document.getElementById(

          "jobHistoryList"

        );

      if (!container)

        return;

      const list =

        readCRM();

      let html =

        `<div style="display:flex;gap:12px;overflow-x:auto;">`;

      PIPELINE_STAGES.forEach(

        (stage) => {

          const items =

            list.filter(

              (p) =>

                matchStage(

                  p,

                  stage.key

                )

            );

          html += `

          <div style="

            min-width:260px;

            background:#0d0d0d;

            border:1px solid #333;

            border-radius:12px;

            padding:10px;

          ">

          <div style="

            font-weight:bold;

            color:#d4af37;

            margin-bottom:10px;

          ">

            ${stage.label}

            (${items.length})

          </div>

          ${items

            .map(

              (

                p

              ) => `

            <div class="history-card"

            onclick="openProposal(${p.id})">

              <div><b>${p.customer}</b></div>

              <div style="

                font-size:12px;

                color:#aaa;

              ">

                ${

                  p.address ||

                  ""

                }

              </div>

              <div style="

                margin-top:6px;

              ">

                💰 $${num(

                  p.total

                ).toFixed(

                  0

                )}

              </div>

            </div>

          `

            )

            .join(

              ""

            )}

          </div>

        `;

        }

      );

      html +=

        "</div>";

      container.innerHTML =

        html;

    };

  function matchStage(

    p,

    key

  ) {

    if (

      key === "lead"

    )

      return (

        p.stage ===

        "lead"

      );

    if (

      key ===

      "proposal"

    )

      return (

        p.stage ===

        "proposal"

      );

    if (

      key ===

      "pending"

    )

      return (

        p.status ===

        "Pending"

      );

    if (

      key === "won"

    )

      return (

        p.status ===

        "Accepted"

      );

    if (

      key ===

      "lost"

    )

      return (

        p.status ===

        "Not Accepted"

      );

    return false;

  }

  /* =====================================

     OPEN PROPOSAL MODAL

  ===================================== */

  window.openProposal =

    function (id) {

      const list =

        readCRM();

      const p =

        list.find(

          (x) =>

            x.id == id

        );

      if (!p) return;

      window.activeProposalId =

        id;

      const modal =

        document.getElementById(

          "proposalModal"

        );

      const body =

        document.getElementById(

          "modalBody"

        );

      const customer =

        document.getElementById(

          "modalCustomer"

        );

      const address =

        document.getElementById(

          "modalAddress"

        );

      if (

        !modal ||

        !body

      )

        return;

      if (customer)

        customer.innerText =

          p.customer;

      if (address)

        address.innerText =

          p.address ||

          "";

      body.innerHTML = `

        <div class="proposal-wrap">

          <div class="row">

            <b>Date:</b>

            <span>${

              p.quoteDate ||

              "-"

            }</span>

          </div>

          <div class="row">

            <b>Package:</b>

            <span>${(

              p.packageType ||

              "lead"

            ).toUpperCase()}</span>

          </div>

          <div class="row">

            <b>Sqft:</b>

            <span>${

              p.sqft ||

              0

            }</span>

          </div>

          <div class="price">

            💰 $${num(

              p.total

            ).toFixed(

              2

            )}

          </div>

          <div class="row">

            <b>Status:</b>

            <span>${

              p.status

            }</span>

          </div>

        </div>

      `;

      modal.style.display =

        "flex";

    };

  /* =====================================

     CLOSE MODAL

  ===================================== */

  window.closeProposalModal =

    function () {

      const modal =

        document.getElementById(

          "proposalModal"

        );

      if (modal) {

        modal.style.display =

          "none";

      }

    };

  /* =====================================

     STATUS UPDATE

  ===================================== */

  function setStatusById(

    id,

    status

  ) {

    const list =

      readCRM();

    const i =

      list.findIndex(

        (p) =>

          p.id === id

      );

    if (i === -1)

      return;

    list[i].status =

      status;

    if (

      status ===

      "Accepted"

    ) {

      list[i].stage =

        "won";

    } else if (

      status ===

      "Pending"

    ) {

      list[i].stage =

        "pending";

    } else if (

      status ===

      "Not Accepted"

    ) {

      list[i].stage =

        "lost";

    }

    writeCRM(list);

    rerender();

  }

  window.setProposalStatus =

    function (

      status

    ) {

      if (

        !window.activeProposalId

      )

        return;

      setStatusById(

        window.activeProposalId,

        status

      );

      window.openProposal(

        window.activeProposalId

      );

    };

  /* =====================================

     DELETE

  ===================================== */

  window.deleteProposalById =

    function (

      id

    ) {

      let list =

        readCRM();

      list =

        list.filter(

          (p) =>

            p.id != id

        );

      writeCRM(list);

      rerender();

      toast(

        "Proposal deleted",

        "error"

      );

    };

  /* =====================================

     TIMELINE

  ===================================== */

  window.setTimeline =

    function (el) {

      const all =

        document.querySelectorAll(

          "[data-timeline]"

        );

      all.forEach(

        (x) =>

          x.classList.remove(

            "active"

          )

      );

      el.classList.add(

        "active"

      );

      if (

        window.state?.ui

      ) {

        window.state.ui.timeline =

          el.dataset.timeline;

      }

      rerender();

    };

  /* =====================================

     BACKDROP CLOSE

  ===================================== */

  window.handleModalBackground =

    function (e) {

      if (

        e.target ===

        e.currentTarget

      ) {

        window.closeProposalModal();

      }

    };

})();