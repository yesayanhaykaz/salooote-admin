"use client";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, Info, Star, Clock, Users } from "lucide-react";
import TopBar from "@/components/TopBar";

const CATEGORIES = ["Photography","Catering","DJ & Music","Venue Decoration","Cakes & Desserts","Flowers & Gifts","Event Planning","Entertainment"];
const PRICE_TYPES = ["Fixed Price","Starting From","Per Hour","Per Person","Per Day"];
const STEPS = ["Basic Info","Media & Portfolio","Pricing","Details","Publish"];
const GRADIENTS = ["from-pink-400 to-rose-500","from-violet-400 to-purple-500","from-blue-400 to-indigo-500","from-emerald-400 to-green-500","from-orange-400 to-amber-500","from-teal-400 to-cyan-500"];

const SERVICES = [
  { id:1, name:"Wedding Photography Package",category:"Photography",price:"From $800",duration:"8 hrs",bookings:23,rating:4.9,status:"active",gradient:"from-pink-400 to-rose-500" },
  { id:2, name:"Event Video Coverage",        category:"Photography",price:"From $400",duration:"5 hrs",bookings:15,rating:4.8,status:"active",gradient:"from-violet-400 to-purple-500" },
  { id:3, name:"Birthday Cake — Custom",      category:"Cakes",      price:"From $120",duration:"3 days",bookings:48,rating:4.9,status:"active",gradient:"from-amber-400 to-orange-500" },
  { id:4, name:"Floral Decoration Setup",     category:"Flowers",    price:"From $300",duration:"1 day", bookings:31,rating:4.7,status:"active",gradient:"from-emerald-400 to-green-500" },
  { id:5, name:"DJ Set — 4 Hours",            category:"DJ & Music", price:"From $350",duration:"4 hrs",bookings:19,rating:4.8,status:"active",gradient:"from-blue-400 to-indigo-500" },
  { id:6, name:"Corporate Catering (50 pax)", category:"Catering",   price:"From $850",duration:"Half day",bookings:8,rating:4.6,status:"draft", gradient:"from-teal-400 to-cyan-500" },
];

