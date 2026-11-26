import { notFound } from "next/navigation";
import { requirePageAccess } from "@/server/auth/guard";
import { getGroup } from "@/lib/content-schema";
import { getRawSetting } from "@/server/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { saveSettingsGroup } from "../actions";

export default async function SettingsGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: key } = await params;
  const group = getGroup(decodeURIComponent(key));
  if (!group) notFound();
  await requirePageAccess(group.permission);
  const value = await getRawSetting(group.key);
  const back = group.permission === "settings.manage" ? { href: "/admin/settings", label: "Settings" } : { href: "/admin/content", label: "Pages & content" };
  return (
    <>
      <PageHeader back={back} title={group.title} description={group.description} />
      <SettingsForm fields={group.fields} initial={value} action={saveSettingsGroup.bind(null, group.key)} />
    </>
  );
}
