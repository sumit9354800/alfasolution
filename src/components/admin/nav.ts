import type { Permission } from "@/lib/rbac";

export type NavItem = { label: string; href: string; permission: Permission; icon: string };
export type NavGroup = { title: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", permission: "dashboard.view", icon: "LayoutDashboard" }],
  },
  {
    title: "Sales",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", permission: "enquiries.manage", icon: "Inbox" },
      { label: "Clients", href: "/admin/clients", permission: "clients.manage", icon: "Users" },
      { label: "Projects", href: "/admin/projects", permission: "clients.manage", icon: "FolderKanban" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", href: "/admin/payments", permission: "finance.manage", icon: "CreditCard" },
      { label: "Invoices", href: "/admin/invoices", permission: "finance.manage", icon: "FileText" },
    ],
  },
  {
    title: "Website",
    items: [
      { label: "Pages & content", href: "/admin/content", permission: "content.manage", icon: "PanelsTopLeft" },
      { label: "Services", href: "/admin/services", permission: "content.manage", icon: "Layers" },
      { label: "Portfolio", href: "/admin/portfolio", permission: "portfolio.manage", icon: "MonitorPlay" },
      { label: "Blog", href: "/admin/blog", permission: "blog.manage", icon: "Newspaper" },
      { label: "Pricing", href: "/admin/content/pricing", permission: "content.manage", icon: "Tag" },
      { label: "Media", href: "/admin/media", permission: "content.manage", icon: "Image" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Careers", href: "/admin/careers", permission: "careers.manage", icon: "Briefcase" },
      { label: "Applicants", href: "/admin/careers/applications", permission: "careers.manage", icon: "UserCheck" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/admin/settings", permission: "settings.manage", icon: "Settings" },
      { label: "Admin users", href: "/admin/users", permission: "users.manage", icon: "ShieldCheck" },
      { label: "Activity log", href: "/admin/activity", permission: "activity.view", icon: "History" },
    ],
  },
];
