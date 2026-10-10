/** Each route arrives with one short, gentle fade (none under reduced motion). */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-root">{children}</div>;
}
