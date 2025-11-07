import { Injectable } from '@angular/core';

export interface RespuestaCancelacion {
  id: string;
  fecha: Date;
  propuestaAjustada: boolean;
  atencionCumplio: boolean;
  encontroAlternativa: boolean;
  motivoPrincipal: string;
  nombreCliente?: string;
  telefonoCliente?: string;
}

export interface RespuestaSeguimiento {
  id: string;
  fecha: Date;
  aspectoDetiene: string;
  ajustarPropuesta: boolean;
  atencionEquipo: string;
  visitaLlamada: boolean;
  contacto24h: boolean;
  nombreCliente?: string;
  telefonoCliente?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {
  private respuestasCancelacion: RespuestaCancelacion[] = [];
  private respuestasSeguimiento: RespuestaSeguimiento[] = [];

  constructor() {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const cancelacion = localStorage.getItem('respuestasCancelacion');
    const seguimiento = localStorage.getItem('respuestasSeguimiento');
    
    if (cancelacion) {
      this.respuestasCancelacion = JSON.parse(cancelacion);
    }
    if (seguimiento) {
      this.respuestasSeguimiento = JSON.parse(seguimiento);
    }
  }

  yaRespondoCancelacion(): boolean {
    return localStorage.getItem('usuario_respondio_cancelacion') === 'true';
  }

  yaRespondioSeguimiento(): boolean {
    return localStorage.getItem('usuario_respondio_seguimiento') === 'true';
  }

  marcarCancelacionRespondida(): void {
    localStorage.setItem('usuario_respondio_cancelacion', 'true');
  }

  marcarSeguimientoRespondido(): void {
    localStorage.setItem('usuario_respondio_seguimiento', 'true');
  }

  guardarRespuestaCancelacion(respuesta: Omit<RespuestaCancelacion, 'id' | 'fecha'>): void {
    const nueva: RespuestaCancelacion = {
      id: Date.now().toString(),
      fecha: new Date(),
      ...respuesta
    };
    this.respuestasCancelacion.push(nueva);
    localStorage.setItem('respuestasCancelacion', JSON.stringify(this.respuestasCancelacion));
    this.marcarCancelacionRespondida();
  }

  guardarRespuestaSeguimiento(respuesta: Omit<RespuestaSeguimiento, 'id' | 'fecha'>): void {
    const nueva: RespuestaSeguimiento = {
      id: Date.now().toString(),
      fecha: new Date(),
      ...respuesta
    };
    this.respuestasSeguimiento.push(nueva);
    localStorage.setItem('respuestasSeguimiento', JSON.stringify(this.respuestasSeguimiento));
    this.marcarSeguimientoRespondido();
  }

  obtenerRespuestasCancelacion(): RespuestaCancelacion[] {
    return this.respuestasCancelacion;
  }

  obtenerRespuestasSeguimiento(): RespuestaSeguimiento[] {
    return this.respuestasSeguimiento;
  }

  obtenerEstadisticas() {
    return {
      totalCancelaciones: this.respuestasCancelacion.length,
      totalSeguimientos: this.respuestasSeguimiento.length,
      cancelacion: this.calcularEstadisticasCancelacion(),
      seguimiento: this.calcularEstadisticasSeguimiento()
    };
  }

  private calcularEstadisticasCancelacion() {
    const total = this.respuestasCancelacion.length;
    if (total === 0) return null;

    return {
      propuestaAjustada: this.calcularPorcentaje(this.respuestasCancelacion.filter(r => r.propuestaAjustada).length, total),
      atencionCumplio: this.calcularPorcentaje(this.respuestasCancelacion.filter(r => r.atencionCumplio).length, total),
      encontroAlternativa: this.calcularPorcentaje(this.respuestasCancelacion.filter(r => r.encontroAlternativa).length, total),
      motivosPrincipales: this.contarMotivos()
    };
  }

  private calcularEstadisticasSeguimiento() {
    const total = this.respuestasSeguimiento.length;
    if (total === 0) return null;

    return {
      quierenAjuste: this.calcularPorcentaje(this.respuestasSeguimiento.filter(r => r.ajustarPropuesta).length, total),
      quierenVisita: this.calcularPorcentaje(this.respuestasSeguimiento.filter(r => r.visitaLlamada).length, total),
      quierenContacto24h: this.calcularPorcentaje(this.respuestasSeguimiento.filter(r => r.contacto24h).length, total),
      aspectos: this.contarAspectos(),
      atencion: this.contarAtencion()
    };
  }

  private calcularPorcentaje(cantidad: number, total: number): number {
    return Math.round((cantidad / total) * 100);
  }

  private contarMotivos() {
    const motivos: any = {};
    this.respuestasCancelacion.forEach(r => {
      motivos[r.motivoPrincipal] = (motivos[r.motivoPrincipal] || 0) + 1;
    });
    return motivos;
  }

  private contarAspectos() {
    const aspectos: any = {};
    this.respuestasSeguimiento.forEach(r => {
      aspectos[r.aspectoDetiene] = (aspectos[r.aspectoDetiene] || 0) + 1;
    });
    return aspectos;
  }

  private contarAtencion() {
    const atencion: any = {};
    this.respuestasSeguimiento.forEach(r => {
      atencion[r.atencionEquipo] = (atencion[r.atencionEquipo] || 0) + 1;
    });
    return atencion;
  }
}