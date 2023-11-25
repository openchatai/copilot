import { useSearchParams } from "next/navigation";

export function useIsEditing() {
  const searchParams = useSearchParams();
  const workflow_id = searchParams.get("workflow_id");
  const isEditing = !!workflow_id;
  return [isEditing, workflow_id] as const;
}
