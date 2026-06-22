import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  readonly supportEmail = 'hello@babygirlsociety.com';
  readonly supportEmailHref = `mailto:${this.supportEmail}`;

  readonly items: FaqItem[] = [
    {
      question: 'How do I choose my size?',
      answer:
        'Each product page includes fit notes. When in doubt, size up for a relaxed look or contact us for guidance before ordering.'
    },
    {
      question: 'What is your shipping policy?',
      answer:
        'Orders ship within 3–5 business days. Free shipping is available on qualifying orders — check our promotions for current offers.'
    },
    {
      question: 'Can I return or exchange an item?',
      answer:
        'Unworn items in original condition may be returned within 14 days of delivery. Reach out to our team to start a return or exchange.'
    },
    {
      question: 'How do I care for my pieces?',
      answer:
        'Turn garments inside out, wash cold, and hang dry to preserve prints and fabric quality. Avoid high heat on embellished items.'
    },
    {
      question: 'Do you offer gift options?',
      answer:
        'Yes — many items ship in branded packaging perfect for gifting. Add a note at checkout and we will do our best to accommodate.'
    }
  ];
}
