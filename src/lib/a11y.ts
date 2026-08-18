export const A11Y_STORAGE_KEY = "aptenodyte-a11y";

export type TextSize = "default" | "large" | "larger";

export type A11ySettings = {
  textSize: TextSize;
  readableFont: boolean;
  highContrast: boolean;
  underlineLinks: boolean;
  textSpacing: boolean;
  strongFocus: boolean;
  reduceMotion: boolean;
};

export const defaultA11ySettings: A11ySettings = {
  textSize: "default",
  readableFont: false,
  highContrast: false,
  underlineLinks: false,
  textSpacing: false,
  strongFocus: false,
  reduceMotion: false,
};

function setAttr(root: HTMLElement, name: string, value: string | null) {
  if (value) {
    root.setAttribute(name, value);
  } else {
    root.removeAttribute(name);
  }
}

export function applyA11ySettings(settings: A11ySettings) {
  const root = document.documentElement;
  setAttr(root, "data-a11y-text", settings.textSize === "default" ? null : settings.textSize);
  setAttr(root, "data-a11y-font", settings.readableFont ? "readable" : null);
  setAttr(root, "data-a11y-contrast", settings.highContrast ? "high" : null);
  setAttr(root, "data-a11y-links", settings.underlineLinks ? "underline" : null);
  setAttr(root, "data-a11y-spacing", settings.textSpacing ? "roomy" : null);
  setAttr(root, "data-a11y-focus", settings.strongFocus ? "strong" : null);
  setAttr(root, "data-a11y-motion", settings.reduceMotion ? "reduce" : null);
}

export function readA11ySettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) {
      return defaultA11ySettings;
    }
    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    return { ...defaultA11ySettings, ...parsed };
  } catch {
    return defaultA11ySettings;
  }
}

export function saveA11ySettings(settings: A11ySettings) {
  localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
  applyA11ySettings(settings);
}

export function resetA11ySettings() {
  localStorage.removeItem(A11Y_STORAGE_KEY);
  applyA11ySettings(defaultA11ySettings);
}

export const a11yInitScript = `(function(){try{var raw=localStorage.getItem("${A11Y_STORAGE_KEY}");if(!raw)return;var s=JSON.parse(raw);var r=document.documentElement;function set(n,v){if(v)r.setAttribute(n,v);else r.removeAttribute(n);}set("data-a11y-text",s.textSize&&s.textSize!=="default"?s.textSize:null);set("data-a11y-font",s.readableFont?"readable":null);set("data-a11y-contrast",s.highContrast?"high":null);set("data-a11y-links",s.underlineLinks?"underline":null);set("data-a11y-spacing",s.textSpacing?"roomy":null);set("data-a11y-focus",s.strongFocus?"strong":null);set("data-a11y-motion",s.reduceMotion?"reduce":null);}catch(e){}})();`;
