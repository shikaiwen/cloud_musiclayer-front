"use client"
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/24/solid';

interface DownloadRecord {
  id: string;
  create_time: string;
  url: string;
  download_cost_time: number;
  filename: string;
  file_size: number;
  status: 'pending' | 'completed' | 'failed';
}

const ITEMS_PER_PAGE = 10;
export const API_URL = "http://35.73.206.245:8001";
// export const API_URL = "http://localhost:8001";



export function DownloadHistory() {
  const [history, setHistory] = useState<DownloadRecord[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);


  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/download-history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data.items)) {
        setHistory(data.items);
      } else {
        console.error('Received non-array data:', data.items);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching download history:', error);
      setHistory([]);
    }
  };

  const playAudio = (filename: string, index: number) => {
    if (currentlyPlaying === filename) {
      stopAudio();
    } else {
      stopAudio();
      audioRef.current = new Audio(`${API_URL}/mp3/${filename}`);
      audioRef.current.play();
      setCurrentlyPlaying(filename);
      setCurrentPlayingIndex(index);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setCurrentPlayingIndex(-1);
  };

  const playAll = () => {
    if (isPlayingAll) {
      stopAudio();
      setIsPlayingAll(false);
    } else {
      setIsPlayingAll(true);
      playNextInQueue(0);
    }
  };

  const playNextInQueue = (index: number) => {
    if (index < history.length && isPlayingAll) {
      const record = history[index];
      playAudio(record.filename, index);
      audioRef.current!.onended = () => playNextInQueue(index + 1);
    } else {
      setIsPlayingAll(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/download-history/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchHistory(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes /// (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const paginatedHistory = history.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Download History</h2>
        <div>
          <Button onClick={fetchHistory} className="mr-2">Refresh</Button>
          <Button onClick={playAll}>{isPlayingAll ? 'Stop All' : 'Play All'}</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Cost (seconds)</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedHistory.map((record, index) => (
            <TableRow key={record.id}>
              <TableCell>{record.filename}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>{new Date(record.create_time).toLocaleString()}</TableCell>
              <TableCell>{formatFileSize(record.file_size)}</TableCell>
              <TableCell>{record.download_cost_time.toFixed(2)}</TableCell>
              <TableCell>
                <Button onClick={() => playAudio(record.filename, index)} variant="ghost" size="icon" className="mr-2">
                  {currentPlayingIndex === index ? (
                    <StopIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button onClick={() => deleteRecord(record.id)} variant="ghost" size="icon">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center mt-4">
        <Button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}