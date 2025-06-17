"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  searchTerm: string;
  setSearchTerm: (e: string) => void;
  loading: boolean;
  onSelectUser: (student: Student) => void
}

export const UserSelectionModal = ({
  isOpen,
  onClose,
  students,
  searchTerm,
  setSearchTerm,
  loading,
  onSelectUser,
}: UserSelectionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Select Student</DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-2 mt-4">
            {loading ? (
              <p className="text-gray-400 text-center">Loading...</p>
            ) : students.length > 0 ? (
              students.map((student) => (
                <Button
                  key={student.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => onSelectUser(student)}
                >
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
