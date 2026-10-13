export const prestigeAmountMax = 1000000000;

export const editablePrestigeResources = {
    Plasmid: 0,
    AntiPlasmid: 0,
    Phage: 0,
    Dark: 3,
    Harmony: 2,
    Blood_Stone: 0,
    Artifact: 0,
    Supercoiled: 0,
    AICore: 0
};

export function validPrestigeAmount(resource, value){
    if (!Object.prototype.hasOwnProperty.call(editablePrestigeResources, resource)
        || !['string', 'number'].includes(typeof value)
        || (typeof value === 'string' && value.trim() === '')){
        return false;
    }
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 && amount <= prestigeAmountMax
        && Number(amount.toFixed(editablePrestigeResources[resource])) === amount;
}
