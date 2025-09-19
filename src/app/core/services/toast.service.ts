import { Injectable, inject } from '@angular/core';
import type { IndividualConfig } from 'ngx-toastr';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface TranslatedToastModel {
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  showSuccess(messageKey: string, params?: object, opts?: Partial<IndividualConfig>): void {
    const t = this.translateToast('success', messageKey, params);
    this.toastr.success(t.message, t.title, opts);
  }

  showError(messageKey: string, params?: object, opts?: Partial<IndividualConfig>): void {
    const t = this.translateToast('error', messageKey, params);
    this.toastr.error(t.message, t.title, opts);
  }

  showInfo(messageKey: string, params?: object, opts?: Partial<IndividualConfig>): void {
    const t = this.translateToast('info', messageKey, params);
    this.toastr.info(t.message, t.title, opts);
  }

  showWarn(messageKey: string, params?: object, opts?: Partial<IndividualConfig>): void {
    const t = this.translateToast('warning', messageKey, params);
    this.toastr.warning(t.message, t.title, opts);
  }

  private translateToast(kind: ToastKind, key: string, params?: object): TranslatedToastModel {
    const title = this.translate.instant(`TOAST.${kind}`) as string;
    let message = this.translate.instant(key, params) as string;

    if (!message || message === key) {
      message = key;
    }

    return { title, message };
  }
}
