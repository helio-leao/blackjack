import { Card } from "../BlackJack";

const IMAGES_PATH = "./src/assets/images/svg_playing_cards/";

type HandProps = {
  cards: Card[];
  title: string;
};

function Hand({ cards, title }: HandProps) {
  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={{ marginBottom: "10px", textAlign: "center" }}>{title}</h2>
      {/* Cards */}
      <div style={{ display: "flex", gap: "10px" }}>
        {cards.map(({ id, imageFileName }) => (
          <img
            key={id}
            src={IMAGES_PATH + imageFileName + ".svg"}
            alt={imageFileName}
            style={{ width: 234 / 1.5, height: 333 / 1.5 }}
          />
        ))}
      </div>
    </div>
  );
}

export default Hand;
