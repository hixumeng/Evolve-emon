export const multiplierLimits = {
    capacityMultiplier: { min: 1, max: 1000 },
    buildingCostMultiplier: { min: 0.001, max: 1000 }
};

export function validCustomMultiplier(key, value){
    const limits = multiplierLimits[key];
    const multiplier = Number(value);
    return !!limits && Number.isFinite(multiplier)
        && multiplier >= limits.min && multiplier <= limits.max;
}

export function normalizeCustomMultiplier(key, value){
    return validCustomMultiplier(key, value) ? Number(value) : 1;
}

// Population, storage-slot counts and gameplay meters are not stored materials.
export function isStoredResource(resource, species){
    return resource !== species
        && !['Slave', 'Authority', 'Energy', 'Sus', 'Zen', 'Crates', 'Containers'].includes(resource);
}
