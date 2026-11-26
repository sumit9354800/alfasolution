import "server-only";
import { revalidatePath } from "next/cache";

/** Public pages render live, but this clears any client-side router cache after content edits. */
export function refreshPublicSite() {
  revalidatePath("/", "layout");
}
