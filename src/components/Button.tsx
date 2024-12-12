type ButtonProps = {
  disabled: boolean;
  onClick: () => void;
  text: string;
};

function Button({ disabled, onClick, text }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "10px 20px",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}

export default Button;
