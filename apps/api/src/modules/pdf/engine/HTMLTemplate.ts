export function buildHTMLDocument(title: string, bodyHTML: string, metadata?: { date?: string; fileCount?: number; folderCount?: number }): string {
  const date = metadata?.date ?? new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Documentacion</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    :root {
      --primary: #0f172a;
      --primary-light: #1e293b;
      --accent: #3b82f6;
      --accent-light: #60a5fa;
      --accent-bg: #eff6ff;
      --surface: #f8fafc;
      --border: #e2e8f0;
      --text: #1e293b;
      --text-secondary: #64748b;
      --text-muted: #94a3b8;
      --success: #059669;
      --warning: #d97706;
      --danger: #dc2626;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      margin: 0;
    }

    body {
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 10pt;
      line-height: 1.65;
      color: var(--text);
      background: #fff;
    }

    /* ========== COVER PAGE ========== */
    .cover {
      width: 100%;
      min-height: 100vh;
      background: linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 50px;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    .cover::before {
      content: '';
      position: absolute;
      top: -200px;
      right: -200px;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.08);
    }

    .cover::after {
      content: '';
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.05);
    }

    .cover-brand {
      font-size: 11pt;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: var(--accent-light);
      margin-bottom: 50px;
      position: relative;
      z-index: 1;
    }

    .cover-title {
      font-size: 38pt;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      color: var(--text-muted);
      margin-bottom: 50px;
      position: relative;
      z-index: 1;
    }

    .cover-divider {
      width: 80px;
      height: 3px;
      background: var(--accent);
      margin: 0 auto 40px;
      border-radius: 2px;
      position: relative;
      z-index: 1;
    }

    .cover-meta {
      display: flex;
      gap: 40px;
      font-size: 9.5pt;
      color: var(--text-muted);
      position: relative;
      z-index: 1;
    }

    .cover-meta-item {
      text-align: center;
    }

    .cover-meta-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .cover-meta-value {
      font-weight: 600;
      color: #e2e8f0;
    }

    .cover-footer {
      position: absolute;
      bottom: 30px;
      font-size: 8pt;
      color: #475569;
      letter-spacing: 0.5px;
      z-index: 1;
    }

    /* ========== TABLE OF CONTENTS ========== */
    .toc {
      page-break-after: always;
      padding: 60px 50px;
    }

    .toc-title {
      font-size: 20pt;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 30px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--border);
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toc-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--accent);
      color: #fff;
      font-size: 9pt;
      font-weight: 700;
      flex-shrink: 0;
    }

    .toc-text {
      font-size: 11pt;
      font-weight: 500;
      color: var(--text);
    }

    /* ========== SECTION CONTENT ========== */
    .content {
      padding: 40px 50px;
    }

    h1 {
      font-size: 24pt;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 16pt;
      font-weight: 700;
      color: var(--primary);
      margin-top: 0;
      margin-bottom: 20px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-left: 4px solid var(--accent);
      border-radius: 0 8px 8px 0;
      page-break-after: avoid;
      break-before: page;
      page-break-before: always;
    }

    h2:first-child {
      page-break-before: avoid;
    }

    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: var(--primary-light);
      margin-top: 22px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
      page-break-after: avoid;
    }

    h4 {
      font-size: 10.5pt;
      font-weight: 600;
      color: var(--text);
      margin-top: 16px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
      color: var(--text-secondary);
    }

    strong {
      color: var(--text);
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 18px 0;
    }

    /* ========== TABLES ========== */
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px;
      font-size: 9pt;
      border-radius: 8px;
      overflow: hidden;
      break-inside: auto;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .doc-table thead {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }

    .doc-table thead { display: table-header-group; }
    .doc-table tr { break-inside: avoid; page-break-inside: avoid; }

    .doc-table th {
      background: transparent;
      color: #f1f5f9;
      padding: 11px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border: none;
    }

    .doc-table td {
      padding: 10px 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      color: var(--text-secondary);
    }

    .doc-table tbody tr:last-child td {
      border-bottom: none;
    }

    .doc-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .doc-table tbody tr:hover {
      background: #f1f5f9;
    }

    /* ========== LISTS ========== */
    .doc-list {
      margin: 10px 0 14px 0;
      list-style: none;
      padding-left: 0;
    }

    .doc-list li {
      margin-bottom: 7px;
      padding: 8px 12px 8px 32px;
      position: relative;
      color: var(--text-secondary);
      background: var(--surface);
      border-radius: 6px;
      border: 1px solid #f1f5f9;
    }

    .doc-list li::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }

    /* ========== CODE ========== */
    .doc-code {
      background: #f1f5f9;
      padding: 2px 7px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 8.5pt;
      color: #be185d;
      border: 1px solid var(--border);
    }

    /* ========== LINKS ========== */
    .doc-link {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid #93c5fd;
    }

    /* ========== CALLOUTS ========== */
    .callout {
      border-left: 4px solid var(--accent);
      background: var(--accent-bg);
      padding: 14px 18px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
      color: var(--text-secondary);
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    .callout strong {
      color: var(--accent);
    }

    /* ========== PAGE HEADER / FOOTER ========== */
    .page-header {
      position: running(header);
      font-size: 7.5pt;
      color: var(--text-muted);
      text-align: right;
      padding: 0 50px;
    }

    .page-footer {
      position: running(footer);
    }

    /* ========== PRINT ========== */
    @media print {
      .cover { min-height: 100vh; }
      h2 { break-before: page; page-break-before: always; }
      .callout { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div class="cover-brand">ArchMind</div>
    <div class="cover-title">${title}</div>
    <div class="cover-subtitle">Documentacion Tecnica del Proyecto</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Fecha</div>
        <div class="cover-meta-value">${date}</div>
      </div>
      ${metadata?.fileCount ? `<div class="cover-meta-item"><div class="cover-meta-label">Archivos</div><div class="cover-meta-value">${metadata.fileCount}</div></div>` : ""}
      ${metadata?.folderCount ? `<div class="cover-meta-item"><div class="cover-meta-label">Carpetas</div><div class="cover-meta-value">${metadata.folderCount}</div></div>` : ""}
    </div>
    <div class="cover-footer">Generado por ArchMind</div>
  </div>

  <!-- CONTENT -->
  <div class="content">
    ${bodyHTML}
  </div>

</body>
</html>`;
}
