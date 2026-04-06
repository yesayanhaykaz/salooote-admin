"use client";
import { useState, useRef } from "react";
import {
  Plus, LayoutGrid, List, Pencil, Trash2, X, Upload,
  Info, ChevronDown
} from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_PRODUCTS } from "@/lib/data";

const CATEGORIES = ["Cakes & Desserts", "Flowers & Gifts", "Party & Decor", "Catering", "DJ & Music", "Photography"];
const STATUSES   = ["active", "draft", "out_stock"];
const GRADIENTS  = [
  "from-pink-400 to-rose-500","from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500","from-emerald-400 to-green-500",
  "from-orange-400 to-amber-500","from-teal-400 to-cyan-500",
];
const STATUS_BADGE = { active:"badge badge-success", out_stock:"badge badge-danger", draft:"badge badge-gray" };
const STEPS = ["Basic Info","Media","Pricing & Stock","Shipping","Publish"];

function Toggle({ checked: init = false, onChange }) {
  const [on, setOn] = useState(init);
  return (
    <button
      onClick={() => { setOn(v=>!v); onChange&&onChange(!on); }}
      style={{width:40,height:22}}
      className={`relative rounded-full cursor-pointer border-none flex-shrink-0 transition-colors ${on?"bg-primary-600":"bg-surface-200"}`}
    >
      <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all ${on?"left-[22px]":"left-[3px]"}`}/>
    </button>
  );
}

function ImageUploadZone({ label, hint, multiple=false }) {
  const [previews, setPreviews] = useState([]);
  const ref = useRef();
  const handle = files => {
    const urls = Array.from(files).map(f=>URL.createObjectURL(f));
    setPreviews(p => multiple ? [...p,...urls] : urls);
  };
  return (
    <div>
      {label && <p className="text-xs font-semibold text-surface-700 mb-1.5">{label}</p>}
      {previews.length === 0 || (multiple && previews.length > 0) ? (
        <>
          {multiple && previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {previews.map((src,i)=>(
                <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-surface-100">
                  <img src={src} alt="" className="w-full h-full object-cover"/>
                  <button onClick={()=>setPreviews(p=>p.filter((_,j)=>j!==i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer border-none">
                    <X size={10} className="text-white"/>
                  </button>
                </div>
              ))}
            </div>
          )}
          {!multiple && previews.length === 0 && (
            <div onClick={()=>ref.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handle(e.dataTransfer.files);}}
              className="aspect-video border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all bg-surface-50">
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Upload size={18} className="text-surface-400"/></div>
              <p className="text-sm font-medium text-surface-700">Click to upload or drag & drop</p>
              <p className="text-xs text-surface-400">{hint||"PNG, JPG — max 5MB"}</p>
              <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e=>handle(e.target.files)}/>
            </div>
          )}
          {multiple && (
            <div onClick={()=>ref.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handle(e.dataTransfer.files);}}
              className="border-2 border-dashed border-surface-300 rounded-xl flex items-center justify-center gap-2 py-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all bg-surface-50">
              <Upload size={15} className="text-surface-400"/><p className="text-sm font-medium text-surface-500">Add more images</p>
              <p className="text-xs text-surface-400">{hint}</p>
              <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={e=>handle(e.target.files)}/>
            </div>
          )}
        </>
      ) : (
        <div className="aspect-video relative rounded-xl overflow-hidden bg-surface-100">
          <img src={previews[0]} alt="" className="w-full h-full object-cover"/>
          <button onClick={()=>setPreviews([])} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center cursor-pointer border-none hover:bg-black/80">
            <X size={13} className="text-white"/>
          </button>
        </div>
      )}
    </div>
  );
}

function TagInput({ label }) {
  const [tags,setTags]=useState([]);
  const [val,setVal]=useState("");
  const add=e=>{
    if((e.key==="Enter"||e.key===",")&&val.trim()){e.preventDefault();setTags(t=>[...t,val.trim()]);setVal("");}
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-surface-200 rounded-xl bg-white min-h-[42px] focus-within:border-primary-500 transition-colors">
        {tags.map((t,i)=>(
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg">
            {t}<button onClick={()=>setTags(ts=>ts.filter((_,j)=>j!==i))} className="border-none bg-transparent cursor-pointer text-primary-400"><X size={10}/></button>
          </span>
        ))}
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={add}
          placeholder={tags.length===0?"Type and press Enter to add tags…":""} className="flex-1 min-w-[140px] border-none outline-none text-sm text-surface-700 placeholder:text-surface-400 bg-transparent"/>
      </div>
    </div>
  );
}

function Inp({ placeholder, type="text", prefix, suffix, defaultValue }) {
  return (
    <div className="relative flex items-center">
      {prefix&&<span className="absolute left-3 text-sm text-surface-400">{prefix}</span>}
      <input type={type} defaultValue={defaultValue} placeholder={placeholder}
        className={`w-full py-2.5 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 outline-none transition-colors ${prefix?"pl-7 pr-3.5":"px-3.5"} ${suffix?"pr-10":""}`}/>
      {suffix&&<span className="absolute right-3 text-sm text-surface-400">{suffix}</span>}
    </div>
  );
}

function AddProductModal({ onClose }) {
  const [step,setStep]=useState(0);
  const [status,setStatus]=useState("active");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">Add New Product</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent"><X size={16}/></button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-surface-100 overflow-x-auto">
          {STEPS.map((s,i)=>(
            <button key={i} onClick={()=>setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer border-none transition-all mr-0.5 ${step===i?"bg-primary-50 text-primary-600":i<step?"text-success-600 bg-success-50":"text-surface-400 bg-transparent hover:text-surface-700"}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step===i?"bg-primary-600 text-white":i<step?"bg-success-500 text-white":"bg-surface-200 text-surface-500"}`}>{i<step?"✓":i+1}</span>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {step===0 && <>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Product Name <span className="text-danger-500">*</span></label>
              <Inp placeholder="e.g. Premium Wedding Cake"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Description <span className="text-danger-500">*</span></label>
              <textarea placeholder="Describe your product in detail — ingredients, sizes, customization options, allergens…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[100px]"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Category <span className="text-danger-500">*</span></label>
                <select className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white outline-none cursor-pointer">
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Subcategory</label>
                <Inp placeholder="e.g. Wedding Cakes"/>
              </div>
            </div>
            <TagInput label="Tags"/>
          </>}

          {step===1 && <>
            <div className="flex items-start gap-2 bg-primary-50 border border-primary-100 rounded-xl p-3">
              <Info size={14} className="text-primary-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-primary-700">High-quality images increase sales by up to 40%. Use a white or neutral background for best results.</p>
            </div>
            <ImageUploadZone label="Main Product Image *" hint="PNG, JPG — recommended 800×800px, max 5MB"/>
            <ImageUploadZone label="Gallery Images (up to 8)" hint="Additional product photos" multiple/>
          </>}

          {step===2 && <>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Regular Price <span className="text-danger-500">*</span></label><Inp placeholder="0.00" prefix="$" type="number"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Sale Price</label><Inp placeholder="0.00" prefix="$" type="number"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Cost Price</label><Inp placeholder="0.00" prefix="$" type="number"/></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">SKU</label><Inp placeholder="e.g. CAKE-001"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Barcode</label><Inp placeholder="UPC / EAN"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Stock Qty <span className="text-danger-500">*</span></label><Inp placeholder="0" type="number"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Low Stock Alert</label><Inp placeholder="5" type="number"/></div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Unit</label>
                <select className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white outline-none cursor-pointer">
                  {["piece","kg","gram","liter","box","set","pack"].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div><p className="text-sm font-semibold text-surface-800">Allow Backorders</p><p className="text-xs text-surface-400">Accept orders even when out of stock</p></div>
              <Toggle/>
            </div>
          </>}

          {step===3 && <>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div><p className="text-sm font-semibold text-surface-800">Free Shipping</p><p className="text-xs text-surface-400">Offer free delivery for this product</p></div>
              <Toggle/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Shipping Fee</label><Inp placeholder="0.00" prefix="$" type="number"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Estimated Delivery</label><Inp placeholder="e.g. 1–3 business days"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Weight (kg)</label><Inp placeholder="0.0" type="number"/></div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Dimensions (cm)</label>
                <div className="flex gap-2"><Inp placeholder="L"/><Inp placeholder="W"/><Inp placeholder="H"/></div>
              </div>
            </div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Packaging Notes</label><textarea placeholder="Special handling or packaging instructions…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[80px]"/></div>
          </>}

          {step===4 && <>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-2">Status</label>
              <div className="flex gap-3">
                {STATUSES.map(s=>(
                  <button key={s} onClick={()=>setStatus(s)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${status===s?"border-primary-500 bg-primary-50 text-primary-600":"border-surface-200 bg-white text-surface-500 hover:border-surface-300"}`}>
                    {s.replace("_"," ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div><p className="text-sm font-semibold text-surface-800">Featured Product</p><p className="text-xs text-surface-400">Show in featured section on your store</p></div>
              <Toggle/>
            </div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">SEO Title</label><Inp placeholder="Product name — Your Store"/></div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">SEO Description</label><textarea placeholder="Brief product description for search engines (max 160 chars)…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[72px]"/></div>
          </>}
        </div>

        <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between bg-surface-50">
          <button onClick={()=>step>0?setStep(s=>s-1):onClose()} className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 cursor-pointer bg-white transition-colors">
            {step===0?"Cancel":"← Back"}
          </button>
          <div className="flex gap-2">
            {step===STEPS.length-1 ? <>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 cursor-pointer bg-white transition-colors">Save Draft</button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 cursor-pointer border-none transition-colors">Publish Product</button>
            </> : (
              <button onClick={()=>setStep(s=>s+1)} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 cursor-pointer border-none transition-colors">Continue →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const listColumns = [
  { key:"name",label:"Product",sortable:true, render:(val,row)=>(
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADIENTS[row.id%GRADIENTS.length]} flex-shrink-0`}/>
      <span className="font-medium text-surface-800">{val}</span>
    </div>
  )},
  {key:"category",label:"Category",sortable:true},
  {key:"price",label:"Price",sortable:true},
  {key:"stock",label:"Stock",render:val=><span className={val===0?"text-danger-600 font-semibold":"text-surface-700"}>{val===0?"Out of stock":val}</span>},
  {key:"sales",label:"Sales"},
  {key:"status",label:"Status",render:val=><span className={STATUS_BADGE[val]||"badge badge-gray"}>{val.replace("_"," ")}</span>},
  {key:"id",label:"Actions",render:()=>(
    <div className="flex gap-1.5">
      <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 cursor-pointer border-none"><Pencil size={12}/> Edit</button>
      <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-red-100 cursor-pointer border-none"><Trash2 size={12}/> Delete</button>
    </div>
  )},
];

export default function VendorProducts() {
  const [view,setView]=useState("grid");
  const [showAdd,setShowAdd]=useState(false);
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Products" subtitle={`${SAMPLE_PRODUCTS.length} products`} actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-surface-200 rounded-lg overflow-hidden">
            <button onClick={()=>setView("grid")} className={`w-8 h-8 flex items-center justify-center cursor-pointer border-none transition-colors ${view==="grid"?"bg-primary-600 text-white":"text-surface-500 hover:bg-surface-50"}`}><LayoutGrid size={15}/></button>
            <button onClick={()=>setView("list")} className={`w-8 h-8 flex items-center justify-center cursor-pointer border-none transition-colors ${view==="list"?"bg-primary-600 text-white":"text-surface-500 hover:bg-surface-50"}`}><List size={15}/></button>
          </div>
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 cursor-pointer border-none transition-colors">
            <Plus size={15}/> Add Product
          </button>
        </div>
      }/>
      <div className="flex-1 p-6">
        {view==="grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SAMPLE_PRODUCTS.map((p,i)=>(
              <div key={p.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-all group">
                <div className={`h-36 bg-gradient-to-br ${GRADIENTS[i%GRADIENTS.length]} relative`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"/>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Pencil size={12} className="text-surface-600"/></button>
                    <button className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Trash2 size={12} className="text-danger-500"/></button>
                  </div>
                  <span className={`absolute top-2 left-2 badge ${STATUS_BADGE[p.status]} text-[10px]`}>{p.status.replace("_"," ")}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-surface-400 mb-0.5">{p.category}</p>
                  <p className="text-sm font-semibold text-surface-800 line-clamp-2 leading-snug mb-2">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-surface-900">{p.price}</span>
                    <span className="text-xs text-surface-400">{p.sales} sold</span>
                  </div>
                  <p className={`text-xs font-medium mt-1.5 ${p.stock===0?"text-danger-500":"text-surface-500"}`}>{p.stock===0?"Out of stock":`${p.stock} in stock`}</p>
                </div>
              </div>
            ))}
            <button onClick={()=>setShowAdd(true)} className="border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent h-[220px]">
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Plus size={20} className="text-surface-400"/></div>
              <p className="text-sm font-medium text-surface-400">Add Product</p>
            </button>
          </div>
        ) : (
          <DataTable columns={listColumns} data={SAMPLE_PRODUCTS} searchKeys={["name","vendor","category"]}/>
        )}
      </div>
      {showAdd && <AddProductModal onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}
