import { useState } from "react";

export const faqs = [
  {
    question: "What is shaktipat?",
    answer: `The word Shaktipat means the descent of the energy. It is an ancient yoga technique.<br /><br />
             In fact, it is the highest yoga technique, or the mother of all yoga techniques known to mankind. 
             In this, the supreme cosmic power itself is used as the technique on itself. 
             The energy from Guru travels to the disciple seeking initiation, awakening the energy lying dormant in the aspirant.`
  },
  {
    question: "What techniques are used in shaktipat?",
    answer: "Shaktipat can be done by a guru using any or a combination of the 4 techniques: sight, mantra, sankalp, and touch."
  },
  {
    question: "Who can seek initiation?",
    answer: "Anyone truly desirous of attaining self realization can seek deeksha. Please note it is not meant for gaining anything materialistic in nature like health, money, job, or relationships."
  },
  {
    question: "In case I am from a different religion, can I still be initiated?",
    answer: "Religion has nothing to do with initiation. This is pure spirituality. You may need to share which religion you belong to, but that has nothing to do with initiation whatsoever."
  },
  {
    question: "Who decides which person can be initiated or not?",
    answer: "The Guru's (Goddess Vartika's) decision is final and binding. The seeker cannot decide if they are a deserving candidate for deeksha."
  },
  {
    question: "What are the charges?",
    answer: "It is absolutely free of cost."
  },
  {
    question: "Can we enroll for long distance initiation?",
    answer: "Yes. Energy is not limited by the physical concepts of time and space. Anyone living anywhere can seek deeksha, provided they meet the criteria."
  },
  {
    question: "In case I want to donate some money what are the various modes of payment possible?",
    answer: "You can pay via the 'Donate to us' link on the homepage, bank transfer, Paytm, Google Pay, or other suitable modes."
  },
  {
    question: "Are there online meditation sessions happening?",
    answer: "Periodically we hold group meditation sessions online. After initiation, you can be a part of these."
  },
  {
    question: "How can I seek deeksha?",
    answer: "There are a few steps: first a telephonic discussion to assess your candidature, then a free ebook will be shared which you must read fully. Afterwards, a set of questions is answered and deeksha dates are decided."
  },
  {
    question: "How many days and hours are required for deeksha?",
    answer: "Deeksha is done over 3 days: approximately 1 hour on the first day and at least 30 minutes on each of the other 2 days."
  },
  {
    question: "Can the deeksha be taken during afternoon or evening hours?",
    answer: "No, deeksha is given only in the morning time for the seeker."
  },
  {
    question: "Does kundalini get awakened for sure after deeksha?",
    answer: "Yes, kundalini does get awakened for sure. Most people experience kriyas immediately, but some may not feel anything right away. In both cases the energy has awakened, though experiences vary."
  },
  {
    question: "What are few key things to be kept in mind when following this path?",
    answer: "Mainly exercise complete self surrender to the guru, have patience and perseverance. These will help you grow faster on this path."
  }
];


export default function FAQ({ theme }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const visibleFAQs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <section className={`py-12 px-6 md:px-24 ${theme?.bg || "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-6xl md:text-7xl font-light tracking-tight leading-tight mb-12 ${theme?.text || "text-gray-900"} font-petitformal`}>
            Frequently Asked Questions
          </h2>
          <p className={`text-sm md:text-base ${theme?.textMuted || "text-gray-600"}`}>
            Answers to common queries about Sreeshakti Patashram
          </p>
        </div>

        <div className="space-y-4">
          {visibleFAQs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-shadow duration-300 ${
                theme?.border ? "border-gray-300" : "border-gray-200"
              } hover:shadow-lg`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none ${
                  theme?.text || "text-gray-900"
                }`}
              >
                <span className="font-medium">{faq.question}</span>
                <span className="ml-4 transform transition-transform duration-300">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              <div
                className={`transition-all duration-500 ease-in-out px-6 overflow-hidden ${
                  openIndex === index ? "max-h-96 py-4" : "max-h-0"
                }`}
              >
                <p
                  className={`text-sm md:text-base ${theme?.textMuted || "text-gray-600"} leading-relaxed`}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          ))}
        </div>

        {faqs.length > 5 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                theme?.accent || "bg-green-500"
              } hover:${theme?.accentHover || "bg-green-600"} text-white`}
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}