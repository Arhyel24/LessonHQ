import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  isValidYouTubeUrl,
  getYouTubeThumbnail,
  cleanYouTubeUrl,
} from "@/lib/youtube-utils";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface AddCoursePageProps {
  onBack: () => void;
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  duration: number;
  order: number;
}

export const AddCoursePage = ({ onBack }: AddCoursePageProps) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    icon: "",
    price: "",
    originalPrice: "",
    instructor: "",
    difficulty: "Beginner",
    enrollmentCount: "",
    status: "draft",
    requiresCompletionForDownload: false,
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    { id: "1", title: "", videoUrl: "", content: "", duration: 0, order: 1 },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      videoUrl: "",
      content: "",
      duration: 0,
      order: lessons.length + 1,
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (id: string) => {
    const updated = lessons
      .filter((lesson) => lesson.id !== id)
      .map((lesson, index) => ({
        ...lesson,
        order: index + 1,
      }));
    setLessons(updated);
  };

  const updateLesson = (id: string, field: keyof Lesson, value: string) => {
    setLessons(
      lessons.map((lesson) =>
        lesson.id === id
          ? { ...lesson, [field]: field === "duration" ? Number(value) : value }
          : lesson
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.slug ||
      !formData.description ||
      !formData.thumbnail ||
      !formData.price ||
      !lessons.length
    ) {
      toast({
        title: "Missing Required Fields",
        description:
          "Please fill in all the required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lessons,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      toast({
        title: "Course Created",
        description: "Your course has been successfully created.",
        variant: "success",
      });

      // Reset form data
      setFormData({
        title: "",
        slug: "",
        description: "",
        thumbnail: "",
        icon: "",
        price: "",
        originalPrice: "",
        difficulty: "Intermediate",
        enrollmentCount: "",
        instructor: "",
        status: "draft",
        requiresCompletionForDownload: false,
      });
      setLessons([
        {
          id: "1",
          title: "",
          videoUrl: "",
          content: "",
          duration: 0,
          order: 1,
        },
      ]);

      onBack();
    } catch (error: any) {
      toast({
        title: "Course Creation Failed",
        description: error.message || "Unable to save course.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="self-start">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Course</h1>
          <p className="text-gray-600">Create a new course for your platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, "")
                      .replace(/\s+/g, "-");

                    setFormData({
                      ...formData,
                      title,
                      slug,
                    });
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="originalPrice">Original Price (₦)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enrollmentCount">Enrollment Count</Label>
                <Input
                  id="enrollmentCount"
                  type="number"
                  value={formData.enrollmentCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enrollmentCount: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-md resize-none min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnail: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="e.g. 📚"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="requiresCompletionForDownload"
                checked={formData.requiresCompletionForDownload}
                onCheckedChange={(val) =>
                  setFormData({
                    ...formData,
                    requiresCompletionForDownload: Boolean(val),
                  })
                }
              />
              <Label htmlFor="requiresCompletionForDownload">
                Requires completion for download
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lessons</CardTitle>
              <Button type="button" onClick={addLesson} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.map((lesson, index) => {
              const showThumbnail = isValidYouTubeUrl(lesson.videoUrl);
              const thumbnailUrl = showThumbnail
                ? getYouTubeThumbnail(lesson.videoUrl)
                : "";

              return (
                <div
                  key={lesson.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Lesson {index + 1}</h4>
                    {lessons.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(lesson.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Lesson Title</Label>
                    <Input
                      value={lesson.title}
                      onChange={(e) =>
                        updateLesson(lesson.id, "title", e.target.value)
                      }
                      placeholder="Enter lesson title"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Video URL</Label>
                    <div className="flex gap-4 items-start">
                      {showThumbnail && (
                        <Image
                          src={thumbnailUrl}
                          alt="Video thumbnail"
                          className="w-32 h-20 object-cover rounded border"
                          width={128}
                          height={80}
                          loader={({ src, width, quality }) =>
                            `${src}?w=${width}&q=${quality || 75}`
                          }
                          quality={80}
                        />
                      )}
                      <Input
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          updateLesson(
                            lesson.id,
                            "videoUrl",
                            cleanYouTubeUrl(e.target.value)
                          )
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Content</Label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) =>
                        updateLesson(lesson.id, "content", e.target.value)
                      }
                      placeholder="Lesson content and description"
                      className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={lesson.duration.toString()}
                      onChange={(e) =>
                        updateLesson(lesson.id, "duration", e.target.value)
                      }
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
