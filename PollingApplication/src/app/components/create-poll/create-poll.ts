import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PollService } from '../../services/pollService/poll-service';
import { CommonModule } from '@angular/common';
import { DashboardState } from '../../services/dashboardService/dashboard-state';
import { CreatePollDto } from '../../models/create-poll.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-poll',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './create-poll.html',
  styleUrl: './create-poll.css'
})
export class CreatePoll implements OnInit{

  pollForm:FormGroup = new FormGroup({});
  constructor(private pollService:PollService,private state:DashboardState,private router:Router){}

  ngOnInit(): void {
    this.formInit();
  }

  formInit():void{
    this.pollForm = new FormGroup({
      question : new FormControl('',[Validators.required]),
      options : new FormArray([
        new FormControl('',[Validators.required]),
        new FormControl('',[Validators.required])
      ]),
      startTime : new FormControl(null),
      endTime: new FormControl(null)
    });

  }



  get question(){return this.pollForm.get('question');}
  get options(){return this.pollForm.get('options') as FormArray;}

  get startTime(){return this.pollForm.get('startTime');}
  get endTime(){return this.pollForm.get('endTime');}

  addOption():void{
    this.options.push(new FormControl('',[Validators.required]));
  }

  removeOption(index:number):void{
    if(this.options.length>2){
      this.options.removeAt(index);
    }
  }

  submitPoll():void{
    console.log(this.pollForm.value);
    const formData = CreatePollDto.fromForm(this.pollForm.value);
    console.log(formData)
    this.pollService.createPoll(formData).subscribe({
      next:(res:any)=>{
        console.log(res);
        Swal.fire("Successfully created a poll");
        this.router.navigate(['dashboard']);
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }
}

