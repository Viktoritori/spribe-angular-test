import { Component, signal, WritableSignal } from '@angular/core';
import { UserCardComponent, UserInfoForm } from './user-card/user-card.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Country } from '../../shared/enum/country';
import { isAvailableUsername, isInArrayValidator } from '../../shared/validators/validators';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, interval, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ApiService } from '../../shared/service/api.service';
import { TooltipDirective } from '../../shared/directive/tooltip.directive';

@Component({
    selector: 'app-users-form',
    standalone: true,
    imports: [UserCardComponent, FormsModule, ReactiveFormsModule, TooltipDirective],
    templateUrl: './users-form.component.html',
    styleUrl: './users-form.component.scss'
})
export class UsersFormComponent {
    userForms: WritableSignal<FormGroup<UserInfoForm>[]> = signal([this.createForm()]);

    invalidFormsCount: number = 0;
    countdown: WritableSignal<number> = signal(0);
    cancel$ = new Subject<void>();

    private readonly countdownTime = 5;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        toObservable(this.userForms).pipe(takeUntilDestroyed()).subscribe(res => {
            this.updateValidityCounter();
        })
    }

    submit() {
        this.countdown.set(this.countdownTime);
        this.userForms().forEach(form => {
            form.disable();
        })

        const countdown$ = interval(1000)
            .pipe(
                take(this.countdownTime),
                tap(() => {
                    this.countdown.update(() => this.countdown() - 1);
                }),
                filter(() => this.countdown() < 1),
                takeUntil(this.cancel$),
                switchMap((res) => {
                    const forms = this.userForms().map((form) => {
                        return {
                            ...form.getRawValue()
                        }
                    })

                    return this.apiService.submitForms(forms)
                })
            );

        countdown$.subscribe(() => {
                this.userForms().forEach(form => {
                    this.cancelSubmission();

                    form.reset();
                })
            }
        );
    }

    cancelSubmission() {
        this.userForms().forEach(form => {
            form.enable();
        })

        this.cancel$.next();
        this.countdown.set(0);
    }

    addForm() {
        if (this.userForms().length >= 10) {
            return;
        }

        this.userForms.update(values => [
            ...values, this.createForm()
        ]);
    }

    removeForm(index: number) {
        const forms = this.userForms();

        forms.splice(index, 1);

        this.userForms.update(values => [...forms]);
    }

    updateValidityCounter() {
        const userForms = this.userForms();

        this.invalidFormsCount = userForms.filter(formGroup => !formGroup.valid).length;
    }

    createForm() {
        return this.fb.group({
            country: new FormControl<Country | null>(null, [Validators.required, isInArrayValidator(Object.values(Country))]),
            username: new FormControl<string | null>(null, [Validators.required], [isAvailableUsername(this.apiService)]),
            birthday: new FormControl<string | null>(null, [Validators.required]),
        })
    }
}
