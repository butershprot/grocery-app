export function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: "blue", color: "white", padding: "8px 12px", borderRadius: "4px" }}
    >
      {children}
    </button>
  );
}

