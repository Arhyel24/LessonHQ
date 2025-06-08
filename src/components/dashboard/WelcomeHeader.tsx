interface WelcomeHeaderProps {
  userName: string;
}

export const WelcomeHeader = ({ userName }: WelcomeHeaderProps) => {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-bold text-2xl md:text-3xl text-gray-900">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="font-nunito text-gray-600 mt-2">
            Keep pushing towards your financial goals
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
          <span className="text-2xl">🎯</span>
        </div>
      </div>
    </div>
  );
};
