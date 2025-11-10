import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hotel-hb-encuestas';

abrirWhatsApp(): void {
  const numeroEmpresa = '5212713977168';
  const mensaje = `Hola, Me gustaría platicar con alguien de su equipo para resolver unas dudas.`;

  const mensajeCodificado = encodeURIComponent(mensaje);
  const urlWhatsApp = `https://wa.me/${numeroEmpresa}?text=${mensajeCodificado}`;
  
  window.open(urlWhatsApp, '_blank');
}
}