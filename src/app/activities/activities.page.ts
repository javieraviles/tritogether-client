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
  monthActivities: Activity[] = null;
  todayActivities: Activity[] = null;
  isUserCoach: Boolean = false;
  toolbarTitle: string;
  athlete: Athlete = null;
  hasCoach: Boolean = true;
  selectedDate: string = new Date().toISOString().slice(0, 10);
  selectedMonth: string = this.selectedDate.slice(5, 7);
  calendarDate: string;
  calendarType: 'moment'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  calendarDaysConfig: DayConfig[] = [];
  calendarOptions: CalendarComponentOptions = {
    weekStart: 1,
    from: new Date('2019-01-01')
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private athleteService: AthleteService,
    public loadingController: LoadingController) { }

  async onDayChange($event) {
    this.selectedDate = $event.format('YYYY-MM-DD');
    // only refetch month activities if the month changed
    if (this.selectedMonth !== $event.format('MM')) {
      this.selectedMonth = $event.format('MM');
      this.getAthleteActivities(this.selectedDate);
    } else {
      this.getTodayActivitiesFromMonthActivities();
    }
  }

  async onMonthChange($event) {
    this.selectedDate = $event.newMonth.string;
    this.selectedMonth = this.selectedDate.slice(5, 7);
    this.getAthleteActivities(this.selectedDate);
  }

  ionViewWillEnter() {
    this.hasCoach = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.getAthleteInfo(+this.route.snapshot.paramMap.get('athleteId'));
    this.getAthleteActivities(this.selectedDate);
  }

  async getAthleteActivities(selectedDate: string) {
    const loading = await this.loadingController.create({
      message: 'Loading activities...',
      spinner: 'crescent'
    });
    loading.present();

    this.activityService.getAthleteActivities(+this.route.snapshot.paramMap.get('athleteId'),
      { month: this.selectedMonth })
      .pipe(first()).subscribe(
        async activities => {
          this.monthActivities = activities;
          this.calendarDaysConfig = [];

          let i = 0;
          while (i < this.monthActivities.length) {
            let j = i;
            let dayCss: string = this.monthActivities[i].discipline.name;
            // if same date as nexts activities, merge them if different
            while (this.monthActivities[j + 1] && this.monthActivities[j].date === this.monthActivities[j + 1].date) {
              if (this.monthActivities[j].discipline.name.indexOf(this.monthActivities[j + 1].discipline.name) < 0) {
                dayCss = dayCss.concat(` ${this.monthActivities[j + 1].discipline.name}`);
              }
              j++;
            }
            i = j;
            this.calendarDaysConfig.push({
              date: new Date(this.monthActivities[i].date),
              subTitle: `*`,
              cssClass: `${dayCss}`
            });

            i++;
          }
          this.getTodayActivitiesFromMonthActivities();

          this.calendarOptions = {
            weekStart: 1,
            from: new Date('2019-01-01'),
            daysConfig: this.calendarDaysConfig
          };

          // refresh selectedDate marker in calendar
          this.calendarDate = selectedDate;

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
    this.router.navigate(['/addActivity', { athleteId: this.athlete.id, selectedDate: this.selectedDate }]);
  }

  showActivity(activity: Activity) {
    this.router.navigate(['/addActivity', { activityId: activity.id,  athleteId: this.athlete.id }]);
  }

  getTodayActivitiesFromMonthActivities() {
    this.todayActivities = [];
    this.monthActivities.forEach( (activity) => {
      if (activity.date.toString() === this.selectedDate) {
        this.todayActivities.push(activity);
      }
    });
  }

  getActivityIcon(discipline: string) {
    switch (discipline) {
      case 'swimming':
        return 'swimming';
      case 'cycling':
        return 'bicycle';
      case 'running':
        return 'pitch';
      case 'other':
        return 'fire-station';
    }
  }

}
