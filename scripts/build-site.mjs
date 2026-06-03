import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteDir = path.join(root, "site");
const pagesDir = path.join(siteDir, "pages");

const groups = [
  { name: "Core Docs", files: list("docs", ".md") },
  { name: "Checklists", files: list("checklists", ".md") },
  { name: "Bad Cases", files: list("bad-cases", ".md") },
  { name: "Tutorials", files: list("tutorials", ".md") },
  { name: "Projects", files: ["projects/README.md"] },
  { name: "Examples", files: list("examples", ".md") },
  { name: "Resources", files: list("resources", ".md") },
  { name: "Templates", files: list("templates", ".md") },
].map((group) => ({
  ...group,
  files: group.files.filter((file) => fs.existsSync(path.join(root, file))),
}));

const markdownFiles = groups.flatMap((group) => group.files);
const pageMap = new Map(markdownFiles.map((file) => [file, pageName(file)]));

fs.mkdirSync(pagesDir, { recursive: true });

for (const file of markdownFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const title = getTitle(source, file);
  const html = markdownToHtml(source, file);
  fs.writeFileSync(
    path.join(pagesDir, pageName(file)),
    pageTemplate({
      title,
      body: html,
      sourcePath: file,
    }),
  );
}

fs.writeFileSync(path.join(siteDir, "docs.html"), docsIndexTemplate(groups));

function list(dir, ext) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  walk(base, out, ext);
  return out
    .map((file) => path.relative(root, file).replaceAll(path.sep, "/"))
    .sort();
}

function walk(dir, out, ext) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) walk(file, out, ext);
    else if (file.endsWith(ext)) out.push(file);
  }
}

function pageName(file) {
  return `${file.replace(/\.md$/, "").replaceAll("/", "__")}.html`;
}

function getTitle(markdown, file) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripInline(match[1]) : file;
}

function markdownToHtml(markdown, currentFile) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inCode = false;
  let code = [];
  let inList = false;
  let paragraph = [];
  let table = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "), currentFile)}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!inList) return;
    html.push("</ul>");
    inList = false;
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((row) => !/^\|\s*-+/.test(row));
    if (rows.length) {
      html.push("<table>");
      rows.forEach((row, index) => {
        const cells = row
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());
        html.push("<tr>");
        for (const cell of cells) {
          const tag = index === 0 ? "th" : "td";
          html.push(`<${tag}>${inline(cell, currentFile)}</${tag}>`);
        }
        html.push("</tr>");
      });
      html.push("</table>");
    }
    table = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      flushTable();
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (/^\|.+\|$/.test(line.trim())) {
      flushParagraph();
      flushList();
      table.push(line.trim());
      continue;
    }

    flushTable();

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2], currentFile)}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(bullet[1], currentFile)}</li>`);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(ordered[1], currentFile)}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();

  return html.join("\n");
}

function inline(text, currentFile) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeHtml(resolveLink(href, currentFile))}">${label}</a>`;
  });
  return output;
}

function resolveLink(href, currentFile) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [target, hash = ""] = href.split("#");
  if (!target) return href;
  const resolved = path
    .normalize(path.join(path.dirname(currentFile), target))
    .replaceAll(path.sep, "/");
  if (pageMap.has(resolved)) {
    return `./${pageMap.get(resolved)}${hash ? `#${hash}` : ""}`;
  }
  return `https://github.com/YanpengQi7/awesome-ai-application-engineer/blob/main/${resolved}${hash ? `#${hash}` : ""}`;
}

function stripInline(text) {
  return text.replace(/[`*_]/g, "").trim();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageTemplate({ title, body, sourcePath }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} · Awesome AI Application Engineer</title>
    <link rel="stylesheet" href="../assets/styles.css" />
  </head>
  <body>
    ${nav("../")}
    <main class="article">
      <div class="lang-switch">
        <a class="pill" href="../docs.html">All Pages</a>
        <a class="pill" href="https://github.com/YanpengQi7/awesome-ai-application-engineer/blob/main/${sourcePath}">Edit on GitHub</a>
      </div>
      ${body}
    </main>
    ${footer()}
  </body>
</html>
`;
}

function docsIndexTemplate(groups) {
  const sections = groups
    .filter((group) => group.files.length)
    .map((group) => {
      const cards = group.files
        .map((file) => {
          const source = fs.readFileSync(path.join(root, file), "utf8");
          const title = getTitle(source, file);
          return `<article class="card"><h3><a href="pages/${pageName(file)}">${escapeHtml(title)}</a></h3><p>${escapeHtml(file)}</p></article>`;
        })
        .join("\n");
      return `<section class="section"><h2>${escapeHtml(group.name)}</h2><div class="grid">${cards}</div></section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>All Pages · Awesome AI Application Engineer</title>
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body>
    ${nav("./")}
    <main class="content">
      <section class="hero compact">
        <p class="eyebrow">Docs, Checklists, Examples, Templates</p>
        <h1>All pages</h1>
        <p class="lead">Browse the full repository as an online documentation site. These pages are generated from Markdown in the GitHub repository.</p>
      </section>
      ${sections}
    </main>
    ${footer()}
  </body>
</html>
`;
}

function nav(prefix) {
  return `<header class="site-header">
      <nav class="nav">
        <a class="brand" href="${prefix}">Awesome AI Application Engineer</a>
        <div class="nav-links">
          <a href="${prefix}docs.html">All Pages</a>
          <a href="${prefix}tutorials/personal-knowledge-base/zh-CN.html">中文教程</a>
          <a href="${prefix}tutorials/personal-knowledge-base/en.html">English Tutorial</a>
          <a href="https://github.com/YanpengQi7/awesome-ai-application-engineer">GitHub</a>
        </div>
      </nav>
    </header>`;
}

function footer() {
  return `<footer class="footer">Built for developers learning production AI application engineering.</footer>`;
}
