const api = typeof browser !== "undefined" ? browser : chrome;
const dislikeIconUrl = api.runtime.getURL("images/dislike.png");

const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  surfaces: {
    posts: true,
    comments: true,
    articles: true
  }
});

const COPY = Object.freeze({
  label: "Dislike Draft",
  tooltip:
    "Drafts a respectful reply locally. Nothing is posted automatically.",
  successTitle: "Draft ready for review",
  successBody:
    "Review the text before posting. This extension never submits content for you.",
  failureTitle: "Composer unavailable",
  failureBody:
    "We could not find LinkedIn's native composer on this view."
});

const DRAFTS = Object.freeze({
  posts:
    "Personally, respectfully, this post did not work for me. That is my opinion, and I recognize others may feel differently.",
  comments:
    "Personally, respectfully, this comment did not work for me. That is my opinion, and I recognize others may feel differently.",
  articles:
    "Personally, respectfully, this article did not work for me. That is my opinion, and I recognize others may feel differently."
});

const POST_BAR_SELECTORS = [
  ".feed-shared-social-action-bar",
  "div[class*='feed-shared-social-action-bar']"
];

const COMMENT_BAR_SELECTORS = [
  ".comments-comment-social-bar",
  ".comments-comment-item__action-group",
  "[class*='comments-comment-item__action-group']"
];

const ARTICLE_BAR_SELECTORS = [
  ".reader-social-bar",
  ".social-actions-bar",
  ".article-social-actions"
];

const COMMENT_BUTTON_SELECTORS = [
  "button[aria-label*='Comment']",
  "button[aria-label*='comment']",
  "button.comment-button",
  "button[class*='comment-button']"
];

const REPLY_BUTTON_SELECTORS = [
  "button[aria-label*='Reply']",
  "button[aria-label*='reply']",
  "button.comments-comment-social-bar__reply-action-button"
];

const EDITOR_SELECTORS = [
  "[contenteditable='true'][role='textbox']",
  "[contenteditable='true']"
];

let currentSettings = normalizeSettings(DEFAULT_SETTINGS);
let flushTimer = null;
const pendingRoots = new Set();

function normalizeSettings(input) {
  const surfaces = input && typeof input === "object" ? input.surfaces || {} : {};

  return {
    enabled: input && input.enabled !== false,
    surfaces: {
      posts: surfaces.posts !== false,
      comments: surfaces.comments !== false,
      articles: surfaces.articles !== false
    }
  };
}

function storageGet(defaults) {
  if (!api.storage || !api.storage.local) {
    return Promise.resolve(defaults);
  }

  if (typeof api.storage.local.get === "function" && api.storage.local.get.length <= 1) {
    return api.storage.local.get(defaults);
  }

  return new Promise((resolve) => {
    api.storage.local.get(defaults, (result) => {
      if (api.runtime && api.runtime.lastError) {
        resolve(defaults);
        return;
      }

      resolve(result);
    });
  });
}

async function loadSettings() {
  const result = await storageGet(DEFAULT_SETTINGS);
  return normalizeSettings(result);
}

function showToast(title, body) {
  if (!document.body) {
    return;
  }

  let toast = document.querySelector(".ldb-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "ldb-toast";
    toast.dataset.ldbInjected = "true";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const titleNode = document.createElement("div");
    titleNode.className = "ldb-toast-title";

    const bodyNode = document.createElement("div");
    bodyNode.className = "ldb-toast-body";

    toast.append(titleNode, bodyNode);
    document.body.appendChild(toast);
  }

  const titleNode = toast.querySelector(".ldb-toast-title");
  const bodyNode = toast.querySelector(".ldb-toast-body");
  titleNode.textContent = title;
  bodyNode.textContent = body;

  requestAnimationFrame(() => {
    toast.classList.add("ldb-toast--visible");
  });

  clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => {
    toast.classList.remove("ldb-toast--visible");
  }, 4200);
}

function isVisible(element) {
  return Boolean(element && element.getClientRects().length);
}

function queryFirst(container, selectors) {
  for (const selector of selectors) {
    const match = container.querySelector(selector);
    if (match) {
      return match;
    }
  }

  return null;
}

function collectMatches(root, selectors) {
  if (!root) {
    return [];
  }

  const results = [];
  const seen = new Set();
  const roots = root.nodeType === Node.DOCUMENT_NODE ? [root.documentElement] : [root];

  for (const base of roots) {
    if (!base || typeof base.querySelectorAll !== "function") {
      continue;
    }

    for (const selector of selectors) {
      if (typeof base.matches === "function" && base.matches(selector) && !seen.has(base)) {
        seen.add(base);
        results.push(base);
      }

      for (const match of base.querySelectorAll(selector)) {
        if (!seen.has(match)) {
          seen.add(match);
          results.push(match);
        }
      }
    }
  }

  return results;
}

function isLikelyArticlePage() {
  const path = window.location.pathname;
  return path.startsWith("/pulse/") || path.startsWith("/articles/") || path.includes("/pulse/");
}

