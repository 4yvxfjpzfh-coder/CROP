import { requireFarmer } from "@/lib/farmer-guard";
import { FeriaSheet } from "@/components/feria-sheet";

export const dynamic = "force-dynamic";

export default async function FarmerHojaPage({
  searchParams,
}: {
  searchParams: Promise<{ pickupPointId?: string; date?: string }>;
}) {
  const actor = await requireFarmer("redirect");
  const { pickupPointId, date } = await searchParams;
  return <FeriaSheet pickupPointId={pickupPointId} date={date} farmerId={actor.id} />;
}
