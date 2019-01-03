import { Coach, Athlete, NotificationStatus } from '.';

export class Notification {
    id?: number;
    status?: NotificationStatus;
    athlete?: Athlete;
    coach: Coach;
}
