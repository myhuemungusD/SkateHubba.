import { redirect } from "next/navigation";

export default function LegacySkatePage({ params }: { params: { gameId: string } }) {
  redirect(`/game/${params.gameId}`);
}
