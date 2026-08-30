import { createFileRoute } from "@tanstack/react-router";
import { VideosPage } from "@/components/pages/VideosPage";

export const Route = createFileRoute("/")({
  component: VideosPage,
});
