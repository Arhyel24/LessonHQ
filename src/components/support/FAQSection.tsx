
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Settings, CreditCard } from "lucide-react";

interface FAQSectionProps {
  searchQuery: string;
}

export const FAQSection = ({ searchQuery }: FAQSectionProps) => {
  const [showAll, setShowAll] = useState(false);

  const faqCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      items: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button on our homepage, fill in your details, and verify your email address. You'll then have access to our course catalog."
        },
        {
          question: "What courses are available?",
          answer: "We offer courses in affiliate marketing, graphic design, e-book publishing, and digital entrepreneurship. All courses are designed for beginners."
        },
        {
          question: "Do I need any prior experience?",
          answer: "No prior experience required! Our courses start from the basics and guide you step-by-step through everything you need to know."
        }
      ]
    },
    {
      title: "Courses & Certificates",
      icon: BookOpen,
      items: [
        {
          question: "How long does it take to complete a course?",
          answer: "Most courses can be completed in 4-8 weeks with 2-3 hours of study per week. You can learn at your own pace."
        },
        {
          question: "Do I get a certificate after completion?",
          answer: "Yes! You'll receive a digital certificate upon successful completion of each course that you can share on LinkedIn and other platforms."
        },
        {
          question: "Can I access courses on mobile?",
          answer: "Absolutely! Our platform is fully mobile-responsive, so you can learn anywhere, anytime from your phone or tablet."
        }
      ]
    },
    {
      title: "Referral & Earnings",
      icon: Users,
      items: [
        {
          question: "How does the referral program work?",
          answer: "Share your unique referral link with friends. When they sign up and purchase a course, you earn a commission. Track your earnings in the Referral Dashboard."
        },
        {
          question: "When do I get paid for referrals?",
          answer: "Referral commissions are processed monthly. You'll receive payment via bank transfer or your preferred payment method."
        },
        {
          question: "How much can I earn per referral?",
          answer: "You earn 20% commission on each successful referral. For a ₦10,000 course, you'd earn ₦2,000 per referral."
        }
      ]
    },
    {
      title: "Account Settings",
      icon: Settings,
      items: [
        {
          question: "How do I change my password?",
          answer: "Go to Profile Settings > Password & Security section. Enter your current password and choose a new one."
        },
        {
          question: "Can I update my email address?",
          answer: "Yes, you can update your email in the Profile Settings. You'll need to verify the new email address."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. Note that this action cannot be undone and you'll lose access to all courses."
        }
      ]
    },
    {
      title: "Payments & Withdrawals",
      icon: CreditCard,
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept bank transfers, debit cards, and mobile money payments. All transactions are secure and encrypted."
        },
        {
          question: "Can I get a refund?",
          answer: "We offer a 7-day money-back guarantee. If you're not satisfied with a course, contact us within 7 days of purchase for a full refund."
        },
        {
          question: "How do I withdraw my earnings?",
          answer: "Go to your Earnings page and click 'Withdraw'. You can withdraw to your bank account once you reach the minimum threshold of ₦5,000."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  // Show only first 2 categories initially unless showing all or searching
  const categoriesToShow = showAll || searchQuery 
    ? filteredCategories 
    : filteredCategories.slice(0, 2);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="font-poppins text-2xl text-gray-900">
          Frequently Asked Questions
        </CardTitle>
        {searchQuery && (
          <p className="text-sm text-gray-600">
            {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} results found
          </p>
        )}
      </CardHeader>
      <CardContent>
        {categoriesToShow.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No results found. Try different keywords or contact support directly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categoriesToShow.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-poppins font-semibold text-lg text-gray-900">
                    {category.title}
                  </h3>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`${categoryIndex}-${itemIndex}`}
                      className="bg-gray-50 rounded-lg px-4 border-0"
                    >
                      <AccordionTrigger className="font-nunito font-medium text-gray-900 hover:text-primary py-4 text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="font-nunito text-gray-600 pb-4 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
            
            {!searchQuery && !showAll && filteredCategories.length > 2 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="font-nunito"
                >
                  View More FAQs
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
