import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ActivityService } from '../services/activity.service';
import { Activity, Discipline } from '../models';

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
  currentUser: any = null;
  isUserCoach: Boolean = false;

  constructor( public toastController: ToastController,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService) { }

  ngOnInit() {
    this.activityForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      discipline: ['', Validators.required]
    });

    this.initDisciplines();
  }

  ionViewWillEnter() {
    this.loading = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;

    this.activityId = +this.route.snapshot.paramMap.get('activityId');
    this.athleteId = +this.route.snapshot.paramMap.get('athleteId');
    this.selectedDate = new Date(this.route.snapshot.paramMap.get('selectedDate'));
    // this line is to avoid different timezones to change the chosen day
    this.selectedDate.setUTCDate(this.selectedDate.getDate());

    this.activityForm.reset();
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    this.maxDatePicker = today.toISOString();

    if ( Boolean(this.activityId) ) {
      this.editMode = false;
      this.activityService.getActivity( this.athleteId, this.activityId )
           .pipe(first())
           .subscribe(
              activity => {
                this.activity = activity;
                this.activityForm.patchValue({
                  discipline: this.disciplines.find(i => i.id === activity.discipline.id),
                  description: activity.description,
                  date: new Date(activity.date).toISOString()
                });
              },
              error => {
                this.presentToast(error);
              });
    } else {
      this.editMode = true;
      this.activityForm.patchValue({
        discipline: this.disciplines[0],
        date: this.selectedDate.toISOString()
      });
    }

  }

  initDisciplines() {
    // TODO get disciplines from DB when API is ready
    this.disciplines = [
      {
        id : 1,
        name : 'swimming'
      },
      {
        id : 2,
        name : 'cycling'
      },
      {
        id : 3,
        name : 'running'
      },
      {
        id : 4,
        name : 'fitness'
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
      if ( Boolean(this.activityId) ) {
        this.activityService.updateActivity(this.athleteId, this.activityId, activity)
          .pipe(first())
          .subscribe(
              data => {
                this.onSubmitSuccess();
              },
              error => {
                this.onSubmitError(error);
              });
      } else {
        this.activityService.createActivity(this.athleteId, activity)
          .pipe(first())
          .subscribe(
              data => {
                this.onSubmitSuccess();
              },
              error => {
                this.onSubmitError(error);
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

  async presentToast( message: string ) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  deleteActivity() {
    this.activityService.deleteActivity(this.athleteId, this.activityId)
      .pipe(first())
      .subscribe(
        () => {
          this.presentToast('Your activity has been deleted.');
          this.backToActivities();
        },
        error => {
          this.presentToast(error);
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

}