function Toggle({checked:init=false}) {
  const [on,setOn]=useState(init);
  return (
    <button onClick={()=>setOn(v=>!v)} style={{width:40,height:22}}
      className={`relative rounded-full cursor-pointer border-none flex-shrink-0 transition-colors ${on?"bg-primary-600":"bg-surface-200"}`}>
      <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all ${on?"left-[22px]":"left-[3px]"}`}/>
    </button>
  );
}

function ImageUploadZone({label,hint,multiple=false}) {
  const [previews,setPreviews]=useState([]);
  const ref=useRef();
  const handle=files=>{const urls=Array.from(files).map(f=>URL.createObjectURL(f));setPreviews(p=>multiple?[...p,...urls]:urls);};
  return (
    <div>
      {label&&<p className="text-xs font-semibold text-surface-700 mb-1.5">{label}</p>}
      {previews.length>0&&multiple&&<div className="grid grid-cols-4 gap-2 mb-2">{previews.map((src,i)=>(
        <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-surface-100">
          <img src={src} alt="" className="w-full h-full object-cover"/>
          <button onClick={()=>setPreviews(p=>p.filter((_,j)=>j!==i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center cursor-pointer border-none"><X size={10} className="text-white"/></button>
        </div>
      ))}</div>}
      {(previews.length===0||multiple)&&<div onClick={()=>ref.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handle(e.dataTransfer.files);}}
        className="border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all bg-surface-50">
        <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Upload size={18} className="text-surface-400"/></div>
        <p className="text-sm font-medium text-surface-700">Click to upload or drag & drop</p>
        <p className="text-xs text-surface-400">{hint||"PNG, JPG — max 5MB"}</p>
        <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e=>handle(e.target.files)}/>
      </div>}
      {previews.length>0&&!multiple&&<div className="aspect-video relative rounded-xl overflow-hidden bg-surface-100">
        <img src={previews[0]} alt="" className="w-full h-full object-cover"/>
        <button onClick={()=>setPreviews([])} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center cursor-pointer border-none"><X size={13} className="text-white"/></button>
      </div>}
    </div>
  );
}

function TagInput({label}) {
  const [tags,setTags]=useState([]);const [val,setVal]=useState("");
  const add=e=>{if((e.key==="Enter"||e.key===",")&&val.trim()){e.preventDefault();setTags(t=>[...t,val.trim()]);setVal("");}};
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-surface-200 rounded-xl bg-white min-h-[42px] focus-within:border-primary-500 transition-colors">
        {tags.map((t,i)=>(
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg">{t}<button onClick={()=>setTags(ts=>ts.filter((_,j)=>j!==i))} className="border-none bg-transparent cursor-pointer text-primary-400"><X size={10}/></button></span>
        ))}
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={add} placeholder={tags.length===0?"Add tags (Enter to confirm)…":""} className="flex-1 min-w-[140px] border-none outline-none text-sm text-surface-700 placeholder:text-surface-400 bg-transparent"/>
      </div>
    </div>
  );
}

function AddServiceModal({onClose}) {
  const [step,setStep]=useState(0);
  const [priceType,setPriceType]=useState("Starting From");
  const [status,setStatus]=useState("active");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl w-full max-w-[680px] max-h-[90vh] flex flex-col shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">Add New Service</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent"><X size={16}/></button>
        </div>
        <div className="flex items-center gap-1 px-6 py-3 border-b border-surface-100 overflow-x-auto">
          {STEPS.map((s,i)=>(
            <button key={i} onClick={()=>setStep(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer border-none transition-all mr-0.5 ${step===i?"bg-primary-50 text-primary-600":i<step?"text-success-600 bg-success-50":"text-surface-400 bg-transparent"}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${step===i?"bg-primary-600 text-white":i<step?"bg-success-500 text-white":"bg-surface-200 text-surface-500"}`}>{i<step?"✓":i+1}</span>{s}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {step===0&&<>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Service Name <span className="text-danger-500">*</span></label><input placeholder="e.g. Wedding Photography Package" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Description <span className="text-danger-500">*</span></label><textarea placeholder="Describe what's included, your approach, what clients can expect…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[100px]"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Category <span className="text-danger-500">*</span></label><select className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white outline-none cursor-pointer"><option value="">Select…</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Duration</label><input placeholder="e.g. 4 hours, 1 day, 3 days" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
            </div>
            <TagInput label="Tags"/>
          </>}

          {step===1&&<>
            <div className="flex items-start gap-2 bg-primary-50 border border-primary-100 rounded-xl p-3">
              <Info size={14} className="text-primary-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-primary-700">Show your best work. Portfolio images help clients decide. Add real photos from past events for maximum impact.</p>
            </div>
            <ImageUploadZone label="Cover Image *" hint="Main image shown in listings — recommended 800×600px"/>
            <ImageUploadZone label="Portfolio / Gallery" hint="Past work examples — up to 10 images" multiple/>
          </>}

          {step===2&&<>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-2">Pricing Type <span className="text-danger-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {PRICE_TYPES.map(pt=>(
                  <button key={pt} onClick={()=>setPriceType(pt)} className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all ${priceType===pt?"border-primary-500 bg-primary-50 text-primary-600":"border-surface-200 bg-white text-surface-500 hover:border-surface-300"}`}>{pt}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Base Price <span className="text-danger-500">*</span></label><div className="relative"><span className="absolute left-3 text-sm text-surface-400">$</span><input type="number" placeholder="0.00" className="w-full pl-7 pr-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Max Price</label><div className="relative"><span className="absolute left-3 text-sm text-surface-400">$</span><input type="number" placeholder="0.00" className="w-full pl-7 pr-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div></div>
            </div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">What's Included</label><textarea placeholder="List everything included in the price: equipment, team, editing, etc…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[80px]"/></div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Add-ons / Extras</label><textarea placeholder="Optional extras clients can add: extra hours, rush delivery, etc…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[72px]"/></div>
          </>}

          {step===3&&<>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Min Group Size</label><input type="number" placeholder="1" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Max Group Size</label><input type="number" placeholder="e.g. 200" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
            </div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Advance Booking Required</label><input placeholder="e.g. At least 7 days in advance" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">Cancellation Policy</label><textarea placeholder="Describe your cancellation and refund policy…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[80px]"/></div>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div><p className="text-sm font-semibold text-surface-800">Accept Custom Requests</p><p className="text-xs text-surface-400">Allow clients to request custom packages</p></div>
              <Toggle checked/>
            </div>
          </>}

          {step===4&&<>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-2">Status</label>
              <div className="flex gap-3">
                {["active","draft"].map(s=>(
                  <button key={s} onClick={()=>setStatus(s)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${status===s?"border-primary-500 bg-primary-50 text-primary-600":"border-surface-200 bg-white text-surface-500 hover:border-surface-300"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
              <div><p className="text-sm font-semibold text-surface-800">Featured Service</p><p className="text-xs text-surface-400">Highlight in your store's featured section</p></div>
              <Toggle/>
            </div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">SEO Title</label><input placeholder="Service name — Your Store" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none"/></div>
            <div><label className="block text-xs font-semibold text-surface-700 mb-1.5">SEO Description</label><textarea placeholder="Brief description for search engines…" className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none resize-none min-h-[72px]"/></div>
          </>}
        </div>
        <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between bg-surface-50">
          <button onClick={()=>step>0?setStep(s=>s-1):onClose()} className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 cursor-pointer bg-white transition-colors">{step===0?"Cancel":"← Back"}</button>
          <div className="flex gap-2">
            {step===STEPS.length-1?<>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-100 cursor-pointer bg-white">Save Draft</button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 cursor-pointer border-none">Publish Service</button>
            </>:<button onClick={()=>setStep(s=>s+1)} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 cursor-pointer border-none">Continue →</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorServices() {
  const [showAdd,setShowAdd]=useState(false);
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Services" subtitle={`${SERVICES.length} services`} actions={
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 cursor-pointer border-none">
          <Plus size={15}/> Add Service
        </button>
      }/>
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map(svc=>(
            <div key={svc.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-all group">
              <div className={`h-40 bg-gradient-to-br ${svc.gradient} relative`}>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"/>
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Pencil size={12} className="text-surface-600"/></button>
                  <button className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Trash2 size={12} className="text-danger-500"/></button>
                </div>
                <span className={`absolute top-3 left-3 badge ${svc.status==="active"?"badge-success":"badge-gray"} text-[10px]`}>{svc.status}</span>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-surface-400 mb-0.5">{svc.category}</p>
                <p className="text-sm font-semibold text-surface-800 mb-3 leading-snug">{svc.name}</p>
                <div className="flex items-center gap-3 text-xs text-surface-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={11}/>{svc.duration}</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{svc.bookings} bookings</span>
                  <span className="flex items-center gap-1"><Star size={11} className="fill-warm-400 text-warm-400"/>{svc.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-surface-900">{svc.price}</span>
                  <button className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 cursor-pointer border-none">Edit</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={()=>setShowAdd(true)} className="border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent min-h-[240px]">
            <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Plus size={20} className="text-surface-400"/></div>
            <p className="text-sm font-medium text-surface-400">Add Service</p>
          </button>
        </div>
      </div>
      {showAdd&&<AddServiceModal onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}
