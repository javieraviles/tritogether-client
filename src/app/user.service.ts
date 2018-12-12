import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from './config';

import { User } from './models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`${config.apiUrl}/users`);
    }
}
