import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Coach, Athlete } from '../models';

@Injectable({ providedIn: 'root' })
export class CoachService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Coach[]>(`${config.apiUrl}/coaches`);
    }

    getCoachAthletes(coachId: number) {
        return this.http.get<Athlete[]>(`${config.apiUrl}/coaches/${coachId}/athletes`);
    }
}
