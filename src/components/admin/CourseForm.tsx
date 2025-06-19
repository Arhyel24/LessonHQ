"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface CourseFormProps {
  onClose: () => void;
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
}

export const CourseForm = ({ onClose }: CourseFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    thumbnailUrl: "",
    instructor: ""
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    { id: "1", title: "", videoUrl: "", content: "" }
  ]);

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: "",
      videoUrl: "",
      content: ""
    };
    setLessons([...lessons, newLesson]);
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const updateLesson = (id: string, field: keyof Lesson, value: string) => {
    setLessons(lessons.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value } : lesson
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="course-url-slug"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Course description"
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="25000"
                required
              />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                placeholder="Instructor name"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
              placeholder="https://example.com/thumbnail.jpg"
            />
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
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="border rounded-lg p-4 space-y-3">
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
              
              <div>
                <Label>Lesson Title</Label>
                <Input
                  value={lesson.title}
                  onChange={(e) => updateLesson(lesson.id, "title", e.target.value)}
                  placeholder="Enter lesson title"
                />
              </div>
              
              <div>
                <Label>Video URL</Label>
                <Input
                  value={lesson.videoUrl}
                  onChange={(e) => updateLesson(lesson.id, "videoUrl", e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              
              <div>
                <Label>Content</Label>
                <textarea
                  value={lesson.content}
                  onChange={(e) => updateLesson(lesson.id, "content", e.target.value)}
                  placeholder="Lesson content and description"
                  className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Course
        </Button>
      </div>
    </form>
  );
};
