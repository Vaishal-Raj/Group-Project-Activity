import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core';
import { ThemeToggle } from "../../../theme-toggle/theme-toggle";
import { MatSidenavModule } from '@angular/material/sidenav';
import { ThemeService } from '../../../theme';
import {INavData, SidebarModule,SidebarNavComponent} from '@coreui/angular';
import { cilList, cilSpeedometer,cilUser, cilAccountLogout,cilPlus ,cilNotes,cilPeople} from '@coreui/icons';
import { IconModule,IconSetService } from '@coreui/icons-angular';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/authService/auth';
import Swal from 'sweetalert2';
import { NgOptimizedImage } from '@angular/common';
import { NotificationComponent } from "../../NotificationComponent/notification-component/notification-component";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  imports: [ThemeToggle, SidebarModule, SidebarNavComponent,
    IconModule, RouterLink, NgOptimizedImage, NotificationComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit{

user:string='';
role=signal<string>('');
showSideBar:boolean=false;
profile_pic:SafeUrl|null=null;
showImageModal = false;
signInType='';



 constructor(private iconSet:IconSetService,private themeService:ThemeService,
  private eRef: ElementRef,private authService:Auth,private route:Router,
  private sanitizer: DomSanitizer
 ){
  iconSet.icons={cilList, cilSpeedometer,cilUser, cilAccountLogout,cilPlus ,cilNotes,cilPeople};
 }

navItems: INavData[]|undefined = [];


openImageModal() {
  this.showImageModal = true;
}

closeImageModal() {
  this.showImageModal = false;
}
 toggleSideMenu():void{
  this.showSideBar=!this.showSideBar;
 }

  ngOnInit(): void {
    this.authService.user$.subscribe({
      next:(res:any)=>{
        this.user=res as string;
      }
    })
    this.authService.signInType$.subscribe(res=>{
      this.signInType=res as string;
    })
    this.authService.role$.subscribe({
      next:(res:any)=>{
        this.role.set(res as string);
        this.navItems = this.getNavItems(); 
        console.log(`Role (navbar) = ${this.role}`);
      },
      error:(err)=>console.log(err)
    })
    
    
    this.authService.profilePicture$.subscribe({
      next:(data:any)=>{
        console.log(`Setting google profile pic in navbar comp : ${data}`)
        this.profile_pic = this.sanitizer.bypassSecurityTrustUrl(data); // Bypass Angular's security
      }
    })
    if(!this.role){
      this.showSideBar=false;
    }
    
         
  }

  @HostListener('document:click',['$event'])
  onDocumentClick(event:MouseEvent){
    const clickedInside = this.eRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showSideBar) {
      this.showSideBar = false;
    }
  }
  
  handleNavClick(event: MouseEvent): void {
    const ele =event.target as HTMLElement;
    const itemName=ele.innerText;
    console.log(ele.innerText);
    if (itemName === 'Logout') {
      event.preventDefault();
      // const confirmed=confirm('Are you sure you want to logout?');
      // console.log(`confirmed = ${confirmed}`);
      // if(confirmed){
      //   this.route.navigate(['logout']);
      // }
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
      }).then((result) => {
        
        if (result.isConfirmed) {
          this.route.navigate(['logout']);
          swalWithBootstrapButtons.fire({
            title: "Logged out!!",
            text: "Your have logged out successfully.",
            icon: "success"
          });
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your session continues :)",
            icon: "error"
          }).then((res)=>{
            console.log(res);
          });
        }
      });

  }
}

 getNavItems(): INavData[] {
    

    const commonItems: INavData[] = [
      {
        name: 'Dashboard',
        url:'/dashboard',
        iconComponent: { name: 'cil-speedometer' },
        class:'custom-nav-item'
      },
      {
        name: 'All Polls',
        url: '/all-polls',
        iconComponent: { name: 'cil-list' },
        class:'custom-nav-item'
      },
      {
        name: 'Profile',
        url: '/profile',
        iconComponent: { name: 'cil-user' },
        class:'custom-nav-item'
      },
      {
        name: 'Logout',
        // url: '/logout',
        iconComponent: { name: 'cil-account-logout' },
        class:'custom-nav-item'
      }
    ];

    const adminItems: INavData[] = [
      {
        name: 'Dashboard',
        url:'/dashboard',
        iconComponent: { name: 'cil-speedometer' },
        class:'custom-nav-item'
      },
      {
        name: 'All Polls',
        url: '/all-polls',
        iconComponent: { name: 'cil-list' },
        class:'custom-nav-item'
      },
      {
        name: 'Profile',
        url: '/profile',
        iconComponent: { name: 'cil-user' },
        class:'custom-nav-item'
      },
      {
        name: 'Create Poll',
        url: '/create-poll',
        iconComponent: { name: 'cil-plus' },
        class:'custom-nav-item'
      },
      {
        name: 'My Polls',
        url: '/my-polls',
        iconComponent: { name: 'cil-notes' },
        class:'custom-nav-item'
      },
      {
        name: 'Logout',
        // url: '/logout',
        iconComponent: { name: 'cil-account-logout' },
        class:'custom-nav-item'
      }
    ];
    const SuperUserItems: INavData[] = [
      {
        name: 'Dashboard',
        url:'/dashboard',
        iconComponent: { name: 'cil-speedometer' },
        class:'custom-nav-item'
      },
      {
        name: 'All Polls',
        url: '/all-polls',
        iconComponent: { name: 'cil-list' },
        class:'custom-nav-item'
      },
      {
        name: 'Profile',
        url: '/profile',
        iconComponent: { name: 'cil-user' },
        class:'custom-nav-item'
      },
      {
        name: 'Create Poll',
        url: '/create-poll',
        iconComponent: { name: 'cil-plus' },
        class:'custom-nav-item'
      },
      {
        name: 'My Polls',
        url: '/my-polls',
        iconComponent: { name: 'cil-notes' },
        class:'custom-nav-item'
      },
      {
        name: 'Users',
        url: '/users',
        iconComponent: { name: 'cil-people' },
        class:'custom-nav-item'
      },
      {
        name: 'Add Moderators',
        url: '/register-moderator',
        iconComponent: { name: 'cil-people' },
        class:'custom-nav-item'
      },
      {
        name: 'Logout',
        // url: '/logout',
        iconComponent: { name: 'cil-account-logout' },
        class:'custom-nav-item'
      }
    ];
    if(this.role()==='Moderator')
      return adminItems;
    else if(this.role()==='SuperUser')
      return SuperUserItems;
    else
      return commonItems;
    
  }

  logout() {
    Swal.fire({
      title: "Do you want to sign-out",
      text: "Are you sure ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Sign out!"
    }).then((result) => {
      if (result.isConfirmed) {
        if(this.signInType==='google'){
          window.location.href = 'https://accounts.google.com/logout';
        }else{
          this.route.navigate(['logout']);
        }
        Swal.fire({
          title: "Signed Out",
          text: "You have logged out successfully.",
          icon: "success"
        });
      }
    });
    
  }
}
