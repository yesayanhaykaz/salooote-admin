"use client";
import { useState } from "react";
import {
  FileText, BookOpen, HelpCircle, MessageSquare, Edit2, Eye, Plus,
  Trash2, GripVertical, ChevronDown, ChevronUp, X, Star, ToggleLeft,
  ToggleRight, Globe, CheckCircle, AlertCircle,
} from "lucide-react";
import TopBar from "@/components/TopBar";

// ─── Sample data ────────────────────────────────────────────────────────────
const PAGES = [
  { name: "Homepage",          lastEdited: "Apr 5, 2025",  seo: "good" },
  { name: "About Us",          lastEdited: "Mar 20, 2025", seo: "good" },
  { name: "Contact",           lastEdited: "Feb 14, 2025", seo: "needs work" },
  { name: "Terms & Conditions",lastEdited: "Jan 8, 2025",  seo: "good" },
  { name: "Privacy Policy",    lastEdited: "Jan 8, 2025",  seo: "good" },
  { name: "Refund Policy",     lastEdited: "Feb 2, 2025",  seo: "needs work" },
  { name: "Vendor Onboarding", lastEdited: "Mar 30, 2025", seo: "good" },
  { name: "Pricing",           lastEdited: "Apr 1, 2025",  seo: "good" },
];

const BLOG_POSTS_DEFAULT = [
  { id: 1, title: "Top 10 Wedding Trends in 2025",           author: "Admin",      category: "Weddings",    date: "Apr 3, 2025",  status: "published", views: 1842 },
  { id: 2, title: "How to Choose the Perfect Wedding Cake",  author: "Content Team",category: "Tips",        date: "Mar 28, 2025", status: "published", views: 1234 },
  { id: 3, title: "5 Budget-Friendly Event Decoration Ideas",author: "Admin",       category: "Decor",       date: "Mar 15, 2025", status: "published", views: 987 },
  { id: 4, title: "Guide to Hiring a DJ for Your Event",     author: "Content Team",category: "Music",       date: "Mar 8, 2025",  status: "draft",     views: 0 },
  { id: 5, title: "Why Professional Photography Matters",    author: "Admin",       category: "Photography", date: "Feb 22, 2025", status: "published", views: 2104 },
];

const FAQS_DEFAULT = [
  { id: 1, q: "How do I list my business on Salooote?",         a: "Simply sign up as a vendor, complete your profile, upload your products or services, and submit for approval. Our team reviews within 1–2 business days." },
  { id: 2, q: "What payment methods are accepted?",             a: "We accept all major credit and debit cards including Visa and MasterCard. Payments are processed securely through our payment gateway." },
  { id: 3, q: "Can I cancel my vendor subscription?",           a: "Yes, you can cancel your subscription at any time from your vendor dashboard. Access remains until the end of your billing period." },
  { id: 4, q: "How does the review system work?",               a: "After a completed booking, customers can leave a star rating and written review. Reviews are visible on vendor profiles and help build trust." },
  { id: 5, q: "Is my personal information secure?",             a: "Absolutely. We follow strict data protection standards. Your information is never shared with third parties without your consent." },
  { id: 6, q: "What happens if there is a dispute with a vendor?", a: "Contact our support team and we will mediate. If needed, we can issue a refund according to our refund policy." },
];

const TESTIMONIALS_DEFAULT = [
  { id: 1, name: "Anna Hovhannisyan", text: "Salooote made planning my wedding so easy! Found everything in one place.",        rating: 5, visible: true },
  { id: 2, name: "Tigran Avetisyan",  text: "The DJ we booked through Salooote was absolutely incredible. Highly recommend!",    rating: 5, visible: true },
  { id: 3, name: "Lilit Sargsyan",    text: "Gorgeous flowers and very professional delivery. Will use again for sure.",          rating: 4, visible: true },
  { id: 4, name: "Sona Karapetyan",   text: "The makeup artist was amazing — I felt like a princess on my wedding day.",          rating: 5, visible: false },
];

