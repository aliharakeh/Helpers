import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SystemsComponent} from './systems/systems.component';
import {ProjectsComponent} from './projects/projects.component';
import {TasksComponent} from './tasks/tasks.component';
import {LoginComponent} from './login/login.component';
import {AuthenticationGuard} from './authentication/authentication.guard';
import {DiscussionsComponent} from './discussions/discussions.component';
import {NewTopicComponent} from './discussions/new-topic/new-topic.component';
import {TopicCommentsComponent} from './discussions/topic-comments/topic-comments.component';
import {ProfileComponent} from './profile/profile.component';
import {UsersComponent} from './users/users.component';
import {UserComponent} from './users/user/user.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthenticationGuard],
    children: [
      {path: 'systems', component: SystemsComponent},
      {path: 'projects/:id', component: ProjectsComponent}, // system id
      {path: 'tasks/:id', component: TasksComponent}, // project id or -1 for all (admin only)
      {path: 'discussions', component: DiscussionsComponent},
      {path: 'comments/:id', component: TopicCommentsComponent}, // topic id
      {path: 'newTopic', component: NewTopicComponent},
      {path: 'users', component: UsersComponent},
      {path: 'user', component: UserComponent},
      {path: 'profile', component: ProfileComponent},
    ]
  },
  {
    path: '**', redirectTo: '', pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
