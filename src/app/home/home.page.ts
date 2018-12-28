import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoachService } from '../services/coach.service';
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
  toolbarTitle: String;
  selectedAthlete: Athlete = null;

  constructor(private router: Router,
    private coachService: CoachService) {}

  ionViewWillEnter() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.toolbarTitle = this.currentUser.user.name;
    if (this.currentUser.user.rol === 'coach') {
      this.getCoachAthletes();
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

}
