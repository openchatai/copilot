import { toast } from "@/components/ui/use-toast";
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
            toast({
                title: "Error",
                variant: "destructive",
                description: "Copilot ID is required",
            })
            onError?.({ is_error: true, message: "Copilot ID is required" });
            return;
        }
        try {
            const { data } = await importActionsFromSwagger(copilotId, swagger);
            if (data.is_error === true) {
                onError?.(data);
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Success",
                    description: data.message,
                    variant: "success",
                })
                onSuccess?.(data);
            }
            return data;
        } catch (error) {
            toast({
                title: "Error",
                variant: "destructive",
                // @ts-ignore
                description: (error as AxiosError).response?.data.message,
            })
            // @ts-ignore
            onError?.({ is_error: true, message: (error as AxiosError).response?.data.message });
        }

    }
    return useAsyncFn(addSwagger)
}