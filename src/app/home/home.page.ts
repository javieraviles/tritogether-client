import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { CoachService } from '../coach.service';
import { Activity } from '../models';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  currentUser: any = null;
  activities: Activity[];

  constructor(private activityService: ActivityService,
    private coachService: CoachService) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser.user.rol === 'coach') {
      this.coachService.getCoachAthletes(this.currentUser.user.id).pipe(first()).subscribe(
          athletes => {
            this.activityService.getAthleteActivities(athletes[0].id).pipe(first()).subscribe(
              activities => {
                this.activities = activities;
              },
              error => {
              });
          },
          error => {
          });
    } else {
      this.activityService.getAthleteActivities(this.currentUser.user.id).pipe(first()).subscribe(
        activities => {
          this.activities = activities;
        },
        error => {
        });
    }
  }

}