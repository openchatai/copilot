import { Link } from "@/lib/router-events"
import { DropZone } from "./DropZone"

export function GetActionsFromSwagger({
    swaggerFiles,
    onChange
}: {
    swaggerFiles?: File[],
    // eslint-disable-next-line no-unused-vars
    onChange?: (files: File[]) => void
}) {
    return <div>
        <div className="my-5">
            <DropZone
                multiple={false}
                maxFiles={1}
                accept={{ json: ["application/json"] }}
                value={swaggerFiles || []}
                onChange={onChange}
            />
        </div>
        <div className="mb-8 mt-4 flex items-center justify-between space-x-6">
            <div>
                <div className="mb-1 text-sm font-medium text-slate-800">
                    Important Instructions
                </div>
                <div className="text-xs">
                    <ul>
                        <li>
                            ✅ Make sure each{" "}
                            <strong>endpoint have description and operation id</strong>,
                            results will be significantly better with a good description
                        </li>
                        <li>
                            ✅ Make sure that the swagger file is valid, the system
                            might not be able to parse invalid files,{" "}
                            <Link href="https://editor.swagger.io/" target="_blank">
                                use this tool validate your schema
                            </Link>
                        </li>
                        <li>
                            ✅ Do not add any Authorization layers, we will show you how
                            to authorize your own requests by yourself
                        </li>
                        <li>
                            ✅ This is a *very* new product, so many things does not make
                            sense/work at this stage{" "}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
}
