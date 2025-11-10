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
  cargando = true;

  constructor(
    private authService: AuthService,
    private encuestasService: EncuestasService,
    private router: Router
  ) {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/admin-login']);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.cargarEstadisticas();
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      this.cargando = true;
      this.estadisticas = await this.encuestasService.obtenerEstadisticas();
      console.log('Estadísticas cargadas:', this.estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar las estadísticas. Revise la consola.');
    } finally {
      this.cargando = false;
    }
  }

  obtenerClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  limpiarTodosLosDatos(): void {
    if (confirm('⚠️ NOTA: Esta función solo limpia los bloqueos locales de este dispositivo.\n\nPara ver todas las respuestas en Firebase, simplemente recargue la página.\n\n¿Desea limpiar los bloqueos locales para poder responder de nuevo desde este dispositivo?')) {
      localStorage.removeItem('usuario_respondio_cancelacion');
      localStorage.removeItem('usuario_respondio_seguimiento');
      
      alert('✅ Bloqueos locales eliminados.\n\nAhora puede responder los cuestionarios de nuevo desde este dispositivo.');
    }
  }

  async recargarDatos(): Promise<void> {
    await this.cargarEstadisticas();
    alert('✅ Datos recargados desde Firebase');
  }

  logout(): void {
    this.authService.logout();
  }
}