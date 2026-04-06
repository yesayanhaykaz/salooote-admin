"use client";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const BLOG_POSTS = [
  { id: 1, title: "Event Planning Tips for 2025",   author: "Haykaz Y.",  category: "Planning",    status: "published",  views: 2841, date: "Mar 28, 2025" },
  { id: 2, title: "Top Cakes Trends in 2025",       author: "Nare G.",    category: "Cakes",       status: "published",  views: 1923, date: "Mar 15, 2025" },
  { id: 3, title: "Wedding Trends This Season",     author: "Anna H.",    category: "Weddings",    status: "published",  views: 3105, date: "Mar 5, 2025"  },
  { id: 4, title: "How to Choose a Venue",          author: "Haykaz Y.",  category: "Venues",      status: "draft",      views: 0,    date: "—"            },
  { id: 5, title: "Party Decoration Ideas",         author: "Lilit S.",   category: "Decor",       status: "scheduled",  views: 0,    date: "Apr 10, 2025" },
  { id: 6, title: "The Ultimate Catering Guide",    author: "Sona K.",    category: "Catering",    status: "published",  views: 1456, date: "Feb 20, 2025" },
];

function StatusBadge({ status }) {
  const map = {
    published:  { cls: "badge badge-success", label: "Published"  },
    draft:      { cls: "badge badge-gray",    label: "Draft"       },
    scheduled:  { cls: "badge badge-info",    label: "Scheduled"   },
  };
  const item = map[status] || { cls: "badge badge-gray", label: status };
  return <span className={item.cls}>{item.label}</span>;
}

const CATEGORY_COLORS = {
  Planning:  "bg-violet-50 text-violet-700",
  Cakes:     "bg-pink-50 text-pink-700",
  Weddings:  "bg-rose-50 text-rose-700",
  Venues:    "bg-blue-50 text-blue-700",
  Decor:     "bg-orange-50 text-orange-700",
  Catering:  "bg-green-50 text-green-700",
};

export default function BlogPage() {
  const columns = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-surface-800">{val}</p>
          <p className="text-xs text-surface-400 mt-0.5">By {row.author}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (val) => (
        <span className={`badge ${CATEGORY_COLORS[val] || "bg-surface-100 text-surface-600"}`}>
          {val}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "views",
      label: "Views",
      sortable: true,
      render: (val) => (
        <span className="text-sm font-semibold text-surface-700">
          {val > 0 ? val.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Published Date",
      render: (val) => <span className="text-xs text-surface-400">{val}</span>,
    },
    {
      key: "id",
      label: "Actions",
      render: () => (
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white" title="Edit">
            <Pencil size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white" title="Delete">
            <Trash2 size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white" title="Preview">
            <Eye size={13} />
          </button>
        </div>
      ),
    },
  ];

  const totalPublished = BLOG_POSTS.filter(p => p.status === "published").length;
  const totalDrafts    = BLOG_POSTS.filter(p => p.status === "draft").length;
  const totalScheduled = BLOG_POSTS.filter(p => p.status === "scheduled").length;
  const totalViews     = BLOG_POSTS.reduce((acc, p) => acc + p.views, 0);

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Blog Posts"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} />
            New Post
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Published",  value: totalPublished, color: "text-success-600",   bg: "bg-success-50"   },
            { label: "Drafts",     value: totalDrafts,    color: "text-surface-500",   bg: "bg-surface-100"  },
            { label: "Scheduled",  value: totalScheduled, color: "text-info-600",      bg: "bg-info-50"      },
            { label: "Total Views",value: totalViews.toLocaleString(), color: "text-primary-600", bg: "bg-primary-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={BLOG_POSTS}
          searchKeys={["title", "author", "category"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
