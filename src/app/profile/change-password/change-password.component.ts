import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Rol } from 'src/app/models';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  @Input()
  public editMode: boolean = false;
  
  changePasswordForm: FormGroup;
  loading: boolean;
  currentUser: any = null;
  isUserCoach: boolean = false;

  constructor(public toastController: ToastController,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    }, { validator: this.newPasswordMismatchValidator });
    this.changePasswordForm.reset();
    this.loading = false;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.isUserCoach = this.currentUser.user.rol === Rol.COACH ? true : false;
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000
    });
    toast.present();
  }

  newPasswordMismatchValidator(c: AbstractControl): { invalid: boolean } {
    if (c.get('newPassword').value !== c.get('confirmNewPassword').value) {
      return { invalid: true };
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.changePasswordForm.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.changePasswordForm.invalid) {
      return;
    }
    this.loading = true;

    this.authenticationService.changePassword(this.currentUser.user.email, this.f.currentPassword.value, this.f.newPassword.value, this.isUserCoach, false)
      .then(
        data => {
          this.presentToast(`Your password was changed successfully`);
          this.changePasswordForm.reset();
          this.loading = false;
        },
        error => {
          this.presentToast(`Error trying to change your password: ${error}`);
          this.loading = false;
        });

  }

}
