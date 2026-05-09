import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Producto } from '../../../core/models/mode_productos';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-banner.html',
  styleUrls: ['./hero-banner.css'],
})
export class HeroBanner {
@Input() producto!: Producto;
}

