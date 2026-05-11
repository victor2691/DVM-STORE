import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterModule,MatIconModule],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.css',
})
export class PublicFooter {
  year = new Date().getFullYear();
}
