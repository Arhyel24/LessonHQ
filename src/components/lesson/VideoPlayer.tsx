
import { useState } from "react";
import { Play, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  isCompleted: boolean;
  markComplete: (lessonId: string) => void;
  isMarking: boolean;
}

export const VideoPlayer = ({ id, title, videoUrl, duration, isCompleted, markComplete, isMarking }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Video Title */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="font-poppins font-bold text-xl text-gray-900">
              {title}
            </h2>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-1">Duration: {duration}</p>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/20 rounded-full p-4">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          )}
          
          <iframe
            src={videoUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleVideoLoad}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>

        {/* Video Controls/Info */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handlePlay}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="h-4 w-4 mr-2" />
                {isPlaying ? 'Playing' : 'Play'}
              </Button>
              <span className="text-sm text-gray-600">
                {isCompleted ? 'Watched' : 'Not completed'}
              </span>
            </div>
            
            {!isCompleted && (
              <Button
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-primary/5 cursor-pointer"
                onClick={() => markComplete(id)}
              >
                {isMarking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking as Complete...
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
