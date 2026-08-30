import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardPage } from "@/components/pages/LeaderboardPage";

export const Route = createFileRoute("/vinh-danh")({
  component: LeaderboardPage,
});