const TABS = ["Pages", "Blog", "FAQ", "Testimonials"];
const CATEGORIES = ["Weddings", "Tips", "Decor", "Music", "Photography", "General"];

// ─── New Post Modal ──────────────────────────────────────────────────────────
function NewPostModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", slug: "", category: "Weddings", content: "",
    seoTitle: "", seoDesc: "", tags: "",
  });

  const handleSave = (status) => {
    if (!form.title) return;
    onSave({ ...form, status, date: "Apr 7, 2025", author: "Admin", views: 0, id: Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-bold text-surface-900">New Blog Post</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent">
            <X size={16} className="text-surface-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Post Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Enter post title…"
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="post-slug-here"
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Content</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your post content here…" rows={6}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 resize-none" />
          </div>
          <div className="pt-1 border-t border-surface-100">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-3">SEO Settings</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">SEO Title</label>
                <input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                  placeholder="SEO-optimized title"
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">SEO Description</label>
                <textarea value={form.seoDesc} onChange={e => setForm(f => ({ ...f, seoDesc: e.target.value }))}
                  placeholder="Meta description for search engines…" rows={2}
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="wedding, flowers, tips"
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={() => handleSave("draft")} className="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white text-surface-700">Save as Draft</button>
            <button onClick={() => handleSave("published")} className="px-5 py-2 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 cursor-pointer">Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pages Tab ───────────────────────────────────────────────────────────────
function PagesTab() {
  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-bold text-surface-900">Site Pages</h3>
      </div>
      <div className="divide-y divide-surface-50">
        {PAGES.map((page, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-surface-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <FileText size={14} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{page.name}</p>
                <p className="text-xs text-surface-400">Last edited: {page.lastEdited}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {page.seo === "good"
                  ? <><CheckCircle size={13} className="text-success-500" /><span className="text-xs font-medium text-success-600">SEO Good</span></>
                  : <><AlertCircle size={13} className="text-warning-500" /><span className="text-xs font-medium text-warning-600">Needs Work</span></>}
              </div>
              <div className="flex items-center gap-1.5">
                <button className="flex items-center gap-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg cursor-pointer border-none transition-colors">
                  <Edit2 size={11} /> Edit
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 px-2.5 py-1.5 rounded-lg cursor-pointer border-none transition-colors">
                  <Globe size={11} /> Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────────────────────────
function BlogTab() {
  const [posts, setPosts] = useState(BLOG_POSTS_DEFAULT);
  const [showModal, setShowModal] = useState(false);

  const deletePost = (id) => setPosts(prev => prev.filter(p => p.id !== id));
  const addPost = (post) => setPosts(prev => [post, ...prev]);
  const togglePublish = (id) => setPosts(prev => prev.map(p =>
    p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p
  ));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
          <Plus size={14} /> New Post
        </button>
      </div>
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {["Title", "Author", "Category", "Date", "Status", "Views", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3.5 max-w-[240px]">
                    <p className="text-sm font-medium text-surface-800 truncate">{p.title}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-600 whitespace-nowrap">{p.author}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge badge-info">{p.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-surface-500 whitespace-nowrap">{p.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={p.status === "published" ? "badge badge-success" : "badge badge-gray"}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-600">{p.views.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Edit</button>
                      <button onClick={() => togglePublish(p.id)} className="text-xs font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors whitespace-nowrap">
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deletePost(p.id)} className="flex items-center justify-center w-7 h-7 rounded-lg text-danger-500 hover:bg-danger-50 cursor-pointer border-none bg-transparent transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <NewPostModal onClose={() => setShowModal(false)} onSave={addPost} />}
    </div>
  );
}

// ─── FAQ Tab ──────────────────────────────────────────────────────────────────
function FAQTab() {
  const [faqs, setFaqs] = useState(FAQS_DEFAULT);
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ q: "", a: "" });

  const startEdit = (faq) => { setEditing(faq.id); setEditForm({ q: faq.q, a: faq.a }); setOpen(faq.id); };
  const saveEdit = () => {
    setFaqs(prev => prev.map(f => f.id === editing ? { ...f, ...editForm } : f));
    setEditing(null);
  };
  const remove = (id) => setFaqs(prev => prev.filter(f => f.id !== id));
  const addFaq = () => setFaqs(prev => [...prev, { id: Date.now(), q: "New Question?", a: "Answer here." }]);

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-surface-50/50 transition-colors"
            onClick={() => setOpen(open === faq.id ? null : faq.id)}
          >
            <GripVertical size={14} className="text-surface-300 flex-shrink-0" />
            <p className="flex-1 text-sm font-semibold text-surface-800">{faq.q}</p>
            <div className="flex items-center gap-1.5 ml-auto mr-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => startEdit(faq)} className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">
                <Edit2 size={11} /> Edit
              </button>
              <button onClick={() => remove(faq.id)} className="flex items-center justify-center w-7 h-7 rounded-lg text-danger-500 hover:bg-danger-50 cursor-pointer border-none bg-transparent transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
            {open === faq.id ? <ChevronUp size={16} className="text-surface-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-surface-400 flex-shrink-0" />}
          </div>
          {open === faq.id && (
            <div className="px-5 pb-4 border-t border-surface-50">
              {editing === faq.id ? (
                <div className="pt-4 space-y-3">
                  <input value={editForm.q} onChange={e => setEditForm(f => ({ ...f, q: e.target.value }))}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                  <textarea value={editForm.a} onChange={e => setEditForm(f => ({ ...f, a: e.target.value }))} rows={3}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white text-surface-700">Cancel</button>
                    <button onClick={saveEdit} className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">Save</button>
                  </div>
                </div>
              ) : (
                <p className="pt-3 text-sm text-surface-600 leading-relaxed">{faq.a}</p>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={addFaq} className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-semibold rounded-xl hover:bg-surface-50 transition-colors cursor-pointer w-full justify-center">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────
function TestimonialsTab() {
  const [items, setItems] = useState(TESTIMONIALS_DEFAULT);

  const toggle = (id) => setItems(prev => prev.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
  const remove = (id) => setItems(prev => prev.filter(t => t.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className={`bg-white rounded-xl border p-5 transition-all ${t.visible ? "border-surface-200" : "border-surface-100 opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{t.name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} className={s <= t.rating ? "text-amber-400 fill-amber-400" : "text-surface-200 fill-surface-200"} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggle(t.id)} className="border-none bg-transparent cursor-pointer p-0">
                  {t.visible
                    ? <ToggleRight size={22} className="text-primary-600" />
                    : <ToggleLeft  size={22} className="text-surface-300" />}
                </button>
                <button onClick={() => remove(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-danger-400 hover:bg-danger-50 cursor-pointer border-none bg-transparent transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="text-sm text-surface-600 leading-relaxed italic">"{t.text}"</p>
            <div className="mt-3 flex items-center justify-between">
              <span className={t.visible ? "badge badge-success" : "badge badge-gray"}>{t.visible ? "Visible" : "Hidden"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("Pages");

  const TAB_ICONS = { Pages: FileText, Blog: BookOpen, FAQ: HelpCircle, Testimonials: MessageSquare };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="CMS" subtitle="Manage site content, blog, FAQs and testimonials" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border-none ${
                  activeTab === tab
                    ? "bg-white text-surface-900 shadow-sm"
                    : "text-surface-500 hover:text-surface-700 bg-transparent"
                }`}>
                <Icon size={13} />{tab}
              </button>
            );
          })}
        </div>

        {activeTab === "Pages"        && <PagesTab />}
        {activeTab === "Blog"         && <BlogTab />}
        {activeTab === "FAQ"          && <FAQTab />}
        {activeTab === "Testimonials" && <TestimonialsTab />}
      </div>
    </div>
  );
}
