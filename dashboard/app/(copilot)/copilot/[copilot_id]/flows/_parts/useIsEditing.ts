import { useRouter } from "@/lib/router-events";
import { useSearchParams } from "next/navigation";

export function useIsEditing() {
  const searchParams = useSearchParams();
  const workflow_id = searchParams.get("workflow_id");
  const isEditing = !!workflow_id;
  const {
    replace
  } = useRouter();
  function reset() {
    // remove workflow_id from url
    const url = new URL(window.location.href);
    url.searchParams.delete("workflow_id");
    replace(url.pathname + url.search);

  }
  return [isEditing, workflow_id, reset] as const;
}
