import Link from "next/link";
import { requirePageAccess } from "@/server/auth/guard";
import { listPostsForAdmin } from "@/server/repos/blog";
import { FilterTabs, PageHeader, StatusBadge, Table, Td, Toolbar } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { isFuture } from "@/lib/time";

export default async function BlogAdminPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requirePageAccess("blog.manage");
  const { status = "", q = "" } = await searchParams;
  const posts = await listPostsForAdmin({ status, q });
  const href = (s: string) => `/admin/blog?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(q ? { q } : {}) })}`;
  return (
    <>
      <PageHeader title="Blog" description="Articles on /blog." actions={<><Link href="/admin/blog/categories" className="btn btn-outline btn-sm">Categories & tags</Link><Link href="/admin/blog/new" className="btn btn-dark btn-sm">Write a post</Link></>} />
      <FilterTabs active={status} items={[{ key: "", label: "All", href: href("") }, { key: "published", label: "Published", href: href("published") }, { key: "scheduled", label: "Scheduled", href: href("scheduled") }, { key: "draft", label: "Drafts", href: href("draft") }]} />
      <Toolbar action="/admin/blog" q={q} placeholder="Search titles">{status ? <input type="hidden" name="status" value={status} /> : null}</Toolbar>
      <Table head={["Title", "Category", "Author", "Publish date", "Status"]} empty="No posts found.">
        {posts.map((p) => {
          const scheduled = p.status === "published" && isFuture(p.published_at);
          return (
            <tr key={p.id} className="hover:bg-paper">
              <Td><Link href={`/admin/blog/${p.id}`} className="font-semibold hover:text-accent">{p.title}</Link><p className="text-xs text-slate">/blog/{p.slug}</p></Td>
              <Td className="text-slate">{p.category_name ?? "—"}</Td>
              <Td className="text-slate">{p.author_name ?? "—"}</Td>
              <Td className="whitespace-nowrap text-slate">{formatDateTime(p.published_at)}</Td>
              <Td><StatusBadge status={scheduled ? "scheduled" : p.status} /></Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
