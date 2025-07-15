export class LoginRequest{
    constructor(public username:string="",public password:string=""){}
}

export class LoginResponse{
    constructor(public username:string="",public token:string="",public refreshToken:string=""){}
}
