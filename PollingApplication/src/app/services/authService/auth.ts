import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RegisterRequest } from '../../models/RegisterModels';
import { LoginRequest } from '../../models/LoginModels';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private baseUrl='http://localhost:5000/api/Authentication';
  private loggedInUser = new BehaviorSubject<string|null>(null);
  private profilePic = new BehaviorSubject<string|null>(null);
  private role = new BehaviorSubject<string | null>(null);
  private signInType = new BehaviorSubject<string|null>(null);
  private tokenTimer :any;
  user$ : Observable<string | null> =this.loggedInUser.asObservable();
  profilePicture$ :Observable<string | null> = this.profilePic.asObservable();
  role$ :Observable<string|null> = this.role.asObservable();
  signInType$:Observable<string|null> = this.signInType.asObservable();

  constructor(private httpClient:HttpClient,private route:Router) { 
    console.log('base url auth ' ,this.baseUrl);
    const token = sessionStorage.getItem('accessToken');
    const pic = sessionStorage.getItem('picture');
    const user = sessionStorage.getItem('username');
    const role = sessionStorage.getItem('Role');
    if (token && user) {
      this.loggedInUser.next(user);
      this.role.next(role);
      if(pic!==null)
        this.profilePic.next(pic);
      
    } else {
      this.loggedInUser.next(null);
      this.profilePic.next(null);
    }
  }


  register(data:RegisterRequest){
    return this.httpClient.post(`${this.baseUrl}/register`,data);
  }

  login(data:LoginRequest){
    sessionStorage.setItem('signInType','custom');
    this.signInType.next('custom');
    return this.httpClient.post(`${this.baseUrl}/login`,data);
  }

  setUser(username: string) {
    this.loggedInUser.next(username);
    sessionStorage.setItem('username', username);
  }

  setSignInType(type:string){
    this.signInType.next(type);
  }

  setPicture(pic: string | null) {
  this.profilePic.next(pic);
  if (pic) sessionStorage.setItem('picture', pic);
  }

  setRole(role:string){
    console.log(`Auth service setting role = ${role}`);
    this.role.next(role);
    sessionStorage.setItem('Role',role);
  }

  logout() {
    sessionStorage.clear();
    this.loggedInUser.next(null);
    this.profilePic.next(null);
    this.role.next(null);
  }

  // startTokenTimer(expiryDuration:number){
  //   console.log(`Inside token timer : recieved ${expiryDuration}`);
  //   if(this.tokenTimer) clearTimeout(this.tokenTimer);

  //   const promptTime = expiryDuration - (60*1000);
  //   console.log(`Prompt duration = ${promptTime}`);
  //   this.tokenTimer = setTimeout(()=>{
      
  //     const userConfirmed = window.confirm("Your session is about to expire. Do you want to extend your session ?");
  //     if(userConfirmed){
  //         this.useRefreshToken().subscribe({
  //           next:((res:any)=>{
  //             console.log(`Auth service : ${res}`);
  //             const newExpiry = res.expiry*60*1000;
  //             sessionStorage.setItem('accessToken', res.accessToken);
  //             sessionStorage.setItem('refreshToken', res.refreshToken);
  //             sessionStorage.setItem('tokenExpiry', (Date.now() + newExpiry).toString());
  //             this.startTokenTimer(newExpiry);
  //           }),
  //           error:(err)=>{
  //             alert("Session could not be extended. Please login again.");
  //             this.route.navigate(['logout']);
  //           }
  //         })
  //     }
  //     else{
  //       this.route.navigate(['logout']);
  //     }
  //   },promptTime);
  // }
  
  startTokenTimer(expiryDuration:number){
    console.log(`Inside token timer : recieved ${expiryDuration}`);
    if(this.tokenTimer) clearTimeout(this.tokenTimer);

    const promptTime = expiryDuration - (60*1000);
    console.log(`Prompt duration = ${promptTime}`);
    this.tokenTimer = setTimeout(()=>{
      const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
          });
          swalWithBootstrapButtons.fire({
            title: "Your session is about to expire. Do you want to extend your session ?",
            text: "You won't be able to revert this!",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes, extend my session",
            cancelButtonText: "No, cancel!",
            reverseButtons: true
          }).then((result) => {
            if (result.isConfirmed) {
              this.useRefreshToken().subscribe({
                next:((res:any)=>{
                  console.log(`Auth service : ${res}`);
                  const newExpiry = res.expiry*60*1000;
                  sessionStorage.setItem('accessToken', res.accessToken);
                  sessionStorage.setItem('refreshToken', res.refreshToken);
                  sessionStorage.setItem('tokenExpiry', (Date.now() + newExpiry).toString());
                  this.startTokenTimer(newExpiry);
                  swalWithBootstrapButtons.fire({
                    title: "Success!",
                    text: "Your session has been extended.",
                    icon: "success"
                  });
                }),
                error:(err)=>{
                  alert("Session could not be extended. Please login again.");
                  swalWithBootstrapButtons.fire({
                    title: "Error!",
                    text: "There was some error, could not extend session",
                    icon: "error"
                  });
                  this.route.navigate(['logout']);
                }
              })
              
            } else if (
              
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
              
            ) {
              swalWithBootstrapButtons.fire({
                
                title: "Cancelled",
                text: "Your session has ended, Sign-in again :)",
                icon: "error"
              }).then(()=>{
                this.route.navigate(['logout']);
              });
            }
          });
    },promptTime);
  }

  formHeader():HttpHeaders{
    var token=sessionStorage.getItem('accessToken');

    return new HttpHeaders({
      'Authorization':`Bearer ${token}`
    });
  }
  useRefreshToken(){
    const token = sessionStorage.getItem('refreshToken');
    return this.httpClient.post(`${this.baseUrl}/new-refresh-token`,{refreshToken:token},{headers:this.formHeader()});
  }

  confirmPassword(password:string){
    return this.httpClient.post(`${this.baseUrl}/confirm-password`,{password},{headers:this.formHeader()});
  }
  
}
