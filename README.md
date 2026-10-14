# NAYA

## Preparar Supabase

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta `supabase/schema.sql`. El script crea las tablas, permisos, funciones y carga los 10 productos actuales.
3. Copia la URL del proyecto y la clave pública `anon` desde **Project Settings > API**. Configura `.env.local` según `.env.example`.

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor. Nunca la publiques ni la declares con prefijo `NEXT_PUBLIC_`. `.env.local` está excluido de Git.

4. Configura las credenciales Wompi del mismo ambiente: llave `pub_test_`, secreto `test_integrity_` y secreto de eventos `test_events_` para pruebas; usa las equivalentes `prod_` para producción.
5. En Wompi configura el webhook HTTPS `https://tu-dominio.com/api/wompi/eventos` para cada ambiente.
6. Reinicia el servidor con `npm run dev`.

## Correos Transaccionales (Resend)

1. Crea una cuenta en Resend y verifica el dominio desde el que enviarás correos. El campo `RESEND_FROM_EMAIL` debe usar ese dominio verificado, por ejemplo `NAYA <pedidos@tudominio.com>`.
2. Crea una API key en Resend y guárdala como `RESEND_API_KEY` en `.env.local`. No uses el prefijo `NEXT_PUBLIC_` ni compartas esa clave.
3. Configura `STORE_NOTIFICATION_EMAIL` con el correo que recibirá avisos internos de pedidos. Es opcional; los correos al comprador se envían a la dirección del checkout.
4. Reinicia el servidor. Se envía un recibo cuando se crea la orden y una confirmación cuando Wompi aprueba el pago. Para pedidos por WhatsApp el correo indica que el pago queda pendiente de coordinación.

Las notificaciones tienen claves de deduplicación en `email_notifications`, por lo que reintentos de Wompi no deberían enviar dos veces el mismo correo. Ejecuta el SQL actualizado de `supabase/schema.sql` para crear esa tabla.

## Panel Administrativo

1. En Supabase abre **Authentication > Users** e invita o crea la cuenta administrativa con correo y contraseña. No habilites el registro público.
2. Copia el UUID de esa cuenta y autorízala desde **SQL Editor**:

```sql
insert into public.admin_users (user_id)
values ('UUID_DEL_USUARIO')
on conflict (user_id) do update set enabled = true;
```

3. Inicia sesión en `http://localhost:3000/admin`.

En **Productos** puedes crear, editar y activar/desactivar productos. En **Pedidos** puedes consultar los datos del cliente y cambiar el estado operativo. El estado de pago solo lo actualiza el webhook validado de Wompi. Desactiva productos en vez de borrarlos para conservar el historial de ventas.

El acceso administrativo se valida con Supabase Auth y RLS. Las órdenes no son legibles desde cuentas públicas.

## Datos

- `products`: catálogo activo y precios.
- `orders`: cliente, envío, importes calculados por el servidor, estado y medio de pago.
- `order_items`: nombres y precios congelados al momento de comprar.

El carrito previo al checkout vive en el navegador. Al enviar el checkout, la orden se guarda en Supabase antes de ir a Wompi o WhatsApp. Los archivos de imagen siguen en `public/naya_foto`; Supabase guarda su ruta en cada producto.

## Desarrollo

```bash
npm run dev
```
