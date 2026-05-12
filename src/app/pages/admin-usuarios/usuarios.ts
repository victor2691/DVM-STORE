import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsuariosService } from '../../core/services/usuarios-service';
import { UsuarioRecord } from '../../core/models/model_usuario';

type FiltroRol = 'todos' | UsuarioRecord['rol'];

@Component({
  selector: 'app-admin-usuarios',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsuariosPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  protected readonly editandoId = signal<string | null>(null);
  protected readonly mostrarFormulario = signal(false);
  protected readonly filtroRol = signal<FiltroRol>('todos');

  protected readonly formulario = this.formBuilder.nonNullable.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['cliente' as UsuarioRecord['rol'], [Validators.required]],
    activo: [true],
  });

  protected readonly cargando = this.usuariosService.cargando;
  protected readonly error = this.usuariosService.error;
  protected readonly usuarios = computed(() =>
    this.usuariosService
      .usuarios()
      .sort((usuarioA, usuarioB) => usuarioA.nombreCompleto.localeCompare(usuarioB.nombreCompleto))
  );

  protected readonly usuariosFiltrados = computed(() => {
    const filtroRol = this.filtroRol();
    const usuarios = this.usuarios();

    if (filtroRol === 'todos') {
      return usuarios;
    }

    return usuarios.filter((usuario) => usuario.rol === filtroRol);
  });

  protected readonly resumen = computed(() => {
    const usuarios = this.usuarios();

    return {
      total: usuarios.length,
      clientes: usuarios.filter((usuario) => usuario.rol === 'cliente').length,
      admins: usuarios.filter((usuario) => usuario.rol === 'admin').length,
      inactivos: usuarios.filter((usuario) => !usuario.activo).length,
    };
  });

  constructor() {
    this.usuariosService.getUsuarios({ sort: 'nombreCompleto', order: 'asc' });
  }

  protected abrirFormularioNuevo(): void {
    this.limpiarFormulario();
    this.mostrarFormulario.set(true);
  }

  protected cancelar(): void {
    this.limpiarFormulario();
  }

  protected editar(usuario: UsuarioRecord): void {
    this.formulario.reset({
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      password: usuario.password,
      rol: usuario.rol,
      activo: usuario.activo,
    });
    this.editandoId.set(usuario.id);
    this.mostrarFormulario.set(true);
  }

  protected async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const editandoId = this.editandoId();
    const datos = this.formulario.getRawValue();
    const payload = {
      nombreCompleto: datos.nombreCompleto.trim(),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      rol: datos.rol,
      activo: datos.activo,
    };

    try {
      if (editandoId) {
        await this.usuariosService.actualizarUsuario(editandoId, payload);
      } else {
        await this.usuariosService.crearUsuario(payload);
      }

      this.limpiarFormulario();
    } catch {
      console.error('Error al guardar usuario');
    }
  }

  protected async eliminar(usuario: UsuarioRecord): Promise<void> {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar a ${usuario.nombreCompleto}?`);

    if (!confirmar) {
      return;
    }

    try {
      await this.usuariosService.eliminarUsuario(usuario.id);
    } catch {
      console.error('Error al eliminar usuario');
    }
  }

  protected claseEstado(usuario: UsuarioRecord): string {
    return usuario.activo ? 'estado-chip estado-chip--activo' : 'estado-chip estado-chip--inactivo';
  }

  protected estadoUsuario(usuario: UsuarioRecord): string {
    return usuario.activo ? 'Activo' : 'Inactivo';
  }

  protected cambiarFiltro(filtro: FiltroRol): void {
    this.filtroRol.set(filtro);
  }

  private limpiarFormulario(): void {
    this.formulario.reset({
      nombreCompleto: '',
      email: '',
      password: '',
      rol: 'cliente',
      activo: true,
    });
    this.editandoId.set(null);
    this.mostrarFormulario.set(false);
  }
}