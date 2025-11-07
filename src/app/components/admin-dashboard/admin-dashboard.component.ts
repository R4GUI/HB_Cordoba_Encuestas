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

  cargarEstadisticas(): void {
    this.estadisticas = this.encuestasService.obtenerEstadisticas();
  }

  obtenerClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  limpiarTodosLosDatos(): void {
    if (confirm('⚠️ ¿Está seguro de que desea BORRAR TODOS LOS DATOS?\n\nEsto eliminará:\n- Todas las respuestas de cancelación\n- Todas las respuestas de seguimiento\n- Los bloqueos de cuestionarios\n\nEsta acción NO se puede deshacer.')) {
      // Limpiar localStorage completamente
      localStorage.removeItem('respuestasCancelacion');
      localStorage.removeItem('respuestasSeguimiento');
      localStorage.removeItem('usuario_respondio_cancelacion');
      localStorage.removeItem('usuario_respondio_seguimiento');
      
      alert('✅ Todos los datos han sido eliminados exitosamente.\n\nLos cuestionarios están listos para ser usados de nuevo.');
      
      // Recargar estadísticas
      this.cargarEstadisticas();
      
      // Recargar la página para refrescar todo
      window.location.reload();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}