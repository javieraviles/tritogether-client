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

    getCoach(coachId: number) {
        return this.http.get<Coach>(`${config.apiUrl}/coaches/${coachId}`);
    }

    getCoachAthletes(coachId: number) {
        return this.http.get<Athlete[]>(`${config.apiUrl}/coaches/${coachId}/athletes`);
    }

    createCoach(coach: Coach) {
        return this.http.post<Coach>(`${config.apiUrl}/coaches`, coach);
    }

    updateCoach(coachId: number, coach: Coach) {
        return this.http.put<Coach>(`${config.apiUrl}/coaches/${coachId}`, coach);
    }
}
