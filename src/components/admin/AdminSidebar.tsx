import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserCheck, 
  TrendingUp, 
  BarChart3,
  Settings,
  X,
  Ticket
} from "lucide-react";
import { AdminSection } from "./AdminPage";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ activeSection, onSectionChange, isOpen, onClose }: AdminSidebarProps) => {
  const menuItems = [
    {
      key: "dashboard" as AdminSection,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { key: "courses" as AdminSection, label: "Courses", icon: BookOpen },
    { key: "users" as AdminSection, label: "Users", icon: Users },
    {
      key: "enrollments" as AdminSection,
      label: "Enrollments",
      icon: UserCheck,
    },
    { key: "progress" as AdminSection, label: "Progress", icon: TrendingUp },
    { key: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
    { key: "coupons" as AdminSection, label: "Coupons", icon: Ticket },
  ];

  const handleSectionChange = (section: AdminSection) => {
    onSectionChange(section);
    // Close mobile sidebar after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="flex justify-between items-center p-6 border-b md:block">
          <h1 className="font-bold text-xl text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2 h-full overflow-y-auto pb-20">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={activeSection === item.key ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === item.key 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleSectionChange(item.key)}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-gray-700">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </>
  );
};
