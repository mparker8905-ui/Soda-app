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

    { key: "builder", label: "Builder Projects" },

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

        localStorage.getItem(STORAGE_KEY) || "[]"

      );

    } catch (e) {

      console.error("CRM read failed:", e);

      return [];

    }

  }

  function writeCRM(list) {

    try {

      localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(list || [])

      );

    } catch (e) {

      console.error("CRM write failed:", e);

    }

  }

  function val(id, fallback = "") {

    const el = document.getElementById(id);

    return el ? el.value : fallback;

  }

  function num(v) {

    const n = Number(v);

    return Number.isFinite(n)

      ? n

      : 0;

  }

  function toast(msg, type = "info") {

    try {

      if (typeof window.showToast === "function") {

        window.showToast(msg, type);

      }

    } catch (e) {

      console.warn(e);

    }

  }

  function rerender() {

    try {

      if (typeof window.renderPipeline === "function") {

        window.renderPipeline();

      }

      if (typeof window.render === "function") {

        window.render();

      }

    } catch (e) {

      console.error("rerender failed:", e);

    }

  }

  /* =====================================

     PUBLIC GETTER

  ===================================== */

  function getSavedProposals() {

    try {

      return readCRM();

    } catch (e) {

      console.error(e);

      return [];

    }

  }

  /* =====================================

     CREATE LEAD

  ===================================== */

  function createLead() {

    try {

      const customer =

        val("customer").trim();

      const address =

        val("address").trim();

      if (!customer) {

        alert("Enter customer name");

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

        proposalSnapshot:

  window.lastBuilderResult ||

  window.lastResult ||

  null,

        createdAt: Date.now()

      };

      const list = readCRM();

      list.push(lead);

      writeCRM(list);

      rerender();

      toast(

        "Lead created",

        "success"

      );

    } catch (e) {

      console.error(

        "createLead failed:",

        e

      );

      toast(

        "Create Lead failed",

        "error"

      );

    }

  }

  /* =====================================

     SEND PROPOSAL

  ===================================== */

  function sendProposal() {

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

        val("customer", "Client");

      const address =

        val("address");

      const quoteDate =

        val("quoteDate");

      const packageType =

        val("package", "standard");

      const quoteDateFormatted =

        quoteDate

          ? new Date(

              quoteDate

            ).toLocaleDateString()

          : new Date()

              .toLocaleDateString();

      const proposal = {

        id: Date.now(),

        customer,

        address,

        packageType,

        quoteDate:

          quoteDateFormatted,

        total:

          num(r.price),

        sqft:

          num(r.totalSqft),

        needs:

          r.needs || {},

        stage:

          "proposal",

        status:

          "Proposal Sent",

        createdAt:

          Date.now(),

        snapshot: {

          sqft:

            val("sqft"),

          houses:

            val("houses"),

          package:

            packageType,

          addons:

            window.state?.job

              ?.addons || {}

        }

      };

      const list = readCRM();

      const exists = list.find(

        p =>

          p.customer ===

            proposal.customer &&

          p.address ===

            proposal.address &&

          p.quoteDate ===

            proposal.quoteDate

      );

      if (!exists) {

        list.push(proposal);

        writeCRM(list);

      }

      rerender();

     const data =

  window.generateResidentialProposalData(

    r

  );

const html =

  window.generateProposalHTML(

    data

  );

const win =

  window.open();

if (!win) {

  alert(

    "Please allow popups."

  );

  return;

}

win.document.open();

win.document.write(html);

win.document.close();

    } catch (e) {

      console.error(

        "sendProposal failed:",

        e

      );

      toast(

        "Proposal failed",

        "error"

      );

    }

  }

  /* =====================================

     PROPOSAL WINDOW

  ===================================== */

  function openProposalWindow(

    proposal,

    r

  ) {

    try {

      const win =

        window.open("", "_blank");

      if (!win) {

        alert("Popup blocked");

        return;

      }

      const pricePerSqft =

        r.totalSqft > 0

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

        background:#000;

        color:#d4af37;

        padding:40px;

        max-width:760px;

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

        margin-top:12px;

      }

      button{

        width:100%;

        padding:14px;

        margin-top:10px;

        font-weight:bold;

        border:none;

        cursor:pointer;

      }

      .primary{

        background:#d4af37;

        color:#000;

      }

      .danger{

        background:#550000;

        color:#fff;

      }

      </style>

      </head>

      <body>

      <h1>SoDa Outdoor Designs</h1>

      <div>

        We build lawns from the soil up

      </div>

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

          <span>

            ${num(r.totalSqft).toFixed(0)}

          </span>

        </div>

        <div class="line">

          <span>Price / Sqft</span>

          <span>

            $${pricePerSqft.toFixed(2)}

          </span>

        </div>

        <div class="line">

          <span>Labor</span>

          <span>

            $${num(r.laborCost).toFixed(2)}

          </span>

        </div>

      </div>

      <div class="section">

        <b>Total Investment</b>

        <div class="total">

          $${num(r.price).toFixed(2)}

        </div>

      </div>

      <button class="primary"

        onclick="approveProposal()">

        Approve Proposal

      </button>

      <button class="danger"

        onclick="markRejected()">

        Mark Not Accepted

      </button>

      </body>

      </html>

      `;

      win.document.open();

      win.document.write(html);

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

    } catch (e) {

      console.error(

        "proposal window failed:",

        e

      );

    }

  }

  /* =====================================

     MATCH STAGE

  ===================================== */

  function matchStage(p, key) {

    if (key === "builder") {

      return p.type === "builder";

    }

    if (p.type === "builder") {

      return false;

    }

    if (key === "lead") {

      return p.stage === "lead";

    }

    if (key === "proposal") {

      return p.stage === "proposal";

    }

    if (key === "pending") {

      return p.status === "Pending";

    }

    if (key === "won") {

      return p.status === "Accepted";

    }

    if (key === "lost") {

      return (

        p.status ===

        "Not Accepted"

      );

    }

    return false;

  }

  /* =====================================

     RENDER PIPELINE

  ===================================== */

  function renderPipeline() {

    try {

      const container =

        document.getElementById(

          "jobHistoryList"

        );

      if (!container) return;

      const list = readCRM();

      let html =

        `<div style="

          display:flex;

          gap:12px;

          overflow-x:auto;

        ">`;

      PIPELINE_STAGES.forEach(

        stage => {

          const items =

            list.filter(p =>

              matchStage(

                p,

                stage.key

              )

            );

          html += `

          <div class="glass-card"

            style="

              min-width:260px;

              ${

                stage.key ===

                "builder"

                  ? "border:2px solid #d4af37;"

                  : ""

              }

            ">

            <div style="

              color:#d4af37;

              font-weight:bold;

              margin-bottom:10px;

            ">

              ${stage.label}

              (${items.length})

            </div>

            ${items.map(p => {

              const isBuilder =

                p.type === "builder";

              const total =

                Number(p.total || 0);

              const houses =

                Number(p.houses || 0);

              return `

                <div class="history-card"

                  style="

                    border:1px solid ${

                      p.status ===

                      "Accepted"

                        ? "#1f7a43"

                        : p.status ===

                          "Not Accepted"

                        ? "#8b1e1e"

                        : "#2a2a2a"

                    };

                    background:${

                      p.status ===

                      "Accepted"

                        ? "rgba(31,122,67,.14)"

                        : p.status ===

                          "Not Accepted"

                        ? "rgba(139,30,30,.16)"

                        : "#111"

                    };

                  "

                  onclick="openProposal(${p.id})">

                  <div>

                    <b>${p.customer}</b>

                    ${isBuilder

                      ? `<span style="

                          color:#d4af37;

                          font-size:11px;

                          margin-left:6px;

                        ">

                          [BUILDER]

                        </span>`

                      : ""

                    }

                  </div>

                  <div style="

                    font-size:12px;

                    color:#aaa;

                  ">

                    ${p.address || ""}

                  </div>

                  ${isBuilder

                    ? `

                    <div style="

                      font-size:11px;

                      color:#888;

                    ">

                      Houses: ${houses}

                    </div>

                    `

                    : ""

                  }

                  <div style="

                    margin-top:6px;

                  ">

                    💰 $${total.toFixed(0)}

                  </div>

                </div>

              `;

            }).join("")}

          </div>

          `;

        }

      );

      html += `</div>`;

      container.innerHTML = html;

    } catch (e) {

      console.error(

        "renderPipeline failed:",

        e

      );

    }

  }

  /* =====================================

     OPEN PROPOSAL

  ===================================== */

  function openProposal(id) {

    try {

      const list = readCRM();

      const p =

        list.find(

          x => x.id == id

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

      if (!modal || !body)

        return;

      const customer =

        document.getElementById(

          "modalCustomer"

        );

      const address =

        document.getElementById(

          "modalAddress"

        );

      if (customer) {

        customer.innerText =

          p.customer || "";

      }

      if (address) {

        address.innerText =

          p.address || "";

      }

      const isBuilder =

        p.type === "builder";

      const total =

        Number(p.total || 0);

      const cost =

        Number(p.cost || 0);

      const houses =

        Number(p.houses || 0);

      const snapshot =

      p.snapshot || {};

      const pricePerLot =

        houses > 0

          ? total / houses

          : 0;

      const costPerLot =

        houses > 0

          ? cost / houses

          : 0;

      const materialHTML =

        Object.entries(

          p.needs || {}

        )

        .map(([k,v]) => `

          <div class="row">

            <b>${k}</b>

            <span>

              ${Number(v).toFixed(1)}

            </span>

          </div>

        `)

        .join("");

      body.innerHTML = `

        <div class="proposal-wrap">

          <div class="row">

            <b>Status:</b>

            <span style="

              color:${

                p.status ===

                "Accepted"

                  ? "#4cff9a"

                  : p.status ===

                    "Not Accepted"

                  ? "#ff4d4d"

                  : "#d4af37"

              };

              font-weight:700;

            ">

              ${p.status || "-"}

            </span>

          </div>

          <div class="row">

            <b>Sqft:</b>

            <span>

              ${p.sqft || 0}

            </span>

          </div>

          <div class="row">

            <b>Total:</b>

            <span>

              $${total.toFixed(2)}

            </span>

          </div>

          ${isBuilder ? `

            <div style="

              margin-top:15px;

              border-top:1px solid #333;

              padding-top:12px;

            ">

              <div style="

                color:#d4af37;

                font-weight:bold;

                margin-bottom:10px;

              ">

                BUILDER PROJECT DETAILS

              </div>

              <div class="row">

                <b>Houses:</b>

                <span>${houses}</span>

              </div>

              <div class="row">

                <b>Total Cost:</b>

                <span>

                  $${cost.toFixed(2)}

                </span>

              </div>

              <div class="row">

                <b>Cost / Lot:</b>

                <span>

                  $${costPerLot.toFixed(2)}

                </span>

              </div>

              <div class="row">

                <b>Price / Lot:</b>

                <span>

                  $${pricePerLot.toFixed(2)}

                </span>

              </div>
            <div class="row">

  <b>Spray Days:</b>

  <span>

    ${snapshot.sprayDays || 0}

  </span>

</div>

<div class="row">

  <b>Production Rate:</b>

  <span>

    ${(snapshot.productionRate || 0)

      .toLocaleString()} sqft/day

  </span>

</div>

<div class="row">

  <b>Labor Cost:</b>

  <span>

    $${Number(

      snapshot.laborCost || 0

    ).toFixed(2)}

  </span>

</div>

<div class="row">

  <b>Material Cost:</b>

  <span>

    $${Number(

      snapshot.materialCost || 0

    ).toFixed(2)}

  </span>

</div>

<div class="row">

  <b>Margin:</b>

  <span>

    ${Number(

      snapshot.margin || 0

    ).toFixed(1)}%

  </span>

</div>

            </div>

          ` : ""}

          <div style="

            margin-top:18px;

            border-top:1px solid #333;

            padding-top:12px;

          ">

            <div style="

              color:#d4af37;

              font-weight:bold;

              margin-bottom:10px;

            ">

              MATERIAL REQUIREMENTS

            </div>

            ${materialHTML ||

              `<div class="muted">

                No material data

              </div>`

            }

          </div>

        </div>

      `;

      modal.style.display =

        "flex";

    } catch (e) {

      console.error(

        "openProposal failed:",

        e

      );

    }

  }

  /* =====================================

     CLOSE MODAL

  ===================================== */

  function closeProposalModal() {

    try {

      const modal =

        document.getElementById(

          "proposalModal"

        );

      if (modal) {

        modal.style.display =

          "none";

      }

    } catch (e) {

      console.error(

        "closeProposalModal failed:",

        e

      );

    }

  }

  /* =====================================

     STATUS

  ===================================== */

  function setStatusById(

    id,

    status

  ) {

    try {

      const list = readCRM();

      const i =

        list.findIndex(

          p => p.id === id

        );

      if (i === -1)

        return;

      list[i].status =

        status;

      if (

        status === "Accepted"

      ) {

        list[i].stage = "won";

        /* =========================

           INVENTORY DEDUCTION

        ========================= */

        if (

          list[i].needs &&

          window.consumeInventory

        ) {

          consumeInventory(

            list[i].needs

          );

        }

      }

      else if (

        status === "Pending"

      ) {

        list[i].stage =

          "pending";

      }

      else if (

        status ===

        "Not Accepted"

      ) {

        list[i].stage =

          "lost";

      }

      writeCRM(list);

      rerender();

      toast(

        "Proposal updated",

        "success"

      );

    } catch (e) {

      console.error(e);

    }

  }

  function setProposalStatus(

    status

  ) {

    try {

      if (

        !window.activeProposalId

      ) return;

      setStatusById(

        window.activeProposalId,

        status

      );

      openProposal(

        window.activeProposalId

      );

    } catch (e) {

      console.error(e);

    }

  }

  /* =====================================

     DELETE

  ===================================== */

  function deleteProposalById(

    id

  ) {

    try {

      let list = readCRM();

      list =

        list.filter(

          p => p.id != id

        );

      writeCRM(list);

      rerender();

      closeProposalModal();

      toast(

        "Proposal deleted",

        "error"

      );

    } catch (e) {

      console.error(e);

    }

  }

//======================
//SAVE BUILDER TO CRM
//======================

window.saveBuilderToCRM = function () {

  try {

    const r = window.lastBuilderResult;

    if (!r) {

      alert(

        "Calculate builder project first."

      );

      return;

    }

    const proposal = {

      id: Date.now(),

      type: "builder",

      customer:

        document.getElementById(

          "builderCustomer"

        )?.value || "Builder Client",

      address:

        document.getElementById(

          "builderAddress"

        )?.value || "",

      stage: "builder",

      status: "Proposal Sent",

      createdAt: Date.now(),

      houses: r.houses || 0,

      sqft: r.totalSqft || 0,

      total: r.price || 0,

      cost: r.totalCost || 0,

      needs: r.needs || {},

      snapshot: r

    };

    const list = readCRM();

    list.push(proposal);

    writeCRM(list);

    rerender();

    toast(

      "Builder proposal saved",

      "success"

    );

  } catch (e) {

    console.error(e);

    toast(

      "Builder CRM save failed",

      "error"

    );

  }

};

  /* =====================================

     TIMELINE

  ===================================== */

  function setTimeline(

    elOrValue

  ) {

    try {

      const buttons =

        document.querySelectorAll(

          "[data-timeline]"

        );

      let value = "";

      if (

        typeof elOrValue ===

        "string"

      ) {

        value = elOrValue;

      } else {

        value =

          elOrValue?.dataset

            ?.timeline ||

          "standard";

      }

      buttons.forEach(btn => {

        const active =

          btn.dataset.timeline ===

          value;

        btn.classList.toggle(

          "active",

          active

        );

      });

      if (window.state?.ui) {

        window.state.ui.timeline =

          value;

      }

      if (

        typeof render ===

        "function"

      ) {

        render();

      }

    } catch (e) {

      console.error(

        "setTimeline failed:",

        e

      );

    }

  }

  /* =====================================

     MODAL BACKGROUND

  ===================================== */

  function handleModalBackground(

    e

  ) {

    try {

      if (

        e.target ===

        e.currentTarget

      ) {

        closeProposalModal();

      }

    } catch (err) {

      console.error(err);

    }

  }

  /* =====================================

     TIMELINE INIT

  ===================================== */

  document.addEventListener(

    "DOMContentLoaded",

    function () {

      try {

        setTimeline(

          window.state?.ui

            ?.timeline ||

          "standard"

        );

      } catch (e) {

        console.error(e);

      }

    }

  );

  /* =====================================

     EXPORTS

  ===================================== */

  window.sendProposal =

    sendProposal;

  window.closeProposalModal =

    closeProposalModal;

  window.createLead =

    createLead;

  window.renderPipeline =

    renderPipeline;

  window.openProposal =

    openProposal;

  window.setProposalStatus =

    setProposalStatus;

  window.deleteProposalById =

    deleteProposalById;

  window.setTimeline =

    setTimeline;

  window.handleModalBackground =

    handleModalBackground;

  window.getSavedProposals =

    getSavedProposals;

})();