import { NgModule } from '@angular/core';
import { FormularioInicioSesionComponent } from '../../shared/components/formulario-inicio-sesion/formulario-inicio-sesion';
import { PanelBienvenidaLoginComponent } from '../../shared/components/panel-bienvenida-login/panel-bienvenida-login';

@NgModule({
  imports: [PanelBienvenidaLoginComponent, FormularioInicioSesionComponent],
  exports: [PanelBienvenidaLoginComponent, FormularioInicioSesionComponent],
})
export class LoginVisualModule {}
