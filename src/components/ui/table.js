export function Table({ children }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "16px"
      }}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return <thead style={{ backgroundColor: "#f5f5f5" }}>{children}</thead>;
}

export function TableRow({ children }) {
  return <tr style={{ borderBottom: "1px solid #ccc" }}>{children}</tr>;
}

export function TableHead({ children }) {
  return <th style={{ padding: "8px", textAlign: "left" }}>{children}</th>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableCell({ children }) {
  return <td style={{ padding: "8px" }}>{children}</td>;
}
