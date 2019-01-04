import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoachService } from '../services/coach.service';
import { NotificationService } from '../services/notification.service';
import { Activity, Athlete } from '../models';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  currentUser: any = null;
  activities: Activity[] = null;
  athletes: Athlete[] = null;
  toolbarTitle: string;
  selectedAthlete: Athlete = null;
  isUserCoach: Boolean = false;
  pendingNotifications: Number = 0;

  constructor(private router: Router,
    private coachService: CoachService,
    private notificationService: NotificationService) {}

  ionViewWillEnter() {
    this.pendingNotifications = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.toolbarTitle = this.currentUser.user.name;
    if (this.isUserCoach) {
      this.getCoachAthletes();
      this.getPendingNotifications();
    } else {
      this.router.navigate(['/activities', { athleteId: this.currentUser.user.id }]);
    }
  }

  ionViewWillLeave() {
    this.athletes = null;
  }

  selectAthlete(athlete: Athlete) {
    this.router.navigate(['/activities', { athleteId: athlete.id }]);
  }

  getCoachAthletes() {
    this.coachService.getCoachAthletes(this.currentUser.user.id).pipe(first()).subscribe(
      athletes => {
        this.athletes = athletes;
      },
      error => {
      });
  }

  getPendingNotifications() {
    this.notificationService.getCoachNotifications(this.currentUser.user.id).pipe(first()).subscribe(
      notifications => {
        this.pendingNotifications = notifications.length;
      },
      error => {
      });
  }

}
