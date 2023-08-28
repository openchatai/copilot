import { Button } from "@/ui/components/Button";
import { Heading } from "@/ui/components/Heading";
import { Separator } from "@/ui/components/Separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/ui/components/headless/Dialog";
import { FileInput } from "@/ui/components/inputs/FileField";
import { Form, FormizStep } from "@formiz/core";
import Link from "next/link";
import { ComponentProps, ElementRef, forwardRef } from "react";
import { megabytesToBytes } from "utils/misc";

export const UploadSwaggerStep = forwardRef<
  ElementRef<"div">,
  ComponentProps<"div"> & { form: Form }
>(({ form, ...props }, _ref) => {
  return (
    <FormizStep name="swagger_file">
      <div>
        <div>
          <Heading level={3} className="font-bold mb-6">
            Upload your swagger.json file ✨
          </Heading>
        </div>
        <div>
          You copilot will use these APIs to communicate with your product and
          execute actions
        </div>
        <div className="my-5">
          <FileInput
            name="json_files"
            maxSize={megabytesToBytes(2)}
            maxFiles={1}
            accept={{
              "application/json": [".json"],
            }}
          />
        </div>
        <div className="flex items-center justify-between space-x-6">
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-300 text-sm mb-1">
              Make sure that your files are scannable (text not images) 🫶
            </div>
            <div className="text-xs dark:text-slate-400">
              You can upload multiple files at once and we will process them in
              the background.
            </div>
          </div>
        </div>
        <Separator
          className="mx-auto my-6"
          label="🪄 OR 🪄"
          labelClassName="after:bg-white after:dark:bg-slate-800 after:text-slate-800 after:dark:text-slate-200 after:font-bold after:text-base"
        />
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="whitespace-normal"
                variant={{ intent: "primary-ghost" }}
              >
                Use our pre-made demo swagger file to try it out quickly (🐶pet
                store SaaS system)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-4xl flex items-center justify-center w-full border-none">
                <span>🐶🐕</span>
              </DialogHeader>
              <div className="mt-5 px-5">
                <h2 className="text-center text-lg font-semibold">
                  Pet Store Demo
                </h2>
                <p className="mt-2 text-center text-sm">
                  In this pet store you can add, delete, update and view pets,
                  you can also search and manage inventory, and finally you can
                  place orders . We already configured the APIs and the backend,
                  you can test it almost immediately.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button variant={{ intent: "success" }}>Let's do it</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center justify-between space-x-6 mb-8">
          <div>
            <div className="font-medium text-slate-800 text-sm mb-1">
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
                  ✅ Make sure that the swagger file is valid, the system might
                  not be able to parse invalid files,{" "}
                  <Link href="https://editor.swagger.io/" target="_blank">
                    use this tool validate your schema
                  </Link>
                </li>
                <li>
                  ✅ Do not add any Authorization layers, we will show you how
                  to authorize your own requests by yourself
                </li>
                <li>
                  ✅ This *very* new product, so many things does not make
                  sense/work at this stage{" "}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormizStep>
  );
});

UploadSwaggerStep.displayName = "PdfConfig";
