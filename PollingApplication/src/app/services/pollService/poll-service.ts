import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreatePollDto } from '../../models/create-poll.model';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  baseUrl:string ='http://localhost:5000/api/Poll'; 

  constructor(private httpClient:HttpClient) { }

  formHeader():HttpHeaders{
    var token=sessionStorage.getItem('accessToken');

    return new HttpHeaders({
      'Authorization':`Bearer ${token}`
    });
  }

  getAllPoles(){
    return this.httpClient.get(this.baseUrl,{headers:this.formHeader()});

  }

  getPollById(id:number){
    return this.httpClient.get(`${this.baseUrl}/${id}`,{headers:this.formHeader()});
  }
  createPoll(body:CreatePollDto){
      
      return this.httpClient.post(`${this.baseUrl}/Create-polls`,body,{headers:this.formHeader()});
  }  

  getAllPagedPoles(pageIndex:number=1,pageSize:number=10){
      return this.httpClient.get(`${this.baseUrl}/paged?pageIndex=${pageIndex}&pageSize=${pageSize}`,{
        headers:this.formHeader()
      }) 
  }

  updatePoll(id:number,updatedData : CreatePollDto){
    return this.httpClient.put(`${this.baseUrl}/${id}`,updatedData,{headers:this.formHeader()});
  }
  deletePoll(id:number){
    return this.httpClient.delete(`${this.baseUrl}/${id}`,{headers:this.formHeader()});
  }
}
