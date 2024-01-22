import { Button } from "../ui/button";

type Props = {
    isNext: boolean;
    isBack: boolean;
    onNext: () => void;
    onBack: () => void;
}

export function SimplePagination({ isNext, isBack, onNext, onBack }: Props) {
    return (
        <div className="flex justify-between items-center gap-2">
            <Button variant='secondary' size="fluid" disabled={!isBack} onClick={onBack} className="text-sm font-medium text-primary">
                Back
            </Button>
            <Button variant='outline' size="fluid" disabled={!isNext} onClick={onNext} className="text-sm font-medium text-primary">
                Next
            </Button>
        </div>
    );
}