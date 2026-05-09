import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginVisualModule } from './login-visual.module';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginVisualModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {}