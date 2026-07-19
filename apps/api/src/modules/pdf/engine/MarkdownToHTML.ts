export class MarkdownToHTML {
  convert(markdown: string): string {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const blocks: string[] = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index].trim();
      if (!line || line === "---") { index++; continue; }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(`<h${level}>${this.inline(heading[2])}</h${level}>`);
        index++;
        continue;
      }

      if (line.startsWith(">")) {
        const quote: string[] = [];
        while (index < lines.length && lines[index].trim().startsWith(">")) {
          quote.push(lines[index].trim().replace(/^>\s?/, ""));
          index++;
        }
        blocks.push(`<div class="callout">${this.inline(quote.join(" "))}</div>`);
        continue;
      }

      if (this.isTableLine(line)) {
        const tableLines: string[] = [];
        while (index < lines.length && this.isTableLine(lines[index].trim())) tableLines.push(lines[index++].trim());
        blocks.push(this.table(tableLines));
        continue;
      }

      if (line.startsWith("- ")) {
        const items: string[] = [];
        while (index < lines.length && lines[index].trim().startsWith("- ")) {
          items.push(`<li>${this.inline(lines[index].trim().slice(2))}</li>`);
          index++;
        }
        blocks.push(`<ul class="doc-list">${items.join("")}</ul>`);
        continue;
      }

      const paragraph: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current) { index++; break; }
        if (current === "---" || /^(#{1,4})\s+/.test(current) || current.startsWith(">") || current.startsWith("- ") || this.isTableLine(current)) break;
        paragraph.push(current);
        index++;
      }
      if (paragraph.length) blocks.push(`<p>${this.inline(paragraph.join(" "))}</p>`);
    }

    return blocks.join("\n");
  }

  private isTableLine(line: string): boolean {
    return line.startsWith("|") && line.endsWith("|");
  }

  private table(lines: string[]): string {
    const rows = lines
      .filter((line) => !/^\|[\s|:-]+\|$/.test(line))
      .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
    if (!rows.length) return "";

    const header = rows[0].map((cell) => `<th>${this.inline(cell)}</th>`).join("");
    const body = rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${this.inline(cell)}</td>`).join("")}</tr>`).join("");
    return `<table class="doc-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  }

  private inline(value: string): string {
    return this.escape(value)
      .replace(/`([^`]+)`/g, '<code class="doc-code">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" class="doc-link">$1</a>');
  }

  private escape(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
