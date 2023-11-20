import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import _ from "lodash";
import { Label } from "@/components/ui/label";
import { SwaggerForm } from "./form";
import { methodVariants } from "./MethodRenderer";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { useCreateCopilot } from "../CreateCopilotProvider";

export function SwaggerUi() {
    const { state, dispatch } = useCreateCopilot();
    const currentlyEditingEndpointId = state.currentlyEditingEndpointId;
    const currentlyEditingEndpoint = state.swaggerEndpoints.find((endpoint) => endpoint.id === currentlyEditingEndpointId);
    const swaggerUrls = state.swaggerEndpoints;
    function addNewEndpoint() {
        setCurrentlyEditingEndpoint(null);
        dispatch({
            type: "ADD_NEW_ENDPOINT"
        })
    }
    function handleDelete(id: string) {
        dispatch({
            type: "DELETE_SWAGGER_ENDPOINT",
            payload: id
        })
    }
    function setCurrentlyEditingEndpoint(id: string | null) {
        dispatch({
            type: "SET_CURRENTLY_EDITING_ENDPOINT_ID",
            payload: id
        })
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <Label className="my-4 text-sm text-accent-foreground">
                    Manually Create Swagger Def.
                </Label>
                <button onClick={addNewEndpoint}>
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-start flex-col gap-2 overflow-auto max-h-52">
                {
                    swaggerUrls.length === 0 ?
                        <div className="mx-auto">
                            <EmptyBlock>
                                No endpoints added yet.
                            </EmptyBlock>
                        </div>
                        :
                        swaggerUrls.map((endpoint, index) => {
                            return <div key={index} className="w-full p-2 flex items-center justify-between border border-border transition-colors rounded-lg">
                                <div className="flex-1 flex items-center justify-start shrink-0">
                                    <div className="flex items-center gap-5 shrink-0">
                                        <span className={cn(methodVariants({
                                            method: endpoint.method
                                        }))}>
                                            {endpoint.method}
                                        </span>
                                        <p className="flex-1 whitespace-nowrap line-clamp-1 text-sm">
                                            {endpoint.url || endpoint.title}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVertical className="w-5 h-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(endpoint.id)}>
                                            Delete
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-accent-foreground" onClick={() => setCurrentlyEditingEndpoint(endpoint.id)}>
                                            Edit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        })
                }
            </div>
            {
                currentlyEditingEndpoint && <SwaggerForm defaultValues={currentlyEditingEndpoint} />
            }
        </>
    )

}