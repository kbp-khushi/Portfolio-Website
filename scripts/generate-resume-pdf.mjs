// Generates Khushi_Patel_Resume.pdf from resume.html using puppeteer-core
// driving a local, already-installed Chrome (no bundled Chromium download).
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const resumeHtmlPath = path.join(repoRoot, "resume.html");
const outputPdfPath = path.join(repoRoot, "Khushi_Patel_Resume.pdf");

// Candidate locations for a locally-installed Chrome/Edge browser.
const candidatePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(
    process.env.LOCALAPPDATA || "",
    "Google\\Chrome\\Application\\chrome.exe"
  ),
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

function findBrowserExecutable() {
  for (const candidate of candidatePaths) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function main() {
  if (!existsSync(resumeHtmlPath)) {
    console.error(`resume.html not found at ${resumeHtmlPath}`);
    process.exit(1);
  }

  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    console.error(
      "Could not find a local Chrome or Edge install in any of the expected paths:\n" +
        candidatePaths.filter(Boolean).join("\n") +
        "\nInstall Chrome, or edit scripts/generate-resume-pdf.mjs to point at your browser's executable."
    );
    process.exit(1);
  }

  console.log(`Using browser at: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const fileUrl = pathToFileURL(resumeHtmlPath).href;
    await page.goto(fileUrl, { waitUntil: "networkidle0" });

    // Give the Adobe Fonts (Typekit) stylesheet a moment to apply if the
    // network is slow — networkidle0 should already cover this, but web
    // fonts can finish swapping slightly after the network settles.
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    await page.pdf({
      path: outputPdfPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
      preferCSSPageSize: false,
    });

    console.log(`Resume PDF written to: ${outputPdfPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Failed to generate resume PDF:", err);
  process.exit(1);
});
