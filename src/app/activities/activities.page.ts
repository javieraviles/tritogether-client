import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../services/activity.service';
import { AthleteService } from '../services/athlete.service';
import { Activity, Athlete } from '../models';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage {

  currentUser: any = null;
  activities: Activity[] = null;
  isUserCoach: Boolean = false;
  toolbarTitle: String;
  athlete: Athlete = null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private athleteService: AthleteService) {}

  ionViewWillEnter() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.getAthleteInfo(+this.route.snapshot.paramMap.get('athleteId'));
    this.getAthleteActivities(+this.route.snapshot.paramMap.get('athleteId'));
  }

  ionViewWillLeave() {
    this.activities = null;
  }

  getAthleteActivities(athleteId: Number) {
    this.activityService.getAthleteActivities(athleteId).pipe(first()).subscribe(
      activities => {
        this.activities = activities;
      },
      error => {
      });
  }

  getAthleteInfo(athleteId: Number) {
    this.athleteService.getAthlete(athleteId).pipe(first()).subscribe(
      athlete => {
        this.athlete = athlete;
        this.toolbarTitle = this.athlete.name;
      },
      error => {
      });
  }

  addActivity() {
    this.router.navigate(['/addActivity', { athleteId: this.athlete.id }]);
  }

  showActivity(activity: Activity) {
    this.router.navigate(['/addActivity', { activityId: activity.id,  athleteId: this.athlete.id }]);
  }

  getActivityIcon(discipline: String) {
    switch (discipline) {
      case 'swimming':
        return 'water';
      case 'cycling':
        return 'bicycle';
      case 'running':
        return 'walk';
      case 'fitness':
        return 'fitness';
    }
  }

}
