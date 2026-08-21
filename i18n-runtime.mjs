/**
 * FormatJS-backed i18n runtime for the play harness (browser ESM).
 */
import { createIntl, createIntlCache } from "https://esm.sh/@formatjs/intl@3.1.3";
import { STF_I18N_CATALOGS } from "./i18n/catalogs-flat.js?v=3ea36b5";

const cache = createIntlCache();
let intl = null;

function rebuildIntl() {
  const locale = globalThis.lang || "en";
  const messages = STF_I18N_CATALOGS[locale] || STF_I18N_CATALOGS.en || {};
  intl = createIntl({ locale, messages }, cache);
}

export function initI18n() {
  rebuildIntl();
  globalThis.tr = (id, values) => {
    try {
      let out = intl.formatMessage(
        { id, defaultMessage: STF_I18N_CATALOGS.en?.[id] || id },
        values,
        { ignoreTag: true }
      );
      // HTML-bearing messages can leave simple {name} placeholders unreplaced.
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          out = out.split(`{${k}}`).join(String(v));
        }
      }
      return out;
    } catch (e) {
      console.warn("[i18n]", id, e);
      return STF_I18N_CATALOGS[globalThis.lang]?.[id] || STF_I18N_CATALOGS.en?.[id] || id;
    }
  };
  globalThis.pairLabel = (o) => {
    if (!o) return "";
    const lc = globalThis.lang || "en";
    if (lc === "uk") return o.uk ?? o.en ?? o.ru;
    if (lc === "ru") return o.ru ?? o.en ?? o.uk;
    if (lc === "nl") return o.nl ?? o.en ?? o.uk;
    return o.en ?? o.ru ?? o.uk ?? "";
  };
  globalThis.pairLang = (en, ru, uk = en, nl = en) => {
    const lc = globalThis.lang || "en";
    if (lc === "uk") return uk ?? en;
    if (lc === "ru") return ru;
    if (lc === "nl") return nl ?? en;
    return en;
  };
}

export function refreshI18n() {
  rebuildIntl();
}

globalThis.STF_I18N_CATALOGS = STF_I18N_CATALOGS;
