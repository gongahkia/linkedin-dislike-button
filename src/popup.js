const api = typeof browser !== "undefined" ? browser : chrome;
const DEFAULT_SETTINGS = {
  enabled: true,
  surfaces: {
    posts: true,
    comments: true,
    articles: true
  }
};

const DOC_URLS = {
  help: "https://github.com/gongahkia/linkedin-dislike-button/blob/main/README2.md",
  privacy:
    "https://github.com/gongahkia/linkedin-dislike-button/blob/main/README2.md#privacy-and-support",
  audit: "https://github.com/gongahkia/linkedin-dislike-button/blob/main/AUDIT.md"
};

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
      resolve(result || defaults);
    });
  });
}

function storageSet(value) {
  if (!api.storage || !api.storage.local) {
    return Promise.resolve();
  }

  if (typeof api.storage.local.set === "function" && api.storage.local.set.length <= 1) {
    return api.storage.local.set(value);
  }

  return new Promise((resolve) => {
    api.storage.local.set(value, resolve);
  });
}

function getElements() {
  return {
    enabled: document.getElementById("enabled"),
    posts: document.getElementById("surface-posts"),
    comments: document.getElementById("surface-comments"),
    articles: document.getElementById("surface-articles"),
    helpLink: document.getElementById("help-link"),
    privacyLink: document.getElementById("privacy-link"),
    auditLink: document.getElementById("audit-link")
  };
}

function applyLinks(elements) {
  elements.helpLink.href = DOC_URLS.help;
  elements.privacyLink.href = DOC_URLS.privacy;
  elements.auditLink.href = DOC_URLS.audit;
}

function applyFormState(elements, settings) {
  elements.enabled.checked = settings.enabled;
  elements.posts.checked = settings.surfaces.posts;
  elements.comments.checked = settings.surfaces.comments;
  elements.articles.checked = settings.surfaces.articles;

  const disabled = !settings.enabled;
  elements.posts.disabled = disabled;
  elements.comments.disabled = disabled;
  elements.articles.disabled = disabled;
}

function readFormState(elements) {
  return normalizeSettings({
    enabled: elements.enabled.checked,
    surfaces: {
      posts: elements.posts.checked,
      comments: elements.comments.checked,
      articles: elements.articles.checked
    }
  });
}

async function init() {
  const elements = getElements();
  applyLinks(elements);

  const savedSettings = normalizeSettings(await storageGet(DEFAULT_SETTINGS));
  applyFormState(elements, savedSettings);

  document.addEventListener("change", async () => {
    const nextSettings = readFormState(elements);
    applyFormState(elements, nextSettings);
    await storageSet(nextSettings);
  });
}

void init();
