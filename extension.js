const vscode = require("vscode");

const DEBOUNCE_MS = 400;
const MIN_LENGTH = 20;

const SHEBANGS = [
  [/^#!.*\b(ba|z)?sh\b/, "shellscript"],
  [/^#!.*\bruby\b/, "ruby"],
  [/^#!.*\bpython3?\b/, "python"],
  [/^#!.*\bnode\b/, "javascript"],
  [/^#!.*\belixir\b/, "elixir"],
];

const MARKDOWN_ANCHOR = /^(#{1,6} |```)/;
const MARKDOWN_BLOCK = /^(#{1,6} |```|> |\s*[-*] |\d+\. )/;

/** @typedef {import("vscode").TextDocument} TextDocument */
/** @typedef {import("vscode").ExtensionContext} ExtensionContext */

/**
 * @param {string} text
 * @returns {string | null} language id
 */
function detectShebang(text) {
  const shebang = SHEBANGS.find(([pattern]) => pattern.test(text));
  return shebang ? shebang[1] : null;
}

/**
 * @param {string} text
 * @returns {string | null} language id
 */
function detectMarkdown(text) {
  const lines = text.split("\n");
  const hasAnchor = lines.some((l) => MARKDOWN_ANCHOR.test(l));
  const blockLines = lines.filter((l) => MARKDOWN_BLOCK.test(l)).length;

  return hasAnchor || blockLines >= 2 ? "markdown" : null;
}

/**
 * @param {string} text
 * @returns {string | null} language id
 */
function detect(text) {
  const trimmed = text.trim();
  return detectShebang(trimmed) ?? detectMarkdown(trimmed);
}

/** @param {TextDocument} document */
function check(document) {
  if (!document.isUntitled || document.languageId !== "plaintext") return;
  const text = document.getText();
  if (text.length < MIN_LENGTH) return;
  const language = detect(text);
  if (language) {
    vscode.languages
      .setTextDocumentLanguage(document, language)
      .then(undefined, () => {});
  }
}

/** @param {ExtensionContext} context */
function activate(context) {
  const timers = new Map();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(({ document }) => {
      if (!document.isUntitled) return;

      const key = document.uri.toString();
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => check(document), DEBOUNCE_MS));
    }),
    vscode.workspace.onDidCloseTextDocument((document) => {
      const key = document.uri.toString();
      clearTimeout(timers.get(key));
      timers.delete(key);
    }),
    { dispose: () => timers.forEach((timer) => clearTimeout(timer)) }
  );
}

module.exports = { activate };
