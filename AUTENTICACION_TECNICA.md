# 🔐 Documentación Técnica: Sistema de Autenticación Mejorado

## 📚 Tabla de Contenidos
1. [Arquitectura](#arquitectura)
2. [Flujo de Datos](#flujo-de-datos)
3. [Interfaces y Tipos](#interfaces-y-tipos)
4. [Métodos del AuthService](#métodos-del-authservice)
5. [Casos de Uso](#casos-de-uso)
6. [Errores y Excepciones](#errores-y-excepciones)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    App Component                        │
│  ngOnInit() → authService.verificarSesion()            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               AuthService (Injectable)                  │
│                                                         │
│  Signals:                                              │
│  • usuarioActual: Signal<Usuario | null>              │
│  • estaAutenticado: Signal<boolean>                    │
│  • error: Signal<string | null>                        │
│  • cargando: Signal<boolean>                           │
│                                                         │
│  Métodos:                                              │
│  • login(username, password): LoginResponse            │
│  • logout(): void                                       │
│  • verificarSesion(): void                             │
│  • tieneRol(rol): boolean                              │
│  • estaAutenticadoYActivo(): boolean                   │
└─────────────────────────────────────────────────────────┘
         ↓                              ↓
    ┌─────────┐                  ┌──────────────┐
    │ Login   │                  │ Public Header│
    │Component│                  │ Component    │
    └─────────┘                  └──────────────┘
         ↓                              ↓
    ┌─────────┐                  ┌──────────────┐
    │Dashboard│                  │ Logout btn   │
    │ /admin  │                  │              │
    └─────────┘                  └──────────────┘
         ↓
    ┌──────────────────────────┐
    │  localStorage: "sesion"  │
    │  {                       │
    │    "id": "1",            │
    │    "username": "admin",  │
    │    "rol": "admin",       │
    │    "timestamp": 12345    │
    │  }                       │
    └──────────────────────────┘
```

---

## Flujo de Datos

### 1️⃣ **Inicialización de la App**

```typescript
// app.ts
ngOnInit(): void {
  // 1. Se ejecuta cuando la app carga
  this.authService.verificarSesion();
  
  // 2. AuthService verifica localStorage
  //    Si existe sesión válida → la restaura
  //    Si no existe → usuario queda sin autenticar
}
```

**Resultado:**
- Usuario logueado previamente no necesita loguear de nuevo ✅
- App mantiene estado aunque se recargue la página ✅

---

### 2️⃣ **Login (Usuario Nuevo)**

```
Usuario abre /login
    ↓
Ingresa credenciales (admin / admin)
    ↓
Click "Iniciar Sesión"
    ↓
Login.login() se ejecuta
    ↓
validarFormulario() → chequea campos
    ↓
authService.login(username, password)
    ↓
AuthService valida contra USUARIOS_VALIDOS[]
    ↓
Si válido:
  - Crea objeto Usuario con timestamp
  - Guarda en signal usuarioActual
  - Guarda en localStorage["sesion"]
  - Retorna LoginResponse { success: true, usuario, rol }
  
Si inválido:
  - Incrementa intentosFallidos
  - Guarda timestamp del intento
  - Retorna LoginResponse { success: false, error: "..." }
    ↓
Login component recibe respuesta
    ↓
Si éxito: redirige según rol
  - Admin → /admin
  - Cliente → /catalogo
  
Si fallo: muestra error
  - Limpia contraseña
  - Mantiene usuario
  - Permite reintentar
```

**Validation Layer:**
```
Input: "  admin  " → trim() → "admin" ✅
Input: "" → error "requerido" ❌
Input: "ad" → válido (min 1 char) ✅
Input: "admin" + "admin" → busca en USUARIOS_VALIDOS ✅
```

---

### 3️⃣ **Protección del Dashboard**

```typescript
// dashboard.ts constructor
constructor() {
  // Check 1: ¿Está autenticado?
  if (!this.authService.estaAutenticadoYActivo()) {
    this.router.navigate(['/login']);
    return; // ← Detiene aquí si no está logueado
  }

  // Check 2: ¿Es admin?
  if (!this.authService.tieneRol('admin')) {
    this.router.navigate(['/catalogo']); // ← Redirige a cliente
    return;
  }

  // Si pasó ambas validaciones → inicializar dashboard
  this.inicializarFormularios();
}
```

**Escenarios:**
| Caso | Resultado |
|------|-----------|
| No autenticado → /admin | Redirige a /login |
| Autenticado como "cliente" → /admin | Redirige a /catalogo |
| Autenticado como "admin" → /admin | Acceso permitido ✅ |

---

### 4️⃣ **Recuperación de Sesión**

```typescript
verificarSesion(): void {
  try {
    // 1. Intenta obtener sesión de localStorage
    const sesionGuardada = localStorage.getItem('sesion');
    
    if (sesionGuardada) {
      // 2. Parsea el JSON
      const usuario = JSON.parse(sesionGuardada) as Usuario;
      
      // 3. Valida la sesión
      if (this.validarSesion(usuario)) {
        // Sesión válida → restaura usuario
        this.usuarioActual.set(usuario);
        this.estaAutenticado.set(true);
        this.logAuditoria('SESION_RECUPERADA', usuario.username);
      } else {
        // Sesión inválida → limpia localStorage
        localStorage.removeItem('sesion');
        this.estaAutenticado.set(false);
      }
    }
  } catch (error) {
    // Error al parsear JSON → limpia todo
    localStorage.removeItem('sesion');
    this.estaAutenticado.set(false);
  }
}

private validarSesion(usuario: Usuario): boolean {
  // Valida que el usuario existe en la BD local
  return this.USUARIOS_VALIDOS.some(u => u.id === usuario.id);
}
```

**Validaciones:**
- ✅ JSON válido en localStorage
- ✅ Estructura correcta de Usuario
- ✅ Usuario existe en USUARIOS_VALIDOS
- ❌ JSON inválido → limpia
- ❌ Usuario no existe → limpia

---

### 5️⃣ **Logout**

```typescript
// public-header.ts
logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}

// auth-service.ts
logout(): void {
  // 1. Log auditoría
  const usuarioActualValue = this.usuarioActual();
  if (usuarioActualValue) {
    this.logAuditoria('LOGOUT', usuarioActualValue.username);
  }

  // 2. Limpia signals
  this.usuarioActual.set(null);
  this.estaAutenticado.set(false);
  this.error.set(null);

  // 3. Limpia localStorage
  localStorage.removeItem('sesion');
}
```

**Resultado:**
- ✅ Sesión eliminada
- ✅ Usuario vuelve a /login
- ✅ Evento registrado en auditoría
- ✅ Próxima vez debe loguear nuevamente

---

## Interfaces y Tipos

### Usuario
```typescript
interface Usuario {
  id: string;           // "1" para admin, "2" para cliente
  username: string;     // "admin" o "cliente"
  email: string;        // "admin@dvmstore.com"
  rol: 'admin' | 'cliente';
  timestamp?: number;   // Date.now() al loguear
}
```

### LoginResponse
```typescript
interface LoginResponse {
  success: boolean;     // true/false
  usuario?: Usuario;    // Definido si success=true
  rol?: string;         // "admin" o "cliente" si success=true
  error?: string;       // Mensaje de error si success=false
}
```

### Usuario Válido (Interno)
```typescript
private USUARIOS_VALIDOS = [
  {
    username: 'admin',
    password: 'admin',
    rol: 'admin' as const,
    email: 'admin@dvmstore.com',
    id: '1'
  },
  {
    username: 'cliente',
    password: 'cliente',
    rol: 'cliente' as const,
    email: 'cliente@dvmstore.com',
    id: '2'
  }
];
```

---

## Métodos del AuthService

### `login(username: string, password: string): LoginResponse`

**Parámetros:**
- `username: string` - Usuario (será trimmed)
- `password: string` - Contraseña

**Retorna:**
```typescript
{
  success: boolean,
  usuario?: Usuario,
  rol?: string,
  error?: string
}
```

**Lógica interna:**
1. Limpia error anterior
2. Valida entrada (no vacío)
3. Verifica control anti-fuerza bruta
4. Busca usuario en USUARIOS_VALIDOS
5. Si existe y coincide contraseña:
   - Reset contador de intentos
   - Crea Usuario con timestamp
   - Guarda en signal + localStorage
   - Log auditoría
   - Retorna success=true
6. Si no coincide:
   - Incrementa contador de intentos
   - Guarda timestamp del intento
   - Log auditoría
   - Retorna success=false

---

### `logout(): void`

**Limpia:**
- Signal usuarioActual
- Signal estaAutenticado
- Signal error
- localStorage["sesion"]

**Registra:**
- Evento de logout en auditoría

---

### `verificarSesion(): void`

**Ejecutada en:**
- App.ngOnInit()

**Intenta:**
1. Obtener localStorage["sesion"]
2. Parsear JSON
3. Validar sesión
4. Si válida → restaurar usuario
5. Si inválida → limpiar localStorage
6. Si error → limpiar localStorage

---

### `tieneRol(rol: 'admin' | 'cliente'): boolean`

**Verifica:**
```typescript
const usuario = this.usuarioActual();
return usuario?.rol === rol;
```

**Casos de uso:**
```typescript
// En templates
@if (authService.tieneRol('admin')) {
  <!-- Mostrar botón admin -->
}

// En componentes
if (this.authService.tieneRol('admin')) {
  // Permitir acceso a dashboard
}
```

---

### `estaAutenticadoYActivo(): boolean`

**Verifica:**
```typescript
return this.estaAutenticado() && 
       this.usuarioActual() !== null;
```

**Casos de uso:**
```typescript
// En constructor (protección)
if (!this.authService.estaAutenticadoYActivo()) {
  this.router.navigate(['/login']);
}

// En templates
@if (authService.estaAutenticadoYActivo()) {
  <span>{{ authService.usuarioActual()?.username }}</span>
}
```

---

## Casos de Uso

### Caso 1: Usuario nuevo logueándose

```
usuario: admin
contraseña: admin

Paso 1: login() valida entrada ✅
Paso 2: Busca en USUARIOS_VALIDOS ✅
Paso 3: Coincide contraseña ✅
Paso 4: Crea Usuario con timestamp ✅
Paso 5: Guarda en localStorage ✅
Paso 6: Signal estaAutenticado = true ✅
Paso 7: Redirige a /admin ✅

Resultado: LOGIN EXITOSO 🎉
```

---

### Caso 2: Contraseña incorrecta

```
usuario: admin
contraseña: incorrecta

Paso 1: login() valida entrada ✅
Paso 2: Busca en USUARIOS_VALIDOS ✅
Paso 3: Contraseña NO coincide ❌
Paso 4: intentosFallidos++ (ahora = 1) 
Paso 5: Guarda timestamp del intento
Paso 6: Retorna error

Resultado: ERROR "Usuario o contraseña incorrectos"
Usuario permanece en /login
Puede reintentar inmediatamente
```

---

### Caso 3: 5 intentos fallidos (Anti-fuerza bruta)

```
Intento 1: FALLA (intentosFallidos = 1)
Intento 2: FALLA (intentosFallidos = 2)
Intento 3: FALLA (intentosFallidos = 3)
Intento 4: FALLA (intentosFallidos = 4)
Intento 5: FALLA (intentosFallidos = 5)

Intento 6: 
  - Verifica: intentosFallidos >= 5 ✓
  - Calcula tiempo transcurrido
  - Si < 30 segundos:
    - Retorna error con tiempo restante
    - "Intenta en 28 segundos"
    - No permite login
  
Espera 30 segundos...

Intento 7:
  - Verifica: tiempo transcurrido >= 30s ✓
  - Reset: intentosFallidos = 0
  - Permite login normalmente
```

---

### Caso 4: Sesión persistente

```
Sesión 1:
  - Usuario logueado: admin
  - localStorage["sesion"] = {...}
  - Navega a /catalogo
  
Usuario presiona F5 (recarga página)
  
App.ngOnInit():
  - Llama verificarSesion()
  - Obtiene localStorage["sesion"]
  - Parsea JSON ✅
  - Valida usuario existe ✅
  - Restaura signals
  
Resultado: Usuario SIGUE logueado 🎉
No necesita loguear de nuevo
```

---

### Caso 5: Cliente intenta acceder a /admin

```
usuario: cliente
contraseña: cliente

Paso 1: Login exitoso
Paso 2: usuarioActual = { rol: 'cliente' }
Paso 3: estaAutenticado = true
Paso 4: Redirige a /catalogo (NO a /admin)

Luego, usuario navega a /admin:
  
Dashboard.constructor():
  1. Verifica estaAutenticadoYActivo() ✅
  2. Verifica tieneRol('admin') ❌
  3. Redirige a /catalogo

Resultado: Acceso denegado
Cliente no puede ver dashboard admin
```

---

## Errores y Excepciones

### Error 1: Usuario o contraseña incorrectos
```
Causa: No coincide en USUARIOS_VALIDOS
Mensaje: "Usuario o contraseña incorrectos"
Acción: Reintentar
Contador: Se incrementa intentosFallidos
```

### Error 2: Demasiados intentos fallidos
```
Causa: intentosFallidos >= 5 && tiempo < 30s
Mensaje: "Demasiados intentos fallidos. Intenta en 28s"
Acción: Esperar 30 segundos
Contador: Se resetea después del timeout
```

### Error 3: Usuario y contraseña requeridos
```
Causa: Campo vacío en validación
Mensaje: "Usuario y contraseña son requeridos"
Acción: Completar campos
Contador: No afecta intentosFallidos
```

### Error 4: JSON inválido en localStorage
```
Causa: localStorage["sesion"] corrupto
Acción: Se limpia localStorage automáticamente
Resultado: Usuario debe loguear nuevamente
```

### Error 5: Usuario en localStorage no existe
```
Causa: Usuario fue eliminado pero sesión persiste
Acción: Se limpia localStorage
Resultado: Usuario debe loguear nuevamente
```

---

## 🔒 Seguridad

### Implementado:
✅ **Anti-fuerza bruta:** 5 intentos + 30s timeout
✅ **Validación de entrada:** trim, minLength checks
✅ **Validación de sesión:** Verifica usuario existe
✅ **Auditoría:** Registra todos los eventos
✅ **Limpieza segura:** localStorage se limpia correctamente
✅ **Errores genéricos:** No revela info innecesaria

### NO implementado (prodría agregarse):
❌ HTTPS (dev local)
❌ JWT tokens
❌ Password hashing
❌ Rate limiting en servidor
❌ Sesión con expiración tiempo

---

## 📊 Estados del Sistema

```
┌─────────────────────────┬────────────────┬──────────────┐
│ Estado                  │ estaAutenticado│ usuarioActual│
├─────────────────────────┼────────────────┼──────────────┤
│ Inicial (app carga)     │ false          │ null         │
│ Sesión recuperada       │ true           │ Usuario      │
│ Login exitoso           │ true           │ Usuario      │
│ Login fallido           │ false          │ null         │
│ Post-logout             │ false          │ null         │
│ localStorage corrupto   │ false          │ null         │
└─────────────────────────┴────────────────┴──────────────┘
```

---

## 🧪 Testing Manual

### Test 1: Login exitoso
```javascript
// Consola
localStorage.getItem('sesion')  // Debe tener JSON

// Network
No debe haber llamadas HTTP (es local)

// Signals
authService.estaAutenticado()   // true
authService.usuarioActual()     // { id, username, rol, timestamp }
```

### Test 2: Persistencia
```javascript
// Después de loguear
location.reload()              // Recarga página
authService.estaAutenticado()   // Sigue siendo true ✅
```

### Test 3: Anti-fuerza bruta
```javascript
// Intenta 5 veces con contraseña mala
for (let i = 0; i < 5; i++) {
  authService.login('admin', 'wrong')  // Falla
}

// Intento 6
authService.login('admin', 'wrong')    // Error con timeout

// Espera 30s
setTimeout(() => {
  authService.login('admin', 'admin')  // ✅ Funciona
}, 30000)
```

