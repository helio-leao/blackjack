import { useState } from "react";
import BlackJack, { Card, PlayStatus } from "./BlackJack";
import Hand from "./components/Hand";
import Button from "./components/Button";

const INITIAL_BET_FACTOR = 0.1;
const INITIAL_STATUS = "DEAL_TO_BEGIN";

const blackJack = BlackJack.instance;

export default function App() {
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [playerPoints, setPlayerPoints] = useState<number>(0);
  const [dealerPoints, setDealerPoints] = useState<number>(0);
  const [status, setStatus] = useState<string>(INITIAL_STATUS);
  const [credits, setCredits] = useState<number>(blackJack.credits);

  const [bet, setBet] = useState<number>(
    blackJack.credits * INITIAL_BET_FACTOR
  );

  function deal(): void {
    setPlayStatus(blackJack.deal(bet));
  }

  function hit(): void {
    setPlayStatus(blackJack.hit());
  }

  function double(): void {
    setPlayStatus(blackJack.double());
  }

  function stand(): void {
    setPlayStatus(blackJack.stand());
  }

  function setPlayStatus(playStatus: PlayStatus): void {
    setDealerCards(playStatus.dealerCards);
    setDealerPoints(playStatus.dealerPoints);
    setPlayerCards(playStatus.playerCards);
    setPlayerPoints(playStatus.playerPoints);
    setCredits(playStatus.credits);
    setStatus(playStatus.status);
  }

  return (
    <>
      {/* Title */}
      <h1 style={{ margin: "20px 0", color: "yellow" }}>BLACKJACK</h1>

      {/* Status */}
      <div style={{ textAlign: "center" }}>
        <h2>Credits: {credits}</h2>
        <h2 style={{ color: "yellow" }}>{status}</h2>
      </div>

      {/* Controls */}
      <div style={{ marginTop: "40px", display: "flex", gap: "5px" }}>
        <Button
          disabled={status !== BlackJack.Status.DEAL}
          onClick={double}
          text="Double"
        />
        <Button
          disabled={
            status === BlackJack.Status.HIT || status === BlackJack.Status.DEAL
          }
          onClick={deal}
          text="Deal"
        />
        <Button
          disabled={
            status !== BlackJack.Status.HIT && status !== BlackJack.Status.DEAL
          }
          onClick={hit}
          text="Hit"
        />
        <Button
          disabled={
            status !== BlackJack.Status.HIT && status !== BlackJack.Status.DEAL
          }
          onClick={stand}
          text="Stand"
        />
        <input
          type="number"
          value={bet}
          disabled={
            status === BlackJack.Status.HIT || status === BlackJack.Status.DEAL
          }
          onChange={(e) => setBet(Number(e.target.value))}
        />
      </div>

      {/* Player's Hand */}
      {playerCards.length > 0 && (
        <Hand title={`Player's Hand (${playerPoints})`} cards={playerCards} />
      )}

      {/* Dealer's Hand */}
      {dealerCards.length > 0 && (
        <Hand title={`Dealer's Hand (${dealerPoints})`} cards={dealerCards} />
      )}
    </>
  );
}
