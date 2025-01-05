/**
 * WriteCareNotes.com
 * @fileoverview Pricing FAQ Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion/Accordion'

const faqs = [
  {
    question: 'How is pricing calculated?',
    answer: 'Our pricing is based on the number of residents in your care home and the features you need. We offer flexible plans that can be customized to your specific requirements.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: 'Is there a setup fee?',
    answer: "No, we don't charge any setup fees. Our team will help you get started and provide training at no additional cost.",
  },
  {
    question: 'Do you offer discounts for multiple homes?',
    answer: 'Yes, we offer special pricing for care home groups. Please contact our sales team for a custom quote.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards and direct debit payments. For enterprise plans, we can also arrange alternative payment methods.',
  },
  {
    question: 'Is there a minimum contract period?',
    answer: 'Our standard plans are billed monthly with no minimum contract. Enterprise plans may have custom terms based on your needs.',
  },
]

export function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to know about our pricing and plans.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Still have questions?{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  )
} 