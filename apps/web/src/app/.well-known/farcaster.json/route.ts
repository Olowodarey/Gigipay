function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value,
    ),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;

  const manifest = {
    accountAssociation: {
      // These will be added in step 5
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: withValidProperties({
      version: "1",
      name: "GigiPay",
      homeUrl: URL || "https://gigipay.app",
      iconUrl: `${URL}/logo.png`,
      splashImageUrl: `${URL}/logo.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Fast, cheap, inclusive payments",
      description:
        "GigiPay is a Celo-powered payment protocol designed to make on-chain transfers faster, cheaper, and more inclusive. Send funds to multiple wallets in a single transaction or use claim-code payments without needing recipient wallet addresses.",
      screenshotUrls: [
        // Add screenshot URLs when available
      ],
      primaryCategory: "finance",
      tags: ["payments", "celo", "base", "crypto", "web3"],
      heroImageUrl: `${URL}/logo.png`,
      tagline: "Pay anyone, anywhere, instantly",
      ogTitle: "GigiPay - Fast & Inclusive Crypto Payments",
      ogDescription:
        "Send crypto to multiple wallets or generate claim codes for payments without wallet addresses. Built on Celo and Base.",
      ogImageUrl: `${URL}/logo.png`,
      noindex: "true", // Set to "false" when ready for production
    }),
  };

  return Response.json(manifest);
}
