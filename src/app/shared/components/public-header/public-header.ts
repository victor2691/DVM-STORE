import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-public-header',
  imports: [MatToolbarModule, MatButtonModule, RouterModule,MatIconModule],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
})
export class PublicHeader {}
