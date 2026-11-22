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

export type AssemblyPart = {id:string;name:string;quantity:number;notes:string|null;grams:string|null;unit_cost:number|null};
export type AssemblyRecord = {id:string;name:string;sku:string|null;description:string|null;sale_price:number|null;created_at:string;parts:AssemblyPart[];revision:number;total_cost:number|null;cost_status:'unknown'|'estimated'|'confirmed'};
export type AssemblyPartDraft = {id?:string;name:string;quantity:number;notes:string;grams:number|null;unit_cost?:number|null};
export const listAssemblies=(workspaceId:string)=>api<AssemblyRecord[]>('rpc/mc_list_assemblies','POST',{p_workspace_id:workspaceId});
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
