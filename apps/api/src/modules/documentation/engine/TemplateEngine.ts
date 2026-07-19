// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataMap = Record<string, any>;

export class TemplateEngine {
  render(template: string, data: object): string {
    const d = data as DataMap;
    let result = template;

    result = this.replaceEachBlocks(result, d);
    result = this.replaceConditionals(result, d);
    result = this.replaceVariables(result, d);

    return result.trim();
  }

  private replaceVariables(text: string, d: DataMap): string {
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path: string) => {
      const value = this.resolvePath(d, path);
      if (value === undefined || value === null) return "";
      if (Array.isArray(value)) return value.join(", ");
      return String(value);
    });
  }

  private replaceConditionals(text: string, d: DataMap): string {
    return text.replace(/\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, path: string, content: string) => {
      const value = this.resolvePath(d, path);
      if (value && value !== "" && value !== null && value !== undefined) {
        return this.replaceVariables(content, d);
      }
      return "";
    });
  }

  private replaceEachBlocks(text: string, d: DataMap): string {
    return text.replace(/\{\{#each (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, path: string, body: string) => {
      const arr = this.resolvePath(d, path);
      if (!Array.isArray(arr) || arr.length === 0) return "";

      const lines = arr.map((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          let result = body;
          for (const [key, val] of Object.entries(item as DataMap)) {
            result = result.replace(new RegExp(`\\{\\{this\\.${key}\\}\\}`, "g"), String(val ?? ""));
          }
          return result.trim();
        }
        return body.replace(/\{\{this\}\}/g, String(item)).trim();
      });
      return "\n" + lines.join("\n") + "\n";
    });
  }

  private resolvePath(obj: DataMap, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object") return (current as DataMap)[key];
      return undefined;
    }, obj);
  }
}
