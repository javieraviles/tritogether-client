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

    getActivity(athleteId: Number, activityId: Number) {
        return this.http.get<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`);
    }

    getAthleteActivities(athleteId: Number) {
        return this.http.get<Activity[]>(`${config.apiUrl}/athletes/${athleteId}/activities`);
    }

    createActivity(athleteId: Number, activity: Activity) {
        return this.http.post<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities`, activity);
    }

    updateActivity(athleteId: Number, activityId: Number, activity: Activity) {
        return this.http.put<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`, activity);
    }

    deleteActivity(athleteId: Number, activityId: Number) {
        return this.http.delete<void>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`);
    }
}