function createButton(surface) {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    surface === "comments" ? "ldb-button ldb-button--comment" : "ldb-button";
  button.dataset.ldbInjected = "true";
  button.dataset.ldbRole = "trigger";
  button.dataset.ldbSurface = surface;
  button.title = COPY.tooltip;
  button.setAttribute(
    "aria-label",
    `${COPY.label}. Drafts a respectful reply locally. Nothing is posted automatically.`
  );

  const icon = document.createElement("img");
  icon.className = "ldb-button__icon";
  icon.src = dislikeIconUrl;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "ldb-button__label";
  label.textContent = COPY.label;

  button.append(icon, label);
  return button;
}

function placeCaretAtEnd(node) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(node);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function dispatchEditorInput(editor, text) {
  try {
    editor.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: text,
        inputType: "insertText"
      })
    );
  } catch (error) {
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function applyDraft(editor, text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  editor.replaceChildren(paragraph);
  editor.focus();
  placeCaretAtEnd(paragraph);
  dispatchEditorInput(editor, text);
}

function findEditor(scope) {
  const editors = collectMatches(scope, EDITOR_SELECTORS).filter(isVisible);
  return editors.length ? editors[editors.length - 1] : null;
}

function openDraftComposer({ opener, editorScope, draftText }) {
  opener();

  let attempts = 0;
  const poller = window.setInterval(() => {
    const editor = findEditor(editorScope);
    if (editor) {
      window.clearInterval(poller);
      applyDraft(editor, draftText);
      showToast(COPY.successTitle, COPY.successBody);
      return;
    }

    attempts += 1;
    if (attempts >= 14) {
      window.clearInterval(poller);
      showToast(COPY.failureTitle, COPY.failureBody);
    }
  }, 220);
}

function refreshRoot(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  for (const node of root.querySelectorAll("[data-ldb-injected='true']")) {
    if (!node.classList.contains("ldb-toast")) {
      node.remove();
    }
  }
}

function renderPostButtons(root) {
  if (!currentSettings.enabled || !currentSettings.surfaces.posts) {
    return;
  }

  for (const bar of collectMatches(root, POST_BAR_SELECTORS)) {
    if (bar.querySelector("[data-ldb-role='trigger']")) {
      continue;
    }

    const post = bar.closest(".feed-shared-update-v2, article, [data-urn^='urn:li:activity:']");
    if (!post) {
      continue;
    }

    const commentButton = queryFirst(post, COMMENT_BUTTON_SELECTORS);
    if (!commentButton) {
      continue;
    }

    const button = createButton("posts");
    button.addEventListener("click", () => {
      openDraftComposer({
        opener: () => commentButton.click(),
        editorScope: post,
        draftText: DRAFTS.posts
      });
    });

    bar.appendChild(button);
  }
}

function renderCommentButtons(root) {
  if (!currentSettings.enabled || !currentSettings.surfaces.comments) {
    return;
  }

  for (const bar of collectMatches(root, COMMENT_BAR_SELECTORS)) {
    if (bar.querySelector("[data-ldb-role='trigger']")) {
      continue;
    }

    const comment = bar.closest(".comments-comment-item");
    if (!comment) {
      continue;
    }

    const replyButton = queryFirst(comment, REPLY_BUTTON_SELECTORS);
    if (!replyButton) {
      continue;
    }

    const button = createButton("comments");
    button.addEventListener("click", () => {
      openDraftComposer({
        opener: () => replyButton.click(),
        editorScope: comment,
        draftText: DRAFTS.comments
      });
    });

    bar.appendChild(button);
  }
}

function renderArticleButtons(root) {
  if (!currentSettings.enabled || !currentSettings.surfaces.articles || !isLikelyArticlePage()) {
    return;
  }

  for (const bar of collectMatches(root, ARTICLE_BAR_SELECTORS)) {
    if (bar.querySelector("[data-ldb-role='trigger']")) {
      continue;
    }

    const commentButton = queryFirst(bar, COMMENT_BUTTON_SELECTORS);
    if (!commentButton) {
      continue;
    }

    const articleRoot = bar.closest("article, main, body") || document;
    const button = createButton("articles");
    button.addEventListener("click", () => {
      openDraftComposer({
        opener: () => commentButton.click(),
        editorScope: articleRoot,
        draftText: DRAFTS.articles
      });
    });

    bar.appendChild(button);
  }
}

function renderRoot(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  refreshRoot(root);

  if (!currentSettings.enabled) {
    return;
  }

  renderPostButtons(root);
  renderCommentButtons(root);
  renderArticleButtons(root);
}

function queueRender(root) {
  pendingRoots.add(root && root.nodeType === Node.ELEMENT_NODE ? root : document);

  clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    roots.forEach(renderRoot);
  }, 120);
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") {
    return;
  }

  const next = {
    enabled:
      changes.enabled && Object.prototype.hasOwnProperty.call(changes.enabled, "newValue")
        ? changes.enabled.newValue
        : currentSettings.enabled,
    surfaces:
      changes.surfaces && Object.prototype.hasOwnProperty.call(changes.surfaces, "newValue")
        ? changes.surfaces.newValue
        : currentSettings.surfaces
  };

  currentSettings = normalizeSettings(next);
  queueRender(document);
}

function startObserver() {
  if (!document.body) {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          queueRender(node);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

async function init() {
  currentSettings = await loadSettings();
  queueRender(document);

  if (api.storage && api.storage.onChanged) {
    api.storage.onChanged.addListener(handleStorageChange);
  }

  startObserver();
}

void init();
