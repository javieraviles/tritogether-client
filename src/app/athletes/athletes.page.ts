import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { Athlete } from '../models';
import { AthleteService } from '../athlete.service';

@Component({
  selector: 'app-athletes',
  templateUrl: 'athletes.page.html',
  styleUrls: ['athletes.page.scss']
})
export class AthletesPage implements OnInit {
  private selectedItem: any;

  athletes: Athlete[] = [];
  constructor(private athleteService: AthleteService) {}

  ngOnInit() {
    this.athleteService.getAll().pipe(first()).subscribe(athletes => {
      this.athletes = athletes;
    });
  }
  // add back when alpha.4 is out
  // navigate(item) {
  //   this.router.navigate(['/list', JSON.stringify(item)]);
  // }
}
