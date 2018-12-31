import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
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
  // @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  currentUser: any = null;
  activities: Activity[] = null;
  isUserCoach: Boolean = false;
  toolbarTitle: string;
  athlete: Athlete = null;
  page: number;
  pageSize: number;
  count: number;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private athleteService: AthleteService) {}

  ionViewWillEnter() {
    this.activities = [];
    this.page = 0;
    this.pageSize = 5;
    this.count = 1000;
    // This is not working, infiniteScroll won't work until the component is reinstanciated
    // this.infiniteScroll.disabled = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.getAthleteInfo(+this.route.snapshot.paramMap.get('athleteId'));
    this.getAthleteActivities();
    this.getCountAthleteActivities();
  }

  getAthleteActivities(eventScroll?) {
    this.activityService.getAthleteActivities(+this.route.snapshot.paramMap.get('athleteId'), { skip: this.page, take: 5})
      .pipe(first()).subscribe(
        activities => {
          this.activities = this.activities.concat(activities);
          if (eventScroll) {
            eventScroll.target.complete();
          }
        },
        error => {
        });
  }

  getCountAthleteActivities() {
    this.activityService.getCountAthleteActivities(+this.route.snapshot.paramMap.get('athleteId'))
      .pipe(first()).subscribe(
        count => {
          this.count = count;
        },
        error => {
        });
  }

  loadMoreActivities(eventScroll) {
    if (this.page < this.count) {
      this.page = this.page + this.pageSize;
      this.getAthleteActivities(eventScroll);
    } else {
      eventScroll.target.complete();
    }

    // if disabled, cant get enabled back so by now will leave it enabled and just not do anything
    /*
    if (this.page >= this.count) {
      eventScroll.target.disabled = true;
    }*/
  }

  getAthleteInfo(athleteId: number) {
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

  getActivityIcon(discipline: string) {
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
