import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/components/pages/NewsPage";

export const Route = createFileRoute("/co-gi-moi")({
  component: NewsPage,
});
