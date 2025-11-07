import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncuestasService } from '../../services/encuestas.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  estadisticas: any = null;

  constructor(
    private authService: AuthService,
    private encuestasService: EncuestasService,
    private router: Router
  ) {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/admin-login']);
    }
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

async cargarEstadisticas(): Promise<void> {
  this.estadisticas = await this.encuestasService.obtenerEstadisticas();
}

  obtenerClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

limpiarTodosLosDatos(): void {
  if (confirm('⚠️ NOTA: Esta función solo limpia los bloqueos locales.\n\nPara borrar las respuestas de Firebase, debe hacerlo manualmente desde la consola de Firebase.\n\n¿Desea limpiar los bloqueos locales?')) {
    localStorage.removeItem('usuario_respondio_cancelacion');
    localStorage.removeItem('usuario_respondio_seguimiento');
    
    alert('✅ Bloqueos locales eliminados.\n\nPara borrar datos de Firebase, vaya a:\nhttps://console.firebase.google.com');
    
    this.cargarEstadisticas();
  }
}

  logout(): void {
    this.authService.logout();
  }
}