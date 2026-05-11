import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/mode_productos';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner {
  producto = input.required<Producto>();
}

