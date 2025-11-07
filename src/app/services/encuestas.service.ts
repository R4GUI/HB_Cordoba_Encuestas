import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface RespuestaCancelacion {
  id?: string;
  fecha: Date;
  propuestaAjustada: boolean;
  atencionCumplio: boolean;
  encontroAlternativa: boolean;
  motivoPrincipal: string;
  nombreCliente?: string;
  telefonoCliente?: string;
}

export interface RespuestaSeguimiento {
  id?: string;
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
  private db: any;
  private respuestasCancelacion: RespuestaCancelacion[] = [];
  private respuestasSeguimiento: RespuestaSeguimiento[] = [];

  constructor() {
    // Inicializar Firebase
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
    
    // Verificar si ya respondió (localStorage solo para bloqueo local)
    this.cargarBloqueos();
  }

  private cargarBloqueos(): void {
    // Solo para bloquear en el dispositivo actual
  }

  // Verificar si el usuario ya respondió (solo en este dispositivo)
  yaRespondoCancelacion(): boolean {
    return localStorage.getItem('usuario_respondio_cancelacion') === 'true';
  }

  yaRespondioSeguimiento(): boolean {
    return localStorage.getItem('usuario_respondio_seguimiento') === 'true';
  }

  private marcarCancelacionRespondida(): void {
    localStorage.setItem('usuario_respondio_cancelacion', 'true');
  }

  private marcarSeguimientoRespondido(): void {
    localStorage.setItem('usuario_respondio_seguimiento', 'true');
  }

  // Guardar respuesta de cancelación en Firebase
  async guardarRespuestaCancelacion(respuesta: Omit<RespuestaCancelacion, 'id' | 'fecha'>): Promise<void> {
    try {
      const docRef = await addDoc(collection(this.db, 'respuestasCancelacion'), {
        ...respuesta,
        fecha: Timestamp.now()
      });
      console.log('Respuesta guardada con ID:', docRef.id);
      this.marcarCancelacionRespondida();
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      throw error;
    }
  }

  // Guardar respuesta de seguimiento en Firebase
  async guardarRespuestaSeguimiento(respuesta: Omit<RespuestaSeguimiento, 'id' | 'fecha'>): Promise<void> {
    try {
      const docRef = await addDoc(collection(this.db, 'respuestasSeguimiento'), {
        ...respuesta,
        fecha: Timestamp.now()
      });
      console.log('Respuesta guardada con ID:', docRef.id);
      this.marcarSeguimientoRespondido();
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      throw error;
    }
  }

  // Obtener todas las respuestas de cancelación desde Firebase
  async obtenerRespuestasCancelacion(): Promise<RespuestaCancelacion[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'respuestasCancelacion'));
      this.respuestasCancelacion = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        this.respuestasCancelacion.push({
          id: doc.id,
          fecha: data['fecha'].toDate(),
          propuestaAjustada: data['propuestaAjustada'],
          atencionCumplio: data['atencionCumplio'],
          encontroAlternativa: data['encontroAlternativa'],
          motivoPrincipal: data['motivoPrincipal'],
          nombreCliente: data['nombreCliente'],
          telefonoCliente: data['telefonoCliente']
        });
      });
      
      return this.respuestasCancelacion;
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      return [];
    }
  }

  // Obtener todas las respuestas de seguimiento desde Firebase
  async obtenerRespuestasSeguimiento(): Promise<RespuestaSeguimiento[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'respuestasSeguimiento'));
      this.respuestasSeguimiento = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        this.respuestasSeguimiento.push({
          id: doc.id,
          fecha: data['fecha'].toDate(),
          aspectoDetiene: data['aspectoDetiene'],
          ajustarPropuesta: data['ajustarPropuesta'],
          atencionEquipo: data['atencionEquipo'],
          visitaLlamada: data['visitaLlamada'],
          contacto24h: data['contacto24h'],
          nombreCliente: data['nombreCliente'],
          telefonoCliente: data['telefonoCliente']
        });
      });
      
      return this.respuestasSeguimiento;
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      return [];
    }
  }

  async obtenerEstadisticas() {
    await this.obtenerRespuestasCancelacion();
    await this.obtenerRespuestasSeguimiento();

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