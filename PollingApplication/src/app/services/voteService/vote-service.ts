import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoteDto } from '../../models/voteModels';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private baseUrl='http://localhost:5166/api/Vote';

  constructor(private http:HttpClient) { }

  generateHeader():HttpHeaders{
    const token = sessionStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization' : `Bearer ${token}`
    })
  }
  

  castVote(requestBody:VoteDto){
    return this.http.post(`${this.baseUrl}`,requestBody,{headers:this.generateHeader()});
  }

  removeVote(pollId:number){
    return this.http.delete(`${this.baseUrl}?pollId=${pollId}`,{headers:this.generateHeader()});
  }

  getMyVote(pollId: number) {
    return this.http.get(`${this.baseUrl}/myvote`, {
      params: { pollId },
      headers: this.generateHeader()
    });
  }

  getAllVotes(){
    return this.http.get(`${this.baseUrl}/all-votes`,{headers:this.generateHeader()});
  }
  getAllMyVotes(){
    return this.http.get(`${this.baseUrl}/my-votes`,{headers:this.generateHeader()});
  }

  getVotesByPoll(pollId:number){
    return this.http.get(`${this.baseUrl}/poll-votes?pollId=${pollId}`,{headers:this.generateHeader()});
  }
  

}
