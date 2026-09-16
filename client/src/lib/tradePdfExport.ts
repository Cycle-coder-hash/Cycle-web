import { jsPDF } from "jspdf";
import { TradeEntry, JournalBook } from "@/types/journal";

/**
 * Open a styled, standalone print window for the trade report and trigger native print dialog
 */
export function printTrade(trade: TradeEntry, book?: JournalBook | null): void {
  const printWindow = window.open("", "_blank", "width=850,height=950");

  const screenshots =
    trade.screenshots && trade.screenshots.length > 0
      ? trade.screenshots
      : trade.mediaUrl && trade.mediaType !== "video"
      ? [trade.mediaUrl]
      : [];

  const isWin = trade.pnl > 0.001;
  const isLoss = trade.pnl < -0.001;
  const pnlText = isWin
    ? `+$${trade.pnl.toFixed(2)}`
    : isLoss
    ? `-$${Math.abs(trade.pnl).toFixed(2)}`
    : "$0.00";
  const pnlColor = isWin ? "#10b981" : isLoss ? "#f43f5e" : "#64748b";
  const pnlBg = isWin ? "#ecfdf5" : isLoss ? "#fff1f2" : "#f8fafc";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Trade #${trade.tradeNumber} - ${trade.pair} Audit Report</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #081833;
          }
          .brand-sub {
            font-size: 11px;
            color: #64748b;
            margin-top: 3px;
          }
          .pnl-badge {
            font-size: 22px;
            font-weight: 900;
            color: ${pnlColor};
            background: ${pnlBg};
            padding: 4px 14px;
            border-radius: 9999px;
            border: 1px solid ${pnlColor}33;
            display: inline-block;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 18px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 9px 12px;
          }
          .card-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
          }
          .card-val {
            font-size: 13px;
            font-weight: 800;
            margin-top: 3px;
            font-family: monospace;
          }
          .section {
            margin-bottom: 16px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #475569;
            margin-bottom: 6px;
          }
          .section-body {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            font-size: 12px;
            line-height: 1.55;
            color: #334155;
          }
          .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 8px;
          }
          .img-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            background: #020617;
            padding: 4px;
          }
          .img-box img {
            width: 100%;
            max-height: 240px;
            object-fit: contain;
            border-radius: 6px;
            display: block;
          }
          .img-label {
            font-size: 9px;
            font-family: monospace;
            font-weight: bold;
            color: #94a3b8;
            padding: 4px 6px;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">CYCLE OF CHART — INSTITUTIONAL TRADE REPORT</div>
            <div class="brand-sub">
              ${book ? book.name : "Journal Entry"} • Trade #${trade.tradeNumber} • ${trade.date} ${trade.entryTime} • Timeframe: ${trade.timeframe}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">Net P&amp;L</div>
            <div class="pnl-badge">${pnlText}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Pair &amp; Direction</div>
            <div class="card-val">${trade.pair} (${trade.direction})</div>
          </div>
          <div class="card">
            <div class="card-title">Timeframe</div>
            <div class="card-val">${trade.timeframe}</div>
          </div>
          <div class="card">
            <div class="card-title">Setup Rank</div>
            <div class="card-val">Rank ${trade.tradeRank}</div>
          </div>
          <div class="card">
            <div class="card-title">Followed All Rules</div>
            <div class="card-val" style="color: ${trade.followedRules === "Yes" ? "#10b981" : "#ef4444"};">
              ${trade.followedRules === "Yes" ? "YES (100%)" : "NO (Broken)"}
            </div>
          </div>

          <div class="card">
            <div class="card-title">Entry Price</div>
            <div class="card-val">${trade.entryPrice}</div>
          </div>
          <div class="card">
            <div class="card-title">Stop Loss</div>
            <div class="card-val" style="color: #ef4444;">${trade.stopLoss}</div>
          </div>
          <div class="card">
            <div class="card-title">Take Profit</div>
            <div class="card-val" style="color: #10b981;">${trade.takeProfit}</div>
          </div>
          <div class="card">
            <div class="card-title">Exit Price</div>
            <div class="card-val">${trade.exitPrice}</div>
          </div>

          <div class="card">
            <div class="card-title">Net Pips</div>
            <div class="card-val">${trade.pips} pips</div>
          </div>
          <div class="card">
            <div class="card-title">Risk : Reward</div>
            <div class="card-val">${trade.riskReward}</div>
          </div>
          <div class="card">
            <div class="card-title">Position Lots</div>
            <div class="card-val">${trade.lotSize} lots</div>
          </div>
          <div class="card">
            <div class="card-title">Trade Run</div>
            <div class="card-val">${trade.tradeRun || "N/A"}</div>
          </div>
        </div>

        ${
          trade.note
            ? `
          <div class="section">
            <div class="section-title">Trade Setup Context &amp; Analysis</div>
            <div class="section-body">${trade.note}</div>
          </div>
        `
            : ""
        }

        ${
          trade.learning
            ? `
          <div class="section">
            <div class="section-title">Key Learning &amp; Psychology Reflection</div>
            <div class="section-body">${trade.learning}</div>
          </div>
        `
            : ""
        }

        ${
          trade.customProperties && trade.customProperties.length > 0
            ? `
          <div class="section">
            <div class="section-title">Custom Properties &amp; Confluences</div>
            <div class="grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 0;">
              ${trade.customProperties
                .map(
                  (cp) => `
                <div class="card">
                  <div class="card-title">${cp.name}</div>
                  <div class="card-val" style="font-size: 11px;">${cp.value}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          screenshots.length > 0
            ? `
          <div class="section">
            <div class="section-title">Verified Chart Evidence (${screenshots.length} Screenshot${screenshots.length > 1 ? "s" : ""})</div>
            <div class="images-grid">
              ${screenshots
                .map(
                  (src, idx) => `
                <div class="img-box">
                  <div class="img-label">
                    <span>Evidence #${idx + 1}</span>
                    <span>Trade #${trade.tradeNumber}</span>
                  </div>
                  <img src="${src}" alt="Chart Evidence ${idx + 1}" />
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  } else {
    // Fallback if popup blocker prevents window.open
    window.print();
  }
}

