import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { CoachService } from '../services/coach.service';
import { NotificationService } from '../services/notification.service';
import { Activity, Athlete, Rol } from '../models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  currentUser: any = null;
  activities: Activity[] = null;
  athletes: Athlete[] = null;
  selectedAthlete: Athlete = null;
  isUserCoach: Boolean = false;
  pendingNotifications: Number = 0;

  constructor(private router: Router,
    private coachService: CoachService,
    private notificationService: NotificationService,
    public loadingController: LoadingController,
    public toastController: ToastController) { }

  ionViewWillEnter() {
    // TODO restore inputs
    this.pendingNotifications = 0;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === Rol.COACH ? true : false;
    if (this.isUserCoach) {
      this.getCoachAthletes();
      this.getPendingNotifications();
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

  async getCoachAthletes() {
    const loading = await this.loadingController.create({
      message: 'Loading athletes...',
      spinner: 'crescent'
    });
    loading.present();

    await this.coachService.getCoachAthletes(this.currentUser.user.id).then(
      athletes => {
        this.athletes = athletes;

        loading.dismiss();
      },
      error => {
        this.presentToast(`An error happened trying to retrieve the list of Athletes: ${error}`);
        loading.dismiss();
      });

  }

  getPendingNotifications() {
    this.notificationService.getCoachNotifications(this.currentUser.user.id).then(
      notifications => {
        this.pendingNotifications = notifications.length;
      },
      error => {
        this.presentToast(`An error happened trying to retrieve notifications: ${error}`);
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
