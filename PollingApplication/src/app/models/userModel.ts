
export class UserModel{
    constructor(
        public username: string,
        public role: string,
        public imageurl:string | null
    ){}

    static fromJson(data:any){
        return new UserModel(
            data.username,
            data.role,
            data.imageUrl || ''
        )
    }
}