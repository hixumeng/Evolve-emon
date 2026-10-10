export const MIN_PRODUCTION_MULTIPLIER = 0.1;
export const MAX_PRODUCTION_MULTIPLIER = 1000;

export function validProductionMultiplier(value){
    const multiplier = Number(value);
    return Number.isFinite(multiplier)
        && multiplier >= MIN_PRODUCTION_MULTIPLIER
        && multiplier <= MAX_PRODUCTION_MULTIPLIER;
}

export function normalizeProductionMultiplier(value){
    return validProductionMultiplier(value) ? Number(value) : 1;
}
