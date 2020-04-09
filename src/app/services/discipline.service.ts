import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Discipline } from '../models';

@Injectable({ providedIn: 'root' })
export class DisciplineService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Discipline[]>(`${config.apiUrl}/disciplines`).toPromise();
    }
}
