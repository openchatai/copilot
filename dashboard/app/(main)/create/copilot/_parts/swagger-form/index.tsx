import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SwaggerForm } from "./form";
import { useCreateCopilot } from "../CreateCopilotProvider";
import { Button } from "@/components/ui/button";


export function SwaggerUi() {
    const { state, dispatch } = useCreateCopilot();
    const currentlyEditingEndpointId = state.currentlyEditingEndpointId;
    const currentlyEditingEndpoint = state.swaggerEndpoints.find((endpoint) => endpoint.id === currentlyEditingEndpointId);
    function addNewEndpoint() {
        dispatch({
            type: "CHANGE_MODE",
            payload: {
                mode: "CREATE_NEW_ENDPOINT",
            }
        })
    }
    function handleDelete(id: string) {
        dispatch({
            type: "DELETE_SWAGGER_ENDPOINT",
            payload: id
        })
    }
    return (
        <div>
            <div className="flex items-center justify-between">
                <Label className="my-4 text-sm text-accent-foreground">
                    Use our straight forward form to add new endpoints.
                </Label>
                <Button variant='secondary' size='fit' onClick={addNewEndpoint} className="space-x-1">
                    <span>
                        Add Action
                    </span>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

        </div>

    )

}