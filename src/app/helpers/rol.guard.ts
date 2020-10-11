import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Rol } from '../models';

@Injectable({ providedIn: 'root' })
export class RolGuard implements CanActivate {

    currentUser: any;

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (this.currentUser.user.rol === Rol.COACH) {
            return true;
        }

        // not coach so redirect to activities page with the user id
        this.router.navigate(['/activities', { athleteId: this.currentUser.user.id }]);
        return false;
    }
}
