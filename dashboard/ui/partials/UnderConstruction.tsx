import Image from "next/image";
import { Heading } from "../components/Heading";
/**
 * @name UnderConstruction
 * @description Under construction component
 */
export function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center mx-auto">
      <div className="relative aspect-square max-w-xs w-full h-auto">
        <Image
          src="/illustrations/under_construction.svg"
          alt="under uonstruction"
          fill
          className="absolute max-w-full max-h-full text-indigo-500"
        />
      </div>
      <Heading level={4}>Under construction</Heading>
    </div>
  );
}
