import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, MenuController } from '@ionic/angular';
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
  registerEnabled: Boolean;
  submitButtonLabel: string;
  clearButtonLabel: string;
  returnUrl: string;

  constructor(public toastController: ToastController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private athleteService: AthleteService,
    private coachService: CoachService,
    public menuController: MenuController) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      isCoach: [false]
    });
    // at first, only login is shown, so name won't be required until register is enabled
    this.loginForm.controls['name'].disable();

    this.loading = false;
    this.submitted = false;
    this.registerEnabled = false;
    this.submitButtonLabel = 'Log In';
    this.clearButtonLabel = 'Register';

    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  swapRegister() {
    this.registerEnabled = !this.registerEnabled;
    if (this.registerEnabled) {
      this.submitButtonLabel = 'Register';
      this.clearButtonLabel = 'Cancel';
      this.loginForm.controls['name'].enable();
    } else {
      this.submitButtonLabel = 'Log In';
      this.clearButtonLabel = 'Register';
      this.loginForm.controls['name'].disable();
    }
  }

  forgotPassword() {
    this.loginForm.reset();
    this.router.navigate(['/passwordReset']);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
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
    this.loading = true;

    if (this.registerEnabled) {    

      if (!Boolean(this.f.isCoach.value)) {
        this.athleteService.createAthlete(
          {
            'name': this.f.name.value,
            'email': this.f.username.value,
            'password': this.f.password.value
          })
          .then(
            data => {
              this.submitted = false;
              this.swapRegister();
              this.loginForm.reset();
              this.presentToast('Athlete created, you can now log in');
              this.loading = false;
            },
            error => {
              this.presentToast(`An error happened trying to create an Athlete: ${error}`);
              this.loading = false;
            });
      } else {
        this.coachService.createCoach(
          {
            'name': this.f.name.value,
            'email': this.f.username.value,
            'password': this.f.password.value
          })
          .then(
            data => {
              this.submitted = false;
              this.swapRegister();
              this.loginForm.reset();
              this.presentToast('Coach created, you can now log in');
              this.loading = false;
            },
            error => {
              this.presentToast(`Error trying to create a Coach: ${error}`);
              this.loading = false;
            });
      }
    } else {
      this.authenticationService.login(this.f.username.value, this.f.password.value, this.f.isCoach.value)
        .then(
          data => {
            this.router.navigateByUrl(this.returnUrl);
            this.loading = false;
            this.loginForm.reset();
          },
          error => {
            this.presentToast(`An error happened trying to Log in: ${error}`);
            this.loading = false;
          });
    }

  }
}
