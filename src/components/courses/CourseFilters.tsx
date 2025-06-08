import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterType } from "@/types/course";

interface CourseFiltersProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const CourseFilters = ({
  selectedFilter,
  onFilterChange,
}: CourseFiltersProps) => {
  // Filter options
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Courses" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "not-started", label: "Not Started" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full px-4 py-1 h-auto",
            selectedFilter === filter.value
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
              : "bg-white hover:bg-gray-50 text-gray-700"
          )}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};
