import { toast } from "sonner";
import { importActionsFromSwagger } from "@/data/actions";
import { AxiosError } from "axios";
import { useAsyncFn } from "react-use";

type Params = {
    copilotId?: string;
}

type TData = {
    is_error: boolean;
    message: string;
}

export function useSwaggerAdd({ copilotId }: Params) {
    async function addSwagger({
        swagger,
        onSuccess,
        onError,
    }: {
        swagger: File;
        onSuccess?: (data: TData) => void;
        onError?: (data: TData) => void;
    }) {
        if (!copilotId) {
            toast.error("Copilot ID is required")
            onError?.({ is_error: true, message: "Copilot ID is required" });
            return;
        }
        try {
            const { data } = await importActionsFromSwagger(copilotId, swagger);
            if (data.is_error === true) {
                onError?.(data);
                toast.error(data.message)
            } else {
                toast.success(data.message)
                onSuccess?.(data);
            }
            return data;
        } catch (error) {
            // @ts-ignore
            toast.error((error as AxiosError).response?.data.message)
            // @ts-ignore
            onError?.({ is_error: true, message: (error as AxiosError).response?.data.message });
        }

    }
    return useAsyncFn(addSwagger)
}