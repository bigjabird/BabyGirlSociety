import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Collection {
  name: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-collections',
  imports: [RouterLink],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss'
})
export class CollectionsComponent {
  readonly collections: Collection[] = [
    {
      name: 'Faith Tees',
      description: 'Scripture-inspired graphics on premium cotton.',
      link: '/shop'
    },
    {
      name: 'New Arrivals',
      description: 'The latest drops — shop what just landed.',
      link: '/new-arrivals'
    },
    {
      name: 'Best Sellers',
      description: 'Community favorites you will reach for daily.',
      link: '/best-sellers'
    },
    {
      name: 'Accessories',
      description: 'Necklaces, bags, and finishing touches.',
      link: '/shop'
    }
  ];
}
