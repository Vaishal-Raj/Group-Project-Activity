import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Signalr {

  private hubConnection:signalR.HubConnection | null = null;

  private voteUpdateSubject = new BehaviorSubject<any>(null);
  voteUpdate$=this.voteUpdateSubject.asObservable(); 

  private PollStatusSubject = new BehaviorSubject<any>(null);
  PollStatus$ = this.PollStatusSubject.asObservable();

  constructor() { }

  getConnection(): signalR.HubConnection | null {
    return this.hubConnection;
  }

  public startConnection() {
    if (this.hubConnection) return ;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5166/pollHub')
      .withAutomaticReconnect()
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR Connection started');
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        throw err;
      });
  }

  voteUpdateListener():void{
    if(!this.hubConnection) return

    this.removeVoteUpdateListener();
    this.hubConnection?.on('ReceiveVoteUpdate',(data:any)=>{
      this.voteUpdateSubject.next(data);
    });

  }
  PollStatusListener():void{
    this.hubConnection?.on('PollCreated',(data)=>{
        this.PollStatusSubject.next(data.message);
    });
    this.hubConnection?.on('PollUpdated',(data)=>{
        this.PollStatusSubject.next(data.message);
    });
    this.hubConnection?.on('PollDeleted',(data:any)=>{
        this.PollStatusSubject.next(data.message);
    });
  }

  removeVoteUpdateListener(): void {
    this.hubConnection?.off('ReceiveVoteUpdate');
  }
  public handleDisconnects = () => {
    this.hubConnection?.onclose(() => {
    console.log('Connection lost. Attempting to reconnect...');
    setTimeout(() => this.startConnection(), 3000);  // Try reconnecting after 3 seconds
  });
}
  joinPollGroup(pollId: number): void {
  if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
    console.warn('Connection not ready. Skipping join.');
    return;
  }

  this.hubConnection.invoke('JoinPollGroup', pollId.toString())
    .then(() => console.log(`Joined Poll-${pollId}`))
    .catch(err => console.error(err));
}


  leavePollGroup(pollId:number):void{
      this.hubConnection?.invoke('LeavePollGroup',pollId.toString())
      .catch(err=>console.log(err));

      console.log(`Left Poll-${pollId}`);
  }


}
