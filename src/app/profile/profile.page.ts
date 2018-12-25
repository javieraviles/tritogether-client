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
  rol: String = '';
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

  resetProfile() {
    this.editMode = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.rol = this.currentUser.user.rol;
    this.getUserInfo();
    this.userForm.reset();
    this.loading = false;
  }

  getUserInfo() {
    if (this.rol === 'coach') {
      this.coachService.getCoach(+this.currentUser.user.id).pipe(first()).subscribe(
        coach => {
          this.currentUser = coach;
        },
        error => {
        });
    } else {
      this.athleteService.getAthlete(+this.currentUser.user.id).pipe(first()).subscribe(
        athlete => {
          this.currentUser = athlete;
        },
        error => {
        });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.userForm.invalid) {
        return;
    }

    this.loading = true;
    if (this.rol === 'coach') {
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
    this.authenticationService.login(this.f.email.value, this.f.password.value, this.rol === 'coach' ? true : false)
      .pipe(first())
      .subscribe(
          data => {},
          error => {});
  }

  async onSubmitSuccess() {
    await this.refreshToken();
    this.resetProfile();
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
