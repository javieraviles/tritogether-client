import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Athlete, Coach } from '../models';
import { AthleteService } from '../services/athlete.service';
import { CoachService } from '../services/coach.service';
import { AuthenticationService } from '../services/authentication.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userForm: FormGroup;
  currentUser: any = '';
  isUserCoach: Boolean = false;
  loading = false;
  submitted = false;
  error = '';
  editMode: Boolean = false;

  constructor( public toastController: ToastController,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private athleteService: AthleteService,
    private coachService: CoachService) { }

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === 'coach' ? true : false;
    this.currentUser = await this.getUserInfo();
    this.editMode = false;
    this.submitted = false;
    this.loading = false;
    this.userForm.patchValue({
      name: this.currentUser.name,
      email: this.currentUser.email,
      password: ''
    });
  }

  getUserInfo() {
    if (this.isUserCoach) {
      return this.coachService.getCoach(+this.currentUser.user.id).toPromise();
    } else {
      return this.athleteService.getAthlete(+this.currentUser.user.id).toPromise();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // stop here if form is invalid
    if (this.userForm.invalid) {
        return;
    }

    this.loading = true;
    if (this.isUserCoach) {
      const updatedUser: Coach = {
        name : this.f.name.value,
        email: this.f.email.value,
        password: this.f.password.value
      };

      this.coachService.updateCoach( +this.currentUser.id, updatedUser)
      .pipe(first())
      .subscribe(
          data => {
              this.onSubmitSuccess();
          },
          error => {
              this.onSubmitError(error);
          });
    } else {
      const updatedUser: Athlete = {
        name : this.f.name.value,
        email: this.f.email.value,
        password: this.f.password.value,
        coach: this.currentUser.coach
      };
      this.athleteService.updateAthlete( +this.currentUser.id, updatedUser)
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

  refreshToken() {
    return this.authenticationService.login(this.f.email.value, this.f.password.value, this.isUserCoach).toPromise();
  }

  async onSubmitSuccess() {
    await this.refreshToken();
    await this.resetProfile();
    this.presentToast();
  }

  onSubmitError(error: any) {
    this.error = error;
    this.loading = false;
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your profile has been updated.',
      duration: 2000
    });
    toast.present();
  }

}
