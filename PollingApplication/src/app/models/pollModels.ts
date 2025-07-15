import { Option } from "./optionModel";

export class PollModel{
    constructor(
        public id:number=0,
        public question:string = '',
        public createdByUsername:string='',
        public options :Option[]=[],
        public startTime?:Date,
        public endTime?:Date,
        public createdAt?:Date
    ){}

    static fromJson(data:any){
        return new PollModel(
            data.id,
            data.question,
            data.createdByUsername,
            data?.options?.$values?.map((opt:any)=>Option.fromJson(opt)) || [],
            data.startTime ? new Date(data.startTime) : undefined,
            data.endTime ? new Date(data.endTime) : undefined,
            data.createdAt ? new Date(data.createdAt) : undefined
        )
    }
}