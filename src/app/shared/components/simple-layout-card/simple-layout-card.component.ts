import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-layout-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-layout-card.component.html',
  styleUrls: ['./simple-layout-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleLayoutCardComponent {
  @Input() title = '';
  @Input() description = '';
}
