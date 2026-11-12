import { redirect } from "next/navigation";

/** Los QR imprimibles ahora viven en el lado del comercio. */
export default function AdminQrRedirect() {
  redirect("/comercio/qr");
}
