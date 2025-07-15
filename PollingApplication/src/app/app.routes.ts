import { Routes } from '@angular/router';
import { OauthCallback } from './pages/oauth-callback/oauth-callback';
import { AuthPage } from './components/Auth/auth-page/auth-page';
import { Dashboard } from './components/dashboard/dashboard';
import { AuthGuard, RouteGuard } from './shared/authguard-guard';
import { CreatePoll } from './components/create-poll/create-poll';
import { RegisterModerator } from './components/Auth/super-user/register-moderator/register-moderator';
import { SuperLogin } from './components/Auth/super-user/super-login/super-login';
import { LogOut } from './components/Auth/log-out/log-out';
import { AllPolls } from './components/AllPolls/all-polls/all-polls';
import { MyPolls } from './components/MyPollsComponents/MyPoll/my-polls/my-polls';
import { ProfileComponent } from './components/ProfilePage/ProfileCompononet/profile-component/profile-component';
import { UserComponent } from './components/UserComponents/user-component/user-component';

export const routes: Routes = [
    {path:'oauth-callback',component:OauthCallback},
    {path:'',component:AuthPage},
    {path:'dashboard',component:Dashboard,canActivate:[AuthGuard]},
    {path:'logout',component:LogOut,canActivate:[AuthGuard]},
    {path:'create-poll',component:CreatePoll},
    {path:'register-moderator',component:RegisterModerator,canActivate:[RouteGuard]},
    {path:'super-login',component:SuperLogin},
    {path:'all-polls',component:AllPolls,canActivate:[AuthGuard]},
    {path:'my-polls',component:MyPolls,canActivate:[AuthGuard]},
    {path:'profile',component:ProfileComponent,canActivate:[AuthGuard]},
    {path:'users',component:UserComponent,canActivate:[AuthGuard]}


];
