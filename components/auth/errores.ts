import { es } from "@/lib/i18n/es";

/** Traduce los errores de Supabase Auth a mensajes para el usuario. */
export function mensajeDeError(error: { code?: string; message?: string } | null | undefined): string {
  switch (error?.code) {
    case "invalid_credentials":
      return es.auth.credencialesInvalidas;
    case "email_not_confirmed":
      return es.auth.correoSinConfirmar;
    case "anonymous_provider_disabled":
      return es.auth.invitadoDesactivado;
    case "weak_password":
      return es.auth.contrasenaCorta;
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
      return es.auth.enlaceInvalido;
    case "email_exists":
    case "user_already_exists":
      return "Ese correo ya tiene cuenta. Inicia sesión o recupera tu contraseña.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
    default:
      return es.auth.errorGenerico;
  }
}
