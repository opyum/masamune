import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SiteReadyProps {
  businessName: string;
  siteUrl: string;
  dashboardUrl: string;
}

export default function SiteReady({
  businessName,
  siteUrl,
  dashboardUrl,
}: SiteReadyProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre site {businessName} est en ligne !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Votre site est pret !</Heading>
          <Text style={text}>
            Bonne nouvelle ! Votre site <strong>{businessName}</strong> a ete
            genere avec succes et est desormais en ligne.
          </Text>
          <Section style={card}>
            <Text style={cardLabel}>Adresse de votre site</Text>
            <Link href={siteUrl} style={cardLink}>
              {siteUrl}
            </Link>
          </Section>
          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              Voir mon site
            </Link>
          </Section>
          <Text style={text}>
            Vous pouvez modifier votre site a tout moment depuis votre tableau de
            bord en envoyant un message dans le chat.
          </Text>
          <Text style={footer}>
            &mdash; L&apos;equipe Masamune
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f8fafc",
  fontFamily: "Inter, system-ui, sans-serif",
};

const container = {
  maxWidth: "560px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
};

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "700" as const,
  margin: "0 0 24px",
};

const text = {
  color: "#334155",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const card = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
};

const cardLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "500" as const,
  margin: "0 0 4px",
};

const cardLink = {
  color: "#4f46e5",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#4f46e5",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "32px 0 0",
};