/**
 * Generate a clean, institutional-grade PDF document and trigger browser download
 */
export async function exportTradePdf(trade: TradeEntry, book?: JournalBook | null): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Header Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(8, 24, 51); // Dark Navy #081833
  doc.text("CYCLE OF CHART — TRADE AUDIT REPORT", margin, y);

  y += 5.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const subTitle = `${book?.name || "Strategy Journal"}  •  Trade #${trade.tradeNumber}  •  ${trade.date} ${trade.entryTime}  •  Timeframe: ${trade.timeframe}`;
  doc.text(subTitle, margin, y);

  // Net P&L display
  const isWin = trade.pnl > 0.001;
  const isLoss = trade.pnl < -0.001;
  const pnlText = isWin
    ? `+$${trade.pnl.toFixed(2)}`
    : isLoss
    ? `-$${Math.abs(trade.pnl).toFixed(2)}`
    : "$0.00";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  if (isWin) doc.setTextColor(16, 185, 129);
  else if (isLoss) doc.setTextColor(244, 63, 94);
  else doc.setTextColor(100, 116, 139);
  doc.text(pnlText, pageWidth - margin, y - 1, { align: "right" });

  y += 4.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  y += 7;

  // Grid of 12 primary execution parameters
  const colWidth = (pageWidth - margin * 2 - 9) / 4;
  const rowHeight = 13.5;

  const metrics = [
    { label: "PAIR & DIRECTION", val: `${trade.pair} (${trade.direction.toUpperCase()})` },
    { label: "TIMEFRAME", val: trade.timeframe },
    { label: "SETUP RANK", val: `Rank ${trade.tradeRank}` },
    { label: "FOLLOWED RULES", val: trade.followedRules === "Yes" ? "YES (100%)" : "NO (Broken)" },

    { label: "ENTRY PRICE", val: String(trade.entryPrice) },
    { label: "STOP LOSS", val: String(trade.stopLoss) },
    { label: "TAKE PROFIT", val: String(trade.takeProfit) },
    { label: "EXIT PRICE", val: String(trade.exitPrice) },

    { label: "NET PIPS", val: `${trade.pips} pips` },
    { label: "RISK : REWARD", val: trade.riskReward },
    { label: "POSITION LOTS", val: `${trade.lotSize} lots` },
    { label: "TRADE RUN", val: trade.tradeRun || "N/A" },
  ];

  metrics.forEach((m, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const boxX = margin + col * (colWidth + 3);
    const boxY = y + row * (rowHeight + 2.5);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, boxY, colWidth, rowHeight, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, boxX + 2.8, boxY + 4.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    if (m.label === "FOLLOWED RULES") {
      if (trade.followedRules === "Yes") doc.setTextColor(16, 185, 129);
      else doc.setTextColor(244, 63, 94);
    } else if (m.label === "STOP LOSS") {
      doc.setTextColor(244, 63, 94);
    } else if (m.label === "TAKE PROFIT") {
      doc.setTextColor(16, 185, 129);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(m.val, boxX + 2.8, boxY + 10);
  });

  y += 3 * (rowHeight + 2.5) + 4;

  // Custom properties if any
  if (trade.customProperties && trade.customProperties.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("CUSTOM PROPERTIES & CONFLUENCES", margin, y);
    y += 3.5;

    const propColWidth = (pageWidth - margin * 2 - 6) / 3;
    trade.customProperties.forEach((cp, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const boxX = margin + col * (propColWidth + 3);
      const boxY = y + row * (11 + 2);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, boxY, propColWidth, 11, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(cp.name.toUpperCase(), boxX + 2.5, boxY + 3.8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(cp.value, boxX + 2.5, boxY + 8.5);
    });

    const totalRows = Math.ceil(trade.customProperties.length / 3);
    y += totalRows * 13 + 3;
  }

  // Trade Setup Context Note
  if (trade.note) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("TRADE SETUP CONTEXT & ANALYSIS", margin, y);
    y += 3.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    const splitNote = doc.splitTextToSize(trade.note, pageWidth - margin * 2 - 6);
    const boxH = Math.max(10, splitNote.length * 3.8 + 5);

    doc.roundedRect(margin, y, pageWidth - margin * 2, boxH, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(splitNote, margin + 3, y + 4.5);

    y += boxH + 4.5;
  }

  // Key Learning & Reflection
  if (trade.learning) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("KEY LEARNING & PSYCHOLOGY REFLECTION", margin, y);
    y += 3.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    const splitLearning = doc.splitTextToSize(trade.learning, pageWidth - margin * 2 - 6);
    const boxH = Math.max(10, splitLearning.length * 3.8 + 5);

    doc.roundedRect(margin, y, pageWidth - margin * 2, boxH, 1.8, 1.8, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(splitLearning, margin + 3, y + 4.5);

    y += boxH + 5;
  }

  // Screenshots rendering
  const screenshots =
    trade.screenshots && trade.screenshots.length > 0
      ? trade.screenshots
      : trade.mediaUrl && trade.mediaType !== "video"
      ? [trade.mediaUrl]
      : [];

  if (screenshots.length > 0) {
    for (let i = 0; i < screenshots.length; i++) {
      const imgSrc = screenshots[i];
      // Check if room exists for image (requires ~65mm)
      if (y > 215) {
        doc.addPage();
        y = 16;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`VERIFIED CHART EVIDENCE #${i + 1}`, margin, y);
      y += 3.5;

      try {
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = 65;
        doc.addImage(imgSrc, "JPEG", margin, y, imgWidth, imgHeight, undefined, "FAST");
        y += imgHeight + 5;
      } catch {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`[Attached Chart Evidence #${i + 1}]`, margin + 3, y + 4);
        y += 10;
      }
    }
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Cycle of Chart Institutional Trading Portal • Generated on ${new Date().toLocaleDateString()} • Page ${p} of ${pageCount}`,
      pageWidth / 2,
      288,
      { align: "center" }
    );
  }

  // Trigger browser download
  const cleanPair = trade.pair.replace(/[^a-zA-Z0-9]/g, "");
  const filename = `Trade-#${trade.tradeNumber}-${cleanPair}-Audit.pdf`;
  doc.save(filename);
}
