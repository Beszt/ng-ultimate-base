import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-layout-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layout-card.component.html',
  styleUrls: ['./layout-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutCardComponent {
  @Input() title = '';
  @Input() description = '';
}
