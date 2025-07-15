import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardState {

  private _totalPolls = new BehaviorSubject<number>(0);
  private _totalVotes = new BehaviorSubject<number>(0);
  private _myPolls = new BehaviorSubject<number>(0);
  private _recentPolls = new BehaviorSubject<any[]>([]);
  private _votesCast = new BehaviorSubject<any>(0);

  totalPolls$: Observable<number> = this._totalPolls.asObservable();
  totalVotes$: Observable<number> = this._totalVotes.asObservable();
  myPolls$: Observable<number> = this._myPolls.asObservable();
  recentPolls$: Observable<any[]> = this._recentPolls.asObservable();
  votesCast$: Observable<number> = this._votesCast.asObservable();

  setTotalPolls(count: number): void {
    this._totalPolls.next(count);
  }

  setTotalVotes(count: number): void {
    this._totalVotes.next(count);
  }

  setMyPolls(count: number): void {
    this._myPolls.next(count);
  }

  setRecentPolls(polls: any[]): void {
    this._recentPolls.next(polls);
  }

  setVotesCast(count: number) {
    this._votesCast.next(count);
  }

}
