import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleLayoutComponent } from '../../../../shared/components/simple-layout/simple-layout.component';
import { FetchApiDemoComponent } from '../fetch-api-demo/fetch-api-demo.component';
import { StorageDemoComponent } from '../storage-demo/storage-demo.component';
import { SimpleLayoutCardComponent } from '../../../../shared/components/simple-layout-card/simple-layout-card.component';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    SimpleLayoutComponent,
    SimpleLayoutCardComponent,
    FetchApiDemoComponent,
    StorageDemoComponent,
  ],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent {}
