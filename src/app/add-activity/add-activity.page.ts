import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ActivityService } from '../activity.service';
import { Activity, Discipline } from '../models';

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.page.html',
  styleUrls: ['./add-activity.page.scss'],
})
export class AddActivityPage implements OnInit {

  activityForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  defaultDatePicker: String = null;
  maxDatePicker: String = null;

  constructor( public toastController: ToastController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService) { }

  ngOnInit() {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    this.maxDatePicker = today.toISOString();
    this.defaultDatePicker = new Date().toISOString();

    this.activityForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required]
    });
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
       const discipline = new Discipline();
       discipline.id = 1;
       activity.description = this.f.description.value;
       activity.date = new Date(this.f.date.value);
       activity.discipline = discipline;

       this.loading = true;
       this.activityService.createActivity( +this.route.snapshot.paramMap.get('athleteId'), activity)
           .pipe(first())
           .subscribe(
               data => {
                   this.presentToast();
                   this.loading = false;
                   this.router.navigate(['/home']);
               },
               error => {
                   this.error = error;
                   this.loading = false;
               });
   }

   async presentToast() {
    const toast = await this.toastController.create({
      message: 'Your activity has been saved.',
      duration: 2000
    });
    toast.present();
  }

}
