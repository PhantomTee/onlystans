import { EarningsDashboard } from "@/components/EarningsDashboard";
import { listVideosRepo } from "@/lib/repository";

export default async function DashboardPage() {
  const videos = await listVideosRepo("new");
  return <EarningsDashboard videos={videos} />;
}
