import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private hubConnection:signalR.HubConnection | null = null;
  private notificationsKey = 'poll_notifications';
  private notificationSubject = new BehaviorSubject<any[]>(this.loadlNotification());
  notification$ = this.notificationSubject.asObservable();

  constructor() { 
    this.startConnection()
        ?.then(()=>{
          this.hubConnection?.on('PollCreated',(data)=>{
            console.log(data);
            this.addNotification(`${data.message}`);

          })
          this.hubConnection?.on('PollUpdated',(data)=>{
            console.log(data);
            this.addNotification(`${data.message}`);

          })
          this.hubConnection?.on('PollDeleted',(data)=>{
            console.log(data);
            this.addNotification(`${data.message}`);
          })
        }).catch(err=>console.log(err));
    
  }

  public startConnection(){
    if(this.hubConnection) return;
    this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5166/pollHub')
            .withAutomaticReconnect()
            .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('Notification Service SignalR Connection started');
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        throw err;
      });
  }

  private loadlNotification():string[]{
    const storage = sessionStorage.getItem(this.notificationsKey);
    return storage? JSON.parse(storage) : [];
  }

  private saveNotificationToStorage(notifs: string []){
    sessionStorage.setItem(this.notificationsKey,JSON.stringify(notifs));
  }
  private addNotification(message: string){
    const notifs = [...this.notificationSubject.value,message];
    this.notificationSubject.next(notifs);
    this.saveNotificationToStorage(notifs);

  }
  clearNotifications() {
    this.notificationSubject.next([]);
    localStorage.clear()
  }
}
