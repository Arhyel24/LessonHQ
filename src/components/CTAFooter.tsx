import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTAFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-6">
              Start Your <span className="text-accent">Income Journey</span>{" "}
              Today
            </h2>

            <p className="font-nunito text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of Africans who are already earning online. Your
              financial freedom is just one click away.
            </p>

            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-inter font-bold text-xl px-12 py-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Join the Program
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>

            <div className="mt-8 text-gray-400 font-nunito">
              🔒 30-day money-back guarantee • ⭐ 4.9/5 rating from 5,000+
              students
            </div>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <div className="border-t border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-xl text-accent">
                Massive Income Course
              </h3>
              <p className="font-nunito text-gray-400">
                Empowering Africans to build sustainable online income through
                proven digital strategies.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-poppins font-semibold text-lg">
                Quick Links
              </h4>
              <ul className="space-y-2 font-nunito text-gray-400">
                <li>
                  <a
                    href="#courses"
                    className="hover:text-accent transition-colors"
                  >
                    Courses
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:text-accent transition-colors"
                  >
                    About Coach Adams
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-accent transition-colors"
                  >
                    Success Stories
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-accent transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-poppins font-semibold text-lg">
                Connect With Us
              </h4>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-accent border-accent text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-accent border-accent text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                >
                  Telegram
                </Button>
              </div>
              <p className="font-nunito text-gray-400 text-sm">
                Get instant support and connect with our community
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="font-nunito text-gray-400">
             {` © ${new Date().getFullYear()} Massive Income Course. All rights reserved.`}
              <span className="text-accent"> Made with ❤️ for Africa</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
