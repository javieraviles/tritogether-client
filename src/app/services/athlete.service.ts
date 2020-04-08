import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { config } from '../config';
import { Athlete, Coach } from '../models';

@Injectable({ providedIn: 'root' })
export class AthleteService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Athlete[]>(`${config.apiUrl}/athletes`);
    }

    getAthlete(athleteId: number) {
        return this.http.get<Athlete>(`${config.apiUrl}/athletes/${athleteId}`);
    }

    createAthlete(athlete: Athlete) {
        return this.http.post<Athlete>(`${config.apiUrl}/athletes`, athlete);
    }

    updateAthlete(athleteId: number, athlete: Athlete) {
        return this.http.put<Athlete>(`${config.apiUrl}/athletes/${athleteId}`, athlete);
    }

    updateAthleteCoach(athleteId: number, coach?: Coach) {
        return this.http.put<Athlete>(`${config.apiUrl}/athletes/${athleteId}/coach`, coach);
    }
}
