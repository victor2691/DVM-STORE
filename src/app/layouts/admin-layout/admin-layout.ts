import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, MatToolbarModule, MatButtonModule],
  template: `
    <div class="admin-content">
      <router-outlet />
    </div>
  `,
  styles: `
    .admin-content {
      min-height: 100vh;
      background: #f5f7fa;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {}
