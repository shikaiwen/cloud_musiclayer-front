import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoSearch } from '@/components/video-search';
import { YouTubeConverter } from '@/components/youtube-converter';
import { DownloadHistory } from '@/components/download-history';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">YouTube to MP3 Converter</h1>
      <Tabs defaultValue="video-search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video-search">Video Search</TabsTrigger>
          <TabsTrigger value="url-search">URL Search</TabsTrigger>
        </TabsList>
        <TabsContent value="video-search">
          <VideoSearch />
        </TabsContent>
        <TabsContent value="url-search">
          <YouTubeConverter />
        </TabsContent>
      </Tabs>
      <DownloadHistory />
    </div>
  );
}