import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { config } from '../config';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    constructor(private http: HttpClient, private router: Router) { }

    login(username: string, password: string, isCoach: boolean) {
        return this.http.post<any>(`${config.apiUrl}/signin`, { email: username, password: password, isCoach: isCoach })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.access_token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                return user;
            })).toPromise();
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.router.navigateByUrl('login');
    }

    resetPassword(username: string, isCoach: boolean) {
        return this.http.post<any>(`${config.apiUrl}/reset-password`, { 
            email: username, 
            isCoach: isCoach 
        }).toPromise();
    }

    changePassword(username: string, password: string, newPassword: string, isCoach: boolean, isTemporary: boolean) {
        return this.http.put<any>(`${config.apiUrl}/change-password`, { 
            email: username, 
            password: password, 
            newPassword: newPassword, 
            isCoach: isCoach, 
            isTemporary: isTemporary 
        }).toPromise();
    }
}
