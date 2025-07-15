import { Component, OnInit } from '@angular/core';
import { PollService } from '../../../../services/pollService/poll-service';
import { PollModel } from '../../../../models/pollModels';
import { MyPoll } from "../my-poll/my-poll";
import { Auth } from '../../../../services/authService/auth';

@Component({
  selector: 'app-my-polls',
  imports: [MyPoll],
  templateUrl: './my-polls.html',
  styleUrl: './my-polls.css'
})
export class MyPolls implements OnInit{

  
  polls:PollModel[]=[]
  nextPolls:PollModel[]=[]
  loading:boolean=false;
  pageIndex:number=1;
  pageSize:number=20;
  errorMessage:string='';
  creator:String='';
  constructor(private pollService:PollService,private auth:Auth){}
  ngOnInit(): void {
    this.auth.user$.subscribe({
      next:(res:any)=>{
        this.creator=res as string;
        console.log(this.creator);
      }
    })
    this.fetchPagedPolls();
  }

  fetchPagedPolls(){
    this.loading=true;
    this.pollService.getAllPagedPoles(this.pageIndex,this.pageSize)
    .subscribe({
      next:(res:any)=>{
        console.log(res);
        const resPolls = res?.$values;
        this.polls = resPolls.map((poll: any) => PollModel.fromJson(poll));
        this.polls=this.polls.filter((poll)=>poll.createdByUsername===this.creator)
              .sort((a:PollModel,b:PollModel)=> new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        console.log(`Displaying paged polls result : ${this.polls.length}`);
        this.loading=false;
      },
      error:(err)=>{
        console.log(err);
        this.errorMessage='Failed to load polls';
        this.loading=false;
      }
    });
    this.pollService.getAllPagedPoles(this.pageIndex+1,this.pageSize)
    .subscribe({
      next:(res:any)=>{
        const resPolls = res?.$values;
        this.nextPolls = resPolls.map((poll: any) => PollModel.fromJson(poll));
        this.nextPolls = this.nextPolls.filter((poll)=>poll.createdByUsername===this.creator)
                            .sort((a:PollModel,b:PollModel)=> new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

        console.log('next polls',this.nextPolls);
      }
    })
  }
  onEditPoll(pollId: number) {
    console.log('Edit poll:', pollId);
  }
  onDeletePoll(pollId: number) {
    console.log('Delete polls:', pollId);
    if(!pollId) return;
    this.loading=true;
    this.pollService.deletePoll(pollId).subscribe({
      next:(res:any)=>{
        this.polls.filter(p => p.id !== pollId);
        this.loading=false;
        this.pageIndex=1;this.pageSize=10;
        this.fetchPagedPolls();

      },
      error:(err)=>{
        console.error('Failed to delete poll:', err);
        this.loading = false;
        this.errorMessage = 'Could not delete poll.';

      }
    })
  }

  onViewResults($event: number) {
    console.log('view poll:', $event);
  }

  nextPage() {
    if(this.nextPolls.length>0){
      this.pageIndex++;
      this.fetchPagedPolls();
    }
  }

  prevPage() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.fetchPagedPolls();
    }
  }
}
