import { Directive, ElementRef, HostListener, input, Input, InputSignal } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  appTooltip: InputSignal<string> = input.required();
  tooltipPlacement: InputSignal<string> = input('top');
  private tooltipElement: HTMLElement | null = null;

  constructor(private elementRef: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.createTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.removeTooltip();
  }

  private createTooltip() {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement('div');
      this.tooltipElement.classList.add('custom-tooltip'); // Bootstrap classes
      this.tooltipElement.setAttribute('role', 'tooltip');
      this.tooltipElement.textContent = `${this.appTooltip()}`;

      document.body.appendChild(this.tooltipElement);

      const popper = (window as any).Popper;

      if (typeof window !== 'undefined' && popper) {
        popper.createPopper(this.elementRef.nativeElement, this.tooltipElement, {
          placement: this.tooltipPlacement(),
        });
      } else {
        console.warn('Popper.js is not included. Tooltips might not be positioned correctly.');
      }
    }
  }

  private removeTooltip() {
    if (this.tooltipElement) {
      document.body.removeChild(this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
