import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Activity } from '../models';

@Injectable({ providedIn: 'root' })
export class ActivityService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Activity[]>(`${config.apiUrl}/athletes`);
    }

    getAthleteActivities(athleteId: number) {
        return this.http.get<Activity[]>(`${config.apiUrl}/athletes/${athleteId}/activities`);
    }

    createActivity(athleteId: number, activity: Activity) {
        return this.http.post<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities`, activity);
    }
}
