import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiService, ValidationResponse } from '../service/api.service';
import { map, Observable } from 'rxjs';

export function isInArrayValidator(arr: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = arr.includes(control.value);
    return forbidden ? null : { forbiddenName: 'Please provide a correct Country' };
  };
}

export function isAvailableUsername(apiService: ApiService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return apiService.validateUserName(control.value).pipe(
            map((result: ValidationResponse) => {
                return result.isAvailable ? null : { forbiddenName: 'Please provide a correct Username' };
            })
        );
    };
}
