import { Directive, ElementRef, HostListener, input, InputSignal, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    standalone: true,
    selector: '[inputValidation]'
})
export class InputValidationDirective implements OnInit, OnDestroy {
    errorMessage: InputSignal<string | undefined> = input();
    private errorMessageElement: HTMLElement | null = null;

    statusChangeSubscription?: Subscription;

    constructor(private el: ElementRef,
                private ngControl: NgControl) {
    }

    @HostListener('blur') onBlur() {
        const control = this.ngControl.control;

        if (!control) {
            return;
        }

        if (control.value == null || control.value == '') {
            this.ngControl.errors ? this.showError() : this.removeError();
        }
    }

    ngOnInit(): void {
        this.formControlStatusChange();
    }

    formControlStatusChange(){
        this.statusChangeSubscription = this.ngControl.control?.statusChanges?.subscribe(
            (status) => {
                status == 'INVALID' ?  this.showError() : this.removeError();
            }
        )
    }

    ngOnDestroy() {
        this.statusChangeSubscription?.unsubscribe();
    }

    private showError() {
        const errors = this.ngControl.control?.errors;

        if (!errors) {
            return;
        }

        if (!this.errorMessageElement) {
            this.el.nativeElement.classList.add('is-invalid');

            this.errorMessageElement = document.createElement('div');
            this.errorMessageElement.textContent = errors['forbiddenName'] ?? this.errorMessage();
            this.errorMessageElement.classList.add('invalid-feedback');

            this.el.nativeElement.parentNode.appendChild(this.errorMessageElement);
        }
    }

    private removeError() {
        if (this.errorMessageElement) {
            this.el.nativeElement.classList.remove('is-invalid');

            this.errorMessageElement.remove();
            this.errorMessageElement = null;
        }
    }
}
