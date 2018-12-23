import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from '../activity.service';
import { CoachService } from '../coach.service';
import { Activity, Athlete } from '../models';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  currentUser: any = null;
  activities: Activity[];
  athletes: Athlete[] = null;
  toolbarTitle: string;
  selectedAthlete: Athlete = null;

  constructor(private router: Router,
    private activityService: ActivityService,
    private coachService: CoachService) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.toolbarTitle = this.currentUser.user.name;
    if (this.currentUser.user.rol === 'coach') {
      this.getCoachAthletes();
    } else {
      this.getAthleteActivities(this.currentUser.user.id);
    }
  }

  selectAthlete(athlete: Athlete) {
    this.selectedAthlete = athlete;
    this.toolbarTitle = athlete.name;
    this.getAthleteActivities(athlete.id);
  }

  clearAthlete() {
    this.toolbarTitle = this.currentUser.user.name;
    this.activities = null;
    this.selectedAthlete = null;
  }

  getCoachAthletes() {
    this.coachService.getCoachAthletes(this.currentUser.user.id).pipe(first()).subscribe(
      athletes => {
        this.athletes = athletes;
      },
      error => {
      });
  }

  getAthleteActivities(athleteId: number) {
    this.activityService.getAthleteActivities(athleteId).pipe(first()).subscribe(
      activities => {
        this.activities = activities;
      },
      error => {
      });
  }

  addActivity() {
    this.router.navigate(['/addActivity', { athleteId: this.selectedAthlete.id }]);
  }

}
