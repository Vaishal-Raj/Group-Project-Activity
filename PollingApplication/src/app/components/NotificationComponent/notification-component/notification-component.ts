import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notificationService/notification-service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-component',
  imports: [CommonModule],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.css'
})
export class NotificationComponent {
  
  notification$ : Observable<string[]>;
  showNotifications: boolean = false;
   
  constructor(private notificationService:NotificationService){
    this.notification$ = this.notificationService.notification$;
  
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  clearAll(){
    this.notificationService.clearNotifications();
  }

}
