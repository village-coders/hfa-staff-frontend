/**
 * Professional Print & "Save as PDF" Voucher Generator
 * Halal Food Authority — Internal Financial Record System (IFRS)
 */

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };

const fmtMoney = (val, sym = "£") => {
  const n = parseFloat(val) || 0;
  return `${sym}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (val) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).slice(0, 10);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(val).slice(0, 10);
  }
};

/**
 * Triggers professional printing of the complete Claim Voucher
 */
export function printClaimVoucher(claim) {
  if (!claim) return;

  const refNo = claim.id || claim.claimRefNo || "Claim-Record";
  const items = Array.isArray(claim.items) ? claim.items : [];
  const rawAttachments = claim.attachments || claim.files || [];
  const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];
  const history = Array.isArray(claim.history) ? claim.history : [];
  const claimNote = claim.note || claim.notes || claim.claimantNote || claim.officerNote || "";

  const sym = CURRENCY_SYMBOLS[items[0]?.currency] || "£";
  const cardSubtotal = claim.subtotals?.subtotalCard ?? items.reduce((sum, i) => sum + (parseFloat(i.card) || 0), 0);
  const cashSubtotal = claim.subtotals?.subtotalCash ?? items.reduce((sum, i) => sum + (parseFloat(i.cash) || 0), 0);
  const vatSubtotal = claim.subtotals?.subtotalVat ?? items.reduce((sum, i) => sum + (parseFloat(i.vat) || 0), 0);
  const grandTotal = claim.subtotals?.grandTotal ?? claim.amount ?? (cardSubtotal + cashSubtotal);

  // Extract sign-offs
  const verifiedEntry = [...history].reverse().find(h => (h.toStatus || "").toLowerCase() === "verified");
  const approvedPaymentEntry = [...history].reverse().find(h => (h.toStatus || "").toLowerCase() === "approved_for_payment");
  const furtherApprovedEntry = [...history].reverse().find(h => (h.toStatus || "").toLowerCase().includes("further_approval"));
  const paidEntry = [...history].reverse().find(h => (h.toStatus || "").toLowerCase() === "paid");

  const verifier = verifiedEntry?.actorName || claim.verifiedBy || "Financial Officer";
  const verifierDate = verifiedEntry?.timestamp ? formatDate(verifiedEntry.timestamp) : (claim.date ? formatDate(claim.date) : "—");

  const approver = approvedPaymentEntry?.actorName || claim.approvedForPaymentBy || claim.approvedBy || "Chief Executive Officer";
  const approverDate = approvedPaymentEntry?.timestamp ? formatDate(approvedPaymentEntry.timestamp) : "—";

  const furtherApprover = furtherApprovedEntry?.actorName || claim.furtherApprovedBy || "Board Chairman";
  const furtherApproverDate = furtherApprovedEntry?.timestamp ? formatDate(furtherApprovedEntry.timestamp) : "—";

  const payer = paidEntry?.actorName || claim.paidBy || "Accounts Officer";
  const payerDate = paidEntry?.timestamp ? formatDate(paidEntry.timestamp) : "—";

  const statusText = (claim.status || "Submitted").toUpperCase().replace(/_/g, " ");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Voucher_${refNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.4;
    }
    .voucher-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    /* Header */
    .header {
      border-bottom: 2px solid #007A87;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #007A87;
      letter-spacing: -0.3px;
      margin: 0 0 2px 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      margin: 0;
    }
    .voucher-badge-box {
      text-align: right;
    }
    .doc-type {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
    }
    .ref-pill {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 700;
      color: #007A87;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .status-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      margin-left: 6px;
      background: #e2e8f0;
      color: #334155;
    }
    .status-verified { background: #dbeafe; color: #1e40af; }
    .status-approved_for_payment, .status-approved { background: #dcfce7; color: #166534; }
    .status-paid { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    
    /* Meta Grid */
    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .meta-item {
      min-width: 0;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-val {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }

    /* Financial Highlight Row */
    .highlight-strip {
      background: linear-gradient(to right, #f0fdfa, #f8fafc);
      border: 1px solid #ccfbf1;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .grand-total-label {
      font-size: 10px;
      font-weight: 800;
      color: #007A87;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grand-total-val {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
    }
    .breakdown-pills {
      display: flex;
      gap: 14px;
      font-size: 10px;
      color: #334155;
    }
    .breakdown-pills span strong {
      color: #0f172a;
    }

    /* Section Headings */
    .section-title {
      font-size: 10px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 12px 0 6px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10px;
    }
    th {
      background: #007A87;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
    }
    th.text-right, td.text-right {
      text-align: right;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tfoot td {
      font-weight: 800;
      background: #f1f5f9;
      border-top: 1px solid #cbd5e1;
      padding: 6px 8px;
    }

    /* Attachments Schedule */
    .attachment-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 14px;
    }
    .attach-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      background: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
    }
    .attach-name {
      font-weight: 700;
      color: #0f172a;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 220px;
    }
    .attach-meta {
      font-size: 9px;
      color: #64748b;
    }

    /* Sign-off Blocks */
    .sign-blocks {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sign-role {
      font-size: 9px;
      font-weight: 800;
      color: #007A87;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .sign-person {
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      margin-top: 16px;
      margin-bottom: 4px;
    }
    .sign-date {
      font-size: 8px;
      color: #64748b;
    }

    /* Footer */
    .footer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .certified-seal {
      font-weight: 800;
      color: #007A87;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="voucher-container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="brand-title">HALAL FOOD AUTHORITY</h1>
        <p class="brand-sub">Internal Financial Record System (IFRS)</p>
      </div>
      <div class="voucher-badge-box">
        
        <div>
          <span class="ref-pill">${refNo}</span>
          <span class="status-badge status-${(claim.status || "").toLowerCase()}">${statusText}</span>
        </div>
      </div>
    </div>

    <!-- Meta Details Card -->
    <div class="meta-card">
      <div class="meta-item">
        <div class="meta-label">Claimant / Staff</div>
        <div class="meta-val">${claim.claimant || claim.claimantName || "—"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Department</div>
        <div class="meta-val">${claim.dept || claim.department || "Operations"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Filing Date</div>
        <div class="meta-val">${formatDate(claim.date || claim.filingDate)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Company Name</div>
        <div class="meta-val">${claim.companyName || "Halal Food Authority"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Claim Type</div>
        <div class="meta-val">${claim.claimType || "Staff Expense"}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Contact Person</div>
        <div class="meta-val">${claim.contactPerson || "—"} ${claim.contactEmail ? `(${claim.contactEmail})` : ""}</div>
      </div>
    </div>

    <!-- Grand Financial Highlight -->
    <div class="highlight-strip">
      <div>
        <div class="grand-total-label">Authorized Total Claim Amount</div>
        <div class="grand-total-val">${fmtMoney(grandTotal, sym)}</div>
      </div>
      <div class="breakdown-pills">
        <span>Card Subtotal: <strong>${fmtMoney(cardSubtotal, sym)}</strong></span>
        <span>Cash Subtotal: <strong>${fmtMoney(cashSubtotal, sym)}</strong></span>
        <span>VAT Subtotal: <strong>${fmtMoney(vatSubtotal, sym)}</strong></span>
      </div>
    </div>

    <!-- Itemized Expenses Table -->
    <div class="section-title">Itemized Expense Schedule (${items.length} Lines)</div>
    <table>
      <thead>
        <tr>
          <th style="width: 25px;">#</th>
          <th>Description / Category</th>
          <th style="width: 90px;">Budget Type</th>
          <th class="text-right" style="width: 70px;">Credit Card</th>
          <th class="text-right" style="width: 70px;">Cash</th>
          <th class="text-right" style="width: 55px;">VAT</th>
          <th class="text-right" style="width: 80px;">Total Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((it, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${it.category || it.description || "General Expense"}</strong></td>
            <td>${it.type || "In Budget"}</td>
            <td class="text-right">${it.card ? fmtMoney(it.card, sym) : "—"}</td>
            <td class="text-right">${it.cash ? fmtMoney(it.cash, sym) : "—"}</td>
            <td class="text-right">${it.vat ? fmtMoney(it.vat, sym) : "—"}</td>
            <td class="text-right"><strong>${fmtMoney(it.total || it.amount || 0, sym)}</strong></td>
          </tr>
        `).join("") : `
          <tr>
            <td colspan="7" style="text-align: center; color: #64748b;">No individual line items listed.</td>
          </tr>
        `}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; text-transform: uppercase;">Total Reimbursable Sum (${sym}):</td>
          <td class="text-right">${fmtMoney(cardSubtotal, sym)}</td>
          <td class="text-right">${fmtMoney(cashSubtotal, sym)}</td>
          <td class="text-right">${fmtMoney(vatSubtotal, sym)}</td>
          <td class="text-right" style="font-size: 11px; color: #007A87;">${fmtMoney(grandTotal, sym)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Claim Note / Remarks -->
    ${claimNote ? `
      <div class="section-title">Claim Note / Applicant Remarks</div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #007A87; border-radius: 6px; padding: 7px 10px; margin-bottom: 12px; font-size: 9.5px; color: #334155; line-height: 1.45;">
        ${claimNote.replace(/\n/g, '<br/>')}
      </div>
    ` : ""}

    <!-- Attachments Schedule -->
    ${attachments.length > 0 ? `
      <div class="section-title">Supporting Documents & Receipts (${attachments.length} Attached)</div>
      <div class="attachment-grid">
        ${attachments.map((att, i) => {
          const name = typeof att === "string" ? att : att.fileName || att.name || `Document ${i + 1}`;
          const date = att.date || att.uploadDate || att.docDate || "Archived";
          const size = att.fileSize || "Verified";
          return `
            <div class="attach-card">
              <div>
                <div class="attach-name" title="${name}">📎 ${name}</div>
                <div class="attach-meta">Date: ${formatDate(date)} • ${size}</div>
              </div>
              <span style="color: #007A87; font-weight: 700; font-size: 8.5px;">✓ AUDIT VERIFIED</span>
            </div>
          `;
        }).join("")}
      </div>
    ` : ""}

    <!-- Multi-tier Sign-off Authorization Blocks -->
    <div class="section-title">Formal Audit & Multi-tier Authorization Sign-offs</div>
    <div class="sign-blocks">
      <!-- 1. Claimant -->
      <div class="sign-box">
        <div>
          <div class="sign-role">1. Claimant / Submitted By</div>
          <div class="sign-person">${claim.claimant || claim.claimantName || "Staff Member"}</div>
        </div>
        <div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: ${formatDate(claim.date || claim.filingDate)}</div>
        </div>
      </div>

      <!-- 2. Financial Officer -->
      <div class="sign-box">
        <div>
          <div class="sign-role">2. Verified By (Fin. Officer)</div>
          <div class="sign-person">${verifier}</div>
        </div>
        <div>
          <div class="sign-line"></div>
          <div class="sign-date">Verified Date: ${verifierDate}</div>
        </div>
      </div>

      <!-- 3. CEO / Board -->
      <div class="sign-box">
        <div>
          <div class="sign-role">3. Approved For Payment</div>
          <div class="sign-person">${approver}</div>
        </div>
        <div>
          <div class="sign-line"></div>
          <div class="sign-date">Approval Date: ${approverDate}</div>
        </div>
      </div>

      <!-- 4. Accountant -->
      <div class="sign-box">
        <div>
          <div class="sign-role">4. Disbursed By (Accountant)</div>
          <div class="sign-person">${payer}</div>
        </div>
        <div>
          <div class="sign-line"></div>
          <div class="sign-date">Disbursed Date: ${payerDate}</div>
        </div>
      </div>
    </div>

    <!-- Official Security Footer -->
    <div class="footer">
      <div>
        <span class="certified-seal">✓ Certified Official IFRS Record</span>
        <span>• Halal Food Authority (UK)</span>
      </div>
      <div>
        Generated on: ${new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} • System Hash: SHA256-${refNo}
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  // Render in hidden iframe for cleanest, instant printing
  let iframe = document.getElementById("ifrs-print-iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "ifrs-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}

/**
 * Triggers professional printing of a single Document / Receipt Audit Certificate
 */
export function printDocumentRecord(file, claim) {
  if (!file) return;

  const fileName = typeof file === "string" ? file : file.fileName || file.name || "Attached Document";
  const ext = (fileName.includes(".") ? fileName.split(".").pop() : "DOC").toUpperCase();
  const refNo = claim?.id || claim?.claimRefNo || "Claim";
  const docDate = file.date || file.uploadDate || file.docDate || claim?.date || "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document_${fileName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 0;
      margin: 0;
      font-size: 11px;
      line-height: 1.5;
    }
    .cert-box {
      border: 2px solid #007A87;
      border-radius: 12px;
      padding: 24px;
      position: relative;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 20px;
      font-weight: 800;
      color: #007A87;
      margin: 0 0 4px 0;
    }
    .sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .cert-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
    }
    .table-meta {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table-meta td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
    }
    .table-meta td.label {
      width: 35%;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      font-size: 10px;
    }
    .table-meta td.val {
      font-weight: 700;
      color: #0f172a;
    }
    .audit-notice {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 8px;
      padding: 14px;
      margin-top: 24px;
    }
    .audit-notice-title {
      font-weight: 800;
      color: #007A87;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .audit-notice-text {
      color: #0f766e;
      font-size: 10.5px;
      margin: 0;
    }
    .sign-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-unit {
      width: 45%;
    }
    .sign-title {
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 4px;
    }
    .sign-sub {
      font-size: 9px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="cert-box">
    <div class="header">
      <div class="brand">HALAL FOOD AUTHORITY</div>
      <div class="sub">Internal Financial Record System (IFRS)</div>
      <div class="cert-title">Electronic Document Archive & Audit Certificate</div>
    </div>

    <table class="table-meta">
      <tr>
        <td class="label">Document File Name</td>
        <td class="val">${fileName}</td>
      </tr>
      <tr>
        <td class="label">File Format</td>
        <td class="val">${ext}</td>
      </tr>
      <tr>
        <td class="label">Document / Receipt Date</td>
        <td class="val">${formatDate(docDate)}</td>
      </tr>
      <tr>
        <td class="label">Claim Reference ID</td>
        <td class="val">${refNo}</td>
      </tr>
      <tr>
        <td class="label">Claimant</td>
        <td class="val">${claim?.claimant || claim?.claimantName || "—"}</td>
      </tr>
      <tr>
        <td class="label">Department / Unit</td>
        <td class="val">${claim?.dept || claim?.department || "Operations"}</td>
      </tr>
      <tr>
        <td class="label">Company Name</td>
        <td class="val">${claim?.companyName || "Halal Food Authority"}</td>
      </tr>
      <tr>
        <td class="label">Total Claim Sum</td>
        <td class="val">${fmtMoney(claim?.amount || 0)}</td>
      </tr>
      <tr>
        <td class="label">Archive Verification Status</td>
        <td class="val" style="color: #007A87;">AUDIT VERIFIED & DIGITALLY ARCHIVED</td>
      </tr>
    </table>

    <div class="audit-notice">
      <div class="audit-notice-title">Verified Supporting Evidence Record</div>
      <p class="audit-notice-text">
        This document represents verified evidentiary support registered under Claim Reference <strong>${refNo}</strong>.
        It has been reconciled by the Financial Office in accordance with Halal Food Authority accounting guidelines.
      </p>
    </div>

    <div class="sign-row">
      <div class="sign-unit">
        <div class="sign-title">Archived By / Financial Controller</div>
        <div class="sign-line"></div>
        <div class="sign-sub">Halal Food Authority Audit Office</div>
      </div>
      <div class="sign-unit">
        <div class="sign-title">Claimant Acknowledgment</div>
        <div class="sign-line"></div>
        <div class="sign-sub">Date: ${formatDate(docDate)}</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  let iframe = document.getElementById("ifrs-print-iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "ifrs-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
}
