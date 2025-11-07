import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CuestionarioCancelacionComponent } from './components/cuestionario-cancelacion/cuestionario-cancelacion.component';
import { CuestionarioSeguimientoComponent } from './components/cuestionario-seguimiento/cuestionario-seguimiento.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { GraciasComponent } from './components/gracias/gracias.component';

export const routes: Routes = [
  { path: '', redirectTo: '/cancelacion', pathMatch: 'full' },
  { path: 'admin-login', component: LoginComponent },
  { path: 'cancelacion', component: CuestionarioCancelacionComponent },
  { path: 'seguimiento', component: CuestionarioSeguimientoComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'gracias', component: GraciasComponent }
];