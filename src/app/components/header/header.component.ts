import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { LoginUsuario } from 'src/app/model/login-usuario';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLogginFail = false;
  loginUsuario!: LoginUsuario;
  username!: string;
  password!: string;
  roles: string[] = [];
  errMsj!: string;

  isLogged = false;
  display = 'none';

  constructor(private router: Router, private tokenService: TokenService, private authService: AuthService) { }

  ngOnInit(): void {
    if (this.tokenService.getToken()) {
      this.isLogged = true;
    } else {
      this.isLogged = false;
    }

    if (this.tokenService.getToken()) {
      this.isLogged = true;
      this.isLogginFail = false;
      this.roles = this.tokenService.getAuthorities();
    }
  }

  onLogin(): void {
    this.loginUsuario = new LoginUsuario(this.username, this.password);
    this.authService.login(this.loginUsuario).subscribe(data => {
      this.isLogged = true;
      this.isLogginFail = false;
      this.tokenService.setToken(data.token);
      this.tokenService.setUserName(data.nombreUsuario);
      this.tokenService.setAuthorities(data.authorities);
      this.roles = data.authorities;
      this.router.navigate([''])
      window.location.reload();
    }, err => {
      this.isLogged = false;
      this.isLogginFail = true;
      this.errMsj = err.error.mensaje;
    })
  }

  onLogOut(): void {
    this.tokenService.logOut();
    window.location.reload();
  }

  openModalLoggin() {
    this.display = 'block';
    this.clearModalLoggin();
  }

  onCloseModalLoggin() {
    this.display = 'none';
    this.clearModalLoggin();
  }

  clearModalLoggin(): void {
    this.username = '';
    this.password = '';

    document.getElementById('username').classList.remove('is-invalid');
    document.getElementById('password').classList.remove('is-invalid');

    this.isLogginFail = false;
  }
}
