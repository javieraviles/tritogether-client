import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, MenuController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'password-reset-activity',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {

  forgotPasswordForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  gotTmpCode: boolean;
  submitLabel: string;
  swapEnterCodeLabel: string;

  constructor(public toastController: ToastController,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    public menuController: MenuController) { }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      username: ['', Validators.required],
      tmpCode: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatNewPassword: ['', Validators.required],
      isCoach: [false]
    });
  }
  
  ionViewWillEnter() {
    this.loading = false;
    this.submitted = false;
    this.gotTmpCode = true;
  
    this.swapEnterCode();
  
    if (Boolean(this.route.snapshot.paramMap.get('temporaryCode'))) {
      this.forgotPasswordForm.controls['username'].setValue(this.route.snapshot.paramMap.get('email'));
      this.forgotPasswordForm.controls['tmpCode'].setValue(this.route.snapshot.paramMap.get('temporaryCode'));
      this.swapEnterCode();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }

  backToLogIn() {
    this.forgotPasswordForm.reset();
    this.router.navigate(['/login']);
  }

  swapEnterCode() {
    this.gotTmpCode = !this.gotTmpCode;
    if (this.gotTmpCode) {
      this.swapEnterCodeLabel = "Cancel";
      this.forgotPasswordForm.controls['tmpCode'].enable();
      this.forgotPasswordForm.controls['newPassword'].enable();
      this.forgotPasswordForm.controls['repeatNewPassword'].enable();
    } else {
      this.swapEnterCodeLabel = "Got the code";
      this.forgotPasswordForm.controls['tmpCode'].disable();
      this.forgotPasswordForm.controls['newPassword'].disable();
      this.forgotPasswordForm.controls['repeatNewPassword'].disable();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.forgotPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.loading = true;
    if (this.gotTmpCode) {
      if (this.f.newPassword.value != this.f.repeatNewPassword.value) {
        this.presentToast(`Both passwords must be the same`);
        this.loading = false;
        return;
      }
      this.authenticationService.changePassword(this.f.username.value, this.f.tmpCode.value, this.f.newPassword.value, this.f.isCoach.value, true)
        .then(
          data => {
            this.authenticationService.login(this.f.username.value, this.f.newPassword.value, this.f.isCoach.value)
              .then(
                data => {
                  console.log("its actually entering here");
                  this.router.navigate(['/home']);
                  this.presentToast(`Your password was reset successfully`);
                  this.forgotPasswordForm.reset();
                  this.loading = false;
                },
                error => {
                  this.presentToast(`Error trying to Log in: ${error}`);
                  this.loading = false;
                });
          },
          error => {
            this.presentToast(`Error trying to change your password: ${error}`);
            this.loading = false;
          });
    } else {
      this.authenticationService.resetPassword(this.f.username.value, this.f.isCoach.value)
        .then(
          data => {
            this.swapEnterCode();
            this.loading = false;
            this.presentToast(`We have emailed your temporary code`);
          },
          error => {
            this.presentToast(`Error trying to email your temporary code: ${error}`);
            this.loading = false;
          });
    }
  }

}
