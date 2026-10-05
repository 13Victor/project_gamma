import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <>
      <h1>{SITE_NAME}</h1>
      <p>{SITE_DESCRIPTION}</p>
      <ul>
        <li>
          <Link href="/clasico">Modo Clásico</Link>
        </li>
        <li>
          <Link href="/como-jugar">Cómo jugar</Link>
        </li>
      </ul>
    </>
  );
}
