import type { DetectedFramework } from "../domain/entities/AnalysisResult.js";

interface FrameworkRule {
  name: string;
  configFiles: string[];
  dependencies: string[];
  filePatterns: string[];
}

const FRAMEWORKS: FrameworkRule[] = [
  {
    name: "Next.js",
    configFiles: ["next.config.js", "next.config.mjs", "next.config.ts", "next.config.cjs"],
    dependencies: ["next"],
    filePatterns: ["pages/", "app/", "src/pages/", "src/app/"],
  },
  {
    name: "Nuxt",
    configFiles: ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs"],
    dependencies: ["nuxt"],
    filePatterns: ["pages/", "layouts/", "components/"],
  },
  {
    name: "React",
    configFiles: ["vite.config.ts", "vite.config.js", "vite.config.mjs", "craco.config.js"],
    dependencies: ["react", "react-dom"],
    filePatterns: [".tsx", ".jsx"],
  },
  {
    name: "Vue",
    configFiles: ["vue.config.js", "vue.config.ts"],
    dependencies: ["vue"],
    filePatterns: [".vue"],
  },
  {
    name: "Angular",
    configFiles: ["angular.json", "angular-cli.json"],
    dependencies: ["@angular/core"],
    filePatterns: [".component.ts", ".module.ts", ".service.ts"],
  },
  {
    name: "Svelte",
    configFiles: ["svelte.config.js", "svelte.config.ts", "svelte.config.mjs"],
    dependencies: ["svelte"],
    filePatterns: [".svelte"],
  },
  {
    name: "Express",
    configFiles: [],
    dependencies: ["express"],
    filePatterns: [],
  },
  {
    name: "Fastify",
    configFiles: [],
    dependencies: ["fastify"],
    filePatterns: [],
  },
  {
    name: "NestJS",
    configFiles: ["nest-cli.json"],
    dependencies: ["@nestjs/core"],
    filePatterns: [".controller.ts", ".service.ts", ".module.ts"],
  },
  {
    name: "Django",
    configFiles: ["manage.py", "settings.py"],
    dependencies: ["django"],
    filePatterns: ["models.py", "views.py", "urls.py"],
  },
  {
    name: "Flask",
    configFiles: ["flask_app.py", "wsgi.py"],
    dependencies: ["flask"],
    filePatterns: ["app.py", "routes.py"],
  },
  {
    name: "Spring Boot",
    configFiles: ["pom.xml", "build.gradle", "build.gradle.kts"],
    dependencies: ["spring-boot-starter"],
    filePatterns: ["Application.java", "Controller.java"],
  },
  {
    name: "Rails",
    configFiles: ["Gemfile", "Rakefile", "config.ru"],
    dependencies: ["rails"],
    filePatterns: ["app/models/", "app/controllers/"],
  },
  {
    name: "Laravel",
    configFiles: ["artisan"],
    dependencies: ["laravel/framework"],
    filePatterns: ["app/Http/Controllers/", "routes/web.php"],
  },
  {
    name: "FastAPI",
    configFiles: [],
    dependencies: ["fastapi"],
    filePatterns: ["main.py"],
  },
  {
    name: "Prisma",
    configFiles: ["prisma/schema.prisma"],
    dependencies: ["prisma", "@prisma/client"],
    filePatterns: ["prisma/"],
  },
  {
    name: "Mongoose",
    configFiles: [],
    dependencies: ["mongoose"],
    filePatterns: [".schema.ts", ".model.ts"],
  },
  {
    name: "Drizzle ORM",
    configFiles: ["drizzle.config.ts", "drizzle.config.js"],
    dependencies: ["drizzle-orm"],
    filePatterns: ["schema/", "migrations/"],
  },
  {
    name: "Tailwind CSS",
    configFiles: ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.mjs"],
    dependencies: ["tailwindcss"],
    filePatterns: [],
  },
  {
    name: "Vite",
    configFiles: ["vite.config.ts", "vite.config.js", "vite.config.mjs"],
    dependencies: ["vite"],
    filePatterns: [],
  },
  {
    name: "Webpack",
    configFiles: ["webpack.config.js", "webpack.config.ts"],
    dependencies: ["webpack"],
    filePatterns: [],
  },
  {
    name: "Turborepo",
    configFiles: ["turbo.json"],
    dependencies: ["turbo"],
    filePatterns: [],
  },
  {
    name: "Electron",
    configFiles: ["electron-builder.json", "electron-builder.yml"],
    dependencies: ["electron"],
    filePatterns: ["main.ts", "preload.ts"],
  },
];

export class FrameworkDetector {
  detect(filePaths: string[], depNames: string[]): DetectedFramework[] {
    const depSet = new Set(depNames);
    const results: DetectedFramework[] = [];

    for (const rule of FRAMEWORKS) {
      let confidence = 0;

      if (rule.configFiles.some((cf) => filePaths.some((f) => f.endsWith(cf)))) {
        confidence += 0.5;
      }

      if (rule.dependencies.some((d) => depSet.has(d))) {
        confidence += 0.4;
      }

      if (rule.filePatterns.some((p) => filePaths.some((f) => f.includes(p)))) {
        confidence += 0.1;
      }

      if (confidence > 0) {
        results.push({ name: rule.name, confidence: Math.min(confidence, 1) });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }
}
