export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Create your account in less than 2 minutes",
      icon: "👤",
    },
    {
      number: "2",
      title: "Choose a Course",
      description: "Pick the income stream that interests you most",
      icon: "📋",
    },
    {
      number: "3",
      title: "Start Learning & Earning",
      description: "Follow our step-by-step lessons and start making money",
      icon: "💸",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            How <span className="text-primary">It Works</span>
          </h2>
          <p className="font-nunito text-lg text-gray-600 max-w-2xl mx-auto">
            Start your online income journey in just 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="text-center group animate-slide-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-poppins font-bold text-2xl mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-4xl">
                  {step.icon}
                </div>
              </div>

              <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-3">
                {step.title}
              </h3>

              <p className="font-nunito text-gray-600">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 h-0.5 bg-accent transform -translate-x-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
