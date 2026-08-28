/**
 * Browser copy of supabase/functions/_shared/recipe-detail-steps.ts (issue #65).
 * Keep in sync when changing the shared module.
 */

function clampIndexList(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const v of raw) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function normalizePersistedRecipeSteps(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const label = String(item.label ?? "").trim();
    if (!label) continue;
    const componentId = item.component_recipe_id != null
      ? String(item.component_recipe_id).trim()
      : "";
    const normalized = {
      label,
      ingredient_indexes: clampIndexList(item.ingredient_indexes),
      instruction_indexes: clampIndexList(item.instruction_indexes),
    };
    if (item.label_locales && typeof item.label_locales === "object") {
      normalized.label_locales = item.label_locales;
    }
    if (componentId) normalized.component_recipe_id = componentId;
    out.push(normalized);
  }
  return out;
}

export function buildRecipeDetailStepViewModels(rawSteps) {
  const persisted = normalizePersistedRecipeSteps(rawSteps);
  if (persisted.length === 0) {
    return { flatten: true, steps: [] };
  }
  if (persisted.length === 1 && !persisted[0].component_recipe_id) {
    return { flatten: true, steps: [] };
  }

  const steps = persisted.map((step) => {
    if (step.component_recipe_id) {
      return {
        kind: "component",
        label: step.label,
        component_recipe_id: step.component_recipe_id,
      };
    }
    return {
      kind: "phase",
      label: step.label,
      ingredient_indexes: step.ingredient_indexes ?? [],
      instruction_indexes: step.instruction_indexes ?? [],
    };
  });

  return { flatten: false, steps };
}

export function sliceIndexedItems(items, indexes) {
  const out = [];
  const seen = new Set();
  for (const i of indexes) {
    if (!Number.isInteger(i) || i < 0 || i >= items.length || seen.has(i)) continue;
    seen.add(i);
    out.push(items[i]);
  }
  return out;
}
