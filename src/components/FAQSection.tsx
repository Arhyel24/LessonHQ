import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
  const faqs = [
    {
      question: "Is this course beginner-friendly?",
      answer:
        "Absolutely! Our courses are designed specifically for beginners with no prior experience. We start from the basics and guide you step-by-step through everything you need to know.",
    },
    {
      question: "How much can I realistically earn?",
      answer:
        "Earnings vary based on effort and consistency. Our students typically earn $200-$1000+ monthly within 3-6 months. Some top performers earn much more through multiple income streams.",
    },
    {
      question: "Do I need any special equipment or software?",
      answer:
        "No expensive equipment needed! You can start with just a smartphone and internet connection. We teach you how to use free tools and platforms available to everyone.",
    },
    {
      question: "How long does it take to see results?",
      answer:
        "Most students start seeing their first earnings within 2-4 weeks of implementing our strategies. However, building sustainable income typically takes 2-3 months of consistent effort.",
    },
    {
      question: "Is there ongoing support after purchase?",
      answer:
        "Yes! You get lifetime access to course updates, our private community, and regular live Q&A sessions with Coach Adams and other successful students.",
    },
    {
      question: "Can I take multiple courses?",
      answer:
        "Definitely! Many successful students combine multiple income streams. We offer bundle discounts for students who want to learn affiliate marketing, graphic design, and e-book publishing together.",
    },
  ];

  return (
    <section className="py-20 bg-white" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="font-nunito text-lg text-gray-600 max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers to help you get started
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-slide-in">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 rounded-lg px-6 border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="font-poppins font-medium text-gray-900 hover:text-primary py-6 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-nunito text-gray-600 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
