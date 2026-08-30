import { createFileRoute } from "@tanstack/react-router";
import { SubmissionsPage } from "@/components/pages/SubmissionsPage";

export const Route = createFileRoute("/bai-tap")({
  component: SubmissionsPage,
});
