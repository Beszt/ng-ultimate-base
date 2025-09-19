import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoAppComponent } from '../../../../shared/components/simple-layout/simple-layout.component';
import { LayoutCardComponent } from '../../../../shared/components/layout-card/layout-card.component';
import { FetchApiDemoComponent } from '../fetch-api-demo/fetch-api-demo.component';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, DemoAppComponent, LayoutCardComponent, FetchApiDemoComponent],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {}
