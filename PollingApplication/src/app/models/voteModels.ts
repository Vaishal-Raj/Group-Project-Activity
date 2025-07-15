export class VoteDto{
    constructor(public pollId:number=0,
        public OptionId:number=0
    ){}

    static fromJson(pollId:number,optionId:number){
        return new VoteDto(pollId,optionId)
    }
}