import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncuestasService, RespuestaCancelacion, RespuestaSeguimiento } from '../../services/encuestas.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  estadisticas: any = null;
  cargando = true;
  
  // Filtros
  filtroSeleccionado = 'todo';
  fechaInicio = '';
  fechaFin = '';
  
  // Datos detallados
  respuestasCancelacion: RespuestaCancelacion[] = [];
  respuestasSeguimiento: RespuestaSeguimiento[] = [];
  
  // Vista
  vistaActual: 'estadisticas' | 'detalle' = 'estadisticas';
  
  // Botón secreto
  clicksEnLogo = 0;
  mostrarBotonEliminar = false;

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

  async aplicarFiltro(): Promise<void> {
    this.cargando = true;
    
    let fechaInicio: Date;
    let fechaFin: Date = new Date();
    fechaFin.setHours(23, 59, 59, 999);

    switch (this.filtroSeleccionado) {
      case 'hoy':
        fechaInicio = new Date();
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'mes':
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        fechaInicio.setHours(0, 0, 0, 0);
        break;
      case 'personalizado':
        if (!this.fechaInicio || !this.fechaFin) {
          alert('Por favor seleccione ambas fechas');
          this.cargando = false;
          return;
        }
        fechaInicio = new Date(this.fechaInicio);
        fechaFin = new Date(this.fechaFin);
        fechaFin.setHours(23, 59, 59, 999);
        break;
      default: // 'todo'
        fechaInicio = new Date(2000, 0, 1);
        break;
    }

    this.respuestasCancelacion = await this.encuestasService.obtenerRespuestasCancelacionPorFecha(fechaInicio, fechaFin);
    this.respuestasSeguimiento = await this.encuestasService.obtenerRespuestasSeguimientoPorFecha(fechaInicio, fechaFin);
    
    this.cargando = false;
  }

  cambiarVista(vista: 'estadisticas' | 'detalle'): void {
    this.vistaActual = vista;
    if (vista === 'detalle') {
      this.aplicarFiltro();
    }
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerClaves(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  async limpiarBloqueos(): Promise<void> {
    if (confirm('⚠️ ¿Desea eliminar TODOS los bloqueos?\n\nEsto permitirá que TODOS los dispositivos puedan volver a responder las encuestas.\n\n¿Está seguro?')) {
      try {
        this.cargando = true;
        await this.encuestasService.eliminarTodosLosBloqueos();
        alert('✅ Todos los bloqueos han sido eliminados.\n\nAhora todos los dispositivos pueden responder de nuevo.');
      } catch (error) {
        alert('❌ Error al eliminar los bloqueos');
        console.error(error);
      } finally {
        this.cargando = false;
      }
    }
  }

  async recargarDatos(): Promise<void> {
    await this.cargarEstadisticas();
    if (this.vistaActual === 'detalle') {
      await this.aplicarFiltro();
    }
    alert('✅ Datos recargados desde Firebase');
  }

  // Función secreta: hacer clic 7 veces en el logo
  clickEnLogo(): void {
    this.clicksEnLogo++;
    if (this.clicksEnLogo >= 7) {
      this.mostrarBotonEliminar = true;
      setTimeout(() => {
        this.mostrarBotonEliminar = false;
        this.clicksEnLogo = 0;
      }, 10000);
    }
  }

  async eliminarTodoFirebase(): Promise<void> {
    const confirmacion1 = confirm('⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEstá a punto de ELIMINAR PERMANENTEMENTE todas las respuestas de Firebase.\n\nEsta acción NO se puede deshacer.\n\n¿Está COMPLETAMENTE seguro?');
    
    if (!confirmacion1) return;

    const confirmacion2 = prompt('Para confirmar, escriba: ELIMINAR TODO');
    
    if (confirmacion2 !== 'ELIMINAR TODO') {
      alert('❌ Operación cancelada');
      return;
    }

    try {
      this.cargando = true;
      await this.encuestasService.eliminarTodasLasRespuestas();
      await this.cargarEstadisticas();
      await this.aplicarFiltro();
      this.mostrarBotonEliminar = false;
      this.clicksEnLogo = 0;
      alert('✅ Todas las respuestas han sido eliminadas de Firebase');
    } catch (error) {
      alert('❌ Error al eliminar los datos');
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  exportarAExcel(): void {
    let csv = 'ENCUESTAS DE CANCELACIÓN\n\n';
    csv += 'Fecha,Propuesta Ajustada,Atención Cumplió,Encontró Alternativa,Motivo,Nombre,Teléfono\n';
    
    this.respuestasCancelacion.forEach(r => {
      csv += `${this.formatearFecha(r.fecha)},${r.propuestaAjustada ? 'Sí' : 'No'},${r.atencionCumplio ? 'Sí' : 'No'},${r.encontroAlternativa ? 'Sí' : 'No'},"${r.motivoPrincipal}","${r.nombreCliente || 'N/A'}","${r.telefonoCliente || 'N/A'}"\n`;
    });
    
    csv += '\n\nENCUESTAS DE SEGUIMIENTO\n\n';
    csv += 'Fecha,Aspecto Detiene,Ajustar Propuesta,Atención,Visita/Llamada,Contacto 24h,Nombre,Teléfono\n';
    
    this.respuestasSeguimiento.forEach(r => {
      csv += `${this.formatearFecha(r.fecha)},"${r.aspectoDetiene}",${r.ajustarPropuesta ? 'Sí' : 'No'},"${r.atencionEquipo}",${r.visitaLlamada ? 'Sí' : 'No'},${r.contacto24h ? 'Sí' : 'No'},"${r.nombreCliente || 'N/A'}","${r.telefonoCliente || 'N/A'}"\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `encuestas-hb-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout(): void {
    this.authService.logout();
  }
}