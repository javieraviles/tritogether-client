import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ActivityService } from '../services/activity.service';
import { AthleteService } from '../services/athlete.service';
import { Activity, Athlete } from '../models';
import { first } from 'rxjs/operators';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage {
  currentUser: any = null;
  activities: Activity[] = null;
  isUserCoach: Boolean = false;
  toolbarTitle: string;
  athlete: Athlete = null;
  hasCoach: Boolean = true;
  selectedDate: string = new Date().toISOString().slice(0, 10);
  calendarDate: string;
  calendarType: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  /*_daysConfig: DayConfig[] = [{
    date: new Date(this.selectedDate),
    subTitle: `prueba`
  }];*/
  calendarOptions: CalendarComponentOptions = {
    weekStart: 1
    // daysConfig: this._daysConfig
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private athleteService: AthleteService,
    public loadingController: LoadingController) { }

  onChange($event) {
    this.selectedDate = $event.format('MM-DD-YYYY');
    this.getAthleteActivities();
  }

  ionViewWillEnter() {
    this.hasCoach = true;
    this.activities = [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.getAthleteInfo(+this.route.snapshot.paramMap.get('athleteId'));
    this.getAthleteActivities();
  }

  async getAthleteActivities(eventScroll?) {
    const loading = await this.loadingController.create({
      message: 'Loading activities...',
      spinner: 'crescent'
    });
    loading.present();

    this.activityService.getAthleteActivities(+this.route.snapshot.paramMap.get('athleteId'),
      { date: this.selectedDate })
      .pipe(first()).subscribe(
        async activities => {
          this.activities = activities;

          loading.dismiss();
        },
        error => {
        });
  }

  getAthleteInfo(athleteId: number) {
    this.athleteService.getAthlete(athleteId).pipe(first()).subscribe(
      athlete => {
        this.athlete = athlete;
        this.hasCoach = athlete.coach ? true : false;
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
