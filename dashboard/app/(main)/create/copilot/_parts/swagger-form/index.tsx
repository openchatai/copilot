import { Pen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { Label } from "@/components/ui/label";
import { SwaggerForm } from "./form";
import { methodVariants } from "./MethodRenderer";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { useCreateCopilot } from "../CreateCopilotProvider";

export function SwaggerUi() {
    const { state, dispatch } = useCreateCopilot();
    const swaggerUrls = state.swaggerEndpoints;
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
                <button onClick={addNewEndpoint}>
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-start flex-col gap-2 overflow-auto max-h-52 p-0.5">
                {
                    swaggerUrls.length === 0 ?
                        <div className="mx-auto">
                            <EmptyBlock>
                                No endpoints added yet.
                            </EmptyBlock>
                        </div>
                        :
                        swaggerUrls.map((endpoint, index) => {
                            return <div key={index} className="w-full p-1.5 shrink-0 flex overflow-hidden max-w-full gap-4 items-center justify-between border border-border transition-colors rounded-lg">
                                <div className="flex-1 flex items-center justify-start overflow-hidden shrink-0">
                                    <div className="flex items-center gap-5 overflow-hidden shrink-0">
                                        <span className={cn(methodVariants({
                                            method: endpoint.method
                                        }))}>
                                            {endpoint.method}
                                        </span>
                                        <p className="flex-1 line-clamp-1 overflow-ellipsis font-medium text-xs">
                                            {endpoint.url || endpoint.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-x-2">
                                    <button className="text-primary" onClick={() => {
                                        dispatch({
                                            type: "CHANGE_MODE",
                                            payload: {
                                                mode: "EDIT_EXISTING_ENDPOINT",
                                                endpointId: endpoint.id
                                            }
                                        })
                                    }}>
                                        <Pen className="w-4 h-4" />
                                    </button>
                                    <button className="text-destructive">
                                        <Trash2 className="w-4 h-4" onClick={() => confirm("are you sure") && handleDelete(endpoint.id)} />
                                    </button>
                                </div>
                            </div>
                        })
                }
            </div>
            {state.mode && <SwaggerForm defaultValues={currentlyEditingEndpoint} />}
        </div>

    )

}