import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { ActivityService } from '../services/activity.service';
import { AthleteService } from '../services/athlete.service';
import { Activity, Discipline, Athlete, Rol } from '../models';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.page.html',
  styleUrls: ['./add-activity.page.scss'],
})
export class AddActivityPage implements OnInit {

  activityForm: FormGroup;
  disciplines: Discipline[];
  loading: Boolean = false;
  submitted: Boolean = false;
  maxDatePicker: string = null;
  editMode: Boolean = true;
  activityId: number = null;
  athleteId: number = null;
  selectedDate: Date = null;
  activity: Activity = null;
  athlete: Athlete = null;
  currentUser: any = null;
  isUserCoach: Boolean = false;
  availabilityAlert: Boolean = false;
  activityWeekdayName: string = null;

  constructor(public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private athleteService: AthleteService) { }

  ngOnInit() {
    this.activityForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      discipline: ['', Validators.required]
    });

    this.initDisciplines();
  }


  async ionViewWillEnter() {
    this.loading = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === Rol.COACH ? true : false;

    this.activityId = +this.route.snapshot.paramMap.get('activityId');
    this.athleteId = +this.route.snapshot.paramMap.get('athleteId');
    this.selectedDate = new Date(this.route.snapshot.paramMap.get('selectedDate'));
    // this line is to avoid different timezones to change the chosen day
    this.selectedDate.setUTCDate(this.selectedDate.getDate());

    await this.getAthlete();

    this.activityForm.reset();
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    this.maxDatePicker = today.toISOString();

    // if the parameter activityId is provided, the view is to visualize/edit an existing activity
    if (Boolean(this.activityId)) {
      this.editMode = false;
      await this.getActivity();
    } else {
      // else, the view is to create a new activity
      this.editMode = true;
      this.activityForm.patchValue({
        discipline: this.disciplines[0],
        date: this.selectedDate.toISOString()
      });
    }
    this.isAthleteAvailable();

  }

  private async getActivity() {
    const loading = await this.loadingController.create({
      message: 'Loading activity...',
      spinner: 'crescent'
    });
    loading.present();

    await this.activityService.getActivity(this.athleteId, this.activityId)
      .then(activity => {
        this.activity = activity;
        this.activityForm.patchValue({
          discipline: this.disciplines.find(i => i.id === activity.discipline.id),
          description: activity.description,
          date: new Date(activity.date).toISOString()
        });

        loading.dismiss();
      }, error => {
        this.presentToast(`An error happened trying to get Activity's information: ${error}`);
        loading.dismiss();
      });
  }

  private async getAthlete() {
    await this.athleteService.getAthlete(this.athleteId).then(
      athlete => this.athlete = athlete,
      error => {
        this.presentToast(`An error happened trying to retrieve Athlete's information: ${error}`);
      });
  }

  initDisciplines() {
    this.disciplines = [
      {
        id: 1,
        name: 'swimming'
      },
      {
        id: 2,
        name: 'cycling'
      },
      {
        id: 3,
        name: 'running'
      },
      {
        id: 4,
        name: 'other'
      }
    ];
  }

  backToActivities() {
    this.router.navigate(['/activities', { athleteId: +this.route.snapshot.paramMap.get('athleteId') }]);
  }

  // convenience getter for easy access to form fields
  get f() { return this.activityForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.activityForm.invalid) {
      return;
    }

    const activity = new Activity();
    activity.description = this.f.description.value;
    activity.date = new Date(this.f.date.value);
    activity.discipline = this.f.discipline.value;

    this.loading = true;

    // new activity or editing an existing one?
    if (Boolean(this.activityId)) {
      this.activityService.updateActivity(this.athleteId, this.activityId, activity)
        .then(
          data => {
            this.onSubmitSuccess();
          },
          error => {
            this.onSubmitError(`An error happened trying to update the Activity: ${error}`);
          });
    } else {
      this.activityService.createActivity(this.athleteId, activity)
        .then(
          data => {
            this.onSubmitSuccess();
          },
          error => {
            this.onSubmitError(`An error happened trying to create the Activity: ${error}`);
          });
    }
  }

  onSubmitSuccess() {
    this.presentToast('Your activity has been saved.');
    this.backToActivities();
  }

  onSubmitError(error: string) {
    this.presentToast(error);
    this.loading = false;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  deleteActivity() {
    this.activityService.deleteActivity(this.athleteId, this.activityId)
      .then(
        () => {
          this.presentToast('Your activity has been deleted.');
          this.backToActivities();
        },
        error => {
          this.presentToast(`An error happened trying to delete the Activity: ${error}`);
        });
  }

  async deleteActivityAlertConfirmation() {
    const deleteAlert = await this.alertController.create({
      header: 'Delete activity',
      message: 'Please confirm you want to delete the activity',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.deleteActivity();
          }
        }
      ]
    });

    await deleteAlert.present();
  }

  // an availability warning will tell the coach whether the athlete is
  // available for such day of the week. Should never appear for past activities
  isAthleteAvailable() {
    this.activityWeekdayName = moment(this.f.date.value).format('dddd');
    if (this.athlete.availability[this.activityWeekdayName.toLowerCase()] || moment(this.f.date.value).isBefore(moment().format("MM-DD-YYYY"))) {
      this.availabilityAlert = false;
    } else {
      this.availabilityAlert = true;
    }
  }

}
