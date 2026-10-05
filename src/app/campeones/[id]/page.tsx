import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChampionById, getPlayableChampions } from "@/lib/champions";
import { CLASS_LABELS } from "@/types/champion";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getPlayableChampions().map((champion) => ({ id: champion.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const champion = getChampionById(id);
  if (!champion) return {};

  return {
    title: `${champion.name}, ${champion.title}`,
    description: `Ficha de ${champion.name}: gama, recurso y más. Compáralo con el campeón del día.`,
    alternates: { canonical: `/campeones/${champion.id}` },
  };
}

export default async function ChampionPage({ params }: Props) {
  const { id } = await params;
  const champion = getChampionById(id);
  if (!champion) notFound();

  // Solo se listan los atributos que tengan valor.
  const attributes: [string, string | undefined][] = [
    ["Género", champion.gender],
    ["Posición", champion.positions?.join(", ")],
    ["Especie", champion.species],
    ["Recurso", champion.resource],
    ["Gama", champion.classes.map((tag) => CLASS_LABELS[tag] ?? tag).join(", ")],
    ["Región", champion.region],
    ["Año de lanzamiento", champion.releaseYear?.toString()],
  ];

  return (
    <>
      <Image
        src={champion.imageUrl}
        alt={`Icono de ${champion.name}`}
        width={96}
        height={96}
      />
      <h1>{champion.name}</h1>
      <p>{champion.title}</p>
      <dl>
        {attributes
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      <p>
        <Link href="/clasico">Juega al reto del día</Link>
      </p>
    </>
  );
}
