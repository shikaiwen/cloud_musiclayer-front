"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

interface VideoResult {
  id: string;
  thumbnail: string;
  title: string;
}

export function VideoSearch() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8001/video/search?keywords=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      const results = data.results
      if (Array.isArray(results)) {
        setResults(results);
        setShowResults(true);
        setIsCollapsed(false);
      } else {
        console.error('Received non-array data:', results);
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      setResults([]);
      setShowResults(false);
    }
  };

  const handleGetMp3 = async (record: any) => {
    try {
      const url = record.url
      await fetch(`http://localhost:8001/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      // Trigger download history refresh in parent component
    } catch (error) {
      console.error('Error getting MP3:', error);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {showResults && (
        <div>
          <Button onClick={toggleCollapse} className="mb-2">
            {isCollapsed ? (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-2" />
                Show Results
              </>
            ) : (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-2" />
                Hide Results
              </>
            )}
          </Button>
          {!isCollapsed && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <img src={result.thumbnails[0].url} alt={result.title} className="w-20 h-20 object-cover" />
                    </TableCell>
                    <TableCell>
                      <a href={`https://www.youtube.com/watch?v=${result.id}`} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleGetMp3(result)}>Get MP3</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}