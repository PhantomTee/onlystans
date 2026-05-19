import { notFound } from "next/navigation";
import { WatchExperience } from "@/components/WatchExperience";
import { getVideoRepo } from "@/lib/repository";

export default async function WatchPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  const video = await getVideoRepo(videoId);
  if (!video) notFound();
  return <WatchExperience video={video} />;
}
