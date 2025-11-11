import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
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
  deviceId?: string;
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
  deviceId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {
  private db: any;
  private respuestasCancelacion: RespuestaCancelacion[] = [];
  private respuestasSeguimiento: RespuestaSeguimiento[] = [];

  constructor() {
    const app = initializeApp(environment.firebase);
    this.db = getFirestore(app);
  }

  // Obtener ID único del dispositivo
  private obtenerIDDispositivo(): string {
    let deviceId = localStorage.getItem('hb_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('hb_device_id', deviceId);
    }
    return deviceId;
  }

  // Verificar si el dispositivo ya respondió cancelación (Firebase)
  async yaRespondoCancelacion(): Promise<boolean> {
    try {
      const deviceId = this.obtenerIDDispositivo();
      const querySnapshot = await getDocs(collection(this.db, 'bloqueosCancelacion'));
      
      let bloqueado = false;
      querySnapshot.forEach((doc) => {
        if (doc.data()['deviceId'] === deviceId) {
          bloqueado = true;
        }
      });
      
      return bloqueado;
    } catch (error) {
      console.error('Error al verificar bloqueo:', error);
      return false;
    }
  }

  // Verificar si el dispositivo ya respondió seguimiento (Firebase)
  async yaRespondioSeguimiento(): Promise<boolean> {
    try {
      const deviceId = this.obtenerIDDispositivo();
      const querySnapshot = await getDocs(collection(this.db, 'bloqueosSeguimiento'));
      
      let bloqueado = false;
      querySnapshot.forEach((doc) => {
        if (doc.data()['deviceId'] === deviceId) {
          bloqueado = true;
        }
      });
      
      return bloqueado;
    } catch (error) {
      console.error('Error al verificar bloqueo:', error);
      return false;
    }
  }

  // Marcar dispositivo como que ya respondió cancelación (Firebase)
  private async marcarCancelacionRespondida(): Promise<void> {
    try {
      const deviceId = this.obtenerIDDispositivo();
      await addDoc(collection(this.db, 'bloqueosCancelacion'), {
        deviceId: deviceId,
        fecha: Timestamp.now(),
        navegador: navigator.userAgent
      });
    } catch (error) {
      console.error('Error al marcar bloqueo:', error);
    }
  }

  // Marcar dispositivo como que ya respondió seguimiento (Firebase)
  private async marcarSeguimientoRespondido(): Promise<void> {
    try {
      const deviceId = this.obtenerIDDispositivo();
      await addDoc(collection(this.db, 'bloqueosSeguimiento'), {
        deviceId: deviceId,
        fecha: Timestamp.now(),
        navegador: navigator.userAgent
      });
    } catch (error) {
      console.error('Error al marcar bloqueo:', error);
    }
  }

  // Guardar respuesta de cancelación en Firebase
  async guardarRespuestaCancelacion(respuesta: Omit<RespuestaCancelacion, 'id' | 'fecha'>): Promise<void> {
    try {
      const datosLimpios: any = {
        propuestaAjustada: respuesta.propuestaAjustada,
        atencionCumplio: respuesta.atencionCumplio,
        encontroAlternativa: respuesta.encontroAlternativa,
        motivoPrincipal: respuesta.motivoPrincipal,
        fecha: Timestamp.now(),
        deviceId: this.obtenerIDDispositivo()
      };

      if (respuesta.nombreCliente && respuesta.nombreCliente.trim()) {
        datosLimpios.nombreCliente = respuesta.nombreCliente.trim();
      }

      if (respuesta.telefonoCliente && respuesta.telefonoCliente.trim()) {
        datosLimpios.telefonoCliente = respuesta.telefonoCliente.trim();
      }

      const docRef = await addDoc(collection(this.db, 'respuestasCancelacion'), datosLimpios);
      console.log('Respuesta guardada con ID:', docRef.id);
      await this.marcarCancelacionRespondida();
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      throw error;
    }
  }

  // Guardar respuesta de seguimiento en Firebase
  async guardarRespuestaSeguimiento(respuesta: Omit<RespuestaSeguimiento, 'id' | 'fecha'>): Promise<void> {
    try {
      const datosLimpios: any = {
        aspectoDetiene: respuesta.aspectoDetiene,
        ajustarPropuesta: respuesta.ajustarPropuesta,
        atencionEquipo: respuesta.atencionEquipo,
        visitaLlamada: respuesta.visitaLlamada,
        contacto24h: respuesta.contacto24h,
        fecha: Timestamp.now(),
        deviceId: this.obtenerIDDispositivo()
      };

      if (respuesta.nombreCliente && respuesta.nombreCliente.trim()) {
        datosLimpios.nombreCliente = respuesta.nombreCliente.trim();
      }

      if (respuesta.telefonoCliente && respuesta.telefonoCliente.trim()) {
        datosLimpios.telefonoCliente = respuesta.telefonoCliente.trim();
      }

      const docRef = await addDoc(collection(this.db, 'respuestasSeguimiento'), datosLimpios);
      console.log('Respuesta guardada con ID:', docRef.id);
      await this.marcarSeguimientoRespondido();
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      throw error;
    }
  }

  // Obtener todas las respuestas de cancelación desde Firebase
  private async cargarRespuestasCancelacion(): Promise<void> {
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
          telefonoCliente: data['telefonoCliente'],
          deviceId: data['deviceId']
        });
      });
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
    }
  }

  // Obtener todas las respuestas de seguimiento desde Firebase
  private async cargarRespuestasSeguimiento(): Promise<void> {
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
          telefonoCliente: data['telefonoCliente'],
          deviceId: data['deviceId']
        });
      });
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
    }
  }

  async obtenerEstadisticas() {
    await this.cargarRespuestasCancelacion();
    await this.cargarRespuestasSeguimiento();

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

  // ELIMINAR TODAS LAS RESPUESTAS DE FIREBASE
  async eliminarTodasLasRespuestas(): Promise<void> {
    try {
      const deletePromises: Promise<void>[] = [];
      
      const cancelacionSnapshot = await getDocs(collection(this.db, 'respuestasCancelacion'));
      cancelacionSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      const seguimientoSnapshot = await getDocs(collection(this.db, 'respuestasSeguimiento'));
      seguimientoSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);
      console.log('Todas las respuestas eliminadas de Firebase');
    } catch (error) {
      console.error('Error al eliminar respuestas:', error);
      throw error;
    }
  }

  // ELIMINAR TODOS LOS BLOQUEOS
  async eliminarTodosLosBloqueos(): Promise<void> {
    try {
      const deletePromises: Promise<void>[] = [];
      
      const cancelacionSnapshot = await getDocs(collection(this.db, 'bloqueosCancelacion'));
      cancelacionSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      const seguimientoSnapshot = await getDocs(collection(this.db, 'bloqueosSeguimiento'));
      seguimientoSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);
      console.log('Todos los bloqueos eliminados');
    } catch (error) {
      console.error('Error al eliminar bloqueos:', error);
      throw error;
    }
  }

  // Obtener respuestas por fecha
  async obtenerRespuestasCancelacionPorFecha(fechaInicio: Date, fechaFin: Date): Promise<RespuestaCancelacion[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'respuestasCancelacion'));
      const respuestas: RespuestaCancelacion[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fecha = data['fecha'].toDate();
        
        if (fecha >= fechaInicio && fecha <= fechaFin) {
          respuestas.push({
            id: doc.id,
            fecha: fecha,
            propuestaAjustada: data['propuestaAjustada'],
            atencionCumplio: data['atencionCumplio'],
            encontroAlternativa: data['encontroAlternativa'],
            motivoPrincipal: data['motivoPrincipal'],
            nombreCliente: data['nombreCliente'],
            telefonoCliente: data['telefonoCliente'],
            deviceId: data['deviceId']
          });
        }
      });
      
      return respuestas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      return [];
    }
  }

  async obtenerRespuestasSeguimientoPorFecha(fechaInicio: Date, fechaFin: Date): Promise<RespuestaSeguimiento[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, 'respuestasSeguimiento'));
      const respuestas: RespuestaSeguimiento[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fecha = data['fecha'].toDate();
        
        if (fecha >= fechaInicio && fecha <= fechaFin) {
          respuestas.push({
            id: doc.id,
            fecha: fecha,
            aspectoDetiene: data['aspectoDetiene'],
            ajustarPropuesta: data['ajustarPropuesta'],
            atencionEquipo: data['atencionEquipo'],
            visitaLlamada: data['visitaLlamada'],
            contacto24h: data['contacto24h'],
            nombreCliente: data['nombreCliente'],
            telefonoCliente: data['telefonoCliente'],
            deviceId: data['deviceId']
          });
        }
      });
      
      return respuestas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    } catch (error) {
      console.error('Error al obtener respuestas:', error);
      return [];
    }
  }
}