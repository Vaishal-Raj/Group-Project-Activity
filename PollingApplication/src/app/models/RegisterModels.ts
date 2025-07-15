export class RegisterRequest{
    constructor(public username:string="",
        public password:string="",
        public role:string="Voter"){}

    static fromForm(data:any){
        return new RegisterRequest(data.username,
            data.password,
            data.role || 'Voter'
        );
    }
}

export class RegisterResponse{
    constructor(public username:string="",public role:string='',public message:string=''){}

    static fromForm(data:any){
        return new RegisterResponse(
            data.username,
            data.role,
            data.message
        );
    }
}



