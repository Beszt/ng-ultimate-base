import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-api-promo-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './api-promo-card.component.html',
  styleUrls: ['./api-promo-card.component.scss'],
})
export class ApiPromoCardComponent {}
