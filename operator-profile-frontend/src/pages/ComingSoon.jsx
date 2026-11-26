export default function ComingSoon({ title }) {
  return (
    <>
      <div className="page-head">
        <h1>{title}</h1>
        <p>This page is not part of the current task.</p>
      </div>
      <div className="card empty">
        <p>Coming soon.</p>
      </div>
    </>
  );
}
