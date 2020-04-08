import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { config } from '../config';

import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    constructor(private http: HttpClient) { }

    getAthleteNotifications(athleteId: number) {
        return this.http.get<Notification[]>(`${config.apiUrl}/athletes/${athleteId}/notifications`);
    }

    getCoachNotifications(coachId: number) {
        return this.http.get<Notification[]>(`${config.apiUrl}/coaches/${coachId}/notifications`);
    }

    createNotification(athleteId: number, notification: Notification) {
        return this.http.post<Notification>(`${config.apiUrl}/athletes/${athleteId}/notifications`, notification);
    }

    updateNotification(athleteId: number, notificationId: number, notification: Notification) {
        return this.http.put<Notification>(`${config.apiUrl}/athletes/${athleteId}/notifications/${notificationId}`, notification);
    }
}
