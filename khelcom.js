// Fonction Netlify : la clé Claude reste côté serveur (variable ANTHROPIC_API_KEY)
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" };
  try {
    const { messages = [], catalog = [], shop = "la boutique", cur = "FCFA" } = JSON.parse(event.body || "{}");
    const system = `Tu es Khelcom, l’assistant IA de ${shop}, boutique de matériel électronique.
Tu comprends et parles le wolof et le français : réponds dans la langue du client (wolof si le client écrit en wolof, français sinon). Sois court, chaleureux, précis.
Réponds UNIQUEMENT à partir de ce catalogue (prix en ${cur}). Si un produit n’y figure pas ou si le stock est 0, dis-le sans inventer.
Moyens de paiement : Wave, Orange Money, carte bancaire.
Catalogue : ${JSON.stringify(catalog)}`;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-5-5", max_tokens: 500, system, messages: messages.slice(-12) })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(j));
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ reply: j.content.map(c => c.text || "").join("") }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "erreur" }) };
  }
};
