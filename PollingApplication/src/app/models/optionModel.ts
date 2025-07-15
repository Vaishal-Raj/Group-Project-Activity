export class Option{
    constructor(
        public id:number=0,
        public text:string='',
        public voteCount:number=0
    ){}

    static fromJson(data:any){
        return new Option(data.id,data.text,data.voteCount);
    }
}