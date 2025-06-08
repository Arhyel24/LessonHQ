import Image from "next/image";

export const AboutSection = () => {
  return (
    <section className="py-20 bg-white" id="about">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900">
              About <span className="text-primary">Massive Income Course</span>
            </h2>

            <p className="font-nunito text-lg text-gray-600 leading-relaxed">
              MIC is Africa&apos;s leading digital education platform, designed
              specifically for beginners who want to earn money online. We break
              down complex online business strategies into simple, actionable
              steps that anyone can follow using just a smartphone.
            </p>

            <p className="font-nunito text-lg text-gray-600 leading-relaxed">
              Our proven methods have helped thousands of students across Africa
              start their own profitable online businesses in affiliate
              marketing, graphic design, and e-book publishing.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg animate-fade-in">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                  alt="Coach Adams"
                  className="w-full h-full object-cover"
                  width={300}
                  height={300}
                  loader={({ src }) => src}
                  quality={80}
                />
              </div>

              <div>
                <h3 className="font-poppins font-semibold text-xl text-gray-900">
                  Coach Adams
                </h3>
                <p className="font-nunito text-gray-600 mt-2">
                  Digital entrepreneur with 8+ years of experience helping
                  Africans earn online.
                </p>
                <p className="font-nunito text-gray-600">
                  Founder of MIC and mentor to 5,000+ successful online earners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
