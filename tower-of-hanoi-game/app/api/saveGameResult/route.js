import { saveRound, getTopPlayers } from "@/lib/db";

export async function POST(req) {
  try {
    const { playerName, pegsCount, disksCount, movesSequence, elapsedMs } =
      await req.json();
    const result = await saveRound(
      playerName,
      disksCount,
      pegsCount,
      movesSequence,
      elapsedMs
    );

    if (!result.success)
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });

    return new Response(
      JSON.stringify({ success: true, roundId: result.roundId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    const leaderboard = await getTopPlayers(10);
    return new Response(JSON.stringify(leaderboard || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
