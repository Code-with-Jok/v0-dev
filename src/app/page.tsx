"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

export default function Home() {
  const projects = useQuery(api.project.get);
  const createProject = useMutation(api.project.create);

  return (
    <div className="flex flex-col gap-2 p-4">
      <button
        onClick={() => createProject({ name: "Test Project" })}
        className="bg-blue-500 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer"
      >
        Create Project
      </button>

      {projects?.map((project: Doc<"project">) => (
        <div key={project._id} className="border rounded p-2 flex flex-col">
          <p>{project.name}</p> <p>{project.ownerId}</p>
        </div>
      ))}
    </div>
  );
}
