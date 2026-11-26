import { requirePageAccess } from "@/server/auth/guard";
import { listCategories } from "@/server/repos/blog";
import { PageHeader } from "@/components/admin/ui";
import { createPost } from "../actions";
import { PostForm } from "../PostForm";

export default async function NewPostPage() {
  await requirePageAccess("blog.manage");
  const categories = await listCategories();
  return (
    <>
      <PageHeader back={{ href: "/admin/blog", label: "Blog" }} title="Write a post" />
      <PostForm action={createPost} categories={categories} submitLabel="Save" />
    </>
  );
}
