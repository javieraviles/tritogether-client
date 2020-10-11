import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Athlete, Coach, Notification, NotificationStatus, Rol } from '../models';
import { AthleteService } from '../services/athlete.service';
import { CoachService } from '../services/coach.service';
import { AuthenticationService } from '../services/authentication.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userForm: FormGroup;
  currentUser: any = '';
  user: any = '';
  isUserCoach: Boolean = false;
  loading = false;
  submitted = false;
  editMode: Boolean = false;
  notifications: Notification[] = [];
  coaches: Coach[] = null;
  athletes: Athlete[] = null;

  constructor(private router: Router,
    public alertController: AlertController,
    public toastController: ToastController,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private athleteService: AthleteService,
    private coachService: CoachService,
    public loadingController: LoadingController) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ionViewWillEnter() {
    this.resetProfile();
  }

  async resetProfile() {
    const loading = await this.loadingController.create({
      message: 'Loading profile...',
      spinner: 'crescent'
    });
    loading.present();
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === Rol.COACH ? true : false;
    this.coaches = null;
    this.athletes = null;
    // if it is an athlete and has no coach, get all
    if (!this.isUserCoach && !this.currentUser.user.coach) {
      this.getAllCoaches();
    }
    if (this.isUserCoach) {
      this.getCoachAthletes();
    }
    this.getUserNotifications();
    this.user = await this.getUserInfo();
    this.editMode = false;
    this.submitted = false;
    this.loading = false;
    this.userForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      password: ''
    });
    loading.dismiss();
  }

  getUserInfo() {
    if (this.isUserCoach) {
      return this.coachService.getCoach(+this.currentUser.user.id);
    } else {
      return this.athleteService.getAthlete(+this.currentUser.user.id);
    }
  }

  getAllCoaches() {
    this.coachService.getAll().then(
      coaches => {
        this.coaches = coaches;
      },
      error => {
        this.presentToast(`An error happened trying to retrieve the list of Coaches: ${error}`);
      });
  }

  getCoachAthletes() {
    this.coachService.getCoachAthletes(this.currentUser.user.id).then(
      athletes => {
        this.athletes = athletes;
      },
      error => {
        this.presentToast(`An error happened trying to retrieve the list of Athletes: ${error}`);
      });
  }

  getUserNotifications() {
    if (this.isUserCoach) {
      this.notificationService.getCoachNotifications(+this.currentUser.user.id)
        .then(
          notifications => {
            this.notifications = notifications;
          },
          error => {
            this.presentToast(`An error happened trying to retrieve notifications: ${error}`);
          });
    } else {
      this.notificationService.getAthleteNotifications(+this.currentUser.user.id)
        .then(
          notifications => {
            this.notifications = notifications;
          },
          error => {
            this.presentToast(`An error happened trying to retrieve notifications: ${error}`);
          });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  async switchEditMode() {
    this.editMode = !this.editMode;
    this.userForm.controls['password'].setValue('');
    // if user cancels profile edition, restore default values he might have modified
    if(!this.editMode) {
      await this.resetProfile();
    }
  }

  profileSubmit(removeCoach: Boolean = false) {
    this.submitted = true;

    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    if (this.isUserCoach) {
      const updatedUser: Coach = {
        name: this.f.name.value,
        email: this.f.email.value,
        password: this.f.password.value
      };

      this.coachService.updateCoach(+this.currentUser.user.id, updatedUser)
        .then(
          data => {
            this.profileSubmitSuccess();
          },
          error => {
            this.profileSubmitError(`An error happened trying to update your profile information: ${error}`);
          });
    } else {
      const updatedUser: Athlete = {
        name: this.f.name.value,
        email: this.f.email.value,
        password: this.f.password.value,
        availability: this.user.availability,
        coach: removeCoach ? null : this.user.coach
      };
      this.athleteService.updateAthlete(+this.currentUser.user.id, updatedUser)
        .then(
          data => {
            this.profileSubmitSuccess();
          },
          error => {
            this.profileSubmitError(`An error happened trying to update your profile information: ${error}`);
          });
    }
  }

  refreshToken() {
    return this.authenticationService.login(this.f.email.value, this.f.password.value, this.isUserCoach);
  }

  async profileSubmitSuccess() {
    await this.refreshToken();
    await this.resetProfile();
    this.presentToast('Your profile has been updated.');
  }

  profileSubmitError(error: any) {
    this.presentToast(error);
    this.loading = false;
  }

  // this function will be triggered only by athletes
  // when clicking here, means they want to send a new notification to a coach
  requestCoaching(coach: Coach) {
    this.notificationService.createNotification(this.currentUser.user.id, { coach: coach })
      .then(
        data => {
          this.getUserNotifications();
          this.presentToast(`Coaching request sent to ${coach.name}.`);
        },
        error => {
          this.presentToast(`Could not send coaching request to ${coach.name}: ${error}`);
        });
  }

  async confirmCoachingAlert(notification) {
    const alert = await this.alertController.create({
      header: 'Coaching request',
      message: `${notification.athlete.name} sent you a coaching request`,
      buttons: [
        {
          text: 'Deny',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.rejectCoaching(notification);
          }
        }, {
          text: 'Approve',
          handler: () => {
            this.approveCoaching(notification);
          }
        }
      ]
    });

    await alert.present();
  }

  // this function will be triggered only by coaches
  // when clicking here, means an athlete sent them a coaching notification
  // which is pending and wants to approve it
  approveCoaching(notification: Notification) {
    notification.status = NotificationStatus.APPROVED;
    this.athleteService.updateAthleteCoach(notification.athlete.id, this.user)
      .then(
        athlete => {
          this.approveCoachingNotification(notification);
          this.presentToast(`You now coach ${notification.athlete.name}`);
        },
        error => {
          this.presentToast(`Could not approve coaching request from ${notification.athlete.name}: ${error}`);
        });
  }

  // this function will be triggered only by coaches
  // when entering here, means a coach doesn't want to
  // coach this athlete anymore
  async stopCoaching(athlete: Athlete) {
    this.loading = true;
    const AthletesCoach: Coach = {
      name: this.user.name,
      email: this.user.email,
      password: this.f.password.value
    };
    this.athleteService.updateAthleteCoach(athlete.id, AthletesCoach)
      .then(
        updatedAthlete => {
          this.getCoachAthletes();
          this.presentToast(`You are no longer coaching ${athlete.name}`);
          this.loading = false;
        },
        error => {
          this.presentToast(`Could not stop coaching ${athlete.name}: ${error}`);
          this.loading = false;
        });
  }

  // this function will be triggered only by coaches
  // when entering here, means a coach clicked on stop
  // coaching an athlete, which needs a confirmation
  async confirmStopCoaching(athlete: Athlete) {
    const alert = await this.alertController.create({
      header: 'Stop coaching',
      message: `Please confirm you want to stop coaching ${athlete.name}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            // do nothing
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.stopCoaching(athlete);
          }
        }
      ]
    });

    await alert.present();
  }

  approveCoachingNotification(notification: Notification) {
    this.notificationService.updateNotification(notification.athlete.id, notification.id, notification)
      .then(
        updatedNotification => {
          this.getUserNotifications();
          this.getCoachAthletes();
        },
        error => {
          this.presentToast(`An error happened trying to update your profile information: ${error}`);
        });
  }

  // this function will be triggered by both athletes and coaches
  // when clicking here, means an athlete sent a coach a coaching notification
  // which is pending and wants to reject it
  rejectCoaching(notification: Notification) {
    notification.status = NotificationStatus.REJECTED;
    this.notificationService.updateNotification(notification.athlete.id, notification.id, notification)
      .then(
        updatedNotification => {
          this.getUserNotifications();
          this.presentToast(`Coaching request rejected`);
        },
        error => {
          this.presentToast(`Could not reject coaching request: ${error}`);
        });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
