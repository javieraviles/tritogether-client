import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Activity } from '../models';

@Injectable({ providedIn: 'root' })
export class ActivityService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Activity[]>(`${config.apiUrl}/athletes`).toPromise();
    }

    getActivity(athleteId: number, activityId: number) {
        return this.http.get<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`).toPromise();
    }

    getAthleteActivities(athleteId: number, params?) {
        return this.http.get<Activity[]>(`${config.apiUrl}/athletes/${athleteId}/activities`, { params: params }).toPromise();
    }

    createActivity(athleteId: number, activity: Activity) {
        return this.http.post<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities`, activity).toPromise();
    }

    updateActivity(athleteId: number, activityId: number, activity: Activity) {
        return this.http.put<Activity>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`, activity).toPromise();
    }

    deleteActivity(athleteId: number, activityId: number) {
        return this.http.delete<void>(`${config.apiUrl}/athletes/${athleteId}/activities/${activityId}`).toPromise();
    }
}
