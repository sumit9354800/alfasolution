import { requirePageAccess } from "@/server/auth/guard";
import { CollectionPage } from "../CollectionPage";

export default async function Page() {
  await requirePageAccess("content.manage");
  return <CollectionPage name="faqs" />;
}
