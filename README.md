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
3. Configura `STORE_NOTIFICATION_EMAIL` con el correo que recibirá avisos internos de pedidos.
4. Reinicia el servidor. Para Wompi, los correos al cliente y a la tienda se envían únicamente cuando el webhook confirma que el pago fue aprobado; no se envía recibo antes del pago. Para pedidos por WhatsApp se envía un aviso al crear el pedido, indicando que el pago queda pendiente de coordinación.

Las notificaciones tienen claves de deduplicación en `email_notifications`, por lo que reintentos de Wompi no deberían enviar dos veces el mismo correo. Ejecuta el SQL actualizado de `supabase/schema.sql` para crear esa tabla.

Para compras pagadas con Wompi, configura en el panel de Wompi el webhook HTTPS `https://tu-dominio.com/api/wompi/eventos`; sin ese webhook no llegará el correo de confirmación del pago. Si no llegan ambos correos, revisa en el proveedor de despliegue que `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `STORE_NOTIFICATION_EMAIL` y `NEXT_PUBLIC_SITE_URL` estén definidos para producción, y consulta los registros de entrega del webhook en Wompi y los registros del servidor. `STORE_NOTIFICATION_EMAIL` es obligatorio para enviar el aviso de venta a la tienda.

Configura también `NEXT_PUBLIC_SITE_URL` con el origen público del sitio (por ejemplo, `https://naya.com.co`) para convertir las rutas de imágenes de Supabase en URLs públicas incluidas en los correos.

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
