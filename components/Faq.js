export default function Faq({ faq = [] }) {
  if (!faq.length) return null;

  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">FAQ</p>
        <h2>Questions fréquentes</h2>
      </div>
      <div className="faq-list">
        {faq.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
