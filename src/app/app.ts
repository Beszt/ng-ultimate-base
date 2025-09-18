import { Component } from '@angular/core';

import { DemoComponent } from './features/demo/components/demo/demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DemoComponent],
  templateUrl: './app.compontent.html',
  styleUrls: ['./app.compontent.scss'],
})
export class App {}
