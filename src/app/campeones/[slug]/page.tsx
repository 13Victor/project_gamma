import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChampionBySlug, getPlayableChampions } from "@/lib/champions";
import { CLASS_LABELS } from "@/types/champion";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPlayableChampions().map((champion) => ({ slug: champion.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const champion = getChampionBySlug(slug);
  if (!champion) return {};

  return {
    title: `${champion.name}, ${champion.title}`,
    description: `Ficha de ${champion.name}: género, posición, especie, recurso, gama, región y año de lanzamiento. Compáralo con el campeón del día.`,
    alternates: { canonical: `/campeones/${champion.slug}` },
  };
}

export default async function ChampionPage({ params }: Props) {
  const { slug } = await params;
  const champion = getChampionBySlug(slug);
  if (!champion) notFound();

  const attributes: [string, string][] = [
    ["Género", champion.gender],
    ["Posición", champion.positions.join(", ")],
    ["Especie", champion.species],
    ["Recurso", champion.resource],
    [
      "Gama",
      champion.classes.map((tag) => CLASS_LABELS[tag] ?? tag).join(", "),
    ],
    ["Región", champion.region],
    ["Año de lanzamiento", String(champion.releaseYear)],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="flex items-center gap-4">
        <Image
          src={champion.imageUrl}
          alt={`Icono de ${champion.name}`}
          width={96}
          height={96}
          className="rounded-lg"
          priority
        />
        <div>
          <h1 className="text-2xl font-semibold">{champion.name}</h1>
          <p className="text-foreground/70 capitalize">{champion.title}</p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        {attributes.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-8">
        <Link href="/clasico" className="font-medium underline">
          ¿Es {champion.name} el campeón de hoy? Juega al reto del día
        </Link>
      </p>
    </div>
  );
}
