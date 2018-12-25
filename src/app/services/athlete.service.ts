import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Athlete } from '../models/athlete';

@Injectable({ providedIn: 'root' })
export class AthleteService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Athlete[]>(`${config.apiUrl}/athletes`);
    }

    getAthlete(athleteId: number) {
        return this.http.get<Athlete>(`${config.apiUrl}/athletes/${athleteId}`);
    }
}
