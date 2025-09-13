import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="brand" routerLink="/">TAW Airlines</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/login">Login</a>
      <a mat-button routerLink="/register">Register</a>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`.toolbar{position:sticky;top:0;z-index:10}.brand{font-weight:700;cursor:pointer}.spacer{flex:1}`]
})
export class AppComponent {}
