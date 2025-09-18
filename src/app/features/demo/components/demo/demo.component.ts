import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DemoStore } from '../../state/demo.store';
@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent {
  readonly store = inject(DemoStore);
}
