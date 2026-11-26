import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { idParam } from "@/server/admin-action";
import { getPostById, listCategories } from "@/server/repos/blog";
import { ActionForm, ConfirmSubmit } from "@/components/admin/form";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { deletePost, updatePost } from "../actions";
import { isFuture } from "@/lib/time";
import { PostForm } from "../PostForm";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requirePageAccess("blog.manage");
  const id = idParam((await params).id);
  const post = id ? await getPostById(id) : null;
  if (!post || !id) notFound();
  const [categories, { saved }] = await Promise.all([listCategories(), searchParams]);
  const live = post.status === "published" && Boolean(post.published_at) && !isFuture(post.published_at);
  return (
    <>
      <PageHeader
        back={{ href: "/admin/blog", label: "Blog" }}
        title={post.title}
        description={<StatusBadge status={post.status === "published" && !live ? "scheduled" : post.status} />}
        actions={live ? <a href={`/blog/${post.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">View on site</a> : null}
      />
      {saved ? <p role="status" className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-success">Post saved.</p> : null}
      <PostForm action={updatePost.bind(null, id)} post={post} categories={categories} submitLabel="Save" />
      <ActionForm action={deletePost.bind(null, id)} className="mt-8">
        <ConfirmSubmit label="Delete post" />
      </ActionForm>
    </>
  );
}
