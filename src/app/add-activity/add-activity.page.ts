import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
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
    this.activityForm = this.formBuilder.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      discipline: ['', Validators.required]
    });

    this.initDisciplines();
  }

  ionViewWillEnter() {
    this.activityForm.reset();

    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    this.maxDatePicker = today.toISOString();
    this.defaultDatePicker = new Date().toISOString();

    this.activityForm.patchValue({
      discipline: this.disciplines[0]
    });
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
       this.activityService.createActivity( +this.route.snapshot.paramMap.get('athleteId'), activity)
           .pipe(first())
           .subscribe(
               data => {
                   this.presentToast();
                   this.loading = false;
                   this.backToActivities();
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
