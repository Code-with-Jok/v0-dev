"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";
import { ProjectSaveStatus } from "./project-save-status";
import { ProjectTitleRenamer } from "./project-title-renamer";

interface NavbarProps {
  projectId: Id<"projects">;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Navbar = ({ projectId }: NavbarProps) => {
  return (
    <nav className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0!">
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                <Button variant="ghost" className="w-fit! p-1.5! h-7!" asChild>
                  <Link href="/">
                    <Image
                      src="/vercel.svg"
                      alt="Logo"
                      width={24}
                      height={24}
                    />
                    <span className={cn("text-sm font-medium", font.className)}>
                      V0
                    </span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="ml-0! mr-1" />
            <ProjectTitleRenamer projectId={projectId} />
          </BreadcrumbList>
        </Breadcrumb>

        <ProjectSaveStatus projectId={projectId} />
      </div>

      <div className="flex items-center gap-x-2">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
