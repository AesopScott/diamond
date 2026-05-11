export const X_COMPOSER_SELECTOR = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
export const X_MEDIA_INPUT_SELECTOR = 'input[data-testid="fileInput"][type="file"], input[type="file"]';

export function buildInsertComposerScript(text) {
  return `
    (() => {
      const text = ${JSON.stringify(String(text || ""))};
      const editor = document.querySelector(${JSON.stringify(X_COMPOSER_SELECTOR)});
      if (!editor) return { ok: false, reason: "composer selector missing" };
      if (editor.getAttribute("contenteditable") === "false" || editor.getAttribute("aria-disabled") === "true") {
        return { ok: false, reason: "composer is not editable" };
      }
      editor.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      const selected = document.execCommand("selectAll", false, null);
      const inserted = document.execCommand("insertText", false, text);
      if (!selected || !inserted) return { ok: false, reason: "composer insert command failed" };
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
      const value = editor.innerText || editor.textContent || "";
      return {
        ok: value.includes(text.slice(0, Math.min(24, text.length))),
        reason: value ? "composer text inserted" : "composer stayed empty after insert",
      };
    })();
  `;
}

export function buildOpenMediaPickerScript() {
  return `
    (() => {
      const input = document.querySelector(${JSON.stringify(X_MEDIA_INPUT_SELECTOR)});
      if (!input) return { ok: false, reason: "media input selector missing" };
      input.click();
      return { ok: true, reason: "platform file picker opened" };
    })();
  `;
}

export async function insertComposerText(webview, text) {
  if (!webview || typeof webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }
  try {
    return await webview.executeJavaScript(buildInsertComposerScript(text));
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}

export async function openMediaPicker(webview) {
  if (!webview || typeof webview.executeJavaScript !== "function") {
    return { ok: false, reason: "embedded browser does not support script execution" };
  }
  try {
    return await webview.executeJavaScript(buildOpenMediaPickerScript());
  } catch (error) {
    return { ok: false, reason: error.message || "script execution failed" };
  }
}
