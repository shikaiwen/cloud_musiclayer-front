"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from './download-history';

export function YouTubeConverter() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (response.ok) {
        toast({
          title: "Conversion started",
          description: "Your video is being converted to MP3.",
        });
      } else {
        throw new Error('Conversion failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="url"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Converting...' : 'Convert and Download'}
      </Button>
      <Button onClick={() => window.location.reload()} className="w-full">
        Refresh
      </Button>
    </form>
  );
}