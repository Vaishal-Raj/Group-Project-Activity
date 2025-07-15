import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })

export class UserService {
  private baseUrl:string ='http://localhost:5000/api/users'; 


  formHeader():HttpHeaders{
    var token=sessionStorage.getItem('accessToken');

    return new HttpHeaders({
      'Authorization':`Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(this.baseUrl,{headers:this.formHeader()});
  }

  getUser(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`,{headers:this.formHeader()});
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}`, data,{headers:this.formHeader()});
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`,{headers:this.formHeader()});
  }
}
