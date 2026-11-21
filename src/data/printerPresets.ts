/** Referências de modelos FDM para seleção offline. Sem preços, potência ou vida útil oficiais. */
export type PrinterPreset = { id:string; brand:string; model:string; technology:'FDM'; note?:string };
export const printerPresets:PrinterPreset[] = [
 {id:'bambu-a1-mini',brand:'Bambu Lab',model:'A1 mini',technology:'FDM'},
 {id:'bambu-a1',brand:'Bambu Lab',model:'A1',technology:'FDM'},
 {id:'bambu-p1s',brand:'Bambu Lab',model:'P1S',technology:'FDM'},
 {id:'bambu-p2s',brand:'Bambu Lab',model:'P2S',technology:'FDM'},
 {id:'bambu-x1-carbon',brand:'Bambu Lab',model:'X1 Carbon',technology:'FDM'},
 {id:'bambu-h2d',brand:'Bambu Lab',model:'H2D',technology:'FDM'},
 {id:'anycubic-kobra-x',brand:'Anycubic',model:'Kobra X',technology:'FDM'},
 {id:'anycubic-kobra-3',brand:'Anycubic',model:'Kobra 3',technology:'FDM'},
 {id:'anycubic-kobra-3-max',brand:'Anycubic',model:'Kobra 3 Max',technology:'FDM'},
 {id:'anycubic-kobra-s1',brand:'Anycubic',model:'Kobra S1',technology:'FDM'},
 {id:'anycubic-kobra-2-pro',brand:'Anycubic',model:'Kobra 2 Pro',technology:'FDM'},
 {id:'creality-ender-3-v3-se',brand:'Creality',model:'Ender-3 V3 SE',technology:'FDM'},
 {id:'creality-ender-3-v3-ke',brand:'Creality',model:'Ender-3 V3 KE',technology:'FDM'},
 {id:'creality-ender-3-v3',brand:'Creality',model:'Ender-3 V3',technology:'FDM'},
 {id:'creality-k1c',brand:'Creality',model:'K1C',technology:'FDM'},
 {id:'creality-k2-plus',brand:'Creality',model:'K2 Plus',technology:'FDM'},
 {id:'elegoo-neptune-4',brand:'Elegoo',model:'Neptune 4',technology:'FDM'},
 {id:'elegoo-neptune-4-pro',brand:'Elegoo',model:'Neptune 4 Pro',technology:'FDM'},
 {id:'elegoo-centauri-carbon',brand:'Elegoo',model:'Centauri Carbon',technology:'FDM'},
 {id:'prusa-mk4s',brand:'Prusa',model:'MK4S',technology:'FDM'},
 {id:'prusa-core-one',brand:'Prusa',model:'CORE One',technology:'FDM'},
 {id:'flashforge-adventurer-5m',brand:'Flashforge',model:'Adventurer 5M',technology:'FDM'},
 {id:'flashforge-adventurer-5m-pro',brand:'Flashforge',model:'Adventurer 5M Pro',technology:'FDM'},
 {id:'sovol-sv06',brand:'Sovol',model:'SV06',technology:'FDM'},
 {id:'qidi-q1-pro',brand:'QIDI Tech',model:'Q1 Pro',technology:'FDM'},
];
export const printerPresetLabel=(preset:PrinterPreset)=>preset.brand+' '+preset.model;

export type PrinterReference={buildVolume?:string;nozzleDiameter?:number;maxNozzleTemp?:number;maxBedTemp?:number;source?:string;sourceKind:'fabricante'|'não verificado';};
export const printerReferences:Record<string,PrinterReference>={
 'anycubic-kobra-x':{buildVolume:'260 × 260 × 260 mm',nozzleDiameter:0.4,maxNozzleTemp:300,maxBedTemp:100,source:'https://wiki.anycubic.com/fr/fdm-3d-printer/anycubic-kobra-x/faq',sourceKind:'fabricante'},
 'bambu-a1-mini':{buildVolume:'180 × 180 × 180 mm',source:'https://blog.bambulab.com/best-3d-printer-for-beginners/',sourceKind:'fabricante'},
 'bambu-a1':{buildVolume:'256 × 256 × 256 mm',source:'https://blog.bambulab.com/best-3d-printer-for-beginners/',sourceKind:'fabricante'},
 'prusa-mk4s':{buildVolume:'250 × 210 × 220 mm',nozzleDiameter:0.4,source:'https://www.prusa3d.com/product/original-prusa-mk4s-3d-printer/',sourceKind:'fabricante'}
};
export const printerEstimatedCosts={purchasePrice:3500,averageWatts:150,lifetimeHours:3000} as const;
