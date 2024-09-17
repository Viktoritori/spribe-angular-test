import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInfo } from '../../pages/users-form/user-card/user-card.component';

export interface ValidationResponse {
  isAvailable: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {
  }

  validateUserName(username: string): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>('/api/checkUsername', { username });
  }

  submitForms(usersInfo: UserInfo[]): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>('/api/submitForm', { usersInfo });
  }
}
