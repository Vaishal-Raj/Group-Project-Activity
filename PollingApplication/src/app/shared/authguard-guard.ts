import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn:'root'
})
export class AuthGuard implements CanActivate{
  constructor(private router:Router){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const isAuthenticated = sessionStorage.getItem('accessToken')?true:false;
    console.log(`found token ${isAuthenticated}`);
    if(!isAuthenticated){
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
  
}

@Injectable({
  providedIn:'root'
})
export class RouteGuard implements CanActivate{
  constructor(private router:Router){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    const token = sessionStorage.getItem('accessToken');
    const role = sessionStorage.getItem('Role');
    if (token && role === 'SuperUser') {
      return true;
    }
    this.router.navigate(['super-login']);
    return false;
  } 
}
