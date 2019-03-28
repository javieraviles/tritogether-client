import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, MenuController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { AthleteService } from '../services/athlete.service';
import { CoachService } from '../services/coach.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: Boolean;
  submitted: Boolean;
  signupEnabled: Boolean;
  submitButtonLabel: string;
  clearButtonLabel: string;
  returnUrl: string;

  constructor( public toastController: ToastController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private athleteService: AthleteService,
    private coachService: CoachService,
    public menuController: MenuController) {}

  ngOnInit() {
      this.loginForm = this.formBuilder.group({
          name: ['', Validators.required],
          username: ['', Validators.required],
          password: ['', Validators.required],
          isCoach: [false]
      });
      // at first, only login is shown, so name won't be required until signup is enabled
      this.loginForm.controls['name'].disable();

      this.loading = false;
      this.submitted = false;
      this.signupEnabled = false;
      this.submitButtonLabel = 'Log In';
      this.clearButtonLabel = 'Sign Up';

      // reset login status
      this.authenticationService.logout();

      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  swapSignup() {
      this.signupEnabled = !this.signupEnabled;
      if (this.signupEnabled) {
        this.submitButtonLabel = 'Sign Up';
        this.clearButtonLabel = 'Cancel';
        this.loginForm.controls['name'].enable();
      } else {
        this.submitButtonLabel = 'Log In';
        this.clearButtonLabel = 'Sign Up';
        this.loginForm.controls['name'].disable();
      }
  }

  async presentToast( message: string ) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.loginForm.invalid) {
          return;
      }

      if (this.signupEnabled) {

        this.loading = true;
        if (!Boolean(this.f.isCoach.value)) {
            this.athleteService.createAthlete(
                {
                    'name': this.f.name.value,
                    'email': this.f.username.value,
                    'password': this.f.password.value
                })
                .pipe(first())
                .subscribe(
                    data => {
                        this.submitted = false;
                        this.swapSignup();
                        this.loginForm.reset();
                        this.presentToast('Athlete created, you can now log in');
                        this.loading = false;
                    },
                    error => {
                        this.presentToast(error);
                        this.loading = false;
                    });
        } else {
            this.coachService.createCoach(
                {
                    'name': this.f.name.value,
                    'email': this.f.username.value,
                    'password': this.f.password.value
                })
                .pipe(first())
                .subscribe(
                    data => {
                        this.submitted = false;
                        this.swapSignup();
                        this.loginForm.reset();
                        this.presentToast('Coach created, you can now log in');
                        this.loading = false;
                    },
                    error => {
                        this.presentToast(error);
                        this.loading = false;
                    });
        }
      } else {
        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value, this.f.isCoach.value)
          .pipe(first())
          .subscribe(
              data => {
                  this.router.navigate([this.returnUrl]);
                  this.loading = false;
              },
              error => {
                this.presentToast(error);
                this.loading = false;
              });
      }

  }
}
