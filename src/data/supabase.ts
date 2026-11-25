// Supabase Data API + Auth REST. Chave publishable é pública; jamais usar service_role no navegador.
export const SUPABASE_URL = 'https://bxtbfdddcxbyaomydgxn.supabase.co';
const PUBLIC_KEY = 'sb_publishable_iCoDmcvVvrQZX2IMQY_a_g_MS-v8wK2';
const SESSION_KEY = 'makercusto:session:v1';
export type Session = {access_token:string;refresh_token:string;expires_at?:number;user:{id:string;email?:string}};
export type CatalogEntry = {id:string;kind:string;name:string;manufacturer:string|null;scope:string};
export type StoredPrinter = {id:string;workspace_id:string;model_id:string|null;name:string;purchase_price:number|null;average_watts:number|null;lifetime_hours:number|null;active:boolean};
export type Workspace = {id:string;name:string;owner_id:string};
export type PrinterDraft = {name:string;model_id:string|null;purchase_price:number|null;average_watts:number|null;lifetime_hours:number|null};
const jsonHeaders = {'apikey':PUBLIC_KEY,'Content-Type':'application/json'};
export const sessionStore = {
 get():Session|null {try {const raw=localStorage.getItem(SESSION_KEY);return raw?JSON.parse(raw) as Session:null;}catch{return null;}},
 set(s:Session|null) {try{if(s)localStorage.setItem(SESSION_KEY,JSON.stringify(s));else localStorage.removeItem(SESSION_KEY);}catch{/* sessão em memória não garantida */}}
};
async function response<T>(res:Response):Promise<T>{
 const body=await res.json().catch(()=>({})) as {message?:string;msg?:string;error_description?:string;error?:string};
 if(!res.ok)throw new Error(body.message||body.error_description||body.msg||body.error||'Não foi possível completar a operação.');
 return body as T;
}
function toSession(data:{access_token:string;refresh_token:string;expires_in?:number;user:{id:string;email?:string}}):Session{
 return {access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+((data.expires_in??3600)-60)*1000,user:data.user};
}
export async function signIn(email:string,password:string):Promise<Session>{
 const data=await response<{access_token:string;refresh_token:string;expires_in:number;user:{id:string;email?:string}}>(await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:jsonHeaders,body:JSON.stringify({email,password})}));
 const session=toSession(data);sessionStore.set(session);return session;
}
export async function signUp(email:string,password:string):Promise<boolean>{
 const data=await response<{access_token?:string;refresh_token?:string;expires_in?:number;user?:{id:string;email?:string}}>(await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:jsonHeaders,body:JSON.stringify({email,password})}));
 if(data.access_token&&data.refresh_token&&data.user)sessionStore.set(toSession({access_token:data.access_token,refresh_token:data.refresh_token,expires_in:data.expires_in,user:data.user}));
 return Boolean(data.access_token);
}
export async function signOut():Promise<void>{
 const s=sessionStore.get();sessionStore.set(null);
 if(s)await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{...jsonHeaders,Authorization:'Bearer '+s.access_token}}).catch(()=>undefined);
}
async function freshSession():Promise<Session|null>{
 const s=sessionStore.get();if(!s)return null;
 if(!s.expires_at||s.expires_at>Date.now())return s;
 const result=await response<{access_token:string;refresh_token:string;expires_in:number;user:{id:string;email?:string}}>(await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:jsonHeaders,body:JSON.stringify({refresh_token:s.refresh_token})}));
 const updated=toSession(result);sessionStore.set(updated);return updated;
}
async function api<T>(path:string,method='GET',body?:unknown,prefer?:string):Promise<T>{
 const s=await freshSession();const headers:Record<string,string>={...jsonHeaders};
 if(s)headers.Authorization='Bearer '+s.access_token;
 if(prefer)headers.Prefer=prefer;
 const res=await fetch(SUPABASE_URL+'/rest/v1/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 if(res.status===204)return undefined as T;
 return response<T>(res);
}
export const loadPrinterModels=()=>api<CatalogEntry[]>('mc_catalog?kind=eq.printer_model&status=eq.active&scope=eq.global&select=id,kind,name,manufacturer,scope&order=manufacturer.asc,name.asc');
export const listWorkspaces=()=>api<Workspace[]>('mc_workspaces?select=id,name,owner_id&order=created_at.asc');
export const createWorkspace=async(name:string)=>{
 const id=await api<string>('rpc/mc_create_workspace','POST',{p_name:name});
 return id;
};
export const listPrinters=(workspaceId:string)=>api<StoredPrinter[]>('mc_printers?workspace_id=eq.'+encodeURIComponent(workspaceId)+'&active=eq.true&select=id,workspace_id,model_id,name,purchase_price,average_watts,lifetime_hours,active&order=created_at.asc');
export const insertPrinter=(workspaceId:string,data:PrinterDraft)=>api<StoredPrinter[]>('mc_printers?select=id,workspace_id,model_id,name,purchase_price,average_watts,lifetime_hours,active','POST',{workspace_id:workspaceId,...data},'return=representation');
export const updateStoredPrinter=(id:string,workspaceId:string,data:PrinterDraft)=>api<StoredPrinter[]>('mc_printers?id=eq.'+encodeURIComponent(id)+'&workspace_id=eq.'+encodeURIComponent(workspaceId)+'&select=id,workspace_id,model_id,name,purchase_price,average_watts,lifetime_hours,active','PATCH',data,'return=representation');

export const listCatalog=(kind:string)=>api<CatalogEntry[]>('mc_catalog?kind=eq.'+encodeURIComponent(kind)+'&status=eq.active&select=id,kind,name,manufacturer,scope&order=scope.asc,name.asc');
export const insertCatalog=(workspaceId:string,authorId:string,kind:string,name:string)=>api<CatalogEntry[]>('mc_catalog?select=id,kind,name,manufacturer,scope','POST',{workspace_id:workspaceId,author_id:authorId,scope:'private',kind,name,status:'active'},'return=representation');

export type ProductRecord = {id:string;workspace_id:string;name:string;sku:string|null;kind:'product'|'component'|'kit';description:string|null;sale_price:number|null;active:boolean;created_at:string};
export type CalculatedProductDraft = {name:string;sku:string;description:string;kind:'product'|'component'|'kit';salePrice:number;quantity:number;totalCost:number;parameters:Record<string,unknown>};
export const listProducts=(workspaceId:string)=>api<ProductRecord[]>('mc_products?workspace_id=eq.'+encodeURIComponent(workspaceId)+'&active=eq.true&select=id,workspace_id,name,sku,kind,description,sale_price,active,created_at&order=created_at.desc');
export const saveCalculatedProduct=(workspaceId:string,draft:CalculatedProductDraft)=>api<string>('rpc/mc_save_calculated_product','POST',{
 p_workspace_id:workspaceId,p_name:draft.name,p_kind:draft.kind,p_sku:draft.sku,p_description:draft.description,
 p_sale_price:draft.salePrice,p_quantity:draft.quantity,p_total_cost:draft.totalCost,p_parameters:draft.parameters
});

export const appendProductCalculation=(workspaceId:string,productId:string,requestKey:string,draft:CalculatedProductDraft)=>
 api<string>('rpc/mc_append_product_calculation','POST',{
  p_workspace_id:workspaceId,p_product_id:productId,p_request_key:requestKey,
  p_sale_price:draft.salePrice,p_quantity:draft.quantity,p_total_cost:draft.totalCost,
  p_parameters:draft.parameters
 });

export type AssemblyPart = {id:string;product_id?:string|null;source_snapshot_id?:string|null;name:string;quantity:number;notes:string|null;grams:string|null;unit_cost:number|null;cost_source?:'linked'|'manual'|'legacy'};
export type CompositionPricing={mode:'price'|'margin';targetMarginPercent?:number;orderQuantity?:number};
export type AssemblyRecord = {id:string;pricing?:CompositionPricing|null;price_from_snapshot?:boolean;product_kind?:'product'|'kit';snapshot_id?:string;saved_at?:string;name:string;sku:string|null;description:string|null;sale_price:number|null;created_at:string;parts:AssemblyPart[];revision:number;total_cost:number|null;cost_status:'unknown'|'estimated'|'confirmed'};
export type AssemblyPartDraft = {id?:string;product_id?:string|null;source_snapshot_id?:string|null;name:string;quantity:number;notes:string;grams:number|null;unit_cost?:number|null};
export type ComponentLibraryItem={id:string;name:string;sku:string|null;
 grams:number|null;unit_cost:number|null;cost_source:'snapshot'|'unknown'};
export const listComponentLibrary=(workspaceId:string)=>api<ComponentLibraryItem[]>('rpc/mc_list_component_library','POST',{p_workspace_id:workspaceId});
type LinkedAssemblyDraft={name:string;sku:string;description:string;salePrice:number|null;parts:AssemblyPartDraft[];pricing?:CompositionPricing};
const linkedAssemblyParts=(parts:AssemblyPartDraft[])=>parts.map(part=>({
 product_id:part.product_id??null,source_snapshot_id:part.source_snapshot_id??undefined,name:part.name,quantity:part.quantity,notes:part.notes,
 grams:part.grams,unit_cost:part.unit_cost??null
}));
const assemblyPayload=(draft:LinkedAssemblyDraft)=>{
 const parts=linkedAssemblyParts(draft.parts);
 return draft.pricing?{parts,pricing:draft.pricing}:parts;
};
export const saveAssemblyWithComponents=(workspaceId:string,productId:string|null,draft:LinkedAssemblyDraft)=>
 api<string>('rpc/mc_save_assembly_linked','POST',{
  p_workspace_id:workspaceId,p_product_id:productId,
  p_name:draft.name,p_sku:draft.sku,p_description:draft.description,
  p_sale_price:draft.salePrice,p_parts:assemblyPayload(draft)
 });
export const createComposedProduct=(workspaceId:string,draft:LinkedAssemblyDraft)=>
 api<string>('rpc/mc_create_composed_product','POST',{
  p_workspace_id:workspaceId,p_name:draft.name,p_sku:draft.sku,p_description:draft.description,
  p_sale_price:draft.salePrice,p_parts:assemblyPayload(draft)
 });
export const listAssemblies=(workspaceId:string)=>api<AssemblyRecord[]>('rpc/mc_list_assemblies','POST',{p_workspace_id:workspaceId});
export const getAssemblySnapshot=(workspaceId:string,snapshotId:string)=>
 api<AssemblyRecord|null>('rpc/mc_get_assembly_snapshot','POST',{p_workspace_id:workspaceId,p_snapshot_id:snapshotId});
export const createAssembly=(workspaceId:string,draft:{name:string;sku:string;description:string;salePrice:number|null;parts:AssemblyPartDraft[]})=>
 api<string>('rpc/mc_create_assembly','POST',{
  p_workspace_id:workspaceId,p_name:draft.name,p_sku:draft.sku,p_description:draft.description,
  p_sale_price:draft.salePrice,p_parts:draft.parts
 });

export type ProductFormDraft={name:string;kind:'product'|'component';sku:string;description:string;salePrice:number|null};
export const saveProductRecord=(workspaceId:string,productId:string|null,draft:ProductFormDraft)=>
 api<string>('rpc/mc_save_product_record','POST',{p_workspace_id:workspaceId,p_product_id:productId,
 p_name:draft.name,p_kind:draft.kind,p_sku:draft.sku,p_description:draft.description,p_sale_price:draft.salePrice});
export const updateAssembly=(workspaceId:string,productId:string,draft:{name:string;sku:string;description:string;salePrice:number|null;parts:AssemblyPartDraft[]})=>
 api<number>('rpc/mc_update_assembly','POST',{p_workspace_id:workspaceId,p_product_id:productId,
 p_name:draft.name,p_sku:draft.sku,p_description:draft.description,p_sale_price:draft.salePrice,
 p_parts:draft.parts.map(x=>({id:x.id??null,name:x.name,quantity:x.quantity,notes:x.notes,grams:x.grams,unit_cost:x.unit_cost??null}))});

export type ExistingSpool={id:string;name:string;label:string;initial_grams:number;remaining_grams:number;remaining_cost_estimate:number|null;cost_status:'known'|'estimated'|'unknown';notes:string|null;created_at:string};
export type ExistingSpoolDraft={idempotencyKey:string;name:string;label:string;grams:number;basis:'measured'|'informed'|'estimated';remainingCost:number|null;notes:string};
export const listExistingSpools=(workspaceId:string)=>api<ExistingSpool[]>('rpc/mc_list_existing_spools','POST',{p_workspace_id:workspaceId});
export const registerExistingSpool=(workspaceId:string,draft:ExistingSpoolDraft)=>api<string>('rpc/mc_register_existing_spool','POST',{
 p_workspace_id:workspaceId,p_idempotency_key:draft.idempotencyKey,p_filament_name:draft.name,p_label:draft.label,
 p_grams:draft.grams,p_quantity_basis:draft.basis,p_remaining_cost:draft.remainingCost,p_notes:draft.notes
});

export type PrintOutput={id:string;product_id:string;name:string;planned:number;good:number;failed:number};
export type PrintRecord={id:string;status:'draft'|'partial'|'reserved'|'running'|'completed'|'failed'|'cancelled';printer_id:string;printer_name:string|null;planned_hours:number|null;actual_hours:number|null;notes:string|null;created_at:string;outputs:PrintOutput[]};
export const listPrints=(workspaceId:string)=>api<PrintRecord[]>('rpc/mc_list_prints','POST',{p_workspace_id:workspaceId});

/** Fontes históricas de consumo: read-only, custo estimado ou ausente não vira custo confirmado. */
export type PrintConsumptionSource={
 consumption_id:string;confirmation_id:string;lot_id:string|null;lot_label:string|null;
 cost_status:'known'|'estimated'|'unknown';quantity_basis:'weighed'|'slicer'|'estimated';
 model_g:string;purge_g:string;loss_g:string;unit_cost_snapshot:string|null;
 model_cost_brl:string|null;purge_cost_brl:string|null;loss_cost_brl:string|null;
 author_id:string;confirmed_at:string;precision_note:string;
};
export type PrintConsumptionSources={
 execution_id:string;read_only:true;financially_final:false;snapshot_precision:string;
 lines:PrintConsumptionSource[];
};
export type ExactConsumptionOrigin={
 consumption_id:string;confirmation_id:string;lot_id:string;status:'known'|'estimated'|'unknown';
 original_quantity_g:string;original_total_cost_brl:string|null;
 model_g:string;purge_g:string;loss_g:string;quantity_basis:string;
 purchase_line_id:string|null;source_version:string;captured_at:string;
};
export type ExactConsumptionOrigins={
 execution_id:string;read_only:true;financially_final:false;
 exact_source_version:string;historical_rows_without_capture:number;
 origins:ExactConsumptionOrigin[];
};
export const getL4ExactOrigins=(workspaceId:string,productionId:string)=>
 api<ExactConsumptionOrigins>('rpc/mc_get_l4_exact_origins','POST',{
  p_workspace_id:workspaceId,p_production_id:productionId
 });

/** L4-G02: diagnóstico do servidor, apenas leitura. Nunca é autorização de fechamento. */
export type L4ReadinessSource = {
 consumption_id:string;confirmation_id:string;lot_id:string|null;
 origin_captured:boolean;source_status:'known'|'estimated'|'unknown'|'missing';
 purchase_reference:string|null;model_g:string;purge_g:string;loss_g:string;
};
export type L4CloseReadiness = {
 schema_version:'l4-readiness-v1';workspace_id:string;execution_id:string;
 review_id:string|null;production_status:string;
 confirmed_output_groups:number;consumption_rows:number;exact_origin_missing:number;
 cost_unknown:number;cost_estimated:number;cost_known_without_purchase_reference:number;
 active_reservations:number;reversed_confirmations:number;
 categories_pending:number;categories_supported_claimed:number;
 categories_not_applicable_declared:number;pending_categories:string[];
 sources:L4ReadinessSource[];blockers:string[];
 status:'pending';posting_allowed:false;financially_final:false;computed_live:true;
};
export const getL4CloseReadiness=(workspaceId:string,productionId:string)=>
 api<L4CloseReadiness>('rpc/mc_get_l4_close_readiness','POST',{
  p_workspace_id:workspaceId,p_production_id:productionId,p_review_id:null
 });

export const getPrintConsumptionSources=(workspaceId:string,productionId:string)=>
 api<PrintConsumptionSources>('rpc/mc_get_print_consumption_sources','POST',{
  p_workspace_id:workspaceId,p_production_id:productionId
 });

export const createPrint=(workspaceId:string,draft:{printerId:string;outputs:{product_id:string;quantity:number}[];plannedHours:number|null;notes:string;source:'slicer'|'measured'|'informed'|'estimated'})=>
 api<string>('rpc/mc_create_print','POST',{p_workspace_id:workspaceId,p_printer_id:draft.printerId,
 p_outputs:draft.outputs.map(({product_id,quantity})=>({product_id,quantity})),
 p_planned_hours:draft.plannedHours,p_notes:draft.notes,p_source:draft.source});
export const confirmPrint=(workspaceId:string,draft:{id:string;key:string;outputs:{output_id:string;good:number;failed:number}[];
 consumptions:{lot_id:string;model_g:number;purge_g:number;loss_g:number;basis:'weighed'|'slicer'|'estimated'}[];
 actualHours:number|null})=>api<string>('rpc/mc_confirm_print','POST',{p_workspace_id:workspaceId,p_production_id:draft.id,
 p_idempotency_key:draft.key,p_outputs:draft.outputs,p_consumptions:draft.consumptions,
 p_actual_hours:draft.actualHours,p_finish:false});

export type PrintReservation={
 id:string;production_id:string;lot_id:string;lot_label:string|null;
 quantity:number;remaining:number;status:'active'|'released'|'fulfilled';due_at:string|null;review_overdue:boolean;created_at:string
};
export const listPrintReservations=(workspaceId:string)=>api<PrintReservation[]>('rpc/mc_list_print_reservations','POST',{p_workspace_id:workspaceId});
export const reservePrintLot=(workspaceId:string,draft:{
 productionId:string;lotId:string;quantityGrams:number;key:string
})=>api<string>('rpc/mc_reserve_print_lot','POST',{
 p_workspace_id:workspaceId,p_production_id:draft.productionId,p_lot_id:draft.lotId,
 p_quantity_g:draft.quantityGrams,p_request_key:draft.key
});

export const setPrintReservationDue=(workspaceId:string,reservationId:string,dueAt:string|null)=>
 api<string>('rpc/mc_set_print_reservation_due','POST',{
 p_workspace_id:workspaceId,p_reservation_id:reservationId,p_due_at:dueAt
});
export const cancelPrint=(workspaceId:string,productionId:string,requestKey:string,reason:string)=>
 api<string>('rpc/mc_cancel_print','POST',{
 p_workspace_id:workspaceId,p_production_id:productionId,p_request_key:requestKey,p_reason:reason
});

export const reducePrintPlan=(workspaceId:string,draft:{
 productionId:string;requestKey:string;outputChanges:{output_id:string;new_planned:number}[];
 reservationReleases:{reservation_id:string;release_g:number}[];reason:string
})=>api<string>('rpc/mc_reduce_print_plan','POST',{
 p_workspace_id:workspaceId,p_production_id:draft.productionId,
 p_request_key:draft.requestKey,p_output_changes:draft.outputChanges,
 p_reservation_releases:draft.reservationReleases,p_reason:draft.reason
});

export const swapPrintReservedLot=(workspaceId:string,draft:{
 productionId:string;oldReservationId:string;newLotId:string;
 releaseGrams:number;newReserveGrams:number;requestKey:string;reason:string
})=>api<string>('rpc/mc_swap_print_reserved_lot','POST',{
 p_workspace_id:workspaceId,p_production_id:draft.productionId,
 p_old_reservation_id:draft.oldReservationId,p_new_lot_id:draft.newLotId,
 p_release_g:draft.releaseGrams,p_new_reserve_g:draft.newReserveGrams,
 p_request_key:draft.requestKey,p_reason:draft.reason
});

export type PhysicalConsumptionOccurrence={
 id:string;production_id:string;material_name:string;quantity_g:number;
 quantity_basis:'weighed'|'slicer'|'informed'|'other';observed_at:string;
 source_note:string;possible_lot_id:string|null;possible_lot_label:string|null;
 evidence_reference:string|null;possible_origin_note:string|null;
 status:'registered'|'under_review'|'pending_decision';reported_by:string;created_at:string
};
export const listPhysicalOccurrences=(workspaceId:string)=>
 api<PhysicalConsumptionOccurrence[]>('rpc/mc_list_physical_occurrences','POST',{
  p_workspace_id:workspaceId
 });
export const recordPhysicalOccurrence=(workspaceId:string,draft:{
 productionId:string;materialName:string;quantityGrams:number;
 basis:'weighed'|'slicer'|'informed'|'other';observedAt:string;sourceNote:string;
 possibleLotId:string|null;evidenceReference:string|null;possibleOriginNote:string|null;key:string
})=>api<string>('rpc/mc_record_physical_occurrence','POST',{
 p_workspace_id:workspaceId,p_production_id:draft.productionId,
 p_material_name:draft.materialName,p_quantity_g:draft.quantityGrams,
 p_quantity_basis:draft.basis,p_observed_at:draft.observedAt,
 p_source_note:draft.sourceNote,p_possible_lot_id:draft.possibleLotId,
 p_evidence_reference:draft.evidenceReference,p_possible_origin_note:draft.possibleOriginNote,
 p_idempotency_key:draft.key
});

export type PhysicalOccurrenceReview={
 id:string;occurrence_id:string;prior_status:'registered'|'under_review'|'pending_decision';
 next_status:'under_review'|'pending_decision';
 cause_hypothesis:'unrecorded_input'|'lot_change'|'quantity_error'|'other'|'unknown';
 finding_note:string;evidence_reference:string|null;possible_lot_id:string|null;
 possible_lot_label:string|null;author_id:string;created_at:string;
};
export const listPhysicalOccurrenceReviews=(workspaceId:string)=>
 api<PhysicalOccurrenceReview[]>('rpc/mc_list_physical_occurrence_reviews','POST',{p_workspace_id:workspaceId});
export const reviewPhysicalOccurrence=(workspaceId:string,draft:{
 occurrenceId:string;nextStatus:'under_review'|'pending_decision';
 causeHypothesis:PhysicalOccurrenceReview['cause_hypothesis'];
 findingNote:string;evidenceReference:string|null;possibleLotId:string|null;key:string
})=>api<string>('rpc/mc_review_physical_occurrence','POST',{
 p_workspace_id:workspaceId,p_occurrence_id:draft.occurrenceId,
 p_next_status:draft.nextStatus,p_cause_hypothesis:draft.causeHypothesis,
 p_finding_note:draft.findingNote,p_evidence_reference:draft.evidenceReference,
 p_possible_lot_id:draft.possibleLotId,p_request_key:draft.key
});

export type InventoryAdjustmentProposal={
 id:string;occurrence_id:string;lot_id:string;lot_label:string;
 proposed_delta_g:number;cause:'unrecorded_physical_input'|'verified_count_error';
 origin_note:string;justification:string;evidence_reference:string;
 status:'pending_decision';proposed_by:string;created_at:string
};
export const listInventoryAdjustmentProposals=(workspaceId:string)=>
 api<InventoryAdjustmentProposal[]>('rpc/mc_list_inventory_adjustment_proposals','POST',{p_workspace_id:workspaceId});
export const proposeInventoryAdjustment=(workspaceId:string,draft:{
 occurrenceId:string;lotId:string;deltaGrams:number;
 cause:InventoryAdjustmentProposal['cause'];originNote:string;
 justification:string;evidenceReference:string;key:string
})=>api<string>('rpc/mc_propose_inventory_adjustment','POST',{
 p_workspace_id:workspaceId,p_occurrence_id:draft.occurrenceId,p_lot_id:draft.lotId,
 p_delta_g:draft.deltaGrams,p_cause:draft.cause,p_origin_note:draft.originNote,
 p_justification:draft.justification,p_evidence_reference:draft.evidenceReference,
 p_request_key:draft.key
});

export type PhysicalOccurrenceDossier={
 occurrence_id:string;production_id:string;status:'registered'|'under_review'|'pending_decision';
 observed_quantity_g:number;possible_lot_id:string|null;possible_lot_label:string|null;
 lot_verification:'unverified';snapshot_type:'read_only_current_state';
 physical_g:number|null;reserved_g:number|null;own_reserved_g:number|null;
 other_reserved_g:number|null;unreserved_g:number|null;
 reservations:{reservation_id:string;production_id:string;lot_id:string;remaining_g:number;quantity_g:number;status:string;belongs_to_occurrence_production:boolean}[];
 confirmed_consumption_lines:{consumption_id:string;confirmation_id:string;lot_id:string|null;lot_label:string|null;
 model_g:number;purge_g:number;loss_g:number;total_g:number;unit_cost_snapshot:number|null;
 confirmed_at:string;confirmation_status:string;author_id:string|null}[];
 investigation_history:{review_id:string;prior_status:string;next_status:string;cause_hypothesis:string;
 evidence_reference:string|null;created_at:string}[];
 pending_adjustment_proposals:{proposal_id:string;lot_id:string;proposed_delta_g:number;status:string;
 evidence_reference:string;created_at:string}[];
 possible_compensation_review:'manual_review_only';reversible_quantity_g:null;financial_adjustment:null;
 inventory_effect:'none';approval:'not_available';warning:string
};
export const getPhysicalOccurrenceDossier=(workspaceId:string,occurrenceId:string)=>
 api<PhysicalOccurrenceDossier>('rpc/mc_get_physical_occurrence_dossier','POST',{
 p_workspace_id:workspaceId,p_occurrence_id:occurrenceId
});

export type SavedCalculation={
 product_id:string;name:string;kind:'component'|'product';sku:string|null;
 snapshot_id:string;unit_cost:number|null;saved_input:Record<string,unknown>;saved_at:string;composition?:AssemblyRecord;available_composition?:AssemblyRecord;direct_snapshot_id?:string
};
export const listSavedCalculations=(workspaceId:string)=>
 api<SavedCalculation[]>('rpc/mc_list_saved_calculations','POST',{p_workspace_id:workspaceId});
export function compositionCalculation(assembly:AssemblyRecord,direct?:SavedCalculation):SavedCalculation|undefined{
 if(!assembly.snapshot_id||!assembly.saved_at||assembly.product_kind!=='product')return undefined;
 return {
  product_id:assembly.id,name:assembly.name,kind:'product',sku:assembly.sku,snapshot_id:assembly.snapshot_id,
  unit_cost:assembly.total_cost,saved_at:assembly.saved_at,composition:assembly,
  direct_snapshot_id:direct?.composition?direct.direct_snapshot_id:direct?.snapshot_id,
  saved_input:direct?.saved_input??{grams:0,pricePerKg:0,hours:0,quantity:1,accessoryPerUnit:0,
   assemblyMinutesPerUnit:0,laborPerHour:0,salePrice:0}
 };
}
export async function listLatestProductCalculations(workspaceId:string){
 const [direct,assemblies]=await Promise.all([listSavedCalculations(workspaceId),listAssemblies(workspaceId)]);
 const latest=new Map(direct.map(item=>[item.product_id,item]));
 for(const assembly of assemblies){
  const current=latest.get(assembly.id);
  const composed=compositionCalculation(assembly,current);
  if(composed)latest.set(assembly.id,composed);
 }
 return [...latest.values()].sort((a,b)=>Date.parse(b.saved_at)-Date.parse(a.saved_at));
}

export type EnergyTariff={id:string;name:string;price:string;valid_from:string;valid_until:string;reference:string};
export type EnergyEvidenceInterval={id:string;start_at:string;end_at:string;phase:import('../domain/l4-energy-draft').EnergyInterval['phase'];pause_condition:NonNullable<import('../domain/l4-energy-draft').EnergyInterval['pauseCondition']>|null;source_kind:import('../domain/l4-energy-draft').EnergyInterval['source']['kind'];reference:string|null;kwh:string|null;watts:string|null};
export type EnergyEvidence={workspace_id:string;execution_id:string;printer_id:string|null;current_average_watts:string|null;start_at:string|null;end_at:string|null;intervals:EnergyEvidenceInterval[];tariffs:EnergyTariff[];posting_allowed:false};
export const getEnergyEvidence=(workspaceId:string,executionId:string)=>api<EnergyEvidence>('rpc/mc_get_energy_evidence','POST',{p_workspace_id:workspaceId,p_production_id:executionId});
export const registerEnergyTariff=(workspaceId:string,draft:{name:string;price:string;from:string;until:string;reference:string})=>api<string>('rpc/mc_register_energy_tariff','POST',{p_workspace_id:workspaceId,p_name:draft.name,p_price:draft.price,p_from:draft.from,p_until:draft.until,p_reference:draft.reference});
export const recordEnergyInterval=(workspaceId:string,executionId:string,draft:{start:string;end:string;phase:EnergyEvidenceInterval['phase'];condition:EnergyEvidenceInterval['pause_condition'];kind:EnergyEvidenceInterval['source_kind'];reference:string|null;kwh:string|null;watts:string|null})=>api<string>('rpc/mc_record_energy_interval','POST',{p_workspace_id:workspaceId,p_production_id:executionId,p_start:draft.start,p_end:draft.end,p_phase:draft.phase,p_condition:draft.condition,p_kind:draft.kind,p_reference:draft.reference,p_kwh:draft.kwh,p_watts:draft.watts});

export type IntegralEnergyEvidence={id:string;start_at:string;end_at:string;kwh:string;reference:string;author_id:string;created_at:string};
export type IntegralEnergyRevision={id:string;prior_id:string;kwh:string;reference:string;reason:string;author_id:string;created_at:string};
export type IntegralEnergyResponse={workspace_id:string;execution_id:string;measurement:IntegralEnergyEvidence|null;original?:IntegralEnergyEvidence|null;revisions?:IntegralEnergyRevision[];posting_allowed:false};
export const getIntegralEnergy=(workspaceId:string,executionId:string)=>api<IntegralEnergyResponse>('rpc/mc_get_integral_energy','POST',{p_workspace_id:workspaceId,p_production_id:executionId});
export const recordIntegralEnergy=(workspaceId:string,executionId:string,draft:{start:string;end:string;kwh:string;reference:string})=>api<string>('rpc/mc_record_integral_energy','POST',{p_workspace_id:workspaceId,p_production_id:executionId,p_start:draft.start,p_end:draft.end,p_kwh:draft.kwh,p_reference:draft.reference});

export const reviseIntegralEnergy=(workspaceId:string,executionId:string,draft:{priorId:string;key:string;kwh:string;reference:string;reason:string})=>api<string>('rpc/mc_revise_integral_energy','POST',{p_workspace_id:workspaceId,p_production_id:executionId,p_prior_id:draft.priorId,p_request_key:draft.key,p_kwh:draft.kwh,p_reference:draft.reference,p_reason:draft.reason});

export type MachineOriginEvidence={schema_version:'l4-machine-origin-v1';workspace_id:string;execution_id:string;actual_hours:string|null;posting_allowed:false;printer_matches:boolean;origin:{printer_id:string;printer_name:string;purchase_price:string|null;lifetime_hours:string|null;maintenance_per_hour:string;captured_at:string;author_id:string|null}|null};
export const getL4MachineOrigin=(workspaceId:string,executionId:string)=>api<MachineOriginEvidence>('rpc/mc_get_l4_machine_origin','POST',{p_workspace_id:workspaceId,p_production_id:executionId});

export type WorkshopService={id:string;name:string;unit:'hour'|'minute'|'unit';rate:number};
export const listWorkshopServices=(workspaceId:string)=>api<WorkshopService[]>('mc_services?workspace_id=eq.'+encodeURIComponent(workspaceId)+'&select=id,name,unit,rate&order=name.asc');

export type LaborRevisionVersion={id:string;minutes:string;hourlyRate:string;basis:'measured'|'estimated';authorId:string;createdAt:string};
export type StoredLaborActivity=import('../domain/l4-labor-draft').LaborActivity&{rateSource:'manual'|'catalog_at_registration';authorId:string;createdAt:string;versionId?:string;original?:LaborRevisionVersion;revisions?:Array<LaborRevisionVersion&{priorId:string;reason:string}>};
export type LaborRevisionDraft={evidenceId:string;priorId:string;key:string;minutes:string;hourlyRate:string;basis:'measured'|'estimated';reason:string};
export const reviseL4Labor=(workspaceId:string,executionId:string,draft:LaborRevisionDraft)=>api<string>('rpc/mc_revise_l4_labor','POST',{
 p_workspace_id:workspaceId,p_production_id:executionId,p_evidence_id:draft.evidenceId,p_prior_id:draft.priorId,p_request_key:draft.key,p_minutes:draft.minutes,p_hourly_rate:draft.hourlyRate,p_basis:draft.basis,p_reason:draft.reason});
export type LaborEvidenceResponse={workspace_id:string;execution_id:string;posting_allowed:false;activities:StoredLaborActivity[]};
export const getL4Labor=(workspaceId:string,executionId:string)=>api<LaborEvidenceResponse>('rpc/mc_get_l4_labor','POST',{p_workspace_id:workspaceId,p_production_id:executionId});
export const recordL4Labor=(workspaceId:string,executionId:string,a:import('../domain/l4-labor-draft').LaborActivity)=>api<string>('rpc/mc_record_l4_labor','POST',{
 p_workspace_id:workspaceId,p_production_id:executionId,p_request_key:a.id,p_activity:a.activity,p_minutes:a.minutes,p_hourly_rate:a.hourlyRate,p_basis:a.basis,p_reference:a.reference,p_service_id:a.serviceId??null});

const productPhotosBucket='mc-product-photos';
export const productPhotoTypes=['image/jpeg','image/png','image/webp'] as const;
export const productPhotoLimit=6*1024*1024;
export type ProductPhoto={path:string;url:string;primary:boolean};

async function productPhotoStorage<T>(path:string,body:File|Record<string,unknown>):Promise<T>{
 const session=await freshSession();
 if(!session)throw new Error('Entre na sua conta para acessar as fotos.');
 const file=body instanceof File;
 return response<T>(await fetch(SUPABASE_URL+'/storage/v1/object/'+path,{
  method:'POST',headers:{...jsonHeaders,Authorization:'Bearer '+session.access_token,
   'Content-Type':file?body.type:'application/json'},body:file?body:JSON.stringify(body)
 }));
}
const productPhotoFolder=(workspaceId:string,productId:string)=>encodeURIComponent(workspaceId)+'/'+encodeURIComponent(productId);
export async function listProductPhotos(workspaceId:string,productId:string,primaryOnly=false):Promise<ProductPhoto[]>{
 const prefix=productPhotoFolder(workspaceId,productId);
 const preferences=await api<{primary_path:string}[]>('mc_product_photo_preferences?workspace_id=eq.'+encodeURIComponent(workspaceId)+'&product_id=eq.'+encodeURIComponent(productId)+'&select=primary_path');
 const paths:string[]=[];
 const pageSize=100;
 for(let offset=0;;offset+=pageSize){
  const rows=await productPhotoStorage<{name:string;id:string|null}[]>('list/'+productPhotosBucket,{
   prefix,limit:primaryOnly?1:pageSize,offset,sortBy:{column:'created_at',order:'asc'}
  });
  paths.push(...rows.filter(row=>row.id!==null).map(row=>prefix+'/'+row.name));
  if(primaryOnly||rows.length<pageSize)break;
 }
 const preferred=preferences[0]?.primary_path;
 const selected=preferred?.startsWith(prefix+'/')&&(primaryOnly||paths.includes(preferred))?preferred:paths[0];
 const sign=async(path:string):Promise<ProductPhoto>=>{
  const result=await productPhotoStorage<{signedURL:string}>('sign/'+productPhotosBucket+'/'+path,{expiresIn:3600});
  return {path,url:SUPABASE_URL+'/storage/v1'+result.signedURL,primary:path===selected};
 };
 if(primaryOnly){
  if(!selected)return [];
  try{return [await sign(selected)];}
  catch(error){if(paths[0]&&paths[0]!==selected)return [await sign(paths[0])];throw error;}
 }
 return Promise.all(paths.map(sign));
}
export function uploadProductPhoto(workspaceId:string,productId:string,file:File){
 const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':file.type==='image/webp'?'webp':null;
 if(!extension||file.size===0||file.size>productPhotoLimit)throw new Error('Escolha uma foto JPEG, PNG ou WebP de até 6 MB.');
 const path=productPhotoFolder(workspaceId,productId)+'/'+crypto.randomUUID()+'.'+extension;
 return productPhotoStorage<unknown>(productPhotosBucket+'/'+path,file);
}
export const setPrimaryProductPhoto=(workspaceId:string,productId:string,path:string)=>
 api<unknown>('mc_product_photo_preferences?on_conflict=product_id,workspace_id','POST',
  {workspace_id:workspaceId,product_id:productId,primary_path:path},'resolution=merge-duplicates,return=minimal');

export type CalculationHistoryRow = {
 id:string;confirmed_at:string;quantity:number;total_cost:number|null;
 parameters:{origin?:string;saved_input?:Record<string,unknown>};
};
export const listCalculationHistory=(workspaceId:string,productId:string,offset:number)=>
 api<CalculationHistoryRow[]>('mc_cost_snapshots?select=id,confirmed_at,quantity,total_cost,parameters&workspace_id=eq.'+
  encodeURIComponent(workspaceId)+'&product_id=eq.'+encodeURIComponent(productId)+
  '&parameters->>origin=in.(calculator,assembly-revision)&order=confirmed_at.desc,id.desc&limit=20&offset='+offset);

export type CustomerDraft={name:string;whatsapp:string|null;email:string|null};
export type WorkshopCustomer=CustomerDraft&{id:string};
export async function listWorkshopCustomers(workspaceId:string){
 const customers:WorkshopCustomer[]=[];
 const pageSize=200;
 const path='mc_customers?select=id,name,whatsapp,email&workspace_id=eq.'+
  encodeURIComponent(workspaceId)+'&order=name.asc,id.asc&limit='+pageSize;
 for(let offset=0;;offset+=pageSize){
  const rows=await api<WorkshopCustomer[]>(path+'&offset='+offset);
  customers.push(...rows);
  if(rows.length<pageSize)return customers;
 }
}
export async function saveWorkshopCustomer(workspaceId:string,id:string,draft:CustomerDraft,editing:boolean){
 const path='mc_customers?id=eq.'+encodeURIComponent(id)+'&workspace_id=eq.'+encodeURIComponent(workspaceId);
 const rows=editing
  ? await api<WorkshopCustomer[]>(path,'PATCH',draft,'return=representation')
  : await api<WorkshopCustomer[]>('mc_customers?on_conflict=id','POST',{...draft,id,workspace_id:workspaceId},
   'resolution=ignore-duplicates,return=representation');
 const saved=rows?.[0]??(!editing?(await api<WorkshopCustomer[]>(path))[0]:undefined);
 if(!saved)throw new Error('O cadastro não está disponível.');
 return saved;
}

export type CustomerOrderDraft = {
 id:string;snapshot_id:string|null;customer_id?:string;product_name:string;status:'planned'|'sold';quantity:number;
 pieces_per_plate:number;plate_cost:number;partial_plate_cost:number;sale_price:number;production_method?:'direct'|'assembly';
};
export type CustomerOrder=CustomerOrderDraft&{created_at:string;customer?:{name:string}|null};
export const listCustomerOrders=(workspaceId:string,offset:number,customerId?:string)=>
 api<CustomerOrder[]>('mc_customer_orders?select=id,snapshot_id,product_name,status,quantity,pieces_per_plate,plate_cost,partial_plate_cost,sale_price,created_at,production_method,customer:mc_customers(name)&workspace_id=eq.'+
  encodeURIComponent(workspaceId)+(customerId?'&customer_id=eq.'+encodeURIComponent(customerId):'')+'&order=created_at.desc,id.desc&limit=20&offset='+offset);
export const saveCustomerOrder=(workspaceId:string,draft:CustomerOrderDraft)=>
 api<void>('mc_customer_orders?on_conflict=id','POST',{...draft,workspace_id:workspaceId},'resolution=ignore-duplicates,return=minimal');

export type ComponentCostSnapshot={
 quantity:number;total_cost:number;
 parameters:{calculated_result?:Partial<import('../domain/cost').CostResult>;saved_input?:Partial<import('../domain/cost').CostInput>};
};
export const getComponentCostSnapshot=async(workspaceId:string,productId:string,snapshotId?:string)=>
 (await api<ComponentCostSnapshot[]>('mc_cost_snapshots?select=quantity,total_cost,parameters&workspace_id=eq.'+
  encodeURIComponent(workspaceId)+'&product_id=eq.'+encodeURIComponent(productId)+
  '&parameters->>assembly_id=is.null&total_cost=not.is.null&order=confirmed_at.desc,id.desc&limit=1'+
  (snapshotId?'&id=eq.'+encodeURIComponent(snapshotId):'')))[0];
