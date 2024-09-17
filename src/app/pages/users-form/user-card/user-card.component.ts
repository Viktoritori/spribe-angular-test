import {
    Component,
    input,
    InputSignal,
    OnInit,
    output,
    OutputEmitterRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Country } from '../../../shared/enum/country';
import { NgbInputDatepicker, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { InputValidationDirective } from '../../../shared/directive/validation-directive';

export interface UserInfo {
    country: Country | null;
    username: string | null;
    birthday: string | null;
}

export interface UserInfoForm {
    country: FormControl<Country | null>;
    username: FormControl<string | null>;
    birthday: FormControl<string | null>;
}

@Component({
    selector: 'app-user-card',
    standalone: true,
    imports: [
        NgbTypeahead,
        ReactiveFormsModule,
        NgbInputDatepicker,
        InputValidationDirective
    ],
    templateUrl: './user-card.component.html',
    styleUrl: './user-card.component.scss'
})
export class UserCardComponent implements OnInit {
    userForm: InputSignal<FormGroup<UserInfoForm>> = input.required();

    change: OutputEmitterRef<void> = output();
    remove: OutputEmitterRef<void> = output();

    search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map((term: string) =>
                Object.values(Country).filter((v) =>
                    v.toLowerCase().indexOf(term.toLowerCase()) > -1),
            ),
        );
    currentDate = { year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDay() }

    removeFormGroup() {
        this.remove.emit();
    }

    ngOnInit() {
        this.userForm().valueChanges.subscribe(value => {
            this.change.emit();
        })
    }
}
