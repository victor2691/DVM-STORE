import { Component } from '@angular/core';
import { PublicHeader } from '../../shared/components/public-header/public-header';
import { PublicFooter } from '../../shared/components/public-footer/public-footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [PublicHeader,PublicFooter,RouterOutlet],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {}
